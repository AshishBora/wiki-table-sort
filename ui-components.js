class WikipediaSorterUI {
    constructor() {
        this.activePanel = null;
        this.activeBackdrop = null;
        this.currentTable = null;
        this.onSortCallback = null;
    }

    createSortPanel(table, headers, onSort) {
        console.log('Creating sort panel with headers:', headers);
        
        this.currentTable = table;
        this.onSortCallback = onSort;

        const panel = document.createElement('div');
        panel.className = 'wikipedia-sorter-panel';
        
        const headerOptions = headers.map((header, index) => 
            `<option value="${index}" data-type="${header.type}">
                ${header.text} (${header.type})
            </option>`
        ).join('');
        
        console.log('Header options HTML:', headerOptions);
        
        panel.innerHTML = `
            <div class="sorter-header">
                <span class="sorter-title">Sort Table</span>
                <button class="sorter-close">×</button>
            </div>
            <div class="sorter-content">
                <div class="sorter-field">
                    <label>Sort by column:</label>
                    <select class="column-selector">
                        ${headerOptions}
                    </select>
                </div>
                <div class="sorter-field">
                    <label>Direction:</label>
                    <select class="direction-selector">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
                <div class="sorter-actions">
                    <button class="sort-button">Apply Sort</button>
                    <button class="cancel-button">Cancel</button>
                </div>
            </div>
        `;

        console.log('Panel HTML created:', panel.outerHTML.substring(0, 200) + '...');

        this.attachPanelEvents(panel);
        return panel;
    }

    attachPanelEvents(panel) {
        const closeBtn = panel.querySelector('.sorter-close');
        const cancelBtn = panel.querySelector('.cancel-button');
        const sortBtn = panel.querySelector('.sort-button');

        closeBtn.addEventListener('click', () => this.closePanel());
        cancelBtn.addEventListener('click', () => this.closePanel());
        
        sortBtn.addEventListener('click', () => {
            const columnSelector = panel.querySelector('.column-selector');
            const directionSelector = panel.querySelector('.direction-selector');
            
            const columnIndex = parseInt(columnSelector.value);
            const ascending = directionSelector.value === 'asc';
            
            console.log('Sort button clicked:', columnIndex, ascending, this.onSortCallback);
            
            if (this.onSortCallback) {
                this.onSortCallback(this.currentTable, columnIndex, ascending);
            }
            
            this.closePanel();
        });

        panel.addEventListener('click', (e) => e.stopPropagation());
    }

    showPanel(panel, button) {
        console.log('Showing panel:', panel, 'for button:', button);
        this.closePanel();
        
        document.body.appendChild(panel);
        this.activePanel = panel;

        // Position panel in center of screen for better visibility
        panel.style.position = 'fixed';
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.zIndex = '2147483647'; // Maximum z-index value
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';

        console.log('Panel positioned at center of screen with max z-index');

        // Add a semi-transparent backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'wikipedia-sorter-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        backdrop.style.zIndex = '2147483646';
        backdrop.style.cursor = 'pointer';
        
        document.body.appendChild(backdrop);
        this.activeBackdrop = backdrop;

        // Close panel when clicking backdrop
        backdrop.addEventListener('click', () => this.closePanel());
        
        // Prevent clicks on panel from closing it
        panel.addEventListener('click', (e) => e.stopPropagation());
    }

    closePanel() {
        if (this.activePanel) {
            this.activePanel.remove();
            this.activePanel = null;
        }
        
        if (this.activeBackdrop) {
            this.activeBackdrop.remove();
            this.activeBackdrop = null;
        }
        
        document.removeEventListener('click', this.closePanel.bind(this));
    }

    createSortButton() {
        const button = document.createElement('button');
        button.className = 'wikipedia-sort-button';
        button.innerHTML = '⬍ Sort Table';
        button.title = 'Sort this Wikipedia table';
        return button;
    }

    positionButton(button, textarea) {
        const container = document.createElement('div');
        container.className = 'wikipedia-sorter-button-container';
        container.appendChild(button);

        const toolbar = textarea.parentElement.querySelector('.toolbar, #toolbar, .edittools');
        if (toolbar) {
            toolbar.appendChild(container);
        } else {
            textarea.parentElement.insertBefore(container, textarea);
        }

        return container;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `wikipedia-sorter-notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}