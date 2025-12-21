import { OnModuleInit } from "@nestjs/common";
import { UsersService } from "./users.service.js";
export declare class UsersSeedService implements OnModuleInit {
    private readonly usersService;
    constructor(usersService: UsersService);
    onModuleInit(): Promise<void>;
}
