import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Configure axios defaults
	axios.defaults.baseURL = "http://localhost:3000";
	axios.defaults.withCredentials = true;

	// Add token to all requests
	axios.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => Promise.reject(error)
	);

	// Handle 401 responses (unauthorized)
	axios.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response?.status === 401) {
				// Clear user data on 401
				localStorage.removeItem("token");
				setUser(null);
			}
			return Promise.reject(error);
		}
	);

	// Load user on mount
	useEffect(() => {
		loadUser();
	}, []);

	const loadUser = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				setLoading(false);
				return;
			}

			const response = await axios.get("/api/auth/me");
			setUser(response.data.data);
		} catch (error) {
			console.error("Failed to load user:", error);
			localStorage.removeItem("token");
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			setError(null);
			const response = await axios.post("/api/auth/login", {
				email,
				password,
			});

			const { data } = response.data;
			const token = data.token;
			localStorage.setItem("token", token);
			setUser(data);

			return { success: true };
		} catch (error) {
			const message = error.response?.data?.error || "Login failed";
			setError(message);
			return { success: false, error: message };
		}
	};

	const logout = async () => {
		try {
			await axios.post("/api/auth/logout");
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			localStorage.removeItem("token");
			setUser(null);
		}
	};

	const updatePassword = async (currentPassword, newPassword) => {
		try {
			setError(null);
			await axios.put("/api/auth/updatepassword", {
				currentPassword,
				newPassword,
			});
			return { success: true };
		} catch (error) {
			const message = error.response?.data?.error || "Password update failed";
			setError(message);
			return { success: false, error: message };
		}
	};

	const value = {
		user,
		loading,
		error,
		login,
		logout,
		updatePassword,
		loadUser,
		isAdmin: user?.role === "admin",
		isUser: user?.role === "user",
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
