"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/components/Providers";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { ManualOrderModal } from "./ManualOrderModal";
import { ArrowRightIcon, PlusIcon, XIcon } from "@/components/icons";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import type { OrdersPage } from "@/lib/queries";
import type { ProductWithImages } from "@/lib/types";
import type { DictKey } from "@/lib/i18n";

const STATUS_KEY: Record<OrderStatus, DictKey> = {
  new: "st_new",
  preparing: "st_preparing",
  out_for_delivery: "st_out_for_delivery",
  delivered: "st_delivered",
  cancelled: "st_cancelled",
};

export function OrdersView({
  data,
  status,
  search,
  products,
}: {
  data: OrdersPage;
  status: string;
  search: string;
  products: ProductWithImages[];
}) {
  const { lang, t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(search);
  const [modalOpen, setModalOpen] = useState(false);

  function navigate(next: { status?: string; q?: string; page?: number }) {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    const q = next.q ?? searchInput;
    const page = next.page ?? 1;
    if (s && s !== "all") params.set("status", s);
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-700 text-ink">
          {t("admin_orders")}
        </h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <PlusIcon size={18} /> {t("new_order")}
        </button>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: searchInput, page: 1 });
        }}
        className="mt-5 flex gap-2"
      >
        <input
          className="input max-w-sm"
          placeholder={t("search_orders")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn-outline">
          {t("view")}
        </button>
        {search && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setSearchInput("");
              navigate({ q: "", page: 1 });
            }}
          >
            <XIcon size={16} /> {t("clear_search")}
          </button>
        )}
      </form>

      {/* Status filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip
          label={t("menu_all")}
          active={status === "all"}
          onClick={() => navigate({ status: "all", page: 1 })}
        />
        {ORDER_STATUSES.map((s) => (
          <Chip
            key={s}
            label={t(STATUS_KEY[s])}
            active={status === s}
            onClick={() => navigate({ status: s, page: 1 })}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        {data.total} {t("results_count")}
      </p>

      <div className="card mt-2 overflow-hidden">
        {data.orders.length === 0 ? (
          <p className="p-8 text-center text-muted">{t("no_orders")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{t("th_order")}</th>
                <th className="px-4 py-3">{t("th_customer")}</th>
                <th className="px-4 py-3">{t("th_source")}</th>
                <th className="px-4 py-3">{t("th_date")}</th>
                <th className="px-4 py-3">{t("th_status")}</th>
                <th className="px-4 py-3 text-right">{t("th_total")}</th>
                <th className="px-4 py-3 text-right">{t("th_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-surface/60">
                  <td className="px-4 py-3 font-700 text-ink">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-600 text-ink">{o.customer_name}</p>
                    <p className="text-xs text-muted">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge source={o.source} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(o.created_at, lang)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-700 text-ink">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-600 text-brand hover:underline"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.pageCount > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            className="btn-outline px-3 py-2 disabled:opacity-40"
            disabled={data.page <= 1}
            onClick={() => navigate({ page: data.page - 1 })}
          >
            <ArrowRightIcon size={16} className="rotate-180" /> {t("prev")}
          </button>
          <span className="text-sm font-600 text-muted">
            {t("page_of")} {data.page} / {data.pageCount}
          </span>
          <button
            className="btn-outline px-3 py-2 disabled:opacity-40"
            disabled={data.page >= data.pageCount}
            onClick={() => navigate({ page: data.page + 1 })}
          >
            {t("next_page")} <ArrowRightIcon size={16} />
          </button>
        </div>
      )}

      {modalOpen && (
        <ManualOrderModal
          products={products}
          onClose={() => setModalOpen(false)}
          onCreated={(id) => {
            setModalOpen(false);
            router.push(`/admin/orders/${id}`);
          }}
        />
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip border transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-white text-ink hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}
