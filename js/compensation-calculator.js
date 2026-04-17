// Compensation Calculator Data and Logic
const calculatorData = {
    guardsman: [
        { name: 'G1/S1', comp: 50 },
        { name: 'G2/S2', comp: 80 },
        { name: 'G3/S3', comp: 110 },
        { name: 'G4/S4', comp: 140 },
        { name: 'G5/S5', comp: 200 },
        { name: 'G6/S6', comp: 300 },
        { name: 'G7/S7', comp: 400 },
        { name: 'G8/S8', comp: 800 },
        { name: 'G9/S9', comp: 1000 },
        { name: 'G10/S10', comp: 2000 }
    ],
    engineering: [
        { name: 'E1', comp: 3000 },
        { name: 'E2', comp: 5000 },
        { name: 'E3', comp: 8000 },
        { name: 'E4', comp: 12000 },
        { name: 'E5', comp: 20000 }
    ],
    monsters: [
        { name: 'M3', comp: 2600 },
        { name: 'M4', comp: 4800 },
        { name: 'M5', comp: 7000 },
        { name: 'M6', comp: 9600 },
        { name: 'M7', comp: 14000 },
        { name: 'M8', comp: 16000 },
        { name: 'M9', comp: 19000 }
    ],
    mercenaries: [
        { name: 'M5-M8', comp: 1000 }
    ],
    // Integer levels; silver per level
    heroCaptains: [
        { name: 'Hero level', comp: 3_000 },
        { name: 'Captain 1 level', comp: 2_000 },
        { name: 'Captain 2 level', comp: 2_000 },
        { name: 'Captain 3 level', comp: 2_000 }
    ],
    // Integer count 0–10 each; silver per unit (ROE conversion chart)
    buildings: [
        { name: 'Clan Fort', comp: 5_000_000 },
        { name: 'Other clan buildings', comp: 3_000_000 },
        { name: 'Clan Capital', comp: 10_000_000 },
        { name: 'Portals', comp: 2_000_000 },
        { name: 'Wall construction', comp: 200_000 },
        { name: 'Judge', comp: 500_000 }
    ]
};

// 500 gold (Tar) = 1,000 silver → silver per gold = 2
const WS_DM_SILVER_PER_GOLD = 2;

// Create input field with slider and text input
function createUnitInput(unitName, compRate, sectionId) {
    const inputId = `${sectionId}-${unitName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const isLimitedIncident = sectionId === 'building';
    const isHeroCaptains = sectionId === 'hero-captains';
    const sliderMax = isLimitedIncident ? 10 : isHeroCaptains ? 600 : 5000;
    let limitedAttrs;
    if (isLimitedIncident) {
        limitedAttrs = 'max="10" class="number-input limited-int-input"';
    } else if (isHeroCaptains) {
        limitedAttrs = 'max="600" class="number-input"';
    } else {
        limitedAttrs = 'class="number-input"';
    }

    const unitDiv = document.createElement('div');
    unitDiv.className = 'unit-row';
    unitDiv.innerHTML = `
        <label class="unit-label" for="${inputId}">${unitName}</label>
        <div class="input-group">
            <input type="range" 
                   class="slider-input" 
                   id="${inputId}-slider"
                   min="0" 
                   max="${sliderMax}" 
                   value="0" 
                   step="1"
                   data-input-id="${inputId}">
            <div class="input-with-rate">
                <input type="number" 
                       ${limitedAttrs}
                       id="${inputId}"
                       min="0" 
                       value="0" 
                       step="1"
                       data-slider-id="${inputId}-slider"
                       data-comp="${compRate}"
                       tabindex="1"
                       placeholder="0">
                <span class="comp-rate">×${compRate.toLocaleString()}</span>
            </div>
        </div>
        <div class="subtotal" id="${inputId}-subtotal">0</div>
    `;

    return unitDiv;
}

/** WS/DM: integer gold (Tar); no slider; large values allowed */
function createWsdmGoldInput() {
    const inputId = 'wsdm-gold';
    const unitDiv = document.createElement('div');
    unitDiv.className = 'unit-row';
    unitDiv.innerHTML = `
        <label class="unit-label" for="${inputId}">Gold (Tar)</label>
        <div class="input-group">
            <div class="input-with-rate" style="flex: 1; justify-content: flex-start; margin-left: 0;">
                <input type="number" 
                       class="number-input" 
                       id="${inputId}"
                       min="0" 
                       value="0" 
                       step="1"
                       data-comp="${WS_DM_SILVER_PER_GOLD}"
                       tabindex="1"
                       placeholder="0"
                       aria-describedby="wsdm-rate-hint">
                <span class="comp-rate" id="wsdm-rate-hint">×${WS_DM_SILVER_PER_GOLD} silver / gold</span>
            </div>
        </div>
        <div class="subtotal" id="${inputId}-subtotal">0</div>
    `;
    return unitDiv;
}

function clampLimitedIntInputs(input) {
    if (!input.classList.contains('limited-int-input')) return;
    let q = parseInt(input.value, 10);
    if (Number.isNaN(q)) return;
    q = Math.max(0, Math.min(10, q));
    if (parseInt(input.value, 10) !== q) {
        input.value = q;
    }
}

/** Hero/captain level fields: number input max matches slider (600) */
function clampByNumberMax(input) {
    if (!input.hasAttribute('max') || input.classList.contains('limited-int-input')) return;
    const cap = parseInt(input.getAttribute('max'), 10);
    if (Number.isNaN(cap)) return;
    let q = parseInt(input.value, 10);
    if (Number.isNaN(q)) return;
    q = Math.max(0, Math.min(cap, q));
    if (parseInt(input.value, 10) !== q) {
        input.value = q;
    }
}

// Initialize calculator
function initializeCalculator() {
    const guardsmanContainer = document.getElementById('guardsman-units');
    calculatorData.guardsman.forEach(unit => {
        guardsmanContainer.appendChild(createUnitInput(unit.name, unit.comp, 'guardsman'));
    });

    const engineeringContainer = document.getElementById('engineering-units');
    calculatorData.engineering.forEach(unit => {
        engineeringContainer.appendChild(createUnitInput(unit.name, unit.comp, 'engineering'));
    });

    const monsterContainer = document.getElementById('monster-units');
    calculatorData.monsters.forEach(unit => {
        monsterContainer.appendChild(createUnitInput(unit.name, unit.comp, 'monster'));
    });

    const mercenaryContainer = document.getElementById('mercenary-units');
    calculatorData.mercenaries.forEach(unit => {
        mercenaryContainer.appendChild(createUnitInput(unit.name, unit.comp, 'mercenary'));
    });

    const heroCaptainsContainer = document.getElementById('hero-captains-units');
    calculatorData.heroCaptains.forEach(unit => {
        heroCaptainsContainer.appendChild(createUnitInput(unit.name, unit.comp, 'hero-captains'));
    });

    const buildingContainer = document.getElementById('building-units');
    calculatorData.buildings.forEach(unit => {
        buildingContainer.appendChild(createUnitInput(unit.name, unit.comp, 'building'));
    });

    const wsdmContainer = document.getElementById('wsdm-units');
    wsdmContainer.appendChild(createWsdmGoldInput());

    setupEventListeners();
    setupTabOrder();
}

function setupEventListeners() {
    document.querySelectorAll('.slider-input').forEach(slider => {
        slider.addEventListener('input', function () {
            const inputId = this.getAttribute('data-input-id');
            const textInput = document.getElementById(inputId);
            textInput.value = this.value;
            calculateSubtotal(inputId);
        });
    });

    document.querySelectorAll('.number-input').forEach(input => {
        input.addEventListener('focus', function () {
            this.select();
        });

        input.addEventListener('input', function () {
            clampLimitedIntInputs(this);
            clampByNumberMax(this);

            const sliderId = this.getAttribute('data-slider-id');
            const slider = sliderId ? document.getElementById(sliderId) : null;
            if (slider) {
                const value = Math.min(parseInt(this.value, 10) || 0, parseInt(slider.max, 10));
                slider.value = value;
            }

            calculateSubtotal(this.id);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll('.number-input'));
                const currentIndex = inputs.indexOf(this);
                if (currentIndex < inputs.length - 1) {
                    inputs[currentIndex + 1].focus();
                    inputs[currentIndex + 1].select();
                }
            }
        });
    });

    document.getElementById('reset-button').addEventListener('click', resetCalculator);
}

function calculateSubtotal(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let qty = parseInt(input.value, 10) || 0;
    if (input.classList.contains('limited-int-input')) {
        qty = Math.max(0, Math.min(10, qty));
    } else if (input.hasAttribute('max') && input.getAttribute('max') !== '') {
        const cap = parseInt(input.getAttribute('max'), 10);
        if (!Number.isNaN(cap)) qty = Math.max(0, Math.min(cap, qty));
    }
    const comp = parseFloat(input.getAttribute('data-comp')) || 0;
    const subtotal = qty * comp;

    const subtotalElement = document.getElementById(`${inputId}-subtotal`);
    if (subtotalElement) {
        subtotalElement.textContent = subtotal.toLocaleString();
    }

    updateSectionTotals();
    updateGrandTotal();
}

function updateSectionTotals() {
    const sections = ['guardsman', 'engineering', 'monster', 'mercenary', 'hero-captains', 'building'];

    sections.forEach(section => {
        let total = 0;
        const inputs = document.querySelectorAll(`#${section}-units .number-input`);
        inputs.forEach(input => {
            let qty = parseInt(input.value, 10) || 0;
            if (input.classList.contains('limited-int-input')) {
                qty = Math.max(0, Math.min(10, qty));
            } else if (input.hasAttribute('max') && input.getAttribute('max') !== '') {
                const cap = parseInt(input.getAttribute('max'), 10);
                if (!Number.isNaN(cap)) qty = Math.max(0, Math.min(cap, qty));
            }
            const comp = parseFloat(input.getAttribute('data-comp')) || 0;
            total += qty * comp;
        });

        const totalElement = document.getElementById(`${section}-total`);
        if (totalElement) {
            totalElement.textContent = total.toLocaleString();
        }
    });

    const wsdmInput = document.querySelector('#wsdm-units .number-input');
    const wsdmTotalEl = document.getElementById('wsdm-total');
    if (wsdmInput && wsdmTotalEl) {
        const g = parseInt(wsdmInput.value, 10) || 0;
        const silver = g * WS_DM_SILVER_PER_GOLD;
        wsdmTotalEl.textContent = silver.toLocaleString();
    }
}

function updateGrandTotal() {
    let grandTotal = 0;
    const sections = ['guardsman', 'engineering', 'monster', 'mercenary', 'hero-captains', 'building'];

    sections.forEach(section => {
        const totalElement = document.getElementById(`${section}-total`);
        if (totalElement) {
            const sectionTotal = parseInt(totalElement.textContent.replace(/,/g, ''), 10) || 0;
            grandTotal += sectionTotal;
        }
    });

    const wsdmTotalEl = document.getElementById('wsdm-total');
    if (wsdmTotalEl) {
        grandTotal += parseInt(wsdmTotalEl.textContent.replace(/,/g, ''), 10) || 0;
    }

    const grandTotalElement = document.getElementById('grand-total');
    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal.toLocaleString();
    }
}

function resetCalculator() {
    document.querySelectorAll('.number-input').forEach(input => {
        input.value = 0;
        const sliderId = input.getAttribute('data-slider-id');
        if (sliderId) {
            const slider = document.getElementById(sliderId);
            if (slider) slider.value = 0;
        }
    });

    document.querySelectorAll('.calculator-wrapper .subtotal').forEach(el => {
        el.textContent = '0';
    });

    updateSectionTotals();
    updateGrandTotal();

    const firstInput = document.querySelector('.number-input');
    if (firstInput) {
        firstInput.focus();
        firstInput.select();
    }
}

function setupTabOrder() {
    const inputs = Array.from(document.querySelectorAll('.number-input'));
    inputs.forEach((input, index) => {
        input.setAttribute('tabindex', index + 1);
    });
}

document.addEventListener('DOMContentLoaded', initializeCalculator);
