import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import companiesRouter from "./routes/companies.js";
import votingRouter from "./routes/voting.js";
import shareholdersRouter from "./routes/shareholders.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup for Frontend (Vite)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[Express API] ${req.method} ${req.url}`);
  next();
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Vote India Secure Express Backend",
    version: "2.0.0",
  });
});

// Top-Level Legacy & Shortcut Aliases
app.post("/api/cast-vote", (req, res, next) => {
  req.url = "/cast-vote";
  votingRouter(req, res, next);
});

app.post("/api/auth/initiate", (req, res, next) => {
  req.url = "/auth/initiate";
  shareholdersRouter(req, res, next);
});

app.post("/api/auth/verify", (req, res, next) => {
  req.url = "/auth/verify-otp";
  shareholdersRouter(req, res, next);
});

app.get("/api/eligible-events", (req, res, next) => {
  req.url = "/eligible-events";
  shareholdersRouter(req, res, next);
});

// Modular Routes
app.use("/api/companies", companiesRouter);
app.use("/api/voting", votingRouter);
app.use("/api/shareholders", shareholdersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found on Express backend` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Express Server Error]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Express Backend Server active on http://localhost:${PORT}`);
    console.log(`📡 Ready to handle REST API requests`);
    console.log(`=================================================`);
  });
}

export default app;
