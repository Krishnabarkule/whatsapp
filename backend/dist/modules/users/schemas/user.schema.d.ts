import { HydratedDocument } from "mongoose";
export type UserDocument = HydratedDocument<User>;
export type Role = "ADMIN" | "USER";
export declare class User {
    username: string;
    passwordHash: string;
    role: Role;
    phone?: string;
    planExpiry?: Date;
    messagesSent: number;
    dailyLimit: number;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, import("mongoose").Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
