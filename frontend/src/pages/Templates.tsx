import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api from "../api/client";

const Templates: React.FC = () => {
	const [items, setItems] = useState<any[]>([]);
	const [name, setName] = useState("");
	const [content, setContent] = useState("");

	const load = async () => {
		const { data } = await api.get("/api/templates", {
			params: { ownerId: "me" },
		});
		setItems(data);
	};

	useEffect(() => {
		load();
	}, []);

	const create = async () => {
		await api.post("/api/templates", { ownerId: "me", name, content });
		setName("");
		setContent("");
		load();
	};

	return (
		<div>
			<Topbar title="Message Templates" />
			<div
				className="content"
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
			>
				<div className="card">
					<h3>Create Template</h3>
					<input
						className="input"
						placeholder="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<textarea
						className="input"
						rows={6}
						placeholder="Content (use {{name}})"
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<button className="btn" onClick={create}>
						Save
					</button>
				</div>
				<div className="card">
					<h3>Templates</h3>
					<ul>
						{items.map((t) => (
							<li key={t._id}>
								<strong>{t.name}:</strong> {t.content}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Templates;
