import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Campaign, CampaignSchema } from "./schemas/campaign.schema.js";
import { CampaignsService } from "./campaigns.service.js";
import { CampaignsController } from "./campaigns.controller.js";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Campaign.name, schema: CampaignSchema },
		]),
	],
	providers: [CampaignsService],
	controllers: [CampaignsController],
	exports: [CampaignsService],
})
export class CampaignsModule {}
