#!/usr/bin/env python3
"""Convert Google Slides API JSON to markdown.

Usage: python3 slides_to_markdown.py <json_file>

Reads the JSON output from `gws slides presentations get` and produces
markdown on stdout with slide structure preserved.
"""

import json
import sys


def extract_text_from_elements(text_elements):
    """Extract plain text from a list of text elements."""
    parts = []
    for te in text_elements:
        if "textRun" in te:
            content = te["textRun"].get("content", "")
            style = te["textRun"].get("style", {})
            stripped = content.strip()
            if not stripped:
                parts.append(content)
                continue
            prefix = ""
            suffix = ""
            if style.get("bold"):
                prefix += "**"
                suffix = "**" + suffix
            if style.get("italic"):
                prefix += "*"
                suffix = "*" + suffix
            leading = content[: len(content) - len(content.lstrip())]
            trailing = content[len(content.rstrip()) :]
            parts.append(leading + prefix + stripped + suffix + trailing)
    return "".join(parts).strip()


def extract_shape_text(shape):
    """Extract all text content from a shape."""
    text_obj = shape.get("text", {})
    elements = text_obj.get("textElements", [])
    if not elements:
        return ""

    paragraphs = []
    current_parts = []

    for te in elements:
        if "paragraphMarker" in te:
            # Flush previous paragraph
            if current_parts:
                text = extract_text_from_elements(current_parts)
                if text:
                    paragraphs.append(text)
                current_parts = []
        elif "textRun" in te:
            current_parts.append(te)

    # Flush final paragraph
    if current_parts:
        text = extract_text_from_elements(current_parts)
        if text:
            paragraphs.append(text)

    return "\n".join(paragraphs)


def get_slide_title(slide):
    """Try to extract the slide title from page elements."""
    for pe in slide.get("pageElements", []):
        shape = pe.get("shape", {})
        placeholder = shape.get("placeholder", {})
        p_type = placeholder.get("type", "")
        if p_type in ("TITLE", "CENTERED_TITLE"):
            return extract_shape_text(shape)
    # Fallback: first shape with large text or first non-empty shape
    return None


def get_speaker_notes(slide):
    """Extract speaker notes from the notes page."""
    notes_page = slide.get("slideProperties", {}).get("notesPage", {})
    if not notes_page:
        return ""

    for pe in notes_page.get("pageElements", []):
        shape = pe.get("shape", {})
        if shape.get("shapeType") == "TEXT_BOX":
            placeholder = shape.get("placeholder", {})
            if placeholder.get("type") == "BODY":
                text = extract_shape_text(shape)
                if text:
                    return text
    return ""


def convert(presentation):
    """Convert a full Slides API response to markdown."""
    title = presentation.get("title", "Untitled Presentation")
    slides = presentation.get("slides", [])

    output = [f"# {title}", ""]

    for i, slide in enumerate(slides, 1):
        slide_title = get_slide_title(slide)
        if slide_title:
            output.append(f"## Slide {i}: {slide_title}")
        else:
            output.append(f"## Slide {i}")
        output.append("")

        # Collect body text (skip title shape)
        body_parts = []
        for pe in slide.get("pageElements", []):
            shape = pe.get("shape", {})
            placeholder = shape.get("placeholder", {})
            p_type = placeholder.get("type", "")
            if p_type in ("TITLE", "CENTERED_TITLE"):
                continue  # Already used as heading
            text = extract_shape_text(shape)
            if text:
                body_parts.append(text)

        if body_parts:
            output.append("\n\n".join(body_parts))
            output.append("")

        # Speaker notes
        notes = get_speaker_notes(slide)
        if notes:
            output.append(f"> **Speaker notes:** {notes}")
            output.append("")

        output.append("---")
        output.append("")

    return "\n".join(output).strip() + "\n"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 slides_to_markdown.py <json_file>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1]) as f:
        presentation = json.load(f)

    print(convert(presentation))


if __name__ == "__main__":
    main()
