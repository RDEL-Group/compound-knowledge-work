# Import-pipeline test fixtures

Small reference documents used to verify the import pipeline
(`skills/import-summarizer/scripts/convert_document.sh` + the PDF Read-tool path).
Consumed by the A7 CI smoke test.

Every fixture contains the sentinel string **`CKW_FIXTURE_SENTINEL`** and the line
"The FY2026 pacing target is 92 percent." so a converter's output can be checked
for real extracted text (not silent garbage).

| Fixture | Purpose | Documented conversion path |
|---------|---------|----------------------------|
| `fixture.docx` | Word extraction | `convert_document.sh` → pandoc/textutil/python-docx |
| `O'Brien Brief.docx` | Apostrophe in filename (was a shell-injection / syntax-error bug) | same |
| `Report.DOCX` | Uppercase extension (previously errored) | same (extension matched case-insensitively) |
| `fixture.pptx` | PowerPoint (previously produced empty output via textutil) | `convert_document.sh` → pandoc ≥ 3.7 |
| `fixture.html` | HTML | `convert_document.sh` → pandoc/textutil |
| `fixture.rtf` | RTF (supported by script, previously undocumented) | `convert_document.sh` → textutil/pandoc |
| `fixture.txt` | Plain text | direct read |
| `fixture.pdf` | PDF (previously dumped raw bytes via textutil) | **Claude's native Read tool** — NOT the script; the script refuses `.pdf` and points at the Read tool |

## Regenerating

```bash
# docx / pptx via pandoc; pdf via macOS cupsfilter; rtf via textutil
pandoc src.md    -o fixture.docx
pandoc slides.md -o fixture.pptx
cupsfilter fixture.txt > fixture.pdf
textutil -convert rtf -output fixture.rtf fixture.txt
```

## Acceptance check

Each non-PDF fixture must yield non-empty output containing the sentinel when passed
to `convert_document.sh`; `.pdf` must make the script exit non-zero with a message
pointing at Claude's Read tool. See A7 (`.github/workflows/smoke.yml`).
