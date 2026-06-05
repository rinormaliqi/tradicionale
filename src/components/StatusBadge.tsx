"use client";

import { useLang } from "./Providers";
import type { OrderStatus } from "@/lib/types";
import type { DictKey } from "@/lib/i18n";

const STYLES: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  preparing: "bg-amber-50 text-amber-700",
  out_for_delivery: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const KEYS: Record<OrderStatus, DictKey> = {
  new: "st_new",
  preparing: "st_preparing",
  out_for_delivery: "st_out_for_delivery",
  delivered: "st_delivered",
  cancelled: "st_cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLang();
  return <span className={`chip ${STYLES[status]}`}>{t(KEYS[status])}</span>;
}
