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
import { Controller, Get, Post, UseGuards, Param } from "@nestjs/common";
import { SessionsService } from "./sessions.service.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
let SessionsController = class SessionsController {
    sessions;
    constructor(sessions) {
        this.sessions = sessions;
    }
    start(name = "default") {
        return this.sessions.start(name);
    }
    stop(name = "default") {
        return this.sessions.stop(name);
    }
    qr(name = "default") {
        return { qr: this.sessions.getLatestQr(name) };
    }
    list() {
        return { sessions: this.sessions.getAllSessions() };
    }
    create(name) {
        return {
            ok: true,
            message: `Session "${name}" created (ready to start)`,
            name,
        };
    }
    delete(name) {
        return this.sessions.stop(name);
    }
};
__decorate([
    Post("start/:name"),
    Roles("ADMIN"),
    __param(0, Param("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "start", null);
__decorate([
    Post("stop/:name"),
    Roles("ADMIN"),
    __param(0, Param("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "stop", null);
__decorate([
    Get("qr/:name"),
    Roles("ADMIN"),
    __param(0, Param("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "qr", null);
__decorate([
    Get("list"),
    Roles("ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "list", null);
__decorate([
    Post("create/:name"),
    Roles("ADMIN"),
    __param(0, Param("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "create", null);
__decorate([
    Post("delete/:name"),
    Roles("ADMIN"),
    __param(0, Param("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "delete", null);
SessionsController = __decorate([
    Controller("sessions"),
    UseGuards(JwtAuthGuard, RolesGuard),
    __metadata("design:paramtypes", [SessionsService])
], SessionsController);
export { SessionsController };
