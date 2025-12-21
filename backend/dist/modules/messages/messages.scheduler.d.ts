import { Model } from "mongoose";
import { MessageDocument } from "./schemas/message.schema.js";
import { SenderService } from "./sender.service.js";
export declare class MessagesScheduler {
    private messageModel;
    private sender;
    private readonly logger;
    constructor(messageModel: Model<MessageDocument>, sender: SenderService);
    dispatchDue(): Promise<void>;
}
