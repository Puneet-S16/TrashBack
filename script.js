// Data Management
const STORAGE_KEY = 'trashback_data';

const getInitialData = () => ({
    userPoints: 0,
    totalDisposed: 0,
    usedCodes: [],
    history: []
});

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getInitialData();

const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
};

// DOM Elements
const pointsEl = document.getElementById('user-points');
const itemsEl = document.getElementById('user-items');
const form = document.getElementById('dispose-form');
const input = document.getElementById('plastic-code');
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

    // Animate numbers
    pointsEl.classList.add('animate-fade-in');
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

// Logic
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();

    if (!code) return;

    // Duplicate Check
    if (appData.usedCodes.includes(code)) {
        showToast('This code has already been used.', 'error');
        input.value = '';
        return;
    }

    // Process Reward
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
    showToast(`Success! Earned ${rewardPoints} points.`);
});

// Initialization
updateStats();
renderHistory();
