import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	async validateUser(username: string, password: string) {
		const user = await this.usersService.findByUsername(username);
		if (!user) throw new UnauthorizedException("Invalid credentials");
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new UnauthorizedException("Invalid credentials");

		// Expiry enforcement
		if (user.planExpiry && new Date(user.planExpiry).getTime() < Date.now()) {
			throw new BadRequestException("EXPIRED");
		}
		return user;
	}

	async login(username: string, password: string) {
		const user = await this.validateUser(username, password);
		const payload = {
			sub: user._id.toString(),
			username: user.username,
			role: user.role,
		};
		const token = await this.jwtService.signAsync(payload);
		return {
			token,
			user: {
				id: user._id,
				username: user.username,
				role: user.role,
				phone: user.phone,
				planExpiry: user.planExpiry,
			},
		};
	}

	async forgotPasswordVerify(username: string, phone: string) {
		const user = await this.usersService.findByUsername(username);
		if (!user) throw new BadRequestException("User not found");
		if (!user.phone || user.phone !== phone)
			throw new BadRequestException("Phone does not match registered contact");
		// In production: send OTP/SMS. Here we simulate as success.
		return {
			ok: true,
			message: "Verification successful. You can now reset your password.",
		};
	}

	async resetPassword(username: string, newPassword: string) {
		const user = await this.usersService.findByUsername(username);
		if (!user) throw new BadRequestException("User not found");
		if (!newPassword || newPassword.length < 6)
			throw new BadRequestException("Password must be at least 6 characters");
		const passwordHash = await bcrypt.hash(newPassword, 10);
		await this.usersService.updatePassword(user._id.toString(), passwordHash);
		return {
			ok: true,
			message:
				"Password reset successful. Please log in with your new password.",
		};
	}
}
