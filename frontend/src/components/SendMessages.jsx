import { useState } from "react";
import { Send, Pause, Play, Square, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

export default function SendMessages({
	selectedSession,
	contacts,
	template,
	mediaFile,
	sendingStatus,
	setSendingStatus,
}) {
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [sending, setSending] = useState(false);

	const handleStartSending = async () => {
		if (!selectedSession) {
			alert("Please select a session first");
			return;
		}

		if (contacts.length === 0) {
			alert("Please upload a CSV file with contacts first");
			return;
		}

		if (!template) {
			alert("Please create a message template first");
			return;
		}

		if (!confirm(`Send messages to ${contacts.length} contacts?`)) {
			return;
		}

		setSending(true);

		try {
			const formData = new FormData();
			formData.append("sessionId", selectedSession);
			formData.append("contacts", JSON.stringify(contacts));
			formData.append("template", template);

			if (mediaFile) {
				formData.append("media", mediaFile);
			}

			const response = await axios.post("/api/messages/send-bulk", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setCurrentQueueId(response.data.queueId);
			alert("Bulk sending started!");
		} catch (error) {
			alert(
				"Failed to start sending: " +
					(error.response?.data?.error || error.message)
			);
			setSending(false);
		}
	};

	const handlePause = async () => {
		if (!currentQueueId) return;

		try {
			await axios.post(`/api/messages/pause/${currentQueueId}`);
		} catch (error) {
			alert("Failed to pause: " + error.message);
		}
	};

	const handleResume = async () => {
		if (!currentQueueId) return;

		try {
			await axios.post(`/api/messages/resume/${currentQueueId}`);
		} catch (error) {
			alert("Failed to resume: " + error.message);
		}
	};

	const handleStop = async () => {
		if (!currentQueueId) return;

		if (!confirm("Are you sure you want to stop sending?")) {
			return;
		}

		try {
			await axios.post(`/api/messages/stop/${currentQueueId}`);
			setSending(false);
			setCurrentQueueId(null);
		} catch (error) {
			alert("Failed to stop: " + error.message);
		}
	};

	const getProgressPercentage = () => {
		if (!sendingStatus || sendingStatus.total === 0) return 0;
		return Math.round(
			((sendingStatus.sent + sendingStatus.failed) / sendingStatus.total) * 100
		);
	};

	return (
		<div>
			<div className="content-header">
				<h2>Start Sending</h2>
				<p>Send bulk messages to your contacts</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Send Configuration</h3>
				</div>

				<div
					style={{
						padding: "20px",
						background: "#f8f9fa",
						borderRadius: "8px",
						marginBottom: "20px",
					}}
				>
					<h4 style={{ marginBottom: "15px" }}>Summary</h4>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "15px",
						}}
					>
						<div>
							<div
								style={{
									fontSize: "13px",
									color: "#7f8c8d",
									marginBottom: "5px",
								}}
							>
								Session
							</div>
							<div style={{ fontWeight: "600" }}>
								{selectedSession || "Not selected"}
							</div>
						</div>
						<div>
							<div
								style={{
									fontSize: "13px",
									color: "#7f8c8d",
									marginBottom: "5px",
								}}
							>
								Contacts
							</div>
							<div style={{ fontWeight: "600" }}>
								{contacts.length} contacts
							</div>
						</div>
						<div>
							<div
								style={{
									fontSize: "13px",
									color: "#7f8c8d",
									marginBottom: "5px",
								}}
							>
								Template
							</div>
							<div style={{ fontWeight: "600" }}>
								{template ? "Created" : "Not created"}
							</div>
						</div>
						<div>
							<div
								style={{
									fontSize: "13px",
									color: "#7f8c8d",
									marginBottom: "5px",
								}}
							>
								Media
							</div>
							<div style={{ fontWeight: "600" }}>
								{mediaFile ? mediaFile.name : "No media"}
							</div>
						</div>
					</div>
				</div>

				{!selectedSession || contacts.length === 0 || !template ? (
					<div
						style={{
							padding: "20px",
							background: "#fff3cd",
							borderRadius: "8px",
							color: "#856404",
							marginBottom: "20px",
						}}
					>
						<strong>⚠️ Missing Requirements:</strong>
						<ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
							{!selectedSession && <li>Select a WhatsApp session</li>}
							{contacts.length === 0 && <li>Upload CSV with contacts</li>}
							{!template && <li>Create a message template</li>}
						</ul>
					</div>
				) : null}

				<div className="flex gap-2">
					<button
						className="btn btn-success"
						onClick={handleStartSending}
						disabled={
							!selectedSession || contacts.length === 0 || !template || sending
						}
					>
						<Send size={18} />
						{sending ? "Sending..." : "Start Sending"}
					</button>

					{sendingStatus && sendingStatus.status === "running" && (
						<button className="btn btn-warning" onClick={handlePause}>
							<Pause size={18} />
							Pause
						</button>
					)}

					{sendingStatus && sendingStatus.status === "paused" && (
						<button className="btn btn-success" onClick={handleResume}>
							<Play size={18} />
							Resume
						</button>
					)}

					{sendingStatus &&
						(sendingStatus.status === "running" ||
							sendingStatus.status === "paused") && (
							<button className="btn btn-danger" onClick={handleStop}>
								<Square size={18} />
								Stop
							</button>
						)}
				</div>

				{sendingStatus && (
					<div className="progress-container">
						<div className="progress-bar">
							<div
								className="progress-fill"
								style={{ width: `${getProgressPercentage()}%` }}
							>
								{getProgressPercentage()}%
							</div>
						</div>

						<div className="progress-stats">
							<div className="stat">
								<div className="stat-value">{sendingStatus.total}</div>
								<div className="stat-label">Total</div>
							</div>
							<div className="stat">
								<div className="stat-value" style={{ color: "#2ecc71" }}>
									{sendingStatus.sent}
								</div>
								<div className="stat-label">Sent</div>
							</div>
							<div className="stat">
								<div className="stat-value" style={{ color: "#e74c3c" }}>
									{sendingStatus.failed}
								</div>
								<div className="stat-label">Failed</div>
							</div>
							<div className="stat">
								<div className="stat-value" style={{ color: "#3498db" }}>
									{sendingStatus.total -
										sendingStatus.sent -
										sendingStatus.failed}
								</div>
								<div className="stat-label">Remaining</div>
							</div>
						</div>

						<div
							style={{
								marginTop: "20px",
								padding: "15px",
								background:
									sendingStatus.status === "completed" ? "#d4edda" : "#e7f3ff",
								borderRadius: "8px",
								textAlign: "center",
							}}
						>
							<strong>Status: </strong>
							{sendingStatus.status === "running" && "Sending messages..."}
							{sendingStatus.status === "paused" && "⏸ Paused"}
							{sendingStatus.status === "stopped" && "⏹ Stopped"}
							{sendingStatus.status === "completed" && "✅ Completed!"}
						</div>
					</div>
				)}

				<div
					style={{
						marginTop: "30px",
						padding: "20px",
						background: "#e7f3ff",
						borderRadius: "8px",
					}}
				>
					<h4 style={{ marginBottom: "15px" }}>Sending Information</h4>
					<ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
						<li>
							Messages are sent with a 3-5 second delay between each contact
						</li>
						<li>This delay helps prevent your number from being blocked</li>
						<li>You can pause and resume sending at any time</li>
						<li>Invalid numbers will be skipped automatically</li>
						<li>Check Delivery Logs for detailed status of each message</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
