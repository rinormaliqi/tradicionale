import { InventoryView } from "@/components/admin/InventoryView";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await getAllProducts();
  return <InventoryView products={products} />;
}
