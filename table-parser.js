class WikipediaTableParser {
    constructor() {
        this.tableStartPattern = /^\{\|\s*class="wikitable/;
        this.tableEndPattern = /^\|\}/;
        this.headerPattern = /^!\s*/;
        this.rowSeparatorPattern = /^\|-/;
        this.cellPattern = /^\|\s*/;
    }

    findTables(text) {
        const lines = text.split('\n');
        const tables = [];
        let currentTable = null;
        let inTable = false;
        let startLine = -1;

        console.log('Searching for tables in', lines.length, 'lines');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (this.tableStartPattern.test(line)) {
                console.log('Found table start at line', i, ':', line);
                inTable = true;
                startLine = i;
                currentTable = {
                    startLine,
                    endLine: -1,
                    lines: [],
                    headers: [],
                    rows: []
                };
            } else if (inTable && this.tableEndPattern.test(line)) {
                console.log('Found table end at line', i, ':', line);
                currentTable.endLine = i;
                currentTable.lines = lines.slice(startLine, i + 1);
                this.parseTableContent(currentTable);
                console.log('Parsed table:', currentTable);
                tables.push(currentTable);
                inTable = false;
                currentTable = null;
            }
        }

        console.log('Found', tables.length, 'tables total');
        return tables;
    }

    parseTableContent(table) {
        const lines = table.lines;
        let currentRow = [];
        let inHeader = false;
        let inDataRow = false;
        let rawRowLines = [];

        console.log('Parsing table content, total lines:', lines.length);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Check for table end first
            if (this.tableEndPattern.test(trimmedLine)) {
                // Save the current row before ending
                if (inDataRow && currentRow.length > 0) {
                    table.rows.push(currentRow);
                }
                break; // Stop parsing at table end
            }

            if (this.tableStartPattern.test(trimmedLine) || trimmedLine.startsWith('|+')) {
                continue;
            }

            if (this.headerPattern.test(trimmedLine)) {
                if (!inHeader) {
                    inHeader = true;
                    currentRow = [];
                    rawRowLines = [];
                }
                const cellContent = trimmedLine.replace(this.headerPattern, '').trim();
                currentRow.push({
                    content: cellContent,
                    rawLines: [line]
                });
                rawRowLines.push(line);
            } else if (this.rowSeparatorPattern.test(trimmedLine)) {
                // Save the previous row
                if (inHeader && currentRow.length > 0) {
                    table.headers = currentRow;
                    inHeader = false;
                } else if (inDataRow && currentRow.length > 0) {
                    table.rows.push(currentRow);
                }
                
                // Start new row
                currentRow = [];
                rawRowLines = [line]; // Include the row separator
                inDataRow = true;
            } else if (this.cellPattern.test(trimmedLine) && (inHeader || inDataRow)) {
                const cellContent = trimmedLine.replace(this.cellPattern, '');
                currentRow.push({
                    content: cellContent.trim(),
                    rawLines: [line]
                });
            } else if ((inDataRow || inHeader) && trimmedLine) {
                // This is a continuation line for the last cell
                if (currentRow.length > 0) {
                    const lastCell = currentRow[currentRow.length - 1];
                    lastCell.content += '\n' + trimmedLine;
                    lastCell.rawLines.push(line);
                }
            }
        }

        // Final row is already handled in the loop when we hit table end

        // Ensure all rows have the same number of columns as headers
        const expectedCols = table.headers.length;
        table.rows.forEach((row, rowIndex) => {
            while (row.length < expectedCols) {
                row.push({
                    content: '',
                    rawLines: ['|']  // Empty cell
                });
            }
            if (row.length > expectedCols) {
                console.warn(`Row ${rowIndex} has ${row.length} cells but expected ${expectedCols}`);
            }
        });

        console.log('Parsed headers:', table.headers.length);
        console.log('Parsed rows:', table.rows.length);
        if (table.rows.length > 0) {
            console.log('First row cells:', table.rows[0].length);
            console.log('All rows have same column count:', table.rows.every(row => row.length === expectedCols));
        }
    }

    extractSortableValue(cellContent) {
        let cleanContent = cellContent;

        cleanContent = cleanContent.replace(/\[\[File:.*?\]\]/g, '');
        cleanContent = cleanContent.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2');
        cleanContent = cleanContent.replace(/\[\[([^\]]+)\]\]/g, '$1');
        cleanContent = cleanContent.replace(/{{[^}]*}}/g, '');
        cleanContent = cleanContent.replace(/<[^>]*>/g, '');
        cleanContent = cleanContent.replace(/'''([^']+)'''/g, '$1');
        cleanContent = cleanContent.replace(/''([^']+)''/g, '$1');
        cleanContent = cleanContent.replace(/<br\s*\/?>/gi, ' ');

        const yearMatch = cleanContent.match(/\((\d{4})(?:–(\d{4}))?\)/);
        if (yearMatch) {
            return parseInt(yearMatch[1]);
        }

        const numberMatch = cleanContent.match(/(\d+(?:\.\d+)?)/);
        if (numberMatch) {
            return parseFloat(numberMatch[1]);
        }

        return cleanContent.trim().toLowerCase();
    }

    reconstructTable(table, sortedRows) {
        const result = [];
        
        // Add table start
        result.push(table.lines[0]);
        
        // Add caption if exists
        if (table.lines[1] && table.lines[1].trim().startsWith('|+')) {
            result.push(table.lines[1]);
        }

        // Add headers
        if (table.headers.length > 0) {
            result.push('|-');
            table.headers.forEach(header => {
                header.rawLines.forEach(rawLine => {
                    result.push(rawLine);
                });
            });
        }

        // Add sorted rows
        sortedRows.forEach(row => {
            result.push('|-');
            row.forEach(cell => {
                cell.rawLines.forEach(rawLine => {
                    result.push(rawLine);
                });
            });
        });

        result.push('|}');

        return result.join('\n');
    }
}