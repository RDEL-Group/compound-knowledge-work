---
name: gws-reader
description: >
  Read Google Docs, Sheets, and Slides via the gws CLI, and search for files across
  Google Drive (including Shared Drives). Converts content to clean markdown.
  Use this skill when the user asks to "read a Google Doc", "grab that spreadsheet",
  "find a file on Drive", "search Drive for...", or when any CKW command needs to
  fetch content from Google Workspace.
compatibility: gws (npm install -g @googleworkspace/cli), python3
---

# Google Workspace Reader

Read files from Google Drive and convert their content to clean markdown. Supports Google Docs, Sheets, and Slides. Searches across all Drives including Shared Drives.

## When to Use

- User asks to read, view, or fetch a Google Doc, Sheet, or Slides file
- User asks to search or find files on Google Drive
- `/ckw:drive` command needs to search or read files
- `/ckw:import-reference --from-drive` needs to fetch content before importing
- Any CKW agent needs Google Workspace content as context

## Prerequisites

### Check 1: gws CLI installed

```bash
which gws
```

**If not found:**
```
The Google Workspace CLI (gws) is required but isn't installed.

Install:
  npm install -g @googleworkspace/cli

Then authenticate:
  gws auth setup
  gws auth login

After setup, run this command again.
```

Stop here — do not attempt any operations without gws.

### Check 2: Authentication valid

```bash
gws drive files list --params '{"pageSize": 1}' 2>&1
```

**If the response contains "401" or "authError":**
```
Your Google Workspace session has expired. Re-authenticate:
  gws auth login

Then try again.
```

Stop here — do not attempt operations with expired auth.

## Mode: Search

Find files by name across all Drives (including Shared Drives).

### Step 1: Execute search

```bash
gws drive files list --params '{"q": "name contains '\''SEARCH_TERM'\''", "includeItemsFromAllDrives": true, "supportsAllDrives": true, "corpora": "allDrives", "pageSize": 10, "fields": "files(id,name,mimeType,modifiedTime,parents)"}'
```

**To search within a specific Shared Drive** (if user specifies):
```bash
gws drive files list --params '{"q": "name contains '\''SEARCH_TERM'\''", "driveId": "DRIVE_ID", "includeItemsFromAllDrives": true, "supportsAllDrives": true, "corpora": "drive", "pageSize": 10, "fields": "files(id,name,mimeType,modifiedTime,parents)"}'
```

**To list available Shared Drives:**
```bash
gws drive drives list
```

> **Escaping apostrophes:** if `SEARCH_TERM` contains an apostrophe, escape it as `\'` inside the query (e.g., `O'Brien` → `O\'Brien`) — otherwise the Drive `q` string terminates early and the search fails or returns wrong results.

### Step 2: Present results

Map mimeType to friendly labels:
- `application/vnd.google-apps.document` → `[Doc]`
- `application/vnd.google-apps.spreadsheet` → `[Sheet]`
- `application/vnd.google-apps.presentation` → `[Slides]`
- `application/vnd.google-apps.folder` → `[Folder]`
- Other → `[File]`

Display as a numbered list:
```
Found 3 files matching "northwind":
  1. [Doc]    Northwind PRD FY2026           (modified 2026-03-01)  ID: 1abc...
  2. [Sheet]  Northwind Metrics Dashboard    (modified 2026-03-10)  ID: 2def...
  3. [Slides] Northwind Phase 1 Deck         (modified 2026-02-15)  ID: 3ghi...
```

**If no results:**
```
No files found matching "SEARCH_TERM" on any Drive.
Try a different search term, or check the file name in Google Drive.
```

> **Script paths** below (`scripts/…`) are relative to this SKILL.md — the skill's own install directory. Do not hardcode `~/.claude/...`; that path doesn't exist under marketplace installs.

## Mode: Read Google Doc

### Step 1: Fetch document

```bash
gws docs documents get --params '{"documentId": "DOC_ID"}' > /tmp/ckw-gws-doc.json
```

### Step 2: Convert to markdown

```bash
python3 scripts/docs_to_markdown.py /tmp/ckw-gws-doc.json
```

The script converts the Docs API JSON to clean markdown:
- Headings (TITLE, HEADING_1-6) → `#`, `##`, `###`, etc.
- Bold → `**text**`, Italic → `*text*`, Strikethrough → `~~text~~`
- Links → `[text](url)`
- Bullets → `- item` (with nesting via indentation)
- Ordered lists → `1. item`
- Tables → markdown table format
- Images → `[image]` placeholder

### Step 3: Report

Display the converted markdown content. If the document is very large (>50K tokens estimated at ~1.3 tokens per word), warn:
```
This document is large (~[N] tokens). Displaying the full content.
Consider importing specific sections if using as reference context.
```

## Mode: Read Google Sheet

### Step 1: Get sheet names

```bash
gws sheets spreadsheets get --params '{"spreadsheetId": "SHEET_ID", "fields": "sheets.properties.title"}' > /tmp/ckw-gws-sheets-meta.json
```

Parse the response to get available sheet names. If the user specified a sheet name, use it. If not, and there's only one sheet, use that. If multiple sheets and none specified, list them and ask which to read.

### Step 2: Fetch values

```bash
gws sheets spreadsheets values get --params '{"spreadsheetId": "SHEET_ID", "range": "SHEET_NAME"}' > /tmp/ckw-gws-sheet.json
```

**To read a specific range:**
```bash
gws sheets spreadsheets values get --params '{"spreadsheetId": "SHEET_ID", "range": "SHEET_NAME!A1:Z100"}' > /tmp/ckw-gws-sheet.json
```

### Step 3: Convert to markdown table

```bash
python3 scripts/sheets_to_markdown.py /tmp/ckw-gws-sheet.json "SHEET_NAME"
```

The script converts the values array to a markdown table with headers, separators, and data rows. Truncates at 1000 rows with a warning.

### Step 4: Report

Display the markdown table. If multiple sheets were requested, display each with a `## Sheet: {name}` heading.

## Mode: Read Google Slides

### Step 1: Fetch presentation

```bash
gws slides presentations get --params '{"presentationId": "SLIDES_ID"}' > /tmp/ckw-gws-slides.json
```

### Step 2: Convert to markdown

```bash
python3 scripts/slides_to_markdown.py /tmp/ckw-gws-slides.json
```

The script converts the Slides API JSON to markdown:
- Presentation title → `# Title`
- Each slide → `## Slide N: {title}`
- Shape text → paragraph content with bold/italic preserved
- Speaker notes → blockquote below each slide
- Slide separators → `---`

### Step 3: Report

Display the converted markdown content.

## Detecting File Type from ID

When given a file ID without a known type, detect the mimeType first:

```bash
gws drive files get --params '{"fileId": "FILE_ID", "fields": "id,name,mimeType", "supportsAllDrives": true}'
```

Then route to the appropriate read mode based on mimeType.

## Saving Content to a File

When another skill or command needs the content saved (e.g., import-reference):

1. Run the appropriate read mode
2. Capture the markdown output
3. Save to the specified path (e.g., `reference/{filename}.md`)

```bash
gws docs documents get --params '{"documentId": "DOC_ID"}' > /tmp/ckw-gws-doc.json
python3 scripts/docs_to_markdown.py /tmp/ckw-gws-doc.json > "OUTPUT_PATH"
rm -f /tmp/ckw-gws-doc.json
```

## Clean up temp files

The read modes write intermediate JSON to `/tmp/ckw-gws-*.json`, which can contain confidential document content. Delete these once you've converted and displayed (or saved) the result:

```bash
rm -f /tmp/ckw-gws-doc.json /tmp/ckw-gws-sheet.json /tmp/ckw-gws-sheets-meta.json /tmp/ckw-gws-slides.json
```

## Error Handling

- **gws not installed** → Install instructions (see Prerequisites), STOP
- **Auth expired (401)** → "Run `gws auth login` to re-authenticate"
- **File not found (404)** → "File not found. Check the ID or search again"
- **Permission denied (403)** → "You don't have access to this file. Ask the file owner to share it with your account"
- **Conversion script error** → Show the Python error, display first 50 lines of raw JSON as fallback
- **Very large output (>50K tokens)** → Warn about context budget impact, suggest specific sections or ranges
- **Empty document/sheet** → Report "(empty document)" or "(empty sheet)"
- **Rate limit (429)** → "Google API rate limit reached. Wait a moment and try again"
