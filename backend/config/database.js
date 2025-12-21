const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI);

		console.log(`MongoDB Connected: ${conn.connection.host}`);

		// Create initial admin user if none exists
		const User = require("../models/User");

		console.log("Checking for admin user...");
		const adminExists = await User.findOne({ role: "admin" });

		if (!adminExists) {
			console.log("Creating default admin user...");
			const admin = await User.create({
				firstName: "Admin",
				lastName: "User",
				businessName: "System Admin",
				email: "admin@whatsapp.com",
				password: "admin123",
				role: "admin",
				primaryContact: "1234567890",
				address: "System",
				status: "active",
				dailyLimit: 999999,
				monthlyLimit: 999999,
				yearlyLimit: 999999,
			});
			console.log(
				"Default admin user created - Email: admin@whatsapp.com, Password: admin123"
			);
		} else {
			console.log("Admin user already exists");
		}
	} catch (error) {
		console.error(`Database Error: ${error.message}`);
		console.error("Error stack:", error.stack);
		process.exit(1);
	}
};

module.exports = connectDB;
