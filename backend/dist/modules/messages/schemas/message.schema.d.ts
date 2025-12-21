import { HydratedDocument, Types } from "mongoose";
export type MessageDocument = HydratedDocument<Message>;
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "SCHEDULED";
export declare class Message {
    userId: Types.ObjectId;
    to: string;
    text?: string;
    mediaPath?: string;
    status: MessageStatus;
    failureReason?: string;
    retryCount: number;
    nextAttemptAt?: Date;
    scheduleAt?: Date;
    campaignId?: Types.ObjectId;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, import("mongoose").Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
