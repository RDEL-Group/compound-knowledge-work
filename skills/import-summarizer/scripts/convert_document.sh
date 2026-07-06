#!/usr/bin/env bash
# CKW Import Summarizer — Document Conversion Script
#
# Converts .docx, .pptx, .html, .rtf, .txt, .md files to plain text / markdown.
#
# PDF is intentionally NOT handled here — Claude reads PDFs with its native
# Read tool, which extracts text and layout far better than any shell converter.
# Calling this script with a .pdf returns an error pointing at the Read tool.
#
# Per-format strategy (the first converter that yields NON-EMPTY output wins):
#   .docx        pandoc -> textutil (macOS) -> python-docx
#   .pptx        pandoc   (requires pandoc >= 3.7; textutil emits empty output for pptx)
#   .html/.htm   pandoc -> textutil (macOS)
#   .rtf         textutil (macOS) -> pandoc
#   .txt/.md     direct read
#
# The script never emits empty output while claiming success, matches the file
# extension case-insensitively, and surfaces the converter's own stderr on failure.

set -uo pipefail   # NB: no -e — a failed converter attempt must fall through to the next.

# Print $1 to stdout only if it contains at least one non-whitespace character.
emit_if_nonempty() {
  if printf '%s' "$1" | grep -q '[^[:space:]]'; then
    printf '%s\n' "$1"
    return 0
  fi
  return 1
}

# convert_with <errfile> <command...>
# Runs the command, capturing stdout; on non-empty success echoes it and returns 0.
# Converter stderr is captured to <errfile> (surfaced by the caller on total failure).
convert_with() {
  local errfile="$1"; shift
  local out rc
  out="$("$@" 2>"$errfile")" && rc=0 || rc=$?
  [ "$rc" -eq 0 ] || return 1
  emit_if_nonempty "$out"
}

convert_document() {
  local filepath="$1"
  local ext="${filepath##*.}"
  ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"   # case-insensitive: Report.DOCX == report.docx

  if [ ! -f "$filepath" ]; then
    echo "ERROR: File not found: $filepath" >&2
    return 1
  fi

  local errfile; errfile="$(mktemp)"
  trap 'rm -f "$errfile"' RETURN

  case "$ext" in
    md|txt)
      cat "$filepath"
      ;;

    pdf)
      echo "ERROR: PDF conversion is handled by Claude's native Read tool, not this script." >&2
      echo "       Read the .pdf directly — do not route it through convert_document.sh." >&2
      return 1
      ;;

    docx)
      command -v pandoc   >/dev/null 2>&1 && convert_with "$errfile" pandoc "$filepath" -t markdown && return 0
      command -v textutil >/dev/null 2>&1 && convert_with "$errfile" textutil -convert txt -stdout "$filepath" && return 0
      if python3 -c "import docx" >/dev/null 2>&1; then
        local out rc
        # Filepath passed as an argv, never interpolated into source — safe for
        # apostrophes/spaces and not a code-execution vector.
        out="$(python3 - "$filepath" 2>"$errfile" <<'PY'
import sys
from docx import Document
doc = Document(sys.argv[1])
for p in doc.paragraphs:
    print(p.text)
for table in doc.tables:
    for row in table.rows:
        print(' | '.join(cell.text for cell in row.cells))
PY
)" && rc=0 || rc=$?
        [ "$rc" -eq 0 ] && emit_if_nonempty "$out" && return 0
      fi
      echo "ERROR: Could not extract text from .docx (tried pandoc, textutil, python-docx)." >&2
      [ -s "$errfile" ] && sed 's/^/  /' "$errfile" >&2
      echo "  Install pandoc (brew install pandoc) or python-docx (pip install python-docx)." >&2
      return 1
      ;;

    pptx)
      # Modern pandoc (>= 3.7) reads PowerPoint natively; textutil emits empty output for pptx.
      command -v pandoc >/dev/null 2>&1 && convert_with "$errfile" pandoc "$filepath" -t markdown && return 0
      echo "ERROR: .pptx requires pandoc >= 3.7 (pandoc reads PowerPoint natively)." >&2
      if command -v pandoc >/dev/null 2>&1; then
        echo "  Installed: $(pandoc --version | head -1). Upgrade if older than 3.7." >&2
      else
        echo "  Install pandoc: brew install pandoc" >&2
      fi
      [ -s "$errfile" ] && sed 's/^/  /' "$errfile" >&2
      return 1
      ;;

    html|htm)
      command -v pandoc   >/dev/null 2>&1 && convert_with "$errfile" pandoc "$filepath" -t markdown && return 0
      command -v textutil >/dev/null 2>&1 && convert_with "$errfile" textutil -convert txt -stdout "$filepath" && return 0
      echo "ERROR: Could not convert .html (tried pandoc, textutil)." >&2
      [ -s "$errfile" ] && sed 's/^/  /' "$errfile" >&2
      return 1
      ;;

    rtf)
      command -v textutil >/dev/null 2>&1 && convert_with "$errfile" textutil -convert txt -stdout "$filepath" && return 0
      command -v pandoc   >/dev/null 2>&1 && convert_with "$errfile" pandoc "$filepath" -t markdown && return 0
      echo "ERROR: Could not convert .rtf (tried textutil, pandoc)." >&2
      [ -s "$errfile" ] && sed 's/^/  /' "$errfile" >&2
      return 1
      ;;

    *)
      echo "ERROR: Unsupported file format: .$ext" >&2
      echo "       Supported: .docx .pptx .html .rtf .txt .md   (PDF via Claude's Read tool)" >&2
      return 1
      ;;
  esac
}

# Allow direct execution: ./convert_document.sh <filepath>
if [ "${1:-}" != "" ]; then
  convert_document "$1"
fi
