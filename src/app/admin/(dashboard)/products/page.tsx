import { ProductsView } from "@/components/admin/ProductsView";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const products = getAllProducts();
  return <ProductsView products={products} />;
}
