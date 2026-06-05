import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AdminIndex() {
  redirect(isAuthenticated() ? "/admin/dashboard" : "/admin/login");
}
