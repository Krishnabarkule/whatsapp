var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from "@nestjs/common";
import makeWASocket, { DisconnectReason, useMultiFileAuthState, } from "@whiskeysockets/baileys";
import * as path from "node:path";
let SessionsService = class SessionsService {
    sessions = new Map();
    async start(sessionName = "default") {
        const storage = process.env.STORAGE_DIR || path.resolve(process.cwd(), "storage");
        const sessions = path.join(storage, "sessions", sessionName);
        const { state, saveCreds } = await useMultiFileAuthState(sessions);
        const sock = makeWASocket({ auth: state, printQRInTerminal: false });
        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", (u) => {
            const { connection, lastDisconnect, qr } = u;
            if (qr) {
                const session = this.sessions.get(sessionName);
                if (session) {
                    session.latestQr = qr;
                    session.authenticated = false;
                }
            }
            if (connection === "close") {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !==
                    DisconnectReason.loggedOut;
                if (shouldReconnect)
                    this.start(sessionName);
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
    async stop(sessionName = "default") {
        const session = this.sessions.get(sessionName);
        if (session?.sock) {
            await session.sock.end(new Error("manual-stop"));
        }
        this.sessions.delete(sessionName);
        return { ok: true, message: `Session "${sessionName}" stopped` };
    }
    isReady(sessionName = "default") {
        const session = this.sessions.get(sessionName);
        return !!session?.sock && session.authenticated;
    }
    getLatestQr(sessionName = "default") {
        const session = this.sessions.get(sessionName);
        return session?.latestQr || null;
    }
    getAllSessions() {
        const result = [];
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
    jidFor(phone) {
        const digits = phone.replace(/\D/g, "");
        return `${digits}@s.whatsapp.net`;
    }
    async sendText(toPhone, text, sessionName = "default") {
        const session = this.sessions.get(sessionName);
        if (!session?.sock)
            throw new Error("SESSION_NOT_READY");
        const jid = this.jidFor(toPhone);
        const content = { text };
        await session.sock.sendMessage(jid, content);
    }
    async sendMedia(toPhone, filePath, caption, sessionName = "default") {
        const session = this.sessions.get(sessionName);
        if (!session?.sock)
            throw new Error("SESSION_NOT_READY");
        const jid = this.jidFor(toPhone);
        const fileName = filePath.split("/").pop() || "file";
        const content = {
            document: { url: filePath },
            fileName,
            caption,
        };
        await session.sock.sendMessage(jid, content);
    }
};
SessionsService = __decorate([
    Injectable()
], SessionsService);
export { SessionsService };
