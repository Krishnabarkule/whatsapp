import React from "react";
import Topbar from "../components/Topbar";

const Settings: React.FC = () => {
	return (
		<div>
			<Topbar title="Settings" />
			<div className="content">
				<div className="card">Settings page.</div>
			</div>
		</div>
	);
};

export default Settings;
