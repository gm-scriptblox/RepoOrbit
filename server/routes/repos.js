const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createGithubClient, handleGithubError } = require("../utils/github");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const client = createGithubClient(req.githubToken);
  try {
    const response = await client.get("/user/repos", {
      params: {
        sort: "updated",
        per_page: 100,
        affiliation: "owner",
      },
    });
    const repos = response.data.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      private: r.private,
      clone_url: r.clone_url,
      html_url: r.html_url,
      default_branch: r.default_branch,
      updated_at: r.updated_at,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      size: r.size,
    }));
    res.json(repos);
  } catch (err) {
    const error = handleGithubError(err);
    res.status(error.status).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { name, description, isPrivate, initReadme } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Repository name is required." });
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return res.status(400).json({ error: "Invalid repository name. Use only letters, numbers, hyphens, underscores, and dots." });
  }
  const client = createGithubClient(req.githubToken);
  try {
    const response = await client.post("/user/repos", {
      name,
      description: description || "",
      private: isPrivate === true,
      auto_init: initReadme === true,
    });
    res.status(201).json({
      id: response.data.id,
      name: response.data.name,
      full_name: response.data.full_name,
      clone_url: response.data.clone_url,
      html_url: response.data.html_url,
      private: response.data.private,
      default_branch: response.data.default_branch,
    });
  } catch (err) {
    const error = handleGithubError(err);
    res.status(error.status).json({ error: error.message });
  }
});

router.delete("/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;
  if (owner !== req.githubUsername) {
    return res.status(403).json({ error: "You can only delete your own repositories." });
  }
  const client = createGithubClient(req.githubToken);
  try {
    await client.delete(`/repos/${owner}/${repo}`);
    res.json({ success: true });
  } catch (err) {
    const error = handleGithubError(err);
    res.status(error.status).json({ error: error.message });
  }
});

router.get("/:owner/:repo/branches", async (req, res) => {
  const { owner, repo } = req.params;
  const client = createGithubClient(req.githubToken);
  try {
    const response = await client.get(`/repos/${owner}/${repo}/branches`, {
      params: { per_page: 100 },
    });
    res.json(response.data.map((b) => ({ name: b.name })));
  } catch (err) {
    const error = handleGithubError(err);
    res.status(error.status).json({ error: error.message });
  }
});

router.post("/:owner/:repo/branches", async (req, res) => {
  const { owner, repo } = req.params;
  const { branchName, fromBranch } = req.body;
  if (!branchName) {
    return res.status(400).json({ error: "Branch name is required." });
  }
  const client = createGithubClient(req.githubToken);
  try {
    const refResponse = await client.get(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch || "main"}`);
    const sha = refResponse.data.object.sha;
    await client.post(`/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha,
    });
    res.status(201).json({ success: true, branch: branchName });
  } catch (err) {
    const error = handleGithubError(err);
    res.status(error.status).json({ error: error.message });
  }
});

module.exports = router;