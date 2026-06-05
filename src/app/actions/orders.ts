"use server";

import { createOrder, updateOrderStatus } from "@/lib/queries";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type PlaceOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; error: string };

export async function placeOrder(input: {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment_method: string;
  items: { productId: number; quantity: number }[];
}): Promise<PlaceOrderResult> {
  const name = input.customer_name?.trim();
  const phone = input.phone?.trim();
  const address = input.address?.trim();

  if (!name || !phone || !address) {
    return { ok: false, error: "MISSING_FIELDS" };
  }
  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "EMPTY_ORDER" };
  }

  try {
    const orderId = await createOrder({
      customer_name: name,
      phone,
      address,
      city: input.city?.trim() || "Prishtinë",
      notes: input.notes?.trim() || "",
      payment_method: input.payment_method || "cash",
      items: input.items,
    });
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { ok: true, orderId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    return { ok: false, error: msg };
  }
}

export async function changeOrderStatus(id: number, status: string) {
  if (!isAuthenticated()) return { ok: false };
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

/** Admin-created order (phone / WhatsApp / in-store). */
export async function createManualOrder(input: {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  source: string;
  items: { productId: number; quantity: number }[];
}): Promise<PlaceOrderResult> {
  if (!isAuthenticated()) return { ok: false, error: "AUTH" };

  const name = input.customer_name?.trim();
  const phone = input.phone?.trim();
  if (!name || !phone) return { ok: false, error: "MISSING_FIELDS" };
  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "EMPTY_ORDER" };
  }

  try {
    const orderId = await createOrder({
      customer_name: name,
      phone,
      address: input.address?.trim() || "—",
      city: input.city?.trim() || "Prishtinë",
      notes: input.notes?.trim() || "",
      payment_method: "cash",
      source: input.source || "phone",
      items: input.items,
    });
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { ok: true, orderId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    return { ok: false, error: msg };
  }
}
