"use client";

import Link from "next/link";
import { useLang } from "./Providers";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-700 text-ink">TRADICIONALE</p>
          <p className="mt-1 text-muted">{t("tagline")}</p>
        </div>
        <div className="text-muted">
          <p className="font-600 text-ink">{t("hero_hours")}</p>
          <p className="mt-1">Lot Vaku, Prishtinë, Kosovë</p>
        </div>
        <div className="text-muted">
          <p className="font-600 text-ink">Porosi / Orders</p>
          <p className="mt-1">045 301 306</p>
        </div>
      </div>
      <div className="border-t border-line py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Tradicionale</span>
          <Link
            href="/admin"
            className="text-muted underline-offset-2 transition-colors hover:text-brand hover:underline"
          >
            {t("admin_login")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
