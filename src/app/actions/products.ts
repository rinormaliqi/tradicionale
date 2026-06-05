"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { processImage } from "@/lib/images";
import {
  addImage,
  addProductImage,
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProductImages,
  setPrimaryProductImage,
  updateProduct,
  updateStock,
  type ProductInput,
} from "@/lib/queries";

function parseInput(fd: FormData): ProductInput {
  return {
    name_sq: String(fd.get("name_sq") || "").trim(),
    name_en: String(fd.get("name_en") || "").trim(),
    description_sq: String(fd.get("description_sq") || "").trim(),
    description_en: String(fd.get("description_en") || "").trim(),
    price: Number(fd.get("price") || 0),
    category: String(fd.get("category") || "Tjera").trim() || "Tjera",
    image_url: String(fd.get("image_url") || "").trim(),
    unit_sq: String(fd.get("unit_sq") || "copë").trim() || "copë",
    unit_en: String(fd.get("unit_en") || "pcs").trim() || "pcs",
    stock: Math.max(0, Math.floor(Number(fd.get("stock") || 0))),
    active: fd.get("active") === "on" || fd.get("active") === "1" ? 1 : 0,
    featured: fd.get("featured") === "on" || fd.get("featured") === "1" ? 1 : 0,
  };
}

export async function saveProduct(fd: FormData) {
  if (!isAuthenticated()) return { ok: false };
  const idRaw = fd.get("id");
  const input = parseInput(fd);
  if (!input.name_sq || !input.name_en || input.price <= 0) {
    return { ok: false, error: "INVALID" };
  }
  let productId: number;
  if (idRaw) {
    productId = Number(idRaw);
    await updateProduct(productId, input);
  } else {
    productId = await createProduct(input);
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true, productId };
}

export async function removeProduct(id: number) {
  if (!isAuthenticated()) return { ok: false };
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function setStock(id: number, stock: number) {
  if (!isAuthenticated()) return { ok: false };
  await updateStock(id, Math.max(0, Math.floor(stock)));
  revalidatePath("/admin/inventory");
  revalidatePath("/menu");
  return { ok: true };
}

// ---------- Product images ----------

export async function uploadProductImage(productId: number, fd: FormData) {
  if (!isAuthenticated()) return { ok: false, error: "AUTH" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "NO_FILE" };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "TOO_LARGE" };
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const processed = await processImage(buf);
    const imageId = await addImage(processed);
    await addProductImage(productId, imageId);
    revalidatePath("/admin/products");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "PROCESS" };
  }
}

export async function removeProductImage(linkId: number) {
  if (!isAuthenticated()) return { ok: false };
  await deleteProductImage(linkId);
  revalidatePath("/admin/products");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function makePrimaryImage(linkId: number) {
  if (!isAuthenticated()) return { ok: false };
  await setPrimaryProductImage(linkId);
  revalidatePath("/admin/products");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function listProductImages(productId: number) {
  if (!isAuthenticated()) return [];
  return await getProductImages(productId);
}
