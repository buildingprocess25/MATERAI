"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { SHEETS_WEB_APP_URL } from "../utils/constants"; // ← pastikan URL web app kamu benar

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("materai_auth");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // email = username; password = cabang
const login = async (email, cabangAsPassword) => {
  try {
    const url = new URL(SHEETS_WEB_APP_URL);
    url.searchParams.set("action", "login");
    url.searchParams.set("email", email);
    url.searchParams.set("cabang", cabangAsPassword);

    const res = await fetch(url.toString(), { method: "GET" });
    const json = await res.json();

    if (json?.ok) {
      const profile = {
        email,
        cabang: cabangAsPassword,
        loggedInAt: Date.now(),
      };
      localStorage.setItem("materai_auth", JSON.stringify(profile));
      setUser(profile);
      return { ok: true };
    }
    return { ok: false, message: json?.message || "Email atau password salah" };
  } catch (err) {
    return { ok: false, message: err.message || "Gagal login" };
  }
};

  const logout = () => {
    localStorage.removeItem("materai_auth");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus di dalam <AuthProvider>");
  return ctx;
}
