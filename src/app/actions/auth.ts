"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function login(
  _prev: { error: boolean } | null,
  formData: FormData
): Promise<{ error: boolean }> {
  const password = String(formData.get("password") || "");
  if (!verifyPassword(password)) {
    return { error: true };
  }
  createSession();
  redirect("/admin/dashboard");
}

export async function logout() {
  destroySession();
  redirect("/admin/login");
}
