/** Canonical site URL, used for metadata, sitemap, robots and structured data. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3100"
).replace(/\/$/, "");

export const SITE = {
  name: "Tradicionale",
  tagline_sq: "Në mënyrë artizanale",
  phone: "045 301 306",
  phoneIntl: "+38345301306",
  street: "Lot Vaku",
  city: "Prishtinë",
  region: "Prishtinë",
  postalCode: "10000",
  country: "XK", // Kosovo
  hours: "Mo-Su 09:00-18:00",
} as const;
