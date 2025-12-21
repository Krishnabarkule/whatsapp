import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SendMessages from "./pages/SendMessages";
import ScheduledMessages from "./pages/ScheduledMessages";
import Templates from "./pages/Templates";
import Analytics from "./pages/Analytics";
import Sessions from "./pages/Sessions";
import Users from "./pages/Users";
import AdminTools from "./pages/AdminTools";
import Settings from "./pages/Settings";

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user } = useAuth();
	return (
		<div className="app-shell">
			<Sidebar isAdmin={user?.role === "ADMIN"} />
			<main>{children}</main>
		</div>
	);
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { token } = useAuth();
	const location = useLocation();
	if (!token)
		return <Navigate to="/login" state={{ from: location }} replace />;
	return <>{children}</>;
};

const RootRoutes: React.FC = () => (
	<Routes>
		<Route path="/login" element={<Login />} />
		<Route
			path="/"
			element={
				<PrivateRoute>
					<Shell>
						<Dashboard />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/send"
			element={
				<PrivateRoute>
					<Shell>
						<SendMessages />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/scheduled"
			element={
				<PrivateRoute>
					<Shell>
						<ScheduledMessages />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/templates"
			element={
				<PrivateRoute>
					<Shell>
						<Templates />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/analytics"
			element={
				<PrivateRoute>
					<Shell>
						<Analytics />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/sessions"
			element={
				<PrivateRoute>
					<Shell>
						<Sessions />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/users"
			element={
				<PrivateRoute>
					<Shell>
						<Users />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/admin"
			element={
				<PrivateRoute>
					<Shell>
						<AdminTools />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route
			path="/settings"
			element={
				<PrivateRoute>
					<Shell>
						<Settings />
					</Shell>
				</PrivateRoute>
			}
		/>
		<Route path="*" element={<Navigate to="/" />} />
	</Routes>
);

const App: React.FC = () => {
	return (
		<AuthProvider>
			<RootRoutes />
		</AuthProvider>
	);
};

export default App;
