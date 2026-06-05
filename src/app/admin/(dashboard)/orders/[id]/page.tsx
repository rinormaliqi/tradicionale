import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import { getOrder } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(Number(params.id));
  if (!order) notFound();
  return <OrderDetailView order={order} />;
}
