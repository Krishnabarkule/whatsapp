import { CampaignsService } from "./campaigns.service.js";
export declare class CampaignsController {
    private campaigns;
    constructor(campaigns: CampaignsService);
    list(ownerId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/campaign.schema.js").Campaign, {}, {}> & import("./schemas/campaign.schema.js").Campaign & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[], import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/campaign.schema.js").Campaign, {}, {}> & import("./schemas/campaign.schema.js").Campaign & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/campaign.schema.js").Campaign, {}, {}> & import("./schemas/campaign.schema.js").Campaign & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, import("./schemas/campaign.schema.js").Campaign, {}, {}> & import("./schemas/campaign.schema.js").Campaign & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "find", {}>;
    create(body: {
        ownerId: string;
        name: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/campaign.schema.js").Campaign, {}, {}> & import("./schemas/campaign.schema.js").Campaign & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/campaign.schema.js").Campaign, {}, {}> & import("./schemas/campaign.schema.js").Campaign & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
