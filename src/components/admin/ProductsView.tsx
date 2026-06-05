"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { ImageManager } from "./ImageManager";
import { PencilIcon, PlusIcon, StarIcon, TrashIcon } from "@/components/icons";
import { removeProduct, saveProduct } from "@/app/actions/products";
import type { ProductWithImages } from "@/lib/types";

export function ProductsView({ products }: { products: ProductWithImages[] }) {
  const { t } = useLang();
  const router = useRouter();
  const [editing, setEditing] = useState<ProductWithImages | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete(id: number) {
    if (!confirm(t("confirm_delete"))) return;
    startTransition(async () => {
      await removeProduct(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-700 text-ink">
          {t("admin_products")}
        </h1>
        <button className="btn-primary" onClick={() => setEditing("new")}>
          <PlusIcon size={18} /> {t("add_product")}
        </button>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3" colSpan={2}>
                {t("p_name_sq")}
              </th>
              <th className="px-4 py-3">{t("p_category")}</th>
              <th className="px-4 py-3 text-right">{t("p_price")}</th>
              <th className="px-4 py-3 text-right">{t("p_stock")}</th>
              <th className="px-4 py-3 text-center">{t("p_active")}</th>
              <th className="px-4 py-3 text-right">{t("th_actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface/60">
                <td className="py-2 pl-4">
                  <div className="h-11 w-11 overflow-hidden rounded-lg border border-line bg-surface">
                    <ProductImage images={p.images} alt={p.name_sq} />
                  </div>
                </td>
                <td className="px-2 py-3">
                  <p className="flex items-center gap-1.5 font-600 text-ink">
                    {p.name_sq}
                    {p.featured === 1 && (
                      <StarIcon size={14} className="text-brand" />
                    )}
                  </p>
                  <p className="text-xs text-muted">{p.name_en}</p>
                </td>
                <td className="px-4 py-3 text-muted">{p.category}</td>
                <td className="px-4 py-3 text-right font-600 text-ink">
                  {formatPrice(p.price)}
                </td>
                <td className="px-4 py-3 text-right text-ink">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      p.active ? "bg-green-500" : "bg-line"
                    }`}
                    title={p.active ? t("in_stock") : "—"}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="rounded-lg p-2 text-brand hover:bg-brand-light"
                      onClick={() => setEditing(p)}
                      title={t("edit")}
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(p.id)}
                      disabled={pending}
                      title={t("delete")}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductModal
          product={editing === "new" ? null : editing}
          onClose={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
}: {
  product: ProductWithImages | null;
  onClose: () => void;
}) {
  const { t } = useLang();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  // Once a brand-new product is saved, we keep its id so images can be added.
  const [savedId, setSavedId] = useState<number | null>(product?.id ?? null);

  async function action(fd: FormData) {
    setSaving(true);
    setError(false);
    const res = await saveProduct(fd);
    setSaving(false);
    if (res.ok) {
      setSavedId(res.productId ?? savedId);
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card my-8 w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl font-700 text-ink">
          {savedId ? t("edit") : t("add_product")}
        </h2>

        <form action={action} className="mt-5 space-y-4">
          {savedId && <input type="hidden" name="id" value={savedId} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${t("p_name_sq")} *`} name="name_sq" defaultValue={product?.name_sq} required />
            <Field label={`${t("p_name_en")} *`} name="name_en" defaultValue={product?.name_en} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("p_desc_sq")} name="description_sq" defaultValue={product?.description_sq} />
            <Field label={t("p_desc_en")} name="description_en" defaultValue={product?.description_en} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`${t("p_price")} *`} name="price" type="number" step="0.01" defaultValue={product?.price} required />
            <Field label={t("p_category")} name="category" defaultValue={product?.category ?? "Tjera"} />
            <Field label={t("p_stock")} name="stock" type="number" defaultValue={product?.stock ?? 0} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("p_unit_sq")} name="unit_sq" defaultValue={product?.unit_sq ?? "copë"} />
            <Field label={t("p_unit_en")} name="unit_en" defaultValue={product?.unit_en ?? "pcs"} />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-600 text-ink">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product ? product.active === 1 : true}
                className="h-4 w-4 accent-brand"
              />
              {t("p_active")}
            </label>
            <label className="flex items-center gap-2 text-sm font-600 text-ink">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product ? product.featured === 1 : false}
                className="h-4 w-4 accent-brand"
              />
              {t("p_featured")}
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {t("required")}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button type="button" className="btn-outline" onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "..." : t("save")}
            </button>
          </div>
        </form>

        {/* Image gallery — only once the product exists in the DB. */}
        <div className="mt-6 border-t border-line pt-5">
          {savedId ? (
            <ImageManager productId={savedId} onChange={() => router.refresh()} />
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-5 text-center text-sm text-muted">
              {t("save_first")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </div>
  );
}
