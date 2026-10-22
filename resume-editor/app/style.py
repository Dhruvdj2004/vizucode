"""Read the look of an uploaded PDF (font, size, margins, paper, headings, link colour) so the
rebuilt LaTeX can match it instead of forcing one house style."""
import io
from collections import Counter

import pdfplumber

# PDF font name fragment -> font we can load in Tectonic. None = Latin Modern, the LaTeX default.
_FONT_FAMILIES = [
    (("lmroman", "cmr", "cmbx", "cmti", "cmcsc", "sfrm", "sfbx", "sfti", "sfcc", "cmu", "computermodern"), "lm"),
    (("times", "termes", "tinos", "liberationserif", "nimbusrom", "nimbusroman"), "termes"),
    (("palatino", "pagella", "palladio", "bookantiqua"), "pagella"),
    (("helvetica", "arial", "heros", "liberationsans", "nimbussan", "arimo", "calibri", "carlito", "roboto", "opensans", "lato", "inter", "sourcesans"), "heros"),
    (("georgia", "garamond", "cambria", "caladea", "bookman", "bonum", "schoolbook", "century", "serif"), "termes"),
]

# Fonts Tectonic ships, loaded by file name with fontspec.
FONT_SPECS = {
    "termes": "texgyretermes",
    "pagella": "texgyrepagella",
    "heros": "texgyreheros",
}

MODERN = {"kind": "modern"}


def _family(fontname: str) -> str | None:
    name = fontname.split("+")[-1].lower().replace("-", "").replace(" ", "")
    for keys, family in _FONT_FAMILIES:
        if any(k in name for k in keys):
            return family
    return None


def _rgb(color) -> tuple[float, float, float] | None:
    if not isinstance(color, (tuple, list)):
        return None
    if len(color) == 1:
        return (color[0],) * 3
    if len(color) == 3:
        return tuple(color)
    if len(color) == 4:  # CMYK
        c, m, y, k = color
        return ((1 - c) * (1 - k), (1 - m) * (1 - k), (1 - y) * (1 - k))
    return None


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def detect_style(content: bytes) -> dict:
    """Style of the first page of a PDF. Falls back to the modern template if unsure."""
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            page = pdf.pages[0]
            chars = [c for c in page.chars if c.get("text", "").strip()]
            if len(chars) < 200:
                return MODERN
            width, height = float(page.width), float(page.height)
            rules = [r for r in page.lines + page.rects if abs(r["bottom"] - r["top"]) < 2]
            wide_rules = sum(1 for r in rules if r["width"] > width * 0.5)
            header_cut = height * 0.2
            header_underlines = sum(1 for r in rules if r["width"] <= 200 and r["top"] < header_cut)
    except Exception:
        return MODERN

    fonts = Counter()
    for c in chars:
        fonts[_family(c["fontname"]) or "?"] += 1
    family, n = fonts.most_common(1)[0]
    if family == "?" or n < len(chars) * 0.5:
        return MODERN

    sizes = Counter(round(c["size"] * 2) / 2 for c in chars)
    base = sizes.most_common(1)[0][0]
    name_size = max(c["size"] for c in chars)
    # Section headings: the largest size, below the name, that is used for a fair number of chars.
    mid = Counter(round(c["size"] * 2) / 2 for c in chars if base + 0.5 < c["size"] < name_size - 1)
    common = [s for s, n in mid.items() if n >= 20]
    heading_size = max(common) if common else base + 2
    larger = [c for c in chars if abs(round(c["size"] * 2) / 2 - heading_size) < 0.01]

    def caps(cs):
        return sum(1 for c in cs if "caps" in c["fontname"].lower() or "csc" in c["fontname"].lower() or "sfcc" in c["fontname"].lower())

    name_chars = [c for c in chars if c["size"] >= name_size - 0.5]
    small_caps_headings = caps(larger) > len(larger) * 0.5 if larger else False
    small_caps_name = caps(name_chars) > len(name_chars) * 0.5 if name_chars else False

    def hex_color(cs, share: float) -> str | None:
        """Most common clear colour (not black/grey) among `cs`, if it covers `share` of them."""
        colored = Counter()
        for c in cs:
            rgb = _rgb(c.get("non_stroking_color"))
            if rgb and max(rgb) - min(rgb) > 0.25:
                colored[tuple(round(x, 3) for x in rgb)] += 1
        if not colored or colored.most_common(1)[0][1] < max(1, len(cs) * share):
            return None
        return "{:02X}{:02X}{:02X}".format(*(int(_clamp(x, 0, 1) * 255) for x in colored.most_common(1)[0][0]))

    heading_color = hex_color(larger, 0.5) if larger else None
    body_chars = [c for c in chars if c["size"] <= base + 1]
    link = hex_color(body_chars, 0)

    left = min(c["x0"] for c in chars) / 72
    right = (width - max(c["x1"] for c in chars)) / 72
    top = min(c["top"] for c in chars) / 72

    return {
        "kind": "classic",
        "font": family,  # lm | termes | pagella | heros
        "paper": "a4paper" if abs(width - 595) < 10 and abs(height - 842) < 10 else "letterpaper",
        "base": base,
        "heading_size": heading_size,
        "name_size": round(name_size, 1),
        "sc_headings": small_caps_headings,
        "sc_name": small_caps_name,
        "rules": wide_rules >= 3,
        "link_color": link,
        "heading_color": heading_color,
        "name_color": hex_color(name_chars, 0.5),
        "underline_links": header_underlines >= 2,
        "margins": {
            "left": round(_clamp(left, 0.25, 1.25), 2),
            "right": round(_clamp(right, 0.25, 1.25), 2),
            "top": round(_clamp(top, 0.25, 1.25), 2),
            "bottom": round(_clamp(top, 0.25, 1.25), 2),
        },
    }
