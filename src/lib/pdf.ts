import PDFDocument from "pdfkit";
import type { MonthlyStatement } from "./queries";
import { formatPrice, monthLabel, monthRange } from "./format";
import type { Lang } from "./i18n";

const BRAND = "#0057B8";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const LINE = "#E2E2E2";

const SOURCE_LABEL: Record<string, { sq: string; en: string }> = {
  online: { sq: "Online", en: "Online" },
  phone: { sq: "Telefon", en: "Phone" },
  whatsapp: { sq: "WhatsApp", en: "WhatsApp" },
  in_store: { sq: "Në dyqan", en: "In store" },
};
const STATUS_LABEL: Record<string, { sq: string; en: string }> = {
  new: { sq: "E re", en: "New" },
  preparing: { sq: "Në përgatitje", en: "Preparing" },
  out_for_delivery: { sq: "Në dërgesë", en: "Out for delivery" },
  delivered: { sq: "Dërguar", en: "Delivered" },
  cancelled: { sq: "Anuluar", en: "Cancelled" },
};

export function buildStatementPdf(
  ym: string,
  s: MonthlyStatement,
  lang: Lang
): Promise<Buffer> {
  const tr = (sq: string, en: string) => (lang === "sq" ? sq : en);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;
    const range = monthRange(ym);

    // ---- Header ----
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text("TRADICIONALE", left, 50);
    doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(
      tr("Në mënyrë artizanale", "The artisanal way"),
      left,
      75
    );

    doc.font("Helvetica-Bold").fontSize(13).fillColor(BRAND).text(
      tr("Raporti mujor", "Monthly statement"),
      left,
      50,
      { width, align: "right" }
    );
    doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(
      `${tr("Periudha", "Period")}: ${range.start} – ${range.end}`,
      left,
      70,
      { width, align: "right" }
    );
    doc.text(
      `${tr("Gjeneruar më", "Generated on")}: ${new Date().toLocaleString(
        lang === "sq" ? "sq-AL" : "en-GB"
      )}`,
      left,
      84,
      { width, align: "right" }
    );

    doc.moveTo(left, 105).lineTo(right, 105).strokeColor(LINE).stroke();

    // ---- Period title ----
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(
      monthLabel(ym, lang),
      left,
      120
    );

    // ---- Summary cards ----
    let y = 155;
    const gap = 12;
    const cardW = (width - gap * 2) / 3;
    const summary: [string, string, boolean][] = [
      [tr("Të ardhurat", "Revenue"), formatPrice(s.summary.revenue), true],
      [tr("Porositë e realizuara", "Completed orders"), String(s.summary.paidOrders), false],
      [tr("Mesatarja për porosi", "Average per order"), formatPrice(s.summary.avgOrder), false],
    ];
    summary.forEach(([label, value, accent], i) => {
      const x = left + i * (cardW + gap);
      doc.roundedRect(x, y, cardW, 56, 6).strokeColor(LINE).lineWidth(1).stroke();
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(label.toUpperCase(), x + 10, y + 10, { width: cardW - 20 });
      doc.font("Helvetica-Bold").fontSize(16).fillColor(accent ? BRAND : INK).text(value, x + 10, y + 26, { width: cardW - 20 });
    });

    y += 56 + gap;
    const summary2: [string, string][] = [
      [tr("Porosi gjithsej", "Total orders"), String(s.summary.totalOrders)],
      [tr("Anuluar", "Cancelled"), String(s.summary.cancelled)],
    ];
    const card2W = (width - gap) / 2;
    summary2.forEach(([label, value], i) => {
      const x = left + i * (card2W + gap);
      doc.roundedRect(x, y, card2W, 48, 6).strokeColor(LINE).stroke();
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(label.toUpperCase(), x + 10, y + 9, { width: card2W - 20 });
      doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text(value, x + 10, y + 24, { width: card2W - 20 });
    });
    y += 48 + 24;

    // ---- helper: simple table ----
    function table(
      title: string,
      headers: [string, string, string?],
      rows: (string | number)[][]
    ) {
      if (y > doc.page.height - 140) {
        doc.addPage();
        y = 50;
      }
      doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text(title, left, y);
      y += 20;
      const cols = headers.length;
      const colW = width / cols;
      // header
      doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED);
      headers.forEach((h, i) =>
        doc.text(String(h ?? ""), left + i * colW, y, {
          width: colW - 6,
          align: i === 0 ? "left" : "right",
        })
      );
      y += 15;
      doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).stroke();
      y += 6;
      doc.font("Helvetica").fontSize(10).fillColor(INK);
      rows.forEach((r) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 50;
        }
        r.forEach((cell, i) =>
          doc.fillColor(i === 0 ? INK : MUTED).text(String(cell), left + i * colW, y, {
            width: colW - 6,
            align: i === 0 ? "left" : "right",
          })
        );
        y += 18;
      });
      y += 16;
    }

    // ---- By status ----
    table(
      tr("Sipas statusit", "By status"),
      [tr("Statusi", "Status"), tr("Porosi", "Orders"), tr("Vlera", "Value")],
      s.byStatus.map((r) => [
        STATUS_LABEL[r.status]?.[lang] ?? r.status,
        r.count,
        formatPrice(r.revenue),
      ])
    );

    // ---- By source ----
    table(
      tr("Sipas burimit", "By source"),
      [tr("Burimi", "Source"), tr("Porosi", "Orders"), tr("Të ardhura", "Revenue")],
      s.bySource.map((r) => [
        SOURCE_LABEL[r.source]?.[lang] ?? r.source,
        r.count,
        formatPrice(r.revenue),
      ])
    );

    // ---- Top products ----
    table(
      tr("Produktet kryesore", "Top products"),
      [tr("Produkti", "Product"), tr("Sasia", "Qty"), tr("Të ardhura", "Revenue")],
      s.topItems.map((r) => [
        lang === "sq" ? r.name_sq : r.name_en,
        r.qty,
        formatPrice(r.revenue),
      ])
    );

    // ---- Footer ----
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(
      "Tradicionale · Lot Vaku, Prishtinë, Kosovë · 045 301 306",
      left,
      doc.page.height - 50,
      { width, align: "center" }
    );

    doc.end();
  });
}
