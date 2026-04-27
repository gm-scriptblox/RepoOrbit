import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Repositories from "./pages/Repositories";
import Upload from "./pages/Upload";
import Tutorial from "./pages/Tutorial";
import Settings from "./pages/Settings";
import SetupPage from "./pages/SetupPage";

function AppRoutes() {
  const { session } = useApp();

  if (!session) {
    return (
      <Routes>
        <Route path="/tutorial" element={<Layout><Tutorial /></Layout>} />
        <Route path="*" element={<SetupPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/repositories" element={<Layout><Repositories /></Layout>} />
      <Route path="/upload" element={<Layout><Upload /></Layout>} />
      <Route path="/tutorial" element={<Layout><Tutorial /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gh-bg text-gh-text">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#161b22",
                color: "#e6edf3",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#238636", secondary: "#161b22" },
              },
              error: {
                iconTheme: { primary: "#da3633", secondary: "#161b22" },
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
}