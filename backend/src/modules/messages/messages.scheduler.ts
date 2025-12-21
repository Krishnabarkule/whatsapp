import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema.js";
import { SenderService } from "./sender.service.js";

@Injectable()
export class MessagesScheduler {
	private readonly logger = new Logger(MessagesScheduler.name);
	constructor(
		@InjectModel(Message.name) private messageModel: Model<MessageDocument>,
		private sender: SenderService
	) {}

	@Cron(CronExpression.EVERY_30_SECONDS)
	async dispatchDue() {
		const now = new Date();
		// Fetch scheduled due + pending eligible by nextAttemptAt
		const batch = await this.messageModel
			.find({
				$or: [
					{ status: "SCHEDULED", scheduleAt: { $lte: now } },
					{
						status: "PENDING",
						$or: [
							{ nextAttemptAt: { $exists: false } },
							{ nextAttemptAt: { $lte: now } },
						],
					},
				],
			})
			.sort({ createdAt: 1 })
			.limit(50);

		if (!batch.length) return;

		for (const msg of batch) {
			try {
				// Move SCHEDULED to PENDING before attempt
				if (msg.status === "SCHEDULED") {
					await this.messageModel.findByIdAndUpdate(msg._id, {
						status: "PENDING",
					});
				}
				await this.sender.sendOne(msg);
			} catch (e) {
				this.logger.warn(
					`Send attempt failed for ${msg._id}: ${(e as any)?.message}`
				);
			}
		}
	}
}
