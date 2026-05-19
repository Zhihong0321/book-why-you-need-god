"""
combine_manuscript.py
---------------------
Combines all chapters into manuscripts in reading order.
- Reads PART1_*/PART2_*/P0_*/APP_* .md files from /restructured/.
- Strips tool-output blocks (header, RESTRUCTURE SUMMARY, REFERENCE BLOCK).
- Auto-increments version based on existing R{nn}_PART1.md files.
- Outputs TWO files per run:
    R{nn}_PART1.md  (卷首 + 第一部 + 最后的抵抗 + 过渡章)
    R{nn}_PART2.md  (第二部 + 附录)
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
# Tuple: (uid, filename, part_marker_before, output_file)
#   part_marker_before = None | "PART1" | "PART2" | "APPENDIX"
#   output_file = "PART1" | "PART2"
CHAPTERS = [
    # ─── 卷首 ───
    ("TOCNT", "P0_01_table_content.md",             None,       "PART1"),
    ("CAST",  "P0_02_cast_of_contributors.md",      None,       "PART1"),
    ("INTRO", "P0_03_front_note.md",                None,       "PART1"),
    ("LNSML", "P0_04_lens_manual.md",               None,       "PART1"),

    # ─── 第一部：理性对话 ───
    ("NDEXP", "PART1_01_nde_research_report.md",    "PART1",    "PART1"),
    ("ONEGD", "PART1_02_onegod.md",                 None,       "PART1"),
    ("MFPRT", "PART1_03_messianic_fingerprint.md",  None,       "PART1"),
    ("RSDLT", "PART1_04_resurrection_delta.md",     None,       "PART1"),
    ("CMD10", "PART1_05_ten_commandments.md",       None,       "PART1"),
    ("GDSIG", "PART1_06_god_signature.md",          None,       "PART1"),
    ("BPRSC", "PART1_07_bible_prescience.md",       None,       "PART1"),
    ("ROADS", "PART1_08_all_roads_same_address.md", None,       "PART1"),
    ("UNVRS", "PART1_09_universe_is_yours.md",      None,       "PART1"),
    ("FNLQA", "PART1_10_final_resistance_QA.md",    None,       "PART1"),
    ("P1END", "PART1_11_ending.md",                 None,       "PART1"),

    # ─── 第二部：灵魂对话 ───
    ("FQSTN", "PART2_01_final_question.md",         "PART2",    "PART2"),
    ("FRGIV", "PART2_02_why_not_just_forgive.md",   None,       "PART2"),
    ("SNNER", "PART2_03_not_a_sinner.md",           None,       "PART2"),
    ("SELRD", "PART2_04_why_i_cant_redeem_myself.md", None,     "PART2"),
    ("SLJES", "PART2_05_soul_and_jesus.md",         None,       "PART2"),
    ("JSAVE", "PART2_06_why_jesus_can_save_all.md", None,       "PART2"),
    ("COGST", "PART2_07_good_still_sinned.md",      None,       "PART2"),
    ("ETERN", "PART2_08_eternal_punishment.md",     None,       "PART2"),
    ("RSRCT", "PART2_09_jesus_resurrection.md",     None,       "PART2"),
    ("RSPND", "PART2_10_final_judgement.md",        None,       "PART2"),

    # ─── 彩蛋 | 附录（不承担论证重量） ───
    ("BLDNA", "APP_01_bible_dna.md",                "APPENDIX", "PART2"),
    ("GODMG", "APP_02_message_to_non_believer.md",  None,       "PART2"),
]


# ── Version auto-increment ─────────────────────────────────────────────
def next_version_num() -> int:
    nums = []
    # Check both old combined_manuscript_r*.md and new R*_PART1.md patterns
    for p in BASE_DIR.glob("combined_manuscript_r*.md"):
        m = re.search(r"_r(\d+)\.md$", p.name)
        if m:
            nums.append(int(m.group(1)))
    for p in BASE_DIR.glob("R*_PART1.md"):
        m = re.search(r"^R(\d+)_PART1\.md$", p.name)
        if m:
            nums.append(int(m.group(1)))
    return (max(nums) + 1) if nums else 1


# ── Strip tool-output blocks from chapter files ──────────────────────
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
    tag    = ✅ / ❌ for the summary table
    """
    path = RESTRUCTURED / filename

    if path.exists():
        return filename, "✅", clean(path.read_text(encoding="utf-8"))
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
    ver = next_version_num()
    out_part1 = BASE_DIR / f"R{ver:02d}_PART1.md"
    out_part2 = BASE_DIR / f"R{ver:02d}_PART2.md"

    rows = []
    parts1 = [
        f"# 你不是不需要神，而是……\n\n"
        f"> 第一部 · `R{ver:02d}_PART1.md`\n\n"
        f"---\n"
    ]
    parts2 = [
        f"# 你不是不需要神，而是……\n\n"
        f"> 第二部 · `R{ver:02d}_PART2.md`\n\n"
        f"---\n"
    ]

    for n, (uid, filename, part_marker, output_file) in enumerate(CHAPTERS, 1):
        # Determine which list to append to
        target = parts1 if output_file == "PART1" else parts2

        # Insert Part header before the chapter if specified
        if part_marker == "PART1":
            target.append(PART1_HEADER)
        elif part_marker == "PART2":
            target.append(PART2_HEADER)
        elif part_marker == "APPENDIX":
            target.append(APPENDIX_HEADER)

        source, tag, content = resolve(uid, filename)
        target.append(divider(n, uid, source) + content)
        rows.append((n, uid, filename, tag, output_file))

    out_part1.write_text("\n".join(parts1), encoding="utf-8")
    out_part2.write_text("\n".join(parts2), encoding="utf-8")

    # ── Build log ──────────────────────────────────────────────────────
    sep = "=" * 64
    print(f"\n{sep}")
    print(f"  COMBINED MANUSCRIPT BUILT")
    print(f"{sep}")
    print(f"  Output 1: {out_part1.name}  ({out_part1.stat().st_size:,} bytes)")
    print(f"  Output 2: {out_part2.name}  ({out_part2.stat().st_size:,} bytes)")
    print(f"  Chapters: {len(CHAPTERS)}")
    print(f"{sep}\n")
    print(f"  {'#':>3}  {'UID':<6}  {'File':<48}  {'Output':<8}  Status")
    print(f"  {'─'*3}  {'─'*6}  {'─'*48}  {'─'*8}  {'─'*10}")
    for n, uid, filename, tag, output_file in rows:
        print(f"  {n:>3}. [{uid}]  {filename:<48}  {output_file:<8}  {tag}")
    print(f"\n{sep}\n")


if __name__ == "__main__":
    main()
