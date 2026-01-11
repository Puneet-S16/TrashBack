// Data Management
const STORAGE_KEY = 'trashback_data';

const getInitialData = () => ({
    userPoints: 0,
    totalDisposed: 0,
    usedCodes: [],
    history: []
});

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialData();

// DOM Elements
const totalItemsEl = document.getElementById('admin-total-items');
const totalPointsEl = document.getElementById('admin-total-points');
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
    totalPointsEl.textContent = appData.userPoints;

    renderUsedCodes();
};

const renderUsedCodes = () => {
    codesList.innerHTML = '';

    if (appData.usedCodes.length === 0) {
        noCodesEl.style.display = 'block';
    } else {
        noCodesEl.style.display = 'none';

        // Show last 10 used codes
        const recentCodes = [...appData.usedCodes].reverse().slice(0, 10);

        recentCodes.forEach(code => {
            const li = document.createElement('li');
            li.className = 'log-item animate-fade-in';
            li.innerHTML = `
                <span class="log-code">${code}</span>
                <span class="log-date">Verified Package</span>
            `;
            codesList.appendChild(li);
        });
    }
};

// Reset Logic
btnReset.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all demo data? This cannot be undone.')) {
        appData = getInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        updateDashboard();
        showToast('All data has been reset.', 'success');
    }
});

// Initialization
updateDashboard();
