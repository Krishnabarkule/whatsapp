import { SessionsService } from "./sessions.service.js";
export declare class SessionsController {
    private sessions;
    constructor(sessions: SessionsService);
    start(name?: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    stop(name?: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    qr(name?: string): {
        qr: string | null;
    };
    list(): {
        sessions: any[];
    };
    create(name: string): {
        ok: boolean;
        message: string;
        name: string;
    };
    delete(name: string): Promise<{
        ok: boolean;
        message: string;
    }>;
}
