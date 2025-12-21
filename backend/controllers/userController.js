const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
	try {
		const users = await User.find().select("-password").sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: users.length,
			data: users,
		});
	} catch (error) {
		console.error("Get users error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
	try {
		const fieldsToUpdate = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			businessName: req.body.businessName,
			primaryContact: req.body.primaryContact,
			alternateContact: req.body.alternateContact,
			address: req.body.address,
			status: req.body.status,
			dailyLimit: req.body.dailyLimit,
			monthlyLimit: req.body.monthlyLimit,
			yearlyLimit: req.body.yearlyLimit,
		};

		// Remove undefined fields
		Object.keys(fieldsToUpdate).forEach(
			(key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
		);

		const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("Update user error:", error);
		res.status(500).json({
			success: false,
			error: error.message || "Server error",
		});
	}
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		// Prevent deleting admin users
		if (user.role === "admin") {
			return res.status(400).json({
				success: false,
				error: "Cannot delete admin users",
			});
		}

		await user.deleteOne();

		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		console.error("Delete user error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetPassword = async (req, res) => {
	try {
		const { newPassword } = req.body;

		if (!newPassword || newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				error: "Password must be at least 6 characters",
			});
		}

		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		user.password = newPassword;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Password reset successfully",
		});
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};
