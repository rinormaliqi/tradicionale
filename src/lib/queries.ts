import { db, initDb } from "./db";
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

initDb();

// ---------- Products ----------

function attachImages(products: Product[]): ProductWithImages[] {
  if (products.length === 0) return [];
  const stmt = db.prepare(
    "SELECT id, image_id, sort, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort, id"
  );
  return products.map((p) => ({
    ...p,
    images: stmt.all(p.id) as ProductImage[],
  }));
}

export function getActiveProducts(): ProductWithImages[] {
  const rows = db
    .prepare("SELECT * FROM products WHERE active = 1 ORDER BY category, name_sq")
    .all() as Product[];
  return attachImages(rows);
}

export function getAllProducts(): ProductWithImages[] {
  const rows = db
    .prepare("SELECT * FROM products ORDER BY category, name_sq")
    .all() as Product[];
  return attachImages(rows);
}

export function getFeaturedProducts(limit = 3): ProductWithImages[] {
  const rows = db
    .prepare(
      "SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY name_sq LIMIT ?"
    )
    .all(limit) as Product[];
  const featured = attachImages(rows);
  if (featured.length > 0) return featured;
  // Fallback: first few active products if none are explicitly featured.
  return getActiveProducts().slice(0, limit);
}

export function getProduct(id: number): Product | undefined {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | Product
    | undefined;
}

export function getCategories(): string[] {
  const rows = db
    .prepare(
      "SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category"
    )
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

export type ProductInput = Omit<Product, "id" | "created_at">;

export function createProduct(p: ProductInput): number {
  const info = db
    .prepare(
      `INSERT INTO products
        (name_sq, name_en, description_sq, description_en, price, category,
         image_url, unit_sq, unit_en, stock, active, featured)
       VALUES
        (@name_sq, @name_en, @description_sq, @description_en, @price, @category,
         @image_url, @unit_sq, @unit_en, @stock, @active, @featured)`
    )
    .run(p);
  return Number(info.lastInsertRowid);
}

export function updateProduct(id: number, p: ProductInput): void {
  db.prepare(
    `UPDATE products SET
       name_sq=@name_sq, name_en=@name_en,
       description_sq=@description_sq, description_en=@description_en,
       price=@price, category=@category, image_url=@image_url,
       unit_sq=@unit_sq, unit_en=@unit_en, stock=@stock, active=@active,
       featured=@featured
     WHERE id=@id`
  ).run({ ...p, id });
}

export function updateStock(id: number, stock: number): void {
  db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(stock, id);
}

export function deleteProduct(id: number): void {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
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

export function createOrder(input: NewOrderInput): number {
  const tx = db.transaction(() => {
    let total = 0;
    const resolved: {
      productId: number;
      name_sq: string;
      name_en: string;
      unit_price: number;
      quantity: number;
    }[] = [];

    for (const line of input.items) {
      const product = getProduct(line.productId);
      if (!product || product.active !== 1) continue;
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

    const orderInfo = db
      .prepare(
        `INSERT INTO orders
          (customer_name, phone, address, city, notes, payment_method, source, total)
         VALUES (@customer_name, @phone, @address, @city, @notes, @payment_method, @source, @total)`
      )
      .run({
        customer_name: input.customer_name,
        phone: input.phone,
        address: input.address,
        city: input.city,
        notes: input.notes,
        payment_method: input.payment_method,
        source: input.source || "online",
        total,
      });

    const orderId = Number(orderInfo.lastInsertRowid);
    const itemStmt = db.prepare(
      `INSERT INTO order_items
        (order_id, product_id, name_sq, name_en, unit_price, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const stockStmt = db.prepare(
      "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?"
    );

    for (const r of resolved) {
      itemStmt.run(orderId, r.productId, r.name_sq, r.name_en, r.unit_price, r.quantity);
      stockStmt.run(r.quantity, r.productId);
    }

    return orderId;
  });

  return tx();
}

export function getOrders(status?: string): Order[] {
  if (status && status !== "all") {
    return db
      .prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC")
      .all(status) as Order[];
  }
  return db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC")
    .all() as Order[];
}

export type OrdersPage = {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** Paginated + searchable orders, for the admin list at scale. */
export function getOrdersPage(opts: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): OrdersPage {
  const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 5), 100);
  const page = Math.max(opts.page ?? 1, 1);

  const where: string[] = [];
  const args: (string | number)[] = [];

  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    args.push(opts.status);
  }

  const search = opts.search?.trim();
  if (search) {
    // Match by order #, customer name, or phone.
    where.push("(customer_name LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) = ?)");
    args.push(`%${search}%`, `%${search}%`, search.replace(/^#/, ""));
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS c FROM orders ${whereSql}`)
    .get(...args) as { c: number };
  const total = totalRow.c;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const offset = (safePage - 1) * pageSize;

  const orders = db
    .prepare(
      `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...args, pageSize, offset) as Order[];

  return { orders, total, page: safePage, pageSize, pageCount };
}

export function getOrder(id: number): OrderWithItems | undefined {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order) return undefined;
  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(id) as OrderItem[];
  return { ...order, items };
}

export function updateOrderStatus(id: number, status: string): void {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
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

export function getStats(): DashboardStats {
  // Revenue excludes cancelled orders.
  const revenueRow = db
    .prepare(
      "SELECT COALESCE(SUM(total),0) AS rev, COUNT(*) AS cnt FROM orders WHERE status != 'cancelled'"
    )
    .get() as { rev: number; cnt: number };

  const newRow = db
    .prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'new'")
    .get() as { c: number };

  const todayRow = db
    .prepare(
      `SELECT COUNT(*) AS c, COALESCE(SUM(total),0) AS rev
       FROM orders
       WHERE date(created_at) = date('now') AND status != 'cancelled'`
    )
    .get() as { c: number; rev: number };

  const topProducts = db
    .prepare(
      `SELECT name_sq, name_en, SUM(quantity) AS qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'cancelled'
       GROUP BY name_sq, name_en
       ORDER BY qty DESC
       LIMIT 5`
    )
    .all() as { name_sq: string; name_en: string; qty: number }[];

  const recent = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 6")
    .all() as Order[];

  return {
    totalRevenue: revenueRow.rev,
    totalOrders: revenueRow.cnt,
    newOrders: newRow.c,
    todayOrders: todayRow.c,
    todayRevenue: todayRow.rev,
    avgOrder: revenueRow.cnt > 0 ? revenueRow.rev / revenueRow.cnt : 0,
    topProducts,
    recent,
  };
}

// ---------- Monthly financial statements ----------

export type MonthlySummary = {
  ym: string; // "YYYY-MM"
  revenue: number; // excludes cancelled
  paidOrders: number; // non-cancelled order count
  totalOrders: number;
  cancelled: number;
  avgOrder: number;
};

/** One summary row per calendar month that has orders, newest first. */
export function getMonthlyStatements(): MonthlySummary[] {
  const rows = db
    .prepare(
      `SELECT
         strftime('%Y-%m', created_at) AS ym,
         COUNT(*) AS totalOrders,
         SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) AS paidOrders,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM orders
       GROUP BY ym
       ORDER BY ym DESC`
    )
    .all() as Omit<MonthlySummary, "avgOrder">[];

  return rows.map((r) => ({
    ...r,
    avgOrder: r.paidOrders > 0 ? r.revenue / r.paidOrders : 0,
  }));
}

export type MonthlyStatement = {
  summary: MonthlySummary;
  byStatus: { status: string; count: number; revenue: number }[];
  bySource: { source: string; count: number; revenue: number }[];
  topItems: { name_sq: string; name_en: string; qty: number; revenue: number }[];
  byDay: { day: string; orders: number; revenue: number }[];
};

/** Full statement for one calendar month (ym = "YYYY-MM"). */
export function getMonthlyStatement(ym: string): MonthlyStatement {
  const summaryRow = db
    .prepare(
      `SELECT
         ? AS ym,
         COUNT(*) AS totalOrders,
         SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) AS paidOrders,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM orders
       WHERE strftime('%Y-%m', created_at) = ?`
    )
    .get(ym, ym) as Omit<MonthlySummary, "avgOrder">;

  const summary: MonthlySummary = {
    ...summaryRow,
    avgOrder: summaryRow.paidOrders > 0 ? summaryRow.revenue / summaryRow.paidOrders : 0,
  };

  const byStatus = db
    .prepare(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS revenue
       FROM orders WHERE strftime('%Y-%m', created_at) = ?
       GROUP BY status ORDER BY count DESC`
    )
    .all(ym) as { status: string; count: number; revenue: number }[];

  const bySource = db
    .prepare(
      `SELECT source, COUNT(*) AS count,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END),0) AS revenue
       FROM orders WHERE strftime('%Y-%m', created_at) = ?
       GROUP BY source ORDER BY count DESC`
    )
    .all(ym) as { source: string; count: number; revenue: number }[];

  const topItems = db
    .prepare(
      `SELECT oi.name_sq, oi.name_en,
         SUM(oi.quantity) AS qty,
         SUM(oi.quantity * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE strftime('%Y-%m', o.created_at) = ? AND o.status != 'cancelled'
       GROUP BY oi.name_sq, oi.name_en
       ORDER BY revenue DESC
       LIMIT 10`
    )
    .all(ym) as {
    name_sq: string;
    name_en: string;
    qty: number;
    revenue: number;
  }[];

  const byDay = db
    .prepare(
      `SELECT strftime('%d', created_at) AS day,
         COUNT(*) AS orders,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END),0) AS revenue
       FROM orders WHERE strftime('%Y-%m', created_at) = ?
       GROUP BY day ORDER BY day`
    )
    .all(ym) as { day: string; orders: number; revenue: number }[];

  return { summary, byStatus, bySource, topItems, byDay };
}

// ---------- Images ----------

export function addImage(img: {
  data: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
}): number {
  const info = db
    .prepare(
      "INSERT INTO images (data, thumb, width, height) VALUES (@data, @thumb, @width, @height)"
    )
    .run(img);
  return Number(info.lastInsertRowid);
}

export function getImageBytes(
  id: number,
  thumb: boolean
): Buffer | undefined {
  const row = db
    .prepare(`SELECT ${thumb ? "thumb" : "data"} AS bytes FROM images WHERE id = ?`)
    .get(id) as { bytes: Buffer } | undefined;
  return row?.bytes;
}

export function getProductImages(productId: number): ProductImage[] {
  return db
    .prepare(
      "SELECT id, image_id, sort, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort, id"
    )
    .all(productId) as ProductImage[];
}

export function addProductImage(productId: number, imageId: number): void {
  const tx = db.transaction(() => {
    const count = db
      .prepare("SELECT COUNT(*) AS c FROM product_images WHERE product_id = ?")
      .get(productId) as { c: number };
    db.prepare(
      "INSERT INTO product_images (product_id, image_id, sort, is_primary) VALUES (?, ?, ?, ?)"
    ).run(productId, imageId, count.c, count.c === 0 ? 1 : 0);
  });
  tx();
}

export function deleteProductImage(linkId: number): void {
  const tx = db.transaction(() => {
    const row = db
      .prepare("SELECT product_id, image_id, is_primary FROM product_images WHERE id = ?")
      .get(linkId) as
      | { product_id: number; image_id: number; is_primary: number }
      | undefined;
    if (!row) return;
    db.prepare("DELETE FROM product_images WHERE id = ?").run(linkId);
    db.prepare("DELETE FROM images WHERE id = ?").run(row.image_id);
    // If we removed the primary image, promote the next one.
    if (row.is_primary) {
      const next = db
        .prepare(
          "SELECT id FROM product_images WHERE product_id = ? ORDER BY sort, id LIMIT 1"
        )
        .get(row.product_id) as { id: number } | undefined;
      if (next) {
        db.prepare("UPDATE product_images SET is_primary = 1 WHERE id = ?").run(
          next.id
        );
      }
    }
  });
  tx();
}

export function setPrimaryProductImage(linkId: number): void {
  const tx = db.transaction(() => {
    const row = db
      .prepare("SELECT product_id FROM product_images WHERE id = ?")
      .get(linkId) as { product_id: number } | undefined;
    if (!row) return;
    db.prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = ?").run(
      row.product_id
    );
    db.prepare("UPDATE product_images SET is_primary = 1 WHERE id = ?").run(linkId);
  });
  tx();
}

// ---------- Hero ----------

export function getHero(): Hero {
  return db.prepare("SELECT * FROM hero WHERE id = 1").get() as Hero;
}

export type HeroInput = Omit<Hero, "id">;

export function updateHero(h: HeroInput): void {
  db.prepare(
    `UPDATE hero SET
       eyebrow_sq=@eyebrow_sq, eyebrow_en=@eyebrow_en,
       title_sq=@title_sq, title_en=@title_en,
       subtitle_sq=@subtitle_sq, subtitle_en=@subtitle_en,
       cta_sq=@cta_sq, cta_en=@cta_en, cta_href=@cta_href,
       badge_sq=@badge_sq, badge_en=@badge_en, image_id=@image_id
     WHERE id = 1`
  ).run(h);
}

export function setHeroImage(imageId: number): void {
  const old = db.prepare("SELECT image_id FROM hero WHERE id = 1").get() as {
    image_id: number | null;
  };
  db.prepare("UPDATE hero SET image_id = ? WHERE id = 1").run(imageId);
  if (old?.image_id) db.prepare("DELETE FROM images WHERE id = ?").run(old.image_id);
}

export function clearHeroImage(): void {
  const old = db.prepare("SELECT image_id FROM hero WHERE id = 1").get() as {
    image_id: number | null;
  };
  if (old?.image_id) {
    db.prepare("UPDATE hero SET image_id = NULL WHERE id = 1").run();
    db.prepare("DELETE FROM images WHERE id = ?").run(old.image_id);
  }
}

// ---------- Promos ----------

export function getActivePromos(): Promo[] {
  return db
    .prepare("SELECT * FROM promos WHERE active = 1 ORDER BY sort, id")
    .all() as Promo[];
}

export function getAllPromos(): Promo[] {
  return db.prepare("SELECT * FROM promos ORDER BY sort, id").all() as Promo[];
}

export function getPromo(id: number): Promo | undefined {
  return db.prepare("SELECT * FROM promos WHERE id = ?").get(id) as
    | Promo
    | undefined;
}

export type PromoInput = Omit<Promo, "id">;

export function createPromo(p: PromoInput): number {
  const info = db
    .prepare(
      `INSERT INTO promos
        (title_sq, title_en, text_sq, text_en, badge_sq, badge_en,
         price_text, href, image_id, active, sort)
       VALUES
        (@title_sq, @title_en, @text_sq, @text_en, @badge_sq, @badge_en,
         @price_text, @href, @image_id, @active, @sort)`
    )
    .run(p);
  return Number(info.lastInsertRowid);
}

export function updatePromo(id: number, p: PromoInput): void {
  db.prepare(
    `UPDATE promos SET
       title_sq=@title_sq, title_en=@title_en, text_sq=@text_sq, text_en=@text_en,
       badge_sq=@badge_sq, badge_en=@badge_en, price_text=@price_text,
       href=@href, image_id=@image_id, active=@active, sort=@sort
     WHERE id=@id`
  ).run({ ...p, id });
}

export function setPromoImage(id: number, imageId: number): void {
  const old = db.prepare("SELECT image_id FROM promos WHERE id = ?").get(id) as
    | { image_id: number | null }
    | undefined;
  db.prepare("UPDATE promos SET image_id = ? WHERE id = ?").run(imageId, id);
  if (old?.image_id) db.prepare("DELETE FROM images WHERE id = ?").run(old.image_id);
}

export function deletePromo(id: number): void {
  const tx = db.transaction(() => {
    const row = db.prepare("SELECT image_id FROM promos WHERE id = ?").get(id) as
      | { image_id: number | null }
      | undefined;
    db.prepare("DELETE FROM promos WHERE id = ?").run(id);
    if (row?.image_id) db.prepare("DELETE FROM images WHERE id = ?").run(row.image_id);
  });
  tx();
}
