import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema.js";
import { SessionsService } from "../sessions/sessions.service.js";

@Injectable()
export class SenderService {
	constructor(
		@InjectModel(Message.name) private messageModel: Model<MessageDocument>,
		private sessions: SessionsService
	) {}

	async sendOne(msg: MessageDocument) {
		if (!this.sessions.isReady()) throw new Error("SESSION_NOT_READY");
		try {
			if (msg.mediaPath) {
				await this.sessions.sendMedia(
					msg.to,
					msg.mediaPath,
					msg.text || undefined
				);
			} else if (msg.text) {
				await this.sessions.sendText(msg.to, msg.text);
			} else {
				throw new Error("EMPTY_MESSAGE");
			}
			await this.messageModel.findByIdAndUpdate(msg._id, {
				status: "SENT",
				failureReason: undefined,
				retryCount: 0,
				nextAttemptAt: undefined,
			});
			return { ok: true };
		} catch (e: any) {
			const retryCount = (msg.retryCount || 0) + 1;
			const maxRetries = parseInt(process.env.SEND_MAX_RETRIES || "3");
			const baseDelaySec = parseInt(process.env.SEND_RETRY_BASE_SEC || "30");
			const backoffSec = Math.min(
				600,
				baseDelaySec * Math.pow(2, retryCount - 1)
			);
			const nextAttemptAt =
				retryCount >= maxRetries
					? undefined
					: new Date(Date.now() + backoffSec * 1000);
			const status = retryCount >= maxRetries ? "FAILED" : "PENDING";
			await this.messageModel.findByIdAndUpdate(msg._id, {
				status,
				failureReason: e?.message || "SEND_FAILED",
				retryCount,
				nextAttemptAt,
			});
			return { ok: false };
		}
	}
}
