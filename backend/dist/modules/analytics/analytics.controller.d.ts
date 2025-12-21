import { AnalyticsService } from "./analytics.service.js";
export declare class AnalyticsController {
    private analytics;
    constructor(analytics: AnalyticsService);
    summary(): Promise<Record<string, number>>;
}
