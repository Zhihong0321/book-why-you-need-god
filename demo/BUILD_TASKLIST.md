# Demo Build Task List

> Generate each chapter as a structured JSON file in `/demo/chapters/`.
> Each file follows the cinematic JSON schema with real content, mood zones, and reference registry.
> Mark ✅ when complete, then proceed to next.

---

## Pre-Matter (Codex Template)

| # | UID | File | Output | Status |
|---|-----|------|--------|--------|
| 0a | TOCNT | P0_01_table_content.md | `demo/chapters/00a_toc.json` | ✅ |
| 0b | CAST | P0_02_cast_of_contributors.md | `demo/chapters/00b_cast.json` | ✅ |
| 0c | INTRO | P0_03_front_note.md | `demo/chapters/00c_intro.json` | ✅ |

---

## Part 1 — 灵魂是否存在 (Starfield Template)

| # | UID | File | Output | Mood Arc | Status |
|---|-----|------|--------|----------|--------|
| 1 | NDEXP | PART1_01_nde_research_report.md | `demo/chapters/01_ndexp.json` | calm → wonder → awe → weight | ✅ |
| 2 | ONEGD | PART1_02_onegod.md | `demo/chapters/02_onegd.json` | wonder → awe | ✅ |
| 3 | MFPRT | PART1_03_messianic_fingerprint.md | `demo/chapters/03_mfprt.json` | calm → awe | ✅ |
| 4 | RSDLT | PART1_04_resurrection_delta.md | `demo/chapters/04_rsdlt.json` | wonder → awe → weight | ✅ |
| 5 | JESDC | PART1_04b_jesus_divine_claim.md | `demo/chapters/05_jesdc.json` | wonder → awe | ✅ |
| 6 | CMD10 | PART1_05_ten_commandments.md | `demo/chapters/06_cmd10.json` | calm → awe | ✅ |
| 7 | GDSIG | PART1_06_god_signature.md | `demo/chapters/07_gdsig.json` | wonder → awe | ✅ |
| 8 | BPRSC | PART1_07_bible_prescience.md | `demo/chapters/08_bprsc.json` | calm → wonder → awe | ✅ |
| 9 | ROADS | PART1_08_all_roads_same_address.md | `demo/chapters/09_roads.json` | wonder → awe → weight | ✅ |
| 10 | UNVRS | PART1_09_universe_is_yours.md | `demo/chapters/10_unvrs.json` | calm → wonder | ✅ |
| 11 | FNLQA | PART1_10_final_resistance_QA.md | `demo/chapters/11_fnlqa.json` | wonder → awe | ✅ |
| 12 | P1END | PART1_11_ending.md | `demo/chapters/12_p1end.json` | awe → weight + Big Bang | ✅ |

---

## Part 2 — 你该怎么回应 (Starfield Template)

| # | UID | File | Output | Mood Arc | Status |
|---|-----|------|--------|----------|--------|
| 13 | FQSTN | PART2_01_final_question.md | `demo/chapters/13_fqstn.json` | calm → wonder | ⬜ |
| 14 | FRGIV | PART2_02_why_not_just_forgive.md | `demo/chapters/14_frgiv.json` | wonder → awe | ⬜ |
| 15 | SNNER | PART2_03_not_a_sinner.md | `demo/chapters/15_snner.json` | wonder → awe | ⬜ |
| 16 | SELRD | PART2_04_why_i_cant_redeem_myself.md | `demo/chapters/16_selrd.json` | wonder → awe → weight | ⬜ |
| 17 | SLJES | PART2_05_soul_and_jesus.md | `demo/chapters/17_sljes.json` | calm → wonder → awe | ⬜ |
| 18 | JSAVE | PART2_06_why_jesus_can_save_all.md | `demo/chapters/18_jsave.json` | wonder → awe | ⬜ |
| 19 | COGST | PART2_07_good_still_sinned.md | `demo/chapters/19_cogst.json` | wonder → awe → weight | ⬜ |
| 20 | ETERN | PART2_08_eternal_punishment.md | `demo/chapters/20_etern.json` | weight | ⬜ |
| 21 | RSRCT | PART2_09_jesus_resurrection.md | `demo/chapters/21_rsrct.json` | calm → awe | ⬜ |
| 22 | RSPND | PART2_10_final_judgement.md | `demo/chapters/22_rspnd.json` | awe → weight | ⬜ |

---

## Appendix (Codex Template)

| # | UID | File | Output | Status |
|---|-----|------|--------|--------|
| A1 | BLDNA | APP_01_bible_dna.md | `demo/chapters/A1_bldna.json` | ⬜ |
| A2 | GODMG | APP_02_message_to_non_believer.md | `demo/chapters/A2_godmg.json` | ⬜ |

---

## Transitions

| Between | Type | Implemented In |
|---------|------|----------------|
| Each chapter within Part 1 | Lightspeed | Handled dynamically by `reader.html` |
| P1END → Part 2 (P1END → FQSTN) | Big Bang | Handled dynamically by `reader.html` |
| Each chapter within Part 2 | Lightspeed | Handled dynamically by `reader.html` |
| Part 2 → Appendix (RSPND → BLDNA) | Fade to codex | Handled dynamically by `reader.html` |

---

## Notes
- Each JSON file is self-contained (adhering to cinematic director JSON schema)
- Real content from `/restructured/` source files
- All references formatted simply as `[CHAPTERUID-NNN]` in plain text (auto-parsed at runtime by `reader.html`)
- Reference registry embedded per chapter JSON
