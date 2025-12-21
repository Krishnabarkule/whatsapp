import React from "react";
import Topbar from "../components/Topbar";

const Dashboard: React.FC = () => {
	return (
		<div>
			<Topbar title="Dashboard" />
			<div className="content">
				<div className="card">Welcome to WhatsApp Marketing Suite.</div>
			</div>
		</div>
	);
};

export default Dashboard;
