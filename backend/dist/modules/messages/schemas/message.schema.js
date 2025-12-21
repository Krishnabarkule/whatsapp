var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
let Message = class Message {
    userId;
    to; // E.164
    text;
    mediaPath; // local file path
    status;
    failureReason;
    retryCount;
    nextAttemptAt;
    scheduleAt;
    campaignId;
};
__decorate([
    Prop({ type: Types.ObjectId, ref: "User", required: true }),
    __metadata("design:type", Types.ObjectId)
], Message.prototype, "userId", void 0);
__decorate([
    Prop({ required: true, type: String }),
    __metadata("design:type", String)
], Message.prototype, "to", void 0);
__decorate([
    Prop({ required: false, type: String }),
    __metadata("design:type", String)
], Message.prototype, "text", void 0);
__decorate([
    Prop({ required: false, type: String }),
    __metadata("design:type", String)
], Message.prototype, "mediaPath", void 0);
__decorate([
    Prop({
        required: true,
        enum: ["PENDING", "SENT", "DELIVERED", "READ", "FAILED", "SCHEDULED"],
        default: "PENDING",
        type: String,
    }),
    __metadata("design:type", String)
], Message.prototype, "status", void 0);
__decorate([
    Prop({ required: false, type: String }),
    __metadata("design:type", String)
], Message.prototype, "failureReason", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Message.prototype, "retryCount", void 0);
__decorate([
    Prop({ type: Date, required: false }),
    __metadata("design:type", Date)
], Message.prototype, "nextAttemptAt", void 0);
__decorate([
    Prop({ type: Date, required: false }),
    __metadata("design:type", Date)
], Message.prototype, "scheduleAt", void 0);
__decorate([
    Prop({ type: Types.ObjectId, ref: "Campaign", required: false }),
    __metadata("design:type", Types.ObjectId)
], Message.prototype, "campaignId", void 0);
Message = __decorate([
    Schema({ timestamps: true })
], Message);
export { Message };
export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ userId: 1, createdAt: -1 });
