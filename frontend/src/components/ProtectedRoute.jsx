import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
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
				<div
					style={{
						textAlign: "center",
					}}
				>
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
					<p
						style={{
							color: "#667781",
							fontSize: "14px",
						}}
					>
						Loading...
					</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (adminOnly && user.role !== "admin") {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}

export default ProtectedRoute;
