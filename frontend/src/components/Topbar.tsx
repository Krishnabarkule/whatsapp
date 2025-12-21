import React from "react";

const Topbar: React.FC<{ title: string; right?: React.ReactNode }> = ({
	title,
	right,
}) => {
	return (
		<header className="header">
			<h3 style={{ margin: 0 }}>{title}</h3>
			<div>{right}</div>
		</header>
	);
};

export default Topbar;
