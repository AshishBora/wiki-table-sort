# Chrome Extension Plan for Wikipedia Table Sorter

## Architecture Overview:
1. **Content Script**: Detects Wikipedia edit pages and adds sorting UI
2. **Table Parser**: Extracts and parses Wikipedia table syntax
3. **Sorting Engine**: Sorts table rows by specified column with proper data type handling
4. **Text Replacer**: Replaces original table with sorted version in the textarea

## Key Components:

### 1. Detection & UI
- Detect when user is on Wikipedia edit page with tables
- Add floating sort button/panel near detected tables
- Column selector dropdown for choosing sort column
- Sort direction toggle (ascending/descending)

### 2. Table Parser
- Parse `{| class="wikitable sortable"` format
- Extract header row (lines with `!`)
- Extract data rows (sections between `|-`)  
- Handle complex cell content (images, links, styling)
- Preserve formatting during sort

### 3. Smart Sorting
- Auto-detect column data types (text, numbers, dates, years)
- Handle Wikipedia-specific formatting (birth/death years in parentheses)
- Sort by clean data but preserve original formatting
- Maintain row integrity across columns

### 4. Text Replacement
- Replace only the specific table being sorted
- Preserve all surrounding content exactly
- Maintain proper Wikipedia syntax

## Files Structure:
```
manifest.json
content-script.js
table-parser.js  
table-sorter.js
ui-components.js
styles.css
```

## Implementation Tasks:
1. Create manifest.json for Chrome extension
2. Implement Wikipedia table parser
3. Create table sorting logic
4. Develop content script for Wikipedia edit pages
5. Create user interface for column selection
6. Implement text replacement functionality
7. Test extension with example table