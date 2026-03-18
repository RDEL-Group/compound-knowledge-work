#!/usr/bin/env python3
"""Convert Google Sheets values API JSON to markdown tables.

Usage: python3 sheets_to_markdown.py <json_file> [sheet_name]

Reads the JSON output from `gws sheets spreadsheets values get` and
produces a markdown table on stdout. If sheet_name is provided, it's
used as a heading.
"""

import json
import sys

MAX_ROWS = 1000


def values_to_markdown(data, sheet_name=None):
    """Convert a Sheets values response to a markdown table."""
    values = data.get("values", [])
    if not values:
        return "(empty sheet)\n"

    truncated = False
    if len(values) > MAX_ROWS + 1:  # +1 for header
        truncated = True
        values = values[: MAX_ROWS + 1]

    # Normalize column count
    max_cols = max(len(row) for row in values)
    for row in values:
        while len(row) < max_cols:
            row.append("")

    lines = []

    if sheet_name:
        lines.append(f"## {sheet_name}")
        lines.append("")

    # Header row
    header = values[0]
    lines.append("| " + " | ".join(str(c).replace("|", "\\|") for c in header) + " |")
    lines.append("| " + " | ".join(["---"] * max_cols) + " |")

    # Data rows
    for row in values[1:]:
        cells = [str(c).replace("|", "\\|").replace("\n", " ") for c in row]
        lines.append("| " + " | ".join(cells) + " |")

    if truncated:
        lines.append("")
        lines.append(
            f"*Showing first {MAX_ROWS} data rows. "
            f"Specify a range (e.g., 'A1:Z100') for targeted data.*"
        )

    return "\n".join(lines) + "\n"


def main():
    if len(sys.argv) < 2:
        print(
            "Usage: python3 sheets_to_markdown.py <json_file> [sheet_name]",
            file=sys.stderr,
        )
        sys.exit(1)

    with open(sys.argv[1]) as f:
        data = json.load(f)

    sheet_name = sys.argv[2] if len(sys.argv) > 2 else None
    print(values_to_markdown(data, sheet_name))


if __name__ == "__main__":
    main()
