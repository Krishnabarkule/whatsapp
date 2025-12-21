var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException, BadRequestException, } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        const user = await this.usersService.findByUsername(username);
        if (!user)
            throw new UnauthorizedException("Invalid credentials");
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new UnauthorizedException("Invalid credentials");
        // Expiry enforcement
        if (user.planExpiry && new Date(user.planExpiry).getTime() < Date.now()) {
            throw new BadRequestException("EXPIRED");
        }
        return user;
    }
    async login(username, password) {
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
    async forgotPasswordVerify(username, phone) {
        const user = await this.usersService.findByUsername(username);
        if (!user)
            throw new BadRequestException("User not found");
        if (!user.phone || user.phone !== phone)
            throw new BadRequestException("Phone does not match registered contact");
        // In production: send OTP/SMS. Here we simulate as success.
        return {
            ok: true,
            message: "Verification successful. You can now reset your password.",
        };
    }
    async resetPassword(username, newPassword) {
        const user = await this.usersService.findByUsername(username);
        if (!user)
            throw new BadRequestException("User not found");
        if (!newPassword || newPassword.length < 6)
            throw new BadRequestException("Password must be at least 6 characters");
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user._id.toString(), passwordHash);
        return {
            ok: true,
            message: "Password reset successful. Please log in with your new password.",
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        JwtService])
], AuthService);
export { AuthService };
