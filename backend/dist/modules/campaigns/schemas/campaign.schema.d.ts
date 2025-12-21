import { HydratedDocument, Types } from "mongoose";
export type CampaignDocument = HydratedDocument<Campaign>;
export declare class Campaign {
    name: string;
    ownerId: Types.ObjectId;
    total: number;
}
export declare const CampaignSchema: import("mongoose").Schema<Campaign, import("mongoose").Model<Campaign, any, any, any, import("mongoose").Document<unknown, any, Campaign, any, {}> & Campaign & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Campaign, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Campaign>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Campaign> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
