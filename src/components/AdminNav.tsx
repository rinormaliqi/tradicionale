"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./Providers";
import { LanguageToggle } from "./LanguageToggle";
import { ExternalIcon } from "./icons";
import { logout } from "@/app/actions/auth";

export function AdminNav() {
  const { t } = useLang();
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: t("admin_dashboard") },
    { href: "/admin/orders", label: t("admin_orders") },
    { href: "/admin/products", label: t("admin_products") },
    { href: "/admin/inventory", label: t("admin_inventory") },
    { href: "/admin/reports", label: t("admin_reports") },
    { href: "/admin/content", label: t("admin_content") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Top row: brand + controls */}
        <div className="flex items-center justify-between gap-3 py-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-display text-lg font-700 text-ink sm:text-xl"
          >
            TRADICIONALE
            <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-700 text-white">
              ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label={t("nav_home")}
              className="hidden items-center gap-1 text-sm font-600 text-muted hover:text-ink sm:inline-flex"
            >
              <ExternalIcon size={16} /> {t("nav_home")}
            </Link>
            <LanguageToggle />
            <form action={logout}>
              <button className="btn-outline px-3 py-2 text-sm">
                {t("admin_logout")}
              </button>
            </form>
          </div>
        </div>

        {/* Nav row: scrolls horizontally on small screens */}
        <nav className="no-scrollbar -mb-px flex gap-1 overflow-x-auto pb-2">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-600 transition-colors ${
                  active ? "bg-brand-light text-brand" : "text-ink hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
