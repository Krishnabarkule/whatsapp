import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./UserManagement.css";

function UserManagement() {
	const { logout } = useAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		businessName: "",
		email: "",
		password: "",
		primaryContact: "",
		alternateContact: "",
		address: "",
		dailyLimit: 100,
		monthlyLimit: 3000,
		yearlyLimit: 36000,
	});

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			const response = await axios.get("/api/users");
			setUsers(response.data.data);
		} catch (error) {
			console.error("Failed to load users:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const handleEdit = (user) => {
		setEditingUser(user);
		setFormData({
			firstName: user.firstName,
			lastName: user.lastName,
			businessName: user.businessName,
			email: user.email,
			password: "",
			primaryContact: user.primaryContact,
			alternateContact: user.alternateContact || "",
			address: user.address || "",
			dailyLimit: user.dailyLimit,
			monthlyLimit: user.monthlyLimit,
			yearlyLimit: user.yearlyLimit,
		});
		setShowModal(true);
	};

	const handleAdd = () => {
		setEditingUser(null);
		setFormData({
			firstName: "",
			lastName: "",
			businessName: "",
			email: "",
			password: "",
			primaryContact: "",
			alternateContact: "",
			address: "",
			dailyLimit: 100,
			monthlyLimit: 3000,
			yearlyLimit: 36000,
		});
		setShowModal(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingUser) {
				await axios.put(`/api/users/${editingUser._id}`, formData);
			} else {
				await axios.post("/api/auth/register", formData);
			}
			setShowModal(false);
			loadUsers();
		} catch (error) {
			alert(error.response?.data?.error || "Operation failed");
		}
	};

	const handleDelete = async (userId) => {
		if (!window.confirm("Are you sure you want to delete this user?")) return;

		try {
			await axios.delete(`/api/users/${userId}`);
			loadUsers();
		} catch (error) {
			alert(error.response?.data?.error || "Delete failed");
		}
	};

	const handleResetPassword = async (userId) => {
		const newPassword = prompt("Enter new password:");
		if (!newPassword) return;

		try {
			await axios.put(`/api/users/${userId}/reset-password`, { newPassword });
			alert("Password reset successfully");
		} catch (error) {
			alert(error.response?.data?.error || "Password reset failed");
		}
	};

	if (loading) {
		return (
			<div className="user-management">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading users...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="user-management">
			<div className="management-header">
				<div className="header-content">
					<div>
						<h1>User Management</h1>
						<p className="subtitle">Manage users and their message limits</p>
					</div>
					<div className="header-actions">
						<button
							onClick={() => navigate("/dashboard")}
							className="back-button"
						>
							<svg viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
								/>
							</svg>
							Dashboard
						</button>
						<button onClick={handleLogout} className="logout-button">
							<svg viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="currentColor"
									d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"
								/>
							</svg>
							Logout
						</button>
					</div>
				</div>
			</div>

			<div className="management-content">
				<div className="content-header">
					<h2>All Users ({users.length})</h2>
					<button onClick={handleAdd} className="add-button">
						<svg viewBox="0 0 24 24" width="20" height="20">
							<path
								fill="currentColor"
								d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
							/>
						</svg>
						Add User
					</button>
				</div>

				<div className="users-table">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Business</th>
								<th>Email</th>
								<th>Contact</th>
								<th>Daily Usage</th>
								<th>Monthly Usage</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user._id}>
									<td>{user.userId}</td>
									<td>
										{user.firstName} {user.lastName}
									</td>
									<td>{user.businessName}</td>
									<td>{user.email}</td>
									<td>{user.primaryContact}</td>
									<td>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "4px",
											}}
										>
											<span style={{ fontWeight: "600", color: "#dc2626" }}>
												{user.dailyUsage || 0} / {user.dailyLimit}
											</span>
											<span style={{ fontSize: "12px", color: "#059669" }}>
												{user.dailyLimit - (user.dailyUsage || 0)} left
											</span>
										</div>
									</td>
									<td>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "4px",
											}}
										>
											<span style={{ fontWeight: "600", color: "#dc2626" }}>
												{user.monthlyUsage || 0} / {user.monthlyLimit}
											</span>
											<span style={{ fontSize: "12px", color: "#059669" }}>
												{user.monthlyLimit - (user.monthlyUsage || 0)} left
											</span>
										</div>
									</td>
									<td>
										<span className={`status-badge ${user.status}`}>
											{user.status}
										</span>
									</td>
									<td>
										<div className="action-buttons">
											<button
												onClick={() => handleEdit(user)}
												className="btn-edit"
												title="Edit"
											>
												<svg viewBox="0 0 24 24" width="16" height="16">
													<path
														fill="currentColor"
														d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"
													/>
												</svg>
											</button>
											<button
												onClick={() => handleResetPassword(user._id)}
												className="btn-reset"
												title="Reset Password"
											>
												<svg viewBox="0 0 24 24" width="16" height="16">
													<path
														fill="currentColor"
														d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM18 20H6V10h12v10z"
													/>
												</svg>
											</button>
											{user.role !== "admin" && (
												<button
													onClick={() => handleDelete(user._id)}
													className="btn-delete"
													title="Delete"
												>
													<svg viewBox="0 0 24 24" width="16" height="16">
														<path
															fill="currentColor"
															d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
														/>
													</svg>
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{showModal && (
				<div className="modal-overlay" onClick={() => setShowModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>{editingUser ? "Edit User" : "Add New User"}</h2>
							<button
								onClick={() => setShowModal(false)}
								className="close-button"
							>
								<svg viewBox="0 0 24 24" width="24" height="24">
									<path
										fill="currentColor"
										d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
									/>
								</svg>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="user-form">
							<div className="form-row">
								<div className="form-group">
									<label>First Name *</label>
									<input
										type="text"
										value={formData.firstName}
										onChange={(e) =>
											setFormData({ ...formData, firstName: e.target.value })
										}
										required
									/>
								</div>
								<div className="form-group">
									<label>Last Name *</label>
									<input
										type="text"
										value={formData.lastName}
										onChange={(e) =>
											setFormData({ ...formData, lastName: e.target.value })
										}
										required
									/>
								</div>
							</div>

							<div className="form-group">
								<label>Business Name *</label>
								<input
									type="text"
									value={formData.businessName}
									onChange={(e) =>
										setFormData({ ...formData, businessName: e.target.value })
									}
									required
								/>
							</div>

							<div className="form-group">
								<label>Email *</label>
								<input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									required
									disabled={!!editingUser}
								/>
							</div>

							{!editingUser && (
								<div className="form-group">
									<label>Password *</label>
									<input
										type="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										required
										minLength={6}
									/>
								</div>
							)}

							<div className="form-row">
								<div className="form-group">
									<label>Primary Contact *</label>
									<input
										type="tel"
										value={formData.primaryContact}
										onChange={(e) =>
											setFormData({
												...formData,
												primaryContact: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className="form-group">
									<label>Alternate Contact</label>
									<input
										type="tel"
										value={formData.alternateContact}
										onChange={(e) =>
											setFormData({
												...formData,
												alternateContact: e.target.value,
											})
										}
									/>
								</div>
							</div>

							<div className="form-group">
								<label>Address</label>
								<textarea
									value={formData.address}
									onChange={(e) =>
										setFormData({ ...formData, address: e.target.value })
									}
									rows={3}
								/>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Daily Limit *</label>
									<input
										type="number"
										value={formData.dailyLimit}
										onChange={(e) =>
											setFormData({
												...formData,
												dailyLimit: parseInt(e.target.value),
											})
										}
										required
										min={0}
									/>
								</div>
								<div className="form-group">
									<label>Monthly Limit *</label>
									<input
										type="number"
										value={formData.monthlyLimit}
										onChange={(e) =>
											setFormData({
												...formData,
												monthlyLimit: parseInt(e.target.value),
											})
										}
										required
										min={0}
									/>
								</div>
								<div className="form-group">
									<label>Yearly Limit *</label>
									<input
										type="number"
										value={formData.yearlyLimit}
										onChange={(e) =>
											setFormData({
												...formData,
												yearlyLimit: parseInt(e.target.value),
											})
										}
										required
										min={0}
									/>
								</div>
							</div>

							<div className="form-actions">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="btn-cancel"
								>
									Cancel
								</button>
								<button type="submit" className="btn-submit">
									{editingUser ? "Update User" : "Create User"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default UserManagement;
