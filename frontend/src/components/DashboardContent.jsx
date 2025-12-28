import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	RefreshCw,
	Users,
	MessageSquare,
	BarChart3,
	TrendingUp,
	Clock,
	Target,
	LogOut,
	ArrowUpRight,
} from "lucide-react";
import axios from "axios";

export default function DashboardContent() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [stats, setStats] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStats();
		if (user?.role === "admin") {
			loadUsers();
		}
	}, [user]);

	const loadStats = async () => {
		try {
			const response = await axios.get("/api/analytics/dashboard");
			console.log("Dashboard stats loaded:", response.data);
			setStats(response.data.data);
		} catch (error) {
			console.error("Failed to load stats:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			const response = await axios.get("/api/users");
			setUsers(response.data.data.filter((u) => u.role !== "admin"));
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="text-gray-500">Loading dashboard...</div>
			</div>
		);
	}

	return (
		<div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
			{/* Modern Header with Glass Effect */}
			<div className="mb-8 bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white border-opacity-50">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
							<span className="text-3xl">👋</span>
						</div>
						<div>
							<h1 className="text-3xl font-extrabold text-gray-800">
								Welcome,{" "}
								<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
									{user?.firstName}
								</span>
							</h1>
							<p className="text-gray-600 mt-1 flex items-center gap-2">
								<span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
								{user?.role === "admin"
									? "Administrator Dashboard"
									: user?.businessName || "Dashboard"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => {
								loadStats();
								if (user?.role === "admin") loadUsers();
							}}
							className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 group"
						>
							<RefreshCw
								size={18}
								className="text-emerald-600 group-hover:rotate-180 transition-transform duration-500"
							/>
							<span className="font-semibold text-gray-700">Refresh</span>
						</button>
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
						>
							<LogOut size={18} />
							<span className="font-semibold">Logout</span>
						</button>
					</div>
				</div>
			</div>

			{user?.role === "admin" ? (
				<>
					{/* Modern Admin Quick Actions with Neumorphism */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<button
							onClick={() => navigate("/admin/users")}
							className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-gray-100"
						>
							<div className="flex flex-col items-center text-center gap-4">
								<div className="relative">
									<div className="absolute inset-0 bg-blue-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
									<div className="relative p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
										<Users className="text-white" size={36} strokeWidth={2.5} />
									</div>
								</div>
								<div>
									<h3 className="text-2xl font-bold text-gray-800 mb-2">
										Manage Users
									</h3>
									<p className="text-gray-600 mb-3">
										Control user accounts & permissions
									</p>
									<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
										<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
										<span className="text-blue-700 font-bold text-lg">
											{users.length} active
										</span>
									</div>
								</div>
							</div>
						</button>

						<button
							onClick={() => navigate("/sessions")}
							className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-gray-100"
						>
							<div className="flex flex-col items-center text-center gap-4">
								<div className="relative">
									<div className="absolute inset-0 bg-emerald-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
									<div className="relative p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
										<MessageSquare
											className="text-white"
											size={36}
											strokeWidth={2.5}
										/>
									</div>
								</div>
								<div>
									<h3 className="text-2xl font-bold text-gray-800 mb-2">
										WhatsApp Sessions
									</h3>
									<p className="text-gray-600 mb-3">
										Manage connections & QR codes
									</p>
									<div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
										<span className="text-emerald-700 font-bold text-lg">
											View All →
										</span>
									</div>
								</div>
							</div>
						</button>

						<button
							onClick={() => navigate("/reports")}
							className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-gray-100"
						>
							<div className="flex flex-col items-center text-center gap-4">
								<div className="relative">
									<div className="absolute inset-0 bg-purple-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
									<div className="relative p-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
										<BarChart3
											className="text-white"
											size={36}
											strokeWidth={2.5}
										/>
									</div>
								</div>
								<div>
									<h3 className="text-2xl font-bold text-gray-800 mb-2">
										View Reports
									</h3>
									<p className="text-gray-600 mb-3">
										Analytics, graphs & insights
									</p>
									<div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
										<span className="text-purple-700 font-bold text-lg">
											Explore →
										</span>
									</div>
								</div>
							</div>
						</button>
					</div>

					{/* Modern User Stats Grid */}
					{users.length > 0 && (
						<div className="bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white border-opacity-50">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-gray-800">
									📊 User Overview
								</h2>
								<span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
									{users.length} Total Users
								</span>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
								{users.slice(0, 6).map((u) => (
									<div
										key={u.userId}
										className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
									>
										<div className="flex items-start gap-3 mb-4">
											<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
												{u.firstName.charAt(0)}
												{u.lastName.charAt(0)}
											</div>
											<div className="flex-1">
												<h3 className="font-bold text-gray-800 text-lg">
													{u.firstName} {u.lastName}
												</h3>
												<p className="text-sm text-gray-600">
													{u.businessName}
												</p>
											</div>
										</div>
										<div className="space-y-2">
											<div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
												<span className="text-xs font-semibold text-blue-700">
													Daily
												</span>
												<span className="text-sm font-bold text-blue-900">
													{u.dailyUsage} / {u.dailyLimit}
												</span>
											</div>
											<div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
												<span className="text-xs font-semibold text-green-700">
													Monthly
												</span>
												<span className="text-sm font-bold text-green-900">
													{u.monthlyUsage} / {u.monthlyLimit}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			) : (
				<>
					{/* Stats Grid - Logs Style */}
					<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							{/* Daily Usage Stat */}
							<div className="text-center">
								<div className="text-3xl font-bold text-blue-600 mb-1">
									{stats?.usage?.dailyUsage || 0}
								</div>
								<div className="text-sm text-gray-600 mb-1">Daily Usage</div>
								<div className="text-xs text-gray-500">
									of {stats?.limits?.dailyLimit || 100} (
									{(
										((stats?.usage?.dailyUsage || 0) /
											(stats?.limits?.dailyLimit || 100)) *
										100
									).toFixed(1)}
									%)
								</div>
							</div>

							{/* Monthly Usage Stat */}
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600 mb-1">
									{stats?.usage?.monthlyUsage || 0}
								</div>
								<div className="text-sm text-gray-600 mb-1">Monthly Usage</div>
								<div className="text-xs text-gray-500">
									of {stats?.limits?.monthlyLimit || 3000} (
									{(
										((stats?.usage?.monthlyUsage || 0) /
											(stats?.limits?.monthlyLimit || 3000)) *
										100
									).toFixed(1)}
									%)
								</div>
							</div>

							{/* Yearly Usage Stat */}
							<div className="text-center">
								<div className="text-3xl font-bold text-purple-600 mb-1">
									{stats?.usage?.yearlyUsage || 0}
								</div>
								<div className="text-sm text-gray-600 mb-1">Yearly Usage</div>
								<div className="text-xs text-gray-500">
									of {stats?.limits?.yearlyLimit || 36000} (
									{(
										((stats?.usage?.yearlyUsage || 0) /
											(stats?.limits?.yearlyLimit || 36000)) *
										100
									).toFixed(1)}
									%)
								</div>
							</div>

							{/* Total Available */}
							<div className="text-center">
								<div className="text-3xl font-bold text-gray-700 mb-1">
									{(stats?.limits?.dailyLimit || 100) -
										(stats?.usage?.dailyUsage || 0) +
										((stats?.limits?.monthlyLimit || 3000) -
											(stats?.usage?.monthlyUsage || 0))}
								</div>
								<div className="text-sm text-gray-600 mb-1">
									Total Remaining
								</div>
								<div className="text-xs text-gray-500">Available messages</div>
							</div>
						</div>
					</div>

					{/* Detailed Cards - Logs Style */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Daily Usage Card */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-3 bg-blue-100 rounded-lg">
									<Clock
										size={24}
										className="text-blue-600"
										strokeWidth={2.5}
									/>
								</div>
								<div>
									<div className="text-sm text-gray-600">Daily</div>
									<div className="text-2xl font-bold text-gray-800">
										{stats?.usage?.dailyUsage || 0} /{" "}
										{stats?.limits?.dailyLimit || 100}
									</div>
								</div>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-blue-500 h-2 rounded-full transition-all"
									style={{
										width: `${Math.min(
											((stats?.usage?.dailyUsage || 0) /
												(stats?.limits?.dailyLimit || 100)) *
												100,
											100
										)}%`,
									}}
								></div>
							</div>
							<div className="mt-2 text-sm text-gray-600">
								{(stats?.limits?.dailyLimit || 100) -
									(stats?.usage?.dailyUsage || 0)}{" "}
								remaining
							</div>
						</div>

						{/* Monthly Usage Card */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-3 bg-green-100 rounded-lg">
									<TrendingUp
										size={24}
										className="text-green-600"
										strokeWidth={2.5}
									/>
								</div>
								<div>
									<div className="text-sm text-gray-600">Monthly</div>
									<div className="text-2xl font-bold text-gray-800">
										{stats?.usage?.monthlyUsage || 0} /{" "}
										{stats?.limits?.monthlyLimit || 3000}
									</div>
								</div>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-green-500 h-2 rounded-full transition-all"
									style={{
										width: `${Math.min(
											((stats?.usage?.monthlyUsage || 0) /
												(stats?.limits?.monthlyLimit || 3000)) *
												100,
											100
										)}%`,
									}}
								></div>
							</div>
							<div className="mt-2 text-sm text-gray-600">
								{(stats?.limits?.monthlyLimit || 3000) -
									(stats?.usage?.monthlyUsage || 0)}{" "}
								remaining
							</div>
						</div>

						{/* Yearly Usage Card */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-3 bg-purple-100 rounded-lg">
									<BarChart3
										size={24}
										className="text-purple-600"
										strokeWidth={2.5}
									/>
								</div>
								<div>
									<div className="text-sm text-gray-600">Yearly</div>
									<div className="text-2xl font-bold text-gray-800">
										{stats?.usage?.yearlyUsage || 0} /{" "}
										{stats?.limits?.yearlyLimit || 36000}
									</div>
								</div>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-purple-500 h-2 rounded-full transition-all"
									style={{
										width: `${Math.min(
											((stats?.usage?.yearlyUsage || 0) /
												(stats?.limits?.yearlyLimit || 36000)) *
												100,
											100
										)}%`,
									}}
								></div>
							</div>
							<div className="mt-2 text-sm text-gray-600">
								{(stats?.limits?.yearlyLimit || 36000) -
									(stats?.usage?.yearlyUsage || 0)}{" "}
								remaining
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
