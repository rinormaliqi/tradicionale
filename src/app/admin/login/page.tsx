"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { useLang } from "@/components/Providers";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";

function SubmitButton() {
  const { t } = useLang();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "..." : t("admin_enter")}
    </button>
  );
}

export default function AdminLoginPage() {
  const { t } = useLang();
  const [state, formAction] = useFormState(login, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-center font-display text-2xl font-700 text-ink">
            {t("admin_login")}
          </h1>
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="label">{t("admin_password")}</label>
              <input
                type="password"
                name="password"
                className="input"
                autoFocus
                required
              />
            </div>
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {t("admin_wrong")}
              </p>
            )}
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
