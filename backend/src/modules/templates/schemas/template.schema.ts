import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true })
export class Template {
	@Prop({ required: true, type: String })
	name!: string;

	@Prop({ required: true, type: String })
	content!: string; // can include {{variables}}

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	ownerId!: Types.ObjectId;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ ownerId: 1, name: 1 }, { unique: true });
