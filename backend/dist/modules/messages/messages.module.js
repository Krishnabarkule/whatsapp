var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller.js";
import { MessagesService } from "./messages.service.js";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./schemas/message.schema.js";
import { SessionsModule } from "../sessions/sessions.module.js";
import { UsersModule } from "../users/users.module.js";
import { SenderService } from "./sender.service.js";
import { MessagesScheduler } from "./messages.scheduler.js";
let MessagesModule = class MessagesModule {
};
MessagesModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
            SessionsModule,
            UsersModule,
        ],
        controllers: [MessagesController],
        providers: [MessagesService, SenderService, MessagesScheduler],
        exports: [MessagesService, SenderService],
    })
], MessagesModule);
export { MessagesModule };
