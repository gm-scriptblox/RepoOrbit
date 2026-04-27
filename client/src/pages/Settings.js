import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon, Shield, Eye, EyeOff, CheckCircle,
  AlertCircle, LogOut, RefreshCw, Key, User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import api from "../utils/api";
import Card, { CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";

export default function Settings() {
  const { user, session, login, logout } = useApp();
  const [form, setForm] = useState({ username: user?.login || "", token: "" });
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (form.token && !form.token.startsWith("ghp_") && !form.token.startsWith("github_pat_")) {
      errs.token = "Token should start with ghp_ or github_pat_";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleTest() {
    if (!form.username || !form.token) {
      toast.error("Enter username and token to test");
      return;
    }
    if (!validate()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post("/auth/test", { username: form.username, token: form.token });
      setTestResult({ success: true, user: res.data.user });
      toast.success("Connection successful!");
    } catch (err) {
      const message = err.response?.data?.error || "Test failed";
      setTestResult({ success: false, message });
      toast.error(message);
    } finally {
      setTesting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!form.token) {
      toast.error("Enter a new token to update credentials");
      return;
    }
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/credentials", { username: form.username, token: form.token });
      login(res.data.sessionId, res.data.user);
      toast.success("Credentials updated successfully!");
      setForm({ username: res.data.user.login, token: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon size={20} className="text-gh-blue" />
          <h1 className="text-2xl font-bold text-gh-text">Settings</h1>
        </div>
        <p className="text-gh-muted text-sm">Manage your GitHub credentials and account connection</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-gh-text font-semibold flex items-center gap-2">
              <User size={15} className="text-gh-blue" />
              Connected Account
            </h2>
            <Badge variant={session ? "green" : "red"}>
              {session ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        {user && (
          <CardBody className="flex items-center gap-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-14 h-14 rounded-full border-2 border-gh-border"
            />
            <div className="flex-1">
              <p className="text-gh-text font-semibold">{user.name || user.login}</p>
              <p className="text-gh-muted text-sm">@{user.login}</p>
              <p className="text-gh-muted text-xs mt-0.5">{user.public_repos} public repositories</p>
            </div>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gh-blue text-xs hover:underline"
            >
              View Profile →
            </a>
          </CardBody>
        )}
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-gh-text font-semibold flex items-center gap-2">
            <Key size={15} className="text-gh-blue" />
            Update Credentials
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="GitHub Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-gh-text text-sm font-medium">New Personal Access Token</label>
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
              <p className="text-gh-muted text-xs">Leave blank to keep current token</p>
            </div>

            {testResult && (
              <div className={`p-3 rounded border text-sm flex items-start gap-2 ${
                testResult.success
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {testResult.success
                  ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                  : <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                }
                <span>
                  {testResult.success
                    ? `Connected as @${testResult.user?.login}`
                    : testResult.message
                  }
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleTest}
                loading={testing}
                icon={<RefreshCw />}
                className="flex-1"
              >
                Test Connection
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Update Credentials
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-gh-text font-semibold flex items-center gap-2">
            <Shield size={15} className="text-gh-accent" />
            Security Information
          </h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-gh-muted">
          <div className="flex gap-3">
            <CheckCircle size={14} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <p>Your token is encrypted with AES-256-GCM before any storage</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={14} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <p>The raw token is never sent to or stored in the browser</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={14} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <p>All GitHub API calls are proxied through the backend</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={14} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <p>Sessions automatically expire after 24 hours</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle size={14} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <p>Tokens are never logged or included in error messages</p>
          </div>
        </CardBody>
      </Card>

      <Card className="border-gh-danger/30">
        <CardHeader>
          <h2 className="text-gh-text font-semibold flex items-center gap-2">
            <LogOut size={15} className="text-gh-danger" />
            Disconnect Account
          </h2>
        </CardHeader>
        <CardBody>
          <p className="text-gh-muted text-sm mb-4">
            This will clear your session and credentials from the server. You will need to re-enter your token to use RepoOrbit again.
          </p>
          <Button variant="danger" onClick={logout} icon={<LogOut />}>
            Disconnect GitHub Account
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}