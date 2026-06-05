import { NextRequest } from "next/server";
import { getImageBytes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return new Response("Not found", { status: 404 });
  }

  const thumb = req.nextUrl.searchParams.get("thumb") === "1";
  const bytes = await getImageBytes(id, thumb);
  if (!bytes) {
    return new Response("Not found", { status: 404 });
  }

  // Image ids are immutable (a new upload always gets a new id), so we can
  // cache aggressively for fast repeat loads.
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
