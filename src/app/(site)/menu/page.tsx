import { MenuView } from "@/components/MenuView";
import { getActiveProducts, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function MenuPage() {
  const products = getActiveProducts();
  const categories = getCategories();
  return <MenuView products={products} categories={categories} />;
}
