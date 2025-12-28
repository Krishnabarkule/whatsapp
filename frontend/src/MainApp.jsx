import { useState, useEffect } from "react";
import { Send, Activity, Wifi, Home, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SessionManagement from "./components/SessionManagement";
import StartMessaging from "./components/StartMessaging";
import DeliveryLogs from "./components/DeliveryLogs";
import Reports from "./components/Reports";
import DashboardContent from "./components/DashboardContent";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000");

function MainApp({ initialMenu = "sessions" }) {
	const [activeMenu, setActiveMenu] = useState(initialMenu);
	const [sessions, setSessions] = useState([]);
	const [selectedSession, setSelectedSession] = useState(null);
	const [logs, setLogs] = useState([]);
	const [sendingStatus, setSendingStatus] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		loadSessions();

		// Socket connection status
		socket.on("connect", () => {
			console.log("Socket connected:", socket.id);
		});

		socket.on("disconnect", () => {
			console.log("Socket disconnected");
		});

		// Socket listeners
		socket.on("qr", (data) => {
			console.log("QR code received:", data.sessionId);
			setSessions((prev) =>
				prev.map((s) =>
					s.id === data.sessionId
						? { ...s, qr: data.qr, status: "qr_ready" }
						: s
				)
			);
		});

		socket.on("pairing_code", (data) => {
			console.log("Pairing code received:", data.sessionId, data.code);
			setSessions((prev) =>
				prev.map((s) =>
					s.id === data.sessionId
						? { ...s, pairingCode: data.code, status: "pairing_code_ready" }
						: s
				)
			);
		});

		socket.on("session_connected", (data) => {
			console.log("Session connected:", data.sessionId);
			setSessions((prev) =>
				prev.map((s) =>
					s.id === data.sessionId
						? { ...s, status: "connected", user: data.user }
						: s
				)
			);
		});

		socket.on("session_closed", (data) => {
			loadSessions();
		});

		socket.on("session_deleted", (data) => {
			loadSessions();
		});

		socket.on("message_sent", (data) => {
			setLogs((prev) => [data.log, ...prev]);
			setSendingStatus(data.progress);
		});

		socket.on("message_failed", (data) => {
			setLogs((prev) => [data.log, ...prev]);
			setSendingStatus(data.progress);
		});

		socket.on("batch_pause", (data) => {
			console.log(`🛑 Taking ${data.duration}s break to avoid detection`);
			// You can display this in a toast/notification if desired
		});

		socket.on("sending_completed", (data) => {
			setSendingStatus(data.finalStatus);
			// Reset sending state after completion
			setTimeout(() => {
				setSendingStatus(null);
			}, 3000); // Show final status for 3 seconds
		});

		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("qr");
			socket.off("pairing_code");
			socket.off("session_connected");
			socket.off("session_closed");
			socket.off("session_deleted");
			socket.off("message_sent");
			socket.off("message_failed");
			socket.off("batch_pause");
			socket.off("sending_completed");
		};
	}, []);

	const loadSessions = async () => {
		try {
			console.log("Loading sessions...");
			const response = await axios.get("/api/sessions/list");
			console.log("Sessions loaded:", response.data.sessions);
			setSessions(response.data.sessions);
		} catch (error) {
			console.error("Failed to load sessions:", error);
		}
	};

	const menuItems = [
		{ id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
		{
			id: "sessions",
			label: "Session Management",
			icon: Wifi,
			path: "/sessions",
		},
		{
			id: "messaging",
			label: "Start Messaging",
			icon: Send,
			path: "/messaging",
		},
		{ id: "logs", label: "Delivery Logs", icon: Activity, path: "/logs" },
		{ id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
	];

	const handleMenuClick = (item) => {
		setActiveMenu(item.id);
		navigate(item.path);
	};

	return (
		<div className="app">
			<div className="sidebar">
				<div className="sidebar-header">
					<h1>WhatsApp Bulk</h1>
					<p>Messaging Application</p>
				</div>
				{menuItems.map((item) => (
					<div
						key={item.id}
						className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
						onClick={() => handleMenuClick(item)}
					>
						<item.icon />
						<span>{item.label}</span>
					</div>
				))}
			</div>

			<div className="main-content">
				{activeMenu === "dashboard" && <DashboardContent />}
				{activeMenu === "sessions" && (
					<SessionManagement
						sessions={sessions}
						selectedSession={selectedSession}
						setSelectedSession={setSelectedSession}
						onRefresh={loadSessions}
					/>
				)}
				{activeMenu === "messaging" && (
					<StartMessaging
						sessions={sessions}
						selectedSession={selectedSession}
						setSelectedSession={setSelectedSession}
						sendingStatus={sendingStatus}
						setSendingStatus={setSendingStatus}
					/>
				)}
				{activeMenu === "logs" && <DeliveryLogs logs={logs} />}
				{activeMenu === "reports" && <Reports />}
			</div>
		</div>
	);
}

export default MainApp;
