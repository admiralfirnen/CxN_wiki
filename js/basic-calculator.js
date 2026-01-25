// Basic Calculator Logic
let currentInput = '0';
let previousInput = '';
let operator = '';
let shouldResetDisplay = false;

const display = document.getElementById('calculator-display');

// Auto-select display on focus (like compensation calculator)
if (display) {
    display.addEventListener('focus', function() {
        this.select();
    });
    
    // Allow keyboard input
    display.addEventListener('keydown', function(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            appendNumber(e.key);
        } else if (e.key === '.') {
            appendDecimal();
        } else if (e.key === '+' || e.key === '-') {
            appendOperator(e.key);
        } else if (e.key === '*') {
            appendOperator('*');
        } else if (e.key === '/') {
            e.preventDefault();
            appendOperator('/');
        } else if (e.key === 'Enter' || e.key === '=') {
            calculate();
        } else if (e.key === 'Escape') {
            clearAll();
        } else if (e.key === 'Backspace') {
            deleteLast();
        }
    });
}

function updateDisplay() {
    if (display) {
        display.value = currentInput;
    }
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0') {
        currentInput = number;
    } else {
        currentInput += number;
    }
    
    updateDisplay();
}

function appendDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (currentInput.indexOf('.') === -1) {
        currentInput += '.';
    }
    
    updateDisplay();
}

function appendOperator(op) {
    if (previousInput && operator && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (!operator || !previousInput) {
        return;
    }
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                currentInput = 'Error';
                updateDisplay();
                setTimeout(() => {
                    clearAll();
                }, 2000);
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    // Format result to avoid floating point errors
    result = Math.round(result * 100000000) / 100000000;
    
    currentInput = result.toString();
    previousInput = '';
    operator = '';
    shouldResetDisplay = true;
    
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    shouldResetDisplay = false;
    updateDisplay();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Initialize display
updateDisplay();
