import { InventoryView } from "@/components/admin/InventoryView";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  const products = getAllProducts();
  return <InventoryView products={products} />;
}
