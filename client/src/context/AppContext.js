import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../utils/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem("reporbit_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("reporbit_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (session) {
      localStorage.setItem("reporbit_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("reporbit_session");
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("reporbit_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("reporbit_user");
    }
  }, [user]);

  const login = useCallback((sessionId, userData) => {
    setSession({ id: sessionId });
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    if (session?.id) {
      try {
        await api.delete("/auth/credentials", {
          headers: { "x-session-id": session.id },
        });
      } catch {}
    }
    setSession(null);
    setUser(null);
    setRepos([]);
    localStorage.removeItem("reporbit_session");
    localStorage.removeItem("reporbit_user");
  }, [session]);

  const fetchRepos = useCallback(async () => {
    if (!session?.id) return;
    setReposLoading(true);
    try {
      const response = await api.get("/repos", {
        headers: { "x-session-id": session.id },
      });
      setRepos(response.data);
    } catch (err) {
      throw err;
    } finally {
      setReposLoading(false);
    }
  }, [session]);

  return (
    <AppContext.Provider value={{
      session,
      user,
      repos,
      reposLoading,
      darkMode,
      setDarkMode,
      login,
      logout,
      fetchRepos,
      setRepos,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}