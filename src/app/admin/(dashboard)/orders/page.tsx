import { OrdersView } from "@/components/admin/OrdersView";
import { getActiveProducts, getOrdersPage } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string };
}) {
  const status = searchParams.status ?? "all";
  const search = searchParams.q ?? "";
  const page = Number(searchParams.page ?? "1") || 1;

  const [data, products] = await Promise.all([
    getOrdersPage({ status, search, page, pageSize: 20 }),
    getActiveProducts(),
  ]);

  return (
    <OrdersView
      data={data}
      status={status}
      search={search}
      products={products}
    />
  );
}
