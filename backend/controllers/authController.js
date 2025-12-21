const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (id) => {
	return jwt.sign(
		{ id },
		process.env.JWT_SECRET || "your-secret-key-change-this",
		{
			expiresIn: process.env.JWT_EXPIRE || "7d",
		}
	);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			businessName,
			email,
			password,
			role,
			primaryContact,
			alternateContact,
			address,
			dailyLimit,
			monthlyLimit,
			yearlyLimit,
		} = req.body;

		// Check if user already exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({
				success: false,
				error: "User already exists with this email",
			});
		}

		// Check if business name exists
		const businessExists = await User.findOne({ businessName });
		if (businessExists) {
			return res.status(400).json({
				success: false,
				error: "Business name already exists",
			});
		}

		// Create user
		const user = await User.create({
			firstName,
			lastName,
			businessName,
			email,
			password,
			role: role || "user",
			primaryContact,
			alternateContact,
			address,
			dailyLimit: dailyLimit || 100,
			monthlyLimit: monthlyLimit || 3000,
			yearlyLimit: yearlyLimit || 36000,
		});

		// Generate token
		const token = generateToken(user._id);

		res.status(201).json({
			success: true,
			data: {
				userId: user.userId,
				firstName: user.firstName,
				lastName: user.lastName,
				businessName: user.businessName,
				email: user.email,
				role: user.role,
				status: user.status,
				token,
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			error: error.message || "Server error",
		});
	}
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate email & password
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				error: "Please provide email and password",
			});
		}

		// Check for user
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res.status(401).json({
				success: false,
				error: "Invalid credentials",
			});
		}

		// Check if user is suspended
		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				error: "Your account has been suspended. Please contact admin.",
			});
		}

		// Check if password matches
		const isMatch = await user.comparePassword(password);

		if (!isMatch) {
			return res.status(401).json({
				success: false,
				error: "Invalid credentials",
			});
		}

		// Generate token
		const token = generateToken(user._id);

		// Set cookie
		const cookieOptions = {
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		};

		res
			.status(200)
			.cookie("token", token, cookieOptions)
			.json({
				success: true,
				data: {
					userId: user.userId,
					firstName: user.firstName,
					lastName: user.lastName,
					businessName: user.businessName,
					email: user.email,
					role: user.role,
					status: user.status,
					dailyLimit: user.dailyLimit,
					monthlyLimit: user.monthlyLimit,
					yearlyLimit: user.yearlyLimit,
					dailyUsage: user.dailyUsage,
					monthlyUsage: user.monthlyUsage,
					yearlyUsage: user.yearlyUsage,
					token,
				},
			});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		// Check and reset usage if needed
		user.checkAndResetUsage();
		await user.save();

		res.status(200).json({
			success: true,
			data: {
				userId: user.userId,
				firstName: user.firstName,
				lastName: user.lastName,
				businessName: user.businessName,
				email: user.email,
				role: user.role,
				status: user.status,
				primaryContact: user.primaryContact,
				alternateContact: user.alternateContact,
				address: user.address,
				dailyLimit: user.dailyLimit,
				monthlyLimit: user.monthlyLimit,
				yearlyLimit: user.yearlyLimit,
				dailyUsage: user.dailyUsage,
				monthlyUsage: user.monthlyUsage,
				yearlyUsage: user.yearlyUsage,
			},
		});
	} catch (error) {
		console.error("Get me error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				error: "Please provide current and new password",
			});
		}

		const user = await User.findById(req.user._id).select("+password");

		// Check current password
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				error: "Current password is incorrect",
			});
		}

		user.password = newPassword;
		await user.save();

		const token = generateToken(user._id);

		res.status(200).json({
			success: true,
			data: { token },
		});
	} catch (error) {
		console.error("Update password error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Verify user for forgot password
// @route   POST /api/auth/forgot-password/verify
// @access  Public
exports.verifyForgotPassword = async (req, res) => {
	try {
		const { email, primaryContact } = req.body;

		if (!email || !primaryContact) {
			return res.status(400).json({
				success: false,
				error: "Please provide email and contact number",
			});
		}

		// Find user by email and contact
		const user = await User.findOne({
			email: email.toLowerCase(),
			primaryContact,
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "No account found with this email and contact number",
			});
		}

		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				error: "Your account is suspended. Please contact admin.",
			});
		}

		// Generate a reset token
		const resetToken = generateToken(user._id);

		res.status(200).json({
			success: true,
			message: "User verified successfully",
			data: {
				resetToken,
				user: {
					id: user._id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
				},
			},
		});
	} catch (error) {
		console.error("Verify forgot password error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Reset password with token
// @route   POST /api/auth/forgot-password/reset
// @access  Public (with token)
exports.resetPassword = async (req, res) => {
	try {
		const { resetToken, newPassword } = req.body;

		if (!resetToken || !newPassword) {
			return res.status(400).json({
				success: false,
				error: "Please provide reset token and new password",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				error: "Password must be at least 6 characters",
			});
		}

		// Verify token
		let decoded;
		try {
			decoded = jwt.verify(
				resetToken,
				process.env.JWT_SECRET || "your-secret-key-change-this"
			);
		} catch (error) {
			return res.status(401).json({
				success: false,
				error: "Invalid or expired reset token",
			});
		}

		// Find user
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				error: "Your account is suspended. Please contact admin.",
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.status(200).json({
			success: true,
			message:
				"Password reset successfully. You can now login with your new password.",
		});
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};
