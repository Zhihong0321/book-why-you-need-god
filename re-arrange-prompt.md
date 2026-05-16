````markdown
## SETUP — READ BEFORE ANYTHING ELSE

Before you begin, ask the user:

"Which chapter would you like me to restructure?
Here is the chapter list — please give me the UID and paste the full chapter content:

| UID   | Chapter |
|-------|---------|
| INTRO | front_note |
| NDEXP | nde_research_report |
| MFPRT | messianic-fingerprint-audit-report |
| CMD10 | 10a_ten_commandments |
| BLDNA | 10b_bible_dna |
| ROADS | 10_all_roads_same_address |
| GODMG | message_to_non_believer |
| UNVRS | 03b_universe_is_yours |
| FQSTN | final_question_to_answer |
| FRGIV | 01_why_not_just_forgive |
| SNNER | 02_i-am-not-a-sinner |
| SELRD | 03_why_i_cant_redeem_myself |
| SLJES | 04_soul_and_jesus |
| JSAVE | 05_why_jesus_can_save_all |
| COGST | 06_good-still-sinned-but-evil-redeemed |
| ETERN | 07_eternal_punishment |
| RSRCT | 08_jesus_resurrection |
| RSPND | 09_why_must_i_face_final_judgement |

Please tell me:
1. The UID of the chapter you want restructured
2. Paste the full chapter content below"

Do not begin restructuring until the user has provided both the UID and the chapter content.

---

## YOUR TASK

You are restructuring a chapter for a progressive disclosure web app.
You will output TWO things in one response:
1. The restructured chapter (saved as [SOURCE_FILE]_R.md)
2. A reference block to be appended to BOOK_REFERENCES.md

Output location for restructured file: G:\You_Need_God\restructured\[SOURCE_FILE]_R.md
Output location for references: append to G:\You_Need_God\BOOK_REFERENCES.md

---

## THE FOUR LAYERS

**LAYER 1 — 结论 (CONCLUSION)**
The bold, plain-language statement of what this chapter proves.
One short paragraph. No jargon. No philosophy.
A reader with no background should understand it immediately.
After reading this, they either accept it and move on, or want to know why.

**LAYER 2 — 逻辑 (LOGIC)**
The simplest explanation of WHY the conclusion is true.
Use the analogies (直觉窗口) here — they are the accessible entry point.
Include hostile witness evidence if present (enemies confirming the claim).
No philosophical engine names. No academic language.
A reasonable person should find this convincing on its own.

**LAYER 3 — 论证 (ARGUMENT)**
The philosophical reasoning.
The named engines (Kant, Hegel, Gödel, Aquinas, Kierkegaard) belong here.
Multiple supporting arguments. Academic language acceptable.
This layer is for the reader who needs structural proof.

**LAYER 4 — 证据 (EVIDENCE)**
Everything else.
Full audit reports, case studies, legal citations, academic references,
historical records, tables, comparison matrices.
This is the deepest layer. Only readers who demand full proof reach here.

---

## STRICT RULES

**YOU MAY:**
- Reorder sections, paragraphs, and blocks of text
- Add layer header titles: ## 结论 / ## 逻辑 / ## 论证 / ## 证据
- Add a navigation cue between layers: *[继续深入 →]*
- Move a 直觉窗口 analogy up to Layer 2 if it is the simplest explanation of the conclusion
- Replace inline citations with reference codes [CHAPTERUID-NNN]
- Write structured notes in the NOTE format defined below

**YOU MAY NOT:**
- Edit, paraphrase, or rewrite any sentence or paragraph
- Add any new content, arguments, or explanations
- Remove any content
- Merge or split paragraphs
- Change any word in the original text

---

## REFERENCE SYSTEM

**Step 1: Identify all references in the chapter.**
A reference is any of the following:
- Academic paper citation (author, journal, year)
- Book citation
- URL or website link
- Archaeological or physical evidence source
- Government document or legal text
- Named study or dataset
- Historical primary source

**Step 2: Assign each a unique ID.**
Format: [CHAPTERUID-NNN]
NNN starts at 001 and increments.
Example: [NDEXP-001], [NDEXP-002], [NDEXP-003]

**Step 3: In the restructured chapter text:**
Replace the full inline citation with just the reference code.
Keep the code immediately after the sentence or claim it supports.
Do not move the code to a footnote.

Example:
BEFORE: van Lommel, P. et al. (2001). "Near-death experience." The Lancet, 358(9298), 2039-2045.
AFTER:  [NDEXP-001]

**Step 4: Build the reference block.**
Use EXACTLY this schema for each reference:

[CHAPTERUID-NNN]
CHAPTER: [CHAPTERUID]
TYPE: [JOURNAL | BOOK | WEBSITE | ARCHAEOLOGY | GOVERNMENT | LEGAL | PRIMARY | OTHER]
AUTHOR: [author name(s), or UNKNOWN]
TITLE: [full title]
SOURCE: [journal name, publisher, website, or institution]
YEAR: [year, or UNKNOWN]
USED_FOR: [one sentence — what claim does this reference support]
URL: [if available, else NONE]
---

---

## NOTE FORMAT

Place notes IMMEDIATELY before the section they refer to.
Use EXACTLY this format:

//// NOTE ////
TYPE: [LAYER_UNCLEAR | MISSING_LAYER | BELONGS_ELSEWHERE | SPLIT_NEEDED | CONCLUSION_WEAK | REF_INCOMPLETE | WEIRD]
LOCATION: [which section or paragraph]
ISSUE: [one or two sentences]
SUGGESTION: [one sentence, or NONE]
//// END NOTE ////

**Use NOTE when:**
- A paragraph could belong to Layer 2 OR Layer 3 — genuinely unclear
- A layer has no content after sorting (missing layer)
- A section seems to belong to a different chapter entirely
- A paragraph needs to be split between two layers to work
- Layer 1 conclusion is weak, missing, or buried and cannot be identified
- A reference exists but lacks enough information for a complete entry (REF_INCOMPLETE)
- Anything structurally unusual that a human should check

**Do NOT use NOTE for small judgment calls.**
Only flag genuine human decisions.

---

## SORTING GUIDE

**Layer 1 signals:**
- Final verdict or summary statement
- Often found at the END of original — move to TOP
- Plain statement of the core claim with no jargon

**Layer 2 signals:**
- 直觉窗口 sections (analogies and illustrations)
- Simple cause-and-effect explanations
- Hostile witness confirmations stated plainly
- Examples without philosophical framework
**LAYER 2 STRICT LIMIT:**
Layer 2 must contain NO MORE THAN:
- 1 analogy (直觉窗口)
- 1 hostile witness statement (if present)
- 1 simple cause-and-effect chain (maximum 3 steps)
If a section is longer than 200 words, it belongs in Layer 3.

**Layer 3 signals:**
- Named philosophical frameworks: 康德 / 黑格尔 / 哥德尔 / 阿奎那 / 克尔凯郭尔
- Sections titled with engine names
- Formal logical structures: 正题 / 反题 / 合题
- Numbered argument steps

**Layer 4 signals:**
- Tables and comparison matrices
- Case study details (VP-001, VP-002, etc.)
- Full legal citations (Codex Justinianus, Digest, etc.)
- Academic paper references with journal names
- Long historical narratives with specific dates and records

---

## OUTPUT FORMAT

Produce your full output in this exact structure:

════════════════════════════════════
FILE: [SOURCE_FILE]_R.md
CHAPTER_UID: [CHAPTERUID]
════════════════════════════════════

## 结论
[Layer 1 content — citations replaced with codes]

*[继续深入 →]*

## 逻辑
[Layer 2 content — citations replaced with codes]

*[继续深入 →]*

## 论证
[Layer 3 content — citations replaced with codes]

*[继续深入 →]*

## 证据
[Layer 4 content — citations replaced with codes]

════════════════════════════════════
RESTRUCTURE SUMMARY
════════════════════════════════════
Total notes written: [number]
Total references extracted: [number]
Layers present: [list]
Layers missing: [list or NONE]
Biggest issue: [one sentence or NONE]
════════════════════════════════════

════════════════════════════════════
REFERENCE BLOCK — APPEND TO BOOK_REFERENCES.md
════════════════════════════════════

[CHAPTERUID-001]
CHAPTER: [CHAPTERUID]
TYPE: [type]
AUTHOR: [author]
TITLE: [title]
SOURCE: [source]
YEAR: [year]
USED_FOR: [one sentence]
URL: [url or NONE]
---

[CHAPTERUID-002]
...

════════════════════════════════════

---

When in doubt on layer placement, go deeper not shallower.
If a section belongs between two layers, place it in the higher one.
````