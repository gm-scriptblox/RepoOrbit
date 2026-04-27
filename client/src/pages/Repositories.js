import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  GitBranch, Plus, Trash2, Globe, Lock, ExternalLink,
  RefreshCw, Search, Star, GitFork, AlertTriangle, X, Check,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import api from "../utils/api";
import Card, { CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";

function CreateRepoModal({ onClose, onCreated }) {
  const { session } = useApp();
  const [form, setForm] = useState({
    name: "",
    description: "",
    isPrivate: false,
    initReadme: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Repository name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/repos", form, {
        headers: { "x-session-id": session.id },
      });
      toast.success(`Repository "${res.data.name}" created!`);
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create repository");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-gh-surface border border-gh-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border">
          <div className="flex items-center gap-2">
            <Plus size={17} className="text-gh-accent" />
            <h2 className="text-gh-text font-semibold">Create Repository</h2>
          </div>
          <button onClick={onClose} className="text-gh-muted hover:text-gh-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Repository Name *"
            placeholder="my-awesome-project"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={error}
            hint="Only letters, numbers, hyphens, underscores, and dots"
          />

          <Input
            label="Description"
            placeholder="A short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  !form.isPrivate ? "bg-gh-blue border-gh-blue" : "border-gh-border bg-transparent"
                }`}
                onClick={() => setForm({ ...form, isPrivate: false })}
              >
                {!form.isPrivate && <Check size={12} className="text-white" />}
              </div>
              <div onClick={() => setForm({ ...form, isPrivate: false })}>
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-gh-accent" />
                  <span className="text-gh-text text-sm font-medium">Public</span>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  form.isPrivate ? "bg-gh-blue border-gh-blue" : "border-gh-border bg-transparent"
                }`}
                onClick={() => setForm({ ...form, isPrivate: true })}
              >
                {form.isPrivate && <Check size={12} className="text-white" />}
              </div>
              <div onClick={() => setForm({ ...form, isPrivate: true })}>
                <div className="flex items-center gap-1.5">
                  <Lock size={13} className="text-gh-muted" />
                  <span className="text-gh-text text-sm font-medium">Private</span>
                </div>
              </div>
            </label>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.initReadme}
              onChange={(e) => setForm({ ...form, initReadme: e.target.checked })}
              className="w-4 h-4 accent-gh-blue"
            />
            <span className="text-gh-text text-sm">Initialize with README</span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Repository
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ repo, onClose, onDeleted }) {
  const { session } = useApp();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState("");

  async function handleDelete() {
    if (confirm !== repo.name) return;
    setLoading(true);
    try {
      await api.delete(`/repos/${repo.full_name.split("/")[0]}/${repo.name}`, {
        headers: { "x-session-id": session.id },
      });
      toast.success(`Repository "${repo.name}" deleted`);
      onDeleted(repo.name);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete repository");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-gh-surface border border-gh-danger/50 rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border">
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-gh-danger" />
            <h2 className="text-gh-text font-semibold">Delete Repository</h2>
          </div>
          <button onClick={onClose} className="text-gh-muted hover:text-gh-text">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 bg-gh-danger/10 border border-gh-danger/20 rounded text-sm text-red-400">
            This action cannot be undone. This will permanently delete the <strong>{repo.name}</strong> repository.
          </div>
          <Input
            label={`Type "${repo.name}" to confirm`}
            placeholder={repo.name}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={loading}
              disabled={confirm !== repo.name}
              className="flex-1"
            >
              Delete Repository
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Repositories() {
  const { repos, fetchRepos, reposLoading, setRepos } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRepos().catch(() => toast.error("Failed to load repositories"));
  }, []);

  const filtered = repos.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "public" && !r.private) ||
      (filter === "private" && r.private);
    return matchSearch && matchFilter;
  });

  function handleCreated(newRepo) {
    setRepos((prev) => [newRepo, ...prev]);
    setShowCreate(false);
  }

  function handleDeleted(repoName) {
    setRepos((prev) => prev.filter((r) => r.name !== repoName));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gh-text">Repositories</h1>
          <p className="text-gh-muted text-sm mt-0.5">{repos.length} repositories found</p>
        </div>
        <Button icon={<Plus />} onClick={() => setShowCreate(true)}>
          New Repository
        </Button>
      </div>

      <Card>
        <CardBody className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-muted" />
            <input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gh-bg border border-gh-border rounded px-3 py-2 pl-9 text-gh-text text-sm placeholder-gh-muted outline-none focus:border-gh-blue transition-colors"
            />
          </div>
          <div className="flex gap-1">
            {["all", "public", "private"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-gh-blue text-white"
                    : "text-gh-muted hover:text-gh-text hover:bg-gh-elevated"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="md"
            icon={<RefreshCw />}
            onClick={() => fetchRepos().catch(() => toast.error("Failed to refresh"))}
            loading={reposLoading}
          >
            Refresh
          </Button>
        </CardBody>
      </Card>

      {reposLoading && repos.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-gh-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <GitBranch size={40} className="text-gh-muted mx-auto mb-4" />
          <p className="text-gh-muted">
            {search ? `No repositories matching "${search}"` : "No repositories found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((repo) => (
            <Card key={repo.id} className="hover:border-gh-blue/40 transition-colors">
              <CardBody className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gh-blue font-semibold hover:underline flex items-center gap-1.5"
                    >
                      {repo.name}
                      <ExternalLink size={12} />
                    </a>
                    <Badge variant={repo.private ? "gray" : "green"}>
                      {repo.private ? "Private" : "Public"}
                    </Badge>
                    {repo.language && (
                      <Badge variant="blue">{repo.language}</Badge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-gh-muted text-sm mb-2 line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gh-muted">
                    <span className="flex items-center gap-1">
                      <Star size={12} />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} />
                      {repo.forks_count}
                    </span>
                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    <span className="font-mono">{repo.default_branch}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setDeleteTarget(repo)}
                    className="p-1.5 text-gh-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                    title="Delete repository"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateRepoModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          repo={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}