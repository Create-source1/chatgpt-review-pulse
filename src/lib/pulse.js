import { askJson } from "@/lib/llm";
import { pulsePrompt } from "@/lib/prompts";

const countWords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export async function buildPulse(analysis, reviews) {
  const p = await askJson(pulsePrompt(analysis, reviews.length), "pulse");
  const dates = reviews.map((r) => r.date).sort();
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  });

  const themeLines = (analysis.top_themes || []).map(
    (t, i) => `${i + 1}. ${t}: ${p.theme_lines?.[i] || ""}`
  );
  const quotes = (analysis.quotes || [])
    .filter((q) => q.verified)
    .map((q) => `- "${q.quote}" (${q.review_id})`);

  const text = [
    `Weekly Product Pulse | ChatGPT Android, India | Week ending ${today}`,
    `Based on ${reviews.length} Play Store reviews, ${fmt(dates[0])} to ${fmt(dates[dates.length - 1])}.`,
    "",
    "TOP THEMES",
    ...themeLines,
    "",
    "WHAT USERS SAID",
    ...quotes,
    "",
    "KEY OBSERVATION",
    p.key_observation,
    "",
    "ACTIONS",
    ...(p.actions || []).slice(0, 3).map((a, i) => `${i + 1}. ${a}`),
  ].join("\n");

  const wc = countWords(text);
  return { weekly_pulse: text, word_count: wc, within_limit: wc <= 250, verified_quotes: quotes.length };
}