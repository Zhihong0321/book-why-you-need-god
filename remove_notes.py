"""
remove_notes.py
---------------
Removes all //// NOTE //// ... //// END NOTE //// blocks
from every restructured/*_R.md file.
"""

import re
from pathlib import Path

BASE_DIR     = Path(__file__).parent
RESTRUCTURED = BASE_DIR / "restructured"

NOTE_PATTERN = re.compile(
    r'\n?//// NOTE ////.*?//// END NOTE ////\n?',
    flags=re.DOTALL
)

def main():
    files = sorted(RESTRUCTURED.glob("*_R.md"))
    print(f"Scanning {len(files)} files...\n")

    total_removed = 0

    for f in files:
        original = f.read_text(encoding="utf-8")
        cleaned, count = NOTE_PATTERN.subn("", original)

        if count:
            f.write_text(cleaned, encoding="utf-8")
            print(f"  ✅  {f.name:<55} {count} note(s) removed")
            total_removed += count
        else:
            print(f"  —   {f.name:<55} clean")

    print(f"\nDone. {total_removed} note block(s) removed across {len(files)} files.")

if __name__ == "__main__":
    main()
