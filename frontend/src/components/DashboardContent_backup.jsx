import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	RefreshCw,
	Users,
	MessageSquare,
	BarChart3,
	Send,
	Activity,
	Wifi,
	TrendingUp,
	Clock,
	CheckCircle,
	ArrowUpRight,
	ArrowDownRight,
	Target,
	LogOut,
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
			console.log("Dashboard stats response:", response.data);
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

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="text-gray-500">Loading dashboard...</div>
			</div>
		);
	}

	console.log("Rendering dashboard with user:", user);
	console.log("Stats:", stats);

	return (
		<div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
			{/* Header with Gradient */}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-2">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-[#25d366] to-[#128c7e] bg-clip-text text-transparent">
							Welcome back, {user.firstName}! 👋
						</h1>
						<p className="text-gray-600 mt-2 text-lg">
							{user.role === "admin"
								? "Administrator Dashboard"
								: user.businessName}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => {
								loadStats();
								if (user?.role === "admin") loadUsers();
							}}
							className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
						>
							<RefreshCw size={20} />
							<span className="font-semibold">Refresh</span>
						</button>
						<button
							onClick={() => {
								logout();
								navigate("/login");
							}}
							className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-red-600"
						>
							<LogOut size={20} />
							<span className="font-semibold">Logout</span>
						</button>
					</div>
				</div>
				<div className="h-1 w-32 bg-gradient-to-r from-[#25d366] to-[#128c7e] rounded-full"></div>
			</div>

			{user.role === "admin" ? (
				<>
					{/* Admin Quick Actions */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
						<button
							onClick={() => navigate("/admin/users")}
							className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow text-left"
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-100 rounded-lg">
									<Users className="text-blue-600" size={24} />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										Manage Users
									</h3>
									<p className="text-sm text-gray-600">
										{users.length} active users
									</p>
								</div>
							</div>
						</button>

						<button
							onClick={() => navigate("/sessions")}
							className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow text-left"
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-green-100 rounded-lg">
									<MessageSquare className="text-green-600" size={24} />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										WhatsApp Sessions
									</h3>
									<p className="text-sm text-gray-600">Manage connections</p>
								</div>
							</div>
						</button>

						<button
							onClick={() => navigate("/reports")}
							className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow text-left"
						>
							<div className="flex items-center gap-4">
								<div className="p-3 bg-purple-100 rounded-lg">
									<BarChart3 className="text-purple-600" size={24} />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										View Reports
									</h3>
									<p className="text-sm text-gray-600">Analytics & usage</p>
								</div>
							</div>
						</button>
					</div>

					{/* Admin User Stats */}
					{users.length > 0 && (
						<div className="bg-white rounded-xl shadow-md p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4">
								User Overview
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{users.slice(0, 6).map((u) => (
									<div
										key={u.userId}
										className="border border-gray-200 rounded-lg p-4"
									>
										<h3 className="font-semibold text-gray-800">
											{u.firstName} {u.lastName}
										</h3>
										<p className="text-sm text-gray-600">{u.businessName}</p>
										<div className="mt-2 text-xs text-gray-500">
											<div>
												Daily: {u.dailyUsage} / {u.dailyLimit}
											</div>
											<div>
												Monthly: {u.monthlyUsage} / {u.monthlyLimit}
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
					{/* Interactive User Stats Cards with Enhanced Metrics */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
						{/* Daily Usage Card - Interactive */}
						<div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer relative overflow-hidden">
							{/* Animated Background Pattern */}
							<div className="absolute inset-0 opacity-10">
								<div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
								<div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
							</div>

							<div className="relative z-10">
								{/* Header with Icon and Badge */}
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-3">
										<div className="p-4 bg-white bg-opacity-25 rounded-2xl backdrop-blur-md shadow-lg group-hover:rotate-12 transition-transform duration-300">
											<Clock size={32} strokeWidth={2.5} />
										</div>
										<div>
											<p className="text-xs uppercase tracking-wider opacity-90 font-semibold">
												Today
											</p>
											<p className="text-sm opacity-75">Daily Messages</p>
										</div>
									</div>
									<div className="bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
										<span className="text-xs font-bold">24h</span>
									</div>
								</div>

								{/* Main Counter with Circular Progress */}
								<div className="flex items-center justify-between mb-6">
									<div className="relative">
										{/* Circular Progress Background */}
										<svg className="w-32 h-32 transform -rotate-90">
											<circle
												cx="64"
												cy="64"
												r="56"
												stroke="rgba(255,255,255,0.2)"
												strokeWidth="8"
												fill="none"
											/>
											<circle
												cx="64"
												cy="64"
												r="56"
												stroke="white"
												strokeWidth="8"
												fill="none"
												strokeDasharray={`${2 * Math.PI * 56}`}
												strokeDashoffset={`${
													2 *
													Math.PI *
													56 *
													(1 -
														(stats?.usage?.dailyUsage || 0) /
															(stats?.limits?.dailyLimit || 100))
												}`}
												strokeLinecap="round"
												className="transition-all duration-1000"
											/>
										</svg>
										{/* Counter in Center */}
										<div className="absolute inset-0 flex items-center justify-center flex-col">
											<p className="text-4xl font-black">
												{stats?.usage?.dailyUsage || 0}
											</p>
											<p className="text-xs opacity-75 font-medium">sent</p>
										</div>
									</div>

									<div className="text-right space-y-2">
										<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
											<p className="text-xs opacity-90 mb-1">Target</p>
											<p className="text-2xl font-bold">
												{stats?.limits?.dailyLimit || 100}
											</p>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<ArrowUpRight size={16} className="opacity-75" />
											<span className="font-semibold">
												{(
													((stats?.usage?.dailyUsage || 0) /
														(stats?.limits?.dailyLimit || 100)) *
													100
												).toFixed(1)}
												%
											</span>
										</div>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="space-y-3">
									<div className="flex justify-between items-center text-sm">
										<span className="opacity-90 font-medium flex items-center gap-2">
											<Target size={14} />
											Remaining
										</span>
										<span className="font-bold text-2xl">
											{(stats?.limits?.dailyLimit || 100) -
												(stats?.usage?.dailyUsage || 0)}
										</span>
									</div>
									<div className="w-full bg-white bg-opacity-25 rounded-full h-4 overflow-hidden shadow-inner">
										<div
											className="bg-gradient-to-r from-white to-blue-100 h-4 rounded-full transition-all duration-1000 shadow-lg relative"
											style={{
												width: `${Math.min(
													((stats?.usage?.dailyUsage || 0) /
														(stats?.limits?.dailyLimit || 100)) *
														100,
													100
												)}%`,
											}}
										>
											<div className="absolute inset-0 bg-white opacity-50 animate-pulse"></div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Monthly Usage Card - Interactive */}
						<div className="group bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer relative overflow-hidden">
							{/* Animated Background Pattern */}
							<div className="absolute inset-0 opacity-10">
								<div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
								<div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
							</div>

							<div className="relative z-10">
								{/* Header with Icon and Badge */}
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-3">
										<div className="p-4 bg-white bg-opacity-25 rounded-2xl backdrop-blur-md shadow-lg group-hover:rotate-12 transition-transform duration-300">
											<TrendingUp size={32} strokeWidth={2.5} />
										</div>
										<div>
											<p className="text-xs uppercase tracking-wider opacity-90 font-semibold">
												This Month
											</p>
											<p className="text-sm opacity-75">Monthly Messages</p>
										</div>
									</div>
									<div className="bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
										<span className="text-xs font-bold">30d</span>
									</div>
								</div>

								{/* Main Counter with Circular Progress */}
								<div className="flex items-center justify-between mb-6">
									<div className="relative">
										{/* Circular Progress Background */}
										<svg className="w-32 h-32 transform -rotate-90">
											<circle
												cx="64"
												cy="64"
												r="56"
												stroke="rgba(255,255,255,0.2)"
												strokeWidth="8"
												fill="none"
											/>
											<circle
												cx="64"
												cy="64"
												r="56"
												stroke="white"
												strokeWidth="8"
												fill="none"
												strokeDasharray={`${2 * Math.PI * 56}`}
												strokeDashoffset={`${
													2 *
													Math.PI *
													56 *
													(1 -
														(stats?.usage?.monthlyUsage || 0) /
															(stats?.limits?.monthlyLimit || 3000))
												}`}
												strokeLinecap="round"
												className="transition-all duration-1000"
											/>
										</svg>
										{/* Counter in Center */}
										<div className="absolute inset-0 flex items-center justify-center flex-col">
											<p className="text-4xl font-black">
												{stats?.usage?.monthlyUsage || 0}
											</p>
											<p className="text-xs opacity-75 font-medium">sent</p>
										</div>
									</div>

									<div className="text-right space-y-2">
										<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
											<p className="text-xs opacity-90 mb-1">Target</p>
											<p className="text-2xl font-bold">
												{stats?.limits?.monthlyLimit || 3000}
											</p>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<ArrowUpRight size={16} className="opacity-75" />
											<span className="font-semibold">
												{(
													((stats?.usage?.monthlyUsage || 0) /
														(stats?.limits?.monthlyLimit || 3000)) *
													100
												).toFixed(1)}
												%
											</span>
										</div>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="space-y-3">
									<div className="flex justify-between items-center text-sm">
										<span className="opacity-90 font-medium flex items-center gap-2">
											<Target size={14} />
											Remaining
										</span>
										<span className="font-bold text-2xl">
											{(stats?.limits?.monthlyLimit || 3000) -
												(stats?.usage?.monthlyUsage || 0)}
										</span>
									</div>
									<div className="w-full bg-white bg-opacity-25 rounded-full h-4 overflow-hidden shadow-inner">
										<div
											className="bg-gradient-to-r from-white to-green-100 h-4 rounded-full transition-all duration-1000 shadow-lg relative"
											style={{
												width: `${Math.min(
													((stats?.usage?.monthlyUsage || 0) /
														(stats?.limits?.monthlyLimit || 3000)) *
														100,
													100
												)}%`,
											}}
										>
											<div className="absolute inset-0 bg-white opacity-50 animate-pulse"></div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Yearly Usage Card - Interactive */}
						<div className="group bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer relative overflow-hidden">
							{/* Animated Background Pattern */}
							<div className="absolute inset-0 opacity-10">
								<div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
								<div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-125 transition-transform duration-700"></div>
							</div>

							<div className="relative z-10">
								{/* Header with Icon and Badge */}
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-3">
										<div className="p-4 bg-white bg-opacity-25 rounded-2xl backdrop-blur-md shadow-lg group-hover:rotate-12 transition-transform duration-300">
											<BarChart3 size={32} strokeWidth={2.5} />
										</div>
										<div>
											<p className="text-xs uppercase tracking-wider opacity-90 font-semibold">
												This Year
											</p>
											<p className="text-sm opacity-75">Yearly Messages</p>
										</div>
									</div>
									<div className="bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
										<span className="text-xs font-bold">365d</span>
									</div>
								</div>

								{/* Main Counter with Circular Progress */}
								<div className="flex items-center justify-between mb-6">
									<div className="relative">
										{/* Circular Progress Background */}
										<svg className="w-32 h-32 transform -rotate-90">
											<circle
												cx="64"
												cy="64"
												r="56"
												stroke="rgba(255,255,255,0.2)"
												strokeWidth="8"
												fill="none"
											/>
											<circle
												cx="64"
												cy="64"
												r="56"
												stroke="white"
												strokeWidth="8"
												fill="none"
												strokeDasharray={`${2 * Math.PI * 56}`}
												strokeDashoffset={`${
													2 *
													Math.PI *
													56 *
													(1 -
														(stats?.usage?.yearlyUsage || 0) /
															(stats?.limits?.yearlyLimit || 36000))
												}`}
												strokeLinecap="round"
												className="transition-all duration-1000"
											/>
										</svg>
										{/* Counter in Center */}
										<div className="absolute inset-0 flex items-center justify-center flex-col">
											<p className="text-4xl font-black">
												{stats?.usage?.yearlyUsage || 0}
											</p>
											<p className="text-xs opacity-75 font-medium">sent</p>
										</div>
									</div>

									<div className="text-right space-y-2">
										<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
											<p className="text-xs opacity-90 mb-1">Target</p>
											<p className="text-2xl font-bold">
												{stats?.limits?.yearlyLimit || 36000}
											</p>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<ArrowUpRight size={16} className="opacity-75" />
											<span className="font-semibold">
												{(
													((stats?.usage?.yearlyUsage || 0) /
														(stats?.limits?.yearlyLimit || 36000)) *
													100
												).toFixed(1)}
												%
											</span>
										</div>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="space-y-3">
									<div className="flex justify-between items-center text-sm">
										<span className="opacity-90 font-medium flex items-center gap-2">
											<Target size={14} />
											Remaining
										</span>
										<span className="font-bold text-2xl">
											{(stats?.limits?.yearlyLimit || 36000) -
												(stats?.usage?.yearlyUsage || 0)}
										</span>
									</div>
									<div className="w-full bg-white bg-opacity-25 rounded-full h-4 overflow-hidden shadow-inner">
										<div
											className="bg-gradient-to-r from-white to-purple-100 h-4 rounded-full transition-all duration-1000 shadow-lg relative"
											style={{
												width: `${Math.min(
													((stats?.usage?.yearlyUsage || 0) /
														(stats?.limits?.yearlyLimit || 36000)) *
														100,
													100
												)}%`,
											}}
										>
											<div className="absolute inset-0 bg-white opacity-50 animate-pulse"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
