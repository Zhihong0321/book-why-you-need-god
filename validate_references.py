"""
validate_references.py
----------------------
Scans all restructured/*_R.md files for reference links [XXXXX-NNN].
Checks each link exists in BOOK_REFERENCES.md.
Reports: broken links, orphaned definitions, summary.
"""

import re
from pathlib import Path
from collections import defaultdict

# ── Paths ──────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).parent
RESTRUCTURED    = BASE_DIR / "restructured"
REFERENCES_FILE = BASE_DIR / "BOOK_REFERENCES.md"

# ── Pattern: [XXXXX-NNN] ───────────────────────────────────────────────
REF_ID = re.compile(r'\[([A-Z]{5}-\d{3})\]')


def get_defined(ref_file: Path) -> set:
    """Return all reference IDs that are defined in BOOK_REFERENCES.md."""
    defined = set()
    if not ref_file.exists():
        return defined
    for line in ref_file.read_text(encoding="utf-8").splitlines():
        m = re.match(r'^\[([A-Z]{5}-\d{3})\]$', line.strip())
        if m:
            defined.add(m.group(1))
    return defined


def strip_ref_block(text: str) -> str:
    """Remove the REFERENCE BLOCK section at the end of a restructured file
    so those IDs are not counted as 'used' in the chapter content."""
    marker = "REFERENCE BLOCK — APPEND TO BOOK_REFERENCES.md"
    idx = text.find(marker)
    return text[:idx] if idx != -1 else text


def get_used(restructured_dir: Path) -> tuple[dict, set]:
    """Return (used_by_file, all_used) scanning only chapter content."""
    by_file: dict[str, set] = defaultdict(set)
    all_used: set = set()

    if not restructured_dir.exists():
        return by_file, all_used

    for f in sorted(restructured_dir.glob("*_R.md")):
        content = strip_ref_block(f.read_text(encoding="utf-8"))
        for ref in REF_ID.findall(content):
            by_file[f.name].add(ref)
            all_used.add(ref)

    return by_file, all_used


# ── Report ─────────────────────────────────────────────────────────────
def main():
    sep  = "=" * 62
    sep2 = "-" * 62

    print(sep)
    print("  REFERENCE VALIDATION REPORT")
    print(sep)
    print(f"  Chapters : {RESTRUCTURED}")
    print(f"  Ref file : {REFERENCES_FILE}")
    print(sep2)

    defined              = get_defined(REFERENCES_FILE)
    used_by_file, all_used = get_used(RESTRUCTURED)
    files                = list(RESTRUCTURED.glob("*_R.md")) if RESTRUCTURED.exists() else []

    print(f"  Files scanned          : {len(files)}")
    print(f"  Refs defined           : {len(defined)}")
    print(f"  Refs used (unique)     : {len(all_used)}")

    broken   = all_used - defined     # used in chapter, missing from ref file
    orphaned = defined  - all_used    # in ref file, never cited in any chapter

    # ── Broken links ───────────────────────────────────────────────────
    print()
    print(sep)
    if not broken:
        print("  ✅  BROKEN LINKS : none")
    else:
        print(f"  ❌  BROKEN LINKS : {len(broken)}  (used in chapters but NOT in BOOK_REFERENCES.md)")
        print(sep2)
        # group by file
        by_broken: dict[str, list] = defaultdict(list)
        for fname, refs in used_by_file.items():
            for r in refs:
                if r in broken:
                    by_broken[fname].append(r)
        for fname in sorted(by_broken):
            print(f"\n  📄  {fname}")
            for ref in sorted(by_broken[fname]):
                print(f"        ❌  [{ref}]")

    # ── Orphaned ────────────────────────────────────────────────────────
    print()
    print(sep)
    if not orphaned:
        print("  ✅  ORPHANED REFS : none")
    else:
        print(f"  ⚠️   ORPHANED REFS : {len(orphaned)}  (defined in BOOK_REFERENCES.md but never cited)")
        print(sep2)
        for ref in sorted(orphaned):
            print(f"        ⚠️   [{ref}]")

    # ── Summary ─────────────────────────────────────────────────────────
    print()
    print(sep)
    print("  SUMMARY")
    print(sep2)
    print(f"  Defined in BOOK_REFERENCES.md  : {len(defined)}")
    print(f"  Used across all chapters       : {len(all_used)}")
    print(f"  ❌  Broken  (missing def)      : {len(broken)}")
    print(f"  ⚠️   Orphaned (unused def)      : {len(orphaned)}")
    print()
    if not broken and not orphaned:
        print("  STATUS : ✅  ALL REFERENCES VALID")
    elif broken:
        print("  STATUS : ❌  FIX REQUIRED — add missing refs to BOOK_REFERENCES.md")
    else:
        print("  STATUS : ⚠️   MINOR — orphaned refs can be cleaned up")
    print(sep)


if __name__ == "__main__":
    main()
