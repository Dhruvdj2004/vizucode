"""Rendering the template, splitting locked/editable parts, and validating LLM edits."""
import re

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from .config import TEMPLATE_DIR

BODY_START = "%%BODY_START"
BODY_END = "%%BODY_END"
MARKER_RE = re.compile(r"^%%(BEGIN|END):([A-Z0-9_]+)\s*$", re.M)

_TEX_ESCAPES = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}
_TEX_ESCAPE_RE = re.compile("|".join(re.escape(k) for k in _TEX_ESCAPES))


# Symbols that text fonts (e.g. Latin Modern) often lack; typeset them as math instead.
_UNICODE_MATH = {
    "∼": r"$\sim$", "≈": r"$\approx$", "→": r"$\rightarrow$", "←": r"$\leftarrow$",
    "↔": r"$\leftrightarrow$", "≥": r"$\geq$", "≤": r"$\leq$", "×": r"$\times$",
    "±": r"$\pm$", "≠": r"$\neq$", "∞": r"$\infty$", "√": r"$\surd$",
}
_UNICODE_MATH_RE = re.compile("|".join(map(re.escape, _UNICODE_MATH)))


def tex_escape(value) -> str:
    out = _TEX_ESCAPE_RE.sub(lambda m: _TEX_ESCAPES[m.group()], str(value or ""))
    return _UNICODE_MATH_RE.sub(lambda m: _UNICODE_MATH[m.group()], out)


def url_escape(value) -> str:
    # Inside \href the URL is read verbatim-ish; only these break it.
    return str(value or "").replace("\\", "").replace("%", r"\%").replace("#", r"\#").replace("{", "").replace("}", "")


def marker_name(title) -> str:
    name = re.sub(r"[^A-Z0-9]+", "_", str(title or "").upper()).strip("_")
    return name or "SECTION"


_BOLD_MD_RE = re.compile(r"\*\*(.+?)\*\*")


def rich_text(value) -> str:
    """Escape for LaTeX, then turn **bold** markers into \\textbf{...}."""
    escaped = _BOLD_MD_RE.sub(lambda m: r"\textbf{" + m.group(1) + "}", tex_escape(value))
    return escaped.replace("**", "")  # drop any unpaired markers


_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    block_start_string="((*",
    block_end_string="*))",
    variable_start_string="((((",
    variable_end_string="))))",
    comment_start_string="((#",
    comment_end_string="#))",
    trim_blocks=True,
    lstrip_blocks=True,
    autoescape=False,
    undefined=StrictUndefined,
)
_env.filters.update(tex=tex_escape, url=url_escape, rich=rich_text)

SECTION_TYPES = {"entries", "skills", "bullets", "paragraph"}


def normalize_resume(data: dict) -> dict:
    """Make the LLM's JSON safe for the template: fill defaults, drop junk, dedupe markers."""

    def s(v):
        return str(v).strip() if v is not None else ""

    def plain(v):  # fields rendered without bold support
        return s(v).replace("**", "")

    def lst(v):
        return [s(x) for x in v if s(x)] if isinstance(v, list) else []

    def dicts(v):
        return [x for x in v if isinstance(x, dict)] if isinstance(v, list) else []

    contact = []
    for c in dicts(data.get("contact")):
        text, url = plain(c.get("text")), s(c.get("url"))
        if text or url:
            contact.append({"text": text or url, "url": url})

    sections, used = [], {"HEADER"}
    for sec in dicts(data.get("sections")):
        title = plain(sec.get("title")) or "Additional"
        kind = s(sec.get("type")).lower()
        out = {"title": title, "type": kind if kind in SECTION_TYPES else "bullets"}
        if out["type"] == "entries":
            entries = [
                {
                    "title": plain(e.get("title")),
                    "date": plain(e.get("date")),
                    "subtitle": plain(e.get("subtitle")),
                    "meta": plain(e.get("meta")),
                    "bullets": lst(e.get("bullets")),
                }
                for e in dicts(sec.get("entries"))
            ]
            out["entries"] = [e for e in entries if any(e.values())]
            filled = bool(out["entries"])
        elif out["type"] == "skills":
            out["rows"] = [
                {"label": plain(r.get("label")), "value": s(r.get("value"))}
                for r in dicts(sec.get("rows"))
                if s(r.get("label")) or s(r.get("value"))
            ]
            filled = bool(out["rows"])
        elif out["type"] == "paragraph":
            out["text"] = s(sec.get("text"))
            filled = bool(out["text"])
        else:
            out["items"] = lst(sec.get("items"))
            filled = bool(out["items"])
        if not filled:
            continue
        base = marker_name(title)
        name, n = base, 2
        while name in used:
            name, n = f"{base}_{n}", n + 1
        used.add(name)
        out["marker"] = name
        sections.append(out)

    return {
        "name": plain(data.get("name")) or "Your Name",
        "headline": plain(data.get("headline")),
        "contact": contact,
        "sections": sections,
    }


def render_resume(data: dict, fit: int = 0, style: dict | None = None) -> str:
    from .style import FONT_SPECS, MODERN

    st = style or MODERN
    tex = _env.get_template("resume.tex.j2").render(
        r=normalize_resume(data), st=st, font_file=FONT_SPECS.get(st.get("font"), "texgyreheros")
    )
    return tighten(re.sub(r"\n{3,}", "\n\n", tex), fit)


# Ever-tighter versions of the preamble, used to keep a rebuilt resume on as many pages as
# the uploaded PDF had. Level 0 is the template as rendered; margins shrink relative to it.
_FIT_LEVELS = [
    {},
    {"margin": 0.9, "linespread": 0.97, "title": "{4pt}{2pt}"},
    {"margin": 0.8, "linespread": 0.94, "title": "{3pt}{2pt}"},
    {"margin": 0.7, "linespread": 0.92, "title": "{2pt}{1pt}", "scale": "0.95"},
    {"margin": 0.6, "linespread": 0.9, "title": "{2pt}{1pt}", "scale": "0.9"},
]
MAX_FIT = len(_FIT_LEVELS) - 1


def tighten(tex: str, level: int) -> str:
    """Shrink margins, line spacing, section gaps and (last) font size. Preamble only."""
    knobs = _FIT_LEVELS[max(0, min(level, MAX_FIT))]
    if not knobs:
        return tex
    head, sep, rest = tex.partition("\\begin{document}")

    def margins(m):
        parts = []
        for kv in m.group(1).split(","):
            k, _, v = kv.partition("=")
            num = re.match(r"([\d.]+)in$", v.strip())
            parts.append(f"{k}={max(0.2, float(num.group(1)) * knobs['margin']):.2f}in" if num else kv)
        return "\\usepackage[" + ",".join(parts) + "]{geometry}"

    head = re.sub(r"\\usepackage\[([^\]]*)\]\{geometry\}", margins, head, count=1)
    base = re.search(r"\\linespread\{([\d.]+)\}", head)
    if base:
        value = float(base.group(1)) * knobs["linespread"]
        head = head[: base.start()] + f"\\linespread{{{value:.3f}}}" + head[base.end() :]
    head = re.sub(r"(\\titlespacing\*\{\\section\}\{0pt\})\{[^}]*\}\{[^}]*\}", lambda m: m.group(1) + knobs["title"], head, count=1)
    if "scale" in knobs:
        head = head.replace("Scale=1.0,", f"Scale={knobs['scale']},", 1)
    return head + sep + rest


# ---------------------------------------------------------------- splitting
#
# A resume is split into (head, body, tail) with head + body + tail == tex, character for
# character. Only the body is ever shown to the AI, and edits are applied as small
# find/replace patches, so everything the user didn't ask to change stays byte-identical.


class ValidationError(Exception):
    pass


def _uncommented(tex: str, pattern: str) -> list[re.Match]:
    """Matches of `pattern` that are not inside a % comment."""
    found = []
    for m in re.finditer(pattern, tex):
        line_start = tex.rfind("\n", 0, m.start()) + 1
        before = tex[line_start : m.start()]
        if not re.search(r"(?<!\\)%", before):
            found.append(m)
    return found


def split_tex(tex: str) -> tuple[str, str, str]:
    """Return (locked_head, editable_body, locked_tail), with head + body + tail == tex.

    Resumes built from our template use %%BODY_START / %%BODY_END marker lines. Any other
    LaTeX file (an uploaded .tex) is split at \\begin{document} / \\end{document}, so its
    preamble — layout, fonts, macros — is locked.
    """
    a = re.search(rf"^{BODY_START}[ \t]*$", tex, re.M)
    b = re.search(rf"^{BODY_END}[ \t]*$", tex, re.M)
    if a and b and b.start() > a.end():
        return tex[: a.end()], tex[a.end() : b.start()], tex[b.start() :]

    begins = _uncommented(tex, r"\\begin\s*\{document\}")
    ends = _uncommented(tex, r"\\end\s*\{document\}")
    if not begins or not ends or ends[-1].start() < begins[0].end():
        raise ValidationError("This LaTeX file has no \\begin{document} ... \\end{document}")
    start, end = begins[0].end(), ends[-1].start()
    return tex[:start], tex[start:end], tex[end:]


def join_tex(head: str, body: str, tail: str) -> str:
    return head + body + tail


_JSON_ESCAPE_DAMAGE = [
    # Models sometimes write "\begin" inside JSON without doubling the backslash, which JSON
    # decodes as a control character: \b -> backspace, \f -> form feed, \t -> tab, \r -> CR.
    (re.compile("\x08"), r"\\b"),
    (re.compile("\x0c"), r"\\f"),
    (re.compile("\t(?=[a-zA-Z])"), r"\\t"),
    (re.compile("\r(?=[a-zA-Z])"), r"\\r"),
]


def repair_json_escapes(text: str) -> str:
    for pattern, replacement in _JSON_ESCAPE_DAMAGE:
        text = pattern.sub(replacement, text)
    return text


# ---------------------------------------------------------------- applying edits


def _loose_pattern(text: str) -> re.Pattern:
    # Same text, but any run of whitespace may differ (models often re-indent what they copy).
    parts = [re.escape(p) for p in text.split()]
    return re.compile(r"\s+".join(parts))


def apply_edits(body: str, edits) -> str:
    """Apply [{"find": ..., "replace": ...}] patches in order. Each "find" must match exactly
    one place in the body; everything outside the matched spans is left untouched."""
    if not isinstance(edits, list):
        raise ValidationError('"edits" must be a list')
    for i, edit in enumerate(edits, 1):
        if not isinstance(edit, dict):
            raise ValidationError(f"Edit {i} is not an object")
        find = repair_json_escapes(str(edit.get("find") or ""))
        replace = repair_json_escapes(str(edit.get("replace") or ""))
        if not find.strip():
            raise ValidationError(f"Edit {i} has an empty \"find\"")

        count = body.count(find)
        if count == 1:
            body = body.replace(find, replace, 1)
            continue
        if count > 1:
            raise ValidationError(
                f"Edit {i}: the \"find\" text appears {count} times. Include more surrounding lines so it matches once."
            )
        matches = list(_loose_pattern(find).finditer(body))
        if len(matches) != 1:
            preview = find.strip().splitlines()[0][:80]
            raise ValidationError(
                f"Edit {i}: the \"find\" text was not found exactly once in the body (starts with: {preview!r}). "
                "Copy it character for character from the current body."
            )
        m = matches[0]
        body = body[: m.start()] + replace + body[m.end() :]
    return body


# ---------------------------------------------------------------- validation

FORBIDDEN = [
    "input", "include", "write", "write18", "immediate", "openout", "openin", "read",
    "def", "edef", "gdef", "xdef", "let", "newcommand", "renewcommand", "providecommand",
    "usepackage", "RequirePackage", "documentclass", "catcode", "csname", "endcsname",
    "makeatletter", "special", "directlua", "ShellEscape", "includegraphics", "verbatiminput",
    "lstinputlisting", "loop", "repeat", "afterassignment", "expandafter",
]
# Harmless formatting commands the model may use even if the body didn't have them yet.
SAFE_EXTRA = {
    "textbf", "textit", "emph", "underline", "href", "small", "footnotesize", "item",
    "section", "resumeItem", "resumeSubheading", "resumeItemListStart", "resumeItemListEnd",
    "resumeSkillsStart", "resumeSkillsEnd", "resumeSkill", "vspace", "textasciitilde", "textasciicircum", "textbackslash",
    "textbar", "ldots", "sim", "approx", "rightarrow", "leftarrow", "geq", "leq", "times", "pm", "textendash", "textemdash", "quad", "hfill", "newline", "begin", "end",
}
CMD_RE = re.compile(r"\\([A-Za-z@]+)")
ENV_RE = re.compile(r"\\(begin|end)\s*\{([^}]*)\}")
NEWENV_RE = re.compile(r"\\(?:re)?newenvironment\s*\{([^}]*)\}|\\(?:New|Renew)DocumentEnvironment\s*\{([^}]*)\}")
ALLOWED_ENVS = {"center", "itemize", "tabular*", "tabular", "tabularx"}


def _markers(body: str) -> list[tuple[str, str]]:
    return MARKER_RE.findall(body)


def _check_markers(body: str, require_header: bool) -> list[str]:
    marks = _markers(body)
    if not marks:
        raise ValidationError("All %%BEGIN/%%END section markers were removed")
    stack, names = [], []
    for kind, name in marks:
        if kind == "BEGIN":
            if stack:
                raise ValidationError(f"Section {name} starts inside section {stack[-1]}")
            stack.append(name)
            names.append(name)
        else:
            if not stack or stack[-1] != name:
                raise ValidationError(f"%%END:{name} has no matching %%BEGIN:{name}")
            stack.pop()
    if stack:
        raise ValidationError(f"Section {stack[-1]} is missing its %%END marker")
    if len(names) != len(set(names)):
        raise ValidationError("A section marker appears more than once")
    if require_header and "HEADER" not in names:
        raise ValidationError("The HEADER section was removed")
    return names


def _check_braces(body: str) -> None:
    depth = 0
    i = 0
    while i < len(body):
        c = body[i]
        if c == "\\":
            i += 2  # skip escaped char (\{, \}, \\, \%)
            continue
        if c == "%":  # comment until end of line
            nl = body.find("\n", i)
            i = len(body) if nl == -1 else nl
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth < 0:
                raise ValidationError("Unbalanced braces: extra '}'")
        i += 1
    if depth:
        raise ValidationError(f"Unbalanced braces: {depth} unclosed '{{'")


def _strip_comments(text: str) -> str:
    return re.sub(r"(?<!\\)%.*", "", text)


def _check_envs(body: str, allowed: set[str]) -> None:
    stack = []
    for kind, env in ENV_RE.findall(_strip_comments(body)):
        env = env.strip()
        if env not in allowed:
            raise ValidationError(f"Environment '{env}' is not allowed")
        if kind == "begin":
            stack.append(env)
        elif not stack or stack.pop() != env:
            raise ValidationError(f"\\end{{{env}}} does not match its \\begin")
    if stack:
        raise ValidationError(f"\\begin{{{stack[-1]}}} is never closed")


def _passes(check, *args) -> bool:
    try:
        check(*args)
        return True
    except ValidationError:
        return False


def validate_body(old_body: str, new_body: str, head: str = "") -> None:
    """Reject edits that could break the document. Checks are relative to the old body, so a
    user's own LaTeX (which may use any command or environment) is accepted as it is, and only
    what the edit *adds* is held to the rules."""
    if not new_body or not new_body.strip():
        raise ValidationError("Returned body is empty")
    if BODY_START in new_body or BODY_END in new_body:
        raise ValidationError("Body must not contain %%BODY_START/%%BODY_END")
    if _uncommented(new_body, r"\\(begin|end)\s*\{document\}"):
        raise ValidationError("Body must not contain \\begin{document} or \\end{document}")

    if _markers(old_body):
        _check_markers(new_body, require_header="HEADER" in {n for _, n in _markers(old_body)})

    old_cmds = CMD_RE.findall(_strip_comments(old_body))
    new_cmds = CMD_RE.findall(_strip_comments(new_body))
    added_forbidden = sorted(c for c in set(FORBIDDEN) if new_cmds.count(c) > old_cmds.count(c))
    if added_forbidden:
        raise ValidationError(f"Forbidden command(s) used: {', '.join(added_forbidden)}")
    # Commands already in the body, or defined/used in the locked preamble, are fine to reuse.
    allowed = set(old_cmds) | set(CMD_RE.findall(_strip_comments(head))) | SAFE_EXTRA
    unknown = set(new_cmds) - allowed
    if unknown:
        raise ValidationError(
            f"New LaTeX command(s) not present in the resume: {', '.join(sorted(unknown))}"
        )

    if _passes(_check_braces, old_body):
        _check_braces(new_body)
    envs = (
        ALLOWED_ENVS
        | {e.strip() for _, e in ENV_RE.findall(_strip_comments(old_body))}
        | {a or b for a, b in NEWENV_RE.findall(head)}
    )
    if _passes(_check_envs, old_body, envs):
        _check_envs(new_body, envs)
