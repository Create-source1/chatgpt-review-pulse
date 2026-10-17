import { loadReviews } from "@/lib/reviews";

export async function GET() {
  const reviews = loadReviews();
  return Response.json({ count: reviews.length, first: reviews[0] });
}