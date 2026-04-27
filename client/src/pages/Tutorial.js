import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Key, Shield, AlertTriangle, ChevronDown, ChevronRight,
  ExternalLink, CheckCircle, Copy, Check,
} from "lucide-react";
import Card, { CardHeader, CardBody } from "../components/Card";
import Badge from "../components/Badge";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded text-gh-muted hover:text-gh-text hover:bg-gh-elevated transition-colors"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-gh-accent" /> : <Copy size={14} />}
    </button>
  );
}

function Step({ number, title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gh-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gh-surface hover:bg-gh-elevated transition-colors text-left"
      >
        <div className="w-6 h-6 rounded-full bg-gh-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </div>
        <span className="text-gh-text font-medium text-sm flex-1">{title}</span>
        {open ? <ChevronDown size={16} className="text-gh-muted" /> : <ChevronRight size={16} className="text-gh-muted" />}
      </button>
      {open && (
        <div className="px-4 py-3 bg-gh-bg text-gh-muted text-sm space-y-2 border-t border-gh-border">
          {children}
        </div>
      )}
    </div>
  );
}

function ScopeRow({ scope, description, required }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gh-border last:border-0">
      <div className="flex items-start gap-3">
        <code className="bg-gh-elevated px-2 py-0.5 rounded text-xs text-gh-blue font-mono flex-shrink-0">{scope}</code>
        <span className="text-gh-muted text-sm">{description}</span>
      </div>
      <Badge variant={required ? "green" : "gray"}>
        {required ? "Required" : "Optional"}
      </Badge>
    </div>
  );
}

export default function Tutorial() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={20} className="text-gh-blue" />
          <h1 className="text-2xl font-bold text-gh-text">Getting Started Guide</h1>
        </div>
        <p className="text-gh-muted text-sm">
          Learn how to create a GitHub Personal Access Token and start using RepoOrbit.
        </p>
      </div>

      <div className="p-4 bg-gh-blue/10 border border-gh-blue/20 rounded-lg flex gap-3">
        <Key size={18} className="text-gh-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-gh-text font-semibold text-sm mb-1">What is a Personal Access Token?</p>
          <p className="text-gh-muted text-sm">
            A GitHub Personal Access Token (PAT) is like a password for your GitHub account that you can
            give to applications. Unlike your actual password, PATs have specific permissions (scopes) and
            can be revoked individually without changing your main password. RepoOrbit uses your PAT to
            interact with GitHub on your behalf — creating repos, uploading files, and managing your projects.
          </p>
        </div>
      </div>

      <div className="p-4 bg-gh-danger/10 border border-gh-danger/20 rounded-lg flex gap-3">
        <AlertTriangle size={18} className="text-gh-danger flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-gh-text font-semibold text-sm mb-1">Security Warning</p>
          <ul className="text-gh-muted text-sm space-y-1 list-disc list-inside">
            <li>Never share your token with anyone</li>
            <li>Never commit your token to a repository</li>
            <li>Never paste it in public forums or chat</li>
            <li>Revoke immediately if you suspect it was compromised</li>
            <li>RepoOrbit encrypts your token — it's never stored in plain text</li>
          </ul>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-gh-text font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gh-blue text-white text-xs font-bold flex items-center justify-center">1</span>
            Step-by-Step: Create Your Personal Access Token
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <Step number="1" title="Log in to GitHub">
            <p>Go to <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gh-blue hover:underline inline-flex items-center gap-1">github.com <ExternalLink size={11} /></a> and sign in to your account.</p>
          </Step>

          <Step number="2" title="Open Settings">
            <p>Click on your profile picture in the top-right corner, then select <strong className="text-gh-text">Settings</strong> from the dropdown menu.</p>
          </Step>

          <Step number="3" title="Navigate to Developer Settings">
            <p>Scroll down the left sidebar and click on <strong className="text-gh-text">Developer settings</strong> at the very bottom.</p>
          </Step>

          <Step number="4" title="Access Personal Access Tokens">
            <p>In the left sidebar, click <strong className="text-gh-text">Personal access tokens</strong>, then click <strong className="text-gh-text">Tokens (classic)</strong>.</p>
            <p className="mt-1">You can also use Fine-grained tokens, but classic tokens are simpler for beginners.</p>
          </Step>

          <Step number="5" title="Generate New Token">
            <p>Click the <strong className="text-gh-text">Generate new token</strong> button, then select <strong className="text-gh-text">Generate new token (classic)</strong>.</p>
            <p className="mt-1">GitHub may ask you to confirm your password.</p>
          </Step>

          <Step number="6" title="Configure Your Token">
            <p>Fill in the form:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong className="text-gh-text">Note:</strong> Give it a descriptive name like "RepoOrbit Access"</li>
              <li><strong className="text-gh-text">Expiration:</strong> Choose an appropriate expiration (90 days recommended)</li>
              <li><strong className="text-gh-text">Scopes:</strong> Select the required scopes listed below</li>
            </ul>
          </Step>

          <Step number="7" title="Copy Your Token">
            <p className="text-gh-warning">This is the only time you will see your token. Copy it immediately and store it somewhere safe.</p>
            <p className="mt-1">Click <strong className="text-gh-text">Generate token</strong>, then copy the token (it starts with <code className="bg-gh-elevated px-1 rounded text-xs font-mono text-gh-blue">ghp_</code>).</p>
          </Step>

          <Step number="8" title="Add to RepoOrbit">
            <p>Go to the <Link to="/settings" className="text-gh-blue hover:underline">Settings page</Link> in RepoOrbit, paste your username and token, then click Connect.</p>
          </Step>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-gh-text font-semibold flex items-center gap-2">
            <Shield size={16} className="text-gh-accent" />
            Required Token Scopes
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gh-border px-4">
            <ScopeRow
              scope="repo"
              description="Full control of private repositories. Required for creating repos, uploading files, and managing repository content."
              required
            />
            <ScopeRow
              scope="repo:status"
              description="Access commit status. Included in the repo scope."
              required={false}
            />
            <ScopeRow
              scope="workflow"
              description="Required to update GitHub Actions workflow files. Needed if you upload .github/workflows/ files."
              required={false}
            />
            <ScopeRow
              scope="delete_repo"
              description="Required only if you want to delete repositories through RepoOrbit."
              required={false}
            />
            <ScopeRow
              scope="read:org"
              description="Read organization membership. Useful if working with organization repositories."
              required={false}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-gh-text font-semibold">Quick Reference</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gh-text text-sm font-medium">Token Settings URL</p>
              <p className="text-gh-muted text-xs">Direct link to create a new token</p>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-gh-elevated px-2 py-1 rounded text-xs text-gh-muted font-mono">
                github.com/settings/tokens/new
              </code>
              <CopyButton text="https://github.com/settings/tokens/new" />
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gh-text text-sm font-medium">Minimum Scope</p>
              <p className="text-gh-muted text-xs">For basic RepoOrbit functionality</p>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-gh-elevated px-2 py-1 rounded text-xs text-gh-blue font-mono">repo</code>
              <CopyButton text="repo" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-gh-text font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-gh-accent" />
            How RepoOrbit Protects Your Token
          </h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-gh-muted">
          <div className="flex gap-3 p-3 bg-gh-elevated rounded">
            <CheckCircle size={15} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gh-text font-medium">AES-256-GCM Encryption</p>
              <p>Your token is encrypted using AES-256-GCM before being stored in memory. The raw token never touches persistent storage.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gh-elevated rounded">
            <CheckCircle size={15} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gh-text font-medium">Server-Side API Calls</p>
              <p>All GitHub API requests are made from the backend. Your token is never sent to or stored in the browser.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gh-elevated rounded">
            <CheckCircle size={15} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gh-text font-medium">Session-Based Authentication</p>
              <p>You receive a session ID (UUID) after connecting. Sessions automatically expire after 24 hours.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gh-elevated rounded">
            <CheckCircle size={15} className="text-gh-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gh-text font-medium">Zero Logging</p>
              <p>Tokens are never logged, printed, or exposed in error messages or stack traces.</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="text-center pt-2">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 bg-gh-blue hover:bg-gh-blue-hover text-white px-5 py-2.5 rounded font-medium text-sm transition-colors"
        >
          <Key size={15} />
          Connect Your GitHub Account
        </Link>
      </div>
    </div>
  );
}