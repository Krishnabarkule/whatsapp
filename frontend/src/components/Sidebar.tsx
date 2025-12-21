import React from "react";
import { NavLink } from "react-router-dom";

const Item: React.FC<{ to: string; label: string; icon: string }> = ({
	to,
	label,
	icon,
}) => (
	<NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")}>
		<span>{icon}</span>
		<span>{label}</span>
	</NavLink>
);

const Sidebar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
	return (
		<aside className="sidebar">
			<div className="brand">WhatsApp Marketing</div>
			<Item to="/" label="Dashboard" icon="📊" />
			<Item to="/send" label="Send Messages" icon="✉️" />
			<Item to="/scheduled" label="Scheduled Messages" icon="⏱" />
			<Item to="/templates" label="Message Templates" icon="📚" />
			<Item to="/analytics" label="Analytics" icon="📈" />
			<Item to="/sessions" label="Sessions" icon="📲" />
			{isAdmin && <Item to="/users" label="Users" icon="👥" />}
			{isAdmin && <Item to="/admin" label="Admin Tools" icon="🧩" />}
			<Item to="/settings" label="Settings" icon="⚙️" />
		</aside>
	);
};

export default Sidebar;
