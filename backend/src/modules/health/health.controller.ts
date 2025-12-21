import { Controller, Get } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

@Controller("health")
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  status() {
    const stateMap: Record<number, string> = {
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
}
