import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CampaignsService } from "./campaigns.service.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";

@Controller("campaigns")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
	constructor(private campaigns: CampaignsService) {}

	@Get()
	list(@Query("ownerId") ownerId: string) {
		return this.campaigns.list(ownerId);
	}

	@Post()
	create(@Body() body: { ownerId: string; name: string }) {
		return this.campaigns.create(body.ownerId, body.name);
	}
}
