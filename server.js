// server.js — TEMP DEBUG VERSION (Step B)
// - Opens CORS to all origins to verify connectivity
// - Logs the Origin header so we can whitelist the exact site later

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

// Body parser
app.use(express.json());

// --- TEMP LOGGING: show the request Origin in Render logs ---
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin || "no-origin");
  next();
});

// --- TEMP CORS: allow ALL origins (debug only) ---
app.use(cors({ origin: true })); // 👈 this opens the gate so any site can reach your server

// 4) OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 5) Health check (use this URL in your browser to confirm server is up)
//    https://YOUR-RENDER-APP.onrender.com/health
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
