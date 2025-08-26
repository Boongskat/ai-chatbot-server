// server.js — ESM (import syntax)

// 1) Load env first
import dotenv from "dotenv";
dotenv.config();

// 2) Core imports
import express from "express";
import cors from "cors";
import OpenAI from "openai";

// 3) App setup
const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS allow-list ---
// CHANGE these to your real domains.
// Keep localhost if you test locally.
const ALLOWED_ORIGINS = [
  "https://ai-chatbot-server-db6g.onrender.com",
  "http://localhost:3000"
];

// Use JSON body parsing
app.use(express.json());

// Strict CORS: only allow origins in the list
app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser tools (no Origin header), e.g. Postman/cURL
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

// 4) OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 5) Health check (good for uptime monitors)
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// 6) Chat endpoint
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

    const reply = response?.choices?.[0]?.message?.content || "Sorry, I didn't catch that.";
    res.json({ reply });
  } catch (err) {
    console.error("Error talking to OpenAI:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 7) Start server
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
