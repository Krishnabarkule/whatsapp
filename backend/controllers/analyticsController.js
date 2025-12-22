const MessageLog = require("../models/MessageLog");
const User = require("../models/User");

// @desc    Get user dashboard stats
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
	try {
		const userId = req.user.userId;
		const now = new Date();

		// Get today's stats
		const startOfDay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);
		const dailyStats = await MessageLog.aggregate([
			{
				$match: {
					userId: userId,
					sentAt: { $gte: startOfDay },
				},
			},
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		// Get month's stats
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const monthlyStats = await MessageLog.aggregate([
			{
				$match: {
					userId: userId,
					sentAt: { $gte: startOfMonth },
				},
			},
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		// Get year's stats
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const yearlyStats = await MessageLog.aggregate([
			{
				$match: {
					userId: userId,
					sentAt: { $gte: startOfYear },
				},
			},
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		// Format stats
		const formatStats = (stats) => {
			const result = { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 };
			stats.forEach((stat) => {
				result[stat._id] = stat.count;
				result.total += stat.count;
			});
			return result;
		};

		// Get user limits
		const user = await User.findById(req.user._id);
		user.checkAndResetUsage();
		await user.save();

		res.status(200).json({
			success: true,
			data: {
				daily: formatStats(dailyStats),
				monthly: formatStats(monthlyStats),
				yearly: formatStats(yearlyStats),
				usage: {
					dailyUsage: user.dailyUsage,
					monthlyUsage: user.monthlyUsage,
					yearlyUsage: user.yearlyUsage,
				},
				limits: {
					dailyLimit: user.dailyLimit,
					dailyUsed: user.dailyUsage,
					dailyRemaining: Math.max(0, user.dailyLimit - user.dailyUsage),
					monthlyLimit: user.monthlyLimit,
					monthlyUsed: user.monthlyUsage,
					monthlyRemaining: Math.max(0, user.monthlyLimit - user.monthlyUsage),
					yearlyLimit: user.yearlyLimit,
					yearlyUsed: user.yearlyUsage,
					yearlyRemaining: Math.max(0, user.yearlyLimit - user.yearlyUsage),
				},
			},
		});
	} catch (error) {
		console.error("Dashboard stats error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Get daily usage chart data
// @route   GET /api/analytics/daily/:days
// @access  Private
exports.getDailyUsage = async (req, res) => {
	try {
		const days = parseInt(req.params.days) || 7;
		const userId = req.user.userId;
		const now = new Date();
		const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

		const stats = await MessageLog.aggregate([
			{
				$match: {
					userId: userId,
					sentAt: { $gte: startDate },
				},
			},
			{
				$group: {
					_id: {
						date: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
						status: "$status",
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { "_id.date": 1 },
			},
		]);

		// Format data for charts
		const chartData = {};
		stats.forEach((stat) => {
			const date = stat._id.date;
			if (!chartData[date]) {
				chartData[date] = { date, sent: 0, delivered: 0, read: 0, failed: 0 };
			}
			chartData[date][stat._id.status] = stat.count;
		});

		res.status(200).json({
			success: true,
			data: Object.values(chartData),
		});
	} catch (error) {
		console.error("Daily usage error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Get monthly usage chart data
// @route   GET /api/analytics/monthly/:months
// @access  Private
exports.getMonthlyUsage = async (req, res) => {
	try {
		const months = parseInt(req.params.months) || 12;
		const userId = req.user.userId;
		const now = new Date();
		const startDate = new Date(
			now.getFullYear(),
			now.getMonth() - months + 1,
			1
		);

		const stats = await MessageLog.aggregate([
			{
				$match: {
					userId: userId,
					sentAt: { $gte: startDate },
				},
			},
			{
				$group: {
					_id: {
						month: { $dateToString: { format: "%Y-%m", date: "$sentAt" } },
						status: "$status",
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { "_id.month": 1 },
			},
		]);

		// Format data for charts
		const chartData = {};
		stats.forEach((stat) => {
			const month = stat._id.month;
			if (!chartData[month]) {
				chartData[month] = { month, sent: 0, delivered: 0, read: 0, failed: 0 };
			}
			chartData[month][stat._id.status] = stat.count;
		});

		res.status(200).json({
			success: true,
			data: Object.values(chartData),
		});
	} catch (error) {
		console.error("Monthly usage error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};

// @desc    Get admin overview (all users stats)
// @route   GET /api/analytics/admin/overview
// @access  Private/Admin
exports.getAdminOverview = async (req, res) => {
	try {
		const now = new Date();
		const startOfDay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		// Total users
		const totalUsers = await User.countDocuments({ role: "user" });
		const activeUsers = await User.countDocuments({
			role: "user",
			status: "active",
		});
		const suspendedUsers = await User.countDocuments({
			role: "user",
			status: "suspended",
		});

		// Today's messages (all users)
		const todayMessages = await MessageLog.aggregate([
			{ $match: { sentAt: { $gte: startOfDay } } },
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		// This month's messages
		const monthMessages = await MessageLog.aggregate([
			{ $match: { sentAt: { $gte: startOfMonth } } },
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		// Top users by message count (this month)
		const topUsers = await MessageLog.aggregate([
			{ $match: { sentAt: { $gte: startOfMonth } } },
			{
				$group: {
					_id: "$userId",
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);

		// Get user details for top users
		const topUsersData = await Promise.all(
			topUsers.map(async (item) => {
				const user = await User.findOne({ userId: item._id });
				return {
					userId: item._id,
					businessName: user ? user.businessName : "Unknown",
					messageCount: item.count,
				};
			})
		);

		const formatStats = (stats) => {
			const result = { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 };
			stats.forEach((stat) => {
				result[stat._id] = stat.count;
				result.total += stat.count;
			});
			return result;
		};

		res.status(200).json({
			success: true,
			data: {
				users: {
					total: totalUsers,
					active: activeUsers,
					suspended: suspendedUsers,
				},
				today: formatStats(todayMessages),
				month: formatStats(monthMessages),
				topUsers: topUsersData,
			},
		});
	} catch (error) {
		console.error("Admin overview error:", error);
		res.status(500).json({
			success: false,
			error: "Server error",
		});
	}
};
