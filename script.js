// Data Management
const STORAGE_KEY = 'trashback_data';
const PLASTIC_WEIGHT_GRAMS = 20; // Assume 1 plastic = 20g
const DAILY_SCAN_LIMIT = 3;
const REDEMPTION_COST = 10; // Points needed for a coupon

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
    coupons: [], // Stores redeemed coupons
    demoInitialized: false
});

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialData();

// Initialize demo codes if not already done
if (!appData.demoInitialized) {
    appData.demoInitialized = true;
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

// New Redemption Elements
const redeemPointsBalanceEl = document.getElementById('redeem-points-balance');
const btnRedeem = document.getElementById('btn-redeem');
const couponsContainer = document.getElementById('coupons-container');
const couponsList = document.getElementById('coupons-list');

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
    redeemPointsBalanceEl.textContent = appData.userPoints;
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
        const recentHistory = [...appData.history].reverse().slice(0, 5);

        recentHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'log-item animate-fade-in';
            li.innerHTML = `
                <div>
                    <span class="log-code">${item.code}</span>
                    <div class="log-date">${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <div class="log-points">+${item.points}</div>
            `;
            historyList.appendChild(li);
        });
    }
};

const renderCoupons = () => {
    couponsList.innerHTML = '';

    if (appData.coupons && appData.coupons.length > 0) {
        couponsContainer.style.display = 'block';
        appData.coupons.forEach(coupon => {
            const li = document.createElement('li');
            li.className = 'log-item animate-fade-in';
            li.style.background = 'rgba(16, 185, 129, 0.1)';
            li.style.border = '1px dashed var(--success)';
            li.innerHTML = `
                <div>
                    <span class="log-code" style="background: var(--success); color: white;">${coupon.coupon_code}</span>
                    <div class="log-date">${coupon.type} | Value: ${coupon.value}</div>
                    <div class="log-date">Unlocked: ${new Date(coupon.redeemed_at).toLocaleString()}</div>
                </div>
                <div style="font-size: 1.25rem;">🎉</div>
            `;
            couponsList.appendChild(li);
        });
    } else {
        couponsContainer.style.display = 'none';
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

const generateCouponCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TRASHBACK-FOOD-${random}`;
};

// Disposal Logic
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();

    const formatRegex = /^TB-PLASTIC-\d{4}$/;
    if (!formatRegex.test(code)) {
        showToast('Invalid plastic code format. Use TB-PLASTIC-XXXX', 'error');
        return;
    }

    if (!confirmCheckbox.checked) {
        showToast('Please confirm responsible disposal.', 'error');
        return;
    }

    if (isDailyLimitReached()) {
        showToast('Daily scan limit reached (Max 3/day).', 'error');
        return;
    }

    if (appData.usedCodes.includes(code)) {
        showToast('Code already claimed.', 'error');
        input.value = '';
        return;
    }

    const rewardPoints = 5;
    const logEntry = {
        code: code,
        points: rewardPoints,
        timestamp: new Date().toISOString()
    };

    appData.userPoints += rewardPoints;
    appData.totalDisposed += 1;
    appData.usedCodes.push(code);
    appData.history.push(logEntry);

    saveData();
    updateStats();
    renderHistory();

    input.value = '';
    confirmCheckbox.checked = false;
    showToast(`Success! Earned ${rewardPoints} points.`);
});

// Redemption Logic
btnRedeem.addEventListener('click', () => {
    if (appData.userPoints < REDEMPTION_COST) {
        showToast(`You need at least ${REDEMPTION_COST} points to redeem a coupon.`, 'error');
        return;
    }

    const newCoupon = {
        coupon_code: generateCouponCode(),
        value: '₹10',
        type: 'Food / Cashback',
        redeemed_at: new Date().toISOString()
    };

    appData.userPoints -= REDEMPTION_COST;
    if (!appData.coupons) appData.coupons = [];
    appData.coupons.push(newCoupon);

    saveData();
    updateStats();
    renderCoupons();

    showToast('₹10 Food/Cashback Coupon Unlocked 🎉');
});

// Initialization
updateStats();
renderHistory();
renderCoupons();

console.log("TrashBack Engine Loaded. Redemption system active.");
