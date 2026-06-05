"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { formatPrice, formatDate } from "@/lib/format";
import { changeOrderStatus } from "@/app/actions/orders";
import { PrinterIcon } from "@/components/icons";
import { ORDER_STATUSES, type OrderStatus, type OrderWithItems } from "@/lib/types";
import type { DictKey } from "@/lib/i18n";

const STATUS_KEY: Record<OrderStatus, DictKey> = {
  new: "st_new",
  preparing: "st_preparing",
  out_for_delivery: "st_out_for_delivery",
  delivered: "st_delivered",
  cancelled: "st_cancelled",
};

export function OrderDetailView({ order }: { order: OrderWithItems }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(order.status);

  function onStatusChange(next: OrderStatus) {
    setStatus(next);
    startTransition(async () => {
      await changeOrderStatus(order.id, next);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Screen toolbar */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm font-600 text-muted hover:text-ink">
            ← {t("admin_orders")}
          </Link>
          <h1 className="mt-1 font-display text-3xl font-700 text-ink">
            {t("order_detail")} #{order.id}
          </h1>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          <PrinterIcon size={18} /> {t("print_slip")}
        </button>
      </div>

      <div className="no-print grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="card p-6">
          <h2 className="font-display text-xl font-700 text-ink">{t("items")}</h2>
          <div className="mt-4 divide-y divide-line">
            {order.items.map((it) => {
              const name = lang === "sq" ? it.name_sq : it.name_en;
              return (
                <div key={it.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-600 text-ink">{name}</p>
                    <p className="text-sm text-muted">
                      {it.quantity} × {formatPrice(it.unit_price)}
                    </p>
                  </div>
                  <span className="font-700 text-ink">
                    {formatPrice(it.unit_price * it.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-600 text-ink">{t("cart_total")}</span>
            <span className="font-display text-2xl font-700 text-brand">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Sidebar: customer + status */}
        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-700 text-ink">
              {t("customer_info")}
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label={t("f_name")} value={order.customer_name} />
              <Row label={t("f_phone")} value={order.phone} />
              <Row label={t("f_city")} value={order.city} />
              <Row label={t("f_address")} value={order.address} />
              {order.notes && <Row label={t("f_notes")} value={order.notes} />}
              <Row label={t("th_date")} value={formatDate(order.created_at, lang)} />
            </dl>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
              <span className="text-xs uppercase tracking-wide text-muted">
                {t("th_source")}
              </span>
              <SourceBadge source={order.source} />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-700 text-ink">
              {t("update_status")}
            </h2>
            <div className="mt-2 mb-3">
              <StatusBadge status={status} />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={pending || s === status}
                  onClick={() => onStatusChange(s)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-600 transition-colors ${
                    s === status
                      ? "border-brand bg-brand-light text-brand"
                      : "border-line bg-white text-ink hover:bg-surface"
                  }`}
                >
                  {t(STATUS_KEY[s])}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Printable driver slip */}
      <DriverSlip order={order} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="font-600 text-ink">{value}</dd>
    </div>
  );
}

function DriverSlip({ order }: { order: OrderWithItems }) {
  const { lang, t } = useLang();
  return (
    <div className="print-area hidden print:block">
      <div style={{ fontFamily: "sans-serif", color: "#000", padding: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #000",
            paddingBottom: "8px",
          }}
        >
          <div>
            <div style={{ fontSize: "22px", fontWeight: 700 }}>TRADICIONALE</div>
            <div style={{ fontSize: "11px" }}>{t("driver_slip")}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "24px", fontWeight: 700 }}>#{order.id}</div>
            <div style={{ fontSize: "11px" }}>
              {formatDate(order.created_at, lang)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "12px", fontSize: "14px", lineHeight: 1.6 }}>
          <div>
            <strong>{t("f_name")}:</strong> {order.customer_name}
          </div>
          <div>
            <strong>{t("f_phone")}:</strong> {order.phone}
          </div>
          <div>
            <strong>{t("f_city")}:</strong> {order.city}
          </div>
          <div>
            <strong>{t("f_address")}:</strong> {order.address}
          </div>
          {order.notes && (
            <div>
              <strong>{t("f_notes")}:</strong> {order.notes}
            </div>
          )}
        </div>

        <table
          style={{
            width: "100%",
            marginTop: "14px",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #000", textAlign: "left" }}>
              <th style={{ padding: "4px 0" }}>{t("items")}</th>
              <th style={{ padding: "4px 0", textAlign: "center" }}>
                {t("cart_qty")}
              </th>
              <th style={{ padding: "4px 0", textAlign: "right" }}>
                {t("th_total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "6px 0" }}>
                  {lang === "sq" ? it.name_sq : it.name_en}
                </td>
                <td style={{ padding: "6px 0", textAlign: "center" }}>
                  {it.quantity}
                </td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {formatPrice(it.unit_price * it.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: "12px",
            paddingTop: "8px",
            borderTop: "2px solid #000",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          <span>{t("cart_total")}</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        <div style={{ marginTop: "10px", fontSize: "13px" }}>
          {t("f_payment")}: {t("pay_cash")}
        </div>
        <div style={{ marginTop: "20px", fontSize: "11px", textAlign: "center" }}>
          045 301 306 · Lot Vaku, Prishtinë · Tradicionale
        </div>
      </div>
    </div>
  );
}
