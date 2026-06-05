"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";
import { PrinterIcon } from "@/components/icons";
import { formatPrice, monthLabel, monthRange } from "@/lib/format";
import type { MonthlyStatement, MonthlySummary } from "@/lib/queries";
import type { DictKey } from "@/lib/i18n";

const STATUS_KEY: Record<string, DictKey> = {
  new: "st_new",
  preparing: "st_preparing",
  out_for_delivery: "st_out_for_delivery",
  delivered: "st_delivered",
  cancelled: "st_cancelled",
};
const SOURCE_KEY: Record<string, DictKey> = {
  online: "src_online",
  phone: "src_phone",
  whatsapp: "src_whatsapp",
  in_store: "src_in_store",
};

export function ReportsView({
  ym,
  statement,
  months,
}: {
  ym: string;
  statement: MonthlyStatement;
  months: MonthlySummary[];
}) {
  const { lang, t } = useLang();
  const router = useRouter();
  const range = monthRange(ym);
  const s = statement.summary;
  const empty = s.totalOrders === 0;

  return (
    <div>
      {/* Controls (not printed) */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-700 text-ink">
            {t("monthly_statement")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("select_month")}:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-auto"
            value={ym}
            onChange={(e) => router.push(`/admin/reports?month=${e.target.value}`)}
          >
            {months.length === 0 && <option value={ym}>{monthLabel(ym, lang)}</option>}
            {months.map((m) => (
              <option key={m.ym} value={m.ym}>
                {monthLabel(m.ym, lang)}
              </option>
            ))}
          </select>
          <button onClick={() => window.print()} className="btn-outline">
            <PrinterIcon size={18} /> {t("print")}
          </button>
          <a
            href={`/admin/reports/pdf?month=${ym}&lang=${lang}`}
            className="btn-primary"
          >
            {t("download_pdf")}
          </a>
        </div>
      </div>

      {/* Printable report */}
      <div className="print-area">
        <div className="card p-8">
          {/* Report header */}
          <div className="flex items-start justify-between border-b border-line pb-5">
            <div>
              <p className="font-display text-2xl font-700 text-ink">TRADICIONALE</p>
              <p className="text-sm text-muted">{t("tagline")}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-700 text-brand">{t("monthly_statement")}</p>
              <p className="text-muted">
                {t("rep_period")}: {range.start} – {range.end}
              </p>
            </div>
          </div>

          <h2 className="mt-5 font-display text-2xl font-700 text-ink">
            {monthLabel(ym, lang)}
          </h2>

          {empty ? (
            <p className="mt-6 text-muted">{t("no_data_month")}</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SummaryCard label={t("rep_revenue")} value={formatPrice(s.revenue)} accent />
                <SummaryCard label={t("rep_paid")} value={String(s.paidOrders)} />
                <SummaryCard label={t("rep_avg")} value={formatPrice(s.avgOrder)} />
                <SummaryCard label={t("rep_orders")} value={String(s.totalOrders)} />
                <SummaryCard label={t("rep_cancelled")} value={String(s.cancelled)} />
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <ReportTable
                  title={t("rep_by_status")}
                  head={[t("th_status"), t("rep_orders"), t("rep_revenue")]}
                  rows={statement.byStatus.map((r) => [
                    t(STATUS_KEY[r.status] ?? "st_new"),
                    String(r.count),
                    formatPrice(r.revenue),
                  ])}
                />
                <ReportTable
                  title={t("rep_by_source")}
                  head={[t("th_source"), t("rep_orders"), t("rep_revenue")]}
                  rows={statement.bySource.map((r) => [
                    t(SOURCE_KEY[r.source] ?? "src_online"),
                    String(r.count),
                    formatPrice(r.revenue),
                  ])}
                />
              </div>

              <div className="mt-8">
                <ReportTable
                  title={t("rep_top_items")}
                  head={[t("th_order"), t("rep_qty"), t("rep_revenue")]}
                  rows={statement.topItems.map((r) => [
                    lang === "sq" ? r.name_sq : r.name_en,
                    String(r.qty),
                    formatPrice(r.revenue),
                  ])}
                />
              </div>
            </>
          )}

          <p className="mt-8 border-t border-line pt-4 text-center text-xs text-muted">
            Tradicionale · Lot Vaku, Prishtinë, Kosovë · 045 301 306
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-xs font-600 uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1.5 font-display text-2xl font-700 ${
          accent ? "text-brand" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ReportTable({
  title,
  head,
  rows,
}: {
  title: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <div>
      <h3 className="mb-2 font-display text-lg font-700 text-ink">{title}</h3>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`py-2 ${i === 0 ? "" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={head.length} className="py-3 text-muted">
                —
              </td>
            </tr>
          ) : (
            rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`py-2 ${
                      ci === 0 ? "font-600 text-ink" : "text-right text-muted"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
