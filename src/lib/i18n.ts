export type Lang = "sq" | "en";

export const DEFAULT_LANG: Lang = "sq";

/**
 * All UI strings. Albanian (sq) is primary, English (en) secondary.
 * Product names/descriptions are stored per-language in the DB, not here.
 */
export const dict = {
  brand: { sq: "Tradicionale", en: "Tradicionale" },
  tagline: { sq: "Në mënyrë artizanale", en: "The artisanal way" },

  nav_home: { sq: "Ballina", en: "Home" },
  nav_menu: { sq: "Menyja", en: "Menu" },
  nav_cart: { sq: "Shporta", en: "Cart" },
  nav_admin: { sq: "Admin", en: "Admin" },

  hero_title: { sq: "E përgatitur si dikur.", en: "Made the old way." },
  hero_sub: {
    sq: "Ushqime tradicionale të punuara me dorë, çdo ditë. Dërgesa falas në Prishtinë.",
    en: "Traditional handmade food, every day. Free delivery in Pristina.",
  },
  hero_cta: { sq: "Porosit tani", en: "Order now" },
  hero_hours: { sq: "Çdo ditë · 09:00 – 18:00", en: "Every day · 09:00 – 18:00" },

  feature_handmade: { sq: "Punuar me dorë", en: "Handmade" },
  feature_handmade_d: {
    sq: "Receta tradicionale, përbërës të freskët.",
    en: "Traditional recipes, fresh ingredients.",
  },
  feature_delivery: { sq: "Dërgesa falas", en: "Free delivery" },
  feature_delivery_d: {
    sq: "Shoferët tanë e sjellin te dera juaj.",
    en: "Our drivers bring it to your door.",
  },
  feature_daily: { sq: "Çdo ditë e freskët", en: "Fresh daily" },
  feature_daily_d: {
    sq: "Përgatitur çdo mëngjes, 09:00 – 18:00.",
    en: "Prepared each morning, 09:00 – 18:00.",
  },

  menu_title: { sq: "Menyja", en: "Menu" },
  menu_all: { sq: "Të gjitha", en: "All" },
  add_to_cart: { sq: "Shto në shportë", en: "Add to cart" },
  out_of_stock: { sq: "Stoku mbaroi", en: "Out of stock" },
  added: { sq: "U shtua", en: "Added" },
  featured_badge: { sq: "I veçantë", en: "Featured" },
  view_menu: { sq: "Shiko menynë", en: "View menu" },

  cart_title: { sq: "Shporta juaj", en: "Your cart" },
  cart_empty: { sq: "Shporta është bosh.", en: "Your cart is empty." },
  cart_browse: { sq: "Shfleto menynë", en: "Browse the menu" },
  cart_total: { sq: "Totali", en: "Total" },
  cart_checkout: { sq: "Vazhdo te porosia", en: "Proceed to checkout" },
  cart_remove: { sq: "Hiq", en: "Remove" },
  cart_qty: { sq: "Sasia", en: "Qty" },
  cart_continue: { sq: "Vazhdo blerjen", en: "Continue shopping" },

  checkout_title: { sq: "Të dhënat e dërgesës", en: "Delivery details" },
  f_name: { sq: "Emri dhe mbiemri", en: "Full name" },
  f_phone: { sq: "Numri i telefonit", en: "Phone number" },
  f_address: { sq: "Adresa e plotë", en: "Full address" },
  f_address_ph: {
    sq: "Rruga, numri, kati, hyrja...",
    en: "Street, number, floor, entrance...",
  },
  f_city: { sq: "Qyteti / Lagjja", en: "City / Neighborhood" },
  f_notes: { sq: "Shënime (opsionale)", en: "Notes (optional)" },
  f_notes_ph: {
    sq: "Udhëzime për shoferin, ora e preferuar...",
    en: "Instructions for the driver, preferred time...",
  },
  f_payment: { sq: "Mënyra e pagesës", en: "Payment method" },
  pay_cash: { sq: "Para në dorë (në dorëzim)", en: "Cash on delivery" },
  place_order: { sq: "Dërgo porosinë", en: "Place order" },
  order_summary: { sq: "Përmbledhja e porosisë", en: "Order summary" },
  required: { sq: "Kjo fushë është e detyrueshme", en: "This field is required" },
  submitting: { sq: "Duke dërguar...", en: "Submitting..." },

  conf_title: { sq: "Faleminderit!", en: "Thank you!" },
  conf_sub: {
    sq: "Porosia juaj u pranua. Do t'ju kontaktojmë së shpejti.",
    en: "Your order has been received. We will contact you shortly.",
  },
  conf_order_no: { sq: "Numri i porosisë", en: "Order number" },
  conf_back: { sq: "Kthehu te ballina", en: "Back to home" },

  // Admin
  admin_login: { sq: "Hyrje në panel", en: "Admin login" },
  admin_password: { sq: "Fjalëkalimi", en: "Password" },
  admin_enter: { sq: "Hyr", en: "Enter" },
  admin_wrong: { sq: "Fjalëkalim i gabuar", en: "Wrong password" },
  admin_logout: { sq: "Dil", en: "Log out" },
  admin_dashboard: { sq: "Paneli", en: "Dashboard" },
  admin_orders: { sq: "Porositë", en: "Orders" },
  admin_products: { sq: "Produktet", en: "Products" },
  admin_inventory: { sq: "Stoku", en: "Inventory" },

  stat_revenue: { sq: "Të ardhurat", en: "Revenue" },
  stat_orders: { sq: "Porositë", en: "Orders" },
  stat_new: { sq: "Të reja", en: "New" },
  stat_today: { sq: "Sot", en: "Today" },
  stat_avg: { sq: "Mesatarja për porosi", en: "Avg. per order" },
  stat_top: { sq: "Produktet më të shitura", en: "Top products" },
  stat_recent: { sq: "Porositë e fundit", en: "Recent orders" },

  st_new: { sq: "E re", en: "New" },
  st_preparing: { sq: "Në përgatitje", en: "Preparing" },
  st_out_for_delivery: { sq: "Në dërgesë", en: "Out for delivery" },
  st_delivered: { sq: "Dërguar", en: "Delivered" },
  st_cancelled: { sq: "Anuluar", en: "Cancelled" },

  th_order: { sq: "Porosia", en: "Order" },
  th_customer: { sq: "Klienti", en: "Customer" },
  th_total: { sq: "Totali", en: "Total" },
  th_status: { sq: "Statusi", en: "Status" },
  th_date: { sq: "Data", en: "Date" },
  th_actions: { sq: "Veprime", en: "Actions" },
  view: { sq: "Shiko", en: "View" },
  no_orders: { sq: "Asnjë porosi ende.", en: "No orders yet." },

  order_detail: { sq: "Detajet e porosisë", en: "Order details" },
  print_slip: { sq: "Printo fletën", en: "Print slip" },
  driver_slip: { sq: "Fletë dërgese", en: "Delivery slip" },
  update_status: { sq: "Përditëso statusin", en: "Update status" },
  customer_info: { sq: "Të dhënat e klientit", en: "Customer info" },
  items: { sq: "Artikujt", en: "Items" },

  add_product: { sq: "Shto produkt", en: "Add product" },
  edit: { sq: "Ndrysho", en: "Edit" },
  delete: { sq: "Fshi", en: "Delete" },
  save: { sq: "Ruaj", en: "Save" },
  cancel: { sq: "Anulo", en: "Cancel" },
  p_name_sq: { sq: "Emri (Shqip)", en: "Name (Albanian)" },
  p_name_en: { sq: "Emri (Anglisht)", en: "Name (English)" },
  p_desc_sq: { sq: "Përshkrimi (Shqip)", en: "Description (Albanian)" },
  p_desc_en: { sq: "Përshkrimi (Anglisht)", en: "Description (English)" },
  p_price: { sq: "Çmimi (€)", en: "Price (€)" },
  p_category: { sq: "Kategoria", en: "Category" },
  p_stock: { sq: "Stoku", en: "Stock" },
  p_active: { sq: "Aktiv", en: "Active" },
  p_unit_sq: { sq: "Njësia (Shqip)", en: "Unit (Albanian)" },
  p_unit_en: { sq: "Njësia (Anglisht)", en: "Unit (English)" },
  confirm_delete: { sq: "A jeni i sigurt?", en: "Are you sure?" },
  low_stock: { sq: "Stok i ulët", en: "Low stock" },
  in_stock: { sq: "Në stok", en: "In stock" },
  save_stock: { sq: "Ruaj stokun", en: "Save stock" },
  p_featured: { sq: "I veçantë (në ballinë)", en: "Featured (on home)" },

  // Images
  p_images: { sq: "Fotot e produktit", en: "Product images" },
  upload_image: { sq: "Ngarko foto", en: "Upload image" },
  uploading: { sq: "Duke ngarkuar...", en: "Uploading..." },
  set_primary: { sq: "Bëj kryesore", en: "Make primary" },
  primary: { sq: "Kryesore", en: "Primary" },
  no_images: { sq: "Asnjë foto ende", en: "No images yet" },
  save_first: {
    sq: "Ruaj produktin më parë për të shtuar foto.",
    en: "Save the product first to add images.",
  },
  image_hint: {
    sq: "JPG, PNG ose WebP — deri në 8MB. Optimizohet automatikisht.",
    en: "JPG, PNG or WebP — up to 8MB. Optimized automatically.",
  },

  // Admin content / hero
  admin_content: { sq: "Përmbajtja", en: "Content" },
  hero_section: { sq: "Banderola kryesore", en: "Hero banner" },
  hero_eyebrow: { sq: "Mbititulli", en: "Eyebrow text" },
  hero_heading: { sq: "Titulli", en: "Title" },
  hero_subtitle: { sq: "Nëntitulli", en: "Subtitle" },
  hero_cta_label: { sq: "Teksti i butonit", en: "Button text" },
  hero_link: { sq: "Lidhja e butonit", en: "Button link" },
  hero_badge: { sq: "Etiketa (ofertë)", en: "Badge (offer)" },
  hero_image: { sq: "Foto e banderolës", en: "Banner image" },
  remove_image: { sq: "Hiq foton", en: "Remove image" },

  promos_section: { sq: "Banerët promovues", en: "Promotional banners" },
  add_promo: { sq: "Shto baner", en: "Add banner" },
  promo_title: { sq: "Titulli", en: "Title" },
  promo_text: { sq: "Teksti", en: "Text" },
  promo_badge: { sq: "Etiketa", en: "Badge" },
  promo_price: { sq: "Çmimi (tekst)", en: "Price (text)" },
  promo_link: { sq: "Lidhja", en: "Link" },
  promo_sort: { sq: "Renditja", en: "Sort order" },
  promo_active: { sq: "Aktiv", en: "Active" },
  field_sq: { sq: "Shqip", en: "Albanian" },
  field_en: { sq: "Anglisht", en: "English" },
  offers_title: { sq: "Ofertat tona", en: "Our offers" },

  // Orders list at scale
  search_orders: { sq: "Kërko (emër, telefon, #)", en: "Search (name, phone, #)" },
  new_order: { sq: "Porosi e re", en: "New order" },
  th_source: { sq: "Burimi", en: "Source" },
  results_count: { sq: "porosi", en: "orders" },
  page_of: { sq: "Faqja", en: "Page" },
  prev: { sq: "Para", en: "Prev" },
  next_page: { sq: "Tjetra", en: "Next" },
  clear_search: { sq: "Pastro", en: "Clear" },

  // Order sources
  src_online: { sq: "Online", en: "Online" },
  src_phone: { sq: "Telefon", en: "Phone" },
  src_whatsapp: { sq: "WhatsApp", en: "WhatsApp" },
  src_in_store: { sq: "Në dyqan", en: "In store" },

  // Manual order modal
  manual_order_title: { sq: "Shto porosi manuale", en: "Add manual order" },
  select_products: { sq: "Zgjidh produktet", en: "Select products" },
  no_products_selected: { sq: "Asnjë produkt i zgjedhur", en: "No products selected" },
  order_source: { sq: "Burimi i porosisë", en: "Order source" },
  create_order: { sq: "Krijo porosinë", en: "Create order" },
  add_item: { sq: "Shto", en: "Add" },

  // Reports
  admin_reports: { sq: "Raportet", en: "Reports" },
  monthly_statements: { sq: "Raportet mujore", en: "Monthly statements" },
  monthly_statement: { sq: "Raporti mujor", en: "Monthly statement" },
  select_month: { sq: "Zgjidh muajin", en: "Select month" },
  print: { sq: "Printo", en: "Print" },
  download_pdf: { sq: "Shkarko PDF", en: "Download PDF" },
  view_report: { sq: "Shiko raportin", en: "View report" },
  rep_revenue: { sq: "Të ardhurat", en: "Revenue" },
  rep_orders: { sq: "Porositë", en: "Orders" },
  rep_paid: { sq: "Të realizuara", en: "Completed" },
  rep_cancelled: { sq: "Anuluar", en: "Cancelled" },
  rep_avg: { sq: "Mesatarja", en: "Average" },
  rep_by_status: { sq: "Sipas statusit", en: "By status" },
  rep_by_source: { sq: "Sipas burimit", en: "By source" },
  rep_top_items: { sq: "Produktet kryesore", en: "Top products" },
  rep_by_day: { sq: "Sipas ditës", en: "By day" },
  rep_qty: { sq: "Sasia", en: "Qty" },
  rep_day: { sq: "Dita", en: "Day" },
  rep_period: { sq: "Periudha", en: "Period" },
  rep_generated: { sq: "Gjeneruar më", en: "Generated on" },
  no_data_month: { sq: "Asnjë porosi për këtë muaj.", en: "No orders for this month." },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}
