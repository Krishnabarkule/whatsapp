import { AuthService } from "./auth.service.js";
declare class LoginDto {
    username: string;
    password: string;
}
declare class ForgotDto {
    username: string;
    phone: string;
}
declare class ResetPasswordDto {
    username: string;
    newPassword: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            username: string;
            role: import("../users/schemas/user.schema.js").Role;
            phone: string | undefined;
            planExpiry: Date | undefined;
        };
    }>;
    forgot(dto: ForgotDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    reset(dto: ResetPasswordDto): Promise<{
        ok: boolean;
        message: string;
    }>;
}
export {};
