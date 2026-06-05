import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * SQLite connection (single local file).
 *
 * The whole data layer lives here so the storage backend is swappable:
 * to move to a free hosted SQLite (e.g. Turso) later, only this file changes.
 */

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "tradicionale.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Reuse a single connection across hot-reloads in dev.
const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db =
  globalForDb.db ??
  (() => {
    const instance = new Database(DB_PATH);
    instance.pragma("journal_mode = WAL");
    instance.pragma("foreign_keys = ON");
    return instance;
  })();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

let initialized = false;

export function initDb() {
  if (initialized) return;
  initialized = true;

  db.exec(`
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

    -- Generic image store: optimized WebP bytes + a small thumbnail, in-DB.
    CREATE TABLE IF NOT EXISTS images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      data       BLOB NOT NULL,
      thumb      BLOB NOT NULL,
      width      INTEGER NOT NULL DEFAULT 0,
      height     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Many images per product, with ordering and a primary flag.
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

    -- Single-row homepage hero configuration (id is always 1).
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

    -- Promotional banners (offers, discounts, seasonal campaigns).
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

  migrate();
  seedProducts();
  seedHero();
}

/** Lightweight migrations for databases created before a column existed. */
function migrate() {
  const cols = db.prepare("PRAGMA table_info(products)").all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === "featured")) {
    db.exec("ALTER TABLE products ADD COLUMN featured INTEGER NOT NULL DEFAULT 0");
  }

  const orderCols = db.prepare("PRAGMA table_info(orders)").all() as {
    name: string;
  }[];
  if (!orderCols.some((c) => c.name === "source")) {
    db.exec("ALTER TABLE orders ADD COLUMN source TEXT NOT NULL DEFAULT 'online'");
  }
}

function seedHero() {
  const existing = db.prepare("SELECT id FROM hero WHERE id = 1").get();
  if (existing) return;
  db.prepare(
    `INSERT INTO hero
      (id, eyebrow_sq, eyebrow_en, title_sq, title_en, subtitle_sq, subtitle_en,
       cta_sq, cta_en, cta_href, badge_sq, badge_en)
     VALUES (1, @eyebrow_sq, @eyebrow_en, @title_sq, @title_en, @subtitle_sq,
       @subtitle_en, @cta_sq, @cta_en, @cta_href, @badge_sq, @badge_en)`
  ).run({
    eyebrow_sq: "Në mënyrë artizanale",
    eyebrow_en: "The artisanal way",
    title_sq: "E përgatitur si dikur.",
    title_en: "Made the old way.",
    subtitle_sq:
      "Ushqime tradicionale të punuara me dorë, çdo ditë. Dërgesa falas në Prishtinë.",
    subtitle_en:
      "Traditional handmade food, every day. Free delivery in Pristina.",
    cta_sq: "Porosit tani",
    cta_en: "Order now",
    cta_href: "/menu",
    badge_sq: "",
    badge_en: "",
  });
}

function seedProducts() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM products").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO products
      (name_sq, name_en, description_sq, description_en, price, category, unit_sq, unit_en, stock, active)
    VALUES
      (@name_sq, @name_en, @description_sq, @description_en, @price, @category, @unit_sq, @unit_en, @stock, @active)
  `);

  const seed = [
    {
      name_sq: "Mantia",
      name_en: "Manti",
      description_sq: "Mantia tradicionale të punuara me dorë, 75–80 copë.",
      description_en: "Traditional handmade manti, 75–80 pieces.",
      price: 8.0,
      category: "Tava",
      unit_sq: "tavë",
      unit_en: "tray",
      stock: 20,
      active: 1,
    },
    {
      name_sq: "Byrek me mish",
      name_en: "Pie with meat",
      description_sq: "Byrek shtëpie me mish, petë e hollë artizanale.",
      description_en: "Homemade meat pie, thin artisanal pastry.",
      price: 5.0,
      category: "Byrek",
      unit_sq: "copë",
      unit_en: "pcs",
      stock: 30,
      active: 1,
    },
    {
      name_sq: "Byrek me spinaq",
      name_en: "Pie with spinach",
      description_sq: "Byrek me spinaq dhe djathë.",
      description_en: "Spinach and cheese pie.",
      price: 4.5,
      category: "Byrek",
      unit_sq: "copë",
      unit_en: "pcs",
      stock: 30,
      active: 1,
    },
    {
      name_sq: "Fli",
      name_en: "Flia",
      description_sq: "Fli tradicionale me maze, e pjekur ngadalë.",
      description_en: "Traditional flia with cream layers, slow baked.",
      price: 10.0,
      category: "Tava",
      unit_sq: "tavë",
      unit_en: "tray",
      stock: 15,
      active: 1,
    },
    {
      name_sq: "Petulla",
      name_en: "Petulla (fritters)",
      description_sq: "Petulla shtëpie, porcion familjar.",
      description_en: "Homemade fried dough, family portion.",
      price: 3.5,
      category: "Tjera",
      unit_sq: "porcion",
      unit_en: "portion",
      stock: 25,
      active: 1,
    },
    {
      name_sq: "Sarma",
      name_en: "Sarma (stuffed leaves)",
      description_sq: "Sarma me gjethe rrushi, të mbushura me dorë.",
      description_en: "Vine-leaf rolls, hand-stuffed.",
      price: 7.0,
      category: "Tava",
      unit_sq: "tavë",
      unit_en: "tray",
      stock: 18,
      active: 1,
    },
  ];

  const tx = db.transaction(() => {
    for (const p of seed) insert.run(p);
  });
  tx();
}
