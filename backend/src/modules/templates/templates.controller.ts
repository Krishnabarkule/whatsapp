import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { TemplatesService } from "./templates.service.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";

@Controller("templates")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
	constructor(private templates: TemplatesService) {}

	@Get()
	list(@Query("ownerId") ownerId: string) {
		return this.templates.list(ownerId);
	}

	@Post()
	create(@Body() body: { ownerId: string; name: string; content: string }) {
		return this.templates.create(body.ownerId, body.name, body.content);
	}
}
