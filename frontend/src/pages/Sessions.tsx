import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api from "../api/client";

interface Session {
	name: string;
	active: boolean;
	hasQr: boolean;
	authenticated: boolean;
}

const Sessions: React.FC = () => {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [selectedSession, setSelectedSession] = useState<string>("default");
	const [qr, setQr] = useState<string | null>(null);
	const [polling, setPolling] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	const start = async () => {
		setLoading(true);
		setError(null);
		setStatus(null);
		try {
			const response = await api.post(`/api/sessions/start/${selectedSession}`);
			setStatus(`Session "${selectedSession}" started. Waiting for QR code...`);
			setPolling(true);
			// Update sessions list
			setSessions((prev) =>
				prev.map((s) =>
					s.name === selectedSession ? { ...s, active: true } : s
				)
			);
		} catch (err: any) {
			setError(
				err.response?.data?.message || "Failed to start session. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const stop = async () => {
		setLoading(true);
		setError(null);
		setStatus(null);
		try {
			await api.post(`/api/sessions/stop/${selectedSession}`);
			setStatus(`Session "${selectedSession}" stopped.`);
			setQr(null);
			setPolling(false);
			setSessions((prev) =>
				prev.map((s) =>
					s.name === selectedSession
						? { ...s, active: false, hasQr: false, authenticated: false }
						: s
				)
			);
		} catch (err: any) {
			setError(
				err.response?.data?.message || "Failed to stop session. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const createSession = async () => {
		const name = prompt("Enter session name (e.g., 'WhatsApp 1'):");
		if (!name) return;
		setLoading(true);
		setError(null);
		try {
			await api.post(`/api/sessions/create/${name}`);
			setSessions((prev) => [
				...prev,
				{ name, active: false, hasQr: false, authenticated: false },
			]);
			setSelectedSession(name);
			setStatus(`Session "${name}" created successfully!`);
		} catch (err: any) {
			setError(
				err.response?.data?.message || "Failed to create session. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const deleteSession = async (name: string) => {
		if (!confirm(`Delete session "${name}"?`)) return;
		setLoading(true);
		setError(null);
		try {
			await api.post(`/api/sessions/delete/${name}`);
			setSessions((prev) => prev.filter((s) => s.name !== name));
			if (selectedSession === name) {
				setSelectedSession(
					sessions.find((s) => s.name !== name)?.name || "default"
				);
			}
			setStatus(`Session "${name}" deleted.`);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to delete session.");
		} finally {
			setLoading(false);
		}
	};

	// Poll for QR and session status
	useEffect(() => {
		let timer: any;
		const tick = async () => {
			try {
				const { data } = await api.get(`/api/sessions/qr/${selectedSession}`);
				setQr(data.qr || null);
				setSessions((prev) =>
					prev.map((s) =>
						s.name === selectedSession
							? {
									...s,
									hasQr: !!data.qr,
									authenticated: !data.qr && s.active,
							  }
							: s
					)
				);
			} catch {}
		};
		if (polling) {
			tick();
			timer = setInterval(tick, 2000);
		}
		return () => timer && clearInterval(timer);
	}, [polling, selectedSession]);

	// Load sessions on mount
	useEffect(() => {
		const loadSessions = async () => {
			try {
				const { data } = await api.get("/api/sessions/list");
				setSessions(
					data.sessions || [
						{
							name: "default",
							active: false,
							hasQr: false,
							authenticated: false,
						},
					]
				);
			} catch (err: any) {
				// If no sessions or error, initialize with default
				setSessions([
					{
						name: "default",
						active: false,
						hasQr: false,
						authenticated: false,
					},
				]);
				if (err?.response?.status === 401) {
					setError("Please log in first");
				}
			}
		};
		loadSessions();
	}, []);

	return (
		<div>
			<Topbar title="Sessions" />
			<div className="content">
				{/* Session Selector */}
				<div className="card" style={{ marginBottom: 16 }}>
					<h3 style={{ marginTop: 0 }}>Select Session</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr auto auto",
							gap: 8,
							alignItems: "center",
						}}
					>
						<select
							className="input"
							value={selectedSession}
							onChange={(e) => {
								setSelectedSession(e.target.value);
								setQr(null);
								setPolling(false);
								setError(null);
								setStatus(null);
							}}
							disabled={loading}
						>
							{sessions.map((s) => (
								<option key={s.name} value={s.name}>
									{s.name}
									{s.authenticated ? " ✓" : ""}
									{s.hasQr ? " (scanning)" : ""}
								</option>
							))}
						</select>
						<button
							className="btn"
							onClick={createSession}
							disabled={loading}
							title="Create a new session"
						>
							+ New Session
						</button>
						{selectedSession !== "default" && (
							<button
								className="btn secondary"
								onClick={() => deleteSession(selectedSession)}
								disabled={loading}
								title="Delete this session"
							>
								🗑️ Delete
							</button>
						)}
					</div>
				</div>

				{/* Session Status */}
				{sessions.find((s) => s.name === selectedSession) && (
					<div
						className="card"
						style={{
							backgroundColor: sessions.find((s) => s.name === selectedSession)
								?.authenticated
								? "#d4edda"
								: "#fff3cd",
							borderLeft: `4px solid ${
								sessions.find((s) => s.name === selectedSession)?.authenticated
									? "#28a745"
									: "#ffc107"
							}`,
							marginBottom: 16,
						}}
					>
						<strong>
							Status:{" "}
							{sessions.find((s) => s.name === selectedSession)?.authenticated
								? "✓ Authenticated"
								: sessions.find((s) => s.name === selectedSession)?.active
								? "⏳ Waiting for QR scan..."
								: "❌ Not authenticated"}
						</strong>
					</div>
				)}

				{/* Errors and Status Messages */}
				{error && (
					<div
						className="card"
						style={{
							backgroundColor: "#f8d7da",
							borderLeft: "4px solid #dc3545",
							marginBottom: 16,
							color: "#721c24",
						}}
					>
						{error}
					</div>
				)}
				{status && (
					<div
						className="card"
						style={{
							backgroundColor: "#d4edda",
							borderLeft: "4px solid #28a745",
							marginBottom: 16,
							color: "#155724",
						}}
					>
						{status}
					</div>
				)}

				{/* Control Buttons */}
				<div className="card" style={{ marginBottom: 16 }}>
					<h3 style={{ marginTop: 0 }}>Controls</h3>
					<div style={{ display: "flex", gap: 8 }}>
						<button
							className="btn"
							onClick={start}
							disabled={
								loading ||
								sessions.find((s) => s.name === selectedSession)?.active
							}
							style={{
								opacity:
									loading ||
									sessions.find((s) => s.name === selectedSession)?.active
										? 0.6
										: 1,
							}}
						>
							{loading ? "Starting..." : "Start Session"}
						</button>
						<button
							className="btn secondary"
							onClick={stop}
							disabled={
								loading ||
								!sessions.find((s) => s.name === selectedSession)?.active
							}
							style={{
								opacity:
									loading ||
									!sessions.find((s) => s.name === selectedSession)?.active
										? 0.6
										: 1,
							}}
						>
							{loading ? "Stopping..." : "Stop Session"}
						</button>
					</div>
				</div>

				{/* QR Code Display */}
				{qr && (
					<div className="card" style={{ marginTop: 12 }}>
						<h4 style={{ marginTop: 0 }}>📱 Scan this QR in WhatsApp</h4>
						<p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#666" }}>
							Open WhatsApp → Settings → Linked devices → Link a device → Scan
							this QR
						</p>
						<img
							alt="WhatsApp QR"
							src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
								qr
							)}`}
							width={280}
							height={280}
							style={{ borderRadius: 8 }}
						/>
					</div>
				)}

				{/* Sessions List */}
				{sessions.length > 0 && (
					<div className="card" style={{ marginTop: 16 }}>
						<h3 style={{ marginTop: 0 }}>All Sessions</h3>
						<div style={{ display: "grid", gap: 8 }}>
							{sessions.map((s) => (
								<div
									key={s.name}
									style={{
										padding: 12,
										backgroundColor:
											selectedSession === s.name
												? "#f0f7ff"
												: s.authenticated
												? "#f0f8f4"
												: "#fafafa",
										border:
											selectedSession === s.name
												? "2px solid #007bff"
												: "1px solid #ddd",
										borderRadius: 6,
										cursor: "pointer",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
									onClick={() => setSelectedSession(s.name)}
								>
									<div>
										<strong>{s.name}</strong>
										<div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
											{s.authenticated
												? "✓ Ready to send"
												: "⚠ Not authenticated"}
										</div>
									</div>
									<div style={{ fontSize: 18 }}>
										{s.authenticated ? "✓" : s.hasQr ? "⏳" : "❌"}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Sessions;
