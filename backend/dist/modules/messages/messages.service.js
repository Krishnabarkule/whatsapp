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
import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message } from "./schemas/message.schema.js";
import { parse } from "csv-parse/sync";
import * as path from "node:path";
import * as fs from "node:fs";
import dayjs from "dayjs";
let MessagesService = class MessagesService {
    messageModel;
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    parseCsvAndDedupe(fileBuffer) {
        const records = parse(fileBuffer, {
            columns: true,
            skip_empty_lines: true,
        });
        const seen = new Set();
        const unique = [];
        for (const row of records) {
            const phone = (row.phone || row.to || "").replace(/\D/g, "");
            if (!phone)
                continue;
            if (seen.has(phone))
                continue;
            seen.add(phone);
            unique.push({ ...row, phone });
        }
        return unique;
    }
    async createMessagesFromMapping(params) {
        if (!params.mapping.phone)
            throw new BadRequestException("Phone mapping required");
        const docs = params.rows.map((r) => {
            const phone = r[params.mapping.phone]?.replace(/\D/g, "") || "";
            const text = params.mapping.text ? r[params.mapping.text] : undefined;
            const doc = {
                userId: new Types.ObjectId(params.userId),
                to: phone,
                text,
                mediaPath: params.mediaPath || undefined,
                status: params.scheduleAt ? "SCHEDULED" : "PENDING",
                scheduleAt: params.scheduleAt || undefined,
                campaignId: params.campaignId
                    ? new Types.ObjectId(params.campaignId)
                    : undefined,
            };
            return doc;
        });
        return this.messageModel.insertMany(docs);
    }
    async markFailed(id, reason) {
        return this.messageModel.findByIdAndUpdate(id, {
            status: "FAILED",
            failureReason: reason,
        });
    }
    async dueScheduled(now = new Date()) {
        return this.messageModel
            .find({ status: "SCHEDULED", scheduleAt: { $lte: now } })
            .limit(200);
    }
    async updateStatus(id, status) {
        return this.messageModel.findByIdAndUpdate(id, { status });
    }
    resolveMediaTarget(originalName) {
        const base = process.env.STORAGE_DIR || path.resolve(process.cwd(), "storage");
        const uploads = path.join(base, "uploads");
        if (!fs.existsSync(uploads))
            fs.mkdirSync(uploads, { recursive: true });
        const safe = `${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
        return path.join(uploads, safe);
    }
    async exportReport(format, userId) {
        const query = {};
        if (userId)
            query.userId = new Types.ObjectId(userId);
        const rows = await this.messageModel.find(query).lean();
        if (format === "csv") {
            const headers = [
                "to",
                "status",
                "failureReason",
                "createdAt",
                "updatedAt",
            ];
            const lines = [headers.join(",")];
            for (const r of rows) {
                lines.push(`${r.to},${r.status},${r.failureReason || ""},${dayjs(r.createdAt).toISOString()},${dayjs(r.updatedAt).toISOString()}`);
            }
            return { mime: "text/csv", buffer: Buffer.from(lines.join("\n")) };
        }
        const Excel = (await import("exceljs")).default;
        const wb = new Excel.Workbook();
        const ws = wb.addWorksheet("Messages");
        ws.addRow(["to", "status", "failureReason", "createdAt", "updatedAt"]);
        rows.forEach((r) => ws.addRow([
            r.to,
            r.status,
            r.failureReason || "",
            dayjs(r.createdAt).toISOString(),
            dayjs(r.updatedAt).toISOString(),
        ]));
        const buf = await wb.xlsx.writeBuffer();
        return {
            mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            buffer: Buffer.from(buf),
        };
    }
};
MessagesService = __decorate([
    Injectable(),
    __param(0, InjectModel(Message.name)),
    __metadata("design:paramtypes", [Model])
], MessagesService);
export { MessagesService };
