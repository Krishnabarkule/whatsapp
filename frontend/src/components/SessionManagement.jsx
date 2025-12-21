import { useState } from "react";
import {
	Plus,
	Trash2,
	QrCode,
	Smartphone,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import axios from "axios";

export default function SessionManagement({
	sessions,
	selectedSession,
	setSelectedSession,
	onRefresh,
}) {
	const [showModal, setShowModal] = useState(false);
	const [newSessionId, setNewSessionId] = useState("");
	const [connectionMethod, setConnectionMethod] = useState("qr");
	const [countryCode, setCountryCode] = useState("91");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [loading, setLoading] = useState(false);

	const handleCreateSession = async () => {
		if (!newSessionId) {
			alert("Please enter a session ID");
			return;
		}

		if (connectionMethod === "pairing" && !phoneNumber) {
			alert("Please enter a phone number");
			return;
		}

		// Validate phone number length
		if (connectionMethod === "pairing") {
			const cleanNumber = phoneNumber.replace(/\D/g, "");
			if (cleanNumber.length !== 10) {
				alert("Please enter a valid 10-digit phone number");
				return;
			}
		}

		setLoading(true);
		try {
			// Construct full phone number with country code
			const fullPhoneNumber =
				connectionMethod === "pairing"
					? countryCode + phoneNumber.replace(/\D/g, "")
					: null;

			await axios.post("/api/sessions/create", {
				sessionId: newSessionId,
				usePairingCode: connectionMethod === "pairing",
				phoneNumber: fullPhoneNumber,
			});

			setShowModal(false);
			setNewSessionId("");
			setPhoneNumber("");
			onRefresh();
		} catch (error) {
			alert(
				"Failed to create session: " +
					(error.response?.data?.error || error.message)
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteSession = async (sessionId) => {
		if (!confirm("Are you sure you want to delete this session?")) {
			return;
		}

		try {
			await axios.delete(`/api/sessions/${sessionId}`);
			if (selectedSession === sessionId) {
				setSelectedSession(null);
			}
			onRefresh();
		} catch (error) {
			alert(
				"Failed to delete session: " +
					(error.response?.data?.error || error.message)
			);
		}
	};

	return (
		<div>
			<div className="content-header">
				<h2>Session Management</h2>
				<p>Manage your WhatsApp sessions</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Active Sessions</h3>
					<button
						className="btn btn-primary"
						onClick={() => setShowModal(true)}
					>
						<Plus size={18} />
						Add New Session
					</button>
				</div>

				{sessions.length === 0 ? (
					<div className="empty-state">
						<Smartphone />
						<h3>No sessions available</h3>
						<p>Create a new session to get started</p>
					</div>
				) : (
					<div className="sessions-grid">
						{sessions.map((session) => (
							<div
								key={session.id}
								className={`session-card ${
									selectedSession === session.id ? "active" : ""
								}`}
								onClick={() => setSelectedSession(session.id)}
							>
								<div className="flex justify-between items-center mb-4">
									<span className={`session-status ${session.status}`}>
										{session.status === "connected" && (
											<CheckCircle size={14} />
										)}
										{session.status === "connecting" && (
											<AlertCircle size={14} />
										)}{" "}
										{session.status}
									</span>
									<button
										className="btn btn-danger"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteSession(session.id);
										}}
										style={{ padding: "6px 12px", fontSize: "12px" }}
									>
										<Trash2 size={14} />
									</button>
								</div>

								<h4 style={{ marginBottom: "10px", fontSize: "18px" }}>
									{session.id}
								</h4>

								{session.user && (
									<div style={{ fontSize: "14px", color: "#7f8c8d" }}>
										<p>{session.user.name}</p>
										<p>{session.user.id}</p>
									</div>
								)}

								{session.qr && (
									<div className="qr-container">
										<p style={{ fontSize: "14px", marginBottom: "10px" }}>
											Scan QR Code with WhatsApp
										</p>
										<img
											src={session.qr}
											alt="QR Code"
											style={{
												maxWidth: "250px",
												border: "2px solid #ddd",
												padding: "10px",
												borderRadius: "8px",
											}}
										/>
										<p
											style={{
												fontSize: "12px",
												color: "#7f8c8d",
												marginTop: "10px",
											}}
										>
											Open WhatsApp → Settings → Linked Devices → Link a Device
										</p>
									</div>
								)}

								{session.pairingCode && (
									<div style={{ textAlign: "center", marginTop: "10px" }}>
										<p style={{ fontSize: "14px", marginBottom: "10px" }}>
											Pairing Code
										</p>
										<div
											className="pairing-code"
											style={{ fontSize: "28px", letterSpacing: "8px" }}
										>
											{session.pairingCode}
										</div>
										<p
											style={{
												fontSize: "12px",
												color: "#7f8c8d",
												marginTop: "10px",
											}}
										>
											Enter this code in WhatsApp
											<br />
											Settings → Linked Devices → Link with phone number instead
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{showModal && (
				<div className="modal-overlay" onClick={() => setShowModal(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Create New Session</h3>
						</div>

						<div className="form-group">
							<label>Session ID</label>
							<input
								type="text"
								value={newSessionId}
								onChange={(e) => setNewSessionId(e.target.value)}
								placeholder="e.g., my-session-1"
							/>
						</div>

						<div className="form-group">
							<label>Connection Method</label>
							<select
								value={connectionMethod}
								onChange={(e) => setConnectionMethod(e.target.value)}
							>
								<option value="qr">QR Code</option>
								<option value="pairing">Pairing Code</option>
							</select>
						</div>

						{connectionMethod === "pairing" && (
							<>
								<div className="form-group">
									<label>Country Code</label>
									<select
										value={countryCode}
										onChange={(e) => setCountryCode(e.target.value)}
									>
										<option value="91">+91 (India)</option>
										<option value="1">+1 (USA/Canada)</option>
										<option value="44">+44 (UK)</option>
										<option value="971">+971 (UAE)</option>
										<option value="966">+966 (Saudi Arabia)</option>
										<option value="92">+92 (Pakistan)</option>
										<option value="880">+880 (Bangladesh)</option>
										<option value="94">+94 (Sri Lanka)</option>
									</select>
								</div>
								<div className="form-group">
									<label>Phone Number (10 digits)</label>
									<div
										style={{
											display: "flex",
											gap: "10px",
											alignItems: "center",
										}}
									>
										<span
											style={{
												padding: "12px 15px",
												background: "#ecf0f1",
												borderRadius: "8px",
												fontWeight: "600",
											}}
										>
											+{countryCode}
										</span>
										<input
											type="tel"
											value={phoneNumber}
											onChange={(e) => {
												const value = e.target.value.replace(/\D/g, "");
												if (value.length <= 10) {
													setPhoneNumber(value);
												}
											}}
											placeholder="9999999999"
											maxLength="10"
											style={{ flex: 1 }}
										/>
									</div>
									<small
										style={{
											color: "#7f8c8d",
											display: "block",
											marginTop: "5px",
										}}
									>
										Enter 10-digit mobile number (without country code)
									</small>
								</div>
							</>
						)}

						<div className="modal-actions">
							<button
								className="btn"
								onClick={() => setShowModal(false)}
								style={{ background: "#95a5a6" }}
							>
								Cancel
							</button>
							<button
								className="btn btn-primary"
								onClick={handleCreateSession}
								disabled={loading}
							>
								{loading ? "Creating..." : "Create Session"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
