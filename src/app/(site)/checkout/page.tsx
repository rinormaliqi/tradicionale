"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart, useLang } from "@/components/Providers";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "@/app/actions/orders";
import { TruckIcon } from "@/components/icons";

export default function CheckoutPage() {
  const { lang, t } = useLang();
  const { lines, total, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    city: "Prishtinë",
    notes: "",
    payment_method: "cash",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lines.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted">{t("cart_empty")}</p>
        <Link href="/menu" className="btn-primary mt-6">
          {t("cart_browse")}
        </Link>
      </div>
    );
  }

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.customer_name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(t("required"));
      return;
    }
    setSubmitting(true);
    const res = await placeOrder({
      ...form,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });
    if (res.ok) {
      clear();
      router.push(`/order/${res.orderId}`);
    } else {
      setSubmitting(false);
      setError(t("required"));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl font-700 text-ink">
        {t("checkout_title")}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t("f_name")} *</label>
            <input
              className="input"
              value={form.customer_name}
              onChange={(e) => update("customer_name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t("f_phone")} *</label>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>
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
            <label className="label">{t("f_address")} *</label>
            <textarea
              className="input min-h-[80px]"
              placeholder={t("f_address_ph")}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">{t("f_notes")}</label>
            <textarea
              className="input min-h-[70px]"
              placeholder={t("f_notes_ph")}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          <div>
            <label className="label">{t("f_payment")}</label>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm font-600 text-ink">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brand text-[10px] font-700 text-brand">
                €
              </span>
              {t("pay_cash")}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? t("submitting") : t("place_order")}
          </button>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-xl2 border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-700 text-ink">
            {t("order_summary")}
          </h2>
          <div className="mt-4 space-y-2.5 text-sm">
            {lines.map((l) => {
              const name = lang === "sq" ? l.name_sq : l.name_en;
              return (
                <div key={l.productId} className="flex justify-between gap-2">
                  <span className="text-muted">
                    {l.quantity} × {name}
                  </span>
                  <span className="font-600 text-ink">
                    {formatPrice(l.price * l.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-600 text-ink">{t("cart_total")}</span>
            <span className="font-display text-2xl font-700 text-brand">
              {formatPrice(total)}
            </span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <TruckIcon size={16} /> {t("feature_delivery")}
          </p>
        </aside>
      </div>
    </div>
  );
}
