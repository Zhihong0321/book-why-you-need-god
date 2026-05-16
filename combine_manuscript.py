"""
combine_manuscript.py
---------------------
Combines all chapters into one manuscript in reading order.
- Uses _R.md from /restructured/ when available, falls back to original.
- Strips tool-output blocks (header, RESTRUCTURE SUMMARY, REFERENCE BLOCK).
- Auto-increments version: combined_manuscript_r001.md → r002.md → ...
"""

from pathlib import Path
import re

BASE_DIR     = Path(__file__).parent
RESTRUCTURED = BASE_DIR / "restructured"

# ── Chapter order ──────────────────────────────────────────────────────
CHAPTERS = [
    ("TOCNT", "table_content.md"),
    ("CAST", "00_cast_of_contributors.md"),
    ("INTRO", "front_note.md"),
    ("LNSML", "lens_manual.md"),
    ("NDEXP", "nde_research_report.md"),
    ("ONEGD", "onegod.md"),
    ("MFPRT", "messianic-fingerprint-audit-report.md"),
    ("CMD10", "10a_ten_commandments.md"),
    ("BLDNA", "10b_bible_dna.md"),
    ("ROADS", "10_all_roads_same_address.md"),
    ("GODMG", "message_to_non_believer.md"),
    ("UNVRS", "03b_universe_is_yours.md"),
    ("FQSTN", "final_question_to_answer.md"),
    ("FRGIV", "01_why_not_just_forgive.md"),
    ("SNNER", "02_i-am-not-a-sinner.md"),
    ("SELRD", "03_why_i_cant_redeem_myself.md"),
    ("SLJES", "04_soul_and_jesus.md"),
    ("JSAVE", "05_why_jesus_can_save_all.md"),
    ("COGST", "06_good-still-sinned-but-evil-redeemed.md"),
    ("ETERN", "07_eternal_punishment.md"),
    ("RSRCT", "08_jesus_resurrection.md"),
    ("RSPND", "09_why_must_i_face_final_judgement.md"),
]


# ── Version auto-increment ─────────────────────────────────────────────
def next_version() -> Path:
    n = 1
    while (BASE_DIR / f"combined_manuscript_r{n:03d}.md").exists():
        n += 1
    return BASE_DIR / f"combined_manuscript_r{n:03d}.md"


# ── Strip tool-output blocks from _R.md files ─────────────────────────
def clean(text: str) -> str:
    SEP = r'[═]{10,}'          # matches ════...════ lines

    # 1. Remove the FILE / CHAPTER_UID header block at the very top
    text = re.sub(
        rf'^{SEP}\nFILE:.*?\nCHAPTER_UID:.*?\n{SEP}\n',
        '', text, flags=re.MULTILINE | re.DOTALL, count=1
    )

    # 2. Remove RESTRUCTURE SUMMARY block
    text = re.sub(
        rf'{SEP}\nRESTRUCTURE SUMMARY\n{SEP}.*?{SEP}\n',
        '', text, flags=re.DOTALL
    )

    # 3. Remove REFERENCE BLOCK and everything after it
    marker = "REFERENCE BLOCK — APPEND TO BOOK_REFERENCES.md"
    idx = text.find(marker)
    if idx != -1:
        # walk back to the ════ line before the marker
        pre = text.rfind('\n', 0, idx)
        pre = text.rfind('\n', 0, pre)
        text = text[:pre]

    return text.strip()


# ── Resolve source for each chapter ───────────────────────────────────
def resolve(uid: str, filename: str) -> tuple[str, str, str]:
    """Returns (label, tag, content).
    label  = display path shown in the build log
    tag    = ✅ / ⚠️  / ❌ for the summary table
    """
    stem = Path(filename).stem
    r_path = RESTRUCTURED / f"{stem}_R.md"
    o_path = BASE_DIR / filename

    if r_path.exists():
        return str(r_path.name), "✅ restructured", clean(r_path.read_text(encoding="utf-8"))
    elif o_path.exists():
        return filename, "⚠️  original (not restructured)", o_path.read_text(encoding="utf-8")
    else:
        return filename, "❌ MISSING", f"> ⚠️ FILE NOT FOUND: {filename}\n"


# ── Chapter divider ────────────────────────────────────────────────────
def divider(n: int, uid: str, source: str) -> str:
    return (
        f"\n\n{'─' * 64}\n"
        f"<!-- CH{n:02d} | {uid} | {source} -->\n"
        f"{'─' * 64}\n\n"
    )


# ── Main ───────────────────────────────────────────────────────────────
def main():
    output = next_version()
    rows   = []
    parts  = [
        f"# 你不是不需要神，而是……\n\n"
        f"> Combined Manuscript · `{output.name}`\n\n"
        f"---\n"
    ]

    for n, (uid, filename) in enumerate(CHAPTERS, 1):
        source, tag, content = resolve(uid, filename)
        parts.append(divider(n, uid, source) + content)
        rows.append((n, uid, filename, tag))

    output.write_text("\n".join(parts), encoding="utf-8")

    # ── Build log ──────────────────────────────────────────────────────
    sep = "=" * 64
    print(f"\n{sep}")
    print(f"  COMBINED MANUSCRIPT BUILT")
    print(f"{sep}")
    print(f"  Output  : {output.name}")
    print(f"  Size    : {output.stat().st_size:,} bytes")
    print(f"  Chapters: {len(CHAPTERS)}")
    print(f"{sep}\n")
    print(f"  {'#':>3}  {'UID':<6}  {'File':<48}  Status")
    print(f"  {'─'*3}  {'─'*6}  {'─'*48}  {'─'*20}")
    for n, uid, filename, tag in rows:
        print(f"  {n:>3}. [{uid}]  {filename:<48}  {tag}")
    print(f"\n{sep}\n")


if __name__ == "__main__":
    main()
