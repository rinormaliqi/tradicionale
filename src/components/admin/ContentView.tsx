"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/Providers";
import { imageSrc } from "@/components/ProductImage";
import {
  ImageIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "@/components/icons";
import {
  removeHeroImage,
  removePromo,
  saveHero,
  savePromo,
  uploadHeroImage,
  uploadPromoImage,
} from "@/app/actions/content";
import type { Hero, Promo } from "@/lib/types";

export function ContentView({ hero, promos }: { hero: Hero; promos: Promo[] }) {
  const { t } = useLang();
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-700 text-ink">
          {t("admin_content")}
        </h1>
      </div>
      <HeroEditor hero={hero} />
      <PromosEditor promos={promos} />
    </div>
  );
}

/* ------------------------- Hero ------------------------- */

function HeroEditor({ hero }: { hero: Hero }) {
  const { t } = useLang();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function action(fd: FormData) {
    setSaving(true);
    if (hero.image_id) fd.set("image_id", String(hero.image_id));
    await saveHero(fd);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    router.refresh();
  }

  async function upload(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", files[0]);
    await uploadHeroImage(fd);
    setUploading(false);
    router.refresh();
    if (fileRef.current) fileRef.current.value = "";
  }

  async function clearImage() {
    await removeHeroImage();
    router.refresh();
  }

  return (
    <section className="card p-6">
      <h2 className="font-display text-xl font-700 text-ink">
        {t("hero_section")}
      </h2>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        <form action={action} className="space-y-4">
          <BilingualField
            label={t("hero_eyebrow")}
            name="eyebrow"
            sq={hero.eyebrow_sq}
            en={hero.eyebrow_en}
          />
          <BilingualField
            label={t("hero_heading")}
            name="title"
            sq={hero.title_sq}
            en={hero.title_en}
          />
          <BilingualField
            label={t("hero_subtitle")}
            name="subtitle"
            sq={hero.subtitle_sq}
            en={hero.subtitle_en}
            textarea
          />
          <BilingualField
            label={t("hero_badge")}
            name="badge"
            sq={hero.badge_sq}
            en={hero.badge_en}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <BilingualField
              label={t("hero_cta_label")}
              name="cta"
              sq={hero.cta_sq}
              en={hero.cta_en}
              singleRow
            />
            <div>
              <label className="label">{t("hero_link")}</label>
              <input className="input" name="cta_href" defaultValue={hero.cta_href} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "..." : t("save")}
            </button>
            {saved && (
              <span className="text-sm font-600 text-green-600">✓ {t("save")}</span>
            )}
          </div>
        </form>

        {/* Hero image */}
        <div>
          <label className="label">{t("hero_image")}</label>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
            {hero.image_id ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc(hero.image_id, true)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-line">
                <ImageIcon size={40} />
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-outline flex-1 px-3 py-1.5 text-xs"
            >
              <UploadIcon size={15} /> {uploading ? t("uploading") : t("upload_image")}
            </button>
            {hero.image_id && (
              <button
                type="button"
                onClick={clearImage}
                className="btn-outline px-3 py-1.5 text-xs text-red-600"
              >
                <XIcon size={15} />
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <p className="mt-2 text-xs text-muted">{t("image_hint")}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Promos ------------------------- */

function PromosEditor({ promos }: { promos: Promo[] }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const [editing, setEditing] = useState<Promo | "new" | null>(null);

  async function onDelete(id: number) {
    if (!confirm(t("confirm_delete"))) return;
    await removePromo(id);
    router.refresh();
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-700 text-ink">
          {t("promos_section")}
        </h2>
        <button className="btn-primary" onClick={() => setEditing("new")}>
          <PlusIcon size={18} /> {t("add_promo")}
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {promos.length === 0 && (
          <p className="text-sm text-muted">{t("no_orders")}</p>
        )}
        {promos.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 rounded-lg border border-line p-3"
          >
            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-surface">
              {p.image_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc(p.image_id, true)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-line">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-600 text-ink">
                  {lang === "sq" ? p.title_sq : p.title_en}
                </p>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    p.active ? "bg-green-500" : "bg-line"
                  }`}
                />
              </div>
              <p className="line-clamp-2 text-xs text-muted">
                {lang === "sq" ? p.text_sq : p.text_en}
              </p>
              {p.price_text && (
                <p className="mt-1 text-sm font-700 text-brand">{p.price_text}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEditing(p)}
                className="rounded-lg p-1.5 text-brand hover:bg-brand-light"
                title={t("edit")}
              >
                <PencilIcon size={15} />
              </button>
              <button
                onClick={() => onDelete(p.id)}
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                title={t("delete")}
              >
                <TrashIcon size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <PromoModal
          promo={editing === "new" ? null : editing}
          onClose={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

function PromoModal({
  promo,
  onClose,
}: {
  promo: Promo | null;
  onClose: () => void;
}) {
  const { t } = useLang();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(promo?.id ?? null);
  const [imageId] = useState<number | null>(promo?.image_id ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function action(fd: FormData) {
    setSaving(true);
    if (imageId) fd.set("image_id", String(imageId));
    const res = await savePromo(fd);
    setSaving(false);
    if (res.ok) {
      setSavedId(res.promoId ?? savedId);
      router.refresh();
    }
  }

  async function upload(files: FileList | null) {
    if (!files?.[0] || !savedId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", files[0]);
    await uploadPromoImage(savedId, fd);
    setUploading(false);
    router.refresh();
    // Reflect the new image immediately via cache-busting reload of the row.
    window.location.reload();
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div className="card my-8 w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl font-700 text-ink">
          {savedId ? t("edit") : t("add_promo")}
        </h2>

        <form action={action} className="mt-5 space-y-4">
          {savedId && <input type="hidden" name="id" value={savedId} />}
          <BilingualField
            label={t("promo_title")}
            name="title"
            sq={promo?.title_sq ?? ""}
            en={promo?.title_en ?? ""}
            singleRow
          />
          <BilingualField
            label={t("promo_text")}
            name="text"
            sq={promo?.text_sq ?? ""}
            en={promo?.text_en ?? ""}
            textarea
          />
          <BilingualField
            label={t("promo_badge")}
            name="badge"
            sq={promo?.badge_sq ?? ""}
            en={promo?.badge_en ?? ""}
            singleRow
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">{t("promo_price")}</label>
              <input className="input" name="price_text" defaultValue={promo?.price_text ?? ""} />
            </div>
            <div>
              <label className="label">{t("promo_link")}</label>
              <input className="input" name="href" defaultValue={promo?.href ?? "/menu"} />
            </div>
            <div>
              <label className="label">{t("promo_sort")}</label>
              <input className="input" name="sort" type="number" defaultValue={promo?.sort ?? 0} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-600 text-ink">
            <input
              type="checkbox"
              name="active"
              defaultChecked={promo ? promo.active === 1 : true}
              className="h-4 w-4 accent-brand"
            />
            {t("promo_active")}
          </label>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button type="button" className="btn-outline" onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "..." : t("save")}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-line pt-5">
          <label className="label">{t("hero_image")}</label>
          {savedId ? (
            <div className="flex items-center gap-3">
              <div className="h-20 w-28 overflow-hidden rounded-lg border border-line bg-surface">
                {imageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageSrc(imageId, true)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-line">
                    <ImageIcon size={26} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                <UploadIcon size={15} /> {uploading ? t("uploading") : t("upload_image")}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => upload(e.target.files)}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-4 text-center text-sm text-muted">
              {t("save_first")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Shared field ------------------------- */

function BilingualField({
  label,
  name,
  sq,
  en,
  textarea,
  singleRow,
}: {
  label: string;
  name: string;
  sq: string;
  en: string;
  textarea?: boolean;
  singleRow?: boolean;
}) {
  const { t } = useLang();
  const Input = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="label">{label}</label>
      <div className={`grid gap-3 ${singleRow ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        <div>
          <Input
            className={`input ${textarea ? "min-h-[70px]" : ""}`}
            name={`${name}_sq`}
            defaultValue={sq}
            placeholder={t("field_sq")}
          />
          <span className="mt-1 block text-[11px] text-muted">{t("field_sq")}</span>
        </div>
        <div>
          <Input
            className={`input ${textarea ? "min-h-[70px]" : ""}`}
            name={`${name}_en`}
            defaultValue={en}
            placeholder={t("field_en")}
          />
          <span className="mt-1 block text-[11px] text-muted">{t("field_en")}</span>
        </div>
      </div>
    </div>
  );
}
