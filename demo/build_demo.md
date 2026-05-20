I am building an interactive cinematic ebook reader. The platform is already built. I need you to continue generating chapter JSON files and adding them to the manifest.
 
### Architecture (already working):
- **Platform**: [/demo/reader.html](cci:7://file:///g:/You_Need_God/demo/reader.html:0:0-0:0) — single-page reader engine
- **Manifest**: [/demo/manifest.json](cci:7://file:///g:/You_Need_God/demo/manifest.json:0:0-0:0) — chapter load order
- **Chapter data**: `/demo/chapters/XX_uid.json` — one JSON per chapter
- **Progress tracker**: [/demo/BUILD_TASKLIST.md](cci:7://file:///g:/You_Need_God/demo/BUILD_TASKLIST.md:0:0-0:0) — mark chapters done
 
### How it works:
1. Reader loads [manifest.json](cci:7://file:///g:/You_Need_God/demo/manifest.json:0:0-0:0), fetches each chapter JSON in order
2. Only ONE chapter is in DOM at a time
3. When reader scrolls to bottom → Big Bang transition fires → old chapter removed → new chapter loaded
4. Starfield + aurora + music change based on mood zones within each chapter
 
### To generate the next chapter:
1. Check [/demo/BUILD_TASKLIST.md](cci:7://file:///g:/You_Need_God/demo/BUILD_TASKLIST.md:0:0-0:0) for the next uncompleted chapter
2. Read the source markdown from `/restructured/PARTX_XX_filename.md`
3. Read [/prompts/cinematic_director_prompt.md](cci:7://file:///g:/You_Need_God/prompts/cinematic_director_prompt.md:0:0-0:0) for the JSON schema, cinematic rules, and Four Laws
4. Read [/BOOK_REFERENCES.md](cci:7://file:///g:/You_Need_God/BOOK_REFERENCES.md:0:0-0:0) for reference metadata
5. Generate a valid JSON file at `/demo/chapters/XX_uid.json`
6. Add it to [/demo/manifest.json](cci:7://file:///g:/You_Need_God/demo/manifest.json:0:0-0:0)
7. Mark it complete in [/demo/BUILD_TASKLIST.md](cci:7://file:///g:/You_Need_God/demo/BUILD_TASKLIST.md:0:0-0:0)
 
### The Four Laws (priority order):
1. **MAXIMIZE CINEMATIC EXPERIENCE** — more mood zones, use ALL effect types (fx-fade-up, fx-glow, fx-typewriter, fx-quote, fx-reveal). A chapter with only fx-fade-up is a FAILURE. Every zone change = music crossfade + aurora shift + camera change.
2. **MOBILE-FIRST** — max 3 columns per table, use `lens` blocks for narrative detail, split giant tables into category groups.
3. **BIG BANG TRANSITIONS** — handled by engine. End every chapter with a `next` block.
4. **ONE CHAPTER AT A TIME** — each JSON is self-contained.
 
### JSON rules (CRITICAL — do not break):
- Use `「」` for Chinese quotation marks (NOT `""` — those break JSON parsing)
- No unescaped `"` inside string values
- After writing, VALIDATE with: `python -c "import json; json.load(open(FILE, encoding='utf-8')); print('OK')"`
- Do NOT tell me to check until validation passes
- All `[CHAPTERUID-NNN]` citations must be wrapped in `<span class="ref-tag" data-ref="CHAPTERUID-NNN">[CHAPTERUID-NNN]</span>` and registered in `referenceRegistry`
 
### Server: Run from project root:
`python -m http.server 8080 --bind 127.0.0.1`
Then open: `http://127.0.0.1:8080/demo/reader.html`
 
### Start working. Check the task list and do the next chapter.
