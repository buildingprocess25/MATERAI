"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { SHEETS_WEB_APP_URL } from "../utils/constants"; // ← pastikan URL web app kamu benar

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Baca dari key baru: MATERAI_USER (fallback materai_auth)
    const raw =
      localStorage.getItem("MATERAI_USER") ||
      localStorage.getItem("materai_auth");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // AFTER (ganti fungsi login saja)
  const login = async (email, cabangAsPassword) => {
    try {
      const url = new URL(SHEETS_WEB_APP_URL);
      url.searchParams.set("action", "login");
      url.searchParams.set("email", email);
      url.searchParams.set("cabang", cabangAsPassword);
      url.searchParams.set("ts", Date.now().toString()); // cache buster

      const res = await fetch(url.toString(), {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        redirect: "follow",
        referrerPolicy: "no-referrer",
      });

      // Jika bukan 200, tampilkan body mentah biar kelihatan errornya
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, message: `HTTP ${res.status}: ${text}` };
      }

      let json;
      try {
        json = await res.json();
      } catch {
        const text = await res.text();
        return { ok: false, message: `Respon bukan JSON: ${text}` };
      }

      // Bersihkan sesi lama
      localStorage.removeItem("MATERAI_USER");
      localStorage.removeItem("materai_auth");

      if (json?.ok && json?.data?.email && json?.data?.cabang) {
        const profile = {
          email: String(json.data.email),
          cabang: String(json.data.cabang).toUpperCase(),
          loggedInAt: Date.now(),
        };
        localStorage.setItem("MATERAI_USER", JSON.stringify(profile));
        localStorage.setItem("materai_auth", JSON.stringify(profile)); // kompat lama
        setUser(profile);
        return { ok: true, data: profile };
      }

      return {
        ok: false,
        message: json?.message || "Email atau password salah",
      };
    } catch (err) {
      return { ok: false, message: err.message || "Gagal login" };
    }
  };

  const logout = () => {
    localStorage.removeItem("MATERAI_USER");
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
