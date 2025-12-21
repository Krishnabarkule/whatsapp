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
let User = class User {
    username;
    passwordHash;
    role;
    phone;
    planExpiry;
    messagesSent;
    dailyLimit;
};
__decorate([
    Prop({ required: true, unique: true, index: true, type: String }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    Prop({ required: true, type: String }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Prop({ required: true, enum: ["ADMIN", "USER"], default: "USER", type: String }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Prop({ required: false, type: String }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    Prop({ type: Date, required: false }),
    __metadata("design:type", Date)
], User.prototype, "planExpiry", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "messagesSent", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "dailyLimit", void 0);
User = __decorate([
    Schema({ timestamps: true })
], User);
export { User };
export const UserSchema = SchemaFactory.createForClass(User);
// Unique+index already defined on the property; avoid duplicate index warnings
