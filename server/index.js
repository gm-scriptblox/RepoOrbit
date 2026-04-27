require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const repoRoutes = require("./routes/repos");
const fileRoutes = require("./routes/files");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com"],
    },
  },
}));

app.use(compression());

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL || true
    : "http://localhost:3000",
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many upload requests, please try again later." },
});

app.use(limiter);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "RepoOrbit" });
});

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/files", uploadLimiter, fileRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RepoOrbit server running on port ${PORT}`);
});

module.exports = app;