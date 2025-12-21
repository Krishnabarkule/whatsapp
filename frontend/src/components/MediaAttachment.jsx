import { useState } from "react";
import { Image as ImageIcon, Video, Music, X, Upload } from "lucide-react";

export default function MediaAttachment({ mediaFile, setMediaFile }) {
	const [preview, setPreview] = useState(null);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setMediaFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemove = () => {
		setMediaFile(null);
		setPreview(null);
	};

	const getFileIcon = () => {
		if (!mediaFile) return <ImageIcon size={24} />;

		if (mediaFile.type.startsWith("image/")) return <ImageIcon size={24} />;
		if (mediaFile.type.startsWith("video/")) return <Video size={24} />;
		if (mediaFile.type.startsWith("audio/")) return <Music size={24} />;

		return <ImageIcon size={24} />;
	};

	return (
		<div>
			<div className="content-header">
				<h2>Attach Media</h2>
				<p>Add images, videos, or audio files to your messages</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Media File</h3>
				</div>

				{!mediaFile ? (
					<div style={{ textAlign: "center", padding: "40px" }}>
						<input
							type="file"
							accept="image/*,video/*,audio/*"
							onChange={handleFileChange}
							className="file-input"
							id="media-file"
						/>
						<label
							htmlFor="media-file"
							className="file-label"
							style={{
								display: "inline-flex",
								padding: "30px 50px",
								fontSize: "16px",
							}}
						>
							<Upload size={24} />
							Choose Media File
						</label>
						<p style={{ marginTop: "20px", color: "#7f8c8d" }}>
							Supported formats: Images (JPG, PNG, GIF), Videos (MP4, AVI),
							Audio (MP3, WAV, OGG)
						</p>
					</div>
				) : (
					<div>
						<div
							style={{
								padding: "20px",
								background: "#f8f9fa",
								borderRadius: "8px",
								marginBottom: "20px",
							}}
						>
							<div className="flex justify-between items-center mb-4">
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
									onClick={handleRemove}
									style={{ padding: "8px 16px" }}
								>
									<X size={18} />
									Remove
								</button>
							</div>

							{preview && mediaFile.type.startsWith("image/") && (
								<div style={{ textAlign: "center", marginTop: "20px" }}>
									<img
										src={preview}
										alt="Preview"
										style={{
											maxWidth: "100%",
											maxHeight: "400px",
											borderRadius: "8px",
										}}
									/>
								</div>
							)}

							{preview && mediaFile.type.startsWith("video/") && (
								<div style={{ textAlign: "center", marginTop: "20px" }}>
									<video
										src={preview}
										controls
										style={{
											maxWidth: "100%",
											maxHeight: "400px",
											borderRadius: "8px",
										}}
									/>
								</div>
							)}

							{preview && mediaFile.type.startsWith("audio/") && (
								<div style={{ marginTop: "20px" }}>
									<audio src={preview} controls style={{ width: "100%" }} />
								</div>
							)}
						</div>

						<button
							className="btn btn-primary"
							onClick={() =>
								document.getElementById("media-file-change").click()
							}
						>
							Change File
						</button>
						<input
							type="file"
							accept="image/*,video/*,audio/*"
							onChange={handleFileChange}
							className="file-input"
							id="media-file-change"
						/>
					</div>
				)}

				<div
					style={{
						marginTop: "30px",
						padding: "20px",
						background: "#fff3cd",
						borderRadius: "8px",
					}}
				>
					<h4 style={{ marginBottom: "15px", color: "#856404" }}>
						⚠️ Important Notes
					</h4>
					<ul
						style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#856404" }}
					>
						<li>Media files will be sent with your message to all contacts</li>
						<li>For audio messages, use OGG format for best compatibility</li>
						<li>Large files may take longer to send</li>
						<li>
							Some file types may not be supported on older WhatsApp versions
						</li>
						<li>Videos will be sent as regular videos (not as video notes)</li>
					</ul>
				</div>

				<div
					style={{
						marginTop: "20px",
						padding: "20px",
						background: "#e7f3ff",
						borderRadius: "8px",
					}}
				>
					<h4 style={{ marginBottom: "15px" }}>Media Recommendations</h4>
					<ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
						<li>
							<strong>Images:</strong> JPG or PNG, max 5MB
						</li>
						<li>
							<strong>Videos:</strong> MP4 format recommended, max 16MB
						</li>
						<li>
							<strong>Audio:</strong> OGG format with libopus codec for best
							compatibility
						</li>
						<li>Keep file sizes reasonable for faster delivery</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
