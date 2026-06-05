import { DashboardView } from "@/components/admin/DashboardView";
import { getMonthlyStatements, getStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, months] = await Promise.all([getStats(), getMonthlyStatements()]);
  return <DashboardView stats={stats} months={months} />;
}
