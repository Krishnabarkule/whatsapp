import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
	Message,
	MessageDocument,
} from "../messages/schemas/message.schema.js";

@Injectable()
export class AnalyticsService {
	constructor(
		@InjectModel(Message.name) private messageModel: Model<MessageDocument>
	) {}

	async summary() {
		const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
		const rows = await this.messageModel.aggregate(pipeline);
		const out: Record<string, number> = {
			SENT: 0,
			DELIVERED: 0,
			READ: 0,
			FAILED: 0,
			PENDING: 0,
			SCHEDULED: 0,
		};
		rows.forEach((r) => (out[r._id] = r.count));
		return out;
	}
}
