import type { Lang } from "./i18n";

export function formatPrice(value: number): string {
  return `${value.toFixed(2)} €`;
}

// Kosovo/Pristina timezone (CET/CEST). Fixed so server (UTC) and client render
// identical strings — otherwise React throws a hydration mismatch.
const TZ = "Europe/Belgrade";

const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatDate(iso: string, _lang: Lang = "sq"): string {
  // SQLite stores UTC ("YYYY-MM-DD HH:MM:SS"); normalize to a real Date.
  const date = new Date(iso.replace(" ", "T") + "Z");
  // en-GB numeric format ("dd/mm/yyyy, HH:mm") reads the same in both languages.
  return dateTimeFmt.format(date);
}

const MONTHS_SQ = [
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a "YYYY-MM" key into a readable month + year, e.g. "Qershor 2026". */
export function monthLabel(ym: string, lang: Lang = "sq"): string {
  const [y, m] = ym.split("-").map(Number);
  const names = lang === "sq" ? MONTHS_SQ : MONTHS_EN;
  const name = names[(m || 1) - 1] ?? ym;
  return `${name} ${y}`;
}

/** First and last day of a "YYYY-MM" month as dd.mm.yyyy strings. */
export function monthRange(ym: string): { start: string; end: string } {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return { start: `01.${pad(m)}.${y}`, end: `${pad(last)}.${pad(m)}.${y}` };
}
