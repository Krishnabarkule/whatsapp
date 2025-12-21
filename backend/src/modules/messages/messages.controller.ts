import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Inject,
} from "@nestjs/common";
import { MessagesService } from "./messages.service.js";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { InjectModel } from "@nestjs/mongoose";
import { Message, MessageDocument } from "./schemas/message.schema.js";
import { Model } from "mongoose";
import { Response } from "express";
import { SessionsService } from "../sessions/sessions.service.js";
import { UsersService } from "../users/users.service.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";

@Controller("messages")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
	constructor(
		private readonly messagesService: MessagesService,
		@InjectModel(Message.name) private messageModel: Model<MessageDocument>,
		@Inject(SessionsService) private sessionsService: SessionsService,
		@Inject(UsersService) private usersService: UsersService
	) {}

	@Post("csv/preview")
	@UseInterceptors(FileInterceptor("file"))
	previewCsv(@UploadedFile() file: Express.Multer.File) {
		if (!file) throw new BadRequestException("File required");
		const rows = this.messagesService.parseCsvAndDedupe(file.buffer);
		return { total: rows.length, sample: rows.slice(0, 10) };
	}

	@Post("csv/import")
	@UseInterceptors(FileInterceptor("file"))
	importCsv(
		@UploadedFile() file: Express.Multer.File,
		@Body()
		body: {
			mapping: { phone: string; text?: string };
			campaignId?: string;
			scheduleAt?: string | null;
			mediaName?: string | null;
			userId: string;
		}
	) {
		if (!file) throw new BadRequestException("File required");
		const rows = this.messagesService.parseCsvAndDedupe(file.buffer);
		const scheduleAt = body.scheduleAt ? new Date(body.scheduleAt) : null;
		const mapping =
			typeof (body as any).mapping === "string"
				? (JSON.parse((body as any).mapping) as {
						phone: string;
						text?: string;
				  })
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

	@Get("export")
	async export(
		@Query("format") format: "csv" | "xlsx" = "csv",
		@Res() res: Response
	) {
		const out = await this.messagesService.exportReport(format);
		res.setHeader("Content-Type", out.mime);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="messages.${format === "csv" ? "csv" : "xlsx"}"`
		);
		res.send(out.buffer);
	}

	@Get()
	async list(@Query() q: PaginationDto) {
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

	@Post("upload")
	@UseInterceptors(FileInterceptor("file"))
	async uploadMedia(
		@UploadedFile() file: Express.Multer.File,
		@CurrentUser() user: any
	) {
		if (!file) throw new BadRequestException("File required");
		const filePath = this.messagesService.resolveMediaTarget(file.originalname);
		require("node:fs").writeFileSync(filePath, file.buffer);
		return { ok: true, filePath, fileName: file.originalname };
	}

	@Post("send")
	async sendMessage(
		@Body()
		body: {
			to: string;
			text?: string;
			mediaPath?: string;
			sessionName?: string;
		},
		@CurrentUser() user: any
	) {
		if (!body.to || (!body.text && !body.mediaPath)) {
			throw new BadRequestException(
				"Phone number and either text or media required"
			);
		}
		const sessionName = body.sessionName || "default";
		// Check if session is ready
		if (!this.sessionsService.isReady(sessionName)) {
			throw new BadRequestException(
				`WhatsApp session "${sessionName}" not ready. Authenticate first.`
			);
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
			throw new BadRequestException(
				`Daily limit of ${dailyLimit} messages reached`
			);
		}
		// Send message via Baileys
		try {
			if (body.text && !body.mediaPath) {
				await this.sessionsService.sendText(body.to, body.text, sessionName);
			} else if (body.mediaPath) {
				await this.sessionsService.sendMedia(
					body.to,
					body.mediaPath,
					body.text,
					sessionName
				);
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
		} catch (err: any) {
			throw new BadRequestException(
				`Send failed: ${err.message || "Unknown error"}`
			);
		}
	}
}
