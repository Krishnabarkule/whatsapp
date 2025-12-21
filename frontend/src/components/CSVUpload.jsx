import { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import axios from "axios";

export default function CSVUpload({ onContactsLoaded, selectedSession }) {
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState(null);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			if (!selectedFile.name.endsWith(".csv")) {
				alert("Please select a CSV file");
				return;
			}
			setFile(selectedFile);
			setUploadStatus(null);
		}
	};

	const handleUpload = async () => {
		if (!file) {
			alert("Please select a file first");
			return;
		}

		if (!selectedSession) {
			alert("Please select a session first");
			return;
		}

		setLoading(true);
		const formData = new FormData();
		formData.append("csv", file);

		try {
			const response = await axios.post("/api/csv/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setUploadStatus({
				success: true,
				count: response.data.count,
				headers: response.data.headers,
			});

			onContactsLoaded(response.data.contacts);
			alert(`Successfully loaded ${response.data.count} contacts!`);
		} catch (error) {
			setUploadStatus({
				success: false,
				error: error.response?.data?.error || error.message,
			});
			alert(
				"Failed to upload CSV: " +
					(error.response?.data?.error || error.message)
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="content-header">
				<h2>Upload CSV</h2>
				<p>Upload a CSV file with contact information</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>CSV File Upload</h3>
				</div>

				{!selectedSession && (
					<div
						style={{
							padding: "15px",
							background: "#fff3cd",
							borderRadius: "8px",
							marginBottom: "20px",
							color: "#856404",
						}}
					>
						⚠️ Please select a session from Session Management first
					</div>
				)}

				<div className="form-group">
					<label>Select CSV File</label>
					<input
						type="file"
						accept=".csv"
						onChange={handleFileChange}
						className="file-input"
						id="csv-file"
					/>
					<label htmlFor="csv-file" className="file-label">
						<Upload size={18} />
						{file ? file.name : "Choose CSV File"}
					</label>
				</div>

				{file && (
					<div
						style={{
							padding: "15px",
							background: "#e7f3ff",
							borderRadius: "8px",
							marginBottom: "20px",
						}}
					>
						<div className="flex items-center gap-2">
							<FileText size={18} />
							<span>{file.name}</span>
						</div>
						<div
							style={{ fontSize: "13px", color: "#7f8c8d", marginTop: "5px" }}
						>
							{(file.size / 1024).toFixed(2)} KB
						</div>
					</div>
				)}

				{uploadStatus && uploadStatus.success && (
					<div
						style={{
							padding: "15px",
							background: "#d4edda",
							borderRadius: "8px",
							marginBottom: "20px",
							color: "#155724",
						}}
					>
						<div className="flex items-center gap-2 mb-2">
							<CheckCircle size={18} />
							<strong>Upload Successful!</strong>
						</div>
						<p>Loaded {uploadStatus.count} contacts</p>
						<p style={{ fontSize: "13px", marginTop: "5px" }}>
							Columns: {uploadStatus.headers.join(", ")}
						</p>
					</div>
				)}

				{uploadStatus && !uploadStatus.success && (
					<div
						style={{
							padding: "15px",
							background: "#f8d7da",
							borderRadius: "8px",
							marginBottom: "20px",
							color: "#721c24",
						}}
					>
						<strong>Upload Failed:</strong> {uploadStatus.error}
					</div>
				)}

				<button
					className="btn btn-primary"
					onClick={handleUpload}
					disabled={!file || loading || !selectedSession}
				>
					{loading ? "Uploading..." : "Upload CSV"}
				</button>

				<div
					style={{
						marginTop: "30px",
						padding: "20px",
						background: "#f8f9fa",
						borderRadius: "8px",
					}}
				>
					<h4 style={{ marginBottom: "15px" }}>CSV Format Guidelines</h4>
					<ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
						<li>
							Your CSV must have a <strong>"phone"</strong> column
						</li>
						<li>
							Phone numbers should include country code (e.g., 919999999999)
						</li>
						<li>Additional columns can be used in message templates</li>
						<li>Example columns: phone, name, company, email</li>
					</ul>

					<div
						style={{
							marginTop: "15px",
							padding: "15px",
							background: "white",
							borderRadius: "8px",
							fontFamily: "monospace",
							fontSize: "13px",
						}}
					>
						<strong>Example CSV:</strong>
						<pre style={{ marginTop: "10px", overflowX: "auto" }}>
							phone,name,company{"\n"}
							919999999999,John Doe,ABC Corp{"\n"}
							918888888888,Jane Smith,XYZ Ltd
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
