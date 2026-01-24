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
    buildings: [
        { name: 'Stronghold', comp: 500000 },
        { name: 'Main', comp: 1000000 },
        { name: 'Portal', comp: 100000 }
    ]
};

// Create input field with slider and text input
function createUnitInput(unitName, compRate, sectionId) {
    const inputId = `${sectionId}-${unitName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    // Slider max for visual control, but text input has no max for flexibility
    const sliderMax = sectionId === 'building' ? 10 : 20000;
    
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
                       class="number-input" 
                       id="${inputId}"
                       min="0" 
                       value="0" 
                       step="1"
                       data-slider-id="${inputId}-slider"
                       data-comp="${compRate}"
                       tabindex="1"
                       placeholder="0">
                <span class="comp-rate">/${compRate.toLocaleString()}</span>
            </div>
        </div>
        <div class="subtotal" id="${inputId}-subtotal">0</div>
    `;
    
    return unitDiv;
}

// Initialize calculator
function initializeCalculator() {
    // Guardsman Units
    const guardsmanContainer = document.getElementById('guardsman-units');
    calculatorData.guardsman.forEach(unit => {
        guardsmanContainer.appendChild(createUnitInput(unit.name, unit.comp, 'guardsman'));
    });

    // Engineering Units
    const engineeringContainer = document.getElementById('engineering-units');
    calculatorData.engineering.forEach(unit => {
        engineeringContainer.appendChild(createUnitInput(unit.name, unit.comp, 'engineering'));
    });

    // Monsters
    const monsterContainer = document.getElementById('monster-units');
    calculatorData.monsters.forEach(unit => {
        monsterContainer.appendChild(createUnitInput(unit.name, unit.comp, 'monster'));
    });

    // Mercenaries
    const mercenaryContainer = document.getElementById('mercenary-units');
    calculatorData.mercenaries.forEach(unit => {
        mercenaryContainer.appendChild(createUnitInput(unit.name, unit.comp, 'mercenary'));
    });

    // Buildings
    const buildingContainer = document.getElementById('building-units');
    calculatorData.buildings.forEach(unit => {
        buildingContainer.appendChild(createUnitInput(unit.name, unit.comp, 'building'));
    });

    // Add event listeners
    setupEventListeners();
    
    // Set up tab order
    setupTabOrder();
}

// Setup event listeners
function setupEventListeners() {
    // Slider to text input sync
    document.querySelectorAll('.slider-input').forEach(slider => {
        slider.addEventListener('input', function() {
            const inputId = this.getAttribute('data-input-id');
            const textInput = document.getElementById(inputId);
            textInput.value = this.value;
            calculateSubtotal(inputId);
        });
    });

    // Text input to slider sync
    document.querySelectorAll('.number-input').forEach(input => {
        input.addEventListener('input', function() {
            const sliderId = this.getAttribute('data-slider-id');
            const slider = document.getElementById(sliderId);
            if (slider) {
                const value = Math.min(parseInt(this.value) || 0, parseInt(slider.max));
                slider.value = value;
            }
            calculateSubtotal(this.id);
        });

        // Allow Enter key to move to next field
        input.addEventListener('keydown', function(e) {
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

    // Reset button
    document.getElementById('reset-button').addEventListener('click', resetCalculator);
}

// Calculate subtotal for a unit
function calculateSubtotal(inputId) {
    const input = document.getElementById(inputId);
    const qty = parseInt(input.value) || 0;
    const comp = parseFloat(input.getAttribute('data-comp')) || 0;
    const subtotal = qty * comp;
    
    const subtotalElement = document.getElementById(`${inputId}-subtotal`);
    if (subtotalElement) {
        subtotalElement.textContent = subtotal.toLocaleString();
    }
    
    updateSectionTotals();
    updateGrandTotal();
}

// Update section totals
function updateSectionTotals() {
    const sections = ['guardsman', 'engineering', 'monster', 'mercenary', 'building'];
    
    sections.forEach(section => {
        let total = 0;
        const inputs = document.querySelectorAll(`#${section}-units .number-input`);
        inputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            const comp = parseFloat(input.getAttribute('data-comp')) || 0;
            total += qty * comp;
        });
        
        const totalElement = document.getElementById(`${section}-total`);
        if (totalElement) {
            totalElement.textContent = total.toLocaleString();
        }
    });
}

// Update grand total
function updateGrandTotal() {
    let grandTotal = 0;
    const sections = ['guardsman', 'engineering', 'monster', 'mercenary', 'building'];
    
    sections.forEach(section => {
        const totalElement = document.getElementById(`${section}-total`);
        if (totalElement) {
            const sectionTotal = parseInt(totalElement.textContent.replace(/,/g, '')) || 0;
            grandTotal += sectionTotal;
        }
    });
    
    const grandTotalElement = document.getElementById('grand-total');
    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal.toLocaleString();
    }
}

// Reset calculator
function resetCalculator() {
    document.querySelectorAll('.number-input').forEach(input => {
        input.value = 0;
        const sliderId = input.getAttribute('data-slider-id');
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.value = 0;
        }
    });
    
    updateSectionTotals();
    updateGrandTotal();
    
    // Focus first input
    const firstInput = document.querySelector('.number-input');
    if (firstInput) {
        firstInput.focus();
        firstInput.select();
    }
}

// Setup tab order for better navigation
function setupTabOrder() {
    const inputs = Array.from(document.querySelectorAll('.number-input'));
    inputs.forEach((input, index) => {
        input.setAttribute('tabindex', index + 1);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCalculator);
