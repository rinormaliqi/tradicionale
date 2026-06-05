"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, useLang } from "./Providers";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";

export function Header() {
  const { t } = useLang();
  const { count } = useCart();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t("nav_home") },
    { href: "/menu", label: t("nav_menu") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-600 transition-colors ${
                pathname === l.href
                  ? "text-brand"
                  : "text-ink hover:bg-surface"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-600 hover:bg-surface"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline">{t("nav_cart")}</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-700 text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
