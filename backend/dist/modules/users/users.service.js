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
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./schemas/user.schema.js";
import bcrypt from "bcryptjs";
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async ensureAdminSeed(params) {
        const existing = await this.userModel.findOne({
            username: params.username,
        });
        if (existing)
            return existing;
        const passwordHash = await bcrypt.hash(params.password, 10);
        return this.userModel.create({
            username: params.username,
            passwordHash,
            role: "ADMIN",
            phone: params.phone,
            planExpiry: params.planExpiry,
        });
    }
    async findByUsername(username) {
        return this.userModel.findOne({ username });
    }
    async createUser(data) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.userModel.create({
            username: data.username,
            passwordHash,
            role: data.role || "USER",
            phone: data.phone,
            planExpiry: data.planExpiry,
            dailyLimit: data.dailyLimit || 0,
        });
    }
    async listUsers() {
        return this.userModel.find().lean();
    }
    async updatePassword(userId, passwordHash) {
        return this.userModel.findByIdAndUpdate(userId, { passwordHash }, { new: true });
    }
    async findById(userId) {
        return this.userModel.findById(userId).lean();
    }
    async incrementMessagesSent(userId) {
        return this.userModel.findByIdAndUpdate(userId, { $inc: { messagesSent: 1 } }, { new: true });
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model])
], UsersService);
export { UsersService };
