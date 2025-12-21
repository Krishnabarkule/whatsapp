import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Template, TemplateDocument } from "./schemas/template.schema.js";

@Injectable()
export class TemplatesService {
	constructor(
		@InjectModel(Template.name) private templateModel: Model<TemplateDocument>
	) {}

	list(ownerId: string) {
		return this.templateModel
			.find({ ownerId: new Types.ObjectId(ownerId) })
			.lean();
	}

	create(ownerId: string, name: string, content: string) {
		return this.templateModel.create({
			ownerId: new Types.ObjectId(ownerId),
			name,
			content,
		});
	}
}
