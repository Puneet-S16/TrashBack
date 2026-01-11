// Data Management
const STORAGE_KEY = 'trashback_data';
const PLASTIC_WEIGHT_GRAMS = 20; // Assume 1 plastic = 20g
const DAILY_SCAN_LIMIT = 3;

// Valid Demonstration Codes (Pre-loaded)
const DEMO_CODES = [
    'TB-PLASTIC-1001',
    'TB-PLASTIC-1002',
    'TB-PLASTIC-1003',
    'TB-PLASTIC-1004',
    'TB-PLASTIC-1005'
];

const getInitialData = () => ({
    userPoints: 0,
    totalDisposed: 0,
    usedCodes: [], // Stores only successfully redeemed codes
    history: [],
    demoInitialized: false
});

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialData();

// Initialize demo codes if not already done
if (!appData.demoInitialized) {
    appData.demoInitialized = true;
    // We don't add them to usedCodes yet, they are just "available" for the demo
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
};

// DOM Elements
const pointsEl = document.getElementById('user-points');
const itemsEl = document.getElementById('user-items');
const impactWeightEl = document.getElementById('impact-weight');
const proxyWeightEl = document.getElementById('proxy-weight');
const form = document.getElementById('dispose-form');
const input = document.getElementById('plastic-code');
const confirmCheckbox = document.getElementById('ethical-confirm');
const historyList = document.getElementById('history-list');
const noHistoryEl = document.getElementById('no-history');
const toastEl = document.getElementById('toast');

// UI Update functions
const showToast = (message, type = 'success') => {
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;

    setTimeout(() => {
        toastEl.className = 'toast';
    }, 3000);
};

const updateStats = () => {
    pointsEl.textContent = appData.userPoints;
    itemsEl.textContent = appData.totalDisposed;

    const weight = appData.totalDisposed * PLASTIC_WEIGHT_GRAMS;
    impactWeightEl.textContent = `${weight}g Plastic Saved`;
    proxyWeightEl.textContent = weight;
};

const renderHistory = () => {
    historyList.innerHTML = '';

    if (appData.history.length === 0) {
        noHistoryEl.style.display = 'block';
    } else {
        noHistoryEl.style.display = 'none';

        // Show last 5 items
        const recentHistory = [...appData.history].reverse().slice(0, 5);

        recentHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'log-item animate-fade-in';
            const rewardType = item.points >= 10 ? "Mock Coupon" : "Meal Contribution";
            li.innerHTML = `
                <div>
                    <span class="log-code">${item.code}</span>
                    <div class="log-date">${new Date(item.timestamp).toLocaleString()}</div>
                    <div style="font-size: 0.7rem; color: var(--primary);">${rewardType}</div>
                </div>
                <div class="log-points">+${item.points}</div>
            `;
            historyList.appendChild(li);
        });
    }
};

// Logic Helpers
const isDailyLimitReached = () => {
    const today = new Date().toDateString();
    const todayScans = appData.history.filter(item =>
        new Date(item.timestamp).toDateString() === today
    );
    return todayScans.length >= DAILY_SCAN_LIMIT;
};

// Logic
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();

    // 1. Format Enforcement
    const formatRegex = /^TB-PLASTIC-\d{4}$/;
    if (!formatRegex.test(code)) {
        showToast('Invalid plastic code format. Use TB-PLASTIC-XXXX', 'error');
        return;
    }

    // 2. Ethical Confirmation
    if (!confirmCheckbox.checked) {
        showToast('Please confirm responsible disposal.', 'error');
        return;
    }

    // 3. Daily Limit
    if (isDailyLimitReached()) {
        showToast('Daily scan limit reached (Max 3/day).', 'error');
        return;
    }

    // 4. Duplicate Check
    if (appData.usedCodes.includes(code)) {
        showToast('Code already claimed.', 'error');
        input.value = '';
        return;
    }

    // Process Reward
    const rewardPoints = 5;
    const logEntry = {
        code: code,
        points: rewardPoints,
        timestamp: new Date().toISOString(),
        impactGrams: PLASTIC_WEIGHT_GRAMS
    };

    appData.userPoints += rewardPoints;
    appData.totalDisposed += 1;
    appData.usedCodes.push(code);
    appData.history.push(logEntry);

    // Save and Update
    saveData();
    updateStats();
    renderHistory();

    // Reset inputs
    input.value = '';
    confirmCheckbox.checked = false;
    showToast(`Success! Earned ${rewardPoints} points and saved ${PLASTIC_WEIGHT_GRAMS}g plastic.`);
});

// Initialization
updateStats();
renderHistory();

// Log assumptions for technical judges
console.log("TrashBack Engine Loaded. Assumptions: 1 plastic = 20g, Codes simulated, Disposal user-confirmed.");
