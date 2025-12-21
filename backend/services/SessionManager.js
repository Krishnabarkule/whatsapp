const makeWASocket = require("@whiskeysockets/baileys").default;
const {
	useMultiFileAuthState,
	DisconnectReason,
	fetchLatestBaileysVersion,
	makeCacheableSignalKeyStore,
	Browsers,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const NodeCache = require("node-cache");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

class SessionManager {
	constructor(io) {
		this.sessions = new Map();
		this.io = io;
		this.msgRetryCounterCache = new NodeCache();
	}

	async createSession(
		sessionId,
		usePairingCode = false,
		phoneNumber = null,
		isReconnecting = false
	) {
		// If reconnecting, remove old session first
		if (isReconnecting && this.sessions.has(sessionId)) {
			console.log(`Removing old session for reconnection: ${sessionId}`);
			this.sessions.delete(sessionId);
		}

		if (this.sessions.has(sessionId)) {
			throw new Error("Session already exists");
		}

		const sessionPath = path.join(__dirname, "..", "..", "sessions", sessionId);

		if (!fs.existsSync(sessionPath)) {
			fs.mkdirSync(sessionPath, { recursive: true });
		}

		const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
		const { version } = await fetchLatestBaileysVersion();

		const sock = makeWASocket({
			version,
			logger: pino({ level: "silent" }),
			printQRInTerminal: false,
			auth: {
				creds: state.creds,
				keys: makeCacheableSignalKeyStore(
					state.keys,
					pino({ level: "silent" })
				),
			},
			browser: Browsers.macOS("WhatsApp Bulk Sender"),
			msgRetryCounterCache: this.msgRetryCounterCache,
			generateHighQualityLinkPreview: true,
			getMessage: async (key) => {
				return { conversation: "" };
			},
		});

		this.setupEventHandlers(
			sock,
			sessionId,
			saveCreds,
			usePairingCode,
			phoneNumber
		);

		const sessionData = {
			socket: sock,
			status: "connecting",
			qr: null,
			pairingCode: null,
		};

		this.sessions.set(sessionId, sessionData);

		return sessionData;
	}

	setupEventHandlers(sock, sessionId, saveCreds, usePairingCode, phoneNumber) {
		sock.ev.on("connection.update", async (update) => {
			const { connection, lastDisconnect, qr } = update;
			const session = this.sessions.get(sessionId);

			if (qr && !usePairingCode) {
				try {
					console.log("QR code received, generating image...");
					const qrCode = await QRCode.toDataURL(qr, {
						width: 400,
						margin: 2,
						errorCorrectionLevel: "H",
					});
					if (session) {
						session.qr = qrCode;
						session.status = "qr_ready";
						this.io.emit("qr", { sessionId, qr: qrCode });
						console.log("QR code emitted successfully for session:", sessionId);
					}
				} catch (err) {
					console.error("QR generation error:", err);
					this.io.emit("session_error", {
						sessionId,
						error: "Failed to generate QR code",
					});
				}
			}

			if (connection === "close") {
				const statusCode = lastDisconnect?.error?.output?.statusCode;
				const isLoggedOut = statusCode === DisconnectReason.loggedOut;
				const is401Error = statusCode === 401;
				const isStreamError = statusCode === 515 || statusCode === 500;
				const is408Timeout = statusCode === 408;

				// Don't reconnect if logged out or 401 (unauthorized/invalid credentials)
				// Also skip reconnect for stream errors and timeouts to avoid loops
				const shouldReconnect =
					lastDisconnect?.error instanceof Boom &&
					!isLoggedOut &&
					!is401Error &&
					!isStreamError &&
					!is408Timeout;

				console.log(
					"Connection closed:",
					lastDisconnect?.error?.message || "Unknown error",
					"Status:",
					statusCode,
					"Reconnecting:",
					shouldReconnect
				);

				if (shouldReconnect) {
					// Remove from Map before reconnecting
					this.sessions.delete(sessionId);
					setTimeout(() => {
						this.createSession(sessionId, usePairingCode, phoneNumber, true);
					}, 3000);
				} else {
					// Remove from sessions map first
					this.sessions.delete(sessionId);

					// Emit closure event
					this.io.emit("session_closed", {
						sessionId,
						reason: is401Error
							? "Invalid credentials"
							: is408Timeout
							? "Connection timeout"
							: "Logged out",
					});

					// Delete session files after a delay to allow any pending writes
					if (is401Error || isLoggedOut || is408Timeout) {
						console.log(`Scheduling cleanup for session: ${sessionId}`);
						setTimeout(() => {
							try {
								const sessionPath = path.join(
									__dirname,
									"..",
									"..",
									"sessions",
									sessionId
								);
								if (fs.existsSync(sessionPath)) {
									fs.rmSync(sessionPath, { recursive: true, force: true });
									console.log(`✓ Cleaned up session folder: ${sessionId}`);
								}
							} catch (error) {
								console.error(
									`Failed to cleanup session ${sessionId}:`,
									error.message
								);
							}
						}, 2000);
					}
				}
			} else if (connection === "open") {
				session.status = "connected";
				session.qr = null;
				session.pairingCode = null;
				this.io.emit("session_connected", {
					sessionId,
					user: sock.user,
				});
				console.log("Session connected:", sessionId);

				// Handle pairing code
				if (usePairingCode && phoneNumber && !sock.authState.creds.registered) {
					setTimeout(async () => {
						try {
							// Remove any non-numeric characters and + symbol
							let cleanNumber = phoneNumber.replace(/\D/g, "");

							// If number is 10 digits, prepend 91 for India
							if (cleanNumber.length === 10) {
								cleanNumber = "91" + cleanNumber;
							}

							// Validate final number format
							if (cleanNumber.length < 10 || cleanNumber.length > 15) {
								throw new Error(
									`Invalid phone number length: ${cleanNumber.length} digits`
								);
							}

							console.log("Requesting pairing code for:", cleanNumber);
							console.log(
								"Phone number format: Country code + number without +"
							);
							console.log(
								"⚠️  IMPORTANT: Enter the code on the phone number:",
								cleanNumber
							);
							console.log(
								"⚠️  Make sure this phone is NOT already logged into WhatsApp elsewhere"
							);

							const code = await sock.requestPairingCode(cleanNumber);
							const session = this.sessions.get(sessionId);

							if (session) {
								session.pairingCode = code;
								session.phoneNumber = cleanNumber; // Store for reference
								session.status = "pairing_code_ready";
								this.io.emit("pairing_code", {
									sessionId,
									code,
									phoneNumber: cleanNumber,
								});
								console.log("Pairing code generated:", code);
								console.log(
									"Enter this code in WhatsApp on phone:",
									cleanNumber
								);
							} else {
								console.error(
									"Session not found after pairing code generation"
								);
							}
						} catch (error) {
							console.error("Pairing code error:", error.message);
							this.io.emit("session_error", {
								sessionId,
								error: `Pairing failed: ${error.message}`,
							});
						}
					}, 5000);
				}
			}
		});

		sock.ev.on("creds.update", saveCreds);
	}

	getSession(sessionId) {
		return this.sessions.get(sessionId);
	}

	getAllSessions() {
		const sessions = [];
		this.sessions.forEach((session, id) => {
			sessions.push({
				id,
				status: session.status,
				user: session.socket.user,
			});
		});
		return sessions;
	}

	async deleteSession(sessionId) {
		const session = this.sessions.get(sessionId);
		if (session) {
			await session.socket.logout();
			this.sessions.delete(sessionId);

			// Delete session files
			const sessionPath = path.join(
				__dirname,
				"..",
				"..",
				"sessions",
				sessionId
			);
			if (fs.existsSync(sessionPath)) {
				fs.rmSync(sessionPath, { recursive: true, force: true });
			}

			this.io.emit("session_deleted", { sessionId });
			return true;
		}
		return false;
	}

	async loadExistingSessions() {
		// DISABLED: Auto-loading causes issues with incomplete sessions
		// Users should manually reconnect sessions after restart
		console.log("⚠️  Auto-load disabled. Create new sessions to connect.");
		return;

		/* Original code - keeping for reference
		const sessionsDir = path.join(__dirname, "..", "..", "sessions");

		if (!fs.existsSync(sessionsDir)) {
			return;
		}

		const sessionFolders = fs.readdirSync(sessionsDir);

		if (sessionFolders.length > 0) {
			console.log(
				`⚠️  Found ${sessionFolders.length} existing session(s). Loading...`
			);
		}

		for (const folder of sessionFolders) {
			const sessionPath = path.join(sessionsDir, folder);
			const credsPath = path.join(sessionPath, "creds.json");

			if (fs.existsSync(credsPath)) {
				try {
					await this.createSession(folder);
					console.log(`✓ Loaded existing session: ${folder}`);
				} catch (error) {
					console.error(`✗ Failed to load session ${folder}:`, error.message);
					// Clean up failed session
					fs.rmSync(sessionPath, { recursive: true, force: true });
					console.log(`✓ Cleaned up invalid session: ${folder}`);
				}
			}
		}
		*/
	}
}

module.exports = SessionManager;
