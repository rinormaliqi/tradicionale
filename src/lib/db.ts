import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";

/**
 * Database client (libSQL / Turso).
 *
 * - Locally: falls back to a local SQLite file (`file:./data/tradicionale.db`).
 * - In production (Vercel): set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN and it
 *   talks to your hosted Turso database. Same SQL, just a remote connection.
 *
 * libSQL is SQLite-compatible, so all the existing SQL keeps working — the only
 * difference from before is that calls are asynchronous (await).
 */

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/tradicionale.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Local file mode only: make sure the folder exists (Turso/remote skips this).
if (url.startsWith("file:")) {
  const dir = path.dirname(url.slice("file:".length));
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    /* ignore */
  }
}

const globalForDb = globalThis as unknown as { db?: Client };

export const db: Client =
  globalForDb.db ?? createClient(authToken ? { url, authToken } : { url });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

// Schema is created once per process; the cached promise dedupes concurrent calls.
let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) schemaReady = initSchema();
  return schemaReady;
}

async function initSchema() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name_sq       TEXT NOT NULL,
      name_en       TEXT NOT NULL,
      description_sq TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      price         REAL NOT NULL,
      category      TEXT NOT NULL DEFAULT 'Tjera',
      image_url     TEXT DEFAULT '',
      unit_sq       TEXT DEFAULT 'copë',
      unit_en       TEXT DEFAULT 'pcs',
      stock         INTEGER NOT NULL DEFAULT 0,
      active        INTEGER NOT NULL DEFAULT 1,
      featured      INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      status         TEXT NOT NULL DEFAULT 'new',
      customer_name  TEXT NOT NULL,
      phone          TEXT NOT NULL,
      address        TEXT NOT NULL,
      city           TEXT NOT NULL DEFAULT 'Prishtinë',
      notes          TEXT DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT 'cash',
      source         TEXT NOT NULL DEFAULT 'online',
      total          REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id    INTEGER NOT NULL,
      product_id  INTEGER,
      name_sq     TEXT NOT NULL,
      name_en     TEXT NOT NULL,
      unit_price  REAL NOT NULL,
      quantity    INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    CREATE TABLE IF NOT EXISTS images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      data       BLOB NOT NULL,
      thumb      BLOB NOT NULL,
      width      INTEGER NOT NULL DEFAULT 0,
      height     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_id   INTEGER NOT NULL,
      sort       INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

    CREATE TABLE IF NOT EXISTS hero (
      id          INTEGER PRIMARY KEY CHECK (id = 1),
      eyebrow_sq  TEXT DEFAULT '',
      eyebrow_en  TEXT DEFAULT '',
      title_sq    TEXT DEFAULT '',
      title_en    TEXT DEFAULT '',
      subtitle_sq TEXT DEFAULT '',
      subtitle_en TEXT DEFAULT '',
      cta_sq      TEXT DEFAULT '',
      cta_en      TEXT DEFAULT '',
      cta_href    TEXT DEFAULT '/menu',
      badge_sq    TEXT DEFAULT '',
      badge_en    TEXT DEFAULT '',
      image_id    INTEGER
    );

    CREATE TABLE IF NOT EXISTS promos (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title_sq  TEXT DEFAULT '',
      title_en  TEXT DEFAULT '',
      text_sq   TEXT DEFAULT '',
      text_en   TEXT DEFAULT '',
      badge_sq  TEXT DEFAULT '',
      badge_en  TEXT DEFAULT '',
      price_text TEXT DEFAULT '',
      href      TEXT DEFAULT '/menu',
      image_id  INTEGER,
      active    INTEGER NOT NULL DEFAULT 1,
      sort      INTEGER NOT NULL DEFAULT 0
    );
  `);

  await migrate();
  await seedProducts();
  await seedHero();
}

/** Add columns that may be missing on databases created before they existed. */
async function migrate() {
  const p = await db.execute("PRAGMA table_info(products)");
  if (!p.rows.some((r) => r.name === "featured")) {
    await db.execute(
      "ALTER TABLE products ADD COLUMN featured INTEGER NOT NULL DEFAULT 0"
    );
  }
  const o = await db.execute("PRAGMA table_info(orders)");
  if (!o.rows.some((r) => r.name === "source")) {
    await db.execute(
      "ALTER TABLE orders ADD COLUMN source TEXT NOT NULL DEFAULT 'online'"
    );
  }
}

async function seedProducts() {
  const count = await db.execute("SELECT COUNT(*) AS c FROM products");
  if (Number((count.rows[0] as unknown as { c: number }).c) > 0) return;

  const seed = [
    ["Mantia", "Manti", "Mantia tradicionale të punuara me dorë, 75–80 copë.", "Traditional handmade manti, 75–80 pieces.", 8.0, "Tava", "tavë", "tray", 20],
    ["Byrek me mish", "Pie with meat", "Byrek shtëpie me mish, petë e hollë artizanale.", "Homemade meat pie, thin artisanal pastry.", 5.0, "Byrek", "copë", "pcs", 30],
    ["Byrek me spinaq", "Pie with spinach", "Byrek me spinaq dhe djathë.", "Spinach and cheese pie.", 4.5, "Byrek", "copë", "pcs", 30],
    ["Fli", "Flia", "Fli tradicionale me maze, e pjekur ngadalë.", "Traditional flia with cream layers, slow baked.", 10.0, "Tava", "tavë", "tray", 15],
    ["Petulla", "Petulla (fritters)", "Petulla shtëpie, porcion familjar.", "Homemade fried dough, family portion.", 3.5, "Tjera", "porcion", "portion", 25],
    ["Sarma", "Sarma (stuffed leaves)", "Sarma me gjethe rrushi, të mbushura me dorë.", "Vine-leaf rolls, hand-stuffed.", 7.0, "Tava", "tavë", "tray", 18],
  ];

  await db.batch(
    seed.map((s) => ({
      sql: `INSERT INTO products
              (name_sq, name_en, description_sq, description_en, price, category, unit_sq, unit_en, stock, active, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      args: s,
    })),
    "write"
  );
}

async function seedHero() {
  const existing = await db.execute("SELECT id FROM hero WHERE id = 1");
  if (existing.rows.length > 0) return;
  await db.execute({
    sql: `INSERT INTO hero
            (id, eyebrow_sq, eyebrow_en, title_sq, title_en, subtitle_sq, subtitle_en,
             cta_sq, cta_en, cta_href, badge_sq, badge_en)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "Në mënyrë artizanale",
      "The artisanal way",
      "E përgatitur si dikur.",
      "Made the old way.",
      "Ushqime tradicionale të punuara me dorë, çdo ditë. Dërgesa falas në Prishtinë.",
      "Traditional handmade food, every day. Free delivery in Pristina.",
      "Porosit tani",
      "Order now",
      "/menu",
      "",
      "",
    ],
  });
}
