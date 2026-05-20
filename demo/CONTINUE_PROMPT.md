# Continue Building Chapters — Session Prompt

Copy-paste this into a new session to continue the work.

---

## PROMPT:

I am building an interactive cinematic ebook reader. The platform is already built. I need you to continue generating chapter JSON files and adding them to the manifest.

### Architecture (already working):

- **Platform**: `/demo/reader.html` — single-page reader engine
- **Manifest**: `/demo/manifest.json` — chapter load order
- **Chapter data**: `/demo/chapters/XX_uid.json` — one JSON per chapter
- **Progress tracker**: `/demo/BUILD_TASKLIST.md` — mark chapters done

### How it works:

1. Reader loads `manifest.json`, fetches each chapter JSON in order
2. Only ONE chapter is in DOM at a time
3. When reader scrolls to bottom → Big Bang transition fires → old chapter removed → new chapter loaded
4. Starfield + aurora + music change based on mood zones within each chapter

### To generate the next chapter:

1. Check `/demo/BUILD_TASKLIST.md` for the next uncompleted chapter
2. Read the source markdown from `/restructured/PARTX_XX_filename.md`
3. Read `/prompts/cinematic_director_prompt.md` for the JSON schema and mood rules
4. Read `/TEMPLATE_ASSIGNMENT.md` for the mood arc assigned to that chapter
5. Generate a valid JSON file at `/demo/chapters/XX_uid.json`
6. Add it to `/demo/manifest.json`
7. Mark it complete in `/demo/BUILD_TASKLIST.md`

### JSON rules (CRITICAL — do not break):

- Use `「」` for Chinese quotation marks (NOT `""` — those break JSON parsing)
- No unescaped `"` inside string values
- After writing, VALIDATE with: `python -c "import json; json.load(open(FILE, encoding='utf-8')); print('OK')"`
- Do NOT tell me to check until validation passes

### JSON block types available:

```
heading    — {type, level, text, fx}
paragraph  — {type, text, fx, class?}
quote      — {type, text, fx}
divider    — {type}
lens       — {type, label, paragraphs:[]}
table      — {type, headers:[], rows:[[]]}
list       — {type, ordered, items:[]}
typewriter — {type, text}
next       — {type, text}
```

### Mood options for zones:

- `calm` — slow zoom-in, blue aurora, Snowfall music
- `wonder` — rise, purple aurora, Filaments music
- `awe` — fast zoom-in, violet aurora, Horizons music
- `weight` — sink, dark aurora, Escape music

### Server:

Run from project root: `python -m http.server 8080 --bind 127.0.0.1`
Then open: `http://127.0.0.1:8080/demo/reader.html`

### Start working. Check the task list and do the next chapter.
