export declare class SessionsService {
    private sessions;
    start(sessionName?: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    stop(sessionName?: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    isReady(sessionName?: string): boolean;
    getLatestQr(sessionName?: string): string | null;
    getAllSessions(): any[];
    /** Return JID for a phone number (digits only expected) */
    private jidFor;
    sendText(toPhone: string, text: string, sessionName?: string): Promise<void>;
    sendMedia(toPhone: string, filePath: string, caption?: string, sessionName?: string): Promise<void>;
}
