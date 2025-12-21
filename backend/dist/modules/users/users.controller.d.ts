import { UsersService } from "./users.service.js";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/user.schema.js").User, {}, {}> & import("./schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    create(body: {
        username: string;
        password: string;
        role?: "ADMIN" | "USER";
        phone?: string;
        planExpiry?: Date;
        dailyLimit?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/user.schema.js").User, {}, {}> & import("./schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/user.schema.js").User, {}, {}> & import("./schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
