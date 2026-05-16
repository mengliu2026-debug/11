import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API routes
  app.post("/api/analyze-words", async (req, res) => {
    try {
      const { words } = req.body;
      if (!words || !Array.isArray(words)) {
        return res.status(400).json({ error: "Invalid words list" });
      }

      const prompt = `
        你是一个可爱的英语老师。请帮我分析以下单词列表：${words.join(", ")}。
        对于每个单词，请提供：
        1. 单词原文
        2. 中文含义
        3. 详细解释（适合初学者，语气亲切可爱）
        4. 一个生动有趣的英文造句
        5. 造句的中文翻译

        请以JSON格式返回，结构如下：
        [
          {
            "word": "单词",
            "meaning": "含义",
            "explanation": "详细解释",
            "sentence": "英文造句",
            "translation": "造句翻译"
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING },
                explanation: { type: Type.STRING },
                sentence: { type: Type.STRING },
                translation: { type: Type.STRING },
              },
              required: ["word", "meaning", "explanation", "sentence", "translation"],
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      res.json(data);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "分析失败，请稍后再试" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
