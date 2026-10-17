import fs from "node:fs";
import path from "node:path";

export function loadSources() {
  const dir = path.join(process.cwd(), "data", "sources");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".txt"))
    .map((f) => {
      const text = fs.readFileSync(path.join(dir, f), "utf-8");
      const url = (text.match(/^SOURCE:\s*(\S+)/m) || [])[1];
      return { file: f, url, text };
    });
}