import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MessageDocument = HydratedDocument<Message>;

export type MessageStatus =
	| "PENDING"
	| "SENT"
	| "DELIVERED"
	| "READ"
	| "FAILED"
	| "SCHEDULED";

@Schema({ timestamps: true })
export class Message {
	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	userId!: Types.ObjectId;

	@Prop({ required: true, type: String })
	to!: string; // E.164

	@Prop({ required: false, type: String })
	text?: string;

	@Prop({ required: false, type: String })
	mediaPath?: string; // local file path

	@Prop({
		required: true,
		enum: ["PENDING", "SENT", "DELIVERED", "READ", "FAILED", "SCHEDULED"],
		default: "PENDING",
		type: String,
	})
	status!: MessageStatus;

	@Prop({ required: false, type: String })
	failureReason?: string;

	@Prop({ type: Number, default: 0 })
	retryCount!: number;

	@Prop({ type: Date, required: false })
	nextAttemptAt?: Date;

	@Prop({ type: Date, required: false })
	scheduleAt?: Date;

	@Prop({ type: Types.ObjectId, ref: "Campaign", required: false })
	campaignId?: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ userId: 1, createdAt: -1 });
