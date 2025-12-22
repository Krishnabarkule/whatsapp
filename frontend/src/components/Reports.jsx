import { useState, useEffect } from "react";
import {
	BarChart3,
	Calendar,
	TrendingUp,
	MessageSquare,
	RefreshCw,
} from "lucide-react";
import axios from "axios";

export default function Reports() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		try {
			setRefreshing(true);
			const response = await axios.get("/api/analytics/dashboard");
			console.log("Stats loaded:", response.data);
			setStats(response.data.data);
		} catch (error) {
			console.error("Failed to load stats:", error);
			console.error("Error details:", error.response?.data);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="text-gray-500">Loading reports...</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="text-red-500">
					Failed to load stats. Please try again.
				</div>
			</div>
		);
	}

	const dailyUsage = stats?.usage?.dailyUsage || 0;
	const dailyLimit = stats?.limits?.dailyLimit || 100;
	const monthlyUsage = stats?.usage?.monthlyUsage || 0;
	const monthlyLimit = stats?.limits?.monthlyLimit || 3000;
	const yearlyUsage = stats?.usage?.yearlyUsage || 0;
	const yearlyLimit = stats?.limits?.yearlyLimit || 36000;

	const dailyPercentage = (dailyUsage / dailyLimit) * 100;
	const monthlyPercentage = (monthlyUsage / monthlyLimit) * 100;
	const yearlyPercentage = (yearlyUsage / yearlyLimit) * 100;

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">Usage Reports</h1>
					<p className="text-gray-600 mt-1">Track your message utilization</p>
				</div>
				<button
					onClick={loadStats}
					disabled={refreshing}
					className="flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-lg hover:bg-[#128c7e] transition-colors disabled:opacity-50"
				>
					<RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
					Refresh
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Calendar className="text-blue-600" size={24} />
							</div>
							<div>
								<p className="text-gray-600 text-sm">Daily Usage</p>
								<p className="text-2xl font-bold text-gray-800">{dailyUsage}</p>
							</div>
						</div>
					</div>
					<div className="text-sm text-gray-600 mb-2">Limit: {dailyLimit}</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all"
							style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
						></div>
					</div>
					<div className="mt-2 text-sm text-gray-600">
						{dailyLimit - dailyUsage} remaining
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-green-100 rounded-lg">
								<TrendingUp className="text-green-600" size={24} />
							</div>
							<div>
								<p className="text-gray-600 text-sm">Monthly Usage</p>
								<p className="text-2xl font-bold text-gray-800">
									{monthlyUsage}
								</p>
							</div>
						</div>
					</div>
					<div className="text-sm text-gray-600 mb-2">
						Limit: {monthlyLimit}
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-green-500 h-2 rounded-full transition-all"
							style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
						></div>
					</div>
					<div className="mt-2 text-sm text-gray-600">
						{monthlyLimit - monthlyUsage} remaining
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-purple-100 rounded-lg">
								<BarChart3 className="text-purple-600" size={24} />
							</div>
							<div>
								<p className="text-gray-600 text-sm">Yearly Usage</p>
								<p className="text-2xl font-bold text-gray-800">
									{yearlyUsage}
								</p>
							</div>
						</div>
					</div>
					<div className="text-sm text-gray-600 mb-2">Limit: {yearlyLimit}</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-purple-500 h-2 rounded-full transition-all"
							style={{ width: `${Math.min(yearlyPercentage, 100)}%` }}
						></div>
					</div>
					<div className="mt-2 text-sm text-gray-600">
						{yearlyLimit - yearlyUsage} remaining
					</div>
				</div>
			</div>

			{/* Visual Chart */}
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-xl font-bold text-gray-800 mb-6">Usage Overview</h2>
				<div className="space-y-6">
					{/* Daily Bar */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-700 font-medium">Daily</span>
							<span className="text-gray-600">
								{dailyUsage} / {dailyLimit}
								<span className="ml-2 text-blue-600 font-semibold">
									{dailyPercentage.toFixed(1)}%
								</span>
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
							<div
								className="bg-gradient-to-r from-blue-400 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
								style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
							>
								{dailyPercentage > 10 && (
									<span className="text-white text-sm font-bold">
										{dailyUsage}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Monthly Bar */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-700 font-medium">Monthly</span>
							<span className="text-gray-600">
								{monthlyUsage} / {monthlyLimit}
								<span className="ml-2 text-green-600 font-semibold">
									{monthlyPercentage.toFixed(1)}%
								</span>
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
							<div
								className="bg-gradient-to-r from-green-400 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
								style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
							>
								{monthlyPercentage > 10 && (
									<span className="text-white text-sm font-bold">
										{monthlyUsage}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Yearly Bar */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-gray-700 font-medium">Yearly</span>
							<span className="text-gray-600">
								{yearlyUsage} / {yearlyLimit}
								<span className="ml-2 text-purple-600 font-semibold">
									{yearlyPercentage.toFixed(1)}%
								</span>
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
							<div
								className="bg-gradient-to-r from-purple-400 to-purple-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
								style={{ width: `${Math.min(yearlyPercentage, 100)}%` }}
							>
								{yearlyPercentage > 10 && (
									<span className="text-white text-sm font-bold">
										{yearlyUsage}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Status Alerts */}
			<div className="mt-6 space-y-3">
				{dailyPercentage >= 90 && (
					<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
						<div className="flex items-center gap-2">
							<MessageSquare className="text-red-500" size={20} />
							<p className="text-red-800 font-medium">
								Daily limit almost reached! Only {dailyLimit - dailyUsage}{" "}
								messages remaining.
							</p>
						</div>
					</div>
				)}
				{monthlyPercentage >= 90 && (
					<div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
						<div className="flex items-center gap-2">
							<MessageSquare className="text-orange-500" size={20} />
							<p className="text-orange-800 font-medium">
								Monthly limit almost reached! Only {monthlyLimit - monthlyUsage}{" "}
								messages remaining.
							</p>
						</div>
					</div>
				)}
				{yearlyPercentage >= 90 && (
					<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
						<div className="flex items-center gap-2">
							<MessageSquare className="text-yellow-600" size={20} />
							<p className="text-yellow-800 font-medium">
								Yearly limit almost reached! Only {yearlyLimit - yearlyUsage}{" "}
								messages remaining.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
