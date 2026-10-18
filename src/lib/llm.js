import { GoogleGenAI } from "@google/genai";

export async function askJson(prompt, label = "llm") {
  const start = Date.now();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const config = { responseMimeType: "application/json", temperature: 0.2 };
  // Optional speed-up for models that support turning thinking off
  if (process.env.GEMINI_NO_THINKING === "1") {
    config.thinkingConfig = { thinkingBudget: 0 };
  }

  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config,
  });

  console.log(`[llm] ${label}: ${((Date.now() - start) / 1000).toFixed(1)}s`);
  return JSON.parse(res.text);
}