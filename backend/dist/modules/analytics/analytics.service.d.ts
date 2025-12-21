import { Model } from "mongoose";
import { MessageDocument } from "../messages/schemas/message.schema.js";
export declare class AnalyticsService {
    private messageModel;
    constructor(messageModel: Model<MessageDocument>);
    summary(): Promise<Record<string, number>>;
}
