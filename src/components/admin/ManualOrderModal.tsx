"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/Providers";
import { ProductImage } from "@/components/ProductImage";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { createManualOrder } from "@/app/actions/orders";
import { ORDER_SOURCES, type ProductWithImages } from "@/lib/types";
import type { DictKey } from "@/lib/i18n";

const SOURCE_KEY: Record<string, DictKey> = {
  online: "src_online",
  phone: "src_phone",
  whatsapp: "src_whatsapp",
  in_store: "src_in_store",
};

export function ManualOrderModal({
  products,
  onClose,
  onCreated,
}: {
  products: ProductWithImages[];
  onClose: () => void;
  onCreated: (orderId: number) => void;
}) {
  const { lang, t } = useLang();
  const [qty, setQty] = useState<Record<number, number>>({});
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    city: "Prishtinë",
    notes: "",
    source: "phone",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return products;
    return products.filter(
      (p) =>
        p.name_sq.toLowerCase().includes(f) ||
        p.name_en.toLowerCase().includes(f)
    );
  }, [filter, products]);

  const selected = Object.entries(qty)
    .filter(([, q]) => q > 0)
    .map(([id]) => productById.get(Number(id))!)
    .filter(Boolean);

  const total = selected.reduce(
    (sum, p) => sum + p.price * (qty[p.id] || 0),
    0
  );

  function bump(id: number, delta: number) {
    setQty((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setError(null);
    if (!form.customer_name.trim() || !form.phone.trim()) {
      setError(t("required"));
      return;
    }
    const items = selected.map((p) => ({ productId: p.id, quantity: qty[p.id] }));
    if (items.length === 0) {
      setError(t("no_products_selected"));
      return;
    }
    setSubmitting(true);
    const res = await createManualOrder({ ...form, items });
    if (res.ok) {
      onCreated(res.orderId);
    } else {
      setSubmitting(false);
      setError(t("required"));
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card my-8 w-full max-w-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl font-700 text-ink">
          {t("manual_order_title")}
        </h2>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {/* Product picker */}
          <div>
            <label className="label">{t("select_products")}</label>
            <input
              className="input mb-3"
              placeholder={t("search_orders")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filtered.map((p) => {
                const name = lang === "sq" ? p.name_sq : p.name_en;
                const q = qty[p.id] || 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-line p-2"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                      <ProductImage images={p.images} alt={name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-600 text-ink">{name}</p>
                      <p className="text-xs text-muted">{formatPrice(p.price)}</p>
                    </div>
                    {q > 0 ? (
                      <div className="flex items-center rounded-lg border border-line">
                        <button
                          type="button"
                          className="px-2 py-1 text-muted hover:text-ink"
                          onClick={() => bump(p.id, -1)}
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-700">{q}</span>
                        <button
                          type="button"
                          className="px-2 py-1 text-muted hover:text-ink"
                          onClick={() => bump(p.id, 1)}
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-outline px-2.5 py-1.5 text-xs"
                        onClick={() => bump(p.id, 1)}
                      >
                        <PlusIcon size={14} /> {t("add_item")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer + summary */}
          <div className="space-y-3">
            <div>
              <label className="label">{t("f_name")} *</label>
              <input
                className="input"
                value={form.customer_name}
                onChange={(e) => update("customer_name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t("f_phone")} *</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t("order_source")}</label>
                <select
                  className="input"
                  value={form.source}
                  onChange={(e) => update("source", e.target.value)}
                >
                  {ORDER_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {t(SOURCE_KEY[s])}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">{t("f_address")}</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t("f_city")}</label>
                <input
                  className="input"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">{t("f_notes")}</label>
              <input
                className="input"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-line bg-surface p-3">
              {selected.length === 0 ? (
                <p className="text-sm text-muted">{t("no_products_selected")}</p>
              ) : (
                <div className="space-y-1.5 text-sm">
                  {selected.map((p) => (
                    <div key={p.id} className="flex justify-between gap-2">
                      <span className="text-muted">
                        {qty[p.id]} × {lang === "sq" ? p.name_sq : p.name_en}
                      </span>
                      <span className="font-600 text-ink">
                        {formatPrice(p.price * qty[p.id])}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="font-600 text-ink">{t("cart_total")}</span>
                <span className="font-display text-xl font-700 text-brand">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3 border-t border-line pt-4">
          <button type="button" className="btn-outline" onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? t("submitting") : t("create_order")}
          </button>
        </div>
      </div>
    </div>
  );
}
