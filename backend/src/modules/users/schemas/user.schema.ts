import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

export type Role = "ADMIN" | "USER";

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true, index: true, type: String })
	username!: string;

	@Prop({ required: true, type: String })
	passwordHash!: string;

	@Prop({ required: true, enum: ["ADMIN", "USER"], default: "USER", type: String })
	role!: Role;

	@Prop({ required: false, type: String })
	phone?: string;

	@Prop({ type: Date, required: false })
	planExpiry?: Date;

	@Prop({ type: Number, default: 0 })
	messagesSent!: number;

	@Prop({ type: Number, default: 0 })
	dailyLimit!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
// Unique+index already defined on the property; avoid duplicate index warnings
