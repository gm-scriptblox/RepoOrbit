const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createGithubClient, getFileSHA, uploadFile, handleGithubError } = require("../utils/github");

const router = express.Router();

router.use(requireAuth);

router.post("/upload", async (req, res) => {
  const { owner, repo, branch, commitMessage, files } = req.body;
  if (!owner || !repo || !files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "Owner, repo, and files are required." });
  }
  if (files.length > 100) {
    return res.status(400).json({ error: "Maximum 100 files per upload." });
  }
  const targetBranch = branch || "main";
  const client = createGithubClient(req.githubToken);
  const results = [];
  const errors = [];

  for (const file of files) {
    if (!file.path || file.content === undefined) {
      errors.push({ path: file.path || "unknown", error: "Missing path or content." });
      continue;
    }
    if (file.path.includes("..")) {
      errors.push({ path: file.path, error: "Invalid file path." });
      continue;
    }
    try {
      const sha = await getFileSHA(client, owner, repo, file.path, targetBranch);
      const message = commitMessage || `Upload ${file.path} via RepoOrbit`;
      const result = await uploadFile(
        client,
        owner,
        repo,
        file.path,
        file.content,
        message,
        targetBranch,
        sha
      );
      results.push({
        path: file.path,
        success: true,
        action: sha ? "updated" : "created",
        sha: result.content?.sha,
      });
    } catch (err) {
      const error = handleGithubError(err);
      errors.push({ path: file.path, error: error.message });
    }
  }

  const allFailed = results.length === 0 && errors.length > 0;
  res.status(allFailed ? 400 : 200).json({
    success: !allFailed,
    uploaded: results.length,
    failed: errors.length,
    results,
    errors,
  });
});

router.get("/:owner/:repo/contents", async (req, res) => {
  const { owner, repo } = req.params;
  const { path: filePath = "", ref } = req.query;
  const client = createGithubClient(req.githubToken);
  try {
    const response = await client.get(`/repos/${owner}/${repo}/contents/${filePath}`, {
      params: ref ? { ref } : {},
    });
    res.json(response.data);
  } catch (err) {
    const error = handleGithubError(err);
    res.status(error.status).json({ error: error.message });
  }
});

module.exports = router;