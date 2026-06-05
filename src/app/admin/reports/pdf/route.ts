import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getMonthlyStatement } from "@/lib/queries";
import { buildStatementPdf } from "@/lib/pdf";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isAuthenticated()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ym = req.nextUrl.searchParams.get("month") || "";
  if (!/^\d{4}-\d{2}$/.test(ym)) {
    return new Response("Invalid month", { status: 400 });
  }
  const lang = (req.nextUrl.searchParams.get("lang") === "en" ? "en" : "sq") as Lang;

  const statement = getMonthlyStatement(ym);
  const pdf = await buildStatementPdf(ym, statement, lang);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tradicionale-${ym}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
