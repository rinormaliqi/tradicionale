import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated()) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-surface">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
