import { ContentView } from "@/components/admin/ContentView";
import { getAllPromos, getHero } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const [hero, promos] = await Promise.all([getHero(), getAllPromos()]);
  return <ContentView hero={hero} promos={promos} />;
}
