# Demo Build Task List — Part 1

> Generate each chapter as a standalone HTML file in `/demo/chapters/`.
> Each file uses the starfield template with real content, mood zones, text effects, and transitions.
> Mark ✅ when complete, then proceed to next.

---

## Pre-Matter (Codex Template)

| # | UID | File | Output | Status |
|---|-----|------|--------|--------|
| 0a | TOCNT | P0_01_table_content.md | `demo/chapters/00a_toc.html` | ⬜ |
| 0b | CAST | P0_02_cast_of_contributors.md | `demo/chapters/00b_cast.html` | ⬜ |
| 0c | INTRO | P0_03_front_note.md | `demo/chapters/00c_intro.html` | ⬜ |
| 0d | LNSML | P0_04_lens_manual.md | `demo/chapters/00d_lens.html` | ⬜ |

---

## Part 1 — 灵魂是否存在 (Starfield Template)

| # | UID | File | Output | Mood Arc | Status |
|---|-----|------|--------|----------|--------|
| 1 | NDEXP | PART1_01_nde_research_report.md | `demo/chapters/01_ndexp.html` | calm → wonder → awe → weight | ✅ |
| 2 | ONEGD | PART1_02_onegod.md | `demo/chapters/02_onegd.html` | wonder → awe | ✅ |
| 3 | MFPRT | PART1_03_messianic_fingerprint.md | `demo/chapters/03_mfprt.html` | calm → awe | ✅ |
| 4 | RSDLT | PART1_04_resurrection_delta.md | `demo/chapters/04_rsdlt.html` | wonder → awe → weight | ⬜ |
| 5 | JESDC | PART1_04b_jesus_divine_claim.md | `demo/chapters/05_jesdc.html` | wonder → awe | ⬜ |
| 6 | CMD10 | PART1_05_ten_commandments.md | `demo/chapters/06_cmd10.html` | calm → awe | ⬜ |
| 7 | GDSIG | PART1_06_god_signature.md | `demo/chapters/07_gdsig.html` | wonder → awe | ⬜ |
| 8 | BPRSC | PART1_07_bible_prescience.md | `demo/chapters/08_bprsc.html` | calm → wonder → awe | ⬜ |
| 9 | ROADS | PART1_08_all_roads_same_address.md | `demo/chapters/09_roads.html` | wonder → awe → weight | ⬜ |
| 10 | UNVRS | PART1_09_universe_is_yours.md | `demo/chapters/10_unvrs.html` | calm → wonder | ⬜ |
| 11 | FNLQA | PART1_10_final_resistance_QA.md | `demo/chapters/11_fnlqa.html` | wonder → awe | ⬜ |
| 12 | P1END | PART1_11_ending.md | `demo/chapters/12_p1end.html` | awe → weight + Big Bang | ⬜ |

---

## Transitions

| Between | Type | Implemented In |
|---------|------|----------------|
| Each chapter within Part 1 | Lightspeed | End of each chapter HTML |
| P1END → Part 2 | Big Bang | End of `12_p1end.html` |

---

## Notes
- Each HTML file is self-contained (inline CSS + JS from preview.html template)
- Real content from `/restructured/` source files
- All `[CHAPTERUID-NNN]` references wrapped in interactive `ref-tag` spans
- Reference registry embedded per chapter
