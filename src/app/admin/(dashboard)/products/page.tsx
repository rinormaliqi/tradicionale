import { ProductsView } from "@/components/admin/ProductsView";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAllProducts();
  return <ProductsView products={products} />;
}
