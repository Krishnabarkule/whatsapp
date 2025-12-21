import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import axios from "axios";

export default function DeliveryLogs({ logs }) {
	const [allLogs, setAllLogs] = useState([]);
	const [filter, setFilter] = useState("all"); // all, success, failed

	useEffect(() => {
		loadLogs();
	}, []);

	useEffect(() => {
		if (logs.length > 0) {
			setAllLogs((prev) => [...logs, ...prev]);
		}
	}, [logs]);

	const loadLogs = async () => {
		try {
			const response = await axios.get("/api/messages/logs?limit=100");
			setAllLogs(response.data.logs);
		} catch (error) {
			console.error("Failed to load logs:", error);
		}
	};

	const getFilteredLogs = () => {
		if (filter === "all") return allLogs;
		return allLogs.filter((log) => log.status === filter);
	};

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleString();
	};

	const getStats = () => {
		const total = allLogs.length;
		const success = allLogs.filter((log) => log.status === "success").length;
		const failed = allLogs.filter((log) => log.status === "failed").length;
		return { total, success, failed };
	};

	const stats = getStats();

	return (
		<div>
			<div className="content-header">
				<h2>Delivery Logs</h2>
				<p>Track the status of sent messages</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Message Logs</h3>
					<button className="btn btn-primary" onClick={loadLogs}>
						<RefreshCw size={18} />
						Refresh
					</button>
				</div>

				<div className="progress-stats" style={{ marginBottom: "20px" }}>
					<div className="stat">
						<div className="stat-value">{stats.total}</div>
						<div className="stat-label">Total Messages</div>
					</div>
					<div className="stat">
						<div className="stat-value" style={{ color: "#2ecc71" }}>
							{stats.success}
						</div>
						<div className="stat-label">Successful</div>
					</div>
					<div className="stat">
						<div className="stat-value" style={{ color: "#e74c3c" }}>
							{stats.failed}
						</div>
						<div className="stat-label">Failed</div>
					</div>
					<div className="stat">
						<div className="stat-value" style={{ color: "#3498db" }}>
							{stats.total > 0
								? Math.round((stats.success / stats.total) * 100)
								: 0}
							%
						</div>
						<div className="stat-label">Success Rate</div>
					</div>
				</div>

				<div className="flex gap-2" style={{ marginBottom: "20px" }}>
					<button
						className={`btn ${filter === "all" ? "btn-primary" : ""}`}
						onClick={() => setFilter("all")}
						style={
							filter !== "all"
								? { background: "#ecf0f1", color: "#2c3e50" }
								: {}
						}
					>
						All ({allLogs.length})
					</button>
					<button
						className={`btn ${filter === "success" ? "btn-success" : ""}`}
						onClick={() => setFilter("success")}
						style={
							filter !== "success"
								? { background: "#ecf0f1", color: "#2c3e50" }
								: {}
						}
					>
						<CheckCircle size={16} />
						Success ({stats.success})
					</button>
					<button
						className={`btn ${filter === "failed" ? "btn-danger" : ""}`}
						onClick={() => setFilter("failed")}
						style={
							filter !== "failed"
								? { background: "#ecf0f1", color: "#2c3e50" }
								: {}
						}
					>
						<XCircle size={16} />
						Failed ({stats.failed})
					</button>
				</div>

				{getFilteredLogs().length === 0 ? (
					<div className="empty-state">
						<Activity />
						<h3>No logs available</h3>
						<p>Start sending messages to see delivery logs here</p>
					</div>
				) : (
					<div className="logs-container">
						{getFilteredLogs().map((log, index) => (
							<div key={index} className={`log-item ${log.status}`}>
								<div className="log-info">
									<div className="log-phone">
										{log.status === "success" ? (
											<CheckCircle
												size={16}
												style={{
													color: "#2ecc71",
													display: "inline",
													marginRight: "8px",
												}}
											/>
										) : (
											<XCircle
												size={16}
												style={{
													color: "#e74c3c",
													display: "inline",
													marginRight: "8px",
												}}
											/>
										)}
										{log.phone}
									</div>
									<div className="log-message">{log.message}</div>
								</div>
								<div className="log-time">{formatTime(log.timestamp)}</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Export Logs</h3>
				</div>
				<p style={{ marginBottom: "20px", color: "#7f8c8d" }}>
					Download delivery logs for your records
				</p>
				<button
					className="btn btn-primary"
					onClick={() => {
						const csvContent = [
							["Timestamp", "Phone", "Status", "Message"],
							...allLogs.map((log) => {
								const date = new Date(log.timestamp);
								const timestamp = `${date
									.getDate()
									.toString()
									.padStart(2, "0")}/${(date.getMonth() + 1)
									.toString()
									.padStart(2, "0")}/${date.getFullYear()} ${date
									.getHours()
									.toString()
									.padStart(2, "0")}:${date
									.getMinutes()
									.toString()
									.padStart(2, "0")}:${date
									.getSeconds()
									.toString()
									.padStart(2, "0")}`;
								return [
									`"${timestamp}"`,
									`="${log.phone}"`,
									log.status,
									`"${log.message.replace(/"/g, '""')}"`,
								];
							}),
						]
							.map((row) => row.join(","))
							.join("\n");

						const blob = new Blob([csvContent], { type: "text/csv" });
						const url = window.URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `delivery-logs-${new Date().toISOString()}.csv`;
						a.click();
					}}
					disabled={allLogs.length === 0}
				>
					Export as CSV
				</button>
			</div>
		</div>
	);
}
