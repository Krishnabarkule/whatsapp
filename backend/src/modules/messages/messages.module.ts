import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller.js";
import { MessagesService } from "./messages.service.js";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./schemas/message.schema.js";
import { SessionsModule } from "../sessions/sessions.module.js";
import { UsersModule } from "../users/users.module.js";
import { SenderService } from "./sender.service.js";
import { MessagesScheduler } from "./messages.scheduler.js";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
		SessionsModule,
		UsersModule,
	],
	controllers: [MessagesController],
	providers: [MessagesService, SenderService, MessagesScheduler],
	exports: [MessagesService, SenderService],
})
export class MessagesModule {}
