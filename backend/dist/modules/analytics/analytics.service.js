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
import { Model } from "mongoose";
import { Message, } from "../messages/schemas/message.schema.js";
let AnalyticsService = class AnalyticsService {
    messageModel;
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    async summary() {
        const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
        const rows = await this.messageModel.aggregate(pipeline);
        const out = {
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
};
AnalyticsService = __decorate([
    Injectable(),
    __param(0, InjectModel(Message.name)),
    __metadata("design:paramtypes", [Model])
], AnalyticsService);
export { AnalyticsService };
