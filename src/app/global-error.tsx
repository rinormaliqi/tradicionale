"use client";

import { useEffect } from "react";

/**
 * Last-resort fallback if the root layout itself fails. It replaces the whole
 * document, so it can't use the app's providers/CSS — styles are inline and the
 * copy is shown in both languages.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="sq">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          background: "#F7F7F6",
          color: "#1A1A1A",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#0057B8",
          }}
        >
          TRADICIONALE
        </div>
        <h1 style={{ fontSize: "28px", margin: "12px 0 4px" }}>
          Diçka shkoi keq
        </h1>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            color: "#6B7280",
            maxWidth: "420px",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Ndodhi një gabim i papritur. Provoni përsëri ose kthehuni te ballina.
          <br />
          <span style={{ fontSize: "13px" }}>
            An unexpected error occurred. Please try again or go back home.
          </span>
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #E8E8E8",
              background: "#fff",
              color: "#1A1A1A",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Provo përsëri
          </button>
          <a
            href="/"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#0057B8",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Kthehu te ballina
          </a>
        </div>
      </body>
    </html>
  );
}
