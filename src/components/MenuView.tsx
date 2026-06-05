"use client";

import { useMemo, useState } from "react";
import { useLang } from "./Providers";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { ProductWithImages } from "@/lib/types";

export function MenuView({
  products,
  categories,
}: {
  products: ProductWithImages[];
  categories: string[];
}) {
  const { t } = useLang();
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(
    () =>
      active === "all"
        ? products
        : products.filter((p) => p.category === active),
    [active, products]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-700 text-ink">
        {t("menu_title")}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip
          label={t("menu_all")}
          active={active === "all"}
          onClick={() => setActive("all")}
        />
        {categories.map((c) => (
          <FilterChip
            key={c}
            label={c}
            active={active === c}
            onClick={() => setActive(c)}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 70}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
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
