import type { Connection } from "mongoose";
export declare class HealthController {
    private readonly connection;
    constructor(connection: Connection);
    status(): {
        ok: boolean;
        mongo: string;
        uri: string;
    };
}
