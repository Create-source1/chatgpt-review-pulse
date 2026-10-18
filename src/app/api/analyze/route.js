import { runAnalysis } from "@/lib/analyze";

export const maxDuration = 300;

export async function GET() {
  try {
    return Response.json(await runAnalysis());
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}