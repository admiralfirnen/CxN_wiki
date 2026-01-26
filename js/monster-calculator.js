// Monster Battle Calculator JavaScript

// Data storage
let monsterData = {
    normal_monsters: null,
    rare_monsters: null,
    strongholds: null,
    citadels: null,
    heroics: null,
    lookup: null,
    troops: null
};

// Current lookup data for estimation
let currentEnemyData = null;
let currentEnemyType = null;

// DOM Elements
const enemyTypeSelect = document.getElementById('enemy-type');
const enemyLevelSelect = document.getElementById('enemy-level');
const monsterNameGroup = document.getElementById('monster-name-group');
const monsterNameSelect = document.getElementById('monster-name');
const lookupBtn = document.getElementById('lookup-btn');
const resultsPanel = document.getElementById('results-panel');
const noDataPanel = document.getElementById('no-data-panel');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    setupEventListeners();
});

// Load all JSON data files
async function loadAllData() {
    try {
        const [normalMonsters, rareMonsters, strongholds, citadels, heroics, lookup, troops] = await Promise.all([
            fetch('../data/normal_monsters.json').then(r => r.json()),
            fetch('../data/rare_monsters.json').then(r => r.json()),
            fetch('../data/strongholds.json').then(r => r.json()),
            fetch('../data/citadels.json').then(r => r.json()),
            fetch('../data/heroics.json').then(r => r.json()),
            fetch('../data/monster_lookup.json').then(r => r.json()),
            fetch('../data/troop_data.json').then(r => r.json())
        ]);
        
        monsterData.normal_monsters = normalMonsters;
        monsterData.rare_monsters = rareMonsters;
        monsterData.strongholds = strongholds;
        monsterData.citadels = citadels;
        monsterData.heroics = heroics;
        monsterData.lookup = lookup;
        monsterData.troops = troops;
        
        console.log('Monster data loaded successfully');
    } catch (error) {
        console.error('Error loading monster data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    enemyTypeSelect.addEventListener('change', handleEnemyTypeChange);
    enemyLevelSelect.addEventListener('change', handleLevelChange);
    monsterNameSelect.addEventListener('change', validateSelection);
    lookupBtn.addEventListener('click', performLookup);
    
    // Troop estimator listeners
    document.getElementById('calculate-troops-btn').addEventListener('click', calculateTroopsNeeded);
    document.getElementById('your-troop-type').addEventListener('change', updateTierOptions);
}

// Handle enemy type selection
function handleEnemyTypeChange() {
    const enemyType = enemyTypeSelect.value;
    
    // Reset dependent fields
    enemyLevelSelect.innerHTML = '<option value="">-- Select Level --</option>';
    enemyLevelSelect.disabled = true;
    monsterNameGroup.style.display = 'none';
    monsterNameSelect.innerHTML = '<option value="">-- Select Monster --</option>';
    lookupBtn.disabled = true;
    resultsPanel.style.display = 'none';
    noDataPanel.style.display = 'none';
    
    if (!enemyType || !monsterData.lookup) return;
    
    // Get available levels for this enemy type
    const category = monsterData.lookup.categories.find(c => c.id === enemyType);
    if (!category) return;
    
    // Populate levels
    category.available_levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = `Level ${level}`;
        enemyLevelSelect.appendChild(option);
    });
    
    enemyLevelSelect.disabled = false;
}

// Handle level selection
function handleLevelChange() {
    const enemyType = enemyTypeSelect.value;
    const level = parseInt(enemyLevelSelect.value);
    
    monsterNameGroup.style.display = 'none';
    monsterNameSelect.innerHTML = '<option value="">-- Select Monster --</option>';
    lookupBtn.disabled = true;
    
    if (!level) return;
    
    // For normal monsters and rare monsters, show monster name selector
    if (enemyType === 'normal_monsters') {
        // Get available monster types at this level from the data
        const monstersAtLevel = monsterData.normal_monsters.normal_monsters.filter(m => m.level === level);
        const monsterNames = [...new Set(monstersAtLevel.map(m => m.name))];
        
        monsterNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            monsterNameSelect.appendChild(option);
        });
        monsterNameGroup.style.display = 'block';
    } else if (enemyType === 'rare_monsters') {
        const category = monsterData.lookup.categories.find(c => c.id === 'rare_monsters');
        if (category && category.monster_types) {
            category.monster_types.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                monsterNameSelect.appendChild(option);
            });
            monsterNameGroup.style.display = 'block';
        }
    } else {
        // For other types, enable lookup directly
        lookupBtn.disabled = false;
    }
}

// Validate selection for enabling lookup button
function validateSelection() {
    const enemyType = enemyTypeSelect.value;
    const level = enemyLevelSelect.value;
    const monsterName = monsterNameSelect.value;
    
    if (enemyType === 'normal_monsters' || enemyType === 'rare_monsters') {
        lookupBtn.disabled = !monsterName;
    } else {
        lookupBtn.disabled = !level;
    }
}

// Perform the lookup
function performLookup() {
    const enemyType = enemyTypeSelect.value;
    const level = parseInt(enemyLevelSelect.value);
    const monsterName = monsterNameSelect.value;
    
    let data = null;
    let quickLookup = null;
    
    switch (enemyType) {
        case 'normal_monsters':
            data = findNormalMonster(level, monsterName);
            // Normal monsters don't have quick_lookup, use the data directly
            quickLookup = data ? { attack_with: data.recommended_attack, reason: '' } : null;
            break;
        case 'rare_monsters':
            data = findRareMonster(level, monsterName);
            quickLookup = monsterData.lookup.quick_lookup.rare_monsters[level]?.[monsterName];
            break;
        case 'strongholds':
            data = findStronghold(level);
            quickLookup = monsterData.lookup.quick_lookup.strongholds[level];
            break;
        case 'cursed_strongholds':
            data = findCursedStronghold(level);
            quickLookup = monsterData.lookup.quick_lookup.cursed_strongholds[level];
            break;
        case 'citadels':
            data = findCitadel(level);
            quickLookup = monsterData.lookup.quick_lookup.citadels?.[level];
            break;
        case 'heroics':
            data = findHeroic(level);
            quickLookup = monsterData.lookup.quick_lookup.heroics[level];
            break;
    }
    
    // Store for estimator
    currentEnemyData = data;
    currentEnemyType = enemyType;
    
    if (data) {
        displayResults(data, quickLookup, enemyType, level, monsterName);
        resultsPanel.style.display = 'block';
        noDataPanel.style.display = 'none';
        
        // Reset estimation results
        document.getElementById('estimation-results').style.display = 'none';
    } else {
        resultsPanel.style.display = 'none';
        noDataPanel.style.display = 'block';
    }
    
    // Scroll to results
    setTimeout(() => {
        const targetPanel = data ? resultsPanel : noDataPanel;
        targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Find rare monster data
function findRareMonster(level, name) {
    if (!monsterData.rare_monsters) return null;
    return monsterData.rare_monsters.rare_monsters.find(
        m => m.level === level && m.name === name
    );
}

// Find normal monster data
function findNormalMonster(level, name) {
    if (!monsterData.normal_monsters) return null;
    return monsterData.normal_monsters.normal_monsters.find(
        m => m.level === level && m.name === name
    );
}

// Find stronghold data
function findStronghold(level) {
    if (!monsterData.strongholds) return null;
    return monsterData.strongholds.strongholds.find(s => s.level === level);
}

// Find cursed stronghold data
function findCursedStronghold(level) {
    if (!monsterData.strongholds) return null;
    return monsterData.strongholds.cursed_strongholds.find(s => s.level === level);
}

// Find citadel data
function findCitadel(level) {
    if (!monsterData.citadels) return null;
    return monsterData.citadels.citadels.find(c => c.level === level);
}

// Find heroic data
function findHeroic(level) {
    if (!monsterData.heroics) return null;
    return monsterData.heroics.heroics.find(h => h.level === level);
}

// Display results
function displayResults(data, quickLookup, enemyType, level, monsterName) {
    // Set title
    const titleEl = document.getElementById('results-title');
    if (enemyType === 'normal_monsters' || enemyType === 'rare_monsters') {
        titleEl.textContent = `${monsterName} - Level ${level}`;
    } else if (enemyType === 'cursed_strongholds') {
        titleEl.textContent = `Cursed Stronghold - Level ${level}`;
    } else if (enemyType === 'citadels') {
        titleEl.textContent = `Elven Citadel - Level ${level}`;
    } else {
        titleEl.textContent = `${capitalizeFirst(enemyType.replace('_', ' '))} - Level ${level}`;
    }
    
    // Set recommendation
    const recommendedAttack = document.getElementById('recommended-attack');
    const attackReason = document.getElementById('attack-reason');
    
    if (quickLookup) {
        recommendedAttack.textContent = quickLookup.attack_with || data.recommended_attack || '-';
        attackReason.textContent = quickLookup.reason || quickLookup.strategy || '';
    } else if (data.recommended_attack) {
        recommendedAttack.textContent = data.recommended_attack;
        attackReason.textContent = '';
    }
    
    // Display rewards if available
    displayRewards(data, enemyType);
    
    // Display citadel-specific info if applicable
    displayCitadelInfo(data, enemyType);
    
    // Display enemy composition
    displayTroops(data, enemyType);
    
    // Display strategy if available
    displayStrategy(data);
}

// Display rewards
function displayRewards(data, enemyType) {
    const rewardsBox = document.getElementById('rewards-box');
    const rewardsGrid = document.getElementById('rewards-grid');
    
    if (!data.rewards && !data.total_monster_health && !data.total_wall_health) {
        rewardsBox.style.display = 'none';
        return;
    }
    
    rewardsBox.style.display = 'block';
    rewardsGrid.innerHTML = '';
    
    const rewards = data.rewards || {};
    
    if (rewards.valor_points) {
        rewardsGrid.innerHTML += createRewardItem('🏆', 'Valor Points', formatNumber(rewards.valor_points));
    }
    if (rewards.experience) {
        rewardsGrid.innerHTML += createRewardItem('⭐', 'Experience', formatNumber(rewards.experience));
    }
    if (rewards.master_coins) {
        rewardsGrid.innerHTML += createRewardItem('🪙', 'Master Coins', formatNumber(rewards.master_coins));
    }
    if (rewards.clan_chests) {
        rewardsGrid.innerHTML += createRewardItem('📦', 'Clan Chests', rewards.clan_chests);
    }
    if (data.total_monster_health) {
        rewardsGrid.innerHTML += createRewardItem('💀', 'Monster Health', formatNumber(data.total_monster_health));
    }
    if (data.total_wall_health) {
        rewardsGrid.innerHTML += createRewardItem('🧱', 'Wall Health', formatNumber(data.total_wall_health));
    }
}

function createRewardItem(icon, label, value) {
    return `
        <div class="reward-item">
            <span class="reward-icon">${icon}</span>
            <span class="reward-label">${label}</span>
            <span class="reward-value">${value}</span>
        </div>
    `;
}

// Display citadel-specific information
function displayCitadelInfo(data, enemyType) {
    const citadelInfoBox = document.getElementById('citadel-info-box');
    
    if (enemyType !== 'citadels' || !data.catapults_required) {
        if (citadelInfoBox) citadelInfoBox.style.display = 'none';
        return;
    }
    
    if (citadelInfoBox) {
        citadelInfoBox.style.display = 'block';
        
        const catapultInfo = data.catapults_required;
        const troopInfo = data.recommended_troops;
        const tips = data.strategy_tips || [];
        const generalTips = monsterData.citadels?.general_tips || {};
        
        let html = `
            <div class="citadel-requirements">
                <div class="citadel-req-item siege-req">
                    <span class="req-icon">🏰</span>
                    <div class="req-details">
                        <span class="req-title">Catapults Required</span>
                        <span class="req-value">~${formatNumber(catapultInfo.quantity)} Tier ${catapultInfo.tier}</span>
                        <span class="req-note">${catapultInfo.notes || ''}</span>
                    </div>
                </div>
                <div class="citadel-req-item troop-req">
                    <span class="req-icon">${getTroopIcon(troopInfo.type)}</span>
                    <div class="req-details">
                        <span class="req-title">Recommended Troops</span>
                        <span class="req-value">${troopInfo.type} - ${troopInfo.quantity}</span>
                        <span class="req-note">${troopInfo.notes || ''}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (tips.length > 0) {
            html += `
                <div class="citadel-tips">
                    <h4>💡 Level-Specific Tips</h4>
                    <ul class="tips-list">
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add general citadel tips
        if (generalTips.catapult_importance) {
            html += `
                <div class="citadel-general-tips">
                    <h4>🔥 Catapult Importance</h4>
                    <ul class="tips-list warning">
                        ${generalTips.catapult_importance.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (generalTips.attack_preparation) {
            html += `
                <div class="citadel-general-tips">
                    <h4>📌 Before You Attack</h4>
                    <ul class="tips-list">
                        ${generalTips.attack_preparation.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        citadelInfoBox.innerHTML = html;
    }
}

// Display troops
function displayTroops(data, enemyType) {
    const troopCards = document.getElementById('troop-cards');
    troopCards.innerHTML = '';
    
    const troops = data.troops || [];
    
    if (troops.length === 0) {
        troopCards.innerHTML = '<p class="no-troops">No troop data available.</p>';
        return;
    }
    
    troops.forEach((troop, index) => {
        troopCards.innerHTML += createTroopCard(troop, enemyType, data.waves);
    });
}

function createTroopCard(troop, enemyType, waves) {
    const icon = getTroopIcon(troop.type);
    const subtypeText = troop.subtype ? troop.subtype : '';
    
    // Determine count label and value
    let countLabel = 'Count';
    let countValue = troop.count || troop.count_per_wave || '-';
    
    if (enemyType === 'heroics' && troop.count_per_wave) {
        countLabel = 'Per Wave';
        countValue = formatNumber(troop.count_per_wave);
        if (waves) {
            countLabel = `Per Wave (×${waves})`;
        }
    } else if (troop.count) {
        countValue = formatNumber(troop.count);
    }
    
    // Build bonuses HTML
    let bonusesHtml = '';
    if (troop.bonuses && troop.bonuses.length > 0) {
        const bonusTags = troop.bonuses.map(b => {
            if (b.special) {
                return `<span class="bonus-tag">${b.special}</span>`;
            }
            return `<span class="bonus-tag">+${b.bonus}% vs ${b.vs}</span>`;
        }).join('');
        
        bonusesHtml = `
            <div class="troop-bonuses">
                <div class="bonus-title">Combat Bonuses</div>
                <div class="bonus-list">${bonusTags}</div>
            </div>
        `;
    }
    
    return `
        <div class="troop-card">
            <div class="troop-card-header">
                <div class="troop-type-icon">${icon}</div>
                <div class="troop-type-info">
                    <div class="troop-type-name">${troop.type || 'Unknown'}</div>
                    ${subtypeText ? `<div class="troop-subtype">${subtypeText}</div>` : ''}
                </div>
            </div>
            <div class="troop-card-stats">
                <div class="stat-item">
                    <span class="stat-label">Strength</span>
                    <span class="stat-value strength">${formatNumber(troop.strength || troop.health_each / 3 || '-')}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Health</span>
                    <span class="stat-value health">${formatNumber(troop.health || troop.health_each || '-')}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${countLabel}</span>
                    <span class="stat-value count">${countValue}</span>
                </div>
                ${troop.tier ? `
                <div class="stat-item">
                    <span class="stat-label">Tier</span>
                    <span class="stat-value">${troop.tier}</span>
                </div>
                ` : ''}
            </div>
            ${bonusesHtml}
        </div>
    `;
}

function getTroopIcon(type) {
    const icons = {
        'Melee': '⚔️',
        'Ranged': '🏹',
        'Mounted': '🐴',
        'Flying': '🦅',
        'Beast': '🐺',
        'Siege': '🏰'
    };
    return icons[type] || '👤';
}

// Display strategy
function displayStrategy(data) {
    const strategyBox = document.getElementById('strategy-box');
    const strategyContent = document.getElementById('strategy-content');
    
    if (!data.recommended_strategy) {
        strategyBox.style.display = 'none';
        return;
    }
    
    strategyBox.style.display = 'block';
    const strategy = data.recommended_strategy;
    
    let html = '';
    
    if (strategy.description) {
        html += `<p class="strategy-text">${strategy.description}</p>`;
    }
    
    if (strategy.options && strategy.options.length > 0) {
        html += '<div class="strategy-options">';
        strategy.options.forEach(opt => {
            let troopStr = [];
            if (opt.catapults) troopStr.push(`${formatNumber(opt.catapults)} Catapults`);
            if (opt.ranged) troopStr.push(`${formatNumber(opt.ranged)} Ranged`);
            if (opt.mounted) troopStr.push(`${formatNumber(opt.mounted)} Mounted`);
            if (opt.spearmen) troopStr.push(`${formatNumber(opt.spearmen)} Spearmen`);
            if (opt.giants) troopStr.push(`${formatNumber(opt.giants)} Giants`);
            if (opt.optimal) troopStr.push(`(Optimal: ${opt.optimal})`);
            if (opt.notes) troopStr.push(`(${opt.notes})`);
            
            html += `
                <div class="strategy-option">
                    <span class="strategy-tier">Tier ${opt.tier}</span>
                    <span class="strategy-troops">${troopStr.join(', ')}</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    if (strategy.warregals) {
        html += `<p class="strategy-text">🐺 <strong>Warregals:</strong> ${strategy.warregals} ${strategy.warregals_notes || ''}</p>`;
    }
    
    if (strategy.notes) {
        html += `<p class="strategy-text">💡 ${strategy.notes}</p>`;
    }
    
    strategyContent.innerHTML = html;
}

// Utility functions
function formatNumber(num) {
    if (num === null || num === undefined || num === '-') return '-';
    if (typeof num === 'string') return num;
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function capitalizeFirst(str) {
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Update tier options based on troop type
function updateTierOptions() {
    const troopType = document.getElementById('your-troop-type').value;
    const tierSelect = document.getElementById('your-troop-tier');
    const combatTroops = monsterData.troops?.combat_troops;
    
    if (!combatTroops || !combatTroops[troopType]) return;
    
    const availableTiers = Object.keys(combatTroops[troopType].tiers);
    const currentTier = tierSelect.value;
    
    tierSelect.innerHTML = '';
    availableTiers.forEach(tier => {
        const option = document.createElement('option');
        option.value = tier;
        option.textContent = `Tier ${tier}`;
        if (tier === currentTier || (tier === '6' && !availableTiers.includes(currentTier))) {
            option.selected = true;
        }
        tierSelect.appendChild(option);
    });
}

// Calculate total enemy health from current data
function calculateTotalEnemyHealth(data, enemyType) {
    // If we have pre-calculated totals, use them
    if (data.total_monster_health) {
        return {
            total: data.total_monster_health + (data.total_wall_health || 0),
            monsterHealth: data.total_monster_health,
            wallHealth: data.total_wall_health || 0,
            breakdown: []
        };
    }
    
    let totalHealth = 0;
    let breakdown = [];
    const troops = data.troops || [];
    const waves = data.waves || 1;
    
    troops.forEach(troop => {
        let troopHealth = 0;
        let count = 0;
        let healthPer = 0;
        
        if (troop.health && troop.count) {
            // Standard format: health per unit * count
            healthPer = troop.health;
            count = troop.count;
            troopHealth = healthPer * count;
        } else if (troop.health_each && troop.count) {
            // Stronghold format
            healthPer = troop.health_each;
            count = troop.count;
            troopHealth = healthPer * count;
        } else if (troop.count_per_wave && troop.health) {
            // Heroic format: per wave * waves
            healthPer = troop.health;
            count = troop.count_per_wave * waves;
            troopHealth = healthPer * troop.count_per_wave * waves;
        }
        
        if (troopHealth > 0) {
            totalHealth += troopHealth;
            breakdown.push({
                type: troop.type || 'Unknown',
                subtype: troop.subtype || '',
                count: count,
                healthPer: healthPer,
                totalHealth: troopHealth
            });
        }
    });
    
    // Add wall health if present
    let wallHealth = 0;
    if (data.walls) {
        if (data.walls.health && data.walls.count) {
            wallHealth = data.walls.health * data.walls.count;
        } else if (data.walls.health_each && data.walls.count) {
            wallHealth = data.walls.health_each * data.walls.count;
        }
    }
    if (data.total_wall_health) {
        wallHealth = data.total_wall_health;
    }
    
    return {
        total: totalHealth + wallHealth,
        monsterHealth: totalHealth,
        wallHealth: wallHealth,
        breakdown: breakdown
    };
}

// Calculate troops needed
function calculateTroopsNeeded() {
    if (!currentEnemyData || !monsterData.troops?.combat_troops) {
        alert('Please look up an enemy first!');
        return;
    }
    
    const troopType = document.getElementById('your-troop-type').value;
    const troopTier = document.getElementById('your-troop-tier').value;
    const strengthBonus = parseFloat(document.getElementById('strength-bonus').value) || 0;
    
    const combatTroops = monsterData.troops.combat_troops;
    const troopData = combatTroops[troopType];
    
    if (!troopData || !troopData.tiers[troopTier]) {
        alert('Invalid troop selection');
        return;
    }
    
    const tierData = troopData.tiers[troopTier];
    const baseStrength = tierData.strength;
    const bonusMultiplier = 1 + (strengthBonus / 100);
    const effectiveStrength = Math.floor(baseStrength * bonusMultiplier);
    
    // Calculate total enemy health
    const healthData = calculateTotalEnemyHealth(currentEnemyData, currentEnemyType);
    
    // Calculate troops needed (enemy health / troop strength)
    // Add 20% buffer for safety
    const rawTroopsNeeded = Math.ceil(healthData.total / effectiveStrength);
    const recommendedTroops = Math.ceil(rawTroopsNeeded * 1.2);
    
    // Update UI
    document.getElementById('estimation-icon').textContent = troopData.icon;
    document.getElementById('estimation-troop-name').textContent = troopData.name;
    document.getElementById('estimation-tier').textContent = `Tier ${troopTier}`;
    document.getElementById('est-base-strength').textContent = formatNumber(baseStrength);
    document.getElementById('est-bonus-strength').textContent = formatNumber(effectiveStrength);
    document.getElementById('troops-needed').textContent = formatNumber(recommendedTroops);
    document.getElementById('result-note').textContent = 
        `(Base estimate: ${formatNumber(rawTroopsNeeded)} + 20% safety buffer)`;
    
    // Build breakdown
    let breakdownHtml = `
        <div class="breakdown-title">Calculation Breakdown</div>
        <div class="breakdown-grid">
            <div class="breakdown-item">
                <span class="breakdown-label">Total Enemy Health</span>
                <span class="breakdown-value">${formatNumber(healthData.total)}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Monster Health</span>
                <span class="breakdown-value">${formatNumber(healthData.monsterHealth)}</span>
            </div>
    `;
    
    if (healthData.wallHealth > 0) {
        breakdownHtml += `
            <div class="breakdown-item">
                <span class="breakdown-label">Wall Health</span>
                <span class="breakdown-value">${formatNumber(healthData.wallHealth)}</span>
            </div>
        `;
    }
    
    breakdownHtml += `
            <div class="breakdown-item">
                <span class="breakdown-label">Your Strength/Troop</span>
                <span class="breakdown-value">${formatNumber(effectiveStrength)}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Strength Bonus</span>
                <span class="breakdown-value">+${strengthBonus}%</span>
            </div>
        </div>
    `;
    
    // Add enemy composition breakdown
    if (healthData.breakdown.length > 0) {
        breakdownHtml += `
            <div class="breakdown-title" style="margin-top: 20px;">Enemy Health by Type</div>
            <div class="breakdown-grid">
        `;
        healthData.breakdown.forEach(item => {
            const typeName = item.subtype ? `${item.type} (${item.subtype})` : item.type;
            breakdownHtml += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${typeName}</span>
                    <span class="breakdown-value">${formatNumber(item.totalHealth)}</span>
                </div>
            `;
        });
        breakdownHtml += '</div>';
    }
    
    document.getElementById('estimation-breakdown').innerHTML = breakdownHtml;
    document.getElementById('estimation-results').style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('estimation-results').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}
