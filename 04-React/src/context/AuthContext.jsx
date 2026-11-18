import { createContext, useContext, useEffect, useMemo, useState } from "react";
const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3011";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  const signup = async ({ fullName, email, mobile, password }) => {
    const response = await fetch(`${API}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fullName, email, mobile, password }),
    });
    const data = await response.json();
    return data.ok ? { ok: true } : data;
  };

  const login = async (email, password) => {
    const response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.ok) setUser(data.user);
    return data.ok ? { ok: true } : data;
  };

  const logout = () => {
    fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" }).finally(() =>
      setUser(null),
    );
  };
  const updateProfile = async ({ fullName, email, mobile }) => {
    if (!user) return { ok: false };
    const response = await fetch(`${API}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fullName, email, mobile }),
    });
    const data = await response.json();
    if (data.ok) setUser(data.user);
    return data.ok ? { ok: true } : data;
  };
  const value = useMemo(
    () => ({ user, signup, login, logout, updateProfile }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
