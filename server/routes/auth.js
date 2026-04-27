const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { encrypt } = require("../utils/crypto");
const { validateToken } = require("../utils/github");
const { storeCredentials, removeCredentials } = require("../middleware/auth");

const router = express.Router();

router.post("/credentials", async (req, res) => {
  const { username, token } = req.body;
  if (!username || !token) {
    return res.status(400).json({ error: "Username and token are required." });
  }
  if (typeof username !== "string" || typeof token !== "string") {
    return res.status(400).json({ error: "Invalid input types." });
  }
  if (username.length > 100 || token.length > 500) {
    return res.status(400).json({ error: "Input exceeds maximum length." });
  }
  try {
    const user = await validateToken(token, username);
    const sessionId = uuidv4();
    const encryptedToken = encrypt(token);
    storeCredentials(sessionId, username, encryptedToken);
    res.json({
      sessionId,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
        followers: user.followers,
      },
    });
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 401) {
        return res.status(401).json({ error: "Invalid GitHub token." });
      }
      if (status === 403) {
        return res.status(403).json({ error: "Token lacks required permissions." });
      }
    }
    res.status(400).json({ error: err.message || "Failed to validate credentials." });
  }
});

router.post("/test", async (req, res) => {
  const { username, token } = req.body;
  if (!username || !token) {
    return res.status(400).json({ error: "Username and token are required." });
  }
  try {
    const user = await validateToken(token, username);
    res.json({
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
      },
    });
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(401).json({ success: false, error: "Invalid GitHub token." });
    }
    res.status(400).json({ success: false, error: err.message || "Connection test failed." });
  }
});

router.delete("/credentials", (req, res) => {
  const sessionId = req.headers["x-session-id"];
  if (sessionId) {
    removeCredentials(sessionId);
  }
  res.json({ success: true });
});

module.exports = router;