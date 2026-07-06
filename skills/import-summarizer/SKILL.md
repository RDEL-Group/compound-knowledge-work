---
name: import-summarizer
description: >
  Convert and summarize reference materials (.docx, .pdf, .pptx, .html, .txt, .md)
  into context-budget-friendly indexed summaries. Use this skill when the user asks
  to "import a document", "convert a PDF", "read a .docx file", "summarize a reference",
  "process reference materials", or when any CKW agent needs to convert non-markdown
  files to readable text and generate summaries for the reference index.
compatibility: pandoc (docx/pptx/html/rtf), textutil (macOS), python-docx (optional docx fallback); PDFs use Claude's native Read tool
---

# Import Summarizer

Convert and process reference materials into indexed, context-budget-friendly summaries. This is the gateway for all reference materials entering a CKW project.

## When to Use

- `/ckw:new-project --from-prd` needs to read a PRD document
- `/ckw:import-reference` processes reference materials
- Any agent needs to convert a non-markdown document to readable text

## Document Conversion

### Supported formats

| Format | How CKW converts it |
|--------|---------------------|
| **.pdf** | **Claude's native Read tool** — read the file directly, no script. Claude extracts PDF text and layout natively, which is more reliable than any shell converter. |
| .docx | `scripts/convert_document.sh` — pandoc → textutil (macOS) → python-docx |
| .pptx | `scripts/convert_document.sh` — pandoc (needs pandoc ≥ 3.7, which reads PowerPoint natively) |
| .html / .htm | `scripts/convert_document.sh` — pandoc → textutil (macOS) |
| .rtf | `scripts/convert_document.sh` — textutil (macOS) → pandoc |
| .txt / .md | Direct read — no conversion |

### Convert the document

Detect the file type from its extension (matched case-insensitively — `Report.DOCX` is fine):

- **.pdf** — Do **not** run the script. Use Claude's **Read tool** on the file directly; it extracts text and layout natively. (Older docs referenced a PyPDF2 fallback and a python-pptx path — neither was ever implemented, and neither is needed.)
- **.txt / .md** — Read directly.
- **.docx / .pptx / .html / .rtf** — Run `scripts/convert_document.sh <filepath>` (path relative to this SKILL.md). The script picks the right converter per format, verifies the output is non-empty before reporting success, and prints a clear error (including the converter's own stderr) if conversion fails. If it reports that no converter is available, tell the user what to install.

The script now fails loudly on empty/garbled output rather than returning silent garbage (the old behaviour for PDF and PowerPoint via `textutil`). If conversion fails, surface the error and offer to have the user paste the content manually.

## Summarization

After converting to readable text, generate a summary index file.

### Input
- Converted text content
- Original file path and metadata (size, type, date)

### Output
Save to `reference/.index/{filename}.md` using the template in `assets/summary-template.md`.

### Rules
1. **Preserve specifics** — Names, dates, dollar amounts, percentages, technical specs must be exact
2. **Flag structure** — Note if the document has tables, appendices, scoring rubrics, or forms
3. **Estimate tokens** — Use `word_count * 1.3` as token estimate in the YAML frontmatter
4. **Map sections** — Map major sections so the context-loader can pull specific parts
5. **Don't interpret** — Summarize what the document says, not what it means for the project. Interpretation is the planner's job.

## Batch Mode

When processing multiple files (e.g., during `/ckw:adopt-project`):

Process each file sequentially. After all files, present a summary:
```
Imported 4 reference files:
  Northwind_Q3_Proposal.docx    (~4,500 tokens)  — Product requirements
  Competitor_Analysis.pdf        (~2,100 tokens)  — Market research
  Brand_Guidelines.docx          (~1,800 tokens)  — Voice and tone
  Past_Proposal_Win.pdf          (~6,200 tokens)  — Reference example

Total reference budget: ~14,600 tokens
```

## Error Handling
- **No converter available** — Tell the user what to install: "Install pandoc (`brew install pandoc`) or run on macOS where textutil is built in."
- **Garbled output** (common with complex PDFs) — Warn the user and suggest pasting the content manually
- **Very large file** (>50,000 tokens estimated) — Warn about context budget impact and ask the user to identify which sections are most relevant
