class WikipediaTableSorter {
    constructor(parser) {
        this.parser = parser;
    }

    sortTable(table, columnIndex, ascending = true) {
        if (!table.rows || table.rows.length === 0) {
            return table.rows;
        }

        console.log('Sorting table by column', columnIndex, 'ascending:', ascending);
        console.log('Total rows to sort:', table.rows.length);
        
        // Log row cell counts to ensure integrity
        table.rows.forEach((row, i) => {
            console.log(`Row ${i} has ${row.length} cells`);
        });

        const sortedRows = [...table.rows];

        sortedRows.sort((rowA, rowB) => {
            const cellA = rowA[columnIndex];
            const cellB = rowB[columnIndex];

            if (!cellA && !cellB) {
                return 0;
            }
            if (!cellA) return 1;
            if (!cellB) return -1;

            const valueA = this.parser.extractSortableValue(cellA.content);
            const valueB = this.parser.extractSortableValue(cellB.content);

            console.log(`Comparing: "${valueA}" vs "${valueB}"`);

            let comparison = 0;

            if (typeof valueA === 'number' && typeof valueB === 'number') {
                comparison = valueA - valueB;
            } else if (typeof valueA === 'string' && typeof valueB === 'string') {
                comparison = valueA.localeCompare(valueB);
            } else {
                const strA = String(valueA);
                const strB = String(valueB);
                comparison = strA.localeCompare(strB);
            }

            return ascending ? comparison : -comparison;
        });

        console.log('Sorting completed');
        return sortedRows;
    }

    detectColumnType(table, columnIndex) {
        if (!table.rows || table.rows.length === 0) {
            return 'string';
        }

        const sampleValues = table.rows
            .slice(0, Math.min(5, table.rows.length))
            .map(row => {
                const cell = row[columnIndex];
                return cell ? this.parser.extractSortableValue(cell.content) : null;
            })
            .filter(val => val !== null);

        if (sampleValues.length === 0) {
            return 'string';
        }

        const numberCount = sampleValues.filter(val => typeof val === 'number').length;
        const stringCount = sampleValues.filter(val => typeof val === 'string').length;

        if (numberCount > stringCount) {
            const hasYears = sampleValues.some(val => 
                typeof val === 'number' && val >= 1000 && val <= new Date().getFullYear() + 10
            );
            return hasYears ? 'year' : 'number';
        }

        return 'string';
    }

    getColumnHeaders(table) {
        if (!table.headers || table.headers.length === 0) {
            return [];
        }

        return table.headers.map((header, index) => {
            const cleanHeader = header.content
                .replace(/{{[^}]*}}/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/'''([^']+)'''/g, '$1')
                .replace(/''([^']+)''/g, '$1')
                .trim();

            const columnType = this.detectColumnType(table, index);

            return {
                index,
                text: cleanHeader,
                type: columnType
            };
        });
    }

    applySortToText(originalText, table, sortedRows) {
        const lines = originalText.split('\n');
        const sortedTableText = this.parser.reconstructTable(table, sortedRows);
        
        const beforeTable = lines.slice(0, table.startLine).join('\n');
        const afterTable = lines.slice(table.endLine + 1).join('\n');
        
        let result = beforeTable;
        if (beforeTable) result += '\n';
        result += sortedTableText;
        if (afterTable) result += '\n' + afterTable;
        
        return result;
    }
}