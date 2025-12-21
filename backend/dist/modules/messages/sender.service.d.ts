import { Model } from "mongoose";
import { MessageDocument } from "./schemas/message.schema.js";
import { SessionsService } from "../sessions/sessions.service.js";
export declare class SenderService {
    private messageModel;
    private sessions;
    constructor(messageModel: Model<MessageDocument>, sessions: SessionsService);
    sendOne(msg: MessageDocument): Promise<{
        ok: boolean;
    }>;
}
