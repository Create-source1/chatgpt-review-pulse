import { runAnalysis } from "@/lib/analyze";
import { loadReviews } from "@/lib/reviews";
import { buildPulse } from "@/lib/pulse";
import { buildExplainer } from "@/lib/explainer";

export async function GET() {
  try {
    const reviews = loadReviews();
    const analysis = await runAnalysis(); // runs once, reused below
    const pulse = await buildPulse(analysis, reviews);
    const explainer = await buildExplainer(analysis.fee_issue);

    return Response.json({
      date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      top_themes: analysis.top_themes,
      weekly_pulse: pulse.weekly_pulse,
      identified_fee_issue: analysis.fee_issue,
      explanation_bullets: explainer.explanation_bullets,
      source_links: explainer.source_links,
      last_checked: explainer.last_checked,
      checks: {
        pulse_words: pulse.word_count,
        pulse_within_limit: pulse.within_limit,
        verified_quotes: pulse.verified_quotes,
        unsupported_numbers: explainer.unsupported_numbers,
      },
    });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}