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
import { BadRequestException, Body, Controller, Get, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors, Inject, } from "@nestjs/common";
import { MessagesService } from "./messages.service.js";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { InjectModel } from "@nestjs/mongoose";
import { Message } from "./schemas/message.schema.js";
import { Model } from "mongoose";
import { SessionsService } from "../sessions/sessions.service.js";
import { UsersService } from "../users/users.service.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
let MessagesController = class MessagesController {
    messagesService;
    messageModel;
    sessionsService;
    usersService;
    constructor(messagesService, messageModel, sessionsService, usersService) {
        this.messagesService = messagesService;
        this.messageModel = messageModel;
        this.sessionsService = sessionsService;
        this.usersService = usersService;
    }
    previewCsv(file) {
        if (!file)
            throw new BadRequestException("File required");
        const rows = this.messagesService.parseCsvAndDedupe(file.buffer);
        return { total: rows.length, sample: rows.slice(0, 10) };
    }
    importCsv(file, body) {
        if (!file)
            throw new BadRequestException("File required");
        const rows = this.messagesService.parseCsvAndDedupe(file.buffer);
        const scheduleAt = body.scheduleAt ? new Date(body.scheduleAt) : null;
        const mapping = typeof body.mapping === "string"
            ? JSON.parse(body.mapping)
            : body.mapping;
        return this.messagesService.createMessagesFromMapping({
            userId: body.userId,
            rows,
            mapping,
            campaignId: body.campaignId || undefined,
            scheduleAt,
            mediaPath: body.mediaName || null,
        });
    }
    async export(format = "csv", res) {
        const out = await this.messagesService.exportReport(format);
        res.setHeader("Content-Type", out.mime);
        res.setHeader("Content-Disposition", `attachment; filename="messages.${format === "csv" ? "csv" : "xlsx"}"`);
        res.send(out.buffer);
    }
    async list(q) {
        const page = q.page || 1;
        const limit = q.limit || 20;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.messageModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.messageModel.countDocuments(),
        ]);
        return { items, total, page, limit };
    }
    async uploadMedia(file, user) {
        if (!file)
            throw new BadRequestException("File required");
        const filePath = this.messagesService.resolveMediaTarget(file.originalname);
        require("node:fs").writeFileSync(filePath, file.buffer);
        return { ok: true, filePath, fileName: file.originalname };
    }
    async sendMessage(body, user) {
        if (!body.to || (!body.text && !body.mediaPath)) {
            throw new BadRequestException("Phone number and either text or media required");
        }
        const sessionName = body.sessionName || "default";
        // Check if session is ready
        if (!this.sessionsService.isReady(sessionName)) {
            throw new BadRequestException(`WhatsApp session "${sessionName}" not ready. Authenticate first.`);
        }
        // Check daily limits
        const userDoc = await this.usersService.findById(user.sub);
        const dailyLimit = userDoc?.dailyLimit || 50;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sentToday = await this.messageModel.countDocuments({
            userId: user.sub,
            status: "SENT",
            createdAt: { $gte: today },
        });
        if (sentToday >= dailyLimit) {
            throw new BadRequestException(`Daily limit of ${dailyLimit} messages reached`);
        }
        // Send message via Baileys
        try {
            if (body.text && !body.mediaPath) {
                await this.sessionsService.sendText(body.to, body.text, sessionName);
            }
            else if (body.mediaPath) {
                await this.sessionsService.sendMedia(body.to, body.mediaPath, body.text, sessionName);
            }
            // Save to database as SENT
            const msg = await this.messageModel.create({
                userId: user.sub,
                to: body.to.replace(/\D/g, ""),
                text: body.text,
                mediaPath: body.mediaPath,
                status: "SENT",
            });
            // Update user's messagesSent counter
            await this.usersService.incrementMessagesSent(user.sub);
            return { ok: true, message: msg, sent: sentToday + 1, limit: dailyLimit };
        }
        catch (err) {
            throw new BadRequestException(`Send failed: ${err.message || "Unknown error"}`);
        }
    }
};
__decorate([
    Post("csv/preview"),
    UseInterceptors(FileInterceptor("file")),
    __param(0, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "previewCsv", null);
__decorate([
    Post("csv/import"),
    UseInterceptors(FileInterceptor("file")),
    __param(0, UploadedFile()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "importCsv", null);
__decorate([
    Get("export"),
    __param(0, Query("format")),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "export", null);
__decorate([
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "list", null);
__decorate([
    Post("upload"),
    UseInterceptors(FileInterceptor("file")),
    __param(0, UploadedFile()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "uploadMedia", null);
__decorate([
    Post("send"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "sendMessage", null);
MessagesController = __decorate([
    Controller("messages"),
    UseGuards(JwtAuthGuard, RolesGuard),
    __param(1, InjectModel(Message.name)),
    __param(2, Inject(SessionsService)),
    __param(3, Inject(UsersService)),
    __metadata("design:paramtypes", [MessagesService,
        Model,
        SessionsService,
        UsersService])
], MessagesController);
export { MessagesController };
