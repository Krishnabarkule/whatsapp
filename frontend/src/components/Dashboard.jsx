import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
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
			setUsers(response.data.data.filter(u => u.role !== 'admin'));
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	};

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const getProgressColor = (used, limit) => {
		const percentage = (used / limit) * 100;
		if (percentage >= 90) return "#dc2626";
		if (percentage >= 70) return "#f59e0b";
		return "#25d366";
	};

	const calculatePercentage = (used, limit) => {
		return Math.min((used / limit) * 100, 100);
	};

	if (loading) {
		return (
			<div className="dashboard-container">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-container">
			<div className="dashboard-header">
				<div className="header-content">
					<div>
						<h1>Welcome, {user.firstName}!</h1>
						<p className="subtitle">
							{user.role === "admin" ? "Administrator" : user.businessName}
						</p>
					</div>
					<div style={{ display: "flex", gap: "10px" }}>
						<button
						onClick={() => {
							loadStats();
							if (user?.role === "admin") loadUsers();
						}}
							className="refresh-button"
							disabled={loading}
							style={{
								padding: "10px 16px",
								background: "#25d366",
								color: "white",
								border: "none",
								borderRadius: "8px",
								cursor: loading ? "not-allowed" : "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontSize: "14px",
								fontWeight: "500",
								opacity: loading ? 0.6 : 1,
							}}
						>
							<svg viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
								/>
							</svg>
							Refresh
						</button>
						<button onClick={handleLogout} className="logout-button">
							<svg viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"
								/>
							</svg>
							Logout
						</button>
					</div>
				</div>
			</div>

			<div className="dashboard-content">
				{user.role === "admin" ? (
					<div className="admin-dashboard">
						<div className="welcome-card">
							<h2>Admin Dashboard</h2>
							<p>
								Manage users, view analytics, and configure system settings.
							</p>
							<div className="admin-actions">
								<button
									onClick={() => navigate("/admin/users")}
									className="action-button primary"
								>
									<svg viewBox="0 0 24 24" width="20" height="20">
										<path
											fill="currentColor"
											d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"
										/>
									</svg>
									Manage Users
								</button>
								<button
									onClick={() => navigate("/sessions")}
									className="action-button"
								>
									<svg viewBox="0 0 24 24" width="20" height="20">
										<path
											fill="currentColor"
											d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
										/>
									</svg>
									WhatsApp Sessions
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="user-dashboard-layout">
						{/* Left Sidebar with Quick Actions */}
						<div className="sidebar-navigation">
							<h3
								style={{
									fontSize: "16px",
									marginBottom: "20px",
									color: "#075e54",
									fontWeight: "600",
								}}
							>
								Quick Actions
							</h3>
							<nav className="nav-menu">
								<button
									onClick={() => navigate("/sessions")}
									className="nav-item"
								>
									<svg viewBox="0 0 24 24" width="24" height="24">
										<path
											fill="currentColor"
											d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
										/>
									</svg>
									<div>
										<div style={{ fontWeight: "500", fontSize: "14px" }}>
											Manage Sessions
										</div>
										<div style={{ fontSize: "12px", color: "#667781" }}>
											Connect WhatsApp
										</div>
									</div>
								</button>

								<button
									onClick={() => navigate("/messaging")}
									className="nav-item"
								>
									<svg viewBox="0 0 24 24" width="24" height="24">
										<path
											fill="currentColor"
											d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
										/>
									</svg>
									<div>
										<div style={{ fontWeight: "500", fontSize: "14px" }}>
											Send Messages
										</div>
										<div style={{ fontSize: "12px", color: "#667781" }}>
											Start bulk messaging
										</div>
									</div>
								</button>

								<button onClick={() => navigate("/logs")} className="nav-item">
									<svg viewBox="0 0 24 24" width="24" height="24">
										<path
											fill="currentColor"
											d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
										/>
									</svg>
									<div>
										<div style={{ fontWeight: "500", fontSize: "14px" }}>
											Delivery Logs
										</div>
										<div style={{ fontSize: "12px", color: "#667781" }}>
											View message history
										</div>
									</div>
								</button>
							</nav>

							{/* Remaining Messages Box */}
							<div
								style={{
									marginTop: "24px",
									padding: "16px",
									background:
										"linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
									borderRadius: "12px",
									border: "2px solid #25d366",
								}}
							>
								<h4
									style={{
										fontSize: "14px",
										color: "#075e54",
										marginBottom: "12px",
										fontWeight: "700",
									}}
								>
									📊 Messages Remaining
								</h4>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "10px",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<span style={{ fontSize: "13px", color: "#2e7d32" }}>
											Today:
										</span>
										<span
											style={{
												fontSize: "18px",
												fontWeight: "700",
												color: "#1b5e20",
											}}
										>
											{stats?.limits?.dailyRemaining || 0}
										</span>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<span style={{ fontSize: "13px", color: "#2e7d32" }}>
											This Month:
										</span>
										<span
											style={{
												fontSize: "18px",
												fontWeight: "700",
												color: "#1b5e20",
											}}
										>
											{stats?.limits?.monthlyRemaining || 0}
										</span>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<span style={{ fontSize: "13px", color: "#2e7d32" }}>
											This Year:
										</span>
										<span
											style={{
												fontSize: "18px",
												fontWeight: "700",
												color: "#1b5e20",
											}}
										>
											{stats?.limits?.yearlyRemaining || 0}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Main Content Area */}
						<div className="main-content">
							<div className="user-dashboard">
								{/* Usage Stats */}
								<div className="stats-grid">
									<div className="stat-card">
										<div
											className="stat-icon"
											style={{ background: "#e8f5e9" }}
										>
											<svg viewBox="0 0 24 24" width="24" height="24">
												<path
													fill="#4caf50"
													d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
												/>
											</svg>
										</div>
										<div className="stat-content">
											<p className="stat-label">Messages Today</p>
											<p className="stat-value">{stats?.daily?.sent || 0}</p>
										</div>
									</div>

									<div className="stat-card">
										<div
											className="stat-icon"
											style={{ background: "#e3f2fd" }}
										>
											<svg viewBox="0 0 24 24" width="24" height="24">
												<path
													fill="#2196f3"
													d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
												/>
											</svg>
										</div>
										<div className="stat-content">
											<p className="stat-label">Messages This Month</p>
											<p className="stat-value">{stats?.monthly?.sent || 0}</p>
										</div>
									</div>

									<div className="stat-card">
										<div
											className="stat-icon"
											style={{ background: "#fff3e0" }}
										>
											<svg viewBox="0 0 24 24" width="24" height="24">
												<path
													fill="#ff9800"
													d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
												/>
											</svg>
										</div>
										<div className="stat-content">
											<p className="stat-label">Messages This Year</p>
											<p className="stat-value">{stats?.yearly?.sent || 0}</p>
										</div>
									</div>
								</div>

								{/* Usage Limits */}
								<div className="limits-section">
									<h2>Usage Limits</h2>

									<div className="limit-card">
										<div className="limit-header">
											<span className="limit-label">Daily Limit</span>
											<span className="limit-value">
												{stats?.limits?.dailyUsed || 0} /{" "}
												{stats?.limits?.dailyLimit || 0}
											</span>
										</div>
										<div className="progress-bar">
											<div
												className="progress-fill"
												style={{
													width: `${calculatePercentage(
														stats?.limits?.dailyUsed || 0,
														stats?.limits?.dailyLimit || 1
													)}%`,
													background: getProgressColor(
														stats?.limits?.dailyUsed || 0,
														stats?.limits?.dailyLimit || 1
													),
												}}
											></div>
										</div>
										<p className="limit-remaining">
											{stats?.limits?.dailyRemaining || 0} messages remaining
											today
										</p>
									</div>

									<div className="limit-card">
										<div className="limit-header">
											<span className="limit-label">Monthly Limit</span>
											<span className="limit-value">
												{stats?.limits?.monthlyUsed || 0} /{" "}
												{stats?.limits?.monthlyLimit || 0}
											</span>
										</div>
										<div className="progress-bar">
											<div
												className="progress-fill"
												style={{
													width: `${calculatePercentage(
														stats?.limits?.monthlyUsed || 0,
														stats?.limits?.monthlyLimit || 1
													)}%`,
													background: getProgressColor(
														stats?.limits?.monthlyUsed || 0,
														stats?.limits?.monthlyLimit || 1
													),
												}}
											></div>
										</div>
										<p className="limit-remaining">
											{stats?.limits?.monthlyRemaining || 0} messages remaining
											this month
										</p>
									</div>

									<div className="limit-card">
										<div className="limit-header">
											<span className="limit-label">Yearly Limit</span>
											<span className="limit-value">
												{stats?.limits?.yearlyUsed || 0} /{" "}
												{stats?.limits?.yearlyLimit || 0}
											</span>
										</div>
										<div className="progress-bar">
											<div
												className="progress-fill"
												style={{
													width: `${calculatePercentage(
														stats?.limits?.yearlyUsed || 0,
														stats?.limits?.yearlyLimit || 1
													)}%`,
													background: getProgressColor(
														stats?.limits?.yearlyUsed || 0,
														stats?.limits?.yearlyLimit || 1
													),
												}}
											></div>
										</div>
										<p className="limit-remaining">
											{stats?.limits?.yearlyRemaining || 0} messages remaining
											this year
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Dashboard;
