"""Turn an uploaded PDF into LaTeX that copies its layout.

A PDF has no LaTeX inside, so we describe every line of it to the AI (position, alignment,
font, size, weight, colour, links) plus its rules and boxes, and ask for a complete document
that reproduces it. The result is compiled and checked against the original:

- safety: only known packages, no file/shell access commands
- page count: no longer than the original
- text: every original line is present
- layout: each line lands near the same height on the page as in the original

Problems are fed back to the AI for another try; the best attempt wins. The output is an
ordinary .tex, so later edits are small patches exactly like an uploaded .tex.
"""
import io
import logging
import re
import statistics
from collections import Counter
from dataclasses import dataclass, field

import pdfplumber

from . import llm
from .compiler import CompileError, compile_pdf
from .latex import repair_json_escapes

log = logging.getLogger("uvicorn.error")

MAX_ATTEMPTS = 3
_DEBUG_DIR = __import__("os").getenv("REBUILD_DEBUG_DIR")  # saves each attempt's .tex when set

# ---------------------------------------------------------------- fonts

_TTF = "[Extension=.ttf,UprightFont=*-Regular,BoldFont=*-Bold,ItalicFont=*-Italic,BoldItalicFont=*-BoldItalic]"
_OTF = "[Extension=.otf,UprightFont=*-Regular,BoldFont=*-Bold,ItalicFont=*-Italic,BoldItalicFont=*-BoldItalic]"
_GYRE = "[Extension=.otf,UprightFont=*-regular,BoldFont=*-bold,ItalicFont=*-italic,BoldItalicFont=*-bolditalic]"

# key -> (fontspec name, options). "lm" is LaTeX's default Latin Modern (needs no setup).
FONTS = {
    "lm": None,
    "carlito": ("Carlito", _TTF),
    "caladea": ("Caladea", _TTF),
    "heros": ("texgyreheros", _GYRE),
    "termes": ("texgyretermes", _GYRE),
    "pagella": ("texgyrepagella", _GYRE),
    "bonum": ("texgyrebonum", _GYRE),
    "schola": ("texgyreschola", _GYRE),
    "adventor": ("texgyreadventor", _GYRE),
    "cursor": ("texgyrecursor", _GYRE),
    "lato": ("Lato", _TTF),
    "roboto": ("Roboto", _OTF),
    "opensans": ("OpenSans", _TTF),
    "firasans": ("FiraSans", _OTF),
    "inter": ("Inter", _OTF),
    "montserrat": ("Montserrat", _OTF),
    "ebgaramond": ("EBGaramond", _OTF),
    "xcharter": ("XCharter", "[Extension=.otf,UprightFont=*-Roman,BoldFont=*-Bold,ItalicFont=*-Italic,BoldItalicFont=*-BoldItalic]"),
    "libertinus": ("LibertinusSerif", _OTF),
    "notosans": ("NotoSans", _TTF),
    "notoserif": ("NotoSerif", _TTF),
    "dejavusans": ("DejaVuSans", "[Extension=.ttf,UprightFont=*,BoldFont=*-Bold,ItalicFont=*-Oblique,BoldItalicFont=*-BoldOblique]"),
}

# PDF font-name fragment -> closest font we have. Checked in order.
_FONT_MATCH = [
    (("lmroman", "lmsans", "cmr", "cmbx", "cmti", "cmcsc", "cmss", "sfrm", "sfbx", "sfti", "sfcc", "sfss", "cmu"), "lm"),
    (("carlito", "calibri"), "carlito"),
    (("caladea", "cambria"), "caladea"),
    (("lato",), "lato"),
    (("roboto",), "roboto"),
    (("opensans", "segoe", "aptos"), "opensans"),
    (("firasans",), "firasans"),
    (("inter",), "inter"),
    (("montserrat", "poppins", "nunito", "raleway"), "montserrat"),
    (("garamond",), "ebgaramond"),
    (("charter",), "xcharter"),
    (("libertin",), "libertinus"),
    (("notosans",), "notosans"),
    (("notoserif", "georgia", "merriweather"), "notoserif"),
    (("dejavu", "verdana", "tahoma"), "dejavusans"),
    (("bookman", "bonum"), "bonum"),
    (("schoolbook", "schola", "century"), "schola"),
    (("avantgarde", "gothic", "futura", "adventor"), "adventor"),
    (("courier", "cursor", "mono", "consola"), "cursor"),
    (("palatino", "pagella", "palladio", "bookantiqua"), "pagella"),
    (("times", "termes", "tinos", "liberationserif", "nimbusrom"), "termes"),
    (("helvetica", "arial", "heros", "arimo", "liberationsans", "nimbussan"), "heros"),
]


_SYMBOL_FONTS = ("cmsy", "cmmi", "cmex", "msam", "msbm", "lmmath", "symbol", "fontawesome", "dingbat", "wingding", "zapf", "stix", "marvosym")


def font_key(fontname: str) -> str:
    name = re.sub(r"[^a-z]", "", fontname.split("+")[-1].lower())
    if any(s in name for s in _SYMBOL_FONTS):
        return "sym"  # bullets, separators, icons: not a text font
    for keys, key in _FONT_MATCH:
        if any(k in name for k in keys):
            return key
    return "termes" if "serif" in name and "sans" not in name else "heros"


def _style(fontname: str) -> str:
    n = fontname.split("+")[-1].lower()
    bold = bool(re.search(r"bold|black|heavy|semibold|demi|cmbx|sfbx|-bd", n))
    italic = bool(re.search(r"italic|oblique|cmti|sfti|-it\b|it$", n))
    caps = bool(re.search(r"caps|csc|sfcc", n))
    return ("Bold" if bold else "") + ("Italic" if italic else "") + ("SmallCaps" if caps else "") or "Regular"


# ---------------------------------------------------------------- reading the PDF


def _hex(color) -> str:
    if not isinstance(color, (tuple, list)) or not color:
        return "000000"
    if len(color) == 1:
        rgb = (color[0],) * 3
    elif len(color) == 3:
        rgb = color
    elif len(color) == 4:
        c, m, y, k = color
        rgb = ((1 - c) * (1 - k), (1 - m) * (1 - k), (1 - y) * (1 - k))
    else:
        return "000000"
    return "".join(f"{int(max(0, min(1, float(v))) * 255):02X}" for v in rgb)


@dataclass
class Line:
    page: int
    top: float
    x0: float
    x1: float
    text: str
    size: float
    color: str = "000000"  # colour of most of the line's text
    bold: float = 0.0  # share of the line's text that is bold
    italic: float = 0.0


def _line_from_row(pno: int, row: list[dict]) -> Line:
    chars = Counter()
    bold = italic = total = 0
    for w in row:
        n = len(w["text"])
        chars[_hex(w.get("non_stroking_color"))] += n
        st = _style(w["fontname"])
        total += n
        bold += n if "Bold" in st else 0
        italic += n if "Italic" in st else 0
    size = Counter(round(w["size"], 1) for w in row).most_common(1)[0][0]
    return Line(
        pno, row[0]["top"], row[0]["x0"], row[-1]["x1"],
        " ".join(w["text"] for w in row).replace("[icon]", ""), size,
        chars.most_common(1)[0][0], bold / max(total, 1), italic / max(total, 1),
    )


def _close_color(a: str, b: str) -> bool:
    return all(abs(int(a[i : i + 2], 16) - int(b[i : i + 2], 16)) <= 40 for i in (0, 2, 4))


def _wide_rules(page, text_width: float) -> int:
    return sum(
        1 for r in page.lines + page.rects
        if abs(r["bottom"] - r["top"]) < 2.5 and r["width"] > text_width * 0.5
    )


@dataclass
class Layout:
    description: str
    pages: int
    lines: list[Line] = field(default_factory=list)
    fonts: dict[str, str] = field(default_factory=dict)  # key -> setup line
    main_font: str = "lm"
    rules: int = 0  # full-width horizontal rules across all pages


_CID = re.compile(r"\(cid:\d+\)")


def _page_words(page) -> list[dict]:
    words = page.extract_words(
        extra_attrs=["fontname", "size", "non_stroking_color"], keep_blank_chars=False, x_tolerance_ratio=0.15
    )
    for w in words:
        # Glyphs with no text mapping (usually icons: phone, envelope, GitHub...) come out as "(cid:N)".
        if _CID.search(w["text"]):
            w["text"] = _CID.sub("[icon]", w["text"])
    return words


def _group_lines(words: list[dict]) -> list[list[dict]]:
    rows: list[list[dict]] = []
    for w in sorted(words, key=lambda w: (round(w["top"]), w["x0"])):
        if rows and abs(rows[-1][0]["top"] - w["top"]) <= max(2.0, w["size"] * 0.3):
            rows[-1].append(w)
        else:
            rows.append([w])
    for row in rows:
        row.sort(key=lambda w: w["x0"])
    return rows


def read_layout(content: bytes) -> Layout:
    out: list[str] = []
    lines: list[Line] = []
    family_counts: Counter = Counter()
    n_rules = 0
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        n_pages = len(pdf.pages)
        first = pdf.pages[0]
        width, height = float(first.width), float(first.height)
        paper = "a4paper" if abs(width - 595) < 10 and abs(height - 842) < 10 else "letterpaper" if abs(width - 612) < 10 and abs(height - 792) < 10 else None
        out.append(
            f"PAPER: {width:.0f}x{height:.0f}pt ({paper or 'custom: use paperwidth/paperheight'}), {n_pages} page(s). "
            "Coordinates are in pt from the top-left corner of each page."
        )
        for pno, page in enumerate(pdf.pages, 1):
            words = _page_words(page)
            if not words:
                continue
            for w in words:
                if font_key(w["fontname"]) != "sym":
                    family_counts[font_key(w["fontname"])] += len(w["text"])
            links = [
                (l["x0"], l["top"], l["x1"], l["bottom"], l.get("uri"))
                for l in (page.hyperlinks or [])
                if l.get("uri")
            ]

            def link_of(w):
                cx, cy = (w["x0"] + w["x1"]) / 2, (w["top"] + w["bottom"]) / 2
                for x0, top, x1, bottom, uri in links:
                    if x0 - 1 <= cx <= x1 + 1 and top - 1 <= cy <= bottom + 1:
                        return uri
                return None

            left = min(w["x0"] for w in words)
            right = max(w["x1"] for w in words)
            n_rules += _wide_rules(page, right - left)
            out.append(f"\nPAGE {pno}: text spans x={left:.1f}..{right:.1f}, y={min(w['top'] for w in words):.1f}..{max(w['bottom'] for w in words):.1f}")

            items = []  # (top, text)
            for row in _group_lines(words):
                size = Counter(round(w["size"], 1) for w in row).most_common(1)[0][0]
                x0, x1 = row[0]["x0"], row[-1]["x1"]
                mid = (x0 + x1) / 2
                if abs(mid - (left + right) / 2) < 4 and x0 > left + 15:
                    align = "centered"
                elif x0 > (left + right) / 2:
                    align = "right-aligned"
                else:
                    align = f"x={x0:.1f}..{x1:.1f}"
                parts, run, prev, key = [], [], None, None
                for w in row:
                    fam = font_key(w["fontname"])
                    if fam == "sym":  # a symbol glyph: keep the surrounding text's font
                        fam = key[0] if key else "?"
                    k = (fam, _style(w["fontname"]), round(w["size"], 1), _hex(w.get("non_stroking_color")), link_of(w))
                    gap = w["x0"] - prev["x1"] if prev else 0
                    if prev and (k != key or gap > w["size"] * 2.5):
                        parts.append((key, " ".join(run), gap_before, run_x))
                        run = []
                    if not run:
                        gap_before = gap if prev else 0
                        run_x = w["x0"]
                    run.append(w["text"])
                    key, prev = k, w
                parts.append((key, " ".join(run), gap_before, run_x))
                segs = []
                for (fam, st, sz, col, uri), text, gap, rx in parts:
                    tag = f"x={rx:.1f} {st} {sz}pt" if segs else f"{st} {sz}pt"
                    if fam != "?":
                        tag += f" font={fam}"
                    if col != "000000":
                        tag += f" #{col}"
                    if uri:
                        tag += f" link={uri}"
                    sep = f" <GAP {gap:.0f}pt> " if gap > sz * 2.5 else " "
                    segs.append((sep if segs else "") + f'[{tag}] "{text}"')
                items.append((row[0]["top"], f"y={row[0]['top']:.1f} {align}: " + "".join(segs)))
                lines.append(_line_from_row(pno, row))

            for r in page.lines + page.rects:
                h = abs(r["bottom"] - r["top"])
                if r["width"] < 15:
                    continue
                color = _hex(r.get("stroking_color") or r.get("non_stroking_color"))
                if h < 2.5:
                    items.append((r["top"], f"y={r['top']:.1f} RULE x={r['x0']:.1f}..{r['x1']:.1f} thickness={max(h, r.get('linewidth') or 0.4):.1f}pt #{color}"))
                elif r.get("fill"):
                    fill = _hex(r.get("non_stroking_color"))
                    if fill != "FFFFFF":
                        items.append((r["top"], f"y={r['top']:.1f} FILLED BOX x={r['x0']:.1f}..{r['x1']:.1f} height={h:.1f}pt #{fill}"))
            if page.images:
                items.append((0, f"NOTE: page has {len(page.images)} image(s) (e.g. a photo/logo). Images cannot be used; leave them out."))
            out.extend(text for _, text in sorted(items, key=lambda t: t[0]))

    main = family_counts.most_common(1)[0][0] if family_counts else "lm"
    used = [k for k, n in family_counts.most_common() if n >= 15]
    fonts = {}
    for k in used:
        spec = FONTS.get(k)
        if k == main:
            fonts[k] = "" if spec is None else f"\\setmainfont{{{spec[0]}}}{spec[1]}"
        else:
            cmd = "\\font" + re.sub(r"[^a-zA-Z]", "", k.capitalize())
            fonts[k] = (
                f"\\newfontfamily{cmd}{{Latin Modern Roman}}" if spec is None else f"\\newfontfamily{cmd}{{{spec[0]}}}{spec[1]}"
            )
    return Layout("\n".join(out), n_pages, lines, fonts, main, n_rules)


# ---------------------------------------------------------------- the prompt

ALLOWED_PACKAGES = {
    "geometry", "fontspec", "xcolor", "titlesec", "enumitem", "tabularx", "array", "hyperref",
    "fontawesome", "multicol", "ragged2e", "setspace", "parskip", "changepage", "tabto",
    "graphicx", "calc", "ifthen", "xparse", "etoolbox", "colortbl", "booktabs", "multirow",
    "paracol", "tikz", "fancyhdr", "microtype", "latexsym", "amsmath", "amssymb", "marvosym",
    "url", "bookmark", "lastpage", "titling", "textcomp", "xstring", "needspace", "float",
    "inputenc", "fontenc", "lmodern",
}
_BLOCKED = re.compile(
    r"\\(input|include|InputIfFileExists|openin|openout|read|write|immediate|write18|ShellEscape|"
    r"directlua|luaexec|includegraphics|verbatiminput|lstinputlisting|catcode|special|pdfximage|XeTeXpicfile)\b"
)

REBUILD_SYSTEM = r"""You are an expert LaTeX typesetter. You get a precise description of a one-to-few page
resume PDF: every text line with its position, alignment and font runs, plus rules and filled
boxes. Write ONE complete LaTeX document that reproduces it as exactly as possible, so that the
compiled PDF looks like the original: same structure, same fonts, sizes, weights, colours,
alignment, spacing, rules, bullet glyphs, and same line breaks.

ENGINE: XeLaTeX (Tectonic). Use fontspec. Use EXACTLY the font setup lines given under FONTS
(main font via \setmainfont; other fonts via the given \newfontfamily commands).
Packages you may use: geometry, fontspec, xcolor, titlesec, enumitem, tabularx, array, hyperref,
fontawesome (version 4 icon names like \faGithub; NEVER fontawesome5, it crashes this engine),
multicol, ragged2e, setspace, parskip, changepage, tabto, calc, ifthen, xparse, etoolbox, colortbl,
booktabs, multirow, paracol, tikz, fancyhdr, microtype, amsmath, amssymb, marvosym, url, textcomp,
needspace. Nothing else. No images, no \input/\include, no external files.

HOW TO MATCH
- Set geometry margins from where the text starts/ends on the page (left/right from the x range,
  top from the first line's y). Use the given paper size.
- Use each run's exact size with \fontsize{size}{leading}\selectfont where it differs from the base
  size. Set the base size from the most common body size. Choose the leading (baseline skip) from the
  y distance between consecutive body lines.
- A "<GAP>" inside a line means the following text is pushed away (usually right-aligned, e.g. a
  date): use \hfill or a tabular*. "centered"/"right-aligned" lines must be centred/right aligned.
- "x=" on a run is where it starts. Runs in different lines starting at the same x form a column
  (e.g. skill values aligned after their labels): use a tabular or a fixed-width box for the labels.
- "[icon]" is a small icon in the original (phone, envelope, LinkedIn, GitHub, globe, location...).
  Use the matching fontawesome icon (\faPhone, \faEnvelope, \faLinkedin, \faGithub, \faGlobe,
  \faMapMarker) judging from the text next to it, or leave it out if unsure.
- "SmallCaps" runs: \scshape (or uppercase text if the original shows it uppercase).
- RULE lines are horizontal rules (e.g. under section titles): reproduce position, thickness, colour.
- Bullet glyphs (•, ◦, –, ▪) that start lines are list labels: use itemize with that label and the
  same indent.
- Colours: define them with \definecolor{...}{HTML}{...}. Links: \href{url}{text}, styled like the
  original (colour/underline as given); use \hypersetup to avoid boxes around links.
- Match vertical spacing: the y values tell you exactly how far apart lines are; tune \vspace,
  itemsep, titlesec spacing so every line lands at about the same height.
- The document must not be longer than the given number of pages.

- Use \pagestyle{empty} (no page numbers) unless the original shows them.

EDITABILITY (important)
- Define small macros in the preamble for repeated structures (section heading, entry heading
  with right-aligned date, bullet list start/end, skill row) and use them in the body, so each
  entry/bullet is one short readable line in the body.
- All visible content goes between \begin{document} and \end{document}. Nothing visible in the preamble.

TEXT
- Copy every word exactly, in order. Do not fix, reword, shorten or drop anything.
- Escape LaTeX specials: \& \% \$ \# \_ \{ \} \textasciitilde{} \textasciicircum{}.
- Use $\sim$ for ∼, $\rightarrow$ for →, and similar for other math symbols.

OUTPUT: only a JSON object {"tex": "<the complete .tex document>"}"""


def _user_message(layout: Layout, previous: str | None, problems: list[str]) -> str:
    fonts = "\n".join(
        f"- {k}{' (MAIN)' if k == layout.main_font else ''}: "
        + (v or "Latin Modern is LaTeX's default; load fontspec and do not call \\setmainfont")
        for k, v in layout.fonts.items()
    ) or "- lm (MAIN): default Latin Modern; do not call \\setmainfont"
    msg = f"FONTS (font=... in the runs refers to these keys):\n{fonts}\n\nLAYOUT:\n{layout.description}\n"
    if previous:
        msg += (
            "\n\nYOUR PREVIOUS DOCUMENT:\n<<<TEX\n" + previous + "\nTEX>>>\n\n"
            "IT HAS THESE PROBLEMS. Fix all of them and return the complete corrected document:\n- "
            + "\n- ".join(problems)
        )
    return msg


# ---------------------------------------------------------------- checking an attempt


def safety_problems(tex: str) -> list[str]:
    problems = []
    if _BLOCKED.search(tex):
        problems.append(f"Uses a forbidden command: {_BLOCKED.search(tex).group(0)}")
    for m in re.finditer(r"\\(?:usepackage|RequirePackage)\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}", tex):
        for pkg in (p.strip() for p in m.group(1).split(",")):
            if pkg and pkg not in ALLOWED_PACKAGES:
                problems.append(f"Package '{pkg}' is not allowed")
    if "\\begin{document}" not in tex or "\\end{document}" not in tex:
        problems.append("Missing \\begin{document} or \\end{document}")
    return problems


_WORD = re.compile(r"[a-z0-9]+")


def _norm_words(text: str) -> list[str]:
    return _WORD.findall(text.lower())


def _compare(layout: Layout, pdf: bytes) -> tuple[int, list[str], list[str], float]:
    """(pages, missing original lines, position problems, mean |dy|)."""
    with pdfplumber.open(io.BytesIO(pdf)) as doc:
        pages = len(doc.pages)
        got: list[Line] = []
        got_rules = 0
        for pno, page in enumerate(doc.pages, 1):
            rows = _group_lines(_page_words(page))
            for row in rows:
                got.append(_line_from_row(pno, row))
            if rows:
                width = max(r[-1]["x1"] for r in rows) - min(r[0]["x0"] for r in rows)
                got_rules += _wide_rules(page, width)

    all_words = _norm_words(" ".join(l.text for l in got))
    pairs = set(zip(all_words, all_words[1:]))
    words = set(all_words)
    missing = []
    for l in layout.lines:
        ws = _norm_words(l.text)
        if not ws:
            continue
        ok = ws[0] in words if len(ws) == 1 else sum(p in pairs for p in zip(ws, ws[1:])) / (len(ws) - 1) >= 0.7
        if not ok:
            missing.append(l.text)

    # Where does each original line land? Match by its first few words.
    # Lines that start the same way (two identical bullets) are matched in order.
    index: dict[str, list[Line]] = {}
    for g in got:
        index.setdefault(" ".join(_norm_words(g.text)[:4]), []).append(g)
    diffs = []
    for l in layout.lines:
        key = " ".join(_norm_words(l.text)[:4])
        same = index.get(key)
        g = same.pop(0) if same else None
        if g and len(key) > 6 and g.page == l.page:
            diffs.append((abs(g.top - l.top), l, g))
    mean_dy = statistics.mean(d for d, _, _ in diffs) if diffs else 99.0
    position = []
    worst = sorted(diffs, key=lambda t: -t[0])
    if diffs and (mean_dy > 4 or worst[0][0] > 15):
        position.append(
            f"Lines land at different heights than the original (average off by {mean_dy:.1f}pt). Worst:"
        )
        for d, l, g in worst[:6]:
            position.append(f'"{l.text[:60]}": original y={l.top:.1f}, yours y={g.top:.1f}')

    # Same colour, weight and slant per line?
    style = []
    for _, l, g in diffs:
        what = []
        if not _close_color(l.color, g.color):
            what.append(f"colour should be #{l.color}, yours #{g.color}")
        if abs(l.bold - g.bold) > 0.4:
            what.append("should be bold" if l.bold > g.bold else "should not be bold")
        if abs(l.italic - g.italic) > 0.4:
            what.append("should be italic" if l.italic > g.italic else "should not be italic")
        if abs(l.size - g.size) > 0.6:
            what.append(f"size should be {l.size}pt, yours {g.size}pt")
        if what:
            style.append(f'"{l.text[:50]}": ' + ", ".join(what))
    if style:
        position.append(f"{len(style)} line(s) differ in colour/weight/size from the original, e.g.:\n  " + "\n  ".join(style[:8]))
    mean_dy += len(style) * 2  # counts toward the score

    # Line structure: every original line should start its own line, and nothing extra appears.
    orig_keys = Counter(" ".join(_norm_words(l.text)[:4]) for l in layout.lines)
    got_keys = Counter(" ".join(_norm_words(g.text)[:4]) for g in got)
    merged = [l.text for l in layout.lines if _norm_words(l.text) and got_keys[" ".join(_norm_words(l.text)[:4])] == 0]
    extra = [g.text for g in got if _norm_words(g.text) and orig_keys[" ".join(_norm_words(g.text)[:4])] == 0]
    if merged:
        position.append(
            f"{len(merged)} original line(s) do not start a line of their own in your version (merged into a "
            "neighbouring line, e.g. a heading run into its text, or wrapped differently). Each must start its "
            "own line:\n  " + "\n  ".join(m[:70] for m in merged[:8])
        )
    if extra:
        position.append(
            "Your version has lines that are not in the original (remove them; page numbers need "
            "\\pagestyle{empty}):\n  " + "\n  ".join(e[:70] for e in extra[:6])
        )
    if got_rules != layout.rules:
        position.append(f"The original has {layout.rules} full-width horizontal rule(s); yours has {got_rules}.")
    mean_dy += 4 * len(merged) + 4 * len(extra) + 5 * abs(got_rules - layout.rules)
    return pages, missing, position, mean_dy


# ---------------------------------------------------------------- spacing tuner
#
# The AI gets structure, fonts and colours right but is imprecise about vertical gaps. These
# patterns find the vertical spacing values (not font sizes, margins or line spacing) so they
# can all be scaled by one factor, picked by compiling and measuring.

_NUM = r"(-?\d*\.?\d+)\s*(pt|em|ex|mm|cm|in|bp)"
_SPACING_PATTERNS = [
    re.compile(r"(\\vspace\*?\s*\{\s*)" + _NUM),
    re.compile(r"(\\\\\s*\[\s*)" + _NUM),  # \\[4pt]
    re.compile(r"((?:itemsep|topsep|parsep|partopsep)\s*=\s*)" + _NUM),
    re.compile(r"(\\setlength\s*\{\\(?:parskip|itemsep|topsep)\}\s*\{\s*)" + _NUM),
]
_TITLESPACING = re.compile(r"(\\titlespacing\*?\s*\{[^}]*\}\s*\{[^}]*\}\s*)\{([^}]*)\}\s*\{([^}]*)\}")


def scale_spacing(tex: str, k: float) -> str:
    def num(m):
        return f"{m.group(1)}{float(m.group(2)) * k:.2f}{m.group(3)}"

    for pat in _SPACING_PATTERNS:
        tex = pat.sub(num, tex)

    def ts(m):
        scaled = [re.sub(_NUM, lambda n: f"{float(n.group(1)) * k:.2f}{n.group(2)}", g) for g in (m.group(2), m.group(3))]
        return f"{m.group(1)}{{{scaled[0]}}}{{{scaled[1]}}}"

    return _TITLESPACING.sub(ts, tex)


async def tune_spacing(layout: "Layout", tex: str, score: float) -> tuple[str, bytes | None, float]:
    """Scale the document's vertical gaps to best match the original's line positions."""
    if scale_spacing(tex, 0.5) == tex:
        return tex, None, score  # nothing we can scale
    cache: dict[float, tuple[float, bytes | None]] = {1.0: (score, None)}

    async def evaluate(k: float) -> float:
        k = round(k, 3)
        if k not in cache:
            try:
                pdf = await compile_pdf(scale_spacing(tex, k))
                pages, missing, _, s = _compare(layout, pdf)
                s += len(missing) * 20 + max(0, pages - layout.pages) * 100
                cache[k] = (s, pdf)
            except CompileError:
                cache[k] = (1e9, None)
        return cache[k][0]

    # Golden-section search over the scale factor.
    lo, hi = 0.2, 1.8
    g = 0.618
    a, b = hi - g * (hi - lo), lo + g * (hi - lo)
    fa, fb = await evaluate(a), await evaluate(b)
    for _ in range(5):
        if fa < fb:
            hi, b, fb = b, a, fa
            a = hi - g * (hi - lo)
            fa = await evaluate(a)
        else:
            lo, a, fa = a, b, fb
            b = lo + g * (hi - lo)
            fb = await evaluate(b)
    k, (best, pdf) = min(cache.items(), key=lambda kv: kv[1][0])
    log.info("rebuild: spacing x%.2f -> score %.1f (was %.1f)", k, best, score)
    if k == 1.0 or pdf is None:
        return tex, None, score
    return scale_spacing(tex, k), pdf, best


@dataclass
class Attempt:
    tex: str
    pdf: bytes | None
    problems: list[str]
    score: float


async def rebuild_from_pdf(content: bytes, provider: str | None = None) -> tuple[str, bytes, str] | None:
    """Best (tex, pdf, provider) whose text is complete and fits the page count, or None."""
    layout = read_layout(content)
    if len(layout.lines) < 8:
        return None
    best: Attempt | None = None
    best_provider = None
    previous, problems = None, []
    # Long LaTeX output: prefer the provider with the most room, fall back to the rest.
    preferred = provider or ("gemini" if "gemini" in llm.available_providers() else None)
    for attempt in range(MAX_ATTEMPTS):
        try:
            data, used = await llm.complete_json_with_provider(REBUILD_SYSTEM, _user_message(layout, previous, problems), preferred)
        except llm.LLMError as e:
            log.info("rebuild: attempt %d: AI failed: %s", attempt + 1, e)
            break
        tex = repair_json_escapes(str(data.get("tex") or ""))
        if _DEBUG_DIR:
            import os
            os.makedirs(_DEBUG_DIR, exist_ok=True)
            open(os.path.join(_DEBUG_DIR, f"attempt{attempt + 1}.tex"), "w").write(tex)
        problems = safety_problems(tex)
        pdf = None
        score = 1e9
        if not problems:
            try:
                pdf = await compile_pdf(tex)
            except CompileError as e:
                problems = [f"It does not compile: {e}"]
        if pdf:
            pages, missing, position, mean_dy = _compare(layout, pdf)
            if pages > layout.pages:
                problems.append(f"It is {pages} pages; the original is {layout.pages}. Reduce vertical spacing to match the original y positions.")
            if missing:
                problems.append("These original lines are missing or changed; include them word for word:\n  " + "\n  ".join(missing[:15]))
            problems.extend(position)
            score = len(missing) * 20 + max(0, pages - layout.pages) * 100 + mean_dy
        log.info("rebuild: attempt %d via %s: %s", attempt + 1, used, "; ".join(p[:120] for p in problems) or "matches")
        if pdf and (best is None or score < best.score):
            best, best_provider = Attempt(tex, pdf, problems, score), used
        if pdf and not problems:
            break
        if pdf and score < 12:  # right page count, all text, lines within ~1 line: good enough
            log.info("rebuild: attempt %d is close enough (avg %.1fpt off); stopping", attempt + 1, score)
            break
        previous = tex

    if not best:
        return None
    if best.score > 3:
        tex, pdf, score = await tune_spacing(layout, best.tex, best.score)
        if pdf is not None:
            best = Attempt(tex, pdf, [], score)
    pages, missing, _, final_score = _compare(layout, best.pdf)
    log.info("rebuild: final score %.1f", final_score)
    if pages > layout.pages or len(missing) > 2 or final_score > 60:
        return None  # not faithful enough; the caller falls back to the template
    return best.tex, best.pdf, best_provider
