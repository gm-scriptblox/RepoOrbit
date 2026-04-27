import React, { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Upload as UploadIcon, FolderUp, FileUp, X, CheckCircle,
  AlertCircle, Loader2, GitBranch, ChevronDown, File, Folder,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import api from "../utils/api";
import { processFileList, formatFileSize, getFileIcon } from "../utils/fileUtils";
import Card, { CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";

function FileTree({ files }) {
  const tree = {};
  files.forEach((f) => {
    const parts = f.path.split("/");
    let node = tree;
    parts.forEach((part, i) => {
      if (!node[part]) {
        node[part] = i === parts.length - 1 ? { __file: f } : {};
      }
      node = node[part];
    });
  });

  function renderNode(node, depth = 0) {
    return Object.entries(node).map(([key, value]) => {
      const isFile = value.__file;
      return (
        <div key={key} style={{ paddingLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-2 py-1 text-sm">
            {isFile ? (
              <>
                <span>{getFileIcon(key)}</span>
                <span className="text-gh-text">{key}</span>
                <span className="text-gh-muted text-xs ml-auto">{formatFileSize(value.__file.size)}</span>
              </>
            ) : (
              <>
                <Folder size={14} className="text-yellow-400" />
                <span className="text-gh-text font-medium">{key}</span>
              </>
            )}
          </div>
          {!isFile && renderNode(value, depth + 1)}
        </div>
      );
    });
  }

  return (
    <div className="max-h-48 overflow-y-auto p-3 bg-gh-bg rounded border border-gh-border font-mono text-xs">
      {renderNode(tree)}
    </div>
  );
}

function ProgressBar({ progress, status }) {
  const colorMap = {
    uploading: "bg-gh-blue",
    success: "bg-gh-accent",
    error: "bg-gh-danger",
    idle: "bg-gh-blue",
  };
  return (
    <div className="w-full bg-gh-elevated rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${colorMap[status]}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Upload() {
  const { session, repos, fetchRepos } = useApp();
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [branches, setBranches] = useState([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (repos.length === 0) {
      fetchRepos().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!selectedRepo) {
      setBranches([]);
      setBranch("main");
      return;
    }
    const repo = repos.find((r) => r.name === selectedRepo);
    if (!repo) return;
    setBranch(repo.default_branch || "main");
    api.get(`/repos/${repo.full_name.split("/")[0]}/${selectedRepo}/branches`, {
      headers: { "x-session-id": session.id },
    })
      .then((res) => setBranches(res.data))
      .catch(() => setBranches([]));
  }, [selectedRepo]);

  const processDroppedItems = useCallback(async (dataTransferItems) => {
    const fileList = [];
    async function processEntry(entry, path = "") {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file) => {
            fileList.push({ file, path: path ? `${path}/${file.name}` : file.name });
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        return new Promise((resolve) => {
          reader.readEntries(async (entries) => {
            for (const e of entries) {
              await processEntry(e, path ? `${path}/${entry.name}` : entry.name);
            }
            resolve();
          });
        });
      }
    }

    for (const item of dataTransferItems) {
      const entry = item.webkitGetAsEntry();
      if (entry) await processEntry(entry);
    }

    const processed = [];
    for (const { file, path } of fileList) {
      try {
        const { readFileAsArrayBuffer, arrayBufferToBase64 } = await import("../utils/fileUtils");
        const buffer = await readFileAsArrayBuffer(file);
        const content = arrayBufferToBase64(buffer);
        processed.push({ path, content, name: file.name, size: file.size });
      } catch {}
    }
    return processed;
  }, []);

  async function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const items = Array.from(e.dataTransfer.items);
    if (items.length === 0) return;
    try {
      const processed = await processDroppedItems(items);
      setFiles((prev) => mergeFiles(prev, processed));
      if (processed.length > 0) {
        toast.success(`Added ${processed.length} file${processed.length > 1 ? "s" : ""}`);
      }
    } catch {
      toast.error("Failed to process dropped files");
    }
  }

  function mergeFiles(existing, newFiles) {
    const map = new Map(existing.map((f) => [f.path, f]));
    newFiles.forEach((f) => map.set(f.path, f));
    return Array.from(map.values());
  }

  async function handleFileSelect(e) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    try {
      const processed = await processFileList(fileList, false);
      setFiles((prev) => mergeFiles(prev, processed));
      toast.success(`Added ${processed.length} file${processed.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to process files");
    }
    e.target.value = "";
  }

  async function handleFolderSelect(e) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    try {
      const processed = await processFileList(fileList, true);
      setFiles((prev) => mergeFiles(prev, processed));
      toast.success(`Added ${processed.length} files from folder`);
    } catch {
      toast.error("Failed to process folder");
    }
    e.target.value = "";
  }

  function removeFile(path) {
    setFiles((prev) => prev.filter((f) => f.path !== path));
  }

  async function handleUpload() {
    if (!selectedRepo) {
      toast.error("Please select a repository");
      return;
    }
    if (files.length === 0) {
      toast.error("Please add files to upload");
      return;
    }
    const repo = repos.find((r) => r.name === selectedRepo);
    if (!repo) {
      toast.error("Selected repository not found");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatus("uploading");
    setResults(null);

    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      batches.push(files.slice(i, i + BATCH_SIZE));
    }

    const allResults = [];
    const allErrors = [];

    try {
      const owner = repo.full_name.split("/")[0];
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const res = await api.post(
          "/files/upload",
          {
            owner,
            repo: selectedRepo,
            branch,
            commitMessage: commitMessage || `Upload via RepoOrbit`,
            files: batch,
          },
          { headers: { "x-session-id": session.id } }
        );
        allResults.push(...(res.data.results || []));
        allErrors.push(...(res.data.errors || []));
        setProgress(Math.round(((i + 1) / batches.length) * 100));
      }

      setResults({ uploaded: allResults.length, failed: allErrors.length, results: allResults, errors: allErrors });
      setUploadStatus(allErrors.length === 0 ? "success" : "error");

      if (allErrors.length === 0) {
        toast.success(`Successfully uploaded ${allResults.length} file${allResults.length > 1 ? "s" : ""}!`);
      } else {
        toast.error(`${allErrors.length} file${allErrors.length > 1 ? "s" : ""} failed to upload`);
      }
    } catch (err) {
      setUploadStatus("error");
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFiles([]);
    setResults(null);
    setProgress(0);
    setUploadStatus("idle");
    setCommitMessage("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gh-text">Upload Files</h1>
        <p className="text-gh-muted text-sm mt-0.5">Upload files or entire folders to your GitHub repositories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-gh-text font-semibold text-sm flex items-center gap-2">
                <GitBranch size={15} className="text-gh-blue" />
                Target Repository
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gh-text text-sm font-medium">Repository</label>
                  <div className="relative">
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-full bg-gh-bg border border-gh-border rounded px-3 py-2 text-gh-text text-sm outline-none focus:border-gh-blue appearance-none pr-8"
                    >
                      <option value="">Select repository...</option>
                      {repos.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gh-muted pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gh-text text-sm font-medium">Branch</label>
                  <div className="relative">
                    {branches.length > 0 ? (
                      <>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full bg-gh-bg border border-gh-border rounded px-3 py-2 text-gh-text text-sm outline-none focus:border-gh-blue appearance-none pr-8"
                        >
                          {branches.map((b) => (
                            <option key={b.name} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gh-muted pointer-events-none" />
                      </>
                    ) : (
                      <input
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className="w-full bg-gh-bg border border-gh-border rounded px-3 py-2 text-gh-text text-sm outline-none focus:border-gh-blue"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gh-text text-sm font-medium">Commit Message</label>
                <input
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Upload files via RepoOrbit (auto-generated if empty)"
                  className="w-full bg-gh-bg border border-gh-border rounded px-3 py-2 text-gh-text text-sm placeholder-gh-muted outline-none focus:border-gh-blue"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-gh-text font-semibold text-sm flex items-center gap-2">
                <UploadIcon size={15} className="text-gh-accent" />
                Files
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div
                ref={dropZoneRef}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${dragOver
                    ? "border-gh-blue bg-gh-blue/10"
                    : "border-gh-border hover:border-gh-muted"
                  }
                `}
              >
                <UploadIcon size={32} className={`mx-auto mb-3 ${dragOver ? "text-gh-blue" : "text-gh-muted"}`} />
                <p className="text-gh-text font-medium mb-1">
                  {dragOver ? "Drop files here!" : "Drag & drop files or folders here"}
                </p>
                <p className="text-gh-muted text-xs mb-4">or use the buttons below</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<FileUp />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Files
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<FolderUp />}
                    onClick={() => folderInputRef.current?.click()}
                  >
                    Select Folder
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  webkitdirectory=""
                  directory=""
                  className="hidden"
                  onChange={handleFolderSelect}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gh-text text-sm font-medium">
                      {files.length} file{files.length > 1 ? "s" : ""} selected
                    </span>
                    <button
                      onClick={() => setFiles([])}
                      className="text-gh-muted hover:text-gh-danger text-xs"
                    >
                      Clear all
                    </button>
                  </div>
                  <FileTree files={files} />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {files.map((f) => (
                      <div
                        key={f.path}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-gh-elevated rounded text-sm"
                      >
                        <span className="truncate text-gh-text text-xs font-mono">{f.path}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-gh-muted text-xs">{formatFileSize(f.size)}</span>
                          <button
                            onClick={() => removeFile(f.path)}
                            className="text-gh-muted hover:text-gh-danger"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gh-muted flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" />
                      Uploading...
                    </span>
                    <span className="text-gh-text font-medium">{progress}%</span>
                  </div>
                  <ProgressBar progress={progress} status={uploadStatus} />
                </div>
              )}

              {results && !uploading && (
                <div className={`p-4 rounded border ${
                  results.failed === 0
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-orange-500/10 border-orange-500/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {results.failed === 0 ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <AlertCircle size={16} className="text-orange-400" />
                    )}
                    <span className="text-gh-text font-medium text-sm">Upload Complete</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">{results.uploaded} uploaded</span>
                    {results.failed > 0 && (
                      <span className="text-red-400">{results.failed} failed</span>
                    )}
                  </div>
                  {results.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {results.errors.map((e, i) => (
                        <p key={i} className="text-red-400 text-xs font-mono">
                          {e.path}: {e.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {results && (
                  <Button variant="secondary" onClick={reset} className="flex-1">
                    Upload More
                  </Button>
                )}
                <Button
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!selectedRepo || files.length === 0}
                  icon={<UploadIcon />}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : `Upload ${files.length > 0 ? `${files.length} File${files.length > 1 ? "s" : ""}` : "Files"}`}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-gh-text font-semibold text-sm">Upload Tips</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-gh-muted">
              <div className="flex gap-2">
                <span className="text-gh-blue mt-0.5">→</span>
                <p>Drag & drop entire folders to preserve structure</p>
              </div>
              <div className="flex gap-2">
                <span className="text-gh-blue mt-0.5">→</span>
                <p>Existing files will be updated automatically</p>
              </div>
              <div className="flex gap-2">
                <span className="text-gh-blue mt-0.5">→</span>
                <p>Max 100 files per upload batch</p>
              </div>
              <div className="flex gap-2">
                <span className="text-gh-blue mt-0.5">→</span>
                <p>Binary files are Base64 encoded automatically</p>
              </div>
              <div className="flex gap-2">
                <span className="text-gh-blue mt-0.5">→</span>
                <p>Leave commit message empty for auto-generation</p>
              </div>
            </CardBody>
          </Card>

          {selectedRepo && (
            <Card>
              <CardHeader>
                <h2 className="text-gh-text font-semibold text-sm">Target Info</h2>
              </CardHeader>
              <CardBody className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gh-muted">Repository</span>
                  <span className="text-gh-text font-medium">{selectedRepo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gh-muted">Branch</span>
                  <Badge variant="blue">{branch}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gh-muted">Files queued</span>
                  <span className="text-gh-text font-medium">{files.length}</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}