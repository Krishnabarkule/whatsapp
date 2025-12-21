import { Injectable, OnModuleInit } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import dayjs from "dayjs";

@Injectable()
export class UsersSeedService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

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
}
