#!/usr/bin/env python3
"""
Fix pandoc-generated .docx files that have embedded fonts without proper
[Content_Types].xml entries.

When pandoc applies a --reference-doc template with embedded fonts, it copies
the font files into the .docx but doesn't register them in [Content_Types].xml.
This causes Word to show an "unreadable content" warning on open.

This script:
1. Opens the .docx (which is a ZIP file)
2. Scans for font files in word/fonts/
3. Adds missing content type entries for each font
4. Re-saves the .docx

Usage:
    python3 fix_docx_content_types.py <input.docx> [output.docx]

If output is omitted, the input file is overwritten.
"""

import sys
import os
import zipfile
import tempfile
import shutil
import xml.etree.ElementTree as ET

# Font file extensions and their MIME content types
FONT_CONTENT_TYPES = {
    '.ttf': 'application/x-font-ttf',
    '.otf': 'application/vnd.ms-opentype',
    '.woff': 'application/font-woff',
    '.woff2': 'font/woff2',
}

# Other common extensions pandoc might copy without registering
EXTRA_CONTENT_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.emf': 'image/x-emf',
    '.wmf': 'image/x-wmf',
}

CONTENT_TYPES_NS = 'http://schemas.openxmlformats.org/package/2006/content-types'


def fix_content_types(docx_path, output_path=None):
    """Fix [Content_Types].xml in a .docx file to register all embedded parts."""

    if output_path is None:
        output_path = docx_path

    # Work in a temp directory
    with tempfile.TemporaryDirectory() as tmpdir:
        # Extract the docx
        extract_dir = os.path.join(tmpdir, 'extracted')
        with zipfile.ZipFile(docx_path, 'r') as zf:
            zf.extractall(extract_dir)

        # Parse [Content_Types].xml
        content_types_path = os.path.join(extract_dir, '[Content_Types].xml')
        if not os.path.exists(content_types_path):
            print(f"ERROR: No [Content_Types].xml found in {docx_path}")
            return False

        # Register the namespace to preserve it in output
        ET.register_namespace('', CONTENT_TYPES_NS)
        tree = ET.parse(content_types_path)
        root = tree.getroot()

        # Collect existing Override partnames and Default extensions
        existing_overrides = set()
        existing_defaults = set()
        for child in root:
            tag = child.tag.replace(f'{{{CONTENT_TYPES_NS}}}', '')
            if tag == 'Override':
                existing_overrides.add(child.get('PartName', ''))
            elif tag == 'Default':
                existing_defaults.add(child.get('Extension', '').lower())

        # Scan all files in the docx for unregistered parts
        fixes_applied = 0
        all_content_types = {**FONT_CONTENT_TYPES, **EXTRA_CONTENT_TYPES}

        for dirpath, dirnames, filenames in os.walk(extract_dir):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                # Get the part name (relative to root, with / prefix)
                relpath = os.path.relpath(filepath, extract_dir)
                partname = '/' + relpath.replace(os.sep, '/')

                # Skip [Content_Types].xml and .rels files
                if partname == '/[Content_Types].xml' or filename.endswith('.rels'):
                    continue

                ext = os.path.splitext(filename)[1].lower()

                # Check if this file's extension has a Default entry
                if ext.lstrip('.') in existing_defaults:
                    continue

                # Check if this specific part has an Override entry
                if partname in existing_overrides:
                    continue

                # This part is unregistered — add an Override
                content_type = all_content_types.get(ext)
                if content_type:
                    override = ET.SubElement(root, f'{{{CONTENT_TYPES_NS}}}Override')
                    override.set('PartName', partname)
                    override.set('ContentType', content_type)
                    existing_overrides.add(partname)
                    fixes_applied += 1
                    print(f"  Fixed: {partname} → {content_type}")

        if fixes_applied == 0:
            print("No fixes needed — all content types are registered.")
            if output_path != docx_path:
                shutil.copy2(docx_path, output_path)
            return True

        # Write the fixed [Content_Types].xml
        tree.write(content_types_path, xml_declaration=True, encoding='UTF-8')

        # Re-package as .docx (ZIP)
        output_tmp = os.path.join(tmpdir, 'output.docx')
        with zipfile.ZipFile(output_tmp, 'w', zipfile.ZIP_DEFLATED) as zf:
            for dirpath, dirnames, filenames in os.walk(extract_dir):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    arcname = os.path.relpath(filepath, extract_dir)
                    zf.write(filepath, arcname)

        # Move to output path
        shutil.move(output_tmp, output_path)
        print(f"Fixed {fixes_applied} content type(s) in {output_path}")
        return True


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <input.docx> [output.docx]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    if not os.path.exists(input_path):
        print(f"ERROR: File not found: {input_path}")
        sys.exit(1)

    success = fix_content_types(input_path, output_path)
    sys.exit(0 if success else 1)
