const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
	try {
		let token;

		// Check for token in Authorization header or cookies
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}

		try {
			// Verify token
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "your-secret-key-change-this"
			);

			// Get user from token
			req.user = await User.findById(decoded.id).select("-password");

			if (!req.user) {
				return res.status(401).json({
					success: false,
					error: "User not found",
				});
			}

			if (req.user.status === "suspended") {
				return res.status(403).json({
					success: false,
					error: "Your account has been suspended. Please contact admin.",
				});
			}

			next();
		} catch (err) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// Grant access to specific roles
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				error: `User role '${req.user.role}' is not authorized to access this route`,
			});
		}
		next();
	};
};

// Check message limits
exports.checkMessageLimits = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);

		// Get count of messages to be sent
		// Handle both JSON string and array
		let messageCount = 1;
		if (req.body.contacts) {
			try {
				const contacts =
					typeof req.body.contacts === "string"
						? JSON.parse(req.body.contacts)
						: req.body.contacts;
				messageCount = Array.isArray(contacts) ? contacts.length : 1;
			} catch (e) {
				messageCount = 1;
			}
		}

		const canSend = user.canSendMessages(messageCount);

		if (!canSend.allowed) {
			return res.status(403).json({
				success: false,
				error: "Message limit exceeded",
				limits: {
					dailyRemaining: canSend.dailyRemaining,
					monthlyRemaining: canSend.monthlyRemaining,
					yearlyRemaining: canSend.yearlyRemaining,
					dailyLimit: user.dailyLimit,
					monthlyLimit: user.monthlyLimit,
					yearlyLimit: user.yearlyLimit,
				},
			});
		}

		req.messageCount = messageCount;
		next();
	} catch (error) {
		console.error("Check limits error:", error);
		res.status(500).json({
			success: false,
			error: "Server error checking limits",
		});
	}
};
