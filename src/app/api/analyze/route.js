import { runAnalysis } from "@/lib/analyze";

export async function GET() {
  try {
    return Response.json(await runAnalysis());
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}