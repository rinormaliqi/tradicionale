import { HomeView } from "@/components/HomeView";
import { getActivePromos, getFeaturedProducts, getHero } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const hero = getHero();
  const promos = getActivePromos();
  const featured = getFeaturedProducts(3);
  return <HomeView hero={hero} promos={promos} featured={featured} />;
}
