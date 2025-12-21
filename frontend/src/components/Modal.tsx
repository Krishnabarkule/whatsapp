import React from "react";

const Modal: React.FC<{
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
	if (!open) return null;
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.3)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div className="card" style={{ width: 420, maxWidth: "90%" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 12,
					}}
				>
					<h3 style={{ margin: 0 }}>{title}</h3>
					<button className="btn ghost" onClick={onClose}>
						Close
					</button>
				</div>
				{children}
			</div>
		</div>
	);
};

export default Modal;
