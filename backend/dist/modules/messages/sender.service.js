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
import { Message } from "./schemas/message.schema.js";
import { SessionsService } from "../sessions/sessions.service.js";
let SenderService = class SenderService {
    messageModel;
    sessions;
    constructor(messageModel, sessions) {
        this.messageModel = messageModel;
        this.sessions = sessions;
    }
    async sendOne(msg) {
        if (!this.sessions.isReady())
            throw new Error("SESSION_NOT_READY");
        try {
            if (msg.mediaPath) {
                await this.sessions.sendMedia(msg.to, msg.mediaPath, msg.text || undefined);
            }
            else if (msg.text) {
                await this.sessions.sendText(msg.to, msg.text);
            }
            else {
                throw new Error("EMPTY_MESSAGE");
            }
            await this.messageModel.findByIdAndUpdate(msg._id, {
                status: "SENT",
                failureReason: undefined,
                retryCount: 0,
                nextAttemptAt: undefined,
            });
            return { ok: true };
        }
        catch (e) {
            const retryCount = (msg.retryCount || 0) + 1;
            const maxRetries = parseInt(process.env.SEND_MAX_RETRIES || "3");
            const baseDelaySec = parseInt(process.env.SEND_RETRY_BASE_SEC || "30");
            const backoffSec = Math.min(600, baseDelaySec * Math.pow(2, retryCount - 1));
            const nextAttemptAt = retryCount >= maxRetries
                ? undefined
                : new Date(Date.now() + backoffSec * 1000);
            const status = retryCount >= maxRetries ? "FAILED" : "PENDING";
            await this.messageModel.findByIdAndUpdate(msg._id, {
                status,
                failureReason: e?.message || "SEND_FAILED",
                retryCount,
                nextAttemptAt,
            });
            return { ok: false };
        }
    }
};
SenderService = __decorate([
    Injectable(),
    __param(0, InjectModel(Message.name)),
    __metadata("design:paramtypes", [Model,
        SessionsService])
], SenderService);
export { SenderService };
