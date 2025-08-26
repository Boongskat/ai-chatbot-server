// server.js — Render-ready with CORS + health

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 CORS allow-list
// - Your live site (same-origin API calls from the Render URL)
// - localhost for dev
// - "null" origin temporarily (when opening index.html as file://)
const ALLOWED_ORIGINS = [
  "https://ai-chatbot-server-db6g.onrender.com",
  "http://localhost:3000",
];

app.use(express.json());

app.use(
  cors({
    origin(origin, cb) {
      // Allow tools like Postman/cURL (no Origin header)
      if (!origin) return cb(null, true);

      // Allow file:// pages (browser sends "null" origin). Remove this in prod if not needed.
      if (origin === "null") return cb(null, true);

      // Allow exact matches in our allow-list
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      // Block everything else
      return cb(new Error("Not allowed by CORS"));
    },
  })
);
import rateLimit from "express-rate-limit";

// Limit: 30 requests per minute per IP on /chat
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 30,                 // 30 requests per IP per minute
  standardHeaders: true,   // adds RateLimit-* headers
  legacyHeaders: false,    // disables X-RateLimit-* headers
  message: { error: "Too many requests, please slow down." }
});

// apply to chat route only
app.use("/chat", chatLimiter);

// Optional: minimal origin log to help debug (safe to keep)
app.use((req, _res, next) => {
  if (req.headers.origin) {
    console.log("Request Origin:", req.headers.origin);
  } else {
    console.log("Request Origin: no-origin");
  }
  next();
});

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check (for uptime monitors)
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = (req.body && req.body.message || "").trim();
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    const reply =
      response?.choices?.[0]?.message?.content ||
      "Sorry, I didn't catch that.";
    res.json({ reply });
  } catch (err) {
    console.error("Error talking to OpenAI:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server (Render expects 0.0.0.0 + PORT env var)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI server running on port ${PORT}`);
});
