---
description: Import reference documents into a CKW project. Converts .docx/.pdf/.pptx/.html/.txt/.md files to indexed summaries with token estimates for context-aware planning.
---

# /ckw:import-reference — Import Reference Materials

## Purpose
Import reference documents into a CKW project. Each document is converted to readable text, summarized, and indexed with token estimates so the planner and executor can make context-budget-aware decisions about what to load per task.

## Usage
```
/ckw:import-reference <path>
/ckw:import-reference reference/client-brief.pdf
/ckw:import-reference reference/*.pdf
/ckw:import-reference --batch reference/
/ckw:import-reference --from-drive "search term"
/ckw:import-reference --from-drive DOC_ID
/ckw:import-reference <path> --headless
```

- `<path>`: Path to a single file or glob pattern
- `--batch <directory>`: Process all supported files in the directory
- `--from-drive <term or ID>`: Fetch file(s) from Google Drive instead of local filesystem

## What This Command Does

Use the **import-summarizer** skill to convert and index each reference document. This is a lightweight command — no agent spawn needed.

### Step 1: Validate Project

Check that this is a CKW project:

1. Look for STATE.md in the project root
2. Read STATE.md for current status

**If no STATE.md:**
```
No CKW project found in this directory.
Run /ckw:new-project or /ckw:adopt-project first.
```

### Step 1b: Fetch from Google Drive (if --from-drive)

If `--from-drive` is specified, use the **gws-reader** skill to fetch content from Google Drive instead of reading local files.

1. **Run gws-reader prerequisites check** — verify `gws` is installed and authenticated. If not, show install/auth instructions and STOP.

2. **If the argument looks like a file ID** (long alphanumeric string), read it directly. Otherwise, invoke gws-reader in Search mode:

```bash
gws drive files list --params '{"q": "name contains '\''SEARCH_TERM'\''", "includeItemsFromAllDrives": true, "supportsAllDrives": true, "corpora": "allDrives", "pageSize": 10, "fields": "files(id,name,mimeType,modifiedTime,parents)"}'
```

3. **Present search results** and ask user which files to import (can select multiple).

4. **For each selected file:**
   - Detect mimeType and invoke the appropriate gws-reader mode (Doc, Sheet, or Slides)
   - Save the markdown output to `reference/{filename}.md` where filename is the Google file name lowercased with spaces as hyphens
   - Example: "Satellite PRD FY2026" → `reference/satellite-prd-fy2026.md`

5. **Continue to Step 4** (Process Each File) with these saved local files. The import-summarizer skill generates indexed summaries as normal.

**If gws not installed:**
```
Google Workspace CLI (gws) is required for --from-drive.

Install:
  npm install -g @googleworkspace/cli

Then authenticate:
  gws auth setup
  gws auth login

Or import local files instead:
  /ckw:import-reference <path>
```

### Step 2: Resolve Files

Determine which files to process:

- **Single file:** Validate the file exists and is a supported format (.docx, .pdf, .pptx, .html, .txt, .md)
- **Glob pattern:** Expand the pattern and filter to supported formats
- **`--batch` directory:** List all files in the directory, filter to supported formats

**If no supported files found:**
```
No supported files found at [path].
Supported formats: .docx, .pdf, .pptx, .html, .txt, .md
```

**If files found, confirm before processing:**
```
Found [N] files to import:
  1. client-brief.pdf         (PDF, 245 KB)
  2. competitor-analysis.docx  (Word, 128 KB)
  3. brand-guidelines.pdf      (PDF, 1.2 MB)

Process all [N] files?
```

Wait for user confirmation.

### Step 3: Create Directories

Create `reference/` and `reference/.index/` if they don't exist. If the source files are not already in `reference/`, note their current location — the skill processes files in place.

### Step 4: Process Each File

For each file, invoke the **import-summarizer** skill. See `skills/import-summarizer/SKILL.md` for the full conversion and summarization process.

The skill:
1. Converts the file to readable text (textutil → pandoc → Python fallback)
2. Generates a summary with YAML frontmatter
3. Saves to `reference/.index/{filename}.md`

Report progress after each file:
```
[1/3] client-brief.pdf
      Format: PDF → text via textutil
      Summary: reference/.index/client-brief.md
      Tokens: ~4,500 | Sections: 7 | Key: requirements, timeline, budget
```

If a file fails conversion, report the error and continue with the next file:
```
[2/3] competitor-analysis.docx
      ⚠ Conversion failed: textutil not available, pandoc not installed
      Skipped. Install pandoc: brew install pandoc
```

### Step 5: Check for Existing Summaries

Before processing each file, check if `reference/.index/{filename}.md` already exists.

**If summary exists:**
```
Summary already exists for [filename]. Re-import (overwrites), or skip?
```

Wait for user response. If batch processing, offer: "Re-import all existing, skip all existing, or ask for each?"

### Step 6: Context Budget Report

After all files are processed, calculate and report the total reference budget:

```
Import complete!

📦 Imported [N] of [total] files:
  client-brief.pdf          (~4,500 tokens)  — Product requirements, timeline, budget
  competitor-analysis.docx   (~2,100 tokens)  — Market landscape, 5 competitors
  brand-guidelines.pdf       (~1,800 tokens)  — Voice, tone, visual standards

📊 Total reference budget: ~8,400 tokens
   Available per task (50% of working space): ~84,000 tokens
   References use: ~10% of per-task budget ✅

[N] files skipped (see errors above)
```

**If total references exceed 50% of per-task budget (~84K tokens):**
```
⚠ Total reference budget (~95,000 tokens) exceeds recommended per-task limit (~84,000 tokens).
The planner will use summaries instead of full documents and may split reference-heavy tasks.
Consider identifying which references are most critical for each phase.
```

### Step 7: Update STATE.md

Add to the Current Status section:
```
[N] reference documents imported. Total reference budget: ~[N] tokens.
```

### Step 8: Save Progress

**If local/git repo:**
```bash
git add reference/.index/
git add STATE.md
git commit -m "CKW: [N] reference documents imported"
```

**If Google Drive / cloud storage:** Skip git. Files are auto-saved by Drive.

### Step 9: Suggest Next Steps

```
Next:
  /ckw:search-solutions [query]     Search for relevant patterns from past projects
  /ckw:plan-phase [N]               Plan a phase (researcher will use these references)
  /ckw:import-reference [more]      Import additional documents
  /ckw:progress                     Full project status
```

## Pipeline Mode

**`--headless` behavior:** Import all files without confirmation prompts.

- **Batch confirmation (Step 2):** Skip. Process all supported files found at the path.
- **Existing summaries (Step 5):** Skip existing summaries (do not re-import). To force re-import in headless mode, delete the existing summary first.
- **`--from-drive` search results:** Not supported in headless mode. Use a specific file ID instead of a search term. If a search term is provided with `--headless`, return error: "Headless mode requires a specific file ID for --from-drive, not a search term."
- **All file writes and git commits:** Proceed without confirmation.
- **Context budget report (Step 6):** Still generated.

## Error Handling

- **No STATE.md** → "No CKW project found. Run /ckw:new-project or /ckw:adopt-project first."
- **Unsupported format** → "File format [ext] not supported. Supported: .docx, .pdf, .pptx, .html, .txt, .md"
- **File not found** → "File not found at [path]. Check the path and try again."
- **Conversion failure** → Report the specific error, suggest installing pandoc, continue with next file
- **Very large file (>50K tokens)** → "This file is very large (~[N] tokens). Import anyway, or identify specific sections to extract?"
- **reference/.index/ already has summaries** → Offer to re-import or skip (per file or batch)
- **Config.json missing** → "CKW config not found at ~/.ckw/config.json. Run the installer or create it manually."
