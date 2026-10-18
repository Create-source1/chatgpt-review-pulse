import { loadReviews } from "@/lib/reviews";
import { buildPulse } from "@/lib/pulse";

export const maxDuration = 300;

export async function POST(request) {
  try {
    const { analysis } = await request.json();
    return Response.json(await buildPulse(analysis, loadReviews()));
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}