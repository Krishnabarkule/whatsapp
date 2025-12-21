import React from "react";
import Topbar from "../components/Topbar";

const AdminTools: React.FC = () => {
	return (
		<div>
			<Topbar title="Admin Tools" />
			<div className="content">
				<div className="card">
					Bulk upload, reminders, and impersonation stubs.
				</div>
			</div>
		</div>
	);
};

export default AdminTools;
