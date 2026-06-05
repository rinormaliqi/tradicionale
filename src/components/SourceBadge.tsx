"use client";

import { useLang } from "./Providers";
import type { OrderSource } from "@/lib/types";
import type { DictKey } from "@/lib/i18n";

const STYLES: Record<OrderSource, string> = {
  online: "bg-slate-100 text-slate-700",
  phone: "bg-sky-50 text-sky-700",
  whatsapp: "bg-green-50 text-green-700",
  in_store: "bg-amber-50 text-amber-700",
};

const KEYS: Record<OrderSource, DictKey> = {
  online: "src_online",
  phone: "src_phone",
  whatsapp: "src_whatsapp",
  in_store: "src_in_store",
};

export function SourceBadge({ source }: { source: OrderSource }) {
  const { t } = useLang();
  const key = KEYS[source] ?? "src_online";
  const style = STYLES[source] ?? STYLES.online;
  return <span className={`chip ${style}`}>{t(key)}</span>;
}
