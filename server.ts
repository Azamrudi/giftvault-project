import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid startup crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined in the environment. AI features will be disabled.");
      throw new Error("GEMINI_API_KEY is required to generate AI birthday content.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Birthday Wish Generator endpoint
app.post("/api/generate-wish", async (req, res) => {
  try {
    const { recipientName, relationship, vibe, extraDetails } = req.body;

    if (!recipientName) {
      res.status(400).json({ error: "Recipient name is required." });
      return;
    }

    const ai = getGeminiClient();
    
    const prompt = `Write a personalized birthday wish or greeting for ${recipientName}. 
- The relationship is: ${relationship || "friend"}
- The style/vibe is: ${vibe || "warm and sentimental"}
- Additional context or details: ${extraDetails || "none"}

Please write a highly engaging letter or poem (depending on the vibe requested) that is emotional, thoughtful, and expressive. Make it feel authentic, creative, and memorable. Keep it polished. Output in rich, formatted markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Internal AI engine failure" });
  }
});

// Setup Vite Dev server or production static serving
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting developer environment...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production fallback...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started and running on http://127.0.0.1:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error("Failed to bootstrap server:", err);
});
