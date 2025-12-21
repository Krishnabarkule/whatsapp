import { Injectable } from "@nestjs/common";
import makeWASocket, {
	WASocket,
	DisconnectReason,
	useMultiFileAuthState,
	AnyMessageContent,
} from "@whiskeysockets/baileys";
import * as path from "node:path";

interface SessionInstance {
	sock?: WASocket;
	latestQr?: string;
	authenticated: boolean;
}

@Injectable()
export class SessionsService {
	private sessions: Map<string, SessionInstance> = new Map();

	async start(sessionName: string = "default") {
		const storage =
			process.env.STORAGE_DIR || path.resolve(process.cwd(), "storage");
		const sessions = path.join(storage, "sessions", sessionName);
		const { state, saveCreds } = await useMultiFileAuthState(sessions);
		const sock = makeWASocket({ auth: state, printQRInTerminal: false });
		sock.ev.on("creds.update", saveCreds);
		sock.ev.on("connection.update", (u) => {
			const { connection, lastDisconnect, qr } = u as any;
			if (qr) {
				const session = this.sessions.get(sessionName);
				if (session) {
					session.latestQr = qr;
					session.authenticated = false;
				}
			}
			if (connection === "close") {
				const shouldReconnect =
					(lastDisconnect?.error as any)?.output?.statusCode !==
					DisconnectReason.loggedOut;
				if (shouldReconnect) this.start(sessionName);
			}
			if (connection === "open") {
				const session = this.sessions.get(sessionName);
				if (session) {
					session.latestQr = undefined;
					session.authenticated = true;
				}
			}
		});
		this.sessions.set(sessionName, { sock, authenticated: false });
		return { ok: true, message: `Session "${sessionName}" started` };
	}

	async stop(sessionName: string = "default") {
		const session = this.sessions.get(sessionName);
		if (session?.sock) {
			await session.sock.end(new Error("manual-stop"));
		}
		this.sessions.delete(sessionName);
		return { ok: true, message: `Session "${sessionName}" stopped` };
	}

	isReady(sessionName: string = "default") {
		const session = this.sessions.get(sessionName);
		return !!session?.sock && session.authenticated;
	}

	getLatestQr(sessionName: string = "default") {
		const session = this.sessions.get(sessionName);
		return session?.latestQr || null;
	}

	getAllSessions() {
		const result: any[] = [];
		this.sessions.forEach((session, name) => {
			result.push({
				name,
				active: !!session.sock,
				authenticated: session.authenticated,
				hasQr: !!session.latestQr,
			});
		});
		return result;
	}

	/** Return JID for a phone number (digits only expected) */
	private jidFor(phone: string) {
		const digits = phone.replace(/\D/g, "");
		return `${digits}@s.whatsapp.net`;
	}

	async sendText(
		toPhone: string,
		text: string,
		sessionName: string = "default"
	) {
		const session = this.sessions.get(sessionName);
		if (!session?.sock) throw new Error("SESSION_NOT_READY");
		const jid = this.jidFor(toPhone);
		const content: AnyMessageContent = { text } as any;
		await session.sock.sendMessage(jid, content);
	}

	async sendMedia(
		toPhone: string,
		filePath: string,
		caption?: string,
		sessionName: string = "default"
	) {
		const session = this.sessions.get(sessionName);
		if (!session?.sock) throw new Error("SESSION_NOT_READY");
		const jid = this.jidFor(toPhone);
		const fileName = filePath.split("/").pop() || "file";
		const content: AnyMessageContent = {
			document: { url: filePath },
			fileName,
			caption,
		} as any;
		await session.sock.sendMessage(jid, content as any);
	}
}
