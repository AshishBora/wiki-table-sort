# Wikipedia Table Sorter Chrome Extension

A Chrome extension that allows you to sort Wikipedia tables directly in edit mode while preserving all formatting.

## Features

- **Smart Table Detection**: Automatically finds sortable Wikipedia tables in edit mode
- **Preserves Formatting**: Maintains all Wikipedia markup, links, images, and styling
- **Multiple Data Types**: Handles text, numbers, dates, and years intelligently
- **Easy to Use**: Simple UI with column selection and sort direction
- **Safe Editing**: Only modifies table row order, preserving all other content

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will now be active on Wikipedia edit pages

## How to Use

1. Navigate to any Wikipedia article
2. Click "Edit" to enter edit mode
3. Look for the "⬍ Sort Table" button near the text editor toolbar
4. Click the button to open the sort options panel
5. Select the column you want to sort by
6. Choose ascending or descending order
7. Click "Apply Sort" to update the table

## Supported Wikipedia Table Format

The extension works with standard Wikipedia table syntax:
```
{| class="wikitable sortable"
! Header 1 !! Header 2 !! Header 3
|-
| Cell 1 || Cell 2 || Cell 3
|-
| Cell 4 || Cell 5 || Cell 6
|}
```

## Testing

Open `test.html` in your browser to test the extension functionality with sample Wikipedia table data.

## File Structure

- `manifest.json` - Extension configuration
- `content-script.js` - Main extension logic
- `table-parser.js` - Wikipedia table parsing functionality
- `table-sorter.js` - Table sorting algorithms
- `ui-components.js` - User interface components
- `styles.css` - Extension styling
- `popup.html` - Extension popup interface
- `test.html` - Local testing page

## Technical Details

The extension:
- Parses Wikipedia's wikitable markup format
- Extracts sortable values while preserving original formatting
- Handles complex cell content (images, links, templates)
- Intelligently detects data types (numbers, years, text)
- Reconstructs tables maintaining exact Wikipedia syntax

## Contributing

Feel free to submit issues or pull requests to improve the extension.

## License

MIT License