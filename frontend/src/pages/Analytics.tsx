import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api from "../api/client";

const Analytics: React.FC = () => {
	const [summary, setSummary] = useState<any | null>(null);
	useEffect(() => {
		api.get("/api/analytics/summary").then(({ data }) => setSummary(data));
	}, []);

	return (
		<div>
			<Topbar title="Analytics" />
			<div className="content">
				<div className="card">
					{!summary ? (
						"Loading..."
					) : (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: 12,
							}}
						>
							{Object.entries(summary).map(([k, v]) => (
								<div className="card" key={k}>
									<div style={{ fontSize: 12, color: "#6b7280" }}>{k}</div>
									<div style={{ fontSize: 24, fontWeight: 700 }}>
										{v as number}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Analytics;
