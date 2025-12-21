import { useState, useEffect } from "react";
import { Send, Activity, Wifi, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SessionManagement from "./components/SessionManagement";
import StartMessaging from "./components/StartMessaging";
import DeliveryLogs from "./components/DeliveryLogs";
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

		// Socket listeners
		socket.on("qr", (data) => {
			setSessions((prev) =>
				prev.map((s) =>
					s.id === data.sessionId
						? { ...s, qr: data.qr, status: "qr_ready" }
						: s
				)
			);
		});

		socket.on("pairing_code", (data) => {
			setSessions((prev) =>
				prev.map((s) =>
					s.id === data.sessionId
						? { ...s, pairingCode: data.code, status: "pairing_code_ready" }
						: s
				)
			);
		});

		socket.on("session_connected", (data) => {
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

		socket.on("sending_completed", (data) => {
			setSendingStatus(data.finalStatus);
		});

		return () => {
			socket.off("qr");
			socket.off("pairing_code");
			socket.off("session_connected");
			socket.off("session_closed");
			socket.off("session_deleted");
			socket.off("message_sent");
			socket.off("message_failed");
			socket.off("sending_completed");
		};
	}, []);

	const loadSessions = async () => {
		try {
			const response = await axios.get("/api/sessions/list");
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
	];

	const handleMenuClick = (item) => {
		if (item.id === "dashboard") {
			navigate("/dashboard");
		} else {
			setActiveMenu(item.id);
			navigate(item.path);
		}
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
			</div>
		</div>
	);
}

export default MainApp;
