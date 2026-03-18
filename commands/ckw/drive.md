---
description: Search, read, import, or upload files via Google Drive. Works with Google Docs, Sheets, Slides, and all file types across personal and Shared Drives.
---

# /ckw:drive — Google Drive Integration

## Purpose
Interact with Google Drive directly from Claude Code. Search for files, read Google Docs/Sheets/Slides as markdown, import reference documents from Drive into a CKW project, or upload local files to Drive. Eliminates the need to manually download and re-upload files.

## Usage
```
/ckw:drive search "client brief"
/ckw:drive read "satellite PRD"
/ckw:drive read 1WTd30GDW69E98xiONfrX4KXC67SYyDxTN_nNyElREP0
/ckw:drive import "satellite PRD"
/ckw:drive upload drafts/report.docx
/ckw:drive upload drafts/report.docx --to "Project Deliverables"
```

- **search**: Find files by name across all Drives
- **read**: Read a file's content as markdown (search by name or use a file ID)
- **import**: Read from Drive and import into the current CKW project as a reference
- **upload**: Upload a local file to Google Drive

## What This Command Does

### Step 1: Check Prerequisites

Run the **gws-reader** skill prerequisites check:

1. Verify `gws` CLI is installed: `which gws`
2. Verify authentication is valid: `gws drive files list --params '{"pageSize": 1}'`

**If gws not installed:**
```
Google Workspace CLI (gws) is required but isn't installed.

Install:
  npm install -g @googleworkspace/cli

Then authenticate:
  gws auth setup
  gws auth login
```

**If auth expired:**
```
Your Google Workspace session has expired.
Run: gws auth login
```

### Step 2: Parse Intent

Determine the mode from the first argument:

| Argument | Mode | Requires CKW Project? |
|----------|------|----------------------|
| `search` | Search Drive for files | No |
| `read` | Read file content as markdown | No |
| `import` | Read + import as CKW reference | Yes (STATE.md) |
| `upload` | Upload local file to Drive | No |

**If no argument or unrecognized:**
```
Usage:
  /ckw:drive search "search term"     Find files on Drive
  /ckw:drive read "name or ID"        Read a file as markdown
  /ckw:drive import "name or ID"      Import into CKW project
  /ckw:drive upload local-file.docx   Upload to Drive
```

### Step 3: Execute — Search Mode

Invoke the **gws-reader** skill in Search mode with the user's search term.

Display results as a numbered list:
```
Found 3 files matching "satellite":
  1. [Doc]    Satellite PRD FY2026           (modified 2026-03-01)
  2. [Sheet]  Satellite Metrics Dashboard    (modified 2026-03-10)
  3. [Slides] Satellite Phase 1 Deck         (modified 2026-02-15)

To read a file: /ckw:drive read [number or ID]
To import as reference: /ckw:drive import [number or ID]
```

### Step 3: Execute — Read Mode

**If the argument looks like a file ID** (long alphanumeric string): read directly.

**If the argument is a search term:**
1. Invoke gws-reader skill in Search mode
2. If exactly 1 result, read it automatically
3. If multiple results, present the list and ask which to read
4. If no results, report and suggest different search terms

**Once a file is selected:**
1. Detect the file type using gws-reader (checks mimeType)
2. Invoke gws-reader in the appropriate mode (Doc, Sheet, or Slides)
3. Display the converted markdown content

```
Reading: Satellite PRD FY2026 (Google Doc)

# Satellite PRD FY2026
...
[markdown content displayed inline]
```

### Step 3: Execute — Import Mode

**Requires a CKW project.** Check for STATE.md:

**If no STATE.md:**
```
No CKW project found in this directory.
Run /ckw:new-project or /ckw:adopt-project first,
or use /ckw:drive read to view the file without importing.
```

**If STATE.md exists:**

1. Search and select the file (same as Read mode)
2. Invoke gws-reader to fetch the content
3. Determine the filename:
   - Use the Google file name, lowercased, spaces to hyphens, add `.md` extension
   - Example: "Satellite PRD FY2026" → `satellite-prd-fy2026.md`
4. Save the markdown content to `reference/{filename}.md`
5. Create directories if needed: `reference/` and `reference/.index/`
6. Invoke the **import-summarizer** skill on the saved file to generate the indexed summary at `reference/.index/{filename}.md`

Report:
```
Imported from Google Drive!

  Source: Satellite PRD FY2026 (Google Doc)
  Saved:  reference/satellite-prd-fy2026.md
  Index:  reference/.index/satellite-prd-fy2026.md
  Tokens: ~4,500

Next:
  /ckw:drive import "another file"    Import more references
  /ckw:plan-phase [N]                 Plan a phase with these references
  /ckw:progress                       Full project status
```

### Step 3: Execute — Upload Mode

1. Validate the local file exists
2. Invoke the **gws-writer** skill:
   - If `--to` is specified, search for that folder name on Drive
   - If no `--to`, ask the user where to upload
3. Upload the file
4. Report the Drive URL

```
Uploaded successfully!

  report.docx → Google Drive / Project Deliverables
  View: https://drive.google.com/file/d/FILE_ID/view
```

### Step 4: Update STATE.md (Import Mode Only)

If in import mode, append to the Current Status section:
```
Reference imported from Google Drive: [filename] (~[N] tokens)
```

## Error Handling

- **gws not installed** → Install instructions, STOP
- **Auth expired** → "Run `gws auth login` to re-authenticate"
- **No CKW project (import mode)** → Suggest /ckw:new-project or use read mode instead
- **File not found on Drive** → "No files matching '[term]'. Try a different search term"
- **Local file not found (upload mode)** → "File not found at [path]. Check the path"
- **Permission denied** → "You don't have access to this file/folder"
- **Conversion error** → Show the error, offer to display raw content

## Design Notes

- This command is a user-friendly wrapper around the gws-reader and gws-writer skills
- The skills can also be invoked directly by other commands (import-reference --from-drive, export-document --to-drive)
- No new agents needed — this is a lightweight command like /ckw:import-reference
- Works outside CKW projects for search, read, and upload — only import requires a project
- File IDs are accepted directly so users can paste Google Drive URLs and extract the ID
