---
name: import-summarizer
description: >
  Convert and summarize reference materials (.docx, .pdf, .pptx, .html, .txt, .md)
  into context-budget-friendly indexed summaries. Use this skill when the user asks
  to "import a document", "convert a PDF", "read a .docx file", "summarize a reference",
  "process reference materials", or when any CKW agent needs to convert non-markdown
  files to readable text and generate summaries for the reference index.
compatibility: macOS (textutil), pandoc, or python3 with python-docx/PyPDF2
---

# Import Summarizer

Convert and process reference materials into indexed, context-budget-friendly summaries. This is the gateway for all reference materials entering a CKW project.

## When to Use

- `/ckw:new-project --from-prd` needs to read a PRD document
- `/ckw:import-reference` processes reference materials
- Any agent needs to convert a non-markdown document to readable text

## Document Conversion

### Supported formats

| Format | macOS (preferred) | Cross-platform fallback | Last resort |
|--------|-------------------|------------------------|-------------|
| .docx | `textutil -convert txt -stdout` | `pandoc -t markdown` | `python3` with python-docx |
| .pdf | `textutil -convert txt -stdout` | `pandoc -t markdown` | `python3` with PyPDF2 |
| .pptx | `textutil -convert txt -stdout` | `pandoc -t markdown` | `python3` with python-pptx |
| .txt | Direct read | Direct read | Direct read |
| .md | Direct read | Direct read | Direct read |
| .html | `textutil -convert txt -stdout` | `pandoc -t markdown` | Strip tags with sed |

### Convert the document

Execute `scripts/convert_document.sh <filepath>` for document conversion. The script uses a cascading fallback strategy: textutil (macOS) → pandoc → Python libraries.

Detect the file type from its extension. For `.md` and `.txt`, read directly. For all other supported formats, run the conversion script. If no converter is available, tell the user what to install.

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
  Satellite_PRD_FY2026.docx     (~4,500 tokens)  — Product requirements
  Competitor_Analysis.pdf        (~2,100 tokens)  — Market research
  Brand_Guidelines.docx          (~1,800 tokens)  — Voice and tone
  Past_Proposal_Win.pdf          (~6,200 tokens)  — Reference example

Total reference budget: ~14,600 tokens
```

## Error Handling
- **No converter available** — Tell the user what to install: "Install pandoc (`brew install pandoc`) or run on macOS where textutil is built in."
- **Garbled output** (common with complex PDFs) — Warn the user and suggest pasting the content manually
- **Very large file** (>50,000 tokens estimated) — Warn about context budget impact and ask the user to identify which sections are most relevant
