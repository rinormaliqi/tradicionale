# -*- coding: utf-8 -*-
"""Builds the Albanian client guide PDF for the Tradicionale app."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image as RLImage,
    PageBreak, Table, TableStyle, NextPageTemplate, KeepTogether,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, "docs", "shots")
OUT = os.path.join(HERE, "docs", "Tradicionale-Udhezues.pdf")

BRAND = colors.HexColor("#0057B8")
BRAND_DARK = colors.HexColor("#004494")
INK = colors.HexColor("#1A1A1A")
MUTED = colors.HexColor("#6B7280")
LINE = colors.HexColor("#E2E2E2")
SURFACE = colors.HexColor("#F2F5FA")

# ---- Fonts (use system TTFs for nice diacritics; fall back to built-ins) ----
def reg(name, path):
    try:
        pdfmetrics.registerFont(TTFont(name, path))
        return True
    except Exception:
        return False

SUP = "/System/Library/Fonts/Supplemental/"
SERIF = "Body"
SERIF_B = "Body-B"
HEAD = "Head"
HEAD_B = "Head-B"

ok_body = reg(SERIF, SUP + "Arial.ttf") and reg(SERIF_B, SUP + "Arial Bold.ttf")
ok_head = reg(HEAD, SUP + "Georgia.ttf") and reg(HEAD_B, SUP + "Georgia Bold.ttf")
if not ok_body:
    SERIF, SERIF_B = "Helvetica", "Helvetica-Bold"
if not ok_head:
    HEAD, HEAD_B = "Times-Roman", "Times-Bold"

# ---- Styles ----
styles = {
    "h1": ParagraphStyle("h1", fontName=HEAD_B, fontSize=20, textColor=BRAND,
                         leading=24, spaceBefore=6, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName=HEAD_B, fontSize=14.5, textColor=INK,
                         leading=18, spaceBefore=14, spaceAfter=6),
    "body": ParagraphStyle("body", fontName=SERIF, fontSize=10.5, textColor=INK,
                           leading=16, spaceAfter=6, alignment=TA_LEFT),
    "cap": ParagraphStyle("cap", fontName=SERIF, fontSize=8.5, textColor=MUTED,
                          leading=11, spaceBefore=4, alignment=TA_CENTER),
    "bullet": ParagraphStyle("bullet", fontName=SERIF, fontSize=10.5, textColor=INK,
                             leading=15, leftIndent=14, bulletIndent=2, spaceAfter=3),
    "lead": ParagraphStyle("lead", fontName=SERIF, fontSize=11.5, textColor=INK,
                           leading=18, spaceAfter=8),
}

CONTENT_W = A4[0] - 4 * cm

def img(name, max_h=15.2 * cm):
    p = os.path.join(SHOTS, name + ".png")
    iw, ih = PILImage.open(p).size
    w = CONTENT_W
    h = w * ih / iw
    if h > max_h:
        h = max_h
        w = h * iw / ih
    im = RLImage(p, width=w, height=h)
    im.hAlign = "CENTER"
    return im

def figure(name, caption, max_h=15.2 * cm):
    return KeepTogether([img(name, max_h), Paragraph(caption, styles["cap"]),
                         Spacer(1, 10)])

def h2(t): return Paragraph(t, styles["h2"])
def body(t): return Paragraph(t, styles["body"])

# ---- Page decorations ----
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(SERIF, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, 1.2 * cm, "Tradicionale — Udhëzues i Aplikacionit")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, "Faqe %d" % doc.page)
    canvas.setStrokeColor(LINE)
    canvas.line(2 * cm, 1.5 * cm, A4[0] - 2 * cm, 1.5 * cm)
    canvas.restoreState()

def cover(canvas, doc):
    canvas.saveState()
    # top brand band
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 6 * cm, A4[0], 6 * cm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont(HEAD_B, 30)
    canvas.drawString(2 * cm, A4[1] - 3.3 * cm, "TRADICIONALE")
    canvas.setFont(SERIF, 11)
    canvas.drawString(2 * cm, A4[1] - 4.1 * cm, "Në mënyrë artizanale")

    # title block
    canvas.setFillColor(INK)
    canvas.setFont(HEAD_B, 30)
    canvas.drawString(2 * cm, A4[1] - 9.2 * cm, "Udhëzues i Aplikacionit")
    canvas.setFillColor(MUTED)
    canvas.setFont(SERIF, 13)
    canvas.drawString(2 * cm, A4[1] - 10.2 * cm,
                      "Si funksionon dyqani juaj online dhe paneli i administrimit")

    # bottom note
    canvas.setStrokeColor(LINE)
    canvas.line(2 * cm, 3.2 * cm, A4[0] - 2 * cm, 3.2 * cm)
    canvas.setFillColor(MUTED)
    canvas.setFont(SERIF, 10)
    canvas.drawString(2 * cm, 2.6 * cm, "Përgatitur për: Tradicionale, Prishtinë")
    canvas.drawString(2 * cm, 2.1 * cm, "Qershor 2026")
    canvas.restoreState()

frame = Frame(2 * cm, 2 * cm, A4[0] - 4 * cm, A4[1] - 4 * cm, id="main")
cover_frame = Frame(2 * cm, 2 * cm, A4[0] - 4 * cm, A4[1] - 4 * cm, id="cover")

doc = BaseDocTemplate(OUT, pagesize=A4, title="Tradicionale — Udhëzues i Aplikacionit",
                      author="Tradicionale")
doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[cover_frame], onPage=cover),
    PageTemplate(id="Main", frames=[frame], onPage=footer),
])

S = []  # story

# ===== COVER =====
S.append(NextPageTemplate("Main"))
S.append(PageBreak())

# ===== HYRJE =====
S.append(Paragraph("Hyrje", styles["h1"]))
S.append(Paragraph(
    "Ky dokument shpjegon në mënyrë të thjeshtë se si funksionon aplikacioni i ri "
    "i Tradicionale. Nuk përmban terma teknikë — qëllimi është që ju ta kuptoni "
    "lehtë çdo veçori dhe ta përdorni me siguri çdo ditë.", styles["lead"]))
S.append(Paragraph("Aplikacioni ka dy pjesë kryesore:", styles["body"]))
S.append(Paragraph(
    "<b>Faqja për klientët</b> — ku klientët shohin produktet dhe bëjnë porosi online.",
    styles["bullet"], bulletText="•"))
S.append(Paragraph(
    "<b>Paneli i administrimit</b> — ku ju menaxhoni porositë, produktet, stokun, "
    "raportet dhe përmbajtjen e faqes.", styles["bullet"], bulletText="•"))
S.append(Spacer(1, 4))
S.append(Paragraph(
    "Aplikacioni është plotësisht dygjuhësh: <b>shqip</b> (gjuha kryesore) dhe "
    "<b>anglisht</b>. Gjuha ndërrohet në çdo moment me butonin <b>SQ / EN</b>.",
    styles["body"]))

# ===== PJESA PËR KLIENTËT =====
S.append(h2("1. Pjesa për klientët"))

S.append(Paragraph("Ballina", styles["h2"]))
S.append(body(
    "Ballina është faqja e parë që sheh klienti. Ajo paraqet identitetin e biznesit, "
    "një mesazh mirëseardhjeje, oraret e punës dhe butonin <b>“Porosit tani”</b> që e "
    "çon klientin te menyja. Më poshtë shfaqen përparësitë e biznesit (punim me dorë, "
    "dërgesa falas, freskia ditore)."))
S.append(figure("home", "Ballina — pamja e parë e klientit, në gjuhën shqipe."))
S.append(body(
    "Po në ballinë shfaqen <b>ofertat dhe banerët promovues</b>, si dhe produktet e "
    "zgjedhura. Këto i kontrolloni vetë nga paneli (shih seksionin “Përmbajtja”)."))
S.append(figure("home_offers", "Ofertat promovuese dhe produktet e zgjedhura në ballinë."))

S.append(Paragraph("Menyja", styles["h2"]))
S.append(body(
    "Te menyja klienti sheh të gjitha produktet me foto, përshkrim dhe çmim. Produktet "
    "mund të filtrohen sipas kategorive (p.sh. Byrek, Tava). Me një klik te "
    "<b>“Shto në shportë”</b>, produkti shtohet në shportën e klientit."))
S.append(figure("menu", "Menyja me produktet, kategoritë dhe çmimet."))

S.append(Paragraph("Shporta", styles["h2"]))
S.append(body(
    "Shporta tregon produktet e zgjedhura, sasinë dhe totalin. Klienti mund të rrisë "
    "ose zvogëlojë sasinë, ose të heqë një produkt, përpara se të vazhdojë te porosia."))
S.append(figure("cart", "Shporta me produktet e zgjedhura dhe totalin.", max_h=11 * cm))

S.append(Paragraph("Të dhënat e dërgesës", styles["h2"]))
S.append(body(
    "Këtu klienti plotëson të dhënat për dërgesë: emrin, numrin e telefonit, adresën e "
    "plotë, qytetin/lagjen dhe shënime opsionale (p.sh. udhëzime për shoferin). Pagesa "
    "bëhet me para në dorë në momentin e dorëzimit. Në të djathtë shfaqet përmbledhja "
    "e porosisë me totalin."))
S.append(figure("checkout", "Forma e të dhënave të dërgesës dhe përmbledhja e porosisë."))

S.append(Paragraph("Konfirmimi i porosisë", styles["h2"]))
S.append(body(
    "Pas dërgimit, klienti merr një faqe konfirmimi me numrin e porosisë dhe "
    "përmbledhjen e saj. Në të njëjtin moment, porosia shfaqet në panelin tuaj të "
    "administrimit."))
S.append(figure("confirm", "Faqja e konfirmimit me numrin e porosisë.", max_h=11 * cm))

# ===== PANELI =====
S.append(PageBreak())
S.append(Paragraph("2. Paneli i Administrimit", styles["h1"]))
S.append(body(
    "Paneli është “qendra e komandimit” e biznesit. Aty menaxhoni gjithçka: porositë, "
    "produktet, stokun, raportet financiare dhe përmbajtjen e faqes."))

S.append(Paragraph("Hyrja me fjalëkalim", styles["h2"]))
S.append(body(
    "Paneli mbrohet me fjalëkalim — vetëm ju keni qasje. Pas hyrjes shfaqet menyja me: "
    "<b>Paneli, Porositë, Produktet, Stoku, Raportet</b> dhe <b>Përmbajtja</b>."))
S.append(figure("login", "Hyrja e mbrojtur me fjalëkalim.", max_h=9.5 * cm))

S.append(Paragraph("Paneli kryesor", styles["h2"]))
S.append(body(
    "Paneli kryesor jep një pasqyrë të shpejtë: të ardhurat totale, numrin e porosive, "
    "porositë e reja, shitjet e sotme dhe mesataren për porosi. Më poshtë shihni "
    "produktet më të shitura, porositë e fundit dhe raportet mujore."))
S.append(figure("dashboard", "Paneli kryesor me treguesit kryesorë të biznesit."))

S.append(Paragraph("Porositë", styles["h2"]))
S.append(body(
    "Te <b>“Porositë”</b> shfaqen të gjitha porositë. Mund t’i <b>kërkoni</b> sipas "
    "emrit, telefonit ose numrit; t’i <b>filtroni</b> sipas statusit (E re, Në "
    "përgatitje, Në dërgesë, Dërguar, Anuluar); dhe të lëvizni <b>faqe pas faqe</b> kur "
    "porositë janë të shumta. Çdo porosi tregon edhe <b>burimin</b>: Online, Telefon, "
    "WhatsApp ose Në dyqan."))
S.append(figure("orders", "Lista e porosive me kërkim, filtra dhe burimin e porosisë."))
S.append(body(
    "<b>Shtimi manual i porosive:</b> kur një porosi vjen me telefon ose WhatsApp, "
    "klikoni <b>“Porosi e re”</b>, zgjidhni produktet, plotësoni të dhënat e klientit "
    "dhe burimin. Porosia regjistrohet dhe llogaritet njësoj si ato online."))

S.append(Paragraph("Detajet e porosisë dhe fleta e dërgesës", styles["h2"]))
S.append(body(
    "Duke hapur një porosi shihni të gjithë artikujt, totalin dhe të dhënat e klientit. "
    "Mund të <b>ndryshoni statusin</b> e porosisë dhe të <b>printoni një fletë dërgese</b> "
    "të pastër për shoferin — me adresën, telefonin dhe artikujt."))
S.append(figure("order_detail", "Detajet e porosisë me ndryshimin e statusit dhe printimin."))

S.append(Paragraph("Produktet", styles["h2"]))
S.append(body(
    "Te <b>“Produktet”</b> menaxhoni të gjithë menynë: shtoni, ndryshoni ose fshini "
    "produkte. Për çdo produkt vendosni emrin (shqip dhe anglisht), përshkrimin, çmimin, "
    "kategorinë dhe stokun, <b>ngarkoni foto</b>, dhe e shënoni si <b>“I veçantë”</b> "
    "për ta shfaqur në ballinë."))
S.append(figure("products", "Menaxhimi i produkteve me foto dhe të dhëna dygjuhëshe."))

S.append(Paragraph("Stoku", styles["h2"]))
S.append(body(
    "Te <b>“Stoku”</b> shihni dhe përditësoni sasinë në dispozicion për çdo produkt. "
    "Sistemi ju paralajmëron kur stoku është i ulët ose ka mbaruar. Stoku zbritet "
    "<b>automatikisht</b> me çdo porosi të re."))
S.append(figure("inventory", "Kontrolli i stokut me paralajmërime për sasi të ulëta."))

S.append(Paragraph("Raportet mujore", styles["h2"]))
S.append(body(
    "Raportet llogarisin financat për <b>çdo muaj kalendarik</b> (nga data 1 deri në "
    "fund të muajit). Shihni të ardhurat, numrin e porosive, porositë e anuluara dhe "
    "mesataren për porosi."))
S.append(figure("reports", "Raporti mujor me treguesit financiarë dhe ndarjet."))
S.append(body(
    "Raporti ndahet <b>sipas statusit</b>, <b>sipas burimit</b> (Online / Telefon / "
    "WhatsApp / Në dyqan) dhe sipas <b>produkteve më të shitura</b>. Raportin mund ta "
    "<b>printoni</b> ose ta <b>shkarkoni si dokument PDF</b> për nevoja kontabiliteti."))
S.append(figure("reports_more", "Ndarja sipas burimit dhe produktet kryesore të muajit."))

S.append(Paragraph("Përmbajtja (Ballina dhe ofertat)", styles["h2"]))
S.append(body(
    "Te <b>“Përmbajtja”</b> ndryshoni vetë banderolën kryesore të ballinës (titullin, "
    "mesazhin, foton, butonin) dhe menaxhoni banerët promovues — oferta, zbritje dhe "
    "fushata sezonale. Kështu faqja qëndron gjithmonë e freskët, pa pasur nevojë për "
    "ndihmë teknike."))
S.append(figure("content", "Menaxhimi i banderolës dhe ofertave nga paneli."))

# ===== VEÇORITË =====
S.append(PageBreak())
S.append(Paragraph("3. Veçoritë kryesore", styles["h1"]))
feats = [
    ("Dygjuhësh", "Shqip dhe anglisht, me ndërrim të menjëhershëm."),
    ("Porosi online të thjeshta", "Nga menyja te shporta dhe dërgesa në pak hapa."),
    ("Të dhëna të plota për shoferët", "Adresa, telefoni dhe shënimet në një fletë të printueshme."),
    ("Shtim manual i porosive", "Për porositë me telefon ose WhatsApp."),
    ("Produkte me foto", "Menaxhim i lehtë i menysë me imazhe cilësore."),
    ("Kontroll i stokut", "Zbritje automatike dhe paralajmërime për sasi të ulëta."),
    ("Raporte mujore", "Financat e çdo muaji, të printueshme dhe në PDF."),
    ("Ballinë e menaxhueshme", "Oferta dhe banderola që i ndryshoni vetë."),
    ("Pamje profesionale", "Dizajn i pastër, i shpejtë dhe i besueshëm."),
]
rows = [[Paragraph("<b>%s</b>" % t, styles["body"]), Paragraph(d, styles["body"])]
        for t, d in feats]
tbl = Table(rows, colWidths=[5.2 * cm, CONTENT_W - 5.2 * cm])
tbl.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("BACKGROUND", (0, 0), (0, -1), SURFACE),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
]))
S.append(tbl)

S.append(Spacer(1, 18))
S.append(Paragraph("Përmbledhje", styles["h2"]))
S.append(Paragraph(
    "Aplikacioni është ndërtuar që të jetë i shpejtë, i besueshëm dhe i lehtë për t’u "
    "përdorur çdo ditë — si për klientët, ashtu edhe për stafin. Klientët porosisin "
    "online me pak hapa, ndërsa ju menaxhoni gjithçka nga një vend i vetëm. Për çdo "
    "pyetje ose ndryshim, jemi në dispozicion.", styles["lead"]))

doc.build(S)
print("WROTE", OUT)
