import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Campaign, CampaignDocument } from "./schemas/campaign.schema.js";

@Injectable()
export class CampaignsService {
	constructor(
		@InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>
	) {}

	list(ownerId: string) {
		return this.campaignModel
			.find({ ownerId: new Types.ObjectId(ownerId) })
			.lean();
	}

	create(ownerId: string, name: string) {
		return this.campaignModel.create({
			ownerId: new Types.ObjectId(ownerId),
			name,
		});
	}
}
