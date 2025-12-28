import { useState, useEffect } from "react";
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

	// Auto-stop sending when completed
	useEffect(() => {
		if (sendingStatus?.status === "completed") {
			setSending(false);
		}
	}, [sendingStatus]);

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
		// Prevent duplicate calls
		if (sending) {
			console.log("Already sending, ignoring duplicate request");
			return;
		}

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
		console.log("Starting send to", contacts.length, "contacts");

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
			console.log("Send started with queueId:", response.data.queueId);
			alert("Bulk sending started!");
		} catch (error) {
			console.error("Failed to start sending:", error);
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

			{/* Anti-Blocking Warning Banner */}
			<div
				style={{
					padding: "15px 20px",
					background: "linear-gradient(135deg, #fff3cd, #ffeaa7)",
					border: "2px solid #f59e0b",
					borderRadius: "12px",
					marginBottom: "20px",
					boxShadow: "0 4px 6px rgba(245, 158, 11, 0.2)",
				}}
			>
				<div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
					<span style={{ fontSize: "24px" }}>⚠️</span>
					<div style={{ flex: 1 }}>
						<h4
							style={{
								color: "#92400e",
								marginBottom: "8px",
								fontSize: "16px",
								fontWeight: "700",
							}}
						>
							WhatsApp Anti-Ban Protection Active
						</h4>
						<ul
							style={{
								color: "#78350f",
								fontSize: "13px",
								lineHeight: "1.6",
								margin: 0,
								paddingLeft: "20px",
							}}
						>
							<li>
								✅ <strong>8-15 seconds</strong> delay between each message
							</li>
							<li>
								✅ <strong>30-60 seconds</strong> break every 10-15 messages
							</li>
							<li>
								✅ Maximum <strong>50-100 messages per hour</strong> recommended
							</li>
							<li>
								⚠️ Sending to 100+ contacts increases ban risk significantly
							</li>
						</ul>
						<p
							style={{
								marginTop: "10px",
								fontSize: "12px",
								color: "#78350f",
								fontWeight: "600",
								marginBottom: 0,
							}}
						>
							💡 Tip: For large campaigns, split contacts into smaller batches
							and send over multiple hours/days
						</p>
					</div>
				</div>
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
							disabled={!template || contacts.length === 0 || sending}
						>
							<Send size={18} />
							{sending ? "Sending..." : "Start Sending Messages"}
						</button>
					</div>
				</div>
			)}

			{/* Step 4: Sending Progress - Enhanced Real-time Tracker */}
			{currentStep >= 4 && sendingStatus && (
				<div
					className="card"
					style={{
						borderLeft:
							sendingStatus.status === "sending"
								? "4px solid #25d366"
								: sendingStatus.status === "completed"
								? "4px solid #10b981"
								: sendingStatus.status === "paused"
								? "4px solid #f59e0b"
								: "4px solid #6b7280",
					}}
				>
					<div
						className="card-header"
						style={{
							background:
								sendingStatus.status === "sending"
									? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
									: sendingStatus.status === "completed"
									? "linear-gradient(135deg, #bfdbfe, #93c5fd)"
									: "#f8fafc",
						}}
					>
						<h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							{sendingStatus.status === "sending" && "🚀"}
							{sendingStatus.status === "completed" && "✅"}
							{sendingStatus.status === "paused" && "⏸️"}
							{sendingStatus.status === "stopped" && "🛑"}
							Real-time Sending Progress
						</h3>
					</div>

					<div style={{ padding: "20px" }}>
						{/* Real-time Status Badge with Pulse Animation */}
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
								padding: "10px 20px",
								borderRadius: "25px",
								fontSize: "14px",
								fontWeight: "700",
								marginBottom: "20px",
								background:
									sendingStatus.status === "sending"
										? "linear-gradient(135deg, #fef3c7, #fde68a)"
										: sendingStatus.status === "completed"
										? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
										: sendingStatus.status === "paused"
										? "linear-gradient(135deg, #fee2e2, #fecaca)"
										: "#f3f4f6",
								color:
									sendingStatus.status === "sending"
										? "#f59e0b"
										: sendingStatus.status === "completed"
										? "#10b981"
										: sendingStatus.status === "paused"
										? "#ef4444"
										: "#6b7280",
								boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
								border:
									"2px solid " +
									(sendingStatus.status === "sending"
										? "#f59e0b"
										: sendingStatus.status === "completed"
										? "#10b981"
										: sendingStatus.status === "paused"
										? "#ef4444"
										: "#6b7280"),
							}}
						>
							<span
								style={{
									width: "10px",
									height: "10px",
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
							{sendingStatus.status === "sending" && "SENDING IN PROGRESS"}
							{sendingStatus.status === "completed" && "COMPLETED SUCCESSFULLY"}
							{sendingStatus.status === "paused" && "PAUSED"}
							{sendingStatus.status === "stopped" && "STOPPED"}
						</div>

						{/* Completion Message */}
						{sendingStatus.status === "completed" && (
							<div
								style={{
									padding: "25px",
									background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
									borderRadius: "15px",
									marginBottom: "25px",
									border: "3px solid #10b981",
									textAlign: "center",
									boxShadow: "0 8px 16px rgba(16, 185, 129, 0.2)",
								}}
							>
								<CheckCircle
									size={60}
									style={{ color: "#10b981", marginBottom: "15px" }}
								/>
								<h3
									style={{
										color: "#065f46",
										marginBottom: "12px",
										fontSize: "24px",
									}}
								>
									🎉 All Messages Sent Successfully!
								</h3>
								<p
									style={{
										color: "#047857",
										fontSize: "16px",
										marginBottom: "10px",
									}}
								>
									Successfully delivered <strong>{sendingStatus.sent}</strong>{" "}
									out of <strong>{sendingStatus.total}</strong> messages
								</p>
								<div
									style={{
										fontSize: "14px",
										color: "#065f46",
										marginTop: "12px",
										display: "flex",
										justifyContent: "center",
										gap: "20px",
										flexWrap: "wrap",
									}}
								>
									<span>
										✅ Success Rate:{" "}
										<strong>
											{sendingStatus.total > 0
												? Math.round(
														(sendingStatus.sent / sendingStatus.total) * 100
												  )
												: 0}
											%
										</strong>
									</span>
									{sendingStatus.failed > 0 && (
										<span>
											❌ Failed: <strong>{sendingStatus.failed}</strong>
										</span>
									)}
								</div>
							</div>
						)}

						{/* Live Progress Indicator */}
						{sendingStatus.status === "sending" && (
							<div
								style={{
									padding: "15px",
									background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
									borderRadius: "10px",
									marginBottom: "20px",
									border: "2px solid #3b82f6",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: "14px",
										color: "#1e40af",
										marginBottom: "8px",
										fontWeight: "600",
									}}
								>
									⏳ Currently Processing
								</div>
								<div
									style={{
										fontSize: "18px",
										color: "#1e3a8a",
										fontWeight: "700",
									}}
								>
									Message {sendingStatus.sent + sendingStatus.failed + 1} of{" "}
									{sendingStatus.total}
								</div>
							</div>
						)}

						{/* Enhanced Progress Bar with Percentage */}
						<div style={{ marginBottom: "25px" }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginBottom: "12px",
									alignItems: "center",
								}}
							>
								<span
									style={{
										fontWeight: "700",
										fontSize: "16px",
										color: "#1e293b",
									}}
								>
									Overall Progress
								</span>
								<span
									style={{
										fontWeight: "900",
										fontSize: "24px",
										color: "#25d366",
										textShadow: "0 2px 4px rgba(37, 211, 102, 0.3)",
									}}
								>
									{getProgressPercentage()}%
								</span>
							</div>

							{/* Main Progress Bar */}
							<div
								style={{
									height: "32px",
									background: "#e2e8f0",
									borderRadius: "20px",
									overflow: "hidden",
									position: "relative",
									boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								<div
									style={{
										height: "100%",
										width: `${getProgressPercentage()}%`,
										background:
											sendingStatus.status === "completed"
												? "linear-gradient(90deg, #10b981, #059669)"
												: "linear-gradient(90deg, #25d366, #128c7e)",
										borderRadius: "20px",
										transition: "width 0.5s ease-in-out",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "white",
										fontWeight: "700",
										fontSize: "14px",
										boxShadow: "0 2px 8px rgba(37, 211, 102, 0.4)",
										position: "relative",
										overflow: "hidden",
									}}
								>
									{getProgressPercentage() > 10 && (
										<span style={{ position: "relative", zIndex: 1 }}>
											{sendingStatus.sent + sendingStatus.failed} /{" "}
											{sendingStatus.total}
										</span>
									)}
									{sendingStatus.status === "sending" && (
										<div
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												background:
													"linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
												animation: "shimmer 2s infinite",
											}}
										/>
									)}
								</div>
							</div>

							{/* Status Text Below Progress */}
							<div
								style={{
									marginTop: "12px",
									textAlign: "center",
									fontSize: "14px",
									color: "#475569",
									fontWeight: "600",
								}}
							>
								{sendingStatus.status === "sending" && (
									<>
										⏳ Processing...{" "}
										{sendingStatus.total -
											(sendingStatus.sent + sendingStatus.failed)}{" "}
										messages remaining
									</>
								)}
								{sendingStatus.status === "paused" && (
									<>
										⏸️ Paused at message{" "}
										{sendingStatus.sent + sendingStatus.failed} of{" "}
										{sendingStatus.total}
									</>
								)}
								{sendingStatus.status === "completed" && (
									<>✅ All {sendingStatus.total} messages have been processed</>
								)}
							</div>
						</div>

						{/* Enhanced Statistics Cards with Gradients */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
								gap: "15px",
								marginBottom: "25px",
							}}
						>
							{/* Sent Card */}
							<div
								style={{
									textAlign: "center",
									padding: "20px 15px",
									background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
									borderRadius: "12px",
									border: "2px solid #10b981",
									boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
									transition: "transform 0.2s",
								}}
								onMouseOver={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseOut={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
							>
								<CheckCircle
									size={28}
									style={{ color: "#059669", marginBottom: "8px" }}
								/>
								<div
									style={{
										fontSize: "32px",
										fontWeight: "800",
										color: "#065f46",
										lineHeight: "1",
										marginBottom: "5px",
									}}
								>
									{sendingStatus.sent}
								</div>
								<div
									style={{
										fontSize: "13px",
										color: "#047857",
										fontWeight: "600",
									}}
								>
									Successfully Sent
								</div>
								{sendingStatus.total > 0 && (
									<div
										style={{
											fontSize: "11px",
											color: "#059669",
											marginTop: "5px",
										}}
									>
										{Math.round(
											(sendingStatus.sent / sendingStatus.total) * 100
										)}
										% Success
									</div>
								)}
							</div>

							{/* Failed Card */}
							<div
								style={{
									textAlign: "center",
									padding: "20px 15px",
									background:
										sendingStatus.failed > 0
											? "linear-gradient(135deg, #fee2e2, #fecaca)"
											: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
									borderRadius: "12px",
									border:
										sendingStatus.failed > 0
											? "2px solid #ef4444"
											: "2px solid #cbd5e1",
									boxShadow:
										sendingStatus.failed > 0
											? "0 4px 6px rgba(239, 68, 68, 0.2)"
											: "0 4px 6px rgba(203, 213, 225, 0.2)",
									transition: "transform 0.2s",
								}}
								onMouseOver={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseOut={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
							>
								<XCircle
									size={28}
									style={{
										color: sendingStatus.failed > 0 ? "#dc2626" : "#94a3b8",
										marginBottom: "8px",
									}}
								/>
								<div
									style={{
										fontSize: "32px",
										fontWeight: "800",
										color: sendingStatus.failed > 0 ? "#991b1b" : "#64748b",
										lineHeight: "1",
										marginBottom: "5px",
									}}
								>
									{sendingStatus.failed}
								</div>
								<div
									style={{
										fontSize: "13px",
										color: sendingStatus.failed > 0 ? "#b91c1c" : "#64748b",
										fontWeight: "600",
									}}
								>
									Failed
								</div>
								{sendingStatus.failed > 0 && sendingStatus.total > 0 && (
									<div
										style={{
											fontSize: "11px",
											color: "#dc2626",
											marginTop: "5px",
										}}
									>
										{Math.round(
											(sendingStatus.failed / sendingStatus.total) * 100
										)}
										% Failed
									</div>
								)}
							</div>

							{/* Total Card */}
							<div
								style={{
									textAlign: "center",
									padding: "20px 15px",
									background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
									borderRadius: "12px",
									border: "2px solid #3b82f6",
									boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
									transition: "transform 0.2s",
								}}
								onMouseOver={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseOut={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
							>
								<FileText
									size={28}
									style={{ color: "#1e40af", marginBottom: "8px" }}
								/>
								<div
									style={{
										fontSize: "32px",
										fontWeight: "800",
										color: "#1e3a8a",
										lineHeight: "1",
										marginBottom: "5px",
									}}
								>
									{sendingStatus.total}
								</div>
								<div
									style={{
										fontSize: "13px",
										color: "#1e40af",
										fontWeight: "600",
									}}
								>
									Total Messages
								</div>
								<div
									style={{
										fontSize: "11px",
										color: "#2563eb",
										marginTop: "5px",
									}}
								>
									{sendingStatus.sent + sendingStatus.failed} Processed
								</div>
							</div>
						</div>

						{/* Control Buttons */}
						<div
							style={{
								display: "flex",
								gap: "12px",
								justifyContent: "center",
								flexWrap: "wrap",
							}}
						>
							{sendingStatus.status === "sending" && (
								<button
									className="btn"
									onClick={handlePause}
									style={{
										background: "#f59e0b",
										color: "white",
										border: "2px solid #d97706",
										fontWeight: "600",
										padding: "12px 24px",
										fontSize: "14px",
									}}
								>
									<Pause size={18} />
									Pause Sending
								</button>
							)}
							{sendingStatus.status === "paused" && (
								<button
									className="btn btn-primary"
									onClick={handleResume}
									style={{
										background: "#10b981",
										border: "2px solid #059669",
										fontWeight: "600",
										padding: "12px 24px",
										fontSize: "14px",
									}}
								>
									<Play size={18} />
									Resume Sending
								</button>
							)}
							{(sendingStatus.status === "sending" ||
								sendingStatus.status === "paused") && (
								<button
									className="btn btn-danger"
									onClick={handleStop}
									style={{
										background: "#ef4444",
										color: "white",
										border: "2px solid #dc2626",
										fontWeight: "600",
										padding: "12px 24px",
										fontSize: "14px",
									}}
								>
									<Square size={18} />
									Stop Sending
								</button>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Add shimmer animation CSS */}
			<style>{`
				@keyframes shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(100%); }
				}
			`}</style>
		</div>
	);
}
