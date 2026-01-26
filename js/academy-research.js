/**
 * Academy Research Costs Module
 * Displays and filters academy research costs by category and item
 */

(function() {
    'use strict';

    // State
    let researchData = null;
    let currentCategory = '';
    let currentSearchTerm = '';

    // DOM Elements
    const categoryFilter = document.getElementById('category-filter');
    const researchSearch = document.getElementById('research-search');
    const researchContainer = document.getElementById('research-container');
    const resultsCount = document.getElementById('results-count');

    /**
     * Format a number with K, M, B suffixes
     */
    function formatNumber(num) {
        if (num === null || num === undefined) return '-';
        
        if (num >= 1_000_000_000_000) {
            return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
        }
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1_000) {
            return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    /**
     * Check if a research item is single-level (only has level 1)
     */
    function isSingleLevel(research) {
        const levels = research.levels;
        const levelKeys = Object.keys(levels);
        return levelKeys.length === 1 && levelKeys[0] === '1';
    }

    /**
     * Load research data from JSON file
     */
    async function loadResearchData() {
        try {
            const response = await fetch('../data/academy_research.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            researchData = data.academy_research;
            
            populateCategoryFilter();
            renderResearchGroups();
            updateResultsCount();
        } catch (error) {
            console.error('Error loading research data:', error);
            researchContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <div class="no-results-text">Error loading research data. Please try again later.</div>
                </div>
            `;
        }
    }

    /**
     * Populate the category filter dropdown
     */
    function populateCategoryFilter() {
        if (!researchData) return;

        // Clear existing options except the first "All Categories"
        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        researchData.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category;
            option.textContent = category.category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Create the table header row
     */
    function createTableHeader() {
        return `
            <thead>
                <tr>
                    <th>Research</th>
                    <th>Lvl 1</th>
                    <th>Lvl 2</th>
                    <th>Lvl 3</th>
                    <th>Lvl 4</th>
                    <th>Lvl 5</th>
                    <th>Lvl 6</th>
                    <th>Lvl 7</th>
                    <th>Lvl 8</th>
                    <th>Lvl 9</th>
                    <th>Lvl 10</th>
                    <th>Total</th>
                </tr>
            </thead>
        `;
    }

    /**
     * Create a table row for a research item
     */
    function createResearchRow(research) {
        const singleLevel = isSingleLevel(research);
        const singleLevelBadge = singleLevel ? '<span class="single-level-badge">1 lvl</span>' : '';
        
        let row = `<tr data-research="${research.research.toLowerCase()}">`;
        row += `<td>${research.research}${singleLevelBadge}</td>`;
        
        // Levels 1-10
        for (let level = 1; level <= 10; level++) {
            const cost = research.levels[level.toString()];
            if (cost !== undefined && cost !== null) {
                row += `<td><span class="cost-value has-value">${formatNumber(cost)}</span></td>`;
            } else {
                row += `<td><span class="cost-value empty">-</span></td>`;
            }
        }
        
        // Total
        if (research.total !== undefined && research.total !== null) {
            row += `<td><span class="cost-value total">${formatNumber(research.total)}</span></td>`;
        } else {
            // Calculate total if not provided
            const calculatedTotal = Object.values(research.levels).reduce((sum, val) => sum + (val || 0), 0);
            row += `<td><span class="cost-value total">${formatNumber(calculatedTotal)}</span></td>`;
        }
        
        row += '</tr>';
        return row;
    }

    /**
     * Create a research group element
     */
    function createResearchGroup(category) {
        const group = document.createElement('div');
        group.className = 'research-group';
        group.dataset.category = category.category.toLowerCase();

        const visibleCount = category.researches.length;

        group.innerHTML = `
            <div class="group-header">
                <h3 class="group-title">
                    ${category.category}
                    <span class="group-count">(<span class="visible-count">${visibleCount}</span> research items)</span>
                </h3>
                <span class="collapse-icon">▼</span>
            </div>
            <div class="group-content">
                <div class="research-table-wrapper">
                    <table class="research-table">
                        ${createTableHeader()}
                        <tbody>
                            ${category.researches.map(r => createResearchRow(r)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Add click handler for collapse/expand
        const header = group.querySelector('.group-header');
        header.addEventListener('click', () => {
            group.classList.toggle('collapsed');
        });

        return group;
    }

    /**
     * Render all research groups
     */
    function renderResearchGroups() {
        if (!researchData) return;

        researchContainer.innerHTML = '';

        researchData.forEach(category => {
            const group = createResearchGroup(category);
            researchContainer.appendChild(group);
        });

        // Apply current filters
        applyFilters();
    }

    /**
     * Apply all active filters
     */
    function applyFilters() {
        if (!researchData) return;

        const categoryValue = currentCategory.toLowerCase();
        const searchValue = currentSearchTerm.toLowerCase().trim();

        let totalVisible = 0;
        let categoriesVisible = 0;

        // Iterate through all groups
        const groups = researchContainer.querySelectorAll('.research-group');
        groups.forEach(group => {
            const groupCategory = group.dataset.category;
            
            // Check category filter
            const categoryMatch = !categoryValue || groupCategory === categoryValue;
            
            if (!categoryMatch) {
                group.classList.add('hidden');
                return;
            }

            // Filter rows by search term
            const rows = group.querySelectorAll('tbody tr');
            let visibleInGroup = 0;

            rows.forEach(row => {
                const researchName = row.dataset.research;
                const searchMatch = !searchValue || researchName.includes(searchValue);

                if (searchMatch) {
                    row.classList.remove('hidden');
                    visibleInGroup++;
                } else {
                    row.classList.add('hidden');
                }
            });

            // Update visible count in group header
            const countSpan = group.querySelector('.visible-count');
            if (countSpan) {
                countSpan.textContent = visibleInGroup;
            }

            // Hide group if no visible items
            if (visibleInGroup === 0) {
                group.classList.add('hidden');
            } else {
                group.classList.remove('hidden');
                totalVisible += visibleInGroup;
                categoriesVisible++;
            }
        });

        // Show no results message if needed
        const existingNoResults = researchContainer.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.remove();
        }

        if (totalVisible === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No research items found matching your filters.</div>
            `;
            researchContainer.appendChild(noResults);
        }

        updateResultsCount(totalVisible, categoriesVisible);
    }

    /**
     * Update the results count display
     */
    function updateResultsCount(visible, categories) {
        if (!researchData) {
            resultsCount.textContent = 'Loading...';
            return;
        }

        const totalItems = researchData.reduce((sum, cat) => sum + cat.researches.length, 0);
        const totalCategories = researchData.length;

        if (visible !== undefined && categories !== undefined) {
            if (visible === totalItems) {
                resultsCount.textContent = `Showing all ${totalItems} research items across ${totalCategories} categories`;
            } else {
                resultsCount.textContent = `Showing ${visible} of ${totalItems} research items in ${categories} categories`;
            }
        } else {
            resultsCount.textContent = `Showing all ${totalItems} research items across ${totalCategories} categories`;
        }
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Category filter change
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            applyFilters();
        });

        // Search input with debounce
        let searchTimeout;
        researchSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearchTerm = e.target.value;
                applyFilters();
            }, 200);
        });

    }

    /**
     * Initialize the module
     */
    function init() {
        initEventListeners();
        loadResearchData();
    }

    // Start the application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
