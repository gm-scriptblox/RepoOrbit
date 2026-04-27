import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Github, Eye, EyeOff, Shield, BookOpen, Loader2, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import api from "../utils/api";
import Button from "../components/Button";
import Input from "../components/Input";

export default function SetupPage() {
  const { login } = useApp();
  const [form, setForm] = useState({ username: "", token: "" });
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = "GitHub username is required";
    if (!form.token.trim()) errs.token = "Personal Access Token is required";
    else if (!form.token.startsWith("ghp_") && !form.token.startsWith("github_pat_")) {
      errs.token = "Token should start with ghp_ or github_pat_";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleTest() {
    if (!validate()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post("/auth/test", form);
      setTestResult({ success: true, user: res.data.user });
      toast.success("Connection successful!");
    } catch (err) {
      const message = err.response?.data?.error || "Connection test failed";
      setTestResult({ success: false, message });
      toast.error(message);
    } finally {
      setTesting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/credentials", form);
      login(res.data.sessionId, res.data.user);
      toast.success(`Welcome, ${res.data.user.name || res.data.user.login}!`);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to save credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gh-blue rounded-xl flex items-center justify-center">
              <Github size={26} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gh-text">RepoOrbit</h1>
          </div>
          <p className="text-gh-muted text-sm">GitHub Repository Manager</p>
        </div>

        <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gh-border">
            <h2 className="text-gh-text font-semibold">Connect to GitHub</h2>
            <p className="text-gh-muted text-xs mt-0.5">Enter your credentials to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Input
              label="GitHub Username"
              placeholder="octocat"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
              autoComplete="username"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-gh-text text-sm font-medium">Personal Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                  className={`
                    w-full bg-gh-bg border rounded px-3 py-2 pr-10 text-gh-text text-sm
                    placeholder-gh-muted outline-none transition-colors font-mono
                    ${errors.token ? "border-gh-danger" : "border-gh-border focus:border-gh-blue"}
                  `}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gh-muted hover:text-gh-text"
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.token && <p className="text-gh-danger text-xs">{errors.token}</p>}
            </div>

            {testResult && (
              <div className={`p-3 rounded border text-sm ${
                testResult.success
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {testResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>Connected as @{testResult.user?.login} ({testResult.user?.public_repos} repos)</span>
                  </div>
                ) : (
                  <span>{testResult.message}</span>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={handleTest}
                loading={testing}
                className="flex-1"
              >
                Test Connection
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Connect
              </Button>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gh-border bg-gh-elevated/30">
            <div className="flex items-start gap-2 text-xs text-gh-muted">
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-gh-accent" />
              <p>Your token is encrypted before storage. It is never exposed to the frontend or logged.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/tutorial"
            className="inline-flex items-center gap-1.5 text-gh-blue text-sm hover:underline"
          >
            <BookOpen size={14} />
            How to create a Personal Access Token?
          </Link>
        </div>
      </div>
    </div>
  );
}