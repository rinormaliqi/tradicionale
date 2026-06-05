"use client";

import Link from "next/link";
import { useCart, useLang } from "@/components/Providers";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lang, t } = useLang();
  const { lines, setQty, remove, total } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-700 text-ink">
          {t("cart_title")}
        </h1>
        <p className="mt-3 text-muted">{t("cart_empty")}</p>
        <Link href="/menu" className="btn-primary mt-6">
          {t("cart_browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-700 text-ink">
        {t("cart_title")}
      </h1>

      <div className="mt-6 divide-y divide-line rounded-xl2 border border-line bg-white">
        {lines.map((line) => {
          const name = lang === "sq" ? line.name_sq : line.name_en;
          return (
            <div
              key={line.productId}
              className="flex items-center gap-4 p-4"
            >
              <div className="flex-1">
                <p className="font-600 text-ink">{name}</p>
                <p className="text-sm text-muted">
                  {formatPrice(line.price)}
                </p>
              </div>

              <div className="flex items-center rounded-lg border border-line">
                <button
                  className="px-3 py-1.5 text-lg text-muted hover:text-ink"
                  onClick={() => setQty(line.productId, line.quantity - 1)}
                  aria-label="-"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-700">
                  {line.quantity}
                </span>
                <button
                  className="px-3 py-1.5 text-lg text-muted hover:text-ink"
                  onClick={() => setQty(line.productId, line.quantity + 1)}
                  aria-label="+"
                >
                  +
                </button>
              </div>

              <div className="w-20 text-right font-700 text-ink">
                {formatPrice(line.price * line.quantity)}
              </div>

              <button
                className="text-sm text-muted hover:text-red-600"
                onClick={() => remove(line.productId)}
              >
                {t("cart_remove")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl2 border border-line bg-surface p-5">
        <span className="text-lg font-600 text-ink">{t("cart_total")}</span>
        <span className="font-display text-3xl font-700 text-brand">
          {formatPrice(total)}
        </span>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link href="/menu" className="btn-outline">
          ← {t("cart_continue")}
        </Link>
        <Link href="/checkout" className="btn-primary">
          {t("cart_checkout")} →
        </Link>
      </div>
    </div>
  );
}
