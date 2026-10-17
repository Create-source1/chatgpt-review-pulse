import { loadReviews } from "@/lib/reviews";
import { analyzePrompt } from "@/lib/prompts";
import { askJson } from "@/lib/llm";

const clean = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();

export async function runAnalysis() {
  const reviews = loadReviews();
  const result = await askJson(analyzePrompt(reviews));

  // Safety check: every quote must appear in the original review
  result.quotes = (result.quotes || []).map((q) => {
    const source = reviews.find((r) => r.id === q.review_id);
    return { ...q, verified: !!source && clean(source.text).includes(clean(q.quote)) };
  });
  return result;
}