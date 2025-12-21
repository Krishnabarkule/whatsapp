import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import CSVUploader from "../components/CSVUploader";
import ChatPreview from "../components/ChatPreview";
import api from "../api/client";

interface Session {
	name: string;
	active: boolean;
	authenticated: boolean;
}

const SendMessages: React.FC = () => {
	// Session & Quick Send State
	const [sessions, setSessions] = useState<Session[]>([]);
	const [selectedSession, setSelectedSession] = useState<string>("default");
	const [sessionReady, setSessionReady] = useState(false);
	const [phone, setPhone] = useState("");
	const [text, setText] = useState("");
	const [media, setMedia] = useState<File | null>(null);
	const [mediaPath, setMediaPath] = useState<string | null>(null);
	const [sending, setSending] = useState(false);
	const [sendStatus, setSendStatus] = useState<string | null>(null);
	const [sentCount, setSentCount] = useState(0);
	const [dailyLimit, setDailyLimit] = useState(50);

	// CSV Upload State
	const [previewRows, setPreviewRows] = useState<any[]>([]);
	const [mapping, setMapping] = useState<{ phone: string; text?: string }>({
		phone: "",
	});
	const [textTemplate, setTextTemplate] = useState("");

	// Load sessions and check status on mount
	useEffect(() => {
		loadSessions();
		const interval = setInterval(loadSessions, 3000);
		return () => clearInterval(interval);
	}, []);

	const loadSessions = async () => {
		try {
			const { data } = await api.get("/api/sessions/list");
			setSessions(data.sessions || []);
			const selected = data.sessions?.find(
				(s: Session) => s.name === selectedSession
			);
			setSessionReady(selected?.authenticated || false);
		} catch {
			setSessionReady(false);
		}
	};

	const uploadMedia = async (file: File) => {
		const form = new FormData();
		form.append("file", file);
		try {
			const { data } = await api.post("/api/messages/upload", form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setMediaPath(data.filePath);
			setSendStatus(`Media uploaded: ${data.fileName}`);
		} catch (err: any) {
			setSendStatus(err.response?.data?.message || "Upload failed");
		}
	};

	const sendMessage = async () => {
		if (!phone || (!text && !mediaPath)) {
			setSendStatus("Phone and message/media required");
			return;
		}
		if (!sessionReady) {
			setSendStatus(
				`WhatsApp session "${selectedSession}" not authenticated. Go to Sessions and scan the QR.`
			);
			return;
		}
		setSending(true);
		setSendStatus(null);
		try {
			const { data } = await api.post("/api/messages/send", {
				to: phone,
				text: text || undefined,
				mediaPath: mediaPath || undefined,
				sessionName: selectedSession,
			});
			setSendStatus(`✓ Sent to ${phone} (${data.sent}/${data.limit} today)`);
			setSentCount(data.sent);
			setDailyLimit(data.limit);
			setPhone("");
			setText("");
			setMedia(null);
			setMediaPath(null);
		} catch (err: any) {
			setSendStatus(err.response?.data?.message || "Send failed");
		} finally {
			setSending(false);
		}
	};

	const onCsv = async (file: File) => {
		const form = new FormData();
		form.append("file", file);
		const { data } = await api.post("/api/messages/csv/preview", form, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		setPreviewRows(data.sample);
	};

	const importCsv = async (file: File) => {
		const form = new FormData();
		form.append("file", file);
		form.append("mapping", JSON.stringify(mapping) as any);
		form.append("userId", "me");
		await api.post("/api/messages/csv/import", form, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		alert("Imported successfully");
	};

	return (
		<div>
			<Topbar title="Send Messages" />
			<div className="content">
				{/* Session Selector */}
				<div className="card" style={{ marginBottom: 16 }}>
					<h3 style={{ marginTop: 0 }}>Select Session</h3>
					<select
						className="input"
						value={selectedSession}
						onChange={(e) => {
							setSelectedSession(e.target.value);
							const selected = sessions.find((s) => s.name === e.target.value);
							setSessionReady(selected?.authenticated || false);
						}}
					>
						{sessions.map((s) => (
							<option key={s.name} value={s.name}>
								{s.name}
								{s.authenticated ? " ✓" : ""}
							</option>
						))}
					</select>
					<small style={{ display: "block", marginTop: 6, color: "#666" }}>
						Select a session to use for sending messages
					</small>
				</div>

				{/* Session Status */}
				<div
					className="card"
					style={{
						backgroundColor: sessionReady ? "#d4edda" : "#fff3cd",
						borderLeft: `4px solid ${sessionReady ? "#28a745" : "#ffc107"}`,
						marginBottom: 16,
					}}
				>
					<strong>
						Session "{selectedSession}":{" "}
						{sessionReady ? "✓ Ready to Send" : "⚠ Not Authenticated"}
					</strong>
					{!sessionReady && (
						<p style={{ margin: "8px 0 0", fontSize: 14 }}>
							Go to Sessions page, select "{selectedSession}", and scan the QR
							code
						</p>
					)}
				</div>

				{/* Quick Send */}
				<div className="card" style={{ marginBottom: 16 }}>
					<h3>Send Single Message</h3>
					<div style={{ display: "grid", gap: 10 }}>
						<input
							className="input"
							placeholder="Phone number (e.g., +1234567890)"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							disabled={!sessionReady}
						/>
						<textarea
							className="input"
							rows={4}
							placeholder="Message text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							disabled={!sessionReady}
						/>
						<div>
							<label style={{ display: "block", marginBottom: 6 }}>
								Upload Media (optional):
							</label>
							<input
								type="file"
								className="input"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										setMedia(file);
										uploadMedia(file);
									}
								}}
								disabled={!sessionReady}
							/>
							{mediaPath && (
								<p style={{ margin: "6px 0", fontSize: 13, color: "#28a745" }}>
									✓ Media ready
								</p>
							)}
						</div>
						{sendStatus && (
							<div
								style={{
									color: sendStatus.includes("✓")
										? "var(--color-success)"
										: "var(--color-danger)",
									fontSize: 13,
									padding: "8px",
									backgroundColor: sendStatus.includes("✓")
										? "#f0f8f4"
										: "#fef5f5",
									borderRadius: 4,
								}}
							>
								{sendStatus}
							</div>
						)}
						<button
							className="btn"
							onClick={sendMessage}
							disabled={!sessionReady || sending || (!text && !mediaPath)}
							style={{
								opacity:
									!sessionReady || sending || (!text && !mediaPath) ? 0.6 : 1,
							}}
						>
							{sending ? "Sending..." : "Send Message"}
						</button>
						{sentCount > 0 && (
							<small style={{ color: "#666" }}>
								Sent {sentCount}/{dailyLimit} messages today
							</small>
						)}
					</div>
				</div>

				{/* CSV Bulk Upload */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "2fr 1fr",
						gap: 16,
					}}
				>
					<div className="card">
						<h3>CSV Bulk Upload</h3>
						<CSVUploader onFile={onCsv} />
						{previewRows.length > 0 && (
							<>
								<div style={{ marginTop: 12 }}>
									<strong>Column Mapping</strong>
									<div style={{ display: "grid", gap: 6, marginTop: 8 }}>
										<input
											className="input"
											placeholder="Phone column name (e.g. phone)"
											value={mapping.phone}
											onChange={(e) =>
												setMapping({ ...mapping, phone: e.target.value })
											}
										/>
										<input
											className="input"
											placeholder="Text column name (optional)"
											value={mapping.text || ""}
											onChange={(e) =>
												setMapping({ ...mapping, text: e.target.value })
											}
										/>
									</div>
								</div>
								<div style={{ marginTop: 12 }}>
									<strong>Compose Message</strong>
									<textarea
										className="input"
										rows={5}
										placeholder="Type your message..."
										value={textTemplate}
										onChange={(e) => setTextTemplate(e.target.value)}
									/>
								</div>
								<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
									<CSVUploader onFile={importCsv} />
								</div>
							</>
						)}
					</div>
					<div className="card">
						<h3>Live Preview</h3>
						<ChatPreview text={textTemplate} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default SendMessages;
