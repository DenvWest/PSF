#!/usr/bin/env python3
"""
Herbruikbare PDF-generator voor PerfectSupplement-gidsen (ReportLab).

Gebruik:
  python scripts/generate-guide-pdf.py slaap
  python scripts/generate-guide-pdf.py stress
  python scripts/generate-guide-pdf.py energie
  python scripts/generate-guide-pdf.py tekorten
  python scripts/generate-guide-pdf.py herstel

Content: scripts/guide-content/{thema}.py (variabele GUIDE)
Output:  public/downloads/{thema}gids-perfectsupplement.pdf
Fonts:   scripts/fonts/ (auto-download van fonts.gstatic.com)
"""

from __future__ import annotations

import importlib.util
import ssl
import sys
import urllib.request
from io import BytesIO
from pathlib import Path
from typing import Any, Callable

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

SCRIPT_DIR = Path(__file__).resolve().parent
FONT_DIR = SCRIPT_DIR / "fonts"
PUBLIC_DOWNLOADS = SCRIPT_DIR.parent / "public" / "downloads"

PAGE_W, PAGE_H = A4
LEFT_M = 60
RIGHT_M = 60
TOP_M = 50
BOTTOM_M = 60
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

COLORS = {
    "primary": colors.HexColor("#3C7A56"),
    "dark_green": colors.HexColor("#2A5A3E"),
    "light_green": colors.HexColor("#5A8F6A"),
    "body": colors.HexColor("#1a1a1a"),
    "muted": colors.HexColor("#666666"),
    "caption": colors.HexColor("#999999"),
    "beige": colors.HexColor("#F7F5F0"),
    "white": colors.HexColor("#FFFFFF"),
    "border": colors.HexColor("#E5E0D8"),
}

FONT_SOURCES: dict[str, str] = {
    "DMSans-Regular.ttf": (
        "https://fonts.gstatic.com/s/dmsans/v17/"
        "rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf"
    ),
    "DMSans-Bold.ttf": (
        "https://fonts.gstatic.com/s/dmsans/v17/"
        "rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthTg.ttf"
    ),
    "DMSans-Italic.ttf": (
        "https://fonts.gstatic.com/s/dmsans/v17/"
        "rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDW3z.ttf"
    ),
    "DMSerifDisplay-Regular.ttf": (
        "https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2K_c.ttf"
    ),
}


def xm(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def link(url: str, label: str | None = None) -> str:
    lab = xm(label or url.replace("https://", "").replace("http://", ""))
    return f'<a href="{xm(url)}" color="#5A8F6A"><u>{lab}</u></a>'


def ensure_fonts() -> None:
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    ctx = ssl.create_default_context()
    for filename, url in FONT_SOURCES.items():
        dest = FONT_DIR / filename
        if dest.exists() and dest.stat().st_size > 1000:
            continue
        req = urllib.request.Request(url, headers={"User-Agent": "PerfectSupplement-guide-pdf"})
        with urllib.request.urlopen(req, context=ctx, timeout=90) as resp:
            dest.write_bytes(resp.read())


def register_fonts() -> tuple[str, str]:
    """Returns (body_font, heading_font) registered names."""
    serif_path = FONT_DIR / "DMSerifDisplay-Regular.ttf"
    sans_path = FONT_DIR / "DMSans-Regular.ttf"
    sans_bold = FONT_DIR / "DMSans-Bold.ttf"
    sans_italic = FONT_DIR / "DMSans-Italic.ttf"

    body_font = "Helvetica"
    heading_font = "Times-Roman"

    try:
        if sans_path.exists():
            pdfmetrics.registerFont(TTFont("DMSans", str(sans_path)))
            pdfmetrics.registerFont(TTFont("DMSans-Bold", str(sans_bold)))
            pdfmetrics.registerFont(TTFont("DMSans-Italic", str(sans_italic)))
            pdfmetrics.registerFontFamily(
                "DMSans",
                normal="DMSans",
                bold="DMSans-Bold",
                italic="DMSans-Italic",
                boldItalic="DMSans-Bold",
            )
            body_font = "DMSans"
        if serif_path.exists():
            pdfmetrics.registerFont(TTFont("DMSerifDisplay", str(serif_path)))
            heading_font = "DMSerifDisplay"
    except OSError:
        pass

    return body_font, heading_font


def tracked_width(canv, text: str, font: str, size: float, extra: float) -> float:
    w = 0.0
    for i, ch in enumerate(text):
        w += canv.stringWidth(ch, font, size)
        if i < len(text) - 1:
            w += extra
    return w


def draw_tracked_text(
    canv,
    x: float,
    y: float,
    text: str,
    font: str,
    size: float,
    color: colors.Color,
    letter_extra: float = 0.35,
    align: str = "left",
) -> None:
    canv.setFillColor(color)
    canv.setFont(font, size)
    total = tracked_width(canv, text, font, size, letter_extra)
    if align == "right":
        cx = x - total
    else:
        cx = x
    for i, ch in enumerate(text):
        canv.drawString(cx, y, ch)
        cx += canv.stringWidth(ch, font, size) + letter_extra


def build_styles(body_font: str, heading_font: str) -> dict[str, ParagraphStyle]:
    ss = getSampleStyleSheet()

    cover_label = ParagraphStyle(
        "CoverLabel",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=9,
        leading=11,
        textColor=COLORS["light_green"],
        alignment=TA_LEFT,
        spaceAfter=14,
    )
    cover_title = ParagraphStyle(
        "CoverTitle",
        parent=ss["Normal"],
        fontName=heading_font,
        fontSize=28,
        leading=32,
        textColor=COLORS["white"],
        alignment=TA_LEFT,
        spaceAfter=10,
    )
    cover_sub = ParagraphStyle(
        "CoverSub",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#CCCCCC"),
        alignment=TA_LEFT,
        spaceAfter=16,
    )
    quote_font = (
        "DMSans-Italic"
        if body_font == "DMSans"
        else ("Helvetica-Oblique" if body_font == "Helvetica" else body_font)
    )
    cover_usp = ParagraphStyle(
        "CoverUSP",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#EAEAEA"),
        alignment=TA_LEFT,
        spaceAfter=8,
        leftIndent=0,
    )
    cover_quote = ParagraphStyle(
        "CoverQuote",
        parent=ss["Normal"],
        fontName=quote_font,
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#CCCCCC"),
        alignment=TA_LEFT,
        spaceBefore=12,
        spaceAfter=6,
    )
    cover_url = ParagraphStyle(
        "CoverURL",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#AAAAAA"),
        alignment=TA_CENTER,
        spaceBefore=24,
    )

    toc_num = ParagraphStyle(
        "TocNum",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=10,
        leading=14,
        textColor=COLORS["primary"],
        alignment=TA_LEFT,
    )
    toc_title = ParagraphStyle(
        "TocTitle",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=10,
        leading=14,
        textColor=COLORS["body"],
        alignment=TA_LEFT,
    )
    toc_entry = ParagraphStyle(
        "TOCEntry",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=10,
        leading=14,
        textColor=COLORS["body"],
        alignment=TA_LEFT,
        spaceBefore=4,
        spaceAfter=4,
    )
    toc_page = ParagraphStyle(
        "TocPage",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=10,
        leading=14,
        textColor=COLORS["primary"],
        alignment=TA_RIGHT,
    )

    ch_num = ParagraphStyle(
        "ChNum",
        parent=ss["Normal"],
        fontName=heading_font,
        fontSize=36,
        leading=40,
        textColor=COLORS["primary"],
        alignment=TA_LEFT,
        spaceAfter=4,
    )
    ch_title = ParagraphStyle(
        "ChTitle",
        parent=ss["Normal"],
        fontName=heading_font,
        fontSize=20,
        leading=24,
        textColor=COLORS["body"],
        alignment=TA_LEFT,
        spaceAfter=14,
    )
    body = ParagraphStyle(
        "Body",
        parent=ss["Normal"],
        fontName=body_font,
        fontSize=10.5,
        leading=15.75,
        textColor=COLORS["body"],
        alignment=TA_JUSTIFY,
        spaceAfter=10,
    )
    h3 = ParagraphStyle(
        "H3",
        parent=body,
        fontName=f"{body_font}-Bold" if body_font == "Helvetica" else body_font,
        fontSize=12,
        leading=15,
        textColor=COLORS["primary"],
        spaceBefore=12,
        spaceAfter=6,
        alignment=TA_LEFT,
    )
    if body_font == "DMSans":
        h3.fontName = "DMSans-Bold"

    bullet = ParagraphStyle(
        "Bullet",
        parent=body,
        leftIndent=14,
        firstLineIndent=-12,
        bulletIndent=0,
        spaceBefore=2,
        spaceAfter=6,
        alignment=TA_JUSTIFY,
    )

    cta_title = ParagraphStyle(
        "CTATitle",
        parent=ss["Normal"],
        fontName=heading_font,
        fontSize=18,
        leading=22,
        textColor=COLORS["body"],
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    cta_body = ParagraphStyle(
        "CTABody",
        parent=body,
        alignment=TA_CENTER,
        fontSize=10.5,
        leading=15.75,
        spaceAfter=10,
    )
    cta_url = ParagraphStyle(
        "CTAUrl",
        parent=cta_body,
        fontSize=12,
        leading=16,
        textColor=COLORS["light_green"],
        fontName=h3.fontName,
    )
    disclaimer = ParagraphStyle(
        "Disclaimer",
        parent=body,
        fontSize=8,
        leading=11,
        textColor=COLORS["caption"],
        alignment=TA_CENTER,
        spaceAfter=8,
    )

    table_cell = ParagraphStyle(
        "TableCell",
        parent=body,
        fontSize=9,
        leading=12,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    table_head = ParagraphStyle(
        "TableHead",
        parent=body,
        fontName=h3.fontName,
        fontSize=9,
        leading=12,
        textColor=COLORS["white"],
        alignment=TA_LEFT,
        spaceAfter=0,
    )

    references_label = ParagraphStyle(
        "ReferencesLabel",
        parent=body,
        fontName=h3.fontName,
        fontSize=8,
        leading=10,
        textColor=COLORS["caption"],
        alignment=TA_LEFT,
        spaceBefore=6,
        spaceAfter=4,
    )
    reference_item = ParagraphStyle(
        "ReferenceItem",
        parent=body,
        fontSize=7.5,
        leading=10,
        textColor=COLORS["muted"],
        alignment=TA_LEFT,
        spaceAfter=3,
        leftIndent=12,
        firstLineIndent=-12,
    )
    references_page_title = ParagraphStyle(
        "ReferencesPageTitle",
        parent=ss["Normal"],
        fontName=heading_font,
        fontSize=22,
        leading=26,
        textColor=COLORS["body"],
        alignment=TA_LEFT,
        spaceAfter=16,
    )

    return {
        "cover_label": cover_label,
        "cover_title": cover_title,
        "cover_sub": cover_sub,
        "cover_usp": cover_usp,
        "cover_quote": cover_quote,
        "cover_url": cover_url,
        "toc_num": toc_num,
        "toc_title": toc_title,
        "toc_entry": toc_entry,
        "toc_page": toc_page,
        "ch_num": ch_num,
        "ch_title": ch_title,
        "body": body,
        "h3": h3,
        "bullet": bullet,
        "cta_title": cta_title,
        "cta_body": cta_body,
        "cta_url": cta_url,
        "disclaimer": disclaimer,
        "table_cell": table_cell,
        "table_head": table_head,
        "references_label": references_label,
        "reference_item": reference_item,
        "references_page_title": references_page_title,
    }


def tip_flowables(title: str | None, text: str, st: dict[str, ParagraphStyle]) -> list:
    rows: list[list[Paragraph]] = []
    if title:
        t_style = ParagraphStyle(
            "TipTitle",
            parent=st["body"],
            fontName=st["h3"].fontName,
            fontSize=10.5,
            textColor=COLORS["primary"],
            spaceAfter=4,
        )
        rows.append([Paragraph(title if "<" in title else xm(title), t_style)])
    body_xml = text if "<" in text else xm(text)
    rows.append([Paragraph(body_xml, st["body"])])
    t = Table(rows, colWidths=[CONTENT_W])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLORS["beige"]),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("LINEBEFORE", (0, 0), (0, -1), 3, COLORS["primary"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return [Spacer(1, 6), t, Spacer(1, 8)]


def build_references_block(items: list[dict[str, Any]], st: dict[str, ParagraphStyle]) -> list:
    """Footnotes-style block at end of a chapter (subset of global bibliography)."""
    elements: list = [Spacer(1, 14)]
    inner: list[list[Any]] = []

    inner.append(
        [
            HRFlowable(
                width="40%",
                thickness=0.5,
                color=COLORS["border"],
                spaceBefore=0,
                spaceAfter=0,
            )
        ]
    )
    inner.append([Paragraph("Bronnen", st["references_label"])])
    for ref in items:
        num = ref["num"]
        txt = ref["text"]
        safe = txt if "<" in txt else xm(txt)
        inner.append(
            [
                Paragraph(
                    f"<super>{num}</super> {safe}",
                    st["reference_item"],
                )
            ]
        )

    tbl = Table(inner, colWidths=[CONTENT_W])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLORS["beige"]),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    elements.append(tbl)
    elements.append(Spacer(1, 6))
    return elements


def render_blocks(blocks: list[dict[str, Any]], st: dict[str, ParagraphStyle]) -> list:
    out: list = []
    for block in blocks:
        btype = block["type"]
        if btype == "paragraph":
            t = block["text"]
            out.append(Paragraph(t if "<" in t else xm(t), st["body"]))
        elif btype == "subtitle":
            t = block["text"]
            out.append(Paragraph(t if "<" in t else xm(t), st["h3"]))
        elif btype == "bullets":
            for item in block["items"]:
                raw = item if isinstance(item, str) else str(item)
                body_txt = raw if "<" in raw else xm(raw)
                out.append(
                    Paragraph(
                        f'<font color="#5A8F6A">●</font> <font color="#1a1a1a">{body_txt}</font>',
                        st["bullet"],
                    )
                )
        elif btype == "tip":
            title = block.get("title")
            txt = block["text"]
            out.extend(tip_flowables(title, txt, st))
        elif btype == "table":
            headers: list[str] = block["headers"]
            rows: list[list[str]] = block["rows"]
            head_par = [Paragraph(xm(h), st["table_head"]) for h in headers]
            data = [head_par]
            for ri, row in enumerate(rows):
                bg = COLORS["white"] if ri % 2 == 0 else COLORS["beige"]
                data.append(
                    [Paragraph(c if "<" in c else xm(c), st["table_cell"]) for c in row]
                )
            tbl = Table(data, colWidths=[CONTENT_W / len(headers)] * len(headers), repeatRows=1)
            ts = [
                ("BACKGROUND", (0, 0), (-1, 0), COLORS["primary"]),
                ("TEXTCOLOR", (0, 0), (-1, 0), COLORS["white"]),
                ("FONTNAME", (0, 0), (-1, 0), st["h3"].fontName),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, COLORS["border"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
            for ri in range(len(rows)):
                bg = COLORS["white"] if ri % 2 == 0 else COLORS["beige"]
                ts.append(("BACKGROUND", (0, ri + 1), (-1, ri + 1), bg))
            tbl.setStyle(TableStyle(ts))
            out.extend([Spacer(1, 6), tbl, Spacer(1, 10)])
        elif btype == "spacer":
            out.append(Spacer(1, float(block.get("height", 12))))
        elif btype == "pagebreak":
            out.append(PageBreak())
        elif btype == "references":
            out.extend(build_references_block(block["items"], st))
        else:
            out.append(Paragraph(xm(str(block)), st["body"]))
    return out


def chapter_heading(number: str, title: str, st: dict[str, ParagraphStyle]) -> Table:
    left = Paragraph(number, st["ch_num"])
    right = Paragraph(xm(title), st["ch_title"])
    tbl = Table([[left, right]], colWidths=[52, CONTENT_W - 52])
    tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return tbl


def toc_marker(number: str, title: str, st: dict[str, ParagraphStyle]) -> Paragraph:
    """Invisible anchor so afterFlowable registers the correct page for TOC entries."""
    marker_style = ParagraphStyle(
        "TOCMarker",
        parent=st["body"],
        fontSize=0.01,
        leading=0.01,
        spaceBefore=0,
        spaceAfter=0,
        textColor=COLORS["body"],
    )
    marker = Paragraph(" ", marker_style)
    marker._toc_info = (number, title)  # type: ignore[attr-defined]
    return marker


class PageMeasureDoc(SimpleDocTemplate):
    """Collects chapter start pages during a measurement build."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.chapter_pages: list[tuple[str, str, int]] = []

    def afterFlowable(self, flowable: Any) -> None:
        toc_info = getattr(flowable, "_toc_info", None)
        if not toc_info:
            return
        number, title = toc_info
        self.chapter_pages.append((number, title, self.canv.getPageNumber()))


def build_static_toc_rows(
    chapters: list[dict[str, Any]],
    page_map: dict[str, int],
    st: dict[str, ParagraphStyle],
) -> list:
    """TOC rows with dot leaders and right-aligned page numbers."""
    rows: list = []
    page_col_w = 28
    title_col_w = CONTENT_W - page_col_w - 8
    for ch in chapters:
        number = ch["number"]
        title = ch["title"]
        page = page_map.get(number, 0)
        label = f"{number}  {xm(title)}"
        row = Table(
            [
                [
                    Paragraph(label, st["toc_entry"]),
                    Paragraph(str(page), st["toc_page"]),
                ]
            ],
            colWidths=[title_col_w, page_col_w],
        )
        row.setStyle(
            TableStyle(
                [
                    ("LINEBELOW", (0, 0), (-1, -1), 0.5, COLORS["border"]),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
        rows.append(row)
    return rows


def measure_toc_page_count(
    guide: dict[str, Any],
    st: dict[str, ParagraphStyle],
    page_map: dict[str, int],
    body_font: str,
) -> int:
    """How many pages the TOC section occupies (excl. title page)."""
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=TOP_M,
        bottomMargin=BOTTOM_M,
    )
    _, on_later = make_canvas_hooks(guide["meta"], body_font)
    story: list = [
        PageBreak(),
        Paragraph(xm("Inhoudsopgave"), st["ch_title"]),
        Spacer(1, 10),
        *build_static_toc_rows(guide["chapters"], page_map, st),
        PageBreak(),
    ]
    doc.build(story, onLaterPages=on_later)
    return doc.page


def measure_chapter_pages(
    guide: dict[str, Any],
    st: dict[str, ParagraphStyle],
    body_font: str,
) -> dict[str, int]:
    """Pass 1: build without TOC; return chapter number → start page."""
    buf = BytesIO()
    doc = PageMeasureDoc(
        buf,
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=TOP_M,
        bottomMargin=BOTTOM_M,
    )
    on_first, on_later = make_canvas_hooks(guide["meta"], body_font)
    story = build_story(guide, st, toc_page_map=None)
    doc.build(story, onFirstPage=on_first, onLaterPages=on_later)
    return {number: page for number, _title, page in doc.chapter_pages}


def resolve_toc_page_map(
    guide: dict[str, Any],
    st: dict[str, ParagraphStyle],
    body_font: str,
) -> dict[str, int]:
    """Two-pass offset: final chapter page = measured page + toc section pages."""
    raw = measure_chapter_pages(guide, st, body_font)
    provisional = {num: page + 1 for num, page in raw.items()}
    toc_pages = measure_toc_page_count(guide, st, provisional, body_font)
    return {num: page + toc_pages for num, page in raw.items()}


def load_guide(thema: str) -> dict[str, Any]:
    path = SCRIPT_DIR / "guide-content" / f"{thema}.py"
    if not path.exists():
        raise FileNotFoundError(f"Ontbrekend contentbestand: {path}")
    spec = importlib.util.spec_from_file_location(f"guide_{thema}", path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Kan module niet laden: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if not hasattr(module, "GUIDE"):
        raise AttributeError(f"{path} moet variabele GUIDE exporteren")
    return module.GUIDE


def build_story(
    guide: dict[str, Any],
    st: dict[str, ParagraphStyle],
    toc_page_map: dict[str, int] | None = None,
) -> list:
    story: list = []

    tp = guide["title_page"]
    label_style = ParagraphStyle(
        "LblTracked",
        parent=st["cover_label"],
        textColor=COLORS["light_green"],
    )
    story.append(Paragraph(xm(tp["label"]), label_style))
    story.append(Paragraph(tp["title"].replace("\n", "<br/>"), st["cover_title"]))
    story.append(Paragraph(xm(tp["subtitle"]), st["cover_sub"]))
    for usp in tp["usps"]:
        u = usp.lstrip("✓ ").strip()
        story.append(
            Paragraph(
                f'<font color="#5A8F6A">✓</font> <font color="#EAEAEA">{xm(u)}</font>',
                st["cover_usp"],
            )
        )
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#444444"), spaceBefore=8, spaceAfter=10))
    story.append(Paragraph(f"<i>{xm(tp['quote'])}</i>", st["cover_quote"]))
    story.append(Paragraph(f"— {xm(tp['quote_source'])}", st["cover_quote"]))
    story.append(Paragraph(xm(tp.get("footer_url", "perfectsupplement.nl")), st["cover_url"]))

    story.append(PageBreak())

    if toc_page_map is not None:
        story.append(Paragraph(xm("Inhoudsopgave"), st["ch_title"]))
        story.append(Spacer(1, 10))
        story.extend(build_static_toc_rows(guide["chapters"], toc_page_map, st))
        story.append(PageBreak())

    for i, ch in enumerate(guide["chapters"]):
        if i > 0:
            story.append(PageBreak())
        story.append(toc_marker(ch["number"], ch["title"], st))
        story.append(chapter_heading(ch["number"], ch["title"], st))
        story.extend(render_blocks(ch.get("blocks", []), st))

    story.append(PageBreak())
    cta = guide["cta"]
    cta_txt = cta["text"]
    cta_rows = [
        [Paragraph(xm(cta["title"]), st["cta_title"])],
        [Paragraph(cta_txt if "<" in cta_txt else xm(cta_txt), st["cta_body"])],
        [
            Paragraph(
                link(cta.get("url_href", "https://perfectsupplement.nl/intake"), cta.get("url_label")),
                st["cta_url"],
            )
        ],
    ]
    cta_tbl = Table(cta_rows, colWidths=[CONTENT_W])
    cta_tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLORS["beige"]),
                ("TOPPADDING", (0, 0), (-1, -1), 28),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 28),
                ("LEFTPADDING", (0, 0), (-1, -1), 24),
                ("RIGHTPADDING", (0, 0), (-1, -1), 24),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(Spacer(1, 30))
    story.append(cta_tbl)

    all_refs = guide.get("all_references")
    if all_refs:
        story.append(PageBreak())
        story.append(Paragraph("Bronnen", st["references_page_title"]))
        story.append(Spacer(1, 4))
        for ref in sorted(all_refs, key=lambda r: int(r["num"])):
            txt = ref["text"]
            safe = txt if "<" in txt else xm(txt)
            story.append(
                Paragraph(
                    f"<super>{ref['num']}</super> {safe}",
                    st["reference_item"],
                )
            )

    story.append(PageBreak())
    story.append(Paragraph(f"<b>{xm(guide['disclaimer']['title'])}</b>", st["disclaimer"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(xm(guide["disclaimer"]["body"]), st["disclaimer"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph(xm(guide["disclaimer"].get("copyright", "")), st["disclaimer"]))

    return story


def make_canvas_hooks(meta: dict[str, str], body_font: str) -> tuple[Callable, Callable]:
    banner_right = meta["header_banner"]

    def on_first(canv, doc) -> None:
        canv.saveState()
        canv.setFillColor(COLORS["dark_green"])
        canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canv.restoreState()

    def on_later(canv, doc) -> None:
        canv.saveState()
        bf = body_font if body_font != "Times-Roman" else "Helvetica"
        draw_tracked_text(canv, LEFT_M, PAGE_H - 38, "PERFECTSUPPLEMENT.NL", bf, 7, COLORS["caption"])
        draw_tracked_text(
            canv,
            PAGE_W - RIGHT_M,
            PAGE_H - 38,
            banner_right,
            bf,
            7,
            COLORS["caption"],
            align="right",
        )
        canv.setStrokeColor(COLORS["border"])
        canv.setLineWidth(0.5)
        canv.line(LEFT_M, PAGE_H - 44, PAGE_W - RIGHT_M, PAGE_H - 44)

        canv.setFont(bf, 7)
        canv.setFillColor(COLORS["light_green"])
        canv.drawString(LEFT_M, 42, "perfectsupplement.nl/intake")
        canv.setFillColor(COLORS["caption"])
        canv.drawRightString(PAGE_W - RIGHT_M, 42, str(canv.getPageNumber()))
        canv.restoreState()

    return on_first, on_later


def main() -> int:
    if len(sys.argv) != 2:
        print("Gebruik: python scripts/generate-guide-pdf.py <slaap|stress|energie|tekorten|herstel>")
        return 2
    thema = sys.argv[1].strip().lower()
    ensure_fonts()
    body_font, heading_font = register_fonts()
    st = build_styles(body_font, heading_font)

    guide = load_guide(thema)
    meta = guide["meta"]
    outfile = PUBLIC_DOWNLOADS / meta.get("output_filename", f"{thema}gids-perfectsupplement.pdf")

    PUBLIC_DOWNLOADS.mkdir(parents=True, exist_ok=True)

    on_first, on_later = make_canvas_hooks(meta, body_font)

    toc_page_map = resolve_toc_page_map(guide, st, body_font)

    doc = SimpleDocTemplate(
        str(outfile),
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=TOP_M,
        bottomMargin=BOTTOM_M,
        title=meta.get("pdf_title", guide["title_page"]["title"].replace("<br/>", " ")),
        author="PerfectSupplement",
    )

    doc.build(
        build_story(guide, st, toc_page_map=toc_page_map),
        onFirstPage=on_first,
        onLaterPages=on_later,
    )
    print(f"OK → {outfile}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
