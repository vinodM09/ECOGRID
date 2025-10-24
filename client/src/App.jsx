import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import Faults from "./pages/Faults";
import About from "./pages/About";
import { TelemetryProvider } from "./context/TelemetryContext";

export default function App() {
  const TB_DEVICE_UUID = import.meta.env.VITE_THINGSBOARD_DEVICE_UUID;
  return (
    <AuthProvider>
          <TelemetryProvider deviceId={TB_DEVICE_UUID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/faults" element={<Faults />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<div className="p-6">Not found</div>} />
        </Routes>
      </BrowserRouter>
      </TelemetryProvider>
    </AuthProvider>
  );
}