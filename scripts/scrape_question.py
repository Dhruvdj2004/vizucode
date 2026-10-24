#!/usr/bin/env python3
"""Scrape a DSA question from LeetCode, GeeksforGeeks or CodeChef (or any page, best effort).

Used by the teacher panel (server/teacher.ts) to pre-fill the request form.
Prints one JSON object to stdout:
  {title, difficulty, category, description, examples: [{input, output, explanation}],
   constraints, tags, source, sourceUrl}
On failure prints {"error": "..."} and exits 1.

Needs: requests, beautifulsoup4  (pip install -r scripts/requirements-scraper.txt)
Usage: python3 scripts/scrape_question.py <url>
"""
import json
import re
import sys
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/129.0 Safari/537.36"}
TIMEOUT = 20

# Site tags -> VizuCode categories (first match wins, most specific first).
CATEGORY_RULES = [
    ("Linked List", "Linked List"), ("Trie", "Tries & Design"), ("Design", "Tries & Design"),
    ("Heap", "Heap / Priority Queue"), ("Priority Queue", "Heap / Priority Queue"),
    ("Backtracking", "Backtracking"), ("Dynamic Programming", "Dynamic Programming"),
    ("Graph", "Graphs"), ("Breadth-First Search", "Graphs"), ("Union Find", "Graphs"),
    ("Tree", "Trees"), ("Binary Tree", "Trees"), ("Binary Search Tree", "Trees"),
    ("Binary Search", "Binary Search"), ("Sliding Window", "Sliding Window"),
    ("Two Pointers", "Two Pointers"), ("Monotonic Stack", "Stack"), ("Stack", "Stack"),
    ("Interval", "Intervals"), ("Greedy", "Greedy"), ("Bit Manipulation", "Math & Bit Manipulation"),
    ("Math", "Math & Bit Manipulation"), ("String", "Strings"), ("Hash Table", "Arrays & Hashing"),
    ("Array", "Arrays & Hashing"),
]


def guess_category(tags):
    low = [t.lower() for t in tags]
    for key, cat in CATEGORY_RULES:
        if any(key.lower() in t for t in low):
            return cat
    return "Arrays & Hashing"


def norm_difficulty(d):
    d = (d or "").strip().lower()
    if d.startswith("e") or d in ("basic", "school"):
        return "Easy"
    if d.startswith("h"):
        return "Hard"
    return "Medium"


def clean(text):
    text = re.sub(r" ", " ", text or "")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_sections(text):
    """Split a plain-text statement into description / examples / constraints."""
    examples = []
    m = re.search(r"\n\s*Constraints?\s*:?\s*\n", text, flags=re.I)
    constraints = clean(text[m.end():]) if m else ""
    body = text[:m.start()] if m else text
    parts = re.split(r"\n\s*Example\s*\d+\s*:?\s*\n", "\n" + body, flags=re.I)
    if len(parts) == 1:  # GFG style: one "Examples:" heading, then repeated Input/Output blocks
        head = re.split(r"\n\s*Examples?\s*:?\s*\n", "\n" + body, maxsplit=1, flags=re.I)
        if len(head) == 2:
            parts = [head[0]] + re.split(r"(?=\bInput\s*:)", head[1], flags=re.I)
    description = clean(parts[0])
    for part in parts[1:]:
        ex = {"input": "", "output": "", "explanation": ""}
        for key, label in (("input", "Input"), ("output", "Output"), ("explanation", "Explanation")):
            mm = re.search(label + r"\s*:?\s*(.*?)(?=\n\s*(Input|Output|Explanation)\s*:|\Z)", part, flags=re.I | re.S)
            if mm:
                ex[key] = clean(mm.group(1))
        if ex["input"] or ex["output"]:
            examples.append(ex)
    return description, examples, constraints


def html_to_text(html):
    soup = BeautifulSoup(html or "", "html.parser")
    for sup in soup.find_all("sup"):          # 10<sup>4</sup> -> 10^4
        sup.replace_with("^" + sup.get_text())
    for br in soup.find_all("br"):
        br.replace_with("\n")
    for tag in soup.find_all(["p", "pre", "li", "div"]):
        tag.insert_after("\n")
    return clean(soup.get_text())


def leetcode(url):
    m = re.search(r"/problems/([^/?#]+)", url)
    if not m:
        raise ValueError("Couldn't find the problem name in this LeetCode link.")
    slug = m.group(1)
    q = """query q($s: String!) { question(titleSlug: $s) {
        questionFrontendId title difficulty content isPaidOnly
        topicTags { name } exampleTestcases } }"""
    r = requests.post("https://leetcode.com/graphql", json={"query": q, "variables": {"s": slug}},
                      headers={**UA, "Referer": url, "Content-Type": "application/json"}, timeout=TIMEOUT)
    r.raise_for_status()
    d = (r.json().get("data") or {}).get("question")
    if not d:
        raise ValueError("LeetCode didn't return this problem.")
    if d.get("isPaidOnly") and not d.get("content"):
        raise ValueError("This is a LeetCode Premium problem; its statement isn't public.")
    text = html_to_text(d.get("content"))
    description, examples, constraints = split_sections(text)
    tags = [t["name"] for t in d.get("topicTags") or []]
    return {
        "title": d["title"], "difficulty": norm_difficulty(d["difficulty"]),
        "category": guess_category(tags), "description": description, "examples": examples,
        "constraints": constraints, "tags": tags, "source": "LeetCode",
        "sourceUrl": f"https://leetcode.com/problems/{slug}/", "slug": slug,
        "number": d.get("questionFrontendId"),
    }


def find_key(obj, keys):
    """Depth-first search of nested JSON for the first value under any of `keys`."""
    if isinstance(obj, dict):
        for k in keys:
            if k in obj and obj[k]:
                return obj[k]
        for v in obj.values():
            found = find_key(v, keys)
            if found:
                return found
    elif isinstance(obj, list):
        for v in obj:
            found = find_key(v, keys)
            if found:
                return found
    return None


def gfg(url):
    r = requests.get(url, headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    title, statement, difficulty, tags = None, None, None, []
    nd = soup.find("script", id="__NEXT_DATA__")
    if nd and nd.string:
        data = json.loads(nd.string)
        # The problem itself lives under initialState.problemData; the rest of the page data is site chrome.
        data = find_key(data, ["probData"]) or find_key(data, ["problemData"]) or data
        title = find_key(data, ["problem_name"])
        statement = find_key(data, ["problem_question", "question"])
        difficulty = find_key(data, ["difficulty"])
        t = find_key(data, ["tags"])
        if isinstance(t, dict):
            tags = [x for v in t.values() if isinstance(v, list) for x in v if isinstance(x, str)]
        elif isinstance(t, list):
            tags = [x if isinstance(x, str) else str(x.get("name", "")) for x in t]
    if not statement:
        node = soup.select_one("[class*=problems_problem_content], [class*=problem-statement], article")
        statement = str(node) if node else ""
    if not title:
        h = soup.find("h1") or soup.find("title")
        title = h.get_text(strip=True) if h else "Untitled"
    text = html_to_text(statement) if "<" in (statement or "") else clean(statement)
    description, examples, constraints = split_sections(text)
    return {
        "title": re.sub(r"\s*\|\s*Practice.*$", "", title).strip(), "difficulty": norm_difficulty(str(difficulty)),
        "category": guess_category(tags), "description": description, "examples": examples,
        "constraints": constraints, "tags": tags, "source": "GeeksforGeeks", "sourceUrl": url,
    }


def codechef(url):
    m = re.search(r"/problems/([A-Za-z0-9_]+)", url)
    if not m:
        raise ValueError("Couldn't find the problem code in this CodeChef link.")
    code = m.group(1)
    r = requests.get(f"https://www.codechef.com/api/contests/PRACTICE/problems/{code}", headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    d = r.json()
    if d.get("status") not in (None, "success"):
        raise ValueError(d.get("message") or "CodeChef didn't return this problem.")
    comps = d.get("problemComponents") or {}
    statement = comps.get("statement") or d.get("body") or ""
    examples = []
    for tc in comps.get("sampleTestCases") or []:
        examples.append({"input": clean(tc.get("input", "")), "output": clean(tc.get("output", "")),
                         "explanation": clean(tc.get("explanation", ""))})
    text = html_to_text(statement) if "<" in statement else clean(statement)
    description, ex2, constraints = split_sections(text)
    if comps.get("constraints"):
        c = comps["constraints"]
        constraints = html_to_text(c) if "<" in c else clean(c)
    tags = [t.get("tag", t) if isinstance(t, dict) else str(t) for t in (d.get("user_tags") or d.get("tags") or [])]
    rating = d.get("difficulty_rating") or 0
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        rating = 0
    diff = "Easy" if rating and rating < 1400 else "Hard" if rating >= 2000 else "Medium"
    return {
        "title": d.get("problem_name") or code, "difficulty": diff, "category": guess_category(tags),
        "description": description, "examples": examples or ex2, "constraints": constraints,
        "tags": tags, "source": "CodeChef", "sourceUrl": f"https://www.codechef.com/problems/{code}",
    }


def generic(url):
    r = requests.get(url, headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()
    h = soup.find("h1") or soup.find("title")
    main = soup.find("main") or soup.find("article") or soup.body
    text = html_to_text(str(main)) if main else ""
    description, examples, constraints = split_sections(text[:8000])
    return {
        "title": h.get_text(strip=True) if h else "Untitled", "difficulty": "Medium",
        "category": "Arrays & Hashing", "description": description, "examples": examples,
        "constraints": constraints, "tags": [], "source": urlparse(url).netloc, "sourceUrl": url,
    }


def scrape(url):
    host = urlparse(url).netloc.lower()
    if "leetcode." in host:
        return leetcode(url)
    if "geeksforgeeks." in host:
        return gfg(url)
    if "codechef." in host:
        return codechef(url)
    return generic(url)


if __name__ == "__main__":
    if len(sys.argv) != 2 or not sys.argv[1].startswith(("http://", "https://")):
        print(json.dumps({"error": "Give one http(s) URL."}))
        sys.exit(1)
    try:
        print(json.dumps(scrape(sys.argv[1]), ensure_ascii=False))
    except Exception as e:  # report every failure as JSON so the server can show it
        print(json.dumps({"error": f"Couldn't read that page: {e}"}))
        sys.exit(1)
