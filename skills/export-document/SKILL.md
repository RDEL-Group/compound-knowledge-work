---
name: export-document
description: >
  Export markdown drafts to shareable formats (.docx, .pptx, .pdf) via pandoc.
  Supports branded templates via --template flag. Use this skill when the user asks
  to "export a draft", "convert to Word", "create a PDF", "make a slide deck",
  or when any CKW command needs to produce a deliverable in a non-markdown format.
compatibility: pandoc (brew install pandoc)
---

# Export Document

Convert markdown drafts to deliverable formats for sharing with clients, stakeholders, and teammates who don't work in markdown. Supports .docx (Word/Google Docs), .pptx (slide decks), and .pdf (final deliverables), with optional branded templates.

## When to Use

- User wants to share a draft with a client or stakeholder
- User asks to "export", "convert", "create a Word doc", "make a PDF", "build a deck"
- After `/ckw:execute-phase` completes and drafts are ready for external review
- After `/ckw:review-phase` passes and content is finalized

## Prerequisites

Check that pandoc is installed:

```bash
which pandoc
```

**If pandoc is not found:**
```
pandoc is required for document export but isn't installed.

Install on macOS:
  brew install pandoc

Install on Linux:
  sudo apt-get install pandoc

After installing, run this command again.
```

Stop here — do not attempt conversion without pandoc.

## Supported Formats

| Output | pandoc flag | Best for | Notes |
|--------|------------|----------|-------|
| .docx | `-t docx` | Word/Google Docs review, collaborative editing | Most common export |
| .pptx | `-t pptx` | Slide decks, presentations | Uses `--slide-level 2` so `##` headers become slides |
| .pdf | `-t pdf` | Final deliverables, read-only sharing | Requires LaTeX engine (or use `-t html` → wkhtmltopdf) |

## Usage

The user invokes this skill conversationally. Parse their intent:

**Single file:**
```
Export drafts/market-analysis.md to docx
Convert drafts/executive-summary.md to PDF
```

**With template:**
```
Export drafts/market-analysis.md to docx --template reference/templates/brand-template.docx
Export drafts/deck.md to pptx --template reference/templates/company-slides.pptx
```

**Batch (all drafts):**
```
Export all drafts to docx
Export drafts/ to pdf
```

**Custom output path:**
```
Export drafts/report.md to docx --output exports/final-report.docx
```

## Conversion Process

### Step 1: Resolve Input Files

- **Single file:** Validate it exists and is a `.md` file
- **Directory/batch:** List all `.md` files in the directory
- **If no markdown files found:** Report and stop

### Step 2: Determine Output

For each input file:

1. **Output format:** From user's request (docx, pptx, or pdf)
2. **Output path:** Either user-specified (`--output`) or same directory as input with new extension
   - `drafts/report.md` → `drafts/report.docx`
   - With `--output exports/`: `exports/report.docx`
3. **Template:** If `--template` specified, validate the template file exists

### Step 3: Validate Template (if provided)

```bash
# Check template exists
ls -la "[template-path]"
```

**Template format must match output format:**
- `.docx` template → `.docx` output only
- `.pptx` template → `.pptx` output only

**If mismatch:**
```
Template format (.docx) doesn't match output format (.pptx).
Templates must match the target format. Proceeding without template.
```

### Step 4: Run Conversion

**For .docx:**
```bash
pandoc -f markdown -t docx -o "[output-path]" "[input-path]"
```

**For .docx with template:**
```bash
pandoc -f markdown -t docx --reference-doc "[template-path]" -o "[output-path]" "[input-path]"
```

**For .pptx:**
```bash
pandoc -f markdown -t pptx --slide-level 2 -o "[output-path]" "[input-path]"
```

**For .pptx with template:**
```bash
pandoc -f markdown -t pptx --slide-level 2 --reference-doc "[template-path]" -o "[output-path]" "[input-path]"
```

**For .pdf (via LaTeX if available):**
```bash
pandoc -f markdown -t pdf -o "[output-path]" "[input-path]"
```

**For .pdf (fallback if no LaTeX):**
```bash
pandoc -f markdown -t html -o "[output-path].html" "[input-path]"
```
Then suggest: "PDF generation requires a LaTeX engine. Exported as HTML instead. You can print to PDF from the browser, or install LaTeX: `brew install --cask mactex-no-gui`"

### Step 4b: Fix Embedded Font Registration (template exports only)

**IMPORTANT:** When a template is used (`--reference-doc`), pandoc copies embedded fonts from the template into the output but does NOT register them in `[Content_Types].xml`. This causes Word to show an "unreadable content" error.

**After every template export for .docx or .pptx**, run the fix script:

```bash
python3 scripts/fix_docx_content_types.py "[output-path]"
```

This script:
1. Opens the .docx/.pptx as a ZIP
2. Scans for font files missing from `[Content_Types].xml`
3. Adds the missing content type entries
4. Re-saves the file in place

The script is safe to run on files that don't need fixing — it reports "No fixes needed" and exits.

**If python3 is not available**, warn the user:
```
Note: The exported file may trigger a "recover content" warning in Word.
This is because the template has embedded fonts that pandoc doesn't fully register.
Install Python 3 to enable automatic fixing, or click "Yes" when Word asks to recover.
```

### Step 5: Verify Output

After each conversion (and fix, if applicable):
```bash
ls -la "[output-path]"
```

Confirm the file was created and report its size.

### Step 6: Report Results

**Single file:**
```
Exported successfully!

📄 drafts/market-analysis.md → drafts/market-analysis.docx (42 KB)
   Template: reference/templates/brand-template.docx ✅

Open the file or share it directly. Formatting applied from your brand template.
```

**Batch:**
```
Export complete!

📄 Exported [N] files to .docx:
  drafts/executive-summary.md    → drafts/executive-summary.docx    (28 KB)
  drafts/market-analysis.md      → drafts/market-analysis.docx      (42 KB)
  drafts/recommendations.md      → drafts/recommendations.docx      (35 KB)

📊 Total: [N] files, [total size]
[N] files skipped (see errors above)
```

## Template Guidelines

Templates live in `reference/templates/` by convention. Users supply their own branded templates.

**How templates work:**
- pandoc's `--reference-doc` extracts styles from the template and applies them to the generated output
- For .docx: heading styles, fonts, colors, margins, headers/footers carry over
- For .pptx: slide master, layouts, color scheme, fonts carry over
- Content from the template is NOT included — only styling

**Telling the user:**
```
Templates control the look (fonts, colors, layouts), not the content.
Drop your branded .docx or .pptx template in reference/templates/ and
reference it with --template.
```

## Markdown Tips for Better Export

When drafts are being written for export, these markdown conventions produce better results:

- **Slide decks (.pptx):** Use `##` for slide titles, content below each `##` becomes the slide body. Use `---` for slide breaks without titles.
- **Word docs (.docx):** `#` = Heading 1, `##` = Heading 2, etc. Tables, bullet lists, and bold/italic all transfer cleanly.
- **PDFs:** Same as .docx. Images must use absolute paths or paths relative to the markdown file.

## Known Issues

### Embedded font registration (fixed by Step 4b)
When pandoc applies a `--reference-doc` template that has embedded fonts (common in branded templates), it copies the font files but doesn't register them in the .docx XML manifest (`[Content_Types].xml`). This causes Word to show: "Word found unreadable content."

**Step 4b fixes this automatically** by running `fix_docx_content_types.py` after every template export. If you still see the warning, check that:
1. The fix script ran successfully (it prints which fonts it fixed)
2. python3 is available on the system
3. The output file wasn't modified between the fix and opening in Word

## Upload to Google Drive (--to-drive)

After exporting, optionally upload the output file to Google Drive. This is triggered when the user includes `--to-drive` in their request, e.g.:
```
Export drafts/report.md to docx --to-drive
Export drafts/report.md to docx --to-drive "Project Deliverables"
```

### Step 7: Upload to Drive (if --to-drive)

1. **Check gws prerequisites** — verify `gws` is installed and authenticated:
   ```bash
   which gws
   gws drive files list --params '{"pageSize": 1}' 2>&1
   ```
   If gws not installed or auth expired, report the error but DO NOT fail the export — the local file was already created successfully. Just note:
   ```
   Export complete! Local file saved at [path].
   Google Drive upload skipped — gws CLI not available/authenticated.
   Install: npm install -g @googleworkspace/cli
   ```

2. **Find target folder** — if `--to-drive` includes a folder name, search for it using the **gws-writer** skill. If no folder specified, ask the user.

3. **Upload** using the gws-writer skill:
   ```bash
   gws drive files create --json '{"name": "FILENAME", "parents": ["FOLDER_ID"]}' --params '{"supportsAllDrives": true}' --upload "OUTPUT_FILE_PATH"
   ```

4. **Report:**
   ```
   Exported and uploaded!

   Local:  drafts/report.docx (42 KB)
   Drive:  Google Drive / Project Deliverables
   View:   https://drive.google.com/file/d/FILE_ID/view
   ```

## Error Handling

- **pandoc not installed** → Clear install instructions (see Prerequisites)
- **Input file not found** → "File not found at [path]. Check the path and try again."
- **Input not markdown** → "Export works on markdown (.md) files. Convert first with /ckw:import-reference."
- **Template not found** → "Template not found at [path]. Proceeding without template."
- **Template format mismatch** → Warn and proceed without template
- **Conversion failure** → Show pandoc's error output. Common fixes: check for unsupported markdown syntax, ensure images exist at referenced paths.
- **No LaTeX for PDF** → Fall back to HTML, suggest LaTeX install or browser print-to-PDF
- **Output file already exists** → "Output file already exists. Overwrite, or save with a new name?"
