import { ContentView } from "@/components/admin/ContentView";
import { getAllPromos, getHero } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function ContentPage() {
  const hero = getHero();
  const promos = getAllPromos();
  return <ContentView hero={hero} promos={promos} />;
}
