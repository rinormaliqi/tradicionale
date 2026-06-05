"use client";

import Link from "next/link";
import { useLang } from "@/components/Providers";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRightIcon } from "@/components/icons";
import { formatPrice, formatDate, monthLabel } from "@/lib/format";
import type { DashboardStats, MonthlySummary } from "@/lib/queries";

export function DashboardView({
  stats,
  months,
}: {
  stats: DashboardStats;
  months: MonthlySummary[];
}) {
  const { lang, t } = useLang();

  const cards = [
    { label: t("stat_revenue"), value: formatPrice(stats.totalRevenue), accent: true },
    { label: t("stat_orders"), value: String(stats.totalOrders) },
    { label: t("stat_new"), value: String(stats.newOrders) },
    {
      label: `${t("stat_today")} · ${t("stat_orders")}`,
      value: `${stats.todayOrders} · ${formatPrice(stats.todayRevenue)}`,
    },
    { label: t("stat_avg"), value: formatPrice(stats.avgOrder) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-700 text-ink">
        {t("admin_dashboard")}
      </h1>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs font-600 uppercase tracking-wide text-muted">
              {c.label}
            </p>
            <p
              className={`mt-2 font-display text-2xl font-700 ${
                c.accent ? "text-brand" : "text-ink"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="card p-6">
          <h2 className="font-display text-xl font-700 text-ink">
            {t("stat_top")}
          </h2>
          <div className="mt-4 space-y-3">
            {stats.topProducts.length === 0 && (
              <p className="text-sm text-muted">{t("no_orders")}</p>
            )}
            {stats.topProducts.map((p, i) => {
              const name = lang === "sq" ? p.name_sq : p.name_en;
              const max = stats.topProducts[0]?.qty || 1;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm">
                    <span className="font-600 text-ink">{name}</span>
                    <span className="text-muted">{p.qty}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(p.qty / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-700 text-ink">
              {t("stat_recent")}
            </h2>
            <Link href="/admin/orders" className="text-sm font-600 text-brand hover:underline">
              {t("view")} →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {stats.recent.length === 0 && (
              <p className="text-sm text-muted">{t("no_orders")}</p>
            )}
            {stats.recent.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:opacity-70"
              >
                <div>
                  <p className="font-600 text-ink">
                    #{o.id} · {o.customer_name}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(o.created_at, lang)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-700 text-ink">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly financial statements */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-700 text-ink">
            {t("monthly_statements")}
          </h2>
          <Link
            href="/admin/reports"
            className="group inline-flex items-center gap-1 text-sm font-600 text-brand hover:underline"
          >
            {t("admin_reports")}
            <ArrowRightIcon
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {months.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("no_orders")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 pr-4">{t("rep_period")}</th>
                  <th className="py-2 pr-4 text-right">{t("rep_revenue")}</th>
                  <th className="py-2 pr-4 text-right">{t("rep_paid")}</th>
                  <th className="py-2 pr-4 text-right">{t("rep_cancelled")}</th>
                  <th className="py-2 pr-4 text-right">{t("rep_avg")}</th>
                  <th className="py-2 text-right">{t("th_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {months.map((m) => (
                  <tr key={m.ym} className="hover:bg-surface/60">
                    <td className="py-2.5 pr-4 font-600 text-ink">
                      {monthLabel(m.ym, lang)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-700 text-brand">
                      {formatPrice(m.revenue)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-ink">
                      {m.paidOrders}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-muted">
                      {m.cancelled}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-ink">
                      {formatPrice(m.avgOrder)}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/admin/reports?month=${m.ym}`}
                        className="font-600 text-brand hover:underline"
                      >
                        {t("view_report")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
