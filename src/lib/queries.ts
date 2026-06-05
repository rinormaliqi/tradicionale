import { db, ensureSchema } from "./db";
import type {
  Hero,
  Order,
  OrderItem,
  OrderWithItems,
  Product,
  ProductImage,
  ProductWithImages,
  Promo,
} from "./types";

type Arg = string | number | null | Uint8Array;

async function all<T>(sql: string, args: Arg[] = []): Promise<T[]> {
  await ensureSchema();
  const r = await db.execute(args.length ? { sql, args } : sql);
  return r.rows as unknown as T[];
}

async function one<T>(sql: string, args: Arg[] = []): Promise<T | undefined> {
  const rows = await all<T>(sql, args);
  return rows[0];
}

async function run(sql: string, args: Arg[] = []) {
  await ensureSchema();
  return db.execute(args.length ? { sql, args } : sql);
}

// ---------- Products ----------

async function attachImages(products: Product[]): Promise<ProductWithImages[]> {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const ph = ids.map(() => "?").join(",");
  const rows = await all<ProductImage & { product_id: number }>(
    `SELECT id, product_id, image_id, sort, is_primary
       FROM product_images WHERE product_id IN (${ph})
       ORDER BY is_primary DESC, sort, id`,
    ids
  );
  const byProduct = new Map<number, ProductImage[]>();
  for (const r of rows) {
    const arr = byProduct.get(r.product_id) ?? [];
    arr.push({ id: r.id, image_id: r.image_id, sort: r.sort, is_primary: r.is_primary });
    byProduct.set(r.product_id, arr);
  }
  return products.map((p) => ({ ...p, images: byProduct.get(p.id) ?? [] }));
}

export async function getActiveProducts(): Promise<ProductWithImages[]> {
  const rows = await all<Product>(
    "SELECT * FROM products WHERE active = 1 ORDER BY category, name_sq"
  );
  return attachImages(rows);
}

export async function getAllProducts(): Promise<ProductWithImages[]> {
  const rows = await all<Product>(
    "SELECT * FROM products ORDER BY category, name_sq"
  );
  return attachImages(rows);
}

export async function getFeaturedProducts(limit = 3): Promise<ProductWithImages[]> {
  const rows = await all<Product>(
    "SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY name_sq LIMIT ?",
    [limit]
  );
  const featured = await attachImages(rows);
  if (featured.length > 0) return featured;
  return (await getActiveProducts()).slice(0, limit);
}

export async function getProduct(id: number): Promise<Product | undefined> {
  return one<Product>("SELECT * FROM products WHERE id = ?", [id]);
}

export async function getCategories(): Promise<string[]> {
  const rows = await all<{ category: string }>(
    "SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category"
  );
  return rows.map((r) => r.category);
}

export type ProductInput = Omit<Product, "id" | "created_at">;

export async function createProduct(p: ProductInput): Promise<number> {
  const info = await run(
    `INSERT INTO products
       (name_sq, name_en, description_sq, description_en, price, category,
        image_url, unit_sq, unit_en, stock, active, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.name_sq, p.name_en, p.description_sq, p.description_en, p.price,
      p.category, p.image_url, p.unit_sq, p.unit_en, p.stock, p.active, p.featured,
    ]
  );
  return Number(info.lastInsertRowid);
}

export async function updateProduct(id: number, p: ProductInput): Promise<void> {
  await run(
    `UPDATE products SET
       name_sq=?, name_en=?, description_sq=?, description_en=?, price=?,
       category=?, image_url=?, unit_sq=?, unit_en=?, stock=?, active=?, featured=?
     WHERE id=?`,
    [
      p.name_sq, p.name_en, p.description_sq, p.description_en, p.price,
      p.category, p.image_url, p.unit_sq, p.unit_en, p.stock, p.active, p.featured, id,
    ]
  );
}

export async function updateStock(id: number, stock: number): Promise<void> {
  await run("UPDATE products SET stock = ? WHERE id = ?", [stock, id]);
}

export async function deleteProduct(id: number): Promise<void> {
  await run("DELETE FROM products WHERE id = ?", [id]);
}

// ---------- Orders ----------

export type NewOrderInput = {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment_method: string;
  source?: string;
  items: { productId: number; quantity: number }[];
};

export async function createOrder(input: NewOrderInput): Promise<number> {
  await ensureSchema();
  const tx = await db.transaction("write");
  try {
    let total = 0;
    const resolved: {
      productId: number;
      name_sq: string;
      name_en: string;
      unit_price: number;
      quantity: number;
    }[] = [];

    for (const line of input.items) {
      const r = await tx.execute({
        sql: "SELECT * FROM products WHERE id = ? AND active = 1",
        args: [line.productId],
      });
      const product = r.rows[0] as unknown as Product | undefined;
      if (!product) continue;
      const qty = Math.max(1, Math.floor(line.quantity));
      resolved.push({
        productId: product.id,
        name_sq: product.name_sq,
        name_en: product.name_en,
        unit_price: product.price,
        quantity: qty,
      });
      total += product.price * qty;
    }

    if (resolved.length === 0) throw new Error("EMPTY_ORDER");

    const orderInfo = await tx.execute({
      sql: `INSERT INTO orders
              (customer_name, phone, address, city, notes, payment_method, source, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        input.customer_name, input.phone, input.address, input.city,
        input.notes, input.payment_method, input.source || "online", total,
      ],
    });
    const orderId = Number(orderInfo.lastInsertRowid);

    for (const r of resolved) {
      await tx.execute({
        sql: `INSERT INTO order_items
                (order_id, product_id, name_sq, name_en, unit_price, quantity)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [orderId, r.productId, r.name_sq, r.name_en, r.unit_price, r.quantity],
      });
      await tx.execute({
        sql: "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?",
        args: [r.quantity, r.productId],
      });
    }

    await tx.commit();
    return orderId;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function getOrders(status?: string): Promise<Order[]> {
  if (status && status !== "all") {
    return all<Order>(
      "SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC",
      [status]
    );
  }
  return all<Order>("SELECT * FROM orders ORDER BY created_at DESC");
}

export type OrdersPage = {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function getOrdersPage(opts: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<OrdersPage> {
  const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 5), 100);
  const page = Math.max(opts.page ?? 1, 1);

  const where: string[] = [];
  const args: Arg[] = [];

  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    args.push(opts.status);
  }
  const search = opts.search?.trim();
  if (search) {
    where.push("(customer_name LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) = ?)");
    args.push(`%${search}%`, `%${search}%`, search.replace(/^#/, ""));
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = await one<{ c: number }>(
    `SELECT COUNT(*) AS c FROM orders ${whereSql}`,
    args
  );
  const total = Number(totalRow?.c ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const offset = (safePage - 1) * pageSize;

  const orders = await all<Order>(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset]
  );

  return { orders, total, page: safePage, pageSize, pageCount };
}

export async function getOrder(id: number): Promise<OrderWithItems | undefined> {
  const order = await one<Order>("SELECT * FROM orders WHERE id = ?", [id]);
  if (!order) return undefined;
  const items = await all<OrderItem>(
    "SELECT * FROM order_items WHERE order_id = ?",
    [id]
  );
  return { ...order, items };
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  await run("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
}

// ---------- Stats ----------

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  newOrders: number;
  todayOrders: number;
  todayRevenue: number;
  avgOrder: number;
  topProducts: { name_sq: string; name_en: string; qty: number }[];
  recent: Order[];
};

export async function getStats(): Promise<DashboardStats> {
  const revenueRow = await one<{ rev: number; cnt: number }>(
    "SELECT COALESCE(SUM(total),0) AS rev, COUNT(*) AS cnt FROM orders WHERE status != 'cancelled'"
  );
  const newRow = await one<{ c: number }>(
    "SELECT COUNT(*) AS c FROM orders WHERE status = 'new'"
  );
  const todayRow = await one<{ c: number; rev: number }>(
    `SELECT COUNT(*) AS c, COALESCE(SUM(total),0) AS rev
     FROM orders WHERE date(created_at) = date('now') AND status != 'cancelled'`
  );
  const topProducts = await all<{ name_sq: string; name_en: string; qty: number }>(
    `SELECT name_sq, name_en, SUM(quantity) AS qty
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status != 'cancelled'
     GROUP BY name_sq, name_en ORDER BY qty DESC LIMIT 5`
  );
  const recent = await all<Order>(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT 6"
  );

  const rev = Number(revenueRow?.rev ?? 0);
  const cnt = Number(revenueRow?.cnt ?? 0);
  return {
    totalRevenue: rev,
    totalOrders: cnt,
    newOrders: Number(newRow?.c ?? 0),
    todayOrders: Number(todayRow?.c ?? 0),
    todayRevenue: Number(todayRow?.rev ?? 0),
    avgOrder: cnt > 0 ? rev / cnt : 0,
    topProducts,
    recent,
  };
}

// ---------- Monthly financial statements ----------

export type MonthlySummary = {
  ym: string;
  revenue: number;
  paidOrders: number;
  totalOrders: number;
  cancelled: number;
  avgOrder: number;
};

export async function getMonthlyStatements(): Promise<MonthlySummary[]> {
  const rows = await all<Omit<MonthlySummary, "avgOrder">>(
    `SELECT
       strftime('%Y-%m', created_at) AS ym,
       COUNT(*) AS totalOrders,
       SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) AS paidOrders,
       COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
     FROM orders GROUP BY ym ORDER BY ym DESC`
  );
  return rows.map((r) => ({
    ym: r.ym,
    totalOrders: Number(r.totalOrders),
    paidOrders: Number(r.paidOrders),
    revenue: Number(r.revenue),
    cancelled: Number(r.cancelled),
    avgOrder: Number(r.paidOrders) > 0 ? Number(r.revenue) / Number(r.paidOrders) : 0,
  }));
}

export type MonthlyStatement = {
  summary: MonthlySummary;
  byStatus: { status: string; count: number; revenue: number }[];
  bySource: { source: string; count: number; revenue: number }[];
  topItems: { name_sq: string; name_en: string; qty: number; revenue: number }[];
  byDay: { day: string; orders: number; revenue: number }[];
};

export async function getMonthlyStatement(ym: string): Promise<MonthlyStatement> {
  const summaryRow = await one<Omit<MonthlySummary, "avgOrder">>(
    `SELECT
       ? AS ym,
       COUNT(*) AS totalOrders,
       SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) AS paidOrders,
       COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
     FROM orders WHERE strftime('%Y-%m', created_at) = ?`,
    [ym, ym]
  );

  const summary: MonthlySummary = {
    ym,
    totalOrders: Number(summaryRow?.totalOrders ?? 0),
    paidOrders: Number(summaryRow?.paidOrders ?? 0),
    revenue: Number(summaryRow?.revenue ?? 0),
    cancelled: Number(summaryRow?.cancelled ?? 0),
    avgOrder:
      Number(summaryRow?.paidOrders ?? 0) > 0
        ? Number(summaryRow?.revenue ?? 0) / Number(summaryRow?.paidOrders ?? 0)
        : 0,
  };

  const byStatus = await all<{ status: string; count: number; revenue: number }>(
    `SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS revenue
     FROM orders WHERE strftime('%Y-%m', created_at) = ?
     GROUP BY status ORDER BY count DESC`,
    [ym]
  );
  const bySource = await all<{ source: string; count: number; revenue: number }>(
    `SELECT source, COUNT(*) AS count,
       COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END),0) AS revenue
     FROM orders WHERE strftime('%Y-%m', created_at) = ?
     GROUP BY source ORDER BY count DESC`,
    [ym]
  );
  const topItems = await all<{ name_sq: string; name_en: string; qty: number; revenue: number }>(
    `SELECT oi.name_sq, oi.name_en, SUM(oi.quantity) AS qty,
       SUM(oi.quantity * oi.unit_price) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE strftime('%Y-%m', o.created_at) = ? AND o.status != 'cancelled'
     GROUP BY oi.name_sq, oi.name_en ORDER BY revenue DESC LIMIT 10`,
    [ym]
  );
  const byDay = await all<{ day: string; orders: number; revenue: number }>(
    `SELECT strftime('%d', created_at) AS day, COUNT(*) AS orders,
       COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END),0) AS revenue
     FROM orders WHERE strftime('%Y-%m', created_at) = ?
     GROUP BY day ORDER BY day`,
    [ym]
  );

  return { summary, byStatus, bySource, topItems, byDay };
}

// ---------- Images ----------

export async function addImage(img: {
  data: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
}): Promise<number> {
  const info = await run(
    "INSERT INTO images (data, thumb, width, height) VALUES (?, ?, ?, ?)",
    [img.data, img.thumb, img.width, img.height]
  );
  return Number(info.lastInsertRowid);
}

export async function getImageBytes(
  id: number,
  thumb: boolean
): Promise<Buffer | undefined> {
  const r = await run(
    `SELECT ${thumb ? "thumb" : "data"} AS bytes FROM images WHERE id = ?`,
    [id]
  );
  const row = r.rows[0] as unknown as { bytes: ArrayBuffer | null } | undefined;
  if (!row || row.bytes == null) return undefined;
  return Buffer.from(row.bytes as ArrayBuffer);
}

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  return all<ProductImage>(
    `SELECT id, image_id, sort, is_primary FROM product_images
     WHERE product_id = ? ORDER BY is_primary DESC, sort, id`,
    [productId]
  );
}

export async function addProductImage(productId: number, imageId: number): Promise<void> {
  const c = await one<{ c: number }>(
    "SELECT COUNT(*) AS c FROM product_images WHERE product_id = ?",
    [productId]
  );
  const count = Number(c?.c ?? 0);
  await run(
    "INSERT INTO product_images (product_id, image_id, sort, is_primary) VALUES (?, ?, ?, ?)",
    [productId, imageId, count, count === 0 ? 1 : 0]
  );
}

export async function deleteProductImage(linkId: number): Promise<void> {
  const row = await one<{ product_id: number; image_id: number; is_primary: number }>(
    "SELECT product_id, image_id, is_primary FROM product_images WHERE id = ?",
    [linkId]
  );
  if (!row) return;
  await run("DELETE FROM product_images WHERE id = ?", [linkId]);
  await run("DELETE FROM images WHERE id = ?", [row.image_id]);
  if (row.is_primary) {
    const next = await one<{ id: number }>(
      "SELECT id FROM product_images WHERE product_id = ? ORDER BY sort, id LIMIT 1",
      [row.product_id]
    );
    if (next) {
      await run("UPDATE product_images SET is_primary = 1 WHERE id = ?", [next.id]);
    }
  }
}

export async function setPrimaryProductImage(linkId: number): Promise<void> {
  const row = await one<{ product_id: number }>(
    "SELECT product_id FROM product_images WHERE id = ?",
    [linkId]
  );
  if (!row) return;
  await run("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", [
    row.product_id,
  ]);
  await run("UPDATE product_images SET is_primary = 1 WHERE id = ?", [linkId]);
}

// ---------- Hero ----------

export async function getHero(): Promise<Hero> {
  return (await one<Hero>("SELECT * FROM hero WHERE id = 1"))!;
}

export type HeroInput = Omit<Hero, "id">;

export async function updateHero(h: HeroInput): Promise<void> {
  await run(
    `UPDATE hero SET
       eyebrow_sq=?, eyebrow_en=?, title_sq=?, title_en=?, subtitle_sq=?, subtitle_en=?,
       cta_sq=?, cta_en=?, cta_href=?, badge_sq=?, badge_en=?, image_id=?
     WHERE id = 1`,
    [
      h.eyebrow_sq, h.eyebrow_en, h.title_sq, h.title_en, h.subtitle_sq, h.subtitle_en,
      h.cta_sq, h.cta_en, h.cta_href, h.badge_sq, h.badge_en, h.image_id,
    ]
  );
}

export async function setHeroImage(imageId: number): Promise<void> {
  const old = await one<{ image_id: number | null }>(
    "SELECT image_id FROM hero WHERE id = 1"
  );
  await run("UPDATE hero SET image_id = ? WHERE id = 1", [imageId]);
  if (old?.image_id) await run("DELETE FROM images WHERE id = ?", [old.image_id]);
}

export async function clearHeroImage(): Promise<void> {
  const old = await one<{ image_id: number | null }>(
    "SELECT image_id FROM hero WHERE id = 1"
  );
  if (old?.image_id) {
    await run("UPDATE hero SET image_id = NULL WHERE id = 1");
    await run("DELETE FROM images WHERE id = ?", [old.image_id]);
  }
}

// ---------- Promos ----------

export async function getActivePromos(): Promise<Promo[]> {
  return all<Promo>("SELECT * FROM promos WHERE active = 1 ORDER BY sort, id");
}

export async function getAllPromos(): Promise<Promo[]> {
  return all<Promo>("SELECT * FROM promos ORDER BY sort, id");
}

export async function getPromo(id: number): Promise<Promo | undefined> {
  return one<Promo>("SELECT * FROM promos WHERE id = ?", [id]);
}

export type PromoInput = Omit<Promo, "id">;

export async function createPromo(p: PromoInput): Promise<number> {
  const info = await run(
    `INSERT INTO promos
       (title_sq, title_en, text_sq, text_en, badge_sq, badge_en,
        price_text, href, image_id, active, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.title_sq, p.title_en, p.text_sq, p.text_en, p.badge_sq, p.badge_en,
      p.price_text, p.href, p.image_id, p.active, p.sort,
    ]
  );
  return Number(info.lastInsertRowid);
}

export async function updatePromo(id: number, p: PromoInput): Promise<void> {
  await run(
    `UPDATE promos SET
       title_sq=?, title_en=?, text_sq=?, text_en=?, badge_sq=?, badge_en=?,
       price_text=?, href=?, image_id=?, active=?, sort=?
     WHERE id=?`,
    [
      p.title_sq, p.title_en, p.text_sq, p.text_en, p.badge_sq, p.badge_en,
      p.price_text, p.href, p.image_id, p.active, p.sort, id,
    ]
  );
}

export async function setPromoImage(id: number, imageId: number): Promise<void> {
  const old = await one<{ image_id: number | null }>(
    "SELECT image_id FROM promos WHERE id = ?",
    [id]
  );
  await run("UPDATE promos SET image_id = ? WHERE id = ?", [imageId, id]);
  if (old?.image_id) await run("DELETE FROM images WHERE id = ?", [old.image_id]);
}

export async function deletePromo(id: number): Promise<void> {
  const row = await one<{ image_id: number | null }>(
    "SELECT image_id FROM promos WHERE id = ?",
    [id]
  );
  await run("DELETE FROM promos WHERE id = ?", [id]);
  if (row?.image_id) await run("DELETE FROM images WHERE id = ?", [row.image_id]);
}
