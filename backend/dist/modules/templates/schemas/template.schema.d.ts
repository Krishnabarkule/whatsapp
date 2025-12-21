import { HydratedDocument, Types } from "mongoose";
export type TemplateDocument = HydratedDocument<Template>;
export declare class Template {
    name: string;
    content: string;
    ownerId: Types.ObjectId;
}
export declare const TemplateSchema: import("mongoose").Schema<Template, import("mongoose").Model<Template, any, any, any, import("mongoose").Document<unknown, any, Template, any, {}> & Template & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Template, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Template>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Template> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
