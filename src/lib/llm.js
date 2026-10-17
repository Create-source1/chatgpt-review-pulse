import { GoogleGenAI } from "@google/genai";

export async function askJson(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.2 },
  });
  return JSON.parse(res.text);
}