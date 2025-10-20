"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(form.email, form.password); // password = cabang
    setLoading(false);
    if (res.ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(res.message || "Gagal login.");
    }
  };

  return (
    <div className="alfamart-login">
      <div className="card">
        <img
          className="logo"
          src="/alfamart-logo.png"
          alt="Alfamart"
          draggable="false"
        />
        <h1 className="title">Materai</h1>
        <p className="subtitle">Silakan login untuk melanjutkan</p>

        <form onSubmit={onSubmit}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="Masukkan email"
            autoComplete="username"
            required
          />

          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
            placeholder="Masukkan password "
            autoComplete="current-password"
            required
          />

          {error ? <div className="error">{error}</div> : null}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>

      <style>{`
        :root {
          --alfa-red: #e41f25;
          --alfa-red-dark: #c8161b;
          --alfa-yellow: #f7c600;
          --alfa-blue: #1f63af;
          --text-strong: #111827;
          --text-muted: #6b7280;
          --border: #e5e7eb;
          --bg: #f2f2f2;
        }

      .alfamart-login {
        position: fixed;      /* ⬅ menutup seluruh viewport */
        inset: 0;             /* top/right/bottom/left: 0 */
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg);/* warna latar login */
        padding: 24px;
        font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji";
        overflow: auto;      
        }


    .card {

      width: min(92vw, 400px); 
      max-width: 365px;

      background: #fff;
      border-radius: 14px;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 8px 30px rgba(0,0,0,0.06);
      padding: 24px 20px; /* bisa dikurangi untuk tampilan padat */
      border: 1px solid #f3f4f6;
      display: flex;
      flex-direction: column;
      justify-content: center; /* agar isi berada di tengah */
    }


        .logo {
          display: block;
          height: 38px;
          margin: 8px auto 18px auto;
          user-select: none;
        }

        .title {
          margin: 0;
          text-align: center;
          font-size: 22px;
          line-height: 1.2;
          color: var(--text-strong);
          font-weight: 700;
        }

        .subtitle {
          margin: 6px 0 26px 0;
          text-align: center;
          font-size: 14px;
          color: var(--text-muted);
        }

        /* Hapus garis merah dan kuning */
        .card::before,
        .card::after {
          display: none;
        }

        form {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .label {
          font-size: 13px;
          color: var(--text-strong);
          font-weight: 600;
        }

        .input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: box-shadow .15s ease, border-color .15s ease;
          background: #fff;
        }
        .input:focus {
          border-color: var(--alfa-blue);
          box-shadow: 0 0 0 3px rgba(31, 99, 175, 0.15);
        }

        .error {
          color: #b91c1c;
          background: #fee2e2;
          border: 1px solid #fecaca;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          margin-top: 4px;
        }

        .btn {
          margin-top: 8px;
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          background: var(--alfa-red);
          cursor: pointer;
          transition: background .15s ease, transform .02s ease;
        }
        .btn:hover { background: var(--alfa-red-dark); }
        .btn:active { transform: translateY(0.5px); }
        .btn:disabled { opacity: .7; cursor: not-allowed; }

        html, body {
  overflow: hidden;
}

@media (max-width: 380px){
  .card{ width: min(94vw, 360px); padding: 18px 16px; }
  .title{ font-size: 20px; }
  .input{ height: 40px; font-size: 13px; }
  .btn{ height: 44px; font-size: 14px; }
}

      `}</style>
    </div>
  );
}
