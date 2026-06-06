import { NextRequest } from "next/server";
import { getImageBytes } from "@/lib/queries";

// NOTE: this route is intentionally NOT `force-dynamic`. The cache headers below
// let Vercel's CDN store each image at the edge, so the function + database run
// only on the first request per image; everyone else is served from the CDN.

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const thumb = req.nextUrl.searchParams.get("thumb") === "1";
  const bytes = await getImageBytes(id, thumb);
  if (!bytes) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Image ids are never reused (a new upload always gets a new id), so the bytes
  // at a given URL never change — safe to cache for a year, immutably.
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      // Browser cache:
      "Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
      // Vercel Edge/CDN cache (explicit, so it's served from the edge globally):
      "Vercel-CDN-Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
      // Generic CDN header (helps if a proxy/CDN sits in front):
      "CDN-Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
    },
  });
}
