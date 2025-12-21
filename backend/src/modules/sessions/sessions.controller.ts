import { Controller, Get, Post, UseGuards, Param } from "@nestjs/common";
import { SessionsService } from "./sessions.service.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";

@Controller("sessions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
	constructor(private sessions: SessionsService) {}

	@Post("start/:name")
	@Roles("ADMIN")
	start(@Param("name") name: string = "default") {
		return this.sessions.start(name);
	}

	@Post("stop/:name")
	@Roles("ADMIN")
	stop(@Param("name") name: string = "default") {
		return this.sessions.stop(name);
	}

	@Get("qr/:name")
	@Roles("ADMIN")
	qr(@Param("name") name: string = "default") {
		return { qr: this.sessions.getLatestQr(name) };
	}

	@Get("list")
	@Roles("ADMIN")
	list() {
		return { sessions: this.sessions.getAllSessions() };
	}

	@Post("create/:name")
	@Roles("ADMIN")
	create(@Param("name") name: string) {
		return {
			ok: true,
			message: `Session "${name}" created (ready to start)`,
			name,
		};
	}

	@Post("delete/:name")
	@Roles("ADMIN")
	delete(@Param("name") name: string) {
		return this.sessions.stop(name);
	}
}
