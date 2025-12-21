import { useState } from "react";
import { FileText, Eye } from "lucide-react";

export default function TemplateEditor({ template, setTemplate, contacts }) {
	const [showPreview, setShowPreview] = useState(false);

	const handleTemplateChange = (e) => {
		setTemplate(e.target.value);
	};

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

	return (
		<div>
			<div className="content-header">
				<h2>Template Editor</h2>
				<p>Create your message template with variables</p>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Message Template</h3>
					<button
						className="btn btn-primary"
						onClick={() => setShowPreview(!showPreview)}
					>
						<Eye size={18} />
						{showPreview ? "Hide Preview" : "Show Preview"}
					</button>
				</div>

				<div className="form-group">
					<label>Template Message</label>
					<textarea
						value={template}
						onChange={handleTemplateChange}
						placeholder="Type your message here... Use {{variable}} for dynamic content"
					/>
					<small
						style={{ color: "#7f8c8d", display: "block", marginTop: "5px" }}
					>
						Use double curly braces for variables, e.g., {"{{name}}"},{" "}
						{"{{phone}}"}
					</small>
				</div>

				{getAvailableVariables().length > 0 && (
					<div style={{ marginTop: "20px" }}>
						<h4 style={{ marginBottom: "10px" }}>Available Variables</h4>
						<div className="flex gap-2" style={{ flexWrap: "wrap" }}>
							{getAvailableVariables().map((variable) => (
								<button
									key={variable}
									className="btn"
									style={{ background: "#ecf0f1", color: "#2c3e50" }}
									onClick={() => insertVariable(variable)}
								>
									{"{{" + variable + "}}"}
								</button>
							))}
						</div>
					</div>
				)}

				{showPreview && (
					<div style={{ marginTop: "30px" }}>
						<h4 style={{ marginBottom: "10px" }}>
							Preview (using first contact)
						</h4>
						<div
							style={{
								padding: "20px",
								background: "#f8f9fa",
								borderRadius: "8px",
								whiteSpace: "pre-wrap",
								lineHeight: "1.6",
							}}
						>
							{generatePreview()}
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
					<h4 style={{ marginBottom: "15px" }}>Template Examples</h4>

					<div style={{ marginBottom: "15px" }}>
						<strong>Example 1: Simple Greeting</strong>
						<pre
							style={{
								marginTop: "10px",
								padding: "15px",
								background: "white",
								borderRadius: "8px",
								overflowX: "auto",
							}}
						>
							Hello {"{{name}}"}, {"\n"}
							Welcome to our service!
						</pre>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<strong>Example 2: Business Message</strong>
						<pre
							style={{
								marginTop: "10px",
								padding: "15px",
								background: "white",
								borderRadius: "8px",
								overflowX: "auto",
							}}
						>
							Hi {"{{name}}"},{"\n"}
							{"\n"}
							Thank you for your interest in {"{{company}}"}. {"\n"}
							We would like to connect with you regarding our services.{"\n"}
							{"\n"}
							Best regards,{"\n"}
							Your Team
						</pre>
					</div>

					<div>
						<strong>Example 3: With Multiple Variables</strong>
						<pre
							style={{
								marginTop: "10px",
								padding: "15px",
								background: "white",
								borderRadius: "8px",
								overflowX: "auto",
							}}
						>
							Dear {"{{name}}"},{"\n"}
							{"\n"}
							Your contact number {"{{phone}}"} has been registered.{"\n"}
							Company: {"{{company}}"}
							{"\n"}
							{"\n"}
							Thank you!
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
