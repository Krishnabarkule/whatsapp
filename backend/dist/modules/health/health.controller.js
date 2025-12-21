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
import { Controller, Get } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
let HealthController = class HealthController {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    status() {
        const stateMap = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };
        const readyState = this.connection.readyState;
        return {
            ok: true,
            mongo: stateMap[readyState] || String(readyState),
            uri: process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp_marketing",
        };
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "status", null);
HealthController = __decorate([
    Controller("health"),
    __param(0, InjectConnection()),
    __metadata("design:paramtypes", [Function])
], HealthController);
export { HealthController };
