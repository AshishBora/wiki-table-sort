#!/bin/bash

# Chrome Web Store Extension Packager
# Creates a zip file with only the required files for the Chrome Web Store

# Define the extension name and version
EXTENSION_NAME="wikipedia-table-sorter"
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
ZIP_NAME="${EXTENSION_NAME}-v${VERSION}.zip"

# Required files for Chrome Web Store
REQUIRED_FILES=(
    "manifest.json"
    "popup.html"
    "styles.css"
    "content-script.js"
    "table-parser.js"
    "table-sorter.js"
    "ui-components.js"
    "icon_small.png"
)

echo "Packaging Wikipedia Table Sorter Extension v${VERSION}..."

# Remove existing zip if it exists
if [ -f "$ZIP_NAME" ]; then
    rm "$ZIP_NAME"
    echo "Removed existing $ZIP_NAME"
fi

# Check if all required files exist
missing_files=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "Error: Missing required files:"
    printf '%s\n' "${missing_files[@]}"
    exit 1
fi

# Create the zip file with required files
echo "Adding files..."
zip -q "$ZIP_NAME" "${REQUIRED_FILES[@]}"

# Verify the zip file was created
if [ -f "$ZIP_NAME" ]; then
    echo "✅ Successfully created: $ZIP_NAME"
    echo "📦 Package size: $(ls -lh "$ZIP_NAME" | awk '{print $5}')"
    echo ""
    echo "Contents:"
    unzip -l "$ZIP_NAME"
    echo ""
    echo "Ready for Chrome Web Store upload!"
else
    echo "❌ Failed to create package"
    exit 1
fi