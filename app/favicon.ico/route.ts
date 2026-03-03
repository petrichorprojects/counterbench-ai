import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Some browsers (and crawlers) probe `/favicon.ico` regardless of <link rel="icon">.
// Serve our PNG favicon here to avoid noisy 404s without adding image tooling.
export async function GET() {
  const filePath = path.join(process.cwd(), "public", "favicon-32.png");
  const buf = await readFile(filePath);
  return new NextResponse(buf, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable"
    }
  });
}

