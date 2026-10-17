import { runAnalysis } from "@/lib/analyze";
import { loadReviews } from "@/lib/reviews";
import { buildPulse } from "@/lib/pulse";

export async function GET() {
  try {
    const analysis = await runAnalysis();
    const pulse = await buildPulse(analysis, loadReviews());
    return Response.json({ top_themes: analysis.top_themes, ...pulse });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}