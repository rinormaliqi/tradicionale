const puppeteer = require("puppeteer-core");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3100";
const OUT = path.join(process.cwd(), "docs", "shots");
fs.mkdirSync(OUT, { recursive: true });

const SECRET = "dev-secret-change-me-to-a-long-random-string";
const PASSWORD = "tradicionale2024";
const token = crypto.createHmac("sha256", SECRET).update(PASSWORD).digest("hex");

const cart = [
  { productId: 1, name_sq: "Mantia", name_en: "Manti", price: 8.0, quantity: 2 },
  { productId: 2, name_sq: "Byrek me mish", name_en: "Pie with meat", price: 5.0, quantity: 3 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 820, deviceScaleFactor: 2 });

  // Set Albanian language + a sample cart in localStorage on the origin.
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    (c) => {
      localStorage.setItem("tradicionale_lang", "sq");
      localStorage.setItem("tradicionale_cart", JSON.stringify(c));
    },
    cart
  );

  // Admin auth cookie.
  await page.setCookie({
    name: "tradicionale_admin",
    value: token,
    domain: "localhost",
    path: "/",
  });

  async function shot(name, url, { full = false, scrollY = 0, wait = 700 } = {}) {
    await page.goto(BASE + url, { waitUntil: "networkidle0" });
    await sleep(wait);
    if (scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await sleep(400);
    }
    await page.screenshot({
      path: path.join(OUT, name + ".png"),
      fullPage: full,
    });
    console.log("captured", name);
  }

  // Customer
  await shot("home", "/");
  await shot("home_offers", "/", { scrollY: 820 });
  await shot("menu", "/menu");
  await shot("cart", "/cart");
  await shot("checkout", "/checkout");
  await shot("confirm", "/order/1");

  // Admin
  await shot("login", "/admin/login");
  await shot("dashboard", "/admin/dashboard");
  await shot("dashboard_months", "/admin/dashboard", { full: true });
  await shot("orders", "/admin/orders");
  await shot("order_detail", "/admin/orders/1");
  await shot("products", "/admin/products");
  await shot("inventory", "/admin/inventory");
  await shot("reports", "/admin/reports");
  await shot("reports_more", "/admin/reports", { scrollY: 950 });
  await shot("content", "/admin/content");

  await browser.close();
  console.log("DONE");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
