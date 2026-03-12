---
name: proof-publisher
description: >
  Publish markdown drafts to Proof (proofeditor.ai) for collaborative review with AI provenance tracking.
  Use this skill when the user asks to "publish to Proof", "share a draft for review", or when the
  /ckw:publish-proof command needs to create or update Proof documents.
compatibility: curl (pre-installed on macOS/Linux)
---

# Proof Publisher

Publish CKW markdown drafts to Proof — a collaborative document editor with character-level AI provenance tracking. Proof shows exactly what was written by AI vs. what was edited by humans, and gives teammates a Google-Docs-like interface for reviewing and commenting on drafts.

## When to Use

- User asks to "publish to Proof", "share on Proof", "send to Proof for review"
- After `/ckw:execute-phase` completes and drafts are ready for human review
- After `/ckw:review-phase` passes and you want reviewer comments visible inline
- The `/ckw:publish-proof` command invokes this skill

## Prerequisites

Check that `curl` is available (it should be on any macOS/Linux system):

```bash
which curl
```

**If curl is not found:**
```
curl is required for Proof publishing but isn't installed.
This is unusual — curl is pre-installed on macOS and most Linux distributions.
```

Stop here — do not attempt to publish without curl.

## Proof API Reference

Proof works with both the hosted version (proofeditor.ai) and self-hosted instances. The API is identical — only the base URL changes.

| Operation | Method | Endpoint | Auth Required |
|-----------|--------|----------|---------------|
| Create document | POST | `{base_url}/share/markdown` | None |
| Read state | GET | `{base_url}/api/agent/{slug}/state` | x-share-token |
| Add comment | POST | `{base_url}/api/agent/{slug}/ops` | x-share-token |
| Add suggestion | POST | `{base_url}/api/agent/{slug}/ops` | x-share-token |
| Health check | GET | `{base_url}/health` | None |

## Usage

This skill is invoked by the `/ckw:publish-proof` command or conversationally. Parse the user's intent:

**Single file:**
```
Publish drafts/executive-summary.md to Proof
```

**With review comments:**
```
Publish drafts/executive-summary.md to Proof with review comments
```

**Check status of existing doc:**
```
What's the current state of the Proof doc for executive-summary?
```

## Publishing Process

### Step 1: Read Proof Configuration

Read `~/.ckw/config.json` and look for the `proof` section:

```json
{
  "proof": {
    "base_url": "https://proofeditor.ai"
  }
}
```

- **If `proof` section exists:** Use `base_url` from config
- **If no `proof` section:** Default to `https://proofeditor.ai`
- **If no config.json at all:** Default to `https://proofeditor.ai`

### Step 2: Health Check

Verify the Proof server is reachable:

```bash
curl -s -o /dev/null -w "%{http_code}" "{base_url}/health"
```

- **If 200:** Proceed
- **If connection refused or timeout:**
```
Can't reach Proof at {base_url}.

If using the hosted version (proofeditor.ai), check your internet connection.
If self-hosting, make sure the server is running:
  cd proof-sdk && npm run serve
```
Stop here.

### Step 3: Read Source File

Read the markdown file to be published. Validate:
- File exists
- File is `.md` format
- File is not empty

Extract the title:
1. Look for the first `# ` heading in the file → use as title
2. If no heading found → use the filename without extension (e.g., `executive-summary` → `Executive Summary`)

### Step 4: Create Proof Document

```bash
curl -s -X POST "{base_url}/share/markdown" \
  -H "Content-Type: application/json" \
  -d '{"title": "{title}", "markdown": "{markdown_content}"}'
```

**Note on escaping:** The markdown content must be properly JSON-escaped. Use a temporary file approach if the content contains special characters:

```bash
# Write JSON payload to temp file to handle escaping
python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    md = f.read()
print(json.dumps({'title': sys.argv[2], 'markdown': md}))
" "{source_file}" "{title}" > /tmp/ckw-proof-payload.json

curl -s -X POST "{base_url}/share/markdown" \
  -H "Content-Type: application/json" \
  -d @/tmp/ckw-proof-payload.json

rm -f /tmp/ckw-proof-payload.json
```

**Expected response:**
```json
{
  "success": true,
  "slug": "abc12345",
  "shareUrl": "https://proofeditor.ai/d/abc12345",
  "tokenUrl": "https://proofeditor.ai/d/abc12345?token=...",
  "accessToken": "...",
  "ownerSecret": "..."
}
```

**If creation fails:**
- Check the HTTP status code and response body
- Report the error to the user with the server's error message
- Common issues: markdown too large, server overloaded, malformed JSON

### Step 5: Store Credentials

From the creation response, capture and return:
- `slug` — document identifier (needed for all subsequent API calls)
- `shareUrl` — view-only link (safe to share broadly)
- `tokenUrl` — edit-access link (share with teammates who need to review/edit)
- `accessToken` — API token (needed for adding comments, stored in PROOF-LINKS.md)
- `ownerSecret` — management token (needed to delete/revoke the document)

### Step 6: Push Review Comments (Optional)

If review comments are provided (from REVIEW_REPORT.md), push each as a Proof comment:

For each comment:
```bash
curl -s -X POST "{base_url}/api/agent/{slug}/ops" \
  -H "Content-Type: application/json" \
  -H "x-share-token: {accessToken}" \
  -H "X-Agent-Id: ckw-reviewer" \
  -d '{"type": "comment.add", "quote": "{quoted_text}", "text": "{comment_text}"}'
```

**Expected response (success):**
```json
{
  "success": true,
  "markId": "...",
  "marks": { ... }
}
```

**If quote not found:**
The response will contain `"code": "quote_not_found"`. In this case, retry without the quote field to post as an unanchored document comment:

```bash
curl -s -X POST "{base_url}/api/agent/{slug}/ops" \
  -H "Content-Type: application/json" \
  -H "x-share-token: {accessToken}" \
  -H "X-Agent-Id: ckw-reviewer" \
  -d '{"type": "comment.add", "text": "{comment_text}"}'
```

**If a comment fails entirely:** Log a warning and continue with the next comment. Comment failures are non-blocking — the document is already published.

### Step 7: Report Results

**Single file, no comments:**
```
Published to Proof!

  drafts/executive-summary.md
  View:  https://proofeditor.ai/d/abc12345
  Edit:  https://proofeditor.ai/d/abc12345?token=...

Share the View link with anyone who needs to read it.
Share the Edit link with teammates who need to comment or edit.

Proof tracks AI vs. human authorship automatically — edits made in the Proof editor
will be attributed to the person making them.
```

**With review comments:**
```
Published to Proof with review comments!

  drafts/executive-summary.md
  View:  https://proofeditor.ai/d/abc12345
  Edit:  https://proofeditor.ai/d/abc12345?token=...

  Review comments: 5 pushed (4 anchored to text, 1 unanchored)

Teammates will see reviewer comments inline, anchored to the relevant text.
They can reply, resolve, or use comments to guide their edits.
```

## Error Handling

- **curl not installed** → "curl is required but not found. This is unusual on macOS/Linux."
- **Proof server unreachable** → "Can't reach Proof at {url}. Check your connection or server status."
- **Document creation fails** → Show HTTP status + error message from response
- **Markdown too large** → "This document may be too large for Proof. Consider splitting it into sections."
- **JSON escaping fails** → "Could not prepare the document for upload. Check for unusual characters in the markdown."
- **Comment push fails** → "Warning: Could not push comment '{first 50 chars}...'. Continuing with remaining comments."
- **All comments fail** → "Warning: Could not push any review comments. The document is published but has no inline comments."

## Known Issues

### Proof SDK is very new (March 2026)
The API may change. If document creation starts failing, check the Proof SDK GitHub repo for API changes: https://github.com/EveryInc/proof-sdk

### Content created via API is tracked as AI-authored
All content published through the API is automatically attributed as AI-generated in Proof's provenance model. This is correct for CKW drafts (they are AI-generated). When humans edit in the Proof editor, their changes are tracked as human-authored.

### Large documents may be slow
Proof processes markdown in real-time for collaborative editing. Very large documents (>50,000 words) may be slow to create or load. Consider publishing individual sections rather than monolithic drafts.

### Token URLs contain sensitive access tokens
The token URL (with `?token=...`) grants edit access. Share it only with trusted teammates. The view URL (without token) is safe for broader distribution.
