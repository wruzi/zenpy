// ============================================
// ZenPy - Utility Functions
// ============================================

// --- Token Management ---
function getToken() {
    return localStorage.getItem('zenpy_token');
}

function setToken(token) {
    localStorage.setItem('zenpy_token', token);
}

function removeToken() {
    localStorage.removeItem('zenpy_token');
}

function isLoggedIn() {
    return !!getToken();
}

// --- API Helper ---
async function apiCall(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(options.headers || {})
    };

    try {
        const res = await fetch(url, { ...options, headers });
        const data = await res.json();
        
        if (res.status === 401) {
            removeToken();
            window.location.href = '/login';
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const svgIcons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${svgIcons[type] || svgIcons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- Logout ---
function logout() {
    removeToken();
    localStorage.removeItem('zenpy_user');
    localStorage.removeItem('zenpy_activity');
    localStorage.removeItem('zenpy_copyAttempts');
    window.location.href = '/login';
}

// --- Auth Check for Protected Pages ---
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// --- Format Time ---
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTimestamp(ts) {
    const date = new Date(ts);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString();
}

// --- Number Formatting ---
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
}

// --- Sidebar Setup ---
async function setupSidebar() {
    const token = getToken();
    if (!token) return;

    try {
        const data = await apiCall('/api/user');
        if (data && data.success) {
            const u = data.user;
            const el = (id) => document.getElementById(id);
            
            if (el('sidebarUsername')) el('sidebarUsername').textContent = u.username;
            if (el('sidebarTitle')) el('sidebarTitle').textContent = u.inventory?.equipped?.title || 'Newbie';
            if (el('sidebarLevel')) el('sidebarLevel').textContent = u.level;
            if (el('sidebarZen')) el('sidebarZen').textContent = formatNumber(u.zen);
            if (el('sidebarStreak')) el('sidebarStreak').textContent = u.streak;

            // Apply avatar image
            if (u.image && u.image !== 'default-avatar.png' && el('sidebarAvatar')) {
                const img = el('sidebarAvatar').querySelector('img');
                if (img) img.src = `/assets/avatars/${u.image}`;
            }

            // Apply name style
            if (u.inventory?.equipped?.nameStyle && el('sidebarUsername')) {
                el('sidebarUsername').classList.add(u.inventory.equipped.nameStyle);
            }
            // Apply frame
            if (u.inventory?.equipped?.frame && el('sidebarAvatar')) {
                el('sidebarAvatar').classList.add(u.inventory.equipped.frame);
            }

            return { user: u, progress: data.progress };
        }
    } catch (e) {
        console.error('Sidebar setup error:', e);
    }
    return null;
}

// --- Escape HTML ---
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Debounce ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
