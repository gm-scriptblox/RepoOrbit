import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  GitBranch,
  Upload,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Github,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/repositories", label: "Repositories", icon: GitBranch },
  { path: "/upload", label: "Upload", icon: Upload },
  { path: "/tutorial", label: "Tutorial", icon: BookOpen },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gh-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-gh-surface border-r border-gh-border
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gh-border">
            <div className="w-8 h-8 bg-gh-blue rounded-full flex items-center justify-center">
              <Github size={18} className="text-white" />
            </div>
            <span className="text-gh-text font-semibold text-lg">RepoOrbit</span>
            <button
              className="ml-auto lg:hidden text-gh-muted hover:text-gh-text"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gh-border bg-gh-elevated/50">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-gh-text text-sm font-medium truncate">{user.name || user.login}</p>
                <p className="text-gh-muted text-xs truncate">@{user.login}</p>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-gh-blue/20 text-gh-blue-hover border border-gh-blue/30"
                      : "text-gh-muted hover:text-gh-text hover:bg-gh-elevated"
                    }
                  `}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="px-2 py-3 border-t border-gh-border">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm font-medium text-gh-muted hover:text-gh-danger hover:bg-gh-danger/10 transition-colors"
            >
              <LogOut size={17} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-gh-surface border-b border-gh-border px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gh-muted hover:text-gh-text"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Github size={18} className="text-gh-blue" />
            <span className="font-semibold">RepoOrbit</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}