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
let Campaign = class Campaign {
    name;
    ownerId;
    total;
};
__decorate([
    Prop({ required: true, type: String }),
    __metadata("design:type", String)
], Campaign.prototype, "name", void 0);
__decorate([
    Prop({ type: Types.ObjectId, ref: "User", required: true }),
    __metadata("design:type", Types.ObjectId)
], Campaign.prototype, "ownerId", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Campaign.prototype, "total", void 0);
Campaign = __decorate([
    Schema({ timestamps: true })
], Campaign);
export { Campaign };
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ ownerId: 1, createdAt: -1 });
