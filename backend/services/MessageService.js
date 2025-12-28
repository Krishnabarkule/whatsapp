const fs = require("fs");
const path = require("path");
const { delay } = require("@whiskeysockets/baileys");
const MessageLog = require("../models/MessageLog");
const User = require("../models/User");

class MessageService {
	constructor(io) {
		this.io = io;
		this.sendingQueue = new Map();
		this.deliveryLogs = [];
	}

	processTemplate(template, data) {
		let message = template;
		Object.keys(data).forEach((key) => {
			const regex = new RegExp(`{{${key}}}`, "g");
			message = message.replace(regex, data[key]);
		});
		return message;
	}

	async sendBulkMessages(
		sessionId,
		session,
		contacts,
		template,
		mediaPath = null,
		user = null
	) {
		console.log("=== sendBulkMessages called ===");
		console.log("User provided:", user ? `Yes (userId: ${user.userId})` : "No");
		console.log("Contacts count:", contacts.length);

		// WhatsApp safety warnings
		if (contacts.length > 40) {
			console.log(
				"\n⚠️⚠️⚠️ WARNING: Sending to more than 40 contacts increases ban risk!"
			);
			console.log(
				"Recommended: Send max 40-50 messages per hour to avoid detection\n"
			);
		}
		if (contacts.length > 100) {
			console.log(
				"\n🚨🚨🚨 HIGH RISK: Sending to more than 100 contacts may trigger WhatsApp ban!"
			);
			console.log(
				`Estimated time: ~${Math.round(
					(contacts.length * 20) / 60
				)} minutes with safety delays\n`
			);
		}

		// Check if there's already an active queue for this session
		for (const [existingQueueId, queue] of this.sendingQueue.entries()) {
			if (
				existingQueueId.startsWith(sessionId + "_") &&
				(queue.status === "running" || queue.status === "paused")
			) {
				console.log("Already have active queue for session:", sessionId);
				throw new Error(
					"A message sending operation is already in progress for this session"
				);
			}
		}

		const queueId = `${sessionId}_${Date.now()}`;

		this.sendingQueue.set(queueId, {
			status: "running",
			total: contacts.length,
			sent: 0,
			failed: 0,
		});

		let mediaBuffer = null;
		let mediaType = null;

		if (mediaPath && fs.existsSync(mediaPath)) {
			mediaBuffer = fs.readFileSync(mediaPath);
			const ext = path.extname(mediaPath).toLowerCase();

			if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
				mediaType = "image";
			} else if ([".mp4", ".avi", ".mov"].includes(ext)) {
				mediaType = "video";
			} else if ([".mp3", ".wav", ".ogg"].includes(ext)) {
				mediaType = "audio";
			}
		}

		let successCount = 0;
		let messagesInCurrentBatch = 0;

		console.log(`Starting loop for ${contacts.length} contacts`);
		console.log(
			"⚠️ Anti-blocking measures active: 15-25s delay between messages, long pauses every 8-12 messages to prevent 401 errors"
		);

		for (let i = 0; i < contacts.length; i++) {
			console.log(
				`Processing contact ${i + 1}/${contacts.length}: ${contacts[i].phone}`
			);

			const queueStatus = this.sendingQueue.get(queueId);

			if (queueStatus.status === "paused") {
				while (this.sendingQueue.get(queueId).status === "paused") {
					await delay(1000);
				}
			}

			if (queueStatus.status === "stopped") {
				console.log("Queue stopped, breaking loop");
				break;
			}

			const contact = contacts[i];
			const message = this.processTemplate(template, contact);

			// Check if user has reached any limit before sending
			if (user) {
				const limitCheck = user.canSendMessages(1);
				if (!limitCheck.allowed) {
					queueStatus.failed++;

					// Determine which limit was exceeded
					let limitType = "";
					if (limitCheck.dailyRemaining <= 0) limitType = "daily";
					else if (limitCheck.monthlyRemaining <= 0) limitType = "monthly";
					else if (limitCheck.yearlyRemaining <= 0) limitType = "yearly";

					// Log failed message due to limit
					await MessageLog.create({
						userId: user.userId,
						sessionId,
						recipientName: contact.name || "",
						recipientPhone: contact.phone,
						message,
						mediaType: mediaType || "none",
						status: "failed",
						error: `Message limit exceeded (${limitType} limit reached)`,
					});

					const log = {
						timestamp: new Date(),
						phone: contact.phone,
						status: "failed",
						message: `Message limit exceeded (${limitType} limit reached)`,
					};

					this.deliveryLogs.push(log);
					this.io.emit("message_failed", {
						queueId,
						log,
						progress: queueStatus,
					});
					this.sendingQueue.set(queueId, queueStatus);
					continue; // Skip to next contact
				}
			}

			try {
				let jid = contact.phone;
				if (!jid.endsWith("@s.whatsapp.net")) {
					jid = `${jid}@s.whatsapp.net`;
				}

				// Check if number exists
				const [result] = await session.socket.onWhatsApp(jid);

				if (!result || !result.exists) {
					throw new Error("Number does not exist on WhatsApp");
				}

				const messageContent = {};

				if (mediaBuffer && mediaType) {
					if (mediaType === "image") {
						messageContent.image = mediaBuffer;
						messageContent.caption = message;
					} else if (mediaType === "video") {
						messageContent.video = mediaBuffer;
						messageContent.caption = message;
					} else if (mediaType === "audio") {
						messageContent.audio = mediaBuffer;
						messageContent.mimetype = "audio/mp4";
					}
				} else {
					messageContent.text = message;
				}

				await session.socket.sendMessage(result.jid, messageContent);

				queueStatus.sent++;
				successCount++;

				// Increment user usage immediately after successful send
				if (user) {
					try {
						await user.incrementUsage(1);
					} catch (error) {
						console.error("Failed to increment user usage:", error);
					}
				}

				// Log to database if user provided
				if (user) {
					await MessageLog.create({
						userId: user.userId,
						sessionId,
						recipientName: contact.name || "",
						recipientPhone: contact.phone,
						message,
						mediaType: mediaType || "none",
						status: "sent",
					});
				}

				const log = {
					timestamp: new Date(),
					phone: contact.phone,
					status: "success",
					message: "Message sent successfully",
				};

				this.deliveryLogs.push(log);
				this.io.emit("message_sent", { queueId, log, progress: queueStatus });

				messagesInCurrentBatch++;

				// Anti-blocking delay: 15-25 seconds between messages (safer for WhatsApp)
				const randomDelay = Math.random() * 10000 + 15000; // 15-25 seconds
				console.log(
					`⏳ Waiting ${Math.round(
						randomDelay / 1000
					)}s before next message (anti-spam protection)`
				);
				await delay(randomDelay);

				// Additional random pause every 8-12 messages to prevent 401 errors
				if (messagesInCurrentBatch >= 8 + Math.floor(Math.random() * 4)) {
					const pauseDuration = Math.random() * 60000 + 60000; // 60-120 seconds
					console.log(
						`\n🛑 Taking a ${Math.round(
							pauseDuration / 1000
						)}s break after ${messagesInCurrentBatch} messages (mimicking human behavior)\n`
					);
					this.io.emit("batch_pause", {
						queueId,
						message: `Taking a short break to avoid detection`,
						duration: Math.round(pauseDuration / 1000),
					});
					await delay(pauseDuration);
					messagesInCurrentBatch = 0;
					console.log("✅ Break completed, resuming sending...\n");
				}
			} catch (error) {
				queueStatus.failed++;

				// Log failed message to database if user provided
				if (user) {
					await MessageLog.create({
						userId: user.userId,
						sessionId,
						recipientName: contact.name || "",
						recipientPhone: contact.phone,
						message,
						mediaType: mediaType || "none",
						status: "failed",
						error: error.message,
					});
				}

				const log = {
					timestamp: new Date(),
					phone: contact.phone,
					status: "failed",
					message: error.message,
				};

				this.deliveryLogs.push(log);
				this.io.emit("message_failed", { queueId, log, progress: queueStatus });
			}

			this.sendingQueue.set(queueId, queueStatus);
		}

		console.log(
			`Loop completed. Processed ${contacts.length} contacts. Success: ${successCount}`
		);

		// Usage is now incremented after each successful message above
		// No need to increment again here

		const finalStatus = this.sendingQueue.get(queueId);
		finalStatus.status = "completed";
		this.sendingQueue.set(queueId, finalStatus);
		console.log("Sending completed event with final status:", finalStatus);
		this.io.emit("sending_completed", { queueId, finalStatus });

		return queueId;
	}

	pauseSending(queueId) {
		const queue = this.sendingQueue.get(queueId);
		if (queue && queue.status === "running") {
			queue.status = "paused";
			this.sendingQueue.set(queueId, queue);
			return true;
		}
		return false;
	}

	resumeSending(queueId) {
		const queue = this.sendingQueue.get(queueId);
		if (queue && queue.status === "paused") {
			queue.status = "running";
			this.sendingQueue.set(queueId, queue);
			return true;
		}
		return false;
	}

	stopSending(queueId) {
		const queue = this.sendingQueue.get(queueId);
		if (queue) {
			queue.status = "stopped";
			this.sendingQueue.set(queueId, queue);
			return true;
		}
		return false;
	}

	getDeliveryLogs(limit = 100) {
		return this.deliveryLogs.slice(-limit).reverse();
	}

	getQueueStatus(queueId) {
		return this.sendingQueue.get(queueId);
	}
}

module.exports = MessageService;
