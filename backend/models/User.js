const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Counter = require("./Counter");

const userSchema = new mongoose.Schema(
	{
		userId: {
			type: Number,
			unique: true,
		},
		firstName: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
		},
		businessName: {
			type: String,
			required: [true, "Business name is required"],
			unique: true,
			trim: true,
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
		primaryContact: {
			type: String,
			required: [true, "Primary contact is required"],
			trim: true,
		},
		alternateContact: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: 6,
			select: false,
		},
		address: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["active", "suspended"],
			default: "active",
		},
		dailyLimit: {
			type: Number,
			default: 100,
		},
		monthlyLimit: {
			type: Number,
			default: 3000,
		},
		yearlyLimit: {
			type: Number,
			default: 36000,
		},
		dailyUsage: {
			type: Number,
			default: 0,
		},
		monthlyUsage: {
			type: Number,
			default: 0,
		},
		yearlyUsage: {
			type: Number,
			default: 0,
		},
		lastResetDate: {
			daily: { type: Date, default: Date.now },
			monthly: { type: Date, default: Date.now },
			yearly: { type: Date, default: Date.now },
		},
	},
	{
		timestamps: true,
	}
);

// Auto-increment userId
userSchema.pre("save", async function () {
	if (this.isNew) {
		const counter = await Counter.findByIdAndUpdate(
			{ _id: "userId" },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		);
		this.userId = counter.seq;
	}
});

// Hash password before saving
userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Reset usage counters
userSchema.methods.resetDailyUsage = function () {
	this.dailyUsage = 0;
	this.lastResetDate.daily = new Date();
};

userSchema.methods.resetMonthlyUsage = function () {
	this.monthlyUsage = 0;
	this.lastResetDate.monthly = new Date();
};

userSchema.methods.resetYearlyUsage = function () {
	this.yearlyUsage = 0;
	this.lastResetDate.yearly = new Date();
};

// Check and reset usage if needed
userSchema.methods.checkAndResetUsage = function () {
	const now = new Date();

	// Check daily reset
	const lastDaily = new Date(this.lastResetDate.daily);
	if (
		now.getDate() !== lastDaily.getDate() ||
		now.getMonth() !== lastDaily.getMonth() ||
		now.getFullYear() !== lastDaily.getFullYear()
	) {
		this.resetDailyUsage();
	}

	// Check monthly reset
	const lastMonthly = new Date(this.lastResetDate.monthly);
	if (
		now.getMonth() !== lastMonthly.getMonth() ||
		now.getFullYear() !== lastMonthly.getFullYear()
	) {
		this.resetMonthlyUsage();
	}

	// Check yearly reset
	const lastYearly = new Date(this.lastResetDate.yearly);
	if (now.getFullYear() !== lastYearly.getFullYear()) {
		this.resetYearlyUsage();
	}
};

// Check if user can send messages
userSchema.methods.canSendMessages = function (count = 1) {
	this.checkAndResetUsage();

	return {
		allowed:
			this.status === "active" &&
			this.dailyUsage + count <= this.dailyLimit &&
			this.monthlyUsage + count <= this.monthlyLimit &&
			this.yearlyUsage + count <= this.yearlyLimit,
		dailyRemaining: Math.max(0, this.dailyLimit - this.dailyUsage),
		monthlyRemaining: Math.max(0, this.monthlyLimit - this.monthlyUsage),
		yearlyRemaining: Math.max(0, this.yearlyLimit - this.yearlyUsage),
	};
};

// Increment usage counters
userSchema.methods.incrementUsage = async function (count = 1) {
	this.checkAndResetUsage();
	this.dailyUsage += count;
	this.monthlyUsage += count;
	this.yearlyUsage += count;
	await this.save();
};

module.exports = mongoose.model("User", userSchema);
