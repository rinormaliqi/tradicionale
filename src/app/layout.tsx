import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tradicionale — Ushqime tradicionale shqiptare | Porosi online, Prishtinë",
    template: "%s | Tradicionale",
  },
  description:
    "Tradicionale — ushqime tradicionale shqiptare të punuara me dorë: mantia, byrek, fli, sarma. Porosit online, dërgesa falas në Prishtinë. Çdo ditë 09:00–18:00.",
  keywords: [
    "ushqime tradicionale shqiptare",
    "mantia",
    "byrek",
    "fli",
    "sarma",
    "porosi online ushqim",
    "dërgesa ushqimi Prishtinë",
    "gatime tradicionale Kosovë",
    "ushqim shtëpie Prishtinë",
    "traditional Albanian food",
    "Albanian food delivery Pristina",
  ],
  applicationName: "Tradicionale",
  authors: [{ name: "Tradicionale" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sq_AL",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "Tradicionale",
    title: "Tradicionale — Ushqime tradicionale shqiptare, porosit online",
    description:
      "Ushqime tradicionale shqiptare të punuara me dorë. Porosit online, dërgesa falas në Prishtinë.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tradicionale — Ushqime tradicionale shqiptare",
    description:
      "Mantia, byrek, fli e më shumë. Porosit online, dërgesa falas në Prishtinë.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "food",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
