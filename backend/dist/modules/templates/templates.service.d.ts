import { Model, Types } from "mongoose";
import { Template, TemplateDocument } from "./schemas/template.schema.js";
export declare class TemplatesService {
    private templateModel;
    constructor(templateModel: Model<TemplateDocument>);
    list(ownerId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Template, {}, {}> & Template & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[], import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Template, {}, {}> & Template & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Template, {}, {}> & Template & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, Template, {}, {}> & Template & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "find", {}>;
    create(ownerId: string, name: string, content: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Template, {}, {}> & Template & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Template, {}, {}> & Template & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
}
