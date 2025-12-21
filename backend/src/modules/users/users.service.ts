import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema.js";
import bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async ensureAdminSeed(params: {
		username: string;
		password: string;
		phone: string;
		planExpiry: Date;
	}) {
		const existing = await this.userModel.findOne({
			username: params.username,
		});
		if (existing) return existing;
		const passwordHash = await bcrypt.hash(params.password, 10);
		return this.userModel.create({
			username: params.username,
			passwordHash,
			role: "ADMIN",
			phone: params.phone,
			planExpiry: params.planExpiry,
		});
	}

	async findByUsername(username: string) {
		return this.userModel.findOne({ username });
	}

	async createUser(data: {
		username: string;
		password: string;
		role?: "ADMIN" | "USER";
		phone?: string;
		planExpiry?: Date;
		dailyLimit?: number;
	}) {
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

	async updatePassword(userId: string, passwordHash: string) {
		return this.userModel.findByIdAndUpdate(
			userId,
			{ passwordHash },
			{ new: true }
		);
	}

	async findById(userId: string) {
		return this.userModel.findById(userId).lean();
	}

	async incrementMessagesSent(userId: string) {
		return this.userModel.findByIdAndUpdate(
			userId,
			{ $inc: { messagesSent: 1 } },
			{ new: true }
		);
	}
}
