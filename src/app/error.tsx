"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log so issues are visible in server/Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen titleKey="err_title" textKey="err_text" onRetry={reset} />
  );
}
