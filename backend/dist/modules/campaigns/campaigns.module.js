var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Campaign, CampaignSchema } from "./schemas/campaign.schema.js";
import { CampaignsService } from "./campaigns.service.js";
import { CampaignsController } from "./campaigns.controller.js";
let CampaignsModule = class CampaignsModule {
};
CampaignsModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([
                { name: Campaign.name, schema: CampaignSchema },
            ]),
        ],
        providers: [CampaignsService],
        controllers: [CampaignsController],
        exports: [CampaignsService],
    })
], CampaignsModule);
export { CampaignsModule };
