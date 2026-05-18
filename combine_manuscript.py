"""
combine_manuscript.py
---------------------
Combines all chapters into one manuscript in reading order.
- Uses _R.md from /restructured/ when available, falls back to original.
- Strips tool-output blocks (header, RESTRUCTURE SUMMARY, REFERENCE BLOCK).
- Auto-increments version: combined_manuscript_r001.md → r002.md → ...
- Inserts Part 1 / Part 2 dividers in the output.
"""

from pathlib import Path
import re

BASE_DIR     = Path(__file__).parent
RESTRUCTURED = BASE_DIR / "restructured"

# ── Part markers (inserted between chapters) ───────────────────────────
PART1_HEADER = """

═══════════════════════════════════════════════════════════════════
# 第一部 | 理性对话
## 不再是信不信，而是知不知。
═══════════════════════════════════════════════════════════════════

"""

PART2_HEADER = """

═══════════════════════════════════════════════════════════════════
# 第二部 | 灵魂对话
## 以前死是灭亡，现在死是盼望的开始。
═══════════════════════════════════════════════════════════════════

"""

APPENDIX_HEADER = """

═══════════════════════════════════════════════════════════════════
# 彩蛋 | 附录
## 不承担论证重量，但值得一看。
═══════════════════════════════════════════════════════════════════

"""

# ── Chapter order ──────────────────────────────────────────────────────
# Tuple: (uid, filename, part_marker_before)
#   part_marker_before = None | "PART1" | "PART2"
CHAPTERS = [
    # ─── 卷首 ───
    ("TOCNT", "table_content.md",                      None),
    ("CAST",  "00_cast_of_contributors.md",            None),
    ("INTRO", "front_note.md",                         None),
    ("LNSML", "lens_manual.md",                        None),

    # ─── 第一部：理性对话 ───
    ("NDEXP", "nde_research_report.md",                "PART1"),
    ("ONEGD", "onegod.md",                             None),
    ("MFPRT", "messianic-fingerprint-audit-report.md", None),
    ("RSDLT", "08a_resurrection_delta.md",             None),
    ("CMD10", "10a_ten_commandments.md",               None),
    ("GDSIG", "10a2_god_signature.md",                 None),
    ("ROADS", "10_all_roads_same_address.md",          None),
    ("UNVRS", "03b_universe_is_yours.md",              None),
    ("FNLQA", "part1_final_resistance_QA.md",          None),
    ("P1END", "part1_ending.md",                       None),

    # ─── 第二部：灵魂对话 ───
    ("FQSTN", "final_question_to_answer.md",           "PART2"),
    ("FRGIV", "01_why_not_just_forgive.md",            None),
    ("SNNER", "02_i-am-not-a-sinner.md",              None),
    ("SELRD", "03_why_i_cant_redeem_myself.md",        None),
    ("SLJES", "04_soul_and_jesus.md",                  None),
    ("JSAVE", "05_why_jesus_can_save_all.md",          None),
    ("COGST", "06_good-still-sinned-but-evil-redeemed.md", None),
    ("ETERN", "07_eternal_punishment.md",              None),
    ("RSRCT", "08_jesus_resurrection.md",              None),
    ("RSPND", "09_why_must_i_face_final_judgement.md", None),

    # ─── 彩蛋 | 附录（不承担论证重量） ───
    ("BLDNA", "10b_bible_dna.md",                      "APPENDIX"),
    ("GODMG", "message_to_non_believer.md",            None),
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

    for n, (uid, filename, part_marker) in enumerate(CHAPTERS, 1):
        # Insert Part header before the chapter if specified
        if part_marker == "PART1":
            parts.append(PART1_HEADER)
        elif part_marker == "PART2":
            parts.append(PART2_HEADER)
        elif part_marker == "APPENDIX":
            parts.append(APPENDIX_HEADER)

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
        part_note = ""
        if n == 5:
            part_note = "  ◀ PART 1 START"
        elif n == 15:
            part_note = "  ◀ PART 2 START"
        print(f"  {n:>3}. [{uid}]  {filename:<48}  {tag}{part_note}")
    print(f"\n{sep}\n")


if __name__ == "__main__":
    main()
