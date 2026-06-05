"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/Providers";
import { imageSrc } from "@/components/ProductImage";
import { StarIcon, TrashIcon, UploadIcon } from "@/components/icons";
import {
  listProductImages,
  makePrimaryImage,
  removeProductImage,
  uploadProductImage,
} from "@/app/actions/products";
import type { ProductImage } from "@/lib/types";

export function ImageManager({
  productId,
  onChange,
}: {
  productId: number;
  onChange?: () => void;
}) {
  const { t } = useLang();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setImages(await listProductImages(productId));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await uploadProductImage(productId, fd);
    }
    await refresh();
    onChange?.();
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(linkId: number) {
    setBusy(true);
    await removeProductImage(linkId);
    await refresh();
    onChange?.();
    setBusy(false);
  }

  async function handlePrimary(linkId: number) {
    setBusy(true);
    await makePrimaryImage(linkId);
    await refresh();
    onChange?.();
    setBusy(false);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{t("p_images")}</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-outline px-3 py-1.5 text-xs"
        >
          <UploadIcon size={15} /> {busy ? t("uploading") : t("upload_image")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-6 text-center text-sm text-muted">
          {t("no_images")}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc(img.image_id, true)}
                alt=""
                className="h-full w-full object-cover"
              />
              {img.is_primary === 1 && (
                <span className="absolute left-1.5 top-1.5 chip bg-brand px-2 py-0.5 text-[10px] text-white">
                  {t("primary")}
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {img.is_primary !== 1 && (
                  <button
                    type="button"
                    title={t("set_primary")}
                    onClick={() => handlePrimary(img.id)}
                    disabled={busy}
                    className="rounded bg-white/90 p-1 text-ink hover:bg-white"
                  >
                    <StarIcon size={14} />
                  </button>
                )}
                <button
                  type="button"
                  title={t("delete")}
                  onClick={() => handleDelete(img.id)}
                  disabled={busy}
                  className="ml-auto rounded bg-white/90 p-1 text-red-600 hover:bg-white"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-muted">{t("image_hint")}</p>
    </div>
  );
}
