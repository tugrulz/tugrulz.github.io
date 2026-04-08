#!/usr/bin/env python3
"""
Fetch arXiv abstracts and generate TL;DRs for Turullab research page.

Usage:
    python script/fetch_abstracts.py

Requirements:
    pip install anthropic requests

Environment:
    ANTHROPIC_API_KEY — required for TL;DR generation.
    If not set, abstracts are fetched but TL;DRs are left empty.

Output:
    assets/js/papers-data.js  (auto-generated, commit this file)

Re-run whenever you add new papers to research.md. Existing TL;DRs are
cached and only regenerated if the abstract has changed.
"""

import json
import os
import re
import sys
import time
import xml.etree.ElementTree as ET

import requests

RESEARCH_MD  = "research.md"
OUTPUT_JS    = "assets/js/papers-data.js"
ARXIV_API    = "https://export.arxiv.org/api/query"
ARXIV_ID_RE  = re.compile(r"arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5}(?:v\d+)?)")
LI_RE        = re.compile(r'<li><a href="([^"]+)">(.*?)</a>', re.DOTALL)


def extract_papers(md_path: str) -> dict[str, dict]:
    """Return {arxiv_id: {title, url}} for every arXiv link in research.md."""
    with open(md_path) as f:
        content = f.read()
    papers = {}
    for m in LI_RE.finditer(content):
        url   = m.group(1)
        title = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        id_m  = ARXIV_ID_RE.search(url)
        if not id_m:
            continue
        arxiv_id = re.sub(r"v\d+$", "", id_m.group(1))
        papers[arxiv_id] = {"title": title, "url": url}
    return papers


def fetch_abstracts(arxiv_ids: list[str]) -> dict[str, str]:
    """Batch-fetch abstracts from the arXiv API. Returns {arxiv_id: abstract}."""
    resp = requests.get(
        ARXIV_API,
        params={"id_list": ",".join(arxiv_ids), "max_results": len(arxiv_ids)},
        timeout=30,
    )
    resp.raise_for_status()
    ns   = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(resp.text)
    out  = {}
    for entry in root.findall("atom:entry", ns):
        id_url = entry.find("atom:id", ns).text or ""
        id_m   = re.search(r"arxiv\.org/abs/(.+)", id_url)
        if not id_m:
            continue
        aid      = re.sub(r"v\d+$", "", id_m.group(1))
        abstract = entry.find("atom:summary", ns).text or ""
        out[aid] = re.sub(r"\s+", " ", abstract).strip()
    return out


def generate_tldr(client, title: str, abstract: str) -> str:
    """Ask Claude for a one-sentence contribution summary."""
    msg = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=120,
        messages=[{
            "role": "user",
            "content": (
                "Write a single sentence TL;DR for this academic paper. "
                "Be specific about the main finding or contribution. "
                "Do not start with 'This paper' or 'We'. "
                "Maximum 25 words.\n\n"
                f"Title: {title}\n\nAbstract: {abstract}"
            ),
        }],
    )
    return msg.content[0].text.strip().rstrip(".")


def load_existing(js_path: str) -> dict:
    """Parse existing papers-data.js to recover cached entries."""
    if not os.path.exists(js_path):
        return {}
    with open(js_path) as f:
        content = f.read()
    m = re.search(r"window\.__PAPERS__\s*=\s*(\{.*\})", content, re.DOTALL)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}


def main() -> None:
    print(f"Reading papers from {RESEARCH_MD} …")
    papers = extract_papers(RESEARCH_MD)
    if not papers:
        print("No arXiv IDs found — nothing to do.")
        sys.exit(0)
    print(f"  Found {len(papers)} papers: {list(papers)}")

    existing = load_existing(OUTPUT_JS)
    print(f"  Loaded {len(existing)} cached entries from {OUTPUT_JS}")

    print("Fetching abstracts from arXiv …")
    abstracts = fetch_abstracts(list(papers))
    print(f"  Got {len(abstracts)} abstracts")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    client  = None
    if api_key:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
    else:
        print("  ANTHROPIC_API_KEY not set — skipping TL;DR generation")

    output = dict(existing)

    for arxiv_id, abstract in abstracts.items():
        cached = existing.get(arxiv_id, {})
        if cached.get("abstract") == abstract and cached.get("tldr"):
            print(f"  {arxiv_id}: cached ✓")
            output[arxiv_id] = cached
            continue

        tldr = ""
        if client:
            title = papers[arxiv_id]["title"]
            print(f"  {arxiv_id}: generating TL;DR …")
            try:
                tldr = generate_tldr(client, title, abstract)
                print(f"    → {tldr}")
                time.sleep(0.4)          # stay well within rate limits
            except Exception as exc:
                print(f"    Error: {exc}")
        else:
            print(f"  {arxiv_id}: abstract only (no API key)")

        output[arxiv_id] = {"abstract": abstract, "tldr": tldr}

    js = (
        "// Auto-generated by script/fetch_abstracts.py — do not edit manually.\n"
        "// Re-run: python script/fetch_abstracts.py\n"
        f"window.__PAPERS__ = {json.dumps(output, indent=2, ensure_ascii=False)};\n"
    )
    with open(OUTPUT_JS, "w") as f:
        f.write(js)

    print(f"\nWrote {len(output)} entries → {OUTPUT_JS}")


if __name__ == "__main__":
    main()
