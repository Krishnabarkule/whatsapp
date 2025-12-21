import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsService } from "./analytics.service.js";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "../messages/schemas/message.schema.js";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
	],
	controllers: [AnalyticsController],
	providers: [AnalyticsService],
})
export class AnalyticsModule {}
