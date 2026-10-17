import { runAnalysis } from "@/lib/analyze";
import { loadSources } from "@/lib/sources";
import { explainerPrompt } from "@/lib/prompts";
import { askJson } from "@/lib/llm";

export async function GET() {
  try {
    const analysis = await runAnalysis();
    const sources = loadSources();
    const { bullets = [] } = await askJson(explainerPrompt(analysis.fee_issue, sources));

    // Rough guard: every number in the bullets should exist in the source text
    const allText = sources.map((s) => s.text).join(" ");
    const numbers = bullets.join(" ").match(/\d+/g) || [];
    const unsupportedNumbers = numbers.filter((n) => !allText.includes(n));

    const lastChecked = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
    });

    return Response.json({
      fee_issue: analysis.fee_issue,
      explanation_bullets: bullets.slice(0, 6),
      source_links: sources.map((s) => s.url),
      last_checked: `Last checked: ${lastChecked}`,
      unsupported_numbers: unsupportedNumbers,
    });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}