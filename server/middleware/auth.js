const { decrypt } = require("../utils/crypto");

const credentialsStore = new Map();

function storeCredentials(sessionId, username, encryptedToken) {
  credentialsStore.set(sessionId, { username, encryptedToken, createdAt: Date.now() });
}

function getCredentials(sessionId) {
  return credentialsStore.get(sessionId) || null;
}

function removeCredentials(sessionId) {
  credentialsStore.delete(sessionId);
}

function cleanupExpiredSessions() {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  for (const [key, value] of credentialsStore.entries()) {
    if (now - value.createdAt > ONE_DAY) {
      credentialsStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

function requireAuth(req, res, next) {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId) {
    return res.status(401).json({ error: "No session ID provided. Please configure your credentials." });
  }
  const creds = getCredentials(sessionId);
  if (!creds) {
    return res.status(401).json({ error: "Session not found. Please re-enter your credentials." });
  }
  const token = decrypt(creds.encryptedToken);
  if (!token) {
    return res.status(401).json({ error: "Failed to decrypt credentials. Please re-enter your token." });
  }
  req.githubToken = token;
  req.githubUsername = creds.username;
  next();
}

module.exports = { storeCredentials, getCredentials, removeCredentials, requireAuth };