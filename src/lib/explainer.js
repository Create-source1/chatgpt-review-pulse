import { askJson } from "@/lib/llm";
import { loadSources } from "@/lib/sources";
import { explainerPrompt } from "@/lib/prompts";

export async function buildExplainer(feeIssue) {
  const sources = loadSources();
  const { bullets = [] } = await askJson(explainerPrompt(feeIssue, sources));

  const allText = sources.map((s) => s.text).join(" ");
  const numbers = bullets.join(" ").match(/\d+/g) || [];
  const day = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  });

  return {
    explanation_bullets: bullets.slice(0, 6),
    source_links: sources.map((s) => s.url),
    last_checked: `Last checked: ${day}`,
    unsupported_numbers: numbers.filter((n) => !allText.includes(n)),
  };
}