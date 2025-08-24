class WikipediaSorterExtension {
    constructor() {
        this.parser = new WikipediaTableParser();
        this.sorter = new WikipediaTableSorter(this.parser);
        this.ui = new WikipediaSorterUI();
        this.textarea = null;
        this.tables = [];
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        if (!this.isWikipediaEditPage()) {
            return;
        }

        this.textarea = this.findEditTextarea();
        if (!this.textarea) {
            return;
        }

        this.scanForTables();
        
        if (this.tables.length > 0) {
            this.addSortButton();
            this.initialized = true;
        }
    }

    isWikipediaEditPage() {
        return (
            window.location.hostname.includes('wikipedia.org') &&
            (window.location.href.includes('action=edit') ||
             window.location.href.includes('&edit'))
        );
    }

    findEditTextarea() {
        return document.querySelector('#wpTextbox1') || 
               document.querySelector('textarea[name="wpTextbox1"]') ||
               document.querySelector('#editarea textarea') ||
               document.querySelector('textarea');
    }

    scanForTables() {
        if (!this.textarea) return;
        
        const content = this.textarea.value;
        this.tables = this.parser.findTables(content);
        
        console.log(`Wikipedia Sorter: Found ${this.tables.length} sortable tables`);
    }

    addSortButton() {
        const button = this.ui.createSortButton();
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSortButtonClick();
        });

        this.ui.positionButton(button, this.textarea);
    }

    handleSortButtonClick() {
        this.scanForTables();

        console.log('Tables found:', this.tables.length);

        if (this.tables.length === 0) {
            this.ui.showNotification('No sortable tables found in the content.', 'warning');
            return;
        }

        if (this.tables.length === 1) {
            console.log('Showing sort options for table:', this.tables[0]);
            this.showSortOptions(this.tables[0]);
        } else {
            this.showTableSelector();
        }
    }

    showTableSelector() {
        const tableOptions = this.tables.map((table, index) => {
            const preview = this.getTablePreview(table);
            return { index, preview };
        });

        // For now, just sort the first table
        this.showSortOptions(this.tables[0]);
    }

    getTablePreview(table) {
        if (table.headers.length > 0) {
            const headerText = table.headers
                .map(h => h.content.replace(/[{}\[\]|]/g, '').trim())
                .slice(0, 3)
                .join(', ');
            return `Table with headers: ${headerText}${table.headers.length > 3 ? '...' : ''}`;
        }
        return `Table with ${table.rows.length} rows`;
    }

    showSortOptions(table) {
        const headers = this.sorter.getColumnHeaders(table);
        
        console.log('Headers found:', headers);
        
        if (headers.length === 0) {
            this.ui.showNotification('No sortable columns found in this table.', 'warning');
            return;
        }

        // Temporary simple approach - use browser prompt
        const columnOptions = headers.map((h, i) => `${i}: ${h.text}`).join('\n');
        const selectedColumn = prompt(`Select column to sort by (enter number):\n\n${columnOptions}`);
        
        if (selectedColumn !== null) {
            const columnIndex = parseInt(selectedColumn);
            if (columnIndex >= 0 && columnIndex < headers.length) {
                const direction = confirm('Sort ascending? (Cancel for descending)');
                console.log('User selected:', columnIndex, direction);
                this.performSort(table, columnIndex, direction);
            } else {
                alert('Invalid column selection');
            }
        }
    }

    performSort(table, columnIndex, ascending) {
        try {
            const sortedRows = this.sorter.sortTable(table, columnIndex, ascending);
            const originalContent = this.textarea.value;
            const newContent = this.sorter.applySortToText(originalContent, table, sortedRows);
            
            this.textarea.value = newContent;
            this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            const columnName = table.headers[columnIndex]?.content.replace(/[{}\[\]|]/g, '').trim() || `Column ${columnIndex + 1}`;
            const direction = ascending ? 'ascending' : 'descending';
            
            this.ui.showNotification(
                `Table sorted by "${columnName}" (${direction})`,
                'success'
            );

            this.scanForTables();
            
        } catch (error) {
            console.error('Wikipedia Sorter Error:', error);
            this.ui.showNotification('Error sorting table. Please try again.', 'error');
        }
    }
}

let extension;

function initializeExtension() {
    if (!extension) {
        extension = new WikipediaSorterExtension();
    }
    extension.initialize();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.id === 'wpTextbox1' || node.querySelector('#wpTextbox1')) {
                        setTimeout(initializeExtension, 100);
                        return;
                    }
                }
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});