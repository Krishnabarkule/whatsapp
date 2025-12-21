import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

type User = {
	id: string;
	username: string;
	role: "ADMIN" | "USER";
	phone?: string;
	planExpiry?: string;
};

type AuthCtx = {
	user: User | null;
	token: string | null;
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("AuthContext missing");
	return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(() =>
		localStorage.getItem("wm_token")
	);

	const login = async (username: string, password: string) => {
		try {
			const { data } = await api.post("/api/auth/login", {
				username,
				password,
			});
			setUser(data.user);
			setToken(data.token);
			localStorage.setItem("wm_token", data.token);
		} catch (e: any) {
			if (e?.response?.data?.message === "EXPIRED") {
				throw new Error(
					"Your plan has been expired, kindly contact your admin."
				);
			}
			throw new Error("Invalid credentials");
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("wm_token");
	};

	const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
