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
var MessagesScheduler_1;
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message } from "./schemas/message.schema.js";
import { SenderService } from "./sender.service.js";
let MessagesScheduler = MessagesScheduler_1 = class MessagesScheduler {
    messageModel;
    sender;
    logger = new Logger(MessagesScheduler_1.name);
    constructor(messageModel, sender) {
        this.messageModel = messageModel;
        this.sender = sender;
    }
    async dispatchDue() {
        const now = new Date();
        // Fetch scheduled due + pending eligible by nextAttemptAt
        const batch = await this.messageModel
            .find({
            $or: [
                { status: "SCHEDULED", scheduleAt: { $lte: now } },
                {
                    status: "PENDING",
                    $or: [
                        { nextAttemptAt: { $exists: false } },
                        { nextAttemptAt: { $lte: now } },
                    ],
                },
            ],
        })
            .sort({ createdAt: 1 })
            .limit(50);
        if (!batch.length)
            return;
        for (const msg of batch) {
            try {
                // Move SCHEDULED to PENDING before attempt
                if (msg.status === "SCHEDULED") {
                    await this.messageModel.findByIdAndUpdate(msg._id, {
                        status: "PENDING",
                    });
                }
                await this.sender.sendOne(msg);
            }
            catch (e) {
                this.logger.warn(`Send attempt failed for ${msg._id}: ${e?.message}`);
            }
        }
    }
};
__decorate([
    Cron(CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MessagesScheduler.prototype, "dispatchDue", null);
MessagesScheduler = MessagesScheduler_1 = __decorate([
    Injectable(),
    __param(0, InjectModel(Message.name)),
    __metadata("design:paramtypes", [Model,
        SenderService])
], MessagesScheduler);
export { MessagesScheduler };
