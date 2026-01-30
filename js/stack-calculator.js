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
            
            // Sort units by tier descending (highest tier first)
            const sortedUnits = [...category.units].sort((a, b) => b.tier - a.tier);
            
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
    const revivalReduction = parseFloat(document.getElementById('revival-reduction').value) || 1.00;

    // Calculate stack sizes for each selected unit
    const unitStacks = [];
    let totalTroops = 0;
    let totalStrength = 0;
    let totalHealth = 0;
    let totalLeadership = 0;
    let totalAuthority = 0;
    let totalDominance = 0;

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
        
        // Sum up resource usage
        if (unit.leadership) totalLeadership += unit.leadership * total;
        if (unit.authority) totalAuthority += unit.authority * total;
        if (unit.dominance) totalDominance += unit.dominance * total;
    });

    // Sort by tier (highest first)
    unitStacks.sort((a, b) => b.tier - a.tier);

    // Render results in modal
    renderBattlePlanModal(unitStacks, {
        totalTroops,
        totalStrength,
        totalHealth,
        totalLeadership,
        totalAuthority,
        totalDominance,
        enemyStacks,
        baseCount,
        revivalReduction
    });

    // Show modal
    openBattlePlanModal();
}

/**
 * Render battle plan in the modal
 */
function renderBattlePlanModal(unitStacks, summary) {
    // Calculate power score (simplified estimate)
    const powerScore = Math.round(summary.totalStrength / 2300);
    
    // Calculate revival cost (gold) - simplified estimate
    const baseRevivalCost = summary.totalTroops * 4; // base cost per troop
    const revivalCost = Math.round(baseRevivalCost / summary.revivalReduction);
    
    // Update stat values
    document.getElementById('stat-power').textContent = formatNumber(powerScore);
    document.getElementById('stat-strength').textContent = formatLargeNumber(summary.totalStrength);
    document.getElementById('stat-leadership').textContent = formatLargeNumber(summary.totalLeadership);
    document.getElementById('stat-authority').textContent = formatNumber(summary.totalAuthority);
    document.getElementById('stat-dominance').textContent = formatNumber(summary.totalDominance);
    document.getElementById('stat-revival').textContent = formatLargeNumber(revivalCost);
    
    // Calculate rounds and hits (simplified estimates based on stacks)
    const rounds = Math.ceil(summary.enemyStacks / 2);
    const yourHitsMin = Math.floor(summary.enemyStacks * 4.5);
    const yourHitsMax = summary.enemyStacks * 6;
    const enemyHits = summary.enemyStacks * 3;
    const totalHitsMin = yourHitsMin + enemyHits;
    const totalHitsMax = yourHitsMax + enemyHits;
    const rolePercent = ((yourHitsMin + yourHitsMax) / 2 / (totalHitsMin + totalHitsMax) * 100).toFixed(1);
    
    document.getElementById('stat-rounds').textContent = rounds;
    document.getElementById('stat-your-hits').textContent = `${yourHitsMin} - ${yourHitsMax}`;
    document.getElementById('stat-enemy-hits').textContent = enemyHits;
    document.getElementById('stat-total-hits').textContent = `${totalHitsMin} - ${totalHitsMax}`;
    document.getElementById('stat-role').textContent = `~${rolePercent}%`;

    // Build army list grouped by troop type
    const armyListEl = document.getElementById('army-list');
    
    // Define group order and labels
    const groupOrder = ['mercenaries', 'monsters', 'guardsmen', 'specialists'];
    const groupLabels = {
        guardsmen: 'Normal Troops',
        specialists: 'Specialists',
        monsters: 'Monsters',
        mercenaries: 'Mercenaries'
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
    
    // Helper function to extract base troop type from name
    const getBaseTroopType = (name) => {
        return name.replace(/\s+(I{1,3}|IV|VI{0,2}|V|[1-9])$/i, '').trim();
    };
    
    // Sort each group by base troop type name, then by tier descending (highest tier first)
    Object.keys(groupedUnits).forEach(group => {
        groupedUnits[group].sort((a, b) => {
            const typeA = getBaseTroopType(a.name);
            const typeB = getBaseTroopType(b.name);
            if (typeA !== typeB) {
                return typeA.localeCompare(typeB);
            }
            return b.tier - a.tier; // Higher tier first within same type
        });
    });
    
    // Build HTML for army list
    let armyHtml = '';
    
    groupOrder.forEach(groupKey => {
        const units = groupedUnits[groupKey];
        if (!units || units.length === 0) return;
        
        armyHtml += `
            <div class="army-group">
                <h4 class="army-group-title">${groupLabels[groupKey]}</h4>
        `;
        
        units.forEach(unit => {
            const tierClass = getTierClass(groupKey);
            const tierLabel = getTierLabel(unit.tier, groupKey);
            
            // Calculate per-unit stats
            const unitHealth = formatNumber(unit.health / unit.total * unit.total);
            const unitStrength = formatNumber(unit.strength / unit.total * unit.total);
            
            // Get the resource type and value for this unit
            let resourceLabel = '';
            let resourceValue = '';
            if (unit.leadership) {
                resourceLabel = 'Leadership';
                resourceValue = formatNumber(unit.leadership);
            } else if (unit.authority) {
                resourceLabel = 'Authority';
                resourceValue = formatNumber(unit.authority);
            } else if (unit.dominance) {
                resourceLabel = 'Dominance';
                resourceValue = formatNumber(unit.dominance);
            }
            
            armyHtml += `
                <div class="army-unit">
                    <div class="army-unit-info">
                        <div class="army-unit-name">
                            ${unit.name}
                            <span class="army-unit-tier ${tierClass}">${tierLabel}</span>
                        </div>
                        <div class="army-unit-stats">
                            Health: ${formatNumber(unit.health)}&nbsp;&nbsp;Strength: ${formatNumber(unit.strength)}&nbsp;&nbsp;${resourceLabel}: ${resourceValue}
                        </div>
                    </div>
                    <div class="army-unit-count">${formatNumber(unit.total)}</div>
                </div>
            `;
        });
        
        armyHtml += `</div>`;
    });
    
    armyListEl.innerHTML = armyHtml;
}

/**
 * Get tier class for styling
 */
function getTierClass(groupKey) {
    const classes = {
        guardsmen: 'tier-guardsmen',
        specialists: 'tier-specialist',
        mercenaries: 'tier-mercenary',
        monsters: 'tier-monster'
    };
    return classes[groupKey] || 'tier-guardsmen';
}

/**
 * Get tier label
 */
function getTierLabel(tier, groupKey) {
    if (groupKey === 'mercenaries' || groupKey === 'monsters') {
        return `T${tier}`;
    }
    // For guardsmen and specialists, use tier number with G prefix
    return `G${tier}`;
}

/**
 * Format large numbers with K, M suffixes
 */
function formatLargeNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return formatNumber(num);
}

/**
 * Open the battle plan modal
 */
function openBattlePlanModal() {
    const modal = document.getElementById('battle-plan-modal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Close the battle plan modal
 */
function closeBattlePlanModal() {
    const modal = document.getElementById('battle-plan-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('battle-plan-modal');
    if (e.target === modal) {
        closeBattlePlanModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeBattlePlanModal();
    }
});

/**
 * Render battle plan results (legacy - keeping for compatibility)
 */
function renderResults(unitStacks, summary) {
    renderBattlePlanModal(unitStacks, summary);
    openBattlePlanModal();
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
