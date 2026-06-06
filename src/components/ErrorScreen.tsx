"use client";

import Link from "next/link";
import { useLang } from "./Providers";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { SteamingBowl } from "./Illustrations";
import { ArrowRightIcon } from "./icons";
import type { DictKey } from "@/lib/i18n";

/**
 * Branded full-screen error state, reused by the 404 (not-found) page and the
 * runtime error boundary. Gives users a clear way back to the site.
 */
export function ErrorScreen({
  code,
  titleKey,
  textKey,
  onRetry,
}: {
  code?: string;
  titleKey: DictKey;
  textKey: DictKey;
  onRetry?: () => void;
}) {
  const { t } = useLang();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 text-center">
      {/* Decorative brand illustration */}
      <SteamingBowl className="animate-float-slow pointer-events-none absolute -right-10 top-10 h-48 w-48 text-brand/[0.06]" />

      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>

      <Link href="/" className="mb-8">
        <Logo />
      </Link>

      <div className="animate-fade-up relative w-full max-w-md">
        {code && (
          <p className="font-display text-7xl font-700 leading-none text-brand">
            {code}
          </p>
        )}
        <h1 className="mt-4 font-display text-3xl font-700 text-ink">
          {t(titleKey)}
        </h1>
        <p className="mt-3 text-balance text-muted">{t(textKey)}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary group w-full sm:w-auto">
            {t("go_home")}
            <ArrowRightIcon
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          {onRetry ? (
            <button onClick={onRetry} className="btn-outline w-full sm:w-auto">
              {t("try_again")}
            </button>
          ) : (
            <Link href="/menu" className="btn-outline w-full sm:w-auto">
              {t("go_menu")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
