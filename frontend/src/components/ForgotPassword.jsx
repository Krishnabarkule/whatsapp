import { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";

function ForgotPassword({ onClose }) {
	const [step, setStep] = useState(1); // 1: verify, 2: reset
	const [isLoading, setIsLoading] = useState(false);

	// Step 1 - Verification
	const [email, setEmail] = useState("");
	const [contact, setContact] = useState("");

	// Step 2 - Reset
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [resetToken, setResetToken] = useState("");

	// Messages
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleVerify = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		setIsLoading(true);

		try {
			const response = await axios.post(
				"http://localhost:3000/api/auth/forgot-password/verify",
				{
					email,
					primaryContact: contact,
				}
			);

			if (response.data.success) {
				setResetToken(response.data.data.resetToken);
				setStep(2);
				setMessage("Verification successful! Please enter your new password.");
			}
		} catch (err) {
			setError(
				err.response?.data?.error ||
					"Verification failed. Please check your email and contact number."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const response = await axios.post(
				"http://localhost:3000/api/auth/forgot-password/reset",
				{
					resetToken,
					newPassword,
				}
			);

			if (response.data.success) {
				setMessage(
					"Password reset successfully! You can now login with your new password."
				);
				setTimeout(() => {
					onClose();
				}, 2000);
			}
		} catch (err) {
			setError(err.response?.data?.error || "Password reset failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="forgot-password-overlay" onClick={onClose}>
			<div
				className="forgot-password-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
					<button onClick={onClose} className="close-btn">
						<svg viewBox="0 0 24 24" width="24" height="24">
							<path
								fill="currentColor"
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
							/>
						</svg>
					</button>
				</div>

				<div className="modal-body">
					{message && (
						<div className="success-message">
							<svg viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
								/>
							</svg>
							{message}
						</div>
					)}

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

					{step === 1 ? (
						<form onSubmit={handleVerify} className="forgot-form">
							<p className="form-description">
								Enter your email address and contact number to verify your
								identity.
							</p>

							<div className="form-group">
								<label>Email Address</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email"
									required
									disabled={isLoading}
								/>
							</div>

							<div className="form-group">
								<label>Contact Number</label>
								<input
									type="tel"
									value={contact}
									onChange={(e) => setContact(e.target.value)}
									placeholder="Enter your registered contact number"
									required
									disabled={isLoading}
								/>
							</div>

							<button type="submit" className="submit-btn" disabled={isLoading}>
								{isLoading ? "Verifying..." : "Verify"}
							</button>
						</form>
					) : (
						<form onSubmit={handleReset} className="forgot-form">
							<p className="form-description">
								Create a new password for your account.
							</p>

							<div className="form-group">
								<label>New Password</label>
								<input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Enter new password (min 6 characters)"
									required
									disabled={isLoading}
									minLength={6}
								/>
							</div>

							<div className="form-group">
								<label>Confirm Password</label>
								<input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm your new password"
									required
									disabled={isLoading}
									minLength={6}
								/>
							</div>

							<button type="submit" className="submit-btn" disabled={isLoading}>
								{isLoading ? "Resetting..." : "Reset Password"}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
