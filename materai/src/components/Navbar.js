"use client";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

if (!isAuthenticated || location.pathname === "/login") return null;


  return (
    <nav className="nav">
      <Link
        to="/dashboard"
        aria-current={location.pathname === "/dashboard" ? "page" : undefined}
      >
        Dashboard
      </Link>
      <Link
        to="/buat-dokumen"
        aria-current={
          location.pathname === "/buat-dokumen" ? "page" : undefined
        }
      >
        Buat Dokumen
      </Link>
      <Link
        to="/hasil-dokumen"
        aria-current={
          location.pathname === "/hasil-dokumen" ? "page" : undefined
        }
      >
        Hasil
      </Link>
      <span className="badge" title="Pengguna aktif">
        {user?.name || user?.username}
      </span>
      <button className="ghost" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
