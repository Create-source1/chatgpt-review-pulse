import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

export function loadReviews() {
  const file = path.join(process.cwd(), "data", "reviews.csv");
  const csv = fs.readFileSync(file, "utf-8");
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

  return data.map((r) => ({
    id: r.id,
    date: r.date,
    text: r.review_text,
    helpful: Number(r.helpful_count) || 0,
  }));
}