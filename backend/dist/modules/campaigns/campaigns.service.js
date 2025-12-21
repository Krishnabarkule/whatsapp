var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Campaign } from "./schemas/campaign.schema.js";
let CampaignsService = class CampaignsService {
    campaignModel;
    constructor(campaignModel) {
        this.campaignModel = campaignModel;
    }
    list(ownerId) {
        return this.campaignModel
            .find({ ownerId: new Types.ObjectId(ownerId) })
            .lean();
    }
    create(ownerId, name) {
        return this.campaignModel.create({
            ownerId: new Types.ObjectId(ownerId),
            name,
        });
    }
};
CampaignsService = __decorate([
    Injectable(),
    __param(0, InjectModel(Campaign.name)),
    __metadata("design:paramtypes", [Model])
], CampaignsService);
export { CampaignsService };
