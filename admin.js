// Data Management
const STORAGE_KEY = 'trashback_data';
const PLASTIC_WEIGHT_GRAMS = 20;

const getInitialData = () => ({
    userPoints: 0,
    totalDisposed: 0,
    usedCodes: [],
    history: [],
    coupons: []
});

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialData();

// DOM Elements
const totalItemsEl = document.getElementById('admin-total-items');
const totalWeightEl = document.getElementById('admin-total-weight');
const totalPointsEl = document.getElementById('admin-total-points');
const totalCouponsEl = document.getElementById('admin-total-coupons');
const codesList = document.getElementById('used-codes-list');
const noCodesEl = document.getElementById('no-codes');
const btnReset = document.getElementById('btn-reset');
const toastEl = document.getElementById('toast');

// UI Update functions
const showToast = (message, type = 'success') => {
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;

    setTimeout(() => {
        toastEl.className = 'toast';
    }, 3000);
};

const updateDashboard = () => {
    totalItemsEl.textContent = appData.totalDisposed;
    totalWeightEl.textContent = `${appData.totalDisposed * PLASTIC_WEIGHT_GRAMS}g`;
    totalPointsEl.textContent = appData.userPoints;
    totalCouponsEl.textContent = appData.coupons ? appData.coupons.length : 0;

    renderUsedCodes();
};

const renderUsedCodes = () => {
    codesList.innerHTML = '';

    if (appData.usedCodes.length === 0) {
        noCodesEl.style.display = 'block';
    } else {
        noCodesEl.style.display = 'none';
        const recentHistory = [...appData.history].reverse().slice(0, 10);

        recentHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'log-item animate-fade-in';
            li.innerHTML = `
                <div>
                    <span class="log-code">${item.code}</span>
                    <div class="log-date">${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <div style="text-align: right;">
                    <span class="log-points" style="color: var(--success); font-size: 0.8rem; display: block;">VERIFIED</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">Redeemed</span>
                </div>
            `;
            codesList.appendChild(li);
        });
    }
};

// Reset Logic with Protection
btnReset.addEventListener('click', () => {
    const confirmation = confirm('This will erase all demo data and reset points. Continue?');
    if (confirmation) {
        appData = getInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        updateDashboard();
        showToast('System data reset successfully.', 'success');
    } else {
        showToast('Reset aborted.', 'error');
    }
});

// Initialization
updateDashboard();
console.log("Admin Dashboard Loaded. Tracking integrity and metrics.");
