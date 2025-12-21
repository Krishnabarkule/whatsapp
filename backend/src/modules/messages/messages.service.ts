import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema.js";
import { parse } from "csv-parse/sync";
import * as path from "node:path";
import * as fs from "node:fs";
import dayjs from "dayjs";

export type CsvRow = Record<string, string>;

@Injectable()
export class MessagesService {
	constructor(
		@InjectModel(Message.name) private messageModel: Model<MessageDocument>
	) {}

	parseCsvAndDedupe(fileBuffer: Buffer) {
		const records: CsvRow[] = parse(fileBuffer, {
			columns: true,
			skip_empty_lines: true,
		});
		const seen = new Set<string>();
		const unique: CsvRow[] = [];
		for (const row of records) {
			const phone = (row.phone || row.to || "").replace(/\D/g, "");
			if (!phone) continue;
			if (seen.has(phone)) continue;
			seen.add(phone);
			unique.push({ ...row, phone });
		}
		return unique;
	}

	async createMessagesFromMapping(params: {
		userId: string;
		rows: CsvRow[];
		mapping: { phone: string; text?: string };
		campaignId?: string;
		scheduleAt?: Date | null;
		mediaPath?: string | null;
	}) {
		if (!params.mapping.phone)
			throw new BadRequestException("Phone mapping required");
		const docs = params.rows.map((r) => {
			const phone = r[params.mapping.phone]?.replace(/\D/g, "") || "";
			const text = params.mapping.text ? r[params.mapping.text] : undefined;
			const doc: Partial<Message> = {
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

	async markFailed(id: string, reason: string) {
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

	async updateStatus(id: string, status: Message["status"]) {
		return this.messageModel.findByIdAndUpdate(id, { status });
	}

	resolveMediaTarget(originalName: string) {
		const base =
			process.env.STORAGE_DIR || path.resolve(process.cwd(), "storage");
		const uploads = path.join(base, "uploads");
		if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });
		const safe = `${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
		return path.join(uploads, safe);
	}

	async exportReport(format: "csv" | "xlsx", userId?: string) {
		const query: any = {};
		if (userId) query.userId = new Types.ObjectId(userId);
		const rows: any[] = await this.messageModel.find(query).lean();
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
				lines.push(
					`${r.to},${r.status},${r.failureReason || ""},${dayjs(
						r.createdAt
					).toISOString()},${dayjs(r.updatedAt).toISOString()}`
				);
			}
			return { mime: "text/csv", buffer: Buffer.from(lines.join("\n")) };
		}
		const Excel = (await import("exceljs")).default;
		const wb = new Excel.Workbook();
		const ws = wb.addWorksheet("Messages");
		ws.addRow(["to", "status", "failureReason", "createdAt", "updatedAt"]);
		rows.forEach((r) =>
			ws.addRow([
				r.to,
				r.status,
				r.failureReason || "",
				dayjs(r.createdAt).toISOString(),
				dayjs(r.updatedAt).toISOString(),
			])
		);
		const buf = await wb.xlsx.writeBuffer();
		return {
			mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			buffer: Buffer.from(buf),
		};
	}
}
