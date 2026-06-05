import { notFound } from "next/navigation";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { getOrder } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(Number(params.id));
  if (!order) notFound();
  return <OrderConfirmation order={order} />;
}
