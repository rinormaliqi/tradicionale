"use client";

import Link from "next/link";
import { useLang } from "./Providers";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { imageSrc } from "./ProductImage";
import { ChefHatIcon, TruckIcon, ClockIcon, ArrowRightIcon } from "./icons";
import { WheatSprig, SteamingBowl, RollingPin, PlateIllustration } from "./Illustrations";
import type { Hero, Promo, ProductWithImages } from "@/lib/types";

export function HomeView({
  hero,
  promos,
  featured,
}: {
  hero: Hero;
  promos: Promo[];
  featured: ProductWithImages[];
}) {
  const { lang, t } = useLang();

  const pick = (sq: string, en: string) => (lang === "sq" ? sq : en);
  const eyebrow = pick(hero.eyebrow_sq, hero.eyebrow_en);
  const title = pick(hero.title_sq, hero.title_en);
  const subtitle = pick(hero.subtitle_sq, hero.subtitle_en);
  const cta = pick(hero.cta_sq, hero.cta_en) || t("hero_cta");
  const badge = pick(hero.badge_sq, hero.badge_en);

  const features = [
    { title: t("feature_handmade"), desc: t("feature_handmade_d"), Icon: ChefHatIcon },
    { title: t("feature_delivery"), desc: t("feature_delivery_d"), Icon: TruckIcon },
    { title: t("feature_daily"), desc: t("feature_daily_d"), Icon: ClockIcon },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        {/* Decorative food line-art */}
        <WheatSprig className="animate-float-slow pointer-events-none absolute -left-4 top-10 h-40 w-20 text-brand/10" />
        <RollingPin className="pointer-events-none absolute right-8 top-12 h-12 w-28 text-brand/10" />
        <PlateIllustration className="animate-float-slow pointer-events-none absolute -right-10 bottom-0 h-56 w-56 text-brand/[0.07]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
          <div className="animate-fade-up text-center lg:text-left">
            {eyebrow && (
              <p className="mb-3 text-xs font-700 uppercase tracking-[0.3em] text-brand">
                {eyebrow}
              </p>
            )}
            {badge && (
              <span className="mb-4 inline-block chip bg-brand text-white shadow-soft">
                {badge}
              </span>
            )}
            <h1 className="font-display text-5xl font-700 leading-[1.05] text-ink sm:text-6xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-muted lg:mx-0">
              {subtitle}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              <Link href={hero.cta_href || "/menu"} className="btn-primary group">
                {cta}
                <ArrowRightIcon
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">{t("hero_hours")}</p>
          </div>

          {/* Hero visual */}
          <div className="animate-fade-up relative mx-auto aspect-[4/3] w-full max-w-md [animation-delay:120ms]">
            <div className="img-zoom card h-full w-full overflow-hidden rounded-xl2 shadow-soft">
              {hero.image_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc(hero.image_id)}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-brand-light to-surface text-brand/40">
                  <SteamingBowl className="h-28 w-28" />
                  <span className="font-display text-lg tracking-[0.3em]">
                    TRADICIONALE
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="card hover-lift h-full p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
                  <f.Icon size={24} />
                </div>
                <h3 className="mt-4 font-display text-xl font-700 text-ink">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Promo banners */}
      {promos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4">
          <Reveal>
            <h2 className="mb-6 font-display text-3xl font-700 text-ink">
              {t("offers_title")}
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {promos.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <PromoBanner promo={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-display text-3xl font-700 text-ink">
                {t("menu_title")}
              </h2>
              <Link
                href="/menu"
                className="group inline-flex items-center gap-1 text-sm font-600 text-brand hover:underline"
              >
                {t("view_menu")}
                <ArrowRightIcon
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function PromoBanner({ promo }: { promo: Promo }) {
  const { lang } = useLang();
  const pick = (sq: string, en: string) => (lang === "sq" ? sq : en);
  const title = pick(promo.title_sq, promo.title_en);
  const text = pick(promo.text_sq, promo.text_en);
  const badge = pick(promo.badge_sq, promo.badge_en);

  return (
    <Link
      href={promo.href || "/menu"}
      className="hover-lift group relative flex min-h-[180px] overflow-hidden rounded-xl2 border border-line bg-ink text-white shadow-card"
    >
      {/* Background image or gradient */}
      <div className="img-zoom absolute inset-0">
        {promo.image_id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc(promo.image_id)}
            alt={title}
            className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-70"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand to-brand-dark" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end p-6">
        {badge && (
          <span className="mb-2 w-fit chip bg-white/90 text-brand-dark">
            {badge}
          </span>
        )}
        <h3 className="font-display text-2xl font-700 drop-shadow">{title}</h3>
        {text && <p className="mt-1 max-w-md text-sm text-white/85">{text}</p>}
        {promo.price_text && (
          <p className="mt-2 font-display text-2xl font-700">{promo.price_text}</p>
        )}
      </div>
    </Link>
  );
}
