var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { UsersModule } from "./modules/users/users.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { MessagesModule } from "./modules/messages/messages.module.js";
import { TemplatesModule } from "./modules/templates/templates.module.js";
import { SessionsModule } from "./modules/sessions/sessions.module.js";
import { AnalyticsModule } from "./modules/analytics/analytics.module.js";
import { CampaignsModule } from "./modules/campaigns/campaigns.module.js";
import { HealthModule } from "./modules/health/health.module.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../../frontend/dist");
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            MongooseModule.forRoot(process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp_marketing"),
            // Serve frontend build (Vite) from ../frontend/dist
            ServeStaticModule.forRoot({
                rootPath: distPath,
                exclude: ["/api*"],
            }),
            ScheduleModule.forRoot(),
            UsersModule,
            AuthModule,
            MessagesModule,
            TemplatesModule,
            SessionsModule,
            AnalyticsModule,
            CampaignsModule,
            HealthModule,
        ],
    })
], AppModule);
export { AppModule };
