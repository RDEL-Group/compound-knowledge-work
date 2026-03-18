#!/usr/bin/env python3
"""Convert Google Docs API JSON to markdown.

Usage: python3 docs_to_markdown.py <json_file>

Reads the JSON output from `gws docs documents get` and produces
clean markdown on stdout.
"""

import json
import sys


def extract_text_run(element):
    """Extract text from a textRun element with markdown formatting."""
    if "textRun" not in element:
        return ""
    tr = element["textRun"]
    content = tr.get("content", "")
    style = tr.get("textStyle", {})

    # Don't format whitespace-only content
    stripped = content.strip()
    if not stripped:
        return content

    # Apply formatting (bold before italic to handle both)
    prefix = ""
    suffix = ""
    if style.get("bold"):
        prefix += "**"
        suffix = "**" + suffix
    if style.get("italic"):
        prefix += "*"
        suffix = "*" + suffix
    if style.get("strikethrough"):
        prefix += "~~"
        suffix = "~~" + suffix

    # Handle links
    link = style.get("link", {})
    url = link.get("url", "")
    if url:
        return f"[{stripped}]({url})"

    # Preserve leading/trailing whitespace outside formatting
    leading = content[: len(content) - len(content.lstrip())]
    trailing = content[len(content.rstrip()) :]
    return leading + prefix + stripped + suffix + trailing


def process_paragraph(paragraph, lists_meta):
    """Convert a paragraph element to markdown."""
    style_type = paragraph.get("paragraphStyle", {}).get("namedStyleType", "NORMAL_TEXT")
    elements = paragraph.get("elements", [])

    # Build the text content
    text = ""
    for elem in elements:
        if "textRun" in elem:
            text += extract_text_run(elem)
        elif "inlineObjectElement" in elem:
            text += "[image]"

    text = text.rstrip("\n")

    # Skip empty paragraphs
    if not text.strip():
        return ""

    # Handle headings
    heading_map = {
        "TITLE": "# ",
        "SUBTITLE": "## ",
        "HEADING_1": "# ",
        "HEADING_2": "## ",
        "HEADING_3": "### ",
        "HEADING_4": "#### ",
        "HEADING_5": "##### ",
        "HEADING_6": "###### ",
    }

    prefix = heading_map.get(style_type, "")

    # Handle bullets/lists
    bullet = paragraph.get("bullet", {})
    if bullet:
        nesting = bullet.get("nestingLevel", 0)
        indent = "  " * nesting
        list_id = bullet.get("listId", "")
        # Check if ordered list
        is_ordered = False
        if list_id and list_id in lists_meta:
            nesting_levels = (
                lists_meta[list_id]
                .get("listProperties", {})
                .get("nestingLevels", [])
            )
            if nesting < len(nesting_levels):
                level = nesting_levels[nesting]
                glyph = level.get("glyphType", "")
                if glyph and glyph not in ("GLYPH_TYPE_UNSPECIFIED",):
                    # Glyph types like DECIMAL, ALPHA, ROMAN indicate ordered
                    is_ordered = glyph in (
                        "DECIMAL",
                        "ALPHA",
                        "UPPER_ALPHA",
                        "ROMAN",
                        "UPPER_ROMAN",
                    )

        marker = "1. " if is_ordered else "- "
        return indent + marker + text.strip()

    return prefix + text.strip()


def process_table(table):
    """Convert a table element to markdown."""
    rows = table.get("tableRows", [])
    if not rows:
        return ""

    md_rows = []
    for row in rows:
        cells = []
        for cell in row.get("tableCells", []):
            cell_text = ""
            for content in cell.get("content", []):
                if "paragraph" in content:
                    for elem in content["paragraph"].get("elements", []):
                        if "textRun" in elem:
                            cell_text += elem["textRun"].get("content", "").strip()
            cells.append(cell_text.replace("|", "\\|").replace("\n", " "))
        md_rows.append(cells)

    if not md_rows:
        return ""

    # Normalize column count
    max_cols = max(len(r) for r in md_rows)
    for r in md_rows:
        while len(r) < max_cols:
            r.append("")

    lines = []
    # Header row
    lines.append("| " + " | ".join(md_rows[0]) + " |")
    lines.append("| " + " | ".join(["---"] * max_cols) + " |")
    # Data rows
    for row in md_rows[1:]:
        lines.append("| " + " | ".join(row) + " |")

    return "\n".join(lines)


def convert(doc):
    """Convert a full Google Docs API response to markdown."""
    title = doc.get("title", "Untitled")
    body = doc.get("body", {})
    content = body.get("content", [])
    lists_meta = doc.get("lists", {})

    output = [f"# {title}", ""]

    for element in content:
        if "paragraph" in element:
            line = process_paragraph(element["paragraph"], lists_meta)
            if line is not None:
                output.append(line)
        elif "table" in element:
            output.append("")
            output.append(process_table(element["table"]))
            output.append("")
        elif "sectionBreak" in element:
            continue

    # Clean up: collapse multiple blank lines
    cleaned = []
    prev_blank = False
    for line in output:
        if line == "":
            if not prev_blank:
                cleaned.append(line)
            prev_blank = True
        else:
            prev_blank = False
            cleaned.append(line)

    return "\n".join(cleaned).strip() + "\n"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 docs_to_markdown.py <json_file>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1]) as f:
        doc = json.load(f)

    print(convert(doc))


if __name__ == "__main__":
    main()
