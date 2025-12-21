import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import MainApp from "./MainApp";
import "./App.css";

function AppRoutes() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					background: "#f0f2f5",
				}}
			>
				<div style={{ textAlign: "center" }}>
					<div
						className="spinner"
						style={{
							width: "40px",
							height: "40px",
							border: "4px solid #e9edef",
							borderTopColor: "#25d366",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
							margin: "0 auto 16px",
						}}
					></div>
					<p style={{ color: "#667781", fontSize: "14px" }}>Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<Routes>
			<Route
				path="/login"
				element={user ? <Navigate to="/dashboard" replace /> : <Login />}
			/>

			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/admin/users"
				element={
					<ProtectedRoute adminOnly={true}>
						<UserManagement />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/sessions"
				element={
					<ProtectedRoute>
						<MainApp initialMenu="sessions" />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/messaging"
				element={
					<ProtectedRoute>
						<MainApp initialMenu="messaging" />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/logs"
				element={
					<ProtectedRoute>
						<MainApp initialMenu="logs" />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/"
				element={
					user ? (
						<Navigate to="/dashboard" replace />
					) : (
						<Navigate to="/login" replace />
					)
				}
			/>
		</Routes>
	);
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</Router>
	);
}

export default App;
