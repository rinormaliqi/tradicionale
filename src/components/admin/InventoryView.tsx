"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";
import { setStock } from "@/app/actions/products";
import type { Product } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 5;

export function InventoryView({ products }: { products: Product[] }) {
  const { lang, t } = useLang();

  return (
    <div>
      <h1 className="font-display text-3xl font-700 text-ink">
        {t("admin_inventory")}
      </h1>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">{t("p_name_sq")}</th>
              <th className="px-4 py-3">{t("p_category")}</th>
              <th className="px-4 py-3">{t("th_status")}</th>
              <th className="px-4 py-3 text-right">{t("p_stock")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <StockRow key={p.id} product={p} lang={lang} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockRow({ product, lang }: { product: Product; lang: "sq" | "en" }) {
  const { t } = useLang();
  const router = useRouter();
  const [value, setValue] = useState(product.stock);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = value !== product.stock;
  const name = lang === "sq" ? product.name_sq : product.name_en;
  const low = value <= LOW_STOCK_THRESHOLD;

  function save() {
    startTransition(async () => {
      await setStock(product.id, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-surface/60">
      <td className="px-4 py-3">
        <p className="font-600 text-ink">{name}</p>
      </td>
      <td className="px-4 py-3 text-muted">{product.category}</td>
      <td className="px-4 py-3">
        {value <= 0 ? (
          <span className="chip bg-red-50 text-red-700">{t("out_of_stock")}</span>
        ) : low ? (
          <span className="chip bg-amber-50 text-amber-700">{t("low_stock")}</span>
        ) : (
          <span className="chip bg-green-50 text-green-700">{t("in_stock")}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
            className="w-20 rounded-lg border border-line px-2 py-1.5 text-right text-sm focus:border-brand focus:outline-none"
          />
          <button
            onClick={save}
            disabled={!dirty || pending}
            className={`btn px-3 py-1.5 text-xs ${
              saved
                ? "bg-green-600 text-white"
                : dirty
                  ? "btn-primary"
                  : "border border-line bg-surface text-muted"
            }`}
          >
            {saved ? "✓" : t("save")}
          </button>
        </div>
      </td>
    </tr>
  );
}
