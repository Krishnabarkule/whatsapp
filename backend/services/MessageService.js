const fs = require("fs");
const path = require("path");
const { delay } = require("@whiskeysockets/baileys");

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
		mediaPath = null
	) {
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

		for (let i = 0; i < contacts.length; i++) {
			const queueStatus = this.sendingQueue.get(queueId);

			if (queueStatus.status === "paused") {
				while (this.sendingQueue.get(queueId).status === "paused") {
					await delay(1000);
				}
			}

			if (queueStatus.status === "stopped") {
				break;
			}

			const contact = contacts[i];
			const message = this.processTemplate(template, contact);

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

				const log = {
					timestamp: new Date(),
					phone: contact.phone,
					status: "success",
					message: "Message sent successfully",
				};

				this.deliveryLogs.push(log);
				this.io.emit("message_sent", { queueId, log, progress: queueStatus });

				// Delay between messages (3-5 seconds)
				await delay(Math.random() * 2000 + 3000);
			} catch (error) {
				queueStatus.failed++;

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

		const finalStatus = this.sendingQueue.get(queueId);
		finalStatus.status = "completed";
		this.sendingQueue.set(queueId, finalStatus);
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
