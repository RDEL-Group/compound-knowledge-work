---
name: gws-writer
description: >
  Upload files to Google Drive and create Google Docs from markdown via the gws CLI.
  Use this skill when the user asks to "upload to Drive", "push this to Drive",
  "share this on Drive", or when any CKW command needs to send files to Google Workspace
  (e.g., export-document --to-drive).
compatibility: gws (npm install -g @googleworkspace/cli), python3
---

# Google Workspace Writer

Upload files to Google Drive and create Google Docs from markdown content. Supports uploading to specific folders on any Drive including Shared Drives.

## When to Use

- User asks to upload, push, or share a file on Google Drive
- `/ckw:drive upload` command needs to send a file to Drive
- `export-document --to-drive` needs to upload an exported file after conversion
- User asks to create a Google Doc from markdown content

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

## Mode: Upload File to Drive

Upload any local file (.docx, .pptx, .pdf, .md, .txt, images, etc.) to a Google Drive folder.

### Step 1: Validate the local file

```bash
ls -la "LOCAL_FILE_PATH"
```

**If file not found:**
```
File not found at [path]. Check the path and try again.
```

### Step 2: Find the target folder

**If user specified a folder name:**
```bash
gws drive files list --params '{"q": "name = '\''FOLDER_NAME'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "includeItemsFromAllDrives": true, "supportsAllDrives": true, "corpora": "allDrives", "fields": "files(id,name,parents)"}'
```

If multiple folders match, present a numbered list and ask which one.

> **Escaping apostrophes:** if `FOLDER_NAME` or `FILENAME` contains an apostrophe, escape it as `\'` inside the query (e.g., `O'Brien Folder` → `O\'Brien Folder`) — otherwise the Drive `q` string terminates early and the lookup fails.

**If no folder specified:** Ask the user where to upload:
```
Where should this file go? You can:
  1. Search for a folder by name
  2. Upload to My Drive root
  3. Specify a folder ID
```

### Step 3: Upload the file

Include `supportsAllDrives` unconditionally — the Step 2 folder search can return Shared Drive folders, and an upload without it 404s on those:

```bash
gws drive files create --json '{"name": "FILENAME", "parents": ["FOLDER_ID"]}' --params '{"supportsAllDrives": true}' --upload "LOCAL_FILE_PATH"
```

**To upload to My Drive root (no folder):**
```bash
gws drive files create --json '{"name": "FILENAME"}' --params '{"supportsAllDrives": true}' --upload "LOCAL_FILE_PATH"
```

### Step 4: Verify and report

Check the response for success (should contain `"id"` and `"name"`).

```
Uploaded successfully!

  FILENAME → Google Drive / FOLDER_NAME
  File ID: FILE_ID
  View: https://drive.google.com/file/d/FILE_ID/view
```

## Mode: Create Google Doc from Markdown

Convert a local markdown file into a native Google Doc on Drive.

### Step 1: Check prerequisites

```bash
which pandoc
```

If pandoc is available, use it for better conversion. If not, upload the markdown directly.

### Step 2: Convert markdown to .docx (preferred)

```bash
pandoc -f markdown -t docx -o /tmp/ckw-gws-upload.docx "MARKDOWN_FILE_PATH"
```

**If pandoc not available,** skip this step and upload the .md file directly (Google Drive can convert it, though formatting will be basic).

### Step 3: Upload with Google Docs conversion

```bash
gws drive files create --json '{"name": "DOC_TITLE", "parents": ["FOLDER_ID"], "mimeType": "application/vnd.google-apps.document"}' --params '{"supportsAllDrives": true}' --upload "/tmp/ckw-gws-upload.docx"
```

The `mimeType: application/vnd.google-apps.document` tells Drive to convert the uploaded file to a native Google Doc.

**If uploading .md directly (no pandoc):**
```bash
gws drive files create --json '{"name": "DOC_TITLE", "parents": ["FOLDER_ID"], "mimeType": "application/vnd.google-apps.document"}' --params '{"supportsAllDrives": true}' --upload "MARKDOWN_FILE_PATH"
```

### Step 4: Report

```
Created Google Doc!

  DOC_TITLE
  View: https://docs.google.com/document/d/DOC_ID/edit
  Folder: FOLDER_NAME
```

### Step 5: Clean up

```bash
rm -f /tmp/ckw-gws-upload.docx
```

## Mode: Check if File Exists

Before uploading, optionally check if a file with the same name already exists in the target folder:

```bash
gws drive files list --params '{"q": "name = '\''FILENAME'\'' and '\''FOLDER_ID'\'' in parents", "includeItemsFromAllDrives": true, "supportsAllDrives": true, "corpora": "allDrives", "fields": "files(id,name)"}'
```

**If file exists:**
```
A file named "FILENAME" already exists in this folder.
Overwrite it, or upload with a different name?
```

To overwrite (update existing file):
```bash
gws drive files update --params '{"fileId": "EXISTING_FILE_ID", "supportsAllDrives": true}' --upload "LOCAL_FILE_PATH"
```

## Error Handling

- **gws not installed** → Install instructions (see Prerequisites), STOP
- **Auth expired (401)** → "Run `gws auth login` to re-authenticate"
- **File not found locally** → "File not found at [path]. Check the path and try again"
- **Folder not found on Drive** → "No folder named 'X' found. Search for a different name, or provide a folder ID"
- **Permission denied (403)** → "You don't have write access to this folder. Ask the folder owner to grant you Editor access"
- **Upload failed** → Show the error response from gws. Common cause: file too large for API (limit is 5GB)
- **Conversion failed** → "Google couldn't convert the file to a Doc. Try uploading as-is instead"
- **Rate limit (429)** → "Google API rate limit reached. Wait a moment and try again"
