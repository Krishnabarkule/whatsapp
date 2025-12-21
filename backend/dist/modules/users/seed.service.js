var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import dayjs from "dayjs";
let UsersSeedService = class UsersSeedService {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async onModuleInit() {
        if (process.env.SEED_ADMIN === "true") {
            const username = process.env.ADMIN_USERNAME || "admin";
            const password = process.env.ADMIN_PASSWORD || "admin123";
            const phone = process.env.ADMIN_PHONE || "+10000000000";
            const days = parseInt(process.env.PLAN_DAYS || "30");
            const planExpiry = dayjs().add(days, "day").toDate();
            await this.usersService.ensureAdminSeed({
                username,
                password,
                phone,
                planExpiry,
            });
        }
    }
};
UsersSeedService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService])
], UsersSeedService);
export { UsersSeedService };
