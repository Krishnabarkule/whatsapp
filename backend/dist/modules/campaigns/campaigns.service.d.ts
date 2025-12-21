import { Model, Types } from "mongoose";
import { Campaign, CampaignDocument } from "./schemas/campaign.schema.js";
export declare class CampaignsService {
    private campaignModel;
    constructor(campaignModel: Model<CampaignDocument>);
    list(ownerId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Campaign, {}, {}> & Campaign & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[], import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Campaign, {}, {}> & Campaign & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Campaign, {}, {}> & Campaign & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, Campaign, {}, {}> & Campaign & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "find", {}>;
    create(ownerId: string, name: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Campaign, {}, {}> & Campaign & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Campaign, {}, {}> & Campaign & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
}
