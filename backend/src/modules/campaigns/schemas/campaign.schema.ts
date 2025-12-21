import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ timestamps: true })
export class Campaign {
	@Prop({ required: true, type: String })
	name!: string;

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	ownerId!: Types.ObjectId;

	@Prop({ type: Number, default: 0 })
	total!: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ ownerId: 1, createdAt: -1 });
