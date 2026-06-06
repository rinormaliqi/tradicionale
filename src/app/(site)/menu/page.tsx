import type { Metadata } from "next";
import { MenuView } from "@/components/MenuView";
import { getActiveProducts, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menyja — Mantia, Byrek, Fli, Sarma",
  description:
    "Shfleto menynë e Tradicionale: mantia, byrek me mish e spinaq, fli, sarma dhe gatime të tjera tradicionale shqiptare. Porosit online me dërgesa falas në Prishtinë.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Menyja e Tradicionale — gatime tradicionale shqiptare",
    description:
      "Mantia, byrek, fli, sarma e më shumë. Porosit online, dërgesa falas në Prishtinë.",
    url: "/menu",
  },
};

export default async function MenuPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);
  return <MenuView products={products} categories={categories} />;
}
