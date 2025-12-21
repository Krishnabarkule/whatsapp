import { useState } from "react";
import {
	Send,
	Upload,
	FileText,
	Image as ImageIcon,
	Video,
	Music,
	Eye,
	X,
	Pause,
	Play,
	Square,
	CheckCircle,
	XCircle,
} from "lucide-react";
import axios from "axios";

export default function StartMessaging({
	sessions,
	selectedSession,
	setSelectedSession,
	sendingStatus,
	setSendingStatus,
}) {
	// CSV Upload State
	const [csvFile, setCsvFile] = useState(null);
	const [contacts, setContacts] = useState([]);
	const [csvLoading, setCsvLoading] = useState(false);

	// Template State
	const [template, setTemplate] = useState("");
	const [showPreview, setShowPreview] = useState(false);

	// Media State
	const [mediaFile, setMediaFile] = useState(null);
	const [mediaPreview, setMediaPreview] = useState(null);

	// Sending State
	const [currentQueueId, setCurrentQueueId] = useState(null);
	const [sending, setSending] = useState(false);

	// Current Step
	const [currentStep, setCurrentStep] = useState(1);

	// CSV Upload Handler
	const handleCSVChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			if (!selectedFile.name.endsWith(".csv")) {
				alert("Please select a CSV file");
				return;
			}
			setCsvFile(selectedFile);
		}
	};

	const handleCSVUpload = async () => {
		if (!csvFile) {
			alert("Please select a file first");
			return;
		}

		if (!selectedSession) {
			alert("Please select a session first");
			return;
		}

		setCsvLoading(true);
		const formData = new FormData();
		formData.append("csv", csvFile);

		try {
			const response = await axios.post("/api/csv/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setContacts(response.data.contacts);
			setCurrentStep(2);
			alert(`Successfully loaded ${response.data.count} contacts!`);
		} catch (error) {
			alert(
				"Failed to upload CSV: " +
					(error.response?.data?.error || error.message)
			);
		} finally {
			setCsvLoading(false);
		}
	};

	// Template Handlers
	const getAvailableVariables = () => {
		if (contacts.length === 0) return [];
		return Object.keys(contacts[0]);
	};

	const insertVariable = (variable) => {
		setTemplate((prev) => prev + `{{${variable}}}`);
	};

	const generatePreview = () => {
		if (contacts.length === 0 || !template) return "No preview available";
		const sampleContact = contacts[0];
		let preview = template;
		Object.keys(sampleContact).forEach((key) => {
			const regex = new RegExp(`{{${key}}}`, "g");
			preview = preview.replace(regex, sampleContact[key]);
		});
		return preview;
	};

	// Media Handlers
	const handleMediaChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setMediaFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setMediaPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleMediaRemove = () => {
		setMediaFile(null);
		setMediaPreview(null);
	};

	const getFileIcon = () => {
		if (!mediaFile) return <ImageIcon size={24} />;
		if (mediaFile.type.startsWith("image/")) return <ImageIcon size={24} />;
		if (mediaFile.type.startsWith("video/")) return <Video size={24} />;
		if (mediaFile.type.startsWith("audio/")) return <Music size={24} />;
		return <ImageIcon size={24} />;
	};

	// Sending Handlers
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
			setCurrentStep(4);
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
				<h2>Start Messaging</h2>
				<p>Upload contacts, create template, and send bulk messages</p>
			</div>

			{/* Session Selection */}
			<div className="card" style={{ marginBottom: "20px" }}>
				<div className="card-header">
					<h3>Select WhatsApp Session</h3>
				</div>
				<div style={{ padding: "20px" }}>
					<div className="form-group">
						<label>Connected Session</label>
						<select
							value={selectedSession || ""}
							onChange={(e) => setSelectedSession(e.target.value)}
							style={{ width: "100%", padding: "12px", fontSize: "14px" }}
						>
							<option value="">-- Select a session --</option>
							{sessions
								.filter((s) => s.status === "connected")
								.map((session) => (
									<option key={session.id} value={session.id}>
										{session.id} -{" "}
										{session.user?.name || session.user?.id || "Connected"}
									</option>
								))}
						</select>
						{sessions.filter((s) => s.status === "connected").length === 0 && (
							<small
								style={{
									color: "#e74c3c",
									display: "block",
									marginTop: "10px",
								}}
							>
								⚠️ No connected sessions. Go to "Session Management" to connect
								WhatsApp first.
							</small>
						)}
					</div>
				</div>
			</div>

			{/* Progress Steps */}
			<div style={{ marginBottom: "30px" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					{[1, 2, 3, 4].map((step) => (
						<div key={step} style={{ flex: 1, textAlign: "center" }}>
							<div
								style={{
									width: "40px",
									height: "40px",
									borderRadius: "50%",
									background: currentStep >= step ? "#3498db" : "#ecf0f1",
									color: currentStep >= step ? "white" : "#7f8c8d",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									fontWeight: "600",
									marginBottom: "10px",
								}}
							>
								{step}
							</div>
							<div style={{ fontSize: "13px", color: "#7f8c8d" }}>
								{step === 1 && "Upload CSV"}
								{step === 2 && "Create Template"}
								{step === 3 && "Attach Media"}
								{step === 4 && "Send Messages"}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Step 1: CSV Upload */}
			<div className="card" style={{ marginBottom: "20px" }}>
				<div className="card-header">
					<h3>Step 1: Upload CSV</h3>
					{contacts.length > 0 && (
						<span style={{ color: "#27ae60", fontSize: "14px" }}>
							✓ {contacts.length} contacts loaded
						</span>
					)}
				</div>

				{!selectedSession && (
					<div
						style={{
							padding: "20px",
							background: "#fff3cd",
							color: "#856404",
							borderRadius: "8px",
							marginBottom: "20px",
						}}
					>
						⚠️ Please select a connected session first
					</div>
				)}

				<div style={{ padding: "20px" }}>
					<input
						type="file"
						accept=".csv"
						onChange={handleCSVChange}
						className="file-input"
						id="csv-file"
						disabled={!selectedSession}
					/>
					<label htmlFor="csv-file" className="file-label">
						<Upload size={20} />
						{csvFile ? csvFile.name : "Choose CSV File"}
					</label>

					{csvFile && (
						<button
							className="btn btn-primary"
							onClick={handleCSVUpload}
							disabled={csvLoading || !selectedSession}
							style={{ marginLeft: "10px" }}
						>
							{csvLoading ? "Uploading..." : "Upload & Continue"}
						</button>
					)}

					<p style={{ marginTop: "15px", fontSize: "13px", color: "#7f8c8d" }}>
						CSV should contain: phone, name, and any custom fields
					</p>
				</div>
			</div>

			{/* Step 2: Template Editor */}
			{currentStep >= 2 && (
				<div className="card" style={{ marginBottom: "20px" }}>
					<div className="card-header">
						<h3>Step 2: Create Template</h3>
						<button
							className="btn btn-primary"
							onClick={() => setShowPreview(!showPreview)}
						>
							<Eye size={18} />
							{showPreview ? "Hide" : "Preview"}
						</button>
					</div>

					<div style={{ padding: "20px" }}>
						<textarea
							value={template}
							onChange={(e) => setTemplate(e.target.value)}
							placeholder="Type your message here... Use {{variable}} for dynamic content"
							style={{ minHeight: "150px" }}
						/>
						<small
							style={{ color: "#7f8c8d", display: "block", marginTop: "5px" }}
						>
							Use double curly braces: {"{{name}}"}, {"{{phone}}"}
						</small>

						{getAvailableVariables().length > 0 && (
							<div style={{ marginTop: "15px" }}>
								<h4 style={{ marginBottom: "10px", fontSize: "14px" }}>
									Available Variables:
								</h4>
								<div className="flex gap-2" style={{ flexWrap: "wrap" }}>
									{getAvailableVariables().map((variable) => (
										<button
											key={variable}
											className="btn"
											style={{
												background: "#ecf0f1",
												color: "#2c3e50",
												padding: "5px 12px",
												fontSize: "13px",
											}}
											onClick={() => insertVariable(variable)}
										>
											{"{{" + variable + "}}"}
										</button>
									))}
								</div>
							</div>
						)}

						{showPreview && template && (
							<div
								style={{
									marginTop: "20px",
									padding: "15px",
									background: "#f8f9fa",
									borderRadius: "8px",
								}}
							>
								<h4 style={{ marginBottom: "10px", fontSize: "14px" }}>
									Preview (first contact):
								</h4>
								<div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
									{generatePreview()}
								</div>
							</div>
						)}

						{template && (
							<button
								className="btn btn-primary"
								onClick={() => setCurrentStep(3)}
								style={{ marginTop: "15px" }}
							>
								Continue to Media
							</button>
						)}
					</div>
				</div>
			)}

			{/* Step 3: Media Attachment */}
			{currentStep >= 3 && (
				<div className="card" style={{ marginBottom: "20px" }}>
					<div className="card-header">
						<h3>Step 3: Attach Media (Optional)</h3>
					</div>

					<div style={{ padding: "20px" }}>
						{!mediaFile ? (
							<div>
								<input
									type="file"
									accept="image/*,video/*,audio/*"
									onChange={handleMediaChange}
									className="file-input"
									id="media-file"
								/>
								<label htmlFor="media-file" className="file-label">
									<Upload size={20} />
									Choose Media File
								</label>
								<p
									style={{
										marginTop: "10px",
										fontSize: "13px",
										color: "#7f8c8d",
									}}
								>
									Supported: Images, Videos, Audio (optional)
								</p>
							</div>
						) : (
							<div
								style={{
									padding: "15px",
									background: "#f8f9fa",
									borderRadius: "8px",
								}}
							>
								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										{getFileIcon()}
										<div>
											<div style={{ fontWeight: "600" }}>{mediaFile.name}</div>
											<div style={{ fontSize: "13px", color: "#7f8c8d" }}>
												{(mediaFile.size / 1024 / 1024).toFixed(2)} MB
											</div>
										</div>
									</div>
									<button
										className="btn btn-danger"
										onClick={handleMediaRemove}
										style={{ padding: "8px 16px" }}
									>
										<X size={18} />
										Remove
									</button>
								</div>

								{mediaPreview && mediaFile.type.startsWith("image/") && (
									<img
										src={mediaPreview}
										alt="Preview"
										style={{
											marginTop: "15px",
											maxWidth: "100%",
											maxHeight: "300px",
											borderRadius: "8px",
										}}
									/>
								)}
							</div>
						)}

						<button
							className="btn btn-primary"
							onClick={handleStartSending}
							style={{ marginTop: "15px" }}
							disabled={!template || contacts.length === 0}
						>
							<Send size={18} />
							Start Sending Messages
						</button>
					</div>
				</div>
			)}

			{/* Step 4: Sending Progress */}
			{currentStep >= 4 && sendingStatus && (
				<div className="card">
					<div className="card-header">
						<h3>Step 4: Sending Progress</h3>
					</div>

					<div style={{ padding: "20px" }}>
						{/* Real-time Status Badge */}
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
								padding: "8px 16px",
								borderRadius: "20px",
								fontSize: "13px",
								fontWeight: "600",
								marginBottom: "20px",
								background:
									sendingStatus.status === "sending"
										? "#fef3c7"
										: sendingStatus.status === "completed"
										? "#d1fae5"
										: sendingStatus.status === "paused"
										? "#fee2e2"
										: "#f3f4f6",
								color:
									sendingStatus.status === "sending"
										? "#f59e0b"
										: sendingStatus.status === "completed"
										? "#10b981"
										: sendingStatus.status === "paused"
										? "#ef4444"
										: "#6b7280",
							}}
						>
							<span
								style={{
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									background:
										sendingStatus.status === "sending"
											? "#f59e0b"
											: sendingStatus.status === "completed"
											? "#10b981"
											: sendingStatus.status === "paused"
											? "#ef4444"
											: "#6b7280",
									animation:
										sendingStatus.status === "sending"
											? "pulse 1.5s infinite"
											: "none",
								}}
							/>
							{sendingStatus.status === "sending" && "🚀 Sending in Progress"}
							{sendingStatus.status === "completed" && "✅ Completed"}
							{sendingStatus.status === "paused" && "⏸️ Paused"}
							{sendingStatus.status === "stopped" && "🛑 Stopped"}
						</div>

						{/* Completion Message */}
						{sendingStatus.status === "completed" && (
							<div
								style={{
									padding: "20px",
									background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
									borderRadius: "12px",
									marginBottom: "20px",
									border: "2px solid #10b981",
									textAlign: "center",
								}}
							>
								<CheckCircle
									size={48}
									style={{ color: "#10b981", marginBottom: "10px" }}
								/>
								<h3 style={{ color: "#065f46", marginBottom: "8px" }}>
									🎉 All Messages Sent!
								</h3>
								<p style={{ color: "#047857", fontSize: "14px" }}>
									Successfully delivered {sendingStatus.sent} out of{" "}
									{sendingStatus.total} messages
								</p>
							</div>
						)}

						{/* Progress Bar with Animation */}
						<div style={{ marginBottom: "20px" }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginBottom: "10px",
									alignItems: "center",
								}}
							>
								<span style={{ fontWeight: "600", fontSize: "15px" }}>
									Overall Progress
								</span>
								<span
									style={{
										fontWeight: "700",
										fontSize: "18px",
										color: "#25d366",
									}}
								>
									{getProgressPercentage()}%
								</span>
							</div>
							<div className="progress-bar">
								<div
									className="progress-fill"
									style={{
										width: `${getProgressPercentage()}%`,
									}}
								>
									{getProgressPercentage()}%
								</div>
							</div>
							{/* Current Status Text */}
							<div
								style={{
									marginTop: "10px",
									textAlign: "center",
									fontSize: "13px",
									color: "#64748b",
									fontWeight: "500",
								}}
							>
								{sendingStatus.status === "sending" && (
									<>
										⏳ Sending message{" "}
										{sendingStatus.sent + sendingStatus.failed + 1} of{" "}
										{sendingStatus.total}...
									</>
								)}
								{sendingStatus.status === "paused" && (
									<>
										⏸️ Paused at message{" "}
										{sendingStatus.sent + sendingStatus.failed}
									</>
								)}
								{sendingStatus.status === "completed" && (
									<>✅ All {sendingStatus.total} messages have been processed</>
								)}
							</div>

							{/* Statistics Cards */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr 1fr",
									gap: "15px",
									marginBottom: "20px",
								}}
							>
								<div
									style={{
										textAlign: "center",
										padding: "15px",
										background: "#e8f5e9",
										borderRadius: "8px",
									}}
								>
									<div
										style={{
											fontSize: "24px",
											fontWeight: "600",
											color: "#27ae60",
										}}
									>
										{sendingStatus.sent}
									</div>
									<div style={{ fontSize: "13px", color: "#7f8c8d" }}>Sent</div>
								</div>
								<div
									style={{
										textAlign: "center",
										padding: "15px",
										background: "#ffebee",
										borderRadius: "8px",
									}}
								>
									<div
										style={{
											fontSize: "24px",
											fontWeight: "600",
											color: "#e74c3c",
										}}
									>
										{sendingStatus.failed}
									</div>
									<div style={{ fontSize: "13px", color: "#7f8c8d" }}>
										Failed
									</div>
								</div>
								<div
									style={{
										textAlign: "center",
										padding: "15px",
										background: "#e3f2fd",
										borderRadius: "8px",
									}}
								>
									<div
										style={{
											fontSize: "24px",
											fontWeight: "600",
											color: "#3498db",
										}}
									>
										{sendingStatus.total}
									</div>
									<div style={{ fontSize: "13px", color: "#7f8c8d" }}>
										Total
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							{sendingStatus.status === "sending" && (
								<button className="btn" onClick={handlePause}>
									<Pause size={18} />
									Pause
								</button>
							)}
							{sendingStatus.status === "paused" && (
								<button className="btn btn-primary" onClick={handleResume}>
									<Play size={18} />
									Resume
								</button>
							)}
							{(sendingStatus.status === "sending" ||
								sendingStatus.status === "paused") && (
								<button className="btn btn-danger" onClick={handleStop}>
									<Square size={18} />
									Stop
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
