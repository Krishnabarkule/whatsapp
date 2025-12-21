import React from "react";
import Topbar from "../components/Topbar";

const ScheduledMessages: React.FC = () => {
	return (
		<div>
			<Topbar title="Scheduled Messages" />
			<div className="content">
				<div className="card">No scheduled messages yet.</div>
			</div>
		</div>
	);
};

export default ScheduledMessages;
