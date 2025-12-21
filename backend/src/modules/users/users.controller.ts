import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Roles("ADMIN")
	async list() {
		return this.usersService.listUsers();
	}

	@Post()
	@Roles("ADMIN")
	async create(
		@Body()
		body: {
			username: string;
			password: string;
			role?: "ADMIN" | "USER";
			phone?: string;
			planExpiry?: Date;
			dailyLimit?: number;
		}
	) {
		return this.usersService.createUser(body);
	}
}
