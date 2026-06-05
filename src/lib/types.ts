export type Product = {
  id: number;
  name_sq: string;
  name_en: string;
  description_sq: string;
  description_en: string;
  price: number;
  category: string;
  image_url: string;
  unit_sq: string;
  unit_en: string;
  stock: number;
  active: number; // 0 | 1
  featured: number; // 0 | 1
  created_at: string;
};

export type ProductImage = {
  id: number; // product_images row id
  image_id: number; // images row id
  sort: number;
  is_primary: number;
};

export type ProductWithImages = Product & { images: ProductImage[] };

export type Hero = {
  id: number;
  eyebrow_sq: string;
  eyebrow_en: string;
  title_sq: string;
  title_en: string;
  subtitle_sq: string;
  subtitle_en: string;
  cta_sq: string;
  cta_en: string;
  cta_href: string;
  badge_sq: string;
  badge_en: string;
  image_id: number | null;
};

export type Promo = {
  id: number;
  title_sq: string;
  title_en: string;
  text_sq: string;
  text_en: string;
  badge_sq: string;
  badge_en: string;
  price_text: string;
  href: string;
  image_id: number | null;
  active: number;
  sort: number;
};

export type OrderStatus =
  | "new"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderSource = "online" | "phone" | "whatsapp" | "in_store";

export const ORDER_SOURCES: OrderSource[] = [
  "online",
  "phone",
  "whatsapp",
  "in_store",
];

export type Order = {
  id: number;
  created_at: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment_method: string;
  source: OrderSource;
  total: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  name_sq: string;
  name_en: string;
  unit_price: number;
  quantity: number;
};

export type OrderWithItems = Order & { items: OrderItem[] };

export type CartLine = {
  productId: number;
  name_sq: string;
  name_en: string;
  price: number;
  quantity: number;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
