import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { IsString } from "class-validator";

class LoginDto {
	@IsString()
	username!: string;

	@IsString()
	password!: string;
}

class ForgotDto {
	@IsString()
	username!: string;

	@IsString()
	phone!: string;
}

class ResetPasswordDto {
	@IsString()
	username!: string;

	@IsString()
	newPassword!: string;
}

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("login")
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto.username, dto.password);
	}

	@Post("forgot-password/verify")
	forgot(@Body() dto: ForgotDto) {
		return this.authService.forgotPasswordVerify(dto.username, dto.phone);
	}

	@Post("reset-password")
	reset(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto.username, dto.newPassword);
	}
}
