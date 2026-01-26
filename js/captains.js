// Captains Data and Interactive Logic

const captainsData = {
    tengel: {
        name: "Captain Tengel",
        icon: "🏃",
        tagline: "March Speed Specialist",
        tier: "starter",
        tierLabel: "Starter",
        unlockCost: "Default Captain",
        strengths: [
            "Good march speed bonus",
            "Long march range",
            "Available from the start"
        ],
        weaknesses: [
            "No combat bonuses",
            "Outclassed by all other captains",
            "Should be retired once you unlock other captains"
        ],
        bestEquipment: ["Swift Wayfarer"],
        useCase: "Early game only",
        pvePvp: "neither",
        activities: [],
        notes: "Retire this captain when you unlock better options."
    },
    aydae: {
        name: "Captain Aydae",
        icon: "🏹",
        tagline: "Guardsmen Master",
        tier: "essential",
        tierLabel: "Essential",
        unlockCost: "Default Captain",
        strengths: [
            "Bonus to all Guardsmen (Archers, Spearmen, Riders)",
            "Essential for both PvE and PvP",
            "Your main combat captain for most situations"
        ],
        weaknesses: [
            "No specialist troop bonuses",
            "No monster bonuses"
        ],
        bestEquipment: ["Guardsmen Courage", "Unique Sets (Emerald Guardian, Sagittarius Fury, etc.)"],
        useCase: "Always keep equipped - main combat captain",
        pvePvp: "both",
        activities: ["monsters", "heroics", "pvp", "strongholds", "defending"],
        notes: "A must-have for your Guardsmen in both PvE and PvP. Always deploy with your main army."
    },
    logos: {
        name: "Captain Logos",
        icon: "⚔️",
        tagline: "Swordsmen Specialist",
        tier: "valuable",
        tierLabel: "Valuable",
        unlockCost: "Default Captain",
        strengths: [
            "Strong bonus to Swordsmen",
            "Excellent for PvP combat",
            "Useful if you invest heavily in Specialists"
        ],
        weaknesses: [
            "Swordsmen only useful in PvP",
            "Limited PvE usefulness",
            "Requires Specialist investment"
        ],
        bestEquipment: ["Specialist Mastery (PvP)", "Guardsmen Courage (PvE)"],
        useCase: "PvP when using Swordsmen",
        pvePvp: "pvp",
        activities: ["pvp", "kvk", "cot"],
        notes: "Best equipment during PvP: Specialist Mastery set. During PvE: Guardsmen Courage set."
    },
    brann: {
        name: "Captain Brann",
        icon: "🔧",
        tagline: "Siege Engine Commander",
        tier: "situational",
        tierLabel: "Situational",
        unlockCost: "22M VP",
        strengths: [
            "Major bonus to Siege Engines (Catapults)",
            "Essential for taking down Strongholds",
            "Useful for attacking walled cities"
        ],
        weaknesses: [
            "Catapults nerfed to 1/20th damage vs non-fortifications",
            "Only useful against walls/strongholds",
            "Limited general combat utility"
        ],
        bestEquipment: ["Skilful Engineer"],
        useCase: "Strongholds and attacking walled cities",
        pvePvp: "both",
        activities: ["strongholds", "pvp"],
        notes: "Use against Strongholds and players with walls up. Catapults always hit first in combat."
    },
    doria: {
        name: "Captain Doria",
        icon: "📜",
        tagline: "Valor Point Collector",
        tier: "valuable",
        tierLabel: "Valuable",
        unlockCost: "80M VP",
        strengths: [
            "Bonus Valor Points from PvE activities",
            "Accelerates Academy research",
            "Great for monster hunting"
        ],
        weaknesses: [
            "No combat stat bonuses",
            "PvE only - useless in PvP",
            "High unlock cost"
        ],
        bestEquipment: ["Guardsmen Courage", "Unique Sets"],
        useCase: "PvE monster hunting for VP farming",
        pvePvp: "pve",
        activities: ["monsters", "heroics", "vp_farming"],
        notes: "Use her in PvE only. Best set: Guardsmen Courage or Unique sets."
    },
    ingrid: {
        name: "Captain Ingrid",
        icon: "🐉",
        tagline: "Monster Commander",
        tier: "valuable",
        tierLabel: "Valuable",
        unlockCost: "80M VP",
        strengths: [
            "Bonus to all Monsters (Beasts, Dragons, Elementals, Giants)",
            "Usable in both PvE and PvP",
            "Great if you invest in Monster troops"
        ],
        weaknesses: [
            "Requires Dragon Coins for monsters",
            "High unlock cost",
            "Only useful if you use monster troops"
        ],
        bestEquipment: ["Unique Sets"],
        useCase: "When fielding monster troops",
        pvePvp: "both",
        activities: ["monsters", "heroics", "pvp"],
        notes: "Bonus to Monsters – usable both in PvE and PvP."
    },
    dustan: {
        name: "Captain Dustan",
        icon: "🏆",
        tagline: "Conquest Point Earner",
        tier: "valuable",
        tierLabel: "Valuable",
        unlockCost: "22M CP",
        strengths: [
            "Bonus Conquest Points from PvP",
            "Accelerates Academy PvP research",
            "Great for CP-swap training"
        ],
        weaknesses: [
            "Only useful during PvP events",
            "No combat stat bonuses",
            "Useless in PvE"
        ],
        bestEquipment: ["Guardsmen Courage", "Unique Sets"],
        useCase: "PvP events (KvK, Clash, WAR)",
        pvePvp: "pvp",
        activities: ["pvp", "kvk", "cot", "cp_farming"],
        notes: "Use as Defense during CP-swap for bonus CP. Best during KvK, Clash, or WAR events."
    },
    carter: {
        name: "Captain Carter",
        icon: "🗝️",
        tagline: "Crypt Explorer",
        tier: "valuable",
        tierLabel: "Valuable",
        unlockCost: "80M VP",
        strengths: [
            "Bonus to Tar capacity",
            "Crypt exploration efficiency bonus",
            "Essential for equipment crafting materials"
        ],
        weaknesses: [
            "Only useful for crypts",
            "No combat bonuses",
            "High unlock cost"
        ],
        bestEquipment: ["Tomb Raider"],
        useCase: "Crypt exploration",
        pvePvp: "pve",
        activities: ["crypts", "materials"],
        notes: "Best equipment: Tomb Raider set. Use for farming crypt materials."
    },
    stror: {
        name: "Captain Stror",
        icon: "📦",
        tagline: "Resource Gatherer",
        tier: "situational",
        tierLabel: "Situational",
        unlockCost: "80M VP",
        strengths: [
            "Bonus to gathering speed",
            "Increased carry capacity",
            "Great for resource farming"
        ],
        weaknesses: [
            "Only good for harvesting",
            "No combat utility",
            "High unlock cost"
        ],
        bestEquipment: ["Swift Wayfarer"],
        useCase: "Resource harvesting on world map",
        pvePvp: "harvest",
        activities: ["gathering", "resources"],
        notes: "Only good for harvesting on the world map. Use Swift Wayfarer equipment."
    },
    proscope: {
        name: "Captain Proscope",
        icon: "🔍",
        tagline: "Spy Master",
        tier: "situational",
        tierLabel: "Situational",
        unlockCost: "80M CP",
        strengths: [
            "Bonus to Scouts (Spies)",
            "Better scouting success rate",
            "Useful for intelligence gathering"
        ],
        weaknesses: [
            "Very niche use case",
            "High CP unlock cost",
            "Limited combat utility"
        ],
        bestEquipment: ["Specialist Mastery"],
        useCase: "Scouting enemy players",
        pvePvp: "pvp",
        activities: ["scouting", "pvp"],
        notes: "Bonus with Scouts (Spies). Best equipment: Specialists Mastery set."
    },
    yehosung: {
        name: "Captain Ye Ho-Sung",
        icon: "🗡️",
        tagline: "Melee Warrior",
        tier: "valuable",
        tierLabel: "Valuable",
        unlockCost: "120K CP",
        strengths: [
            "Strong bonus to Melee troops",
            "Low unlock cost",
            "Great synergy with Spearmen and Swordsmen"
        ],
        weaknesses: [
            "Only boosts Melee troops",
            "Doesn't help Ranged or Mounted"
        ],
        bestEquipment: ["Emerald Guardian"],
        useCase: "When using heavy Melee composition",
        pvePvp: "both",
        activities: ["monsters", "pvp", "heroics"],
        notes: "Bonus with Melee. Best equipment: Unique equipment Emerald Guardian."
    }
};

const activitiesData = {
    monsters: {
        name: "Monster Hunting",
        icon: "👹",
        description: "Killing normal and rare monsters on the world map for VP and experience.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Guardsmen bonuses are essential" },
            { captain: "doria", rank: "best", reason: "Bonus VP from kills" },
            { captain: "ingrid", rank: "good", reason: "If using monster troops" },
            { captain: "yehosung", rank: "good", reason: "If using Melee composition" }
        ]
    },
    heroics: {
        name: "Heroic Monsters",
        icon: "⚔️",
        description: "Taking down Heroic Monsters with clan reinforcements for massive VP and XP.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Essential Guardsmen bonuses" },
            { captain: "doria", rank: "best", reason: "Maximizes VP gains" },
            { captain: "ingrid", rank: "good", reason: "If using monster troops" }
        ]
    },
    strongholds: {
        name: "Strongholds",
        icon: "🏰",
        description: "Attacking Strongholds and Cursed Strongholds for keys and clan chests.",
        recommendations: [
            { captain: "brann", rank: "best", reason: "Siege Engine bonuses for walls" },
            { captain: "aydae", rank: "good", reason: "Guardsmen for the fight" }
        ]
    },
    crypts: {
        name: "Crypt Exploration",
        icon: "🗝️",
        description: "Exploring Normal, Rare, and Epic crypts for equipment materials.",
        recommendations: [
            { captain: "carter", rank: "best", reason: "Tar capacity and efficiency bonuses" }
        ]
    },
    pvp: {
        name: "PvP Combat",
        icon: "⚔️",
        description: "Attacking other players during CoT, KvK, or general warfare.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Essential Guardsmen bonuses" },
            { captain: "logos", rank: "best", reason: "If using Swordsmen" },
            { captain: "yehosung", rank: "good", reason: "If heavy Melee composition" },
            { captain: "dustan", rank: "good", reason: "Bonus CP from attacks" },
            { captain: "brann", rank: "viable", reason: "If enemy walls are up" }
        ]
    },
    kvk: {
        name: "Kingdom vs Kingdom (KvK)",
        icon: "🌍",
        description: "Cross-kingdom warfare events with special portals and no ROE.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Main combat captain" },
            { captain: "dustan", rank: "best", reason: "Maximize CP gains" },
            { captain: "logos", rank: "good", reason: "If using Specialists" },
            { captain: "yehosung", rank: "good", reason: "For Melee armies" }
        ]
    },
    cot: {
        name: "Clash of Thrones (CoT)",
        icon: "👑",
        description: "In-kingdom PvP event for throne control.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Main combat captain" },
            { captain: "dustan", rank: "best", reason: "Maximize CP gains" },
            { captain: "logos", rank: "good", reason: "Swordsmen bonus" }
        ]
    },
    gathering: {
        name: "Resource Gathering",
        icon: "🌾",
        description: "Harvesting resources from mines, farms, quarries on the world map.",
        recommendations: [
            { captain: "stror", rank: "best", reason: "Gathering speed and capacity bonus" }
        ]
    },
    vp_farming: {
        name: "VP Farming",
        icon: "📜",
        description: "Maximizing Valor Point gains for Academy research.",
        recommendations: [
            { captain: "doria", rank: "best", reason: "VP bonus from all PvE activities" },
            { captain: "aydae", rank: "good", reason: "Efficient monster kills" }
        ]
    },
    cp_farming: {
        name: "CP Farming / CP-Swap",
        icon: "🏆",
        description: "Maximizing Conquest Point gains through arranged combat or PvP.",
        recommendations: [
            { captain: "dustan", rank: "best", reason: "Use as Defense for CP bonus" },
            { captain: "aydae", rank: "good", reason: "Use in Offense with Guardsmen Courage" }
        ]
    },
    defending: {
        name: "City Defense",
        icon: "🛡️",
        description: "Defending your city against enemy attacks.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Guardsmen defense bonuses" },
            { captain: "dustan", rank: "good", reason: "CP bonus when defending" },
            { captain: "yehosung", rank: "good", reason: "Melee defense bonus" }
        ]
    },
    leveling: {
        name: "Captain Leveling",
        icon: "📈",
        description: "Efficiently leveling up your captains.",
        recommendations: [
            { captain: "aydae", rank: "best", reason: "Use smaller captains during Academy research" }
        ]
    }
};

const levelingTips = [
    {
        icon: "🔬",
        title: "Academy Research Method",
        content: "Whenever you research something in your Academy, take your large Captains off your Hero and put in smaller Captains. When you activate the bonus (Green ! at bottom of screen), your smaller Captains get the Experience and VP bonus. This is the easiest way to level up captains."
    },
    {
        icon: "⚔️",
        title: "Heroic Monster Runs",
        content: "If clan members run Heroic Monsters (like during Ruthless Slaughter), take your smaller Captains on these runs to get FREE Experience and FREE VP."
    },
    {
        icon: "💀",
        title: "Epic Monster (Doomsday)",
        content: "Hit the Epic Monster during Doomsday event - it gives plenty of Experience. Recommended: at least T4 Guardsmen. The Epic Monster can ONLY be hit by your Captains, one at a time."
    },
    {
        icon: "🎯",
        title: "General Leveling",
        content: "Kill monsters, hunt crypts, and kill players with your smaller Captains. Keep them active and they will level up naturally."
    }
];

// DOM Elements
let captainSelect, activitySelect;
let captainInfoPanel, activityResultsPanel;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    // Get DOM elements
    captainSelect = document.getElementById('captain-select');
    activitySelect = document.getElementById('activity-select');
    captainInfoPanel = document.getElementById('captain-info-panel');
    activityResultsPanel = document.getElementById('activity-results-panel');
    
    // Set up event listeners
    if (captainSelect) {
        captainSelect.addEventListener('change', handleCaptainSelect);
    }
    
    if (activitySelect) {
        activitySelect.addEventListener('change', handleActivitySelect);
    }
    
    // Set up tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });
    
    // Set up activity card clicks
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach(card => {
        card.addEventListener('click', () => {
            const activityId = card.dataset.activity;
            if (activityId) {
                showActivityRecommendations(activityId);
                // Highlight selected card
                activityCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            }
        });
    });
    
    // Populate quick reference table
    populateQuickReferenceTable();
}

function handleTabClick(e) {
    const targetTab = e.currentTarget.dataset.tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${targetTab}`).classList.add('active');
}

function handleCaptainSelect(e) {
    const captainId = e.target.value;
    if (captainId && captainsData[captainId]) {
        showCaptainInfo(captainId);
    } else {
        hideCaptainInfo();
    }
}

function handleActivitySelect(e) {
    const activityId = e.target.value;
    if (activityId && activitiesData[activityId]) {
        showActivityRecommendations(activityId);
    } else {
        hideActivityResults();
    }
}

function showCaptainInfo(captainId) {
    const captain = captainsData[captainId];
    if (!captain || !captainInfoPanel) return;
    
    // Build strengths list
    const strengthsList = captain.strengths
        .map(s => `<li><span class="bullet">✓</span> ${s}</li>`)
        .join('');
    
    // Build weaknesses list
    const weaknessesList = captain.weaknesses
        .map(w => `<li><span class="bullet">✗</span> ${w}</li>`)
        .join('');
    
    // Build equipment tags
    const equipmentTags = captain.bestEquipment
        .map(e => `<span class="equipment-tag">${e}</span>`)
        .join('');
    
    // Build activities where useful
    const usefulFor = captain.activities
        .map(actId => {
            const act = activitiesData[actId];
            return act ? `<span class="equipment-tag">${act.icon} ${act.name}</span>` : '';
        })
        .filter(Boolean)
        .join('');
    
    const html = `
        <div class="captain-card">
            <div class="captain-card-header">
                <div class="captain-avatar">${captain.icon}</div>
                <div class="captain-header-info">
                    <h2 class="captain-name">${captain.name}</h2>
                    <p class="captain-tagline">${captain.tagline}</p>
                </div>
                <span class="captain-tier ${captain.tier}">${captain.tierLabel}</span>
            </div>
            
            <div class="captain-stats-grid">
                <div class="stat-box">
                    <div class="stat-box-title">
                        <span>💪</span> Strengths
                    </div>
                    <ul class="stat-list strengths">
                        ${strengthsList}
                    </ul>
                </div>
                
                <div class="stat-box">
                    <div class="stat-box-title">
                        <span>⚠️</span> Weaknesses
                    </div>
                    <ul class="stat-list weaknesses">
                        ${weaknessesList}
                    </ul>
                </div>
            </div>
            
            <div class="equipment-section">
                <div class="equipment-title">
                    <span>🛡️</span> Best Equipment
                </div>
                <div class="equipment-list">
                    ${equipmentTags}
                </div>
            </div>
            
            ${usefulFor ? `
            <div class="equipment-section" style="margin-top: 15px; background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3);">
                <div class="equipment-title" style="color: #60a5fa;">
                    <span>🎯</span> Best Used For
                </div>
                <div class="equipment-list">
                    ${usefulFor}
                </div>
            </div>
            ` : ''}
            
            <div class="unlock-section">
                <div class="unlock-title">
                    <span>🔓</span> Unlock Requirement
                </div>
                <div class="unlock-cost">${captain.unlockCost}</div>
            </div>
            
            ${captain.notes ? `
            <div class="info-callout tip" style="margin-top: 20px;">
                <div class="info-callout-title">
                    <span>💡</span> Pro Tip
                </div>
                <div class="info-callout-content">${captain.notes}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    captainInfoPanel.innerHTML = html;
    captainInfoPanel.classList.add('visible');
}

function hideCaptainInfo() {
    if (captainInfoPanel) {
        captainInfoPanel.classList.remove('visible');
    }
}

function showActivityRecommendations(activityId) {
    const activity = activitiesData[activityId];
    if (!activity || !activityResultsPanel) return;
    
    const recommendationsHtml = activity.recommendations.map(rec => {
        const captain = captainsData[rec.captain];
        if (!captain) return '';
        
        return `
            <div class="captain-recommendation">
                <div class="rec-avatar">${captain.icon}</div>
                <div class="rec-info">
                    <div class="rec-name">${captain.name}</div>
                    <div class="rec-reason">${rec.reason}</div>
                </div>
                <span class="rec-rank ${rec.rank}">${rec.rank === 'best' ? '★ Best' : rec.rank === 'good' ? 'Good' : 'Viable'}</span>
            </div>
        `;
    }).join('');
    
    const html = `
        <div class="activity-card selected" style="cursor: default;">
            <div class="activity-header">
                <span class="activity-icon">${activity.icon}</span>
                <span class="activity-name">${activity.name}</span>
            </div>
            <div class="activity-description">${activity.description}</div>
            <div class="recommended-captains">
                <div class="recommended-title">RECOMMENDED CAPTAINS</div>
                ${recommendationsHtml}
            </div>
        </div>
    `;
    
    activityResultsPanel.innerHTML = html;
    activityResultsPanel.style.display = 'block';
}

function hideActivityResults() {
    if (activityResultsPanel) {
        activityResultsPanel.style.display = 'none';
    }
}

function populateQuickReferenceTable() {
    const tableBody = document.getElementById('captain-table-body');
    if (!tableBody) return;
    
    const pvePvpLabels = {
        'both': '<span class="use-tag both">PvE & PvP</span>',
        'pve': '<span class="use-tag pve">PvE Only</span>',
        'pvp': '<span class="use-tag pvp">PvP Only</span>',
        'harvest': '<span class="use-tag harvest">Harvesting</span>',
        'neither': '<span class="use-tag">Early Game</span>'
    };
    
    let html = '';
    for (const [id, captain] of Object.entries(captainsData)) {
        html += `
            <tr>
                <td>
                    <div class="captain-cell">
                        <span class="mini-avatar">${captain.icon}</span>
                        <span>${captain.name}</span>
                    </div>
                </td>
                <td>${captain.tagline}</td>
                <td>${pvePvpLabels[captain.pvePvp] || ''}</td>
                <td>${captain.bestEquipment.join(', ')}</td>
                <td>${captain.unlockCost}</td>
            </tr>
        `;
    }
    
    tableBody.innerHTML = html;
}

// Export for potential use in other modules
window.captainsData = captainsData;
window.activitiesData = activitiesData;
