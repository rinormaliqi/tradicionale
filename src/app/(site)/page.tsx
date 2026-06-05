import { HomeView } from "@/components/HomeView";
import { getActivePromos, getFeaturedProducts, getHero } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, promos, featured] = await Promise.all([
    getHero(),
    getActivePromos(),
    getFeaturedProducts(3),
  ]);
  return <HomeView hero={hero} promos={promos} featured={featured} />;
}
