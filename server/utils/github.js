const axios = require("axios");

function createGithubClient(token) {
  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    timeout: 30000,
  });
}

async function validateToken(token, username) {
  const client = createGithubClient(token);
  const response = await client.get("/user");
  const user = response.data;
  if (username && user.login.toLowerCase() !== username.toLowerCase()) {
    throw new Error("Token does not match the provided username");
  }
  return user;
}

async function getFileSHA(client, owner, repo, filePath, branch) {
  try {
    const response = await client.get(
      `/repos/${owner}/${repo}/contents/${filePath}`,
      { params: { ref: branch } }
    );
    return response.data.sha;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
}

async function uploadFile(client, owner, repo, filePath, content, message, branch, sha) {
  const payload = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
  };
  if (sha) {
    payload.sha = sha;
  }
  const response = await client.put(
    `/repos/${owner}/${repo}/contents/${filePath}`,
    payload
  );
  return response.data;
}

function handleGithubError(err) {
  if (!err.response) {
    return { status: 503, message: "Unable to reach GitHub API. Check your network connection." };
  }
  const status = err.response.status;
  const githubMessage = err.response.data?.message || "";
  const errorMap = {
    401: "Invalid or expired GitHub token. Please update your credentials.",
    403: "Access forbidden. Check token permissions or rate limits.",
    404: "Resource not found. Repository or file may not exist.",
    409: "Conflict detected. File may have been modified externally.",
    422: `Validation failed: ${githubMessage}`,
    429: "GitHub API rate limit exceeded. Please wait before retrying.",
  };
  return {
    status: status in errorMap ? status : 500,
    message: errorMap[status] || `GitHub API error: ${githubMessage}`,
  };
}

module.exports = { createGithubClient, validateToken, getFileSHA, uploadFile, handleGithubError };