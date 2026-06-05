import { ReportsView } from "@/components/admin/ReportsView";
import { getMonthlyStatement, getMonthlyStatements } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function ReportsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const months = getMonthlyStatements();
  const fallback = months[0]?.ym ?? new Date().toISOString().slice(0, 7);
  const ym =
    searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? searchParams.month
      : fallback;

  const statement = getMonthlyStatement(ym);
  return <ReportsView ym={ym} statement={statement} months={months} />;
}
