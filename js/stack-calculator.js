/**
 * Stack Calculator for Total Battle
 * Calculates optimal troop stack compositions based on selected units
 */

// Global state
let stackData = null;
let selectedUnits = new Map(); // unitId -> unit data
let limits = {
    leadership: 0,
    authority: 0,
    dominance: 0
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadStackData();
    renderUnitSelection();
    setupEventListeners();
    loadSavedState();
});

/**
 * Load stack data from JSON file
 */
async function loadStackData() {
    try {
        const response = await fetch('../data/stack_data.json');
        stackData = await response.json();
    } catch (error) {
        console.error('Error loading stack data:', error);
        showToast('Error loading unit data. Please refresh the page.');
    }
}

/**
 * Render the unit selection UI
 */
function renderUnitSelection() {
    if (!stackData) return;

    const groups = ['guardsmen', 'specialists', 'mercenaries', 'monsters'];
    
    groups.forEach(groupKey => {
        const groupData = stackData[groupKey];
        const contentEl = document.getElementById(`${groupKey}-content`);
        if (!contentEl || !groupData) return;

        let html = '';
        
        // Get category entries and sort for mercenaries/monsters (lowest tier first)
        let categoryEntries = Object.entries(groupData.categories);
        if (groupKey === 'mercenaries' || groupKey === 'monsters') {
            categoryEntries.sort((a, b) => {
                // Extract tier number from the first unit in each category
                const tierA = a[1].units[0]?.tier || 0;
                const tierB = b[1].units[0]?.tier || 0;
                return tierA - tierB; // Sort ascending (lowest tier first)
            });
        }
        
        categoryEntries.forEach(([catKey, category]) => {
            html += `
                <div class="unit-category" data-category="${catKey}">
                    <div class="category-header">
                        <span class="category-icon">${category.icon}</span>
                        <span class="category-name">${category.label}</span>
                    </div>
                    <div class="units-grid">
            `;
            
            // Sort units by strength (smallest to largest)
            const sortedUnits = [...category.units].sort((a, b) => a.strength - b.strength);
            
            sortedUnits.forEach(unit => {
                const unitId = `${groupKey}_${unit.id}`;
                html += `
                    <label class="unit-checkbox" data-unit-id="${unitId}" data-group="${groupKey}">
                        <input type="checkbox" id="${unitId}" onchange="toggleUnit('${unitId}', '${groupKey}')">
                        <span class="unit-name">${unit.name}</span>
                        <span class="unit-tier">T${unit.tier}</span>
                    </label>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        contentEl.innerHTML = html;
    });
}

/**
 * Setup event listeners for inputs
 */
function setupEventListeners() {
    // Limit inputs
    ['leadership', 'authority', 'dominance'].forEach(type => {
        const input = document.getElementById(`${type}-limit`);
        if (input) {
            input.addEventListener('input', () => {
                limits[type] = parseInt(input.value) || 0;
                updateLimitDisplays();
                updateButtonStates();
                saveState();
            });
        }
    });

    // Base count input
    const baseCountInput = document.getElementById('base-count');
    if (baseCountInput) {
        baseCountInput.addEventListener('input', () => {
            updateButtonStates();
            saveState();
        });
    }

    // Options inputs
    ['enemy-stacks', 'specialist-adjustment', 'revival-reduction'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', saveState);
        }
    });
}

/**
 * Toggle a unit's selection
 */
function toggleUnit(unitId, groupKey) {
    const checkbox = document.getElementById(unitId);
    const label = document.querySelector(`[data-unit-id="${unitId}"]`);
    
    if (checkbox.checked) {
        // Find unit data
        const unit = findUnitById(unitId, groupKey);
        if (unit) {
            selectedUnits.set(unitId, { ...unit, groupKey });
            label.classList.add('selected');
        }
    } else {
        selectedUnits.delete(unitId);
        label.classList.remove('selected');
    }

    updateGroupCounts();
    updateLimitDisplays();
    updateButtonStates();
    saveState();
}

/**
 * Find unit data by ID
 */
function findUnitById(unitId, groupKey) {
    const [, actualId] = unitId.split(`${groupKey}_`);
    const groupData = stackData[groupKey];
    
    for (const [categoryKey, category] of Object.entries(groupData.categories)) {
        const unit = category.units.find(u => u.id === actualId);
        if (unit) return { ...unit, category: categoryKey };
    }
    return null;
}

/**
 * Update group selection counts
 */
function updateGroupCounts() {
    const counts = { guardsmen: 0, specialists: 0, mercenaries: 0, monsters: 0 };
    
    selectedUnits.forEach((unit, unitId) => {
        if (unit.groupKey) {
            counts[unit.groupKey]++;
        }
    });

    Object.entries(counts).forEach(([group, count]) => {
        const countEl = document.getElementById(`${group}-count`);
        if (countEl) {
            countEl.textContent = `${count} selected`;
        }
    });
}

/**
 * Update limit displays (used/limit bars)
 */
function updateLimitDisplays() {
    const baseCount = parseInt(document.getElementById('base-count').value) || 50;
    const used = calculateUsedLimits(baseCount);

    ['leadership', 'authority', 'dominance'].forEach(type => {
        const usedEl = document.getElementById(`${type}-used`);
        const fillEl = document.getElementById(`${type}-fill`);
        const cardEl = usedEl?.closest('.limit-card');
        const limit = limits[type];

        if (usedEl) {
            usedEl.textContent = formatNumber(used[type]);
        }

        if (fillEl && limit > 0) {
            const percentage = Math.min((used[type] / limit) * 100, 100);
            fillEl.style.width = `${percentage}%`;
        } else if (fillEl) {
            fillEl.style.width = '0%';
        }

        if (cardEl) {
            if (limit > 0 && used[type] > limit) {
                cardEl.classList.add('over-limit');
            } else {
                cardEl.classList.remove('over-limit');
            }
        }
    });
}

/**
 * Calculate used limits based on selected units
 */
function calculateUsedLimits(baseCount) {
    const used = { leadership: 0, authority: 0, dominance: 0 };
    
    selectedUnits.forEach(unit => {
        const stackSize = calculateStackSize(unit, baseCount);
        
        if (unit.leadership) {
            used.leadership += unit.leadership * stackSize;
        }
        if (unit.authority) {
            used.authority += unit.authority * stackSize;
        }
        if (unit.dominance) {
            used.dominance += unit.dominance * stackSize;
        }
    });

    return used;
}

/**
 * Calculate stack size for a unit type based on its tier
 */
function calculateStackSize(unit, baseCount) {
    // Higher tier units have smaller stacks (base count)
    // Lower tier units have larger stacks (multiples of base count)
    // The idea is to equalize health across stacks
    
    const baseTier = 9; // Highest tier
    const tierDiff = baseTier - unit.tier;
    
    // Each tier down roughly doubles the count needed
    const multiplier = Math.pow(1.8, tierDiff);
    
    return Math.ceil(baseCount * multiplier);
}

/**
 * Update button states based on selection
 */
function updateButtonStates() {
    const hasUnits = selectedUnits.size > 0;
    const generateBtn = document.getElementById('generate-btn');
    const findBaseBtn = document.getElementById('find-base-btn');

    if (generateBtn) {
        generateBtn.disabled = !hasUnits;
    }

    // Find optimal button enabled if we have units and limits
    if (findBaseBtn) {
        const hasLimits = limits.leadership > 0 || limits.authority > 0 || limits.dominance > 0;
        findBaseBtn.disabled = !hasUnits || !hasLimits;
    }
}

/**
 * Toggle group collapse
 */
function toggleGroup(groupKey) {
    const group = document.querySelector(`[data-group="${groupKey}"]`);
    if (group) {
        group.classList.toggle('collapsed');
    }
}

/**
 * Toggle collapsible section
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

/**
 * Clear all unit selections
 */
function clearSelection() {
    selectedUnits.clear();
    
    document.querySelectorAll('.unit-checkbox input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.querySelectorAll('.unit-checkbox.selected').forEach(el => {
        el.classList.remove('selected');
    });

    updateGroupCounts();
    updateLimitDisplays();
    updateButtonStates();
    saveState();

    // Hide results
    document.getElementById('results-section').style.display = 'none';
}

/**
 * Find optimal base count based on limits
 */
function findOptimalBase() {
    if (selectedUnits.size === 0) return;

    let optimalBase = 1;
    let maxBase = 10000;
    
    // Binary search for optimal base count
    while (maxBase - optimalBase > 1) {
        const mid = Math.floor((optimalBase + maxBase) / 2);
        const used = calculateUsedLimits(mid);
        
        const withinLimits = 
            (limits.leadership === 0 || used.leadership <= limits.leadership) &&
            (limits.authority === 0 || used.authority <= limits.authority) &&
            (limits.dominance === 0 || used.dominance <= limits.dominance);

        if (withinLimits) {
            optimalBase = mid;
        } else {
            maxBase = mid;
        }
    }

    document.getElementById('base-count').value = optimalBase;
    updateLimitDisplays();
    saveState();
    showToast(`Optimal base count: ${optimalBase}`);
}

/**
 * Generate the battle plan
 */
function generateBattlePlan() {
    if (selectedUnits.size === 0) return;

    const baseCount = parseInt(document.getElementById('base-count').value) || 50;
    const enemyStacks = parseInt(document.getElementById('enemy-stacks').value) || 4;
    const specialistAdj = parseInt(document.getElementById('specialist-adjustment').value) || 10;

    // Calculate stack sizes for each selected unit
    const unitStacks = [];
    let totalTroops = 0;
    let totalStrength = 0;
    let totalHealth = 0;

    selectedUnits.forEach((unit, unitId) => {
        const stackSize = calculateStackSize(unit, baseCount);
        const total = stackSize * enemyStacks;
        const strength = unit.strength * total;
        const health = unit.health * total;

        unitStacks.push({
            ...unit,
            unitId,
            stackSize,
            total,
            strength,
            health
        });

        totalTroops += total;
        totalStrength += strength;
        totalHealth += health;
    });

    // Sort by tier (highest first)
    unitStacks.sort((a, b) => b.tier - a.tier);

    // Render results
    renderResults(unitStacks, {
        totalTroops,
        totalStrength,
        totalHealth,
        enemyStacks,
        baseCount
    });

    // Show results section
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render battle plan results
 */
function renderResults(unitStacks, summary) {
    // Summary cards
    const summaryEl = document.getElementById('results-summary');
    summaryEl.innerHTML = `
        <div class="summary-card">
            <span class="summary-value">${formatNumber(summary.totalTroops)}</span>
            <span class="summary-label">Total Troops</span>
        </div>
        <div class="summary-card">
            <span class="summary-value">${formatNumber(summary.totalStrength)}</span>
            <span class="summary-label">Total Strength</span>
        </div>
        <div class="summary-card">
            <span class="summary-value">${formatNumber(summary.totalHealth)}</span>
            <span class="summary-label">Total Health</span>
        </div>
        <div class="summary-card">
            <span class="summary-value">${summary.enemyStacks}</span>
            <span class="summary-label">Stacks</span>
        </div>
        <div class="summary-card">
            <span class="summary-value">${summary.baseCount}</span>
            <span class="summary-label">Base Count</span>
        </div>
    `;

    // Stack breakdown
    const stacksContainer = document.getElementById('stacks-container');
    let stacksHtml = '';
    
    for (let i = 1; i <= summary.enemyStacks; i++) {
        const stackTotal = unitStacks.reduce((sum, u) => sum + u.stackSize, 0);
        
        stacksHtml += `
            <div class="stack-card">
                <div class="stack-header">
                    <span class="stack-number">Stack ${i}</span>
                    <span class="stack-total">${formatNumber(stackTotal)} troops</span>
                </div>
                <div class="stack-units">
        `;
        
        unitStacks.forEach(unit => {
            stacksHtml += `
                <div class="stack-unit">
                    <span class="stack-unit-name">${unit.name}</span>
                    <span class="stack-unit-count">${formatNumber(unit.stackSize)}</span>
                </div>
            `;
        });
        
        stacksHtml += `
                </div>
            </div>
        `;
    }
    
    stacksContainer.innerHTML = stacksHtml;

    // Troops table - grouped by troop type and sorted by strength, then health ascending
    const tbody = document.getElementById('troops-tbody');
    let tableHtml = '';
    
    // Define group order and labels
    const groupOrder = ['guardsmen', 'specialists', 'monsters', 'mercenaries'];
    const groupLabels = {
        guardsmen: 'Guardsmen',
        specialists: 'Specialists',
        monsters: 'Monsters',
        mercenaries: 'Mercenaries'
    };
    const groupIcons = {
        guardsmen: '🛡️',
        specialists: '⚔️',
        monsters: '🐉',
        mercenaries: '💎'
    };
    
    // Group units by troop type
    const groupedUnits = {};
    unitStacks.forEach(unit => {
        const group = unit.groupKey;
        if (!groupedUnits[group]) {
            groupedUnits[group] = [];
        }
        groupedUnits[group].push(unit);
    });
    
    // Helper function to extract base troop type from name (e.g., "Archer III" -> "Archer")
    const getBaseTroopType = (name) => {
        // Remove tier suffixes like " I", " II", " III", " IV", " V", " VI", " VII", " 1", " 2", etc.
        return name.replace(/\s+(I{1,3}|IV|VI{0,2}|V|[1-9])$/i, '').trim();
    };
    
    // Sort each group by base troop type name, then by tier ascending
    Object.keys(groupedUnits).forEach(group => {
        groupedUnits[group].sort((a, b) => {
            // First sort by base troop type name
            const typeA = getBaseTroopType(a.name);
            const typeB = getBaseTroopType(b.name);
            if (typeA !== typeB) {
                return typeA.localeCompare(typeB);
            }
            // Then by tier ascending (I, II, III, etc.)
            return a.tier - b.tier;
        });
    });
    
    // Render groups in specified order
    groupOrder.forEach(groupKey => {
        const units = groupedUnits[groupKey];
        if (!units || units.length === 0) return; // Skip empty groups
        
        // Add group header row
        tableHtml += `
            <tr class="troop-group-header">
                <td colspan="5">
                    <span class="group-icon">${groupIcons[groupKey]}</span>
                    <span class="group-label">${groupLabels[groupKey]}</span>
                </td>
            </tr>
        `;
        
        // Add units in this group
        units.forEach(unit => {
            const typeIcon = getTypeIcon(unit.type || unit.groupKey);
            tableHtml += `
                <tr>
                    <td>
                        <div class="unit-name-cell">
                            <span class="unit-type-icon">${typeIcon}</span>
                            <span>${unit.name}</span>
                        </div>
                    </td>
                    <td>${formatNumber(unit.stackSize)}</td>
                    <td>${formatNumber(unit.total)}</td>
                    <td>${formatNumber(unit.strength)}</td>
                    <td>${formatNumber(unit.health)}</td>
                </tr>
            `;
        });
    });

    // Add totals row
    tableHtml += `
        <tr style="font-weight: bold; background: rgba(212, 165, 116, 0.15);">
            <td>Total</td>
            <td>-</td>
            <td>${formatNumber(summary.totalTroops)}</td>
            <td>${formatNumber(summary.totalStrength)}</td>
            <td>${formatNumber(summary.totalHealth)}</td>
        </tr>
    `;
    
    tbody.innerHTML = tableHtml;
}

/**
 * Get icon for unit type
 */
function getTypeIcon(type) {
    const icons = {
        ranged: '🏹',
        melee: '⚔️',
        mounted: '🐴',
        flying: '🦅',
        guardsmen: '🛡️',
        specialists: '⚔️',
        mercenaries: '💎',
        monsters: '🐉'
    };
    return icons[type] || '⚔️';
}

/**
 * Copy battle plan to clipboard
 */
function copyBattlePlan() {
    const baseCount = document.getElementById('base-count').value;
    const enemyStacks = document.getElementById('enemy-stacks').value;
    
    let text = `Battle Plan (Base: ${baseCount}, Stacks: ${enemyStacks})\n`;
    text += '═'.repeat(40) + '\n\n';
    
    const sortedUnits = Array.from(selectedUnits.values())
        .map(unit => ({
            ...unit,
            stackSize: calculateStackSize(unit, parseInt(baseCount))
        }))
        .sort((a, b) => b.tier - a.tier);

    sortedUnits.forEach(unit => {
        const total = unit.stackSize * parseInt(enemyStacks);
        text += `${unit.name}: ${unit.stackSize} per stack (${total} total)\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast('Battle plan copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy. Please try again.');
    });
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Show toast notification
 */
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Save state to localStorage
 */
function saveState() {
    const state = {
        selectedUnits: Array.from(selectedUnits.entries()),
        limits,
        baseCount: document.getElementById('base-count').value,
        enemyStacks: document.getElementById('enemy-stacks').value,
        specialistAdj: document.getElementById('specialist-adjustment').value,
        revivalReduction: document.getElementById('revival-reduction').value
    };
    
    localStorage.setItem('stackCalculatorState', JSON.stringify(state));
}

/**
 * Load saved state from localStorage
 */
function loadSavedState() {
    const saved = localStorage.getItem('stackCalculatorState');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);

        // Restore limits
        if (state.limits) {
            limits = state.limits;
            Object.entries(limits).forEach(([type, value]) => {
                const input = document.getElementById(`${type}-limit`);
                if (input) input.value = value;
            });
        }

        // Restore other inputs
        if (state.baseCount) {
            document.getElementById('base-count').value = state.baseCount;
        }
        if (state.enemyStacks) {
            document.getElementById('enemy-stacks').value = state.enemyStacks;
        }
        if (state.specialistAdj) {
            document.getElementById('specialist-adjustment').value = state.specialistAdj;
        }
        if (state.revivalReduction) {
            document.getElementById('revival-reduction').value = state.revivalReduction;
        }

        // Restore selected units
        if (state.selectedUnits) {
            state.selectedUnits.forEach(([unitId, unitData]) => {
                const checkbox = document.getElementById(unitId);
                const label = document.querySelector(`[data-unit-id="${unitId}"]`);
                
                if (checkbox && label) {
                    checkbox.checked = true;
                    label.classList.add('selected');
                    selectedUnits.set(unitId, unitData);
                }
            });
        }

        updateGroupCounts();
        updateLimitDisplays();
        updateButtonStates();
    } catch (error) {
        console.error('Error loading saved state:', error);
    }
}
