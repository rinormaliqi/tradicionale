"use client";

import { useState } from "react";
import { useCart, useLang } from "./Providers";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { CartIcon, CheckIcon } from "./icons";
import type { ProductWithImages } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithImages }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const name = lang === "sq" ? product.name_sq : product.name_en;
  const desc = lang === "sq" ? product.description_sq : product.description_en;
  const unit = lang === "sq" ? product.unit_sq : product.unit_en;
  const soldOut = product.stock <= 0;

  function handleAdd() {
    add({
      productId: product.id,
      name_sq: product.name_sq,
      name_en: product.name_en,
      price: product.price,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="card hover-lift group flex flex-col overflow-hidden">
      <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-surface">
        <ProductImage images={product.images} alt={name} />
        {product.featured === 1 && (
          <span className="absolute left-3 top-3 chip bg-brand text-white shadow-soft">
            {t("featured_badge")}
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 chip bg-ink/80 text-white">
            {t("out_of_stock")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-700 text-ink">{name}</h3>
          <span className="shrink-0 font-700 text-brand">
            {formatPrice(product.price)}
          </span>
        </div>
        {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
        <p className="mt-1 text-xs text-muted">/ {unit}</p>

        <div className="mt-4 flex-1" />

        <button
          onClick={handleAdd}
          disabled={soldOut}
          className={`btn w-full ${
            justAdded
              ? "animate-pop bg-green-600 text-white"
              : soldOut
                ? "border border-line bg-surface text-muted"
                : "btn-primary"
          }`}
        >
          {soldOut ? (
            t("out_of_stock")
          ) : justAdded ? (
            <>
              <CheckIcon size={18} /> {t("added")}
            </>
          ) : (
            <>
              <CartIcon size={18} /> {t("add_to_cart")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
