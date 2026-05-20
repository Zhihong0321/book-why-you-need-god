# Template Assignment

> Each chapter is assigned a visual template for HTML rendering.
> 
> **Available Templates:**
> - `starfield` — Immersive cinematic reading (canvas starfield + aurora + mood engine + text effects)
> - `codex` — Premium dark ebook reference layout (tables + typography + cards, mobile-friendly)

---

## Template Assignments

| UID | Chapter | Template | Notes |
|-----|---------|----------|-------|
| TOCNT | Table of Contents | `codex` | Static reference page |
| CAST | Cast of Contributors | `codex` | 9-layer evidence table |
| INTRO | Front Note / Introduction | `codex` | Author's preface |
| LNSML | Lens Manual | `codex` | Reading guide |
| NDEXP | NDE Research Report | `starfield` | Mood: calm → wonder → awe → weight |
| ONEGD | One God | `starfield` | Mood: wonder → awe |
| MFPRT | Messianic Fingerprint | `starfield` | Mood: calm → awe (heavy evidence tables) |
| RSDLT | Resurrection Delta | `starfield` | Mood: wonder → awe → weight |
| JESDC | Jesus Divine Claim | `starfield` | Mood: wonder → awe |
| CMD10 | Ten Commandments | `starfield` | Mood: calm → awe |
| GDSIG | God's Signature | `starfield` | Mood: wonder → awe |
| BPRSC | Bible Prescience | `starfield` | Mood: calm → wonder → awe |
| ROADS | All Roads Same Address | `starfield` | Mood: wonder → awe → weight |
| UNVRS | Universe Is Yours | `starfield` | Mood: calm → wonder |
| FNLQA | Final Resistance Q&A | `starfield` | Mood: wonder → awe |
| P1END | Part 1 Ending | `starfield` | Mood: awe → weight. Big Bang transition after. |
| FQSTN | Final Questions | `starfield` | Mood: calm → wonder |
| FRGIV | Why Can't God Just Forgive | `starfield` | Mood: wonder → awe |
| SNNER | I Am Not a Sinner | `starfield` | Mood: wonder → awe |
| SELRD | Why I Cannot Redeem Myself | `starfield` | Mood: wonder → awe → weight |
| SLJES | Soul and Jesus | `starfield` | Mood: calm → wonder → awe |
| JSAVE | Why Jesus Can Save All | `starfield` | Mood: wonder → awe |
| COGST | Good Still Sinned / Cognitive Cost | `starfield` | Mood: wonder → awe → weight |
| ETERN | Eternal Punishment | `starfield` | Mood: weight (throughout) |
| RSRCT | Jesus Resurrection Evidence | `starfield` | Mood: calm → awe |
| RSPND | Why Must I Face Final Judgement | `starfield` | Mood: awe → weight |
| BLDNA | Bible DNA (Appendix) | `codex` | Reference/data appendix |
| GODMG | God's Message to Non-Believers (Appendix) | `codex` | Strategy reference |

---

## Transition Rules

| Between | Transition Type |
|---------|----------------|
| Part 0 → Part 1 (INTRO → NDEXP) | Big Bang |
| Part 1 chapters | Lightspeed |
| Part 1 → Part 2 (P1END → FQSTN) | Big Bang |
| Part 2 chapters | Lightspeed |
| Last chapter → Appendix | Fade to codex |

---

## How to Use

When building the final HTML, the build script should:
1. Read this file to determine which template each chapter uses
2. For `starfield` chapters: inject content into the starfield template with mood zones
3. For `codex` chapters: inject content into the codex template with table styling
4. Apply transition animations between chapters based on the transition rules above
