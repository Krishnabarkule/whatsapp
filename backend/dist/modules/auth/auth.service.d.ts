import { UsersService } from "../users/users.service.js";
import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema.js").User, {}, {}> & import("../users/schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema.js").User, {}, {}> & import("../users/schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            username: string;
            role: import("../users/schemas/user.schema.js").Role;
            phone: string | undefined;
            planExpiry: Date | undefined;
        };
    }>;
    forgotPasswordVerify(username: string, phone: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    resetPassword(username: string, newPassword: string): Promise<{
        ok: boolean;
        message: string;
    }>;
}
