import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params;
  const wikiRoot = path.join(process.cwd(), "public", "wiki");

  const decodedSegments = slug.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });

  const relativeTarget = decodedSegments.join(path.sep);

  const candidates =
    decodedSegments.length === 0
      ? [path.join(wikiRoot, "index.html")]
      : [
          path.join(wikiRoot, `${relativeTarget}.html`),
          path.join(wikiRoot, relativeTarget, "index.html"),
        ];

  for (const candidate of candidates) {
    if (!candidate.startsWith(wikiRoot)) continue;

    if (await fileExists(candidate)) {
      const htmlContent = await fs.readFile(candidate, "utf-8");
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });
    }
  }

  const custom404 = path.join(wikiRoot, "404.html");
  if (await fileExists(custom404)) {
    const html404 = await fs.readFile(custom404, "utf-8");
    return new NextResponse(html404, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse("Página da Wiki não encontrada.", { status: 404 });
}