"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./Providers";
import { LanguageToggle } from "./LanguageToggle";
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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="font-display text-xl font-700 text-ink">
            TRADICIONALE
            <span className="ml-2 rounded bg-brand px-1.5 py-0.5 align-middle text-[10px] font-700 text-white">
              ADMIN
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-2 text-sm font-600 transition-colors ${
                    active ? "bg-brand-light text-brand" : "text-ink hover:bg-surface"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/" className="text-sm font-600 text-muted hover:text-ink">
            ↗ {t("nav_home")}
          </Link>
          <LanguageToggle />
          <form action={logout}>
            <button className="btn-outline px-3 py-2 text-sm">
              {t("admin_logout")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
