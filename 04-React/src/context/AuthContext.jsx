import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(null);
const USERS_KEY = 'railgo_demo_users';
const SESSION_KEY = 'railgo_demo_session';

const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));

  useEffect(() => {
    if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const signup = async ({ fullName, email, mobile, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readJson(USERS_KEY, []);
    if (users.some((account) => account.email === normalizedEmail)) {
      return { ok: false, field: 'email', message: 'An account with this email already exists. Try logging in instead.' };
    }

    const account = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobile: mobile.replace(/[\s()-]/g, ''),
      passwordHash: await bcrypt.hash(password, 10),
    };
    window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
    return { ok: true };
  };

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = readJson(USERS_KEY, []).find((item) => item.email === normalizedEmail);
    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      return { ok: false, message: 'We could not match that email and password. Check your details and try again.' };
    }
    const session = { id: account.id, fullName: account.fullName, email: account.email, mobile: account.mobile };
    setUser(session);
    return { ok: true };
  };

  const logout = () => setUser(null);
  const value = useMemo(() => ({ user, signup, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
