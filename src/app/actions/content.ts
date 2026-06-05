"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { processImage } from "@/lib/images";
import {
  addImage,
  clearHeroImage,
  createPromo,
  deletePromo,
  setHeroImage,
  setPromoImage,
  updateHero,
  updatePromo,
  type HeroInput,
  type PromoInput,
} from "@/lib/queries";

function s(fd: FormData, key: string): string {
  return String(fd.get(key) || "").trim();
}

// ---------- Hero ----------

export async function saveHero(fd: FormData) {
  if (!isAuthenticated()) return { ok: false };
  const input: HeroInput = {
    eyebrow_sq: s(fd, "eyebrow_sq"),
    eyebrow_en: s(fd, "eyebrow_en"),
    title_sq: s(fd, "title_sq"),
    title_en: s(fd, "title_en"),
    subtitle_sq: s(fd, "subtitle_sq"),
    subtitle_en: s(fd, "subtitle_en"),
    cta_sq: s(fd, "cta_sq"),
    cta_en: s(fd, "cta_en"),
    cta_href: s(fd, "cta_href") || "/menu",
    badge_sq: s(fd, "badge_sq"),
    badge_en: s(fd, "badge_en"),
    image_id: fd.get("image_id") ? Number(fd.get("image_id")) : null,
  };
  updateHero(input);
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function uploadHeroImage(fd: FormData) {
  if (!isAuthenticated()) return { ok: false, error: "AUTH" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "NO_FILE" };
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const imageId = addImage(await processImage(buf));
    setHeroImage(imageId);
    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true };
  } catch {
    return { ok: false, error: "PROCESS" };
  }
}

export async function removeHeroImage() {
  if (!isAuthenticated()) return { ok: false };
  clearHeroImage();
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

// ---------- Promos ----------

function parsePromo(fd: FormData): PromoInput {
  return {
    title_sq: s(fd, "title_sq"),
    title_en: s(fd, "title_en"),
    text_sq: s(fd, "text_sq"),
    text_en: s(fd, "text_en"),
    badge_sq: s(fd, "badge_sq"),
    badge_en: s(fd, "badge_en"),
    price_text: s(fd, "price_text"),
    href: s(fd, "href") || "/menu",
    image_id: fd.get("image_id") ? Number(fd.get("image_id")) : null,
    active: fd.get("active") === "on" || fd.get("active") === "1" ? 1 : 0,
    sort: Math.floor(Number(fd.get("sort") || 0)),
  };
}

export async function savePromo(fd: FormData) {
  if (!isAuthenticated()) return { ok: false };
  const idRaw = fd.get("id");
  const input = parsePromo(fd);
  if (!input.title_sq && !input.title_en) return { ok: false, error: "INVALID" };
  let promoId: number;
  if (idRaw) {
    promoId = Number(idRaw);
    updatePromo(promoId, input);
  } else {
    promoId = createPromo(input);
  }
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true, promoId };
}

export async function uploadPromoImage(promoId: number, fd: FormData) {
  if (!isAuthenticated()) return { ok: false, error: "AUTH" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "NO_FILE" };
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const imageId = addImage(await processImage(buf));
    setPromoImage(promoId, imageId);
    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true };
  } catch {
    return { ok: false, error: "PROCESS" };
  }
}

export async function removePromo(id: number) {
  if (!isAuthenticated()) return { ok: false };
  deletePromo(id);
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}
