import dotenv from "dotenv";
dotenv.config(); // Load .env first

console.log("Loaded API Key:", process.env.OPENAI_API_KEY ? "Yes" : "No"); // Debug

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("Error talking to OpenAI:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("AI server running on http://localhost:3000"));