import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import Modal from "../components/Modal";

const Login: React.FC = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [forgotOpen, setForgotOpen] = useState(false);
	const [fpPhone, setFpPhone] = useState("");
	const [fpStatus, setFpStatus] = useState<string | null>(null);
	const [fpVerified, setFpVerified] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await login(username, password);
			setTimeout(() => navigate("/dashboard"), 500);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const forgot = async () => {
		setFpStatus(null);
		setFpVerified(false);
		try {
			const res = await api.post("/api/auth/forgot-password/verify", {
				username,
				phone: fpPhone,
			});
			setFpStatus(res.data.message || "Verification successful.");
			setFpVerified(true);
		} catch (e: any) {
			setFpStatus(e?.response?.data?.message || "Verification failed");
			setFpVerified(false);
		}
	};

	const resetPassword = async () => {
		setFpStatus(null);
		if (newPassword !== newPasswordConfirm) {
			setFpStatus("Passwords do not match");
			return;
		}
		try {
			const res = await api.post("/api/auth/reset-password", {
				username,
				newPassword,
			});
			setFpStatus(res.data.message || "Password reset successful.");
			setFpVerified(false);
			setNewPassword("");
			setNewPasswordConfirm("");
			setForgotOpen(false);
		} catch (e: any) {
			setFpStatus(e?.response?.data?.message || "Password reset failed");
		}
	};

	return (
		<div className="login-grid">
			<div className="login-left">
				<h1 style={{ color: "#075E54" }}>WhatsApp Marketing Suite</h1>
				<p>
					• Send bulk WhatsApp messages securely
					<br />• CSV-based campaigns
					<br />• Media & text messaging
					<br />• Advanced analytics & delivery tracking
					<br />• Scheduled campaigns
					<br />• Admin-controlled access & limits
					<br />• Desktop-ready for Windows & macOS
				</p>
				<div className="footer">
					© 2025 WhatsApp Marketing Suite — Secure • Fast • Scalable
				</div>
			</div>
			<div className="login-right">
				<form className="card" style={{ width: 380 }} onSubmit={submit}>
					<h2 style={{ marginTop: 0, marginBottom: 12 }}>Login</h2>
					<div style={{ display: "grid", gap: 10 }}>
						<input
							className="input"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<input
							type="password"
							className="input"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						{error && (
							<div style={{ color: "var(--color-danger)" }}>{error}</div>
						)}
						<button
							className="btn"
							type="submit"
							disabled={loading || !username || !password}
							style={{ opacity: loading || !username || !password ? 0.6 : 1 }}
						>
							{loading ? "Signing in..." : "Sign In"}
						</button>
						<button
							type="button"
							className="btn ghost"
							onClick={() => setForgotOpen(true)}
						>
							Forgot Password?
						</button>
					</div>
				</form>
			</div>

			<Modal
				open={forgotOpen}
				onClose={() => {
					setForgotOpen(false);
					setFpVerified(false);
					setFpStatus(null);
					setFpPhone("");
					setNewPassword("");
					setNewPasswordConfirm("");
				}}
				title={
					fpVerified ? "Reset Password" : "Verify Registered Contact Number"
				}
			>
				<div style={{ display: "grid", gap: 8 }}>
					{!fpVerified ? (
						<>
							<input
								className="input"
								placeholder="Registered Phone (E.164)"
								value={fpPhone}
								onChange={(e) => setFpPhone(e.target.value)}
							/>
							<button className="btn" onClick={forgot}>
								Verify
							</button>
						</>
					) : (
						<>
							<input
								type="password"
								className="input"
								placeholder="New Password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
							<input
								type="password"
								className="input"
								placeholder="Confirm Password"
								value={newPasswordConfirm}
								onChange={(e) => setNewPasswordConfirm(e.target.value)}
							/>
							<button className="btn" onClick={resetPassword}>
								Reset Password
							</button>
						</>
					)}
					{fpStatus && (
						<div
							style={{
								color: fpStatus.includes("successful")
									? "var(--color-success)"
									: "var(--color-danger)",
							}}
						>
							{fpStatus}
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
};

export default Login;
