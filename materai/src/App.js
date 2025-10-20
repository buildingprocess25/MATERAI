"use client";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateDocument from "./pages/CreateDocument";
import ViewResults from "./pages/ViewResults";

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <Navbar />
          </div>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/buat-dokumen"
              element={
                <RequireAuth>
                  <CreateDocument />
                </RequireAuth>
              }
            />
            <Route
              path="/hasil-dokumen"
              element={
                <RequireAuth>
                  <ViewResults />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>


      </div>
    </AuthProvider>
  );
}
