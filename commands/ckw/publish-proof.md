---
description: Publish CKW drafts to Proof for collaborative review with AI provenance tracking. Creates shareable documents where teammates can see what AI wrote vs. what humans edited.
---

# /ckw:publish-proof — Publish to Proof

## Purpose
Publish completed drafts to Proof (proofeditor.ai) — a collaborative editor that tracks AI vs. human authorship at the character level. Teammates get a shareable link to review, comment, and edit drafts in a Google-Docs-like interface, with full provenance visibility.

Optionally pushes CKW reviewer comments (P1/P2 issues) as inline Proof comments, so review feedback is anchored to the relevant text.

## Usage
```
/ckw:publish-proof <path>
/ckw:publish-proof --phase <N>
/ckw:publish-proof <path> --with-review
/ckw:publish-proof --phase <N> --with-review
```

**Examples:**
```
/ckw:publish-proof drafts/executive-summary.md
/ckw:publish-proof --phase 1
/ckw:publish-proof drafts/executive-summary.md --with-review
/ckw:publish-proof --phase 1 --with-review
```

- `<path>`: Path to a single markdown file
- `--phase <N>`: Publish all drafts from phase N
- `--with-review`: Also push P1/P2 reviewer comments to the Proof document

## What This Command Does

Resolve which drafts to publish, invoke the **proof-publisher** skill for each, optionally push review comments, and track published links in `PROOF-LINKS.md`.

### Step 1: Parse Input

- **File path:** From inline argument (validate it exists, is `.md`)
- **Phase number:** From `--phase` flag
- **Review flag:** From `--with-review`
- If nothing provided, prompt: "Which draft do you want to publish? Provide a file path or use --phase N."

### Step 2: Determine Context Mode

Check if the current directory is a CKW project:

**If STATE.md exists (project mode):**
- Read PROJECT.md for project name (used in Proof document title prefix)
- Read STATE.md for current phase status
- Check for REVIEW_REPORT.md in the current phase directory
- If `--phase N` used: resolve phase draft directory from `.planning/phases/` or `drafts/`

**If no STATE.md (standalone mode):**
- Require explicit file path (no `--phase` support)
- Note: "No CKW project found. Publishing in standalone mode."

### Step 3: Resolve Proof Configuration

Read `~/.ckw/config.json` and look for the `proof` section.

**If `proof` section exists:**
Use `base_url` from config.

**If no `proof` section:**
Prompt the user:
```
Proof isn't configured yet. Proof is a collaborative editor that tracks
AI vs. human authorship — great for sharing drafts with teammates.

Use the hosted version at proofeditor.ai? (No signup needed)
Or enter a custom server URL for self-hosted Proof.
```

Options:
1. Use hosted (https://proofeditor.ai) — **default**
2. Enter custom URL

After user confirms, add the `proof` section to `~/.ckw/config.json`:
```json
{
  "proof": {
    "base_url": "https://proofeditor.ai"
  }
}
```

### Step 4: Resolve Files to Publish

**Single file (`<path>`):**
- Validate file exists and is `.md`
- If not found: "Draft not found at {path}. Check the path and try again."

**Phase (`--phase N`):**
1. Read ROADMAP.md to find phase N's name and directory
2. Look for drafts in:
   - `.planning/phases/{NN}-{phase-name}/drafts/` (formal phase structure)
   - `drafts/` (flat structure)
3. List all `.md` files found
4. If no drafts found: "No drafts found for phase {N}. Run /ckw:execute-phase {N} first."

**Confirm before publishing:**
```
Ready to publish to Proof at {base_url}:

  1. drafts/executive-summary.md     (2,450 words)
  2. drafts/market-analysis.md       (3,800 words)
  3. drafts/recommendations.md       (1,900 words)

Publish all 3 files?
```

Wait for user confirmation.

### Step 5: Check for Review Report

If `--with-review` flag is set, or if REVIEW_REPORT.md exists in the phase directory:

**If `--with-review` and no REVIEW_REPORT.md:**
```
No review report found for this phase.
Run /ckw:review-phase first, or publish without review comments.
```
Offer to continue without review comments.

**If REVIEW_REPORT.md exists but `--with-review` not set:**
```
A review report exists for this phase. Push reviewer comments to Proof?
This adds P1/P2 issues as inline comments anchored to the draft text.
```
Wait for user response.

### Step 6: Check for Re-publish

Before publishing each file, check if `PROOF-LINKS.md` exists and contains an entry for this draft.

**If previously published:**
```
This draft was previously published to Proof:
  https://proofeditor.ai/d/abc12345 (published 2026-03-10)

Create a new Proof document? The old one stays active — it won't be deleted.
```
Wait for confirmation. If yes, mark old entry as `superseded` in PROOF-LINKS.md.

### Step 7: Publish Each File

For each file, invoke the **proof-publisher** skill with:
- Source file path
- Proof base URL
- Title: `{project_name}: {document_title}` (project mode) or just `{document_title}` (standalone)

The skill handles: health check, document creation, credential return.

Report progress after each file:
```
[1/3] drafts/executive-summary.md
      Published: https://proofeditor.ai/d/abc12345
```

### Step 8: Push Review Comments (if opted in)

If review comments are being pushed:

1. Read REVIEW_REPORT.md
2. Parse P1 and P2 issue tables. Expected format:
   ```
   | ID | Severity | Draft | Issue | Quote |
   ```
   Or similar markdown table structure — parse flexibly.
3. For each P1/P2 issue:
   - Match the `Draft` column to one of the published files
   - Extract the `Quote` column as the anchor text
   - Build the comment text: `[{Severity}] {Issue description}`
   - Call the proof-publisher skill to push the comment to the matching Proof document
4. Track results: how many anchored (quote matched), how many unanchored (quote not found, posted without anchor)

Report:
```
Review comments pushed:
  executive-summary: 3 comments (2 anchored, 1 unanchored)
  market-analysis:   1 comment (1 anchored)
  recommendations:   0 comments (no P1/P2 issues)
```

### Step 9: Write PROOF-LINKS.md

Create or update `PROOF-LINKS.md` in the project root (or current directory in standalone mode):

```markdown
# Proof Links

Published drafts with shareable links for collaborative review.
Proof tracks AI vs. human authorship — edits made in the Proof editor are attributed to the person making them.

| Draft | View URL | Edit URL | Published | Status |
|-------|----------|----------|-----------|--------|
| drafts/executive-summary.md | [View](https://proofeditor.ai/d/abc123) | [Edit](https://proofeditor.ai/d/abc123?token=...) | 2026-03-12 | current |
| drafts/market-analysis.md | [View](https://proofeditor.ai/d/def456) | [Edit](https://proofeditor.ai/d/def456?token=...) | 2026-03-12 | current |
```

**Re-publish entries:** When a draft is re-published, mark the old row's Status as `superseded` and add the new row.

**Security note:** Token URLs grant edit access. PROOF-LINKS.md contains these tokens. If the project is on a shared Google Drive, anyone with drive access can see the edit links. This is by design — teammates need edit access to review.

### Step 10: Report Results

```
Published to Proof!

  drafts/executive-summary.md
    View:  https://proofeditor.ai/d/abc12345
    Edit:  https://proofeditor.ai/d/abc12345?token=...
    Review comments: 3 (2 anchored, 1 unanchored)

  drafts/market-analysis.md
    View:  https://proofeditor.ai/d/def45678
    Edit:  https://proofeditor.ai/d/def45678?token=...
    Review comments: 1 (1 anchored)

Links saved to PROOF-LINKS.md

Share the View links with anyone who needs to read.
Share the Edit links with teammates who need to comment or edit.
Proof tracks AI vs. human authorship — edits in the Proof editor are
automatically attributed to the person making them.

Next:
  Open the links to review in Proof
  /ckw:progress               Check project status
  /ckw:export-document         Export to .docx/.pdf for formal delivery
  /ckw:compound                Capture what worked for future projects
```

## Design Notes

- **Why a separate skill?** The proof-publisher skill handles HTTP interactions cleanly, keeping the command focused on CKW workflow logic. The skill can also be invoked directly by users outside the command context.
- **Why curl?** No npm dependencies, works on any system, matches CKW's zero-infrastructure philosophy. The API is simple REST — curl is sufficient.
- **Why default to hosted?** proofeditor.ai works without setup. Self-hosting requires running a Node.js server — an optional step for teams wanting data sovereignty.
- **Why PROOF-LINKS.md?** Keeps published links discoverable in the project directory. Teammates browsing the Google Drive folder can find and open Proof links without needing CKW.
- **Token security:** Token URLs are stored in PROOF-LINKS.md. This is intentional — the file lives alongside drafts on the shared drive, and teammates need edit access for review. The ownerSecret (for deletion/revocation) is NOT stored — only returned at creation time.

## Error Handling

- **No file path or phase:** "Which draft do you want to publish? Provide a file path or use --phase N."
- **File not found:** "Draft not found at {path}. Check the path and try again."
- **Not a markdown file:** "Proof publisher works with markdown (.md) files. Convert first with /ckw:import-reference."
- **No drafts in phase:** "No drafts found for phase {N}. Run /ckw:execute-phase {N} first."
- **Proof unreachable:** "Can't reach Proof at {url}. Check your connection or server status."
- **Document creation fails:** Show error details from Proof server response.
- **Review comments fail:** Log per-comment warnings, continue with remaining. "Warning: {N} comments couldn't be pushed."
- **No REVIEW_REPORT.md (with --with-review):** "No review report found. Run /ckw:review-phase first, or publish without review comments."
- **Config.json missing:** Proceed with hosted default, offer to create config.
- **PROOF-LINKS.md write fails:** "Can't write PROOF-LINKS.md. Check file permissions. Links were printed above — copy them manually."
