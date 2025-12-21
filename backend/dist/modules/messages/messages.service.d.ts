import { Model, Types } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema.js";
export type CsvRow = Record<string, string>;
export declare class MessagesService {
    private messageModel;
    constructor(messageModel: Model<MessageDocument>);
    parseCsvAndDedupe(fileBuffer: Buffer): CsvRow[];
    createMessagesFromMapping(params: {
        userId: string;
        rows: CsvRow[];
        mapping: {
            phone: string;
            text?: string;
        };
        campaignId?: string;
        scheduleAt?: Date | null;
        mediaPath?: string | null;
    }): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, Omit<Partial<Message>, "_id">>[]>;
    markFailed(id: string, reason: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    dueScheduled(now?: Date): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateStatus(id: string, status: Message["status"]): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    resolveMediaTarget(originalName: string): string;
    exportReport(format: "csv" | "xlsx", userId?: string): Promise<{
        mime: string;
        buffer: Buffer<ArrayBuffer>;
    }>;
}
