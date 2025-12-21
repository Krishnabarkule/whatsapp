import { TemplatesService } from "./templates.service.js";
export declare class TemplatesController {
    private templates;
    constructor(templates: TemplatesService);
    list(ownerId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/template.schema.js").Template, {}, {}> & import("./schemas/template.schema.js").Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[], import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/template.schema.js").Template, {}, {}> & import("./schemas/template.schema.js").Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/template.schema.js").Template, {}, {}> & import("./schemas/template.schema.js").Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, import("./schemas/template.schema.js").Template, {}, {}> & import("./schemas/template.schema.js").Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "find", {}>;
    create(body: {
        ownerId: string;
        name: string;
        content: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/template.schema.js").Template, {}, {}> & import("./schemas/template.schema.js").Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/template.schema.js").Template, {}, {}> & import("./schemas/template.schema.js").Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
