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
 
### The Three Cinematic Directives (CRITICAL):
1. **MOBILE OPTIMIZATION (Especially Tables)** — The ebook is read on mobile devices. You must use a **maximum of 3 columns** per table (no exceptions). Use `lens` cards for dense details. Keep paragraphs short (1-3 sentences).
2. **DIRECTOR'S MOOD SWINGS** — Act as a theatrical director. Use emotional swings (`calm`, `wonder`, `awe`, `weight`) to dynamically change the starfield (speed, direction, rotation), music tracks (crossfades), background aurora colors, and text animation effects to create an immersive reading experience.
3. **BIG BANG TRANSITIONS** — Chapter changes must use the Big Bang effect. Always end the chapter JSON with a `next` block so the engine triggers this transition.
4. **ONE CHAPTER AT A TIME** — Each JSON chapter must be fully self-contained.
 
### JSON rules (CRITICAL — do not break):
- Use `「」` for Chinese quotation marks (NOT `""` — those break JSON parsing)
- No unescaped `"` inside string values
- After writing, VALIDATE with: `python -c "import json; json.load(open(FILE, encoding='utf-8')); print('OK')"`
- Do NOT tell me to check until validation passes
- All `[CHAPTERUID-NNN]` citations must be written in plain text brackets (e.g. `[NDEXP-002]`, do NOT wrap in HTML spans) and registered in `referenceRegistry`
 
### Server: Run from project root:
`python -m http.server 8080 --bind 127.0.0.1`
Then open: `http://127.0.0.1:8080/demo/reader.html`
 
### Start working. Check the task list and do the next chapter.
