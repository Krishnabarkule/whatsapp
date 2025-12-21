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
import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { IsString } from "class-validator";
class LoginDto {
    username;
    password;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class ForgotDto {
    username;
    phone;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ForgotDto.prototype, "username", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], ForgotDto.prototype, "phone", void 0);
class ResetPasswordDto {
    username;
    newPassword;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "username", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login(dto) {
        return this.authService.login(dto.username, dto.password);
    }
    forgot(dto) {
        return this.authService.forgotPasswordVerify(dto.username, dto.phone);
    }
    reset(dto) {
        return this.authService.resetPassword(dto.username, dto.newPassword);
    }
};
__decorate([
    Post("login"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    Post("forgot-password/verify"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgot", null);
__decorate([
    Post("reset-password"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "reset", null);
AuthController = __decorate([
    Controller("auth"),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
