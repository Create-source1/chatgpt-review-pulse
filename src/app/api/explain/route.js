import { buildExplainer } from "@/lib/explainer";

export const maxDuration = 300;

export async function POST(request) {
  try {
    const { feeIssue } = await request.json();
    return Response.json(await buildExplainer(feeIssue));
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}