#!/usr/bin/env bash
# CKW Import Summarizer — Document Conversion Script
# Converts .docx, .pdf, .pptx, .html, .rtf files to plain text/markdown
# Uses platform-aware cascading fallback: textutil → pandoc → Python

set -euo pipefail

convert_document() {
  local filepath="$1"
  local ext="${filepath##*.}"

  case "$ext" in
    md|txt)
      cat "$filepath"
      ;;
    docx|pdf|pptx|html|rtf)
      # Try textutil first (macOS)
      if command -v textutil &>/dev/null; then
        textutil -convert txt -stdout "$filepath" 2>/dev/null && return 0
      fi
      # Try pandoc
      if command -v pandoc &>/dev/null; then
        pandoc "$filepath" -t markdown 2>/dev/null && return 0
      fi
      # Python fallback for .docx
      if [ "$ext" = "docx" ] && python3 -c "import docx" 2>/dev/null; then
        python3 -c "
from docx import Document
doc = Document('$filepath')
for p in doc.paragraphs:
    print(p.text)
for table in doc.tables:
    for row in table.rows:
        print(' | '.join(cell.text for cell in row.cells))
" && return 0
      fi
      echo "ERROR: No converter available for .$ext files."
      echo "Install one of: textutil (macOS), pandoc, or python3 with python-docx"
      return 1
      ;;
    *)
      echo "ERROR: Unsupported file format: .$ext"
      return 1
      ;;
  esac
}

# Allow direct execution: ./convert_document.sh <filepath>
if [ "${1:-}" != "" ]; then
  convert_document "$1"
fi
