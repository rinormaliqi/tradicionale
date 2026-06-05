import { MenuView } from "@/components/MenuView";
import { getActiveProducts, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);
  return <MenuView products={products} categories={categories} />;
}
