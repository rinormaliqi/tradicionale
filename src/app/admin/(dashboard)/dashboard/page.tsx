import { DashboardView } from "@/components/admin/DashboardView";
import { getMonthlyStatements, getStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getStats();
  const months = getMonthlyStatements();
  return <DashboardView stats={stats} months={months} />;
}
