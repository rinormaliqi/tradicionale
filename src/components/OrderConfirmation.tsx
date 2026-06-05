"use client";

import Link from "next/link";
import { useLang } from "./Providers";
import { formatPrice } from "@/lib/format";
import { CheckIcon } from "./icons";
import type { OrderWithItems } from "@/lib/types";

export function OrderConfirmation({ order }: { order: OrderWithItems }) {
  const { lang, t } = useLang();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="animate-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckIcon size={34} />
      </div>
      <h1 className="mt-5 font-display text-4xl font-700 text-ink">
        {t("conf_title")}
      </h1>
      <p className="mt-3 text-muted">{t("conf_sub")}</p>

      <div className="mt-8 rounded-xl2 border border-line bg-white p-6 text-left shadow-card">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <span className="text-sm text-muted">{t("conf_order_no")}</span>
          <span className="font-display text-2xl font-700 text-brand">
            #{order.id}
          </span>
        </div>

        <div className="space-y-2.5 py-4 text-sm">
          {order.items.map((it) => {
            const name = lang === "sq" ? it.name_sq : it.name_en;
            return (
              <div key={it.id} className="flex justify-between gap-2">
                <span className="text-muted">
                  {it.quantity} × {name}
                </span>
                <span className="font-600 text-ink">
                  {formatPrice(it.unit_price * it.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="font-600 text-ink">{t("cart_total")}</span>
          <span className="font-700 text-ink">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link href="/" className="btn-outline mt-8">
        {t("conf_back")}
      </Link>
    </div>
  );
}
