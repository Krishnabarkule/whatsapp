import { MessagesService } from "./messages.service.js";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { Message, MessageDocument } from "./schemas/message.schema.js";
import { Model } from "mongoose";
import { Response } from "express";
import { SessionsService } from "../sessions/sessions.service.js";
import { UsersService } from "../users/users.service.js";
export declare class MessagesController {
    private readonly messagesService;
    private messageModel;
    private sessionsService;
    private usersService;
    constructor(messagesService: MessagesService, messageModel: Model<MessageDocument>, sessionsService: SessionsService, usersService: UsersService);
    previewCsv(file: Express.Multer.File): {
        total: number;
        sample: import("./messages.service.js").CsvRow[];
    };
    importCsv(file: Express.Multer.File, body: {
        mapping: {
            phone: string;
            text?: string;
        };
        campaignId?: string;
        scheduleAt?: string | null;
        mediaName?: string | null;
        userId: string;
    }): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, Omit<Partial<Message>, "_id">>[]>;
    export(format: "csv" | "xlsx" | undefined, res: Response): Promise<void>;
    list(q: PaginationDto): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        total: number;
        page: number;
        limit: number;
    }>;
    uploadMedia(file: Express.Multer.File, user: any): Promise<{
        ok: boolean;
        filePath: string;
        fileName: string;
    }>;
    sendMessage(body: {
        to: string;
        text?: string;
        mediaPath?: string;
        sessionName?: string;
    }, user: any): Promise<{
        ok: boolean;
        message: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Message, {}, {}> & Message & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        sent: number;
        limit: number;
    }>;
}
