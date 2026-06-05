# Tradicionale — Ordering App

A lightweight bilingual (Albanian / English) online-ordering app for **Tradicionale**,
with a password-protected admin dashboard for managing orders, products, inventory and
delivery slips.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **SQLite** via `better-sqlite3` — a single local file at `data/tradicionale.db`
- Admin auth: a password (env var) + a signed httpOnly cookie. No external services.

Everything runs from one codebase. No paid database, no third-party auth.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3100
```

Build for production:

```bash
npm run build && npm start
```

## Configuration — `.env.local`

```env
ADMIN_PASSWORD=tradicionale2024          # change before going live
AUTH_SECRET=<a-long-random-string>       # signs the admin cookie
```

> ⚠️ Change both values before deploying. If you change `AUTH_SECRET`, existing
> admin sessions are invalidated (everyone has to log in again).

## Pages

**Customer**
- `/` — home
- `/menu` — product list with category filters
- `/cart` — cart
- `/checkout` — full delivery details (name, phone, address, city, notes)
- `/order/[id]` — confirmation

**Admin** (login at `/admin/login`)
- `/admin/dashboard` — revenue, order counts, top products, recent orders
- `/admin/orders` — all orders, filter by status
- `/admin/orders/[id]` — order detail, status update, print driver slip
- `/admin/products` — add / edit / delete products (bilingual), upload product images, mark as featured
- `/admin/inventory` — view & update stock levels (with low-stock warnings)
- `/admin/content` — edit the homepage hero banner and manage promotional banners (offers, discounts, seasonal campaigns)

Stock is automatically decremented when an order is placed.

## Images

- Uploaded from the admin (products, hero, promo banners). Each product can have
  multiple images; one is the **primary** (shown on cards).
- On upload they're optimized with `sharp` → resized + converted to **WebP**, plus a
  thumbnail, and stored **in the SQLite database** (table `images`). No external
  storage service.
- Served via `/api/images/[id]` (`?thumb=1` for the small version) with a 1-year
  immutable cache, so repeat loads are instant. Supports JPG / PNG / WebP up to 8 MB.

## Look & feel

- Emoji-free: a hand-built inline SVG icon set (`src/components/icons.tsx`) and
  food-themed line illustrations (`src/components/Illustrations.tsx`).
- Subtle, lightweight CSS animations (scroll reveal, hover lift, image zoom) that
  automatically disable under `prefers-reduced-motion`. No animation library.

## Daily use (owner)

- **New order arrives** → see it on `/admin/orders` (status "E re" / New).
- **Print for the driver** → open the order → "Printo fletën". A clean black-and-white
  slip prints with the customer's name, phone, address, items and total.
- **Add a product** → `/admin/products` → "Shto produkt". Fill the Albanian + English
  name, price, category and stock.
- **Update stock** → `/admin/inventory` → change the number → Save.

## Deploy for free (later)

The data layer is isolated in `src/lib/db.ts`. To host on a free, always-on platform:

1. Deploy the app to **Vercel** (free, auto-deploys from GitHub).
2. Swap SQLite for **Turso** (free hosted SQLite, never sleeps) by changing only
   `src/lib/db.ts` to use the Turso client — the rest of the app is unchanged.
3. Set `ADMIN_PASSWORD` and `AUTH_SECRET` as environment variables in Vercel.

## Notes

- `data/` (the SQLite file) is gitignored — it holds live order data, keep backups.
- Currency is Euro (€). Times are stored in UTC and shown in local format.
