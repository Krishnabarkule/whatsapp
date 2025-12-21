import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ForgotPassword from "./ForgotPassword";
import "./Login.css";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showForgotPassword, setShowForgotPassword] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const result = await login(email, password);

		setIsLoading(false);

		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.error || "Invalid credentials");
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<div className="whatsapp-icon">
						<svg viewBox="0 0 24 24" width="48" height="48">
							<path
								fill="currentColor"
								d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
							/>
						</svg>
					</div>
					<h1>WhatsApp Bulk Messenger</h1>
					<p>Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="login-form">
					{error && (
						<div className="error-message">
							<svg viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
								/>
							</svg>
							{error}
						</div>
					)}

					<div className="form-group">
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							required
							disabled={isLoading}
							autoComplete="email"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							disabled={isLoading}
							autoComplete="current-password"
						/>
					</div>

					<div className="forgot-password-link">
						<button
							type="button"
							onClick={() => setShowForgotPassword(true)}
							className="forgot-btn"
						>
							Forgot Password?
						</button>
					</div>

					<button type="submit" className="login-button" disabled={isLoading}>
						{isLoading ? (
							<span className="loading-spinner">
								<svg className="spinner" viewBox="0 0 50 50">
									<circle
										cx="25"
										cy="25"
										r="20"
										fill="none"
										strokeWidth="4"
									></circle>
								</svg>
								Signing in...
							</span>
						) : (
							"Sign In"
						)}
					</button>
				</form>

				<div className="login-footer">
					<p>Default Admin: admin@whatsapp.com / admin123</p>
				</div>
			</div>

			{showForgotPassword && (
				<ForgotPassword onClose={() => setShowForgotPassword(false)} />
			)}
		</div>
	);
}

export default Login;
