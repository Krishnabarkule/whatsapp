const mongoose = require("mongoose");

const messageLogSchema = new mongoose.Schema(
	{
		userId: {
			type: Number,
			required: true,
			ref: "User",
		},
		sessionId: {
			type: String,
			required: true,
		},
		recipientPhone: {
			type: String,
			required: true,
		},
		recipientName: {
			type: String,
		},
		message: {
			type: String,
			required: true,
		},
		mediaType: {
			type: String,
			enum: ["none", "image", "video", "audio", "document"],
		},
		status: {
			type: String,
			enum: ["sent", "delivered", "read", "failed"],
			default: "sent",
		},
		error: {
			type: String,
		},
		sentAt: {
			type: Date,
			default: Date.now,
		},
		deliveredAt: {
			type: Date,
		},
		readAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for better query performance
messageLogSchema.index({ userId: 1, sentAt: -1 });
messageLogSchema.index({ userId: 1, status: 1 });
messageLogSchema.index({ sentAt: -1 });

module.exports = mongoose.model("MessageLog", messageLogSchema);
