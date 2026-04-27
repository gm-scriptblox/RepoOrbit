import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { GitBranch, Upload, Lock, Globe, RefreshCw, ExternalLink, TrendingUp, FolderGit2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import Card, { CardHeader, CardBody } from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colorMap = {
    blue: "text-gh-blue bg-gh-blue/10",
    green: "text-gh-accent bg-gh-accent/10",
    orange: "text-orange-400 bg-orange-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-gh-muted text-xs">{label}</p>
        <p className="text-gh-text text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user, repos, fetchRepos, reposLoading } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (repos.length === 0) {
      fetchRepos().catch(() => toast.error("Failed to load repositories"));
    }
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchRepos();
      toast.success("Refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  }

  const publicRepos = repos.filter((r) => !r.private).length;
  const privateRepos = repos.filter((r) => r.private).length;
  const recentRepos = repos.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gh-text">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-gh-muted text-sm mt-0.5">Here's an overview of your GitHub activity</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={refreshing ? "animate-spin" : ""} />}
          onClick={handleRefresh}
          loading={reposLoading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Repos" value={repos.length} icon={FolderGit2} color="blue" />
        <StatCard label="Public" value={publicRepos} icon={Globe} color="green" />
        <StatCard label="Private" value={privateRepos} icon={Lock} color="orange" />
        <StatCard label="Followers" value={user?.followers || 0} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-gh-blue" />
                <h2 className="text-gh-text font-semibold text-sm">Recent Repositories</h2>
              </div>
              <Link to="/repositories" className="text-gh-blue text-xs hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {reposLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw size={20} className="animate-spin text-gh-muted" />
                </div>
              ) : recentRepos.length === 0 ? (
                <div className="py-12 text-center">
                  <FolderGit2 size={32} className="text-gh-muted mx-auto mb-3" />
                  <p className="text-gh-muted text-sm">No repositories yet</p>
                  <Link to="/repositories" className="text-gh-blue text-xs hover:underline mt-1 block">
                    Create your first repo
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gh-border">
                  {recentRepos.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between px-4 py-3 hover:bg-gh-elevated/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gh-blue text-sm font-medium hover:underline truncate"
                          >
                            {repo.name}
                          </a>
                          <Badge variant={repo.private ? "gray" : "green"}>
                            {repo.private ? "Private" : "Public"}
                          </Badge>
                        </div>
                        {repo.description && (
                          <p className="text-gh-muted text-xs mt-0.5 truncate">{repo.description}</p>
                        )}
                        <p className="text-gh-muted text-xs mt-1">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gh-muted hover:text-gh-text ml-3"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-gh-text font-semibold text-sm">Quick Actions</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              <Link
                to="/repositories"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded bg-gh-elevated hover:bg-gh-border transition-colors text-sm text-gh-text"
              >
                <GitBranch size={15} className="text-gh-blue" />
                Create Repository
              </Link>
              <Link
                to="/upload"
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded bg-gh-elevated hover:bg-gh-border transition-colors text-sm text-gh-text"
              >
                <Upload size={15} className="text-gh-accent" />
                Upload Files
              </Link>
            </CardBody>
          </Card>

          {user && (
            <Card>
              <CardBody className="flex flex-col items-center text-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-16 h-16 rounded-full border-2 border-gh-border"
                />
                <div>
                  <p className="text-gh-text font-semibold">{user.name || user.login}</p>
                  <p className="text-gh-muted text-xs">@{user.login}</p>
                </div>
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gh-blue text-xs hover:underline"
                >
                  <ExternalLink size={12} />
                  View GitHub Profile
                </a>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}