// ============================================
// ZenPy - Utility Functions
// ============================================

const ZENPY_THEME_KEY = 'zenpy_theme';
const ZENPY_BANNER_COLOR_CACHE_KEY = 'zenpy_banner_color_cache';
const ZENPY_THEME_OPTIONS = [
    { mode: 'dark', label: 'Dark' },
    { mode: 'light', label: 'Light' },
    { mode: 'nature', label: 'Nature' },
    { mode: 'ocean', label: 'Ocean' },
    { mode: 'sunset', label: 'Sunset' }
];
const ZENPY_THEME_MODES = ZENPY_THEME_OPTIONS.map((themeOption) => themeOption.mode);

function getThemeLabel(themeMode) {
    const option = ZENPY_THEME_OPTIONS.find((themeOption) => themeOption.mode === themeMode);
    return option?.label || 'Dark';
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem(ZENPY_THEME_KEY);
    const themeMode = ZENPY_THEME_MODES.includes(savedTheme) ? savedTheme : 'dark';
    applyThemeMode(themeMode);
}

function saveThemePreference(themeMode) {
    localStorage.setItem(ZENPY_THEME_KEY, ZENPY_THEME_MODES.includes(themeMode) ? themeMode : 'dark');
}

function applyThemeMode(themeMode) {
    const normalizedMode = ZENPY_THEME_MODES.includes(themeMode) ? themeMode : 'dark';
    document.body.classList.toggle('light-theme', normalizedMode === 'light');
    document.body.classList.toggle('nature-theme', normalizedMode === 'nature');
    document.body.classList.toggle('ocean-theme', normalizedMode === 'ocean');
    document.body.classList.toggle('sunset-theme', normalizedMode === 'sunset');
    document.body.dataset.themeMode = normalizedMode;
}

function getCurrentThemeMode() {
    const activeMode = document.body?.dataset?.themeMode;
    if (ZENPY_THEME_MODES.includes(activeMode)) return activeMode;
    if (document.body?.classList.contains('sunset-theme')) return 'sunset';
    if (document.body?.classList.contains('ocean-theme')) return 'ocean';
    if (document.body?.classList.contains('nature-theme')) return 'nature';
    if (document.body?.classList.contains('light-theme')) return 'light';
    return 'dark';
}

function getNextThemeMode(currentMode) {
    const index = ZENPY_THEME_MODES.indexOf(currentMode);
    return ZENPY_THEME_MODES[(index + 1) % ZENPY_THEME_MODES.length];
}

function ensureThemeSwitcher() {
    const host = document.getElementById('themeSwitcherHost');
    if (!host) return;

    let button = document.getElementById('themeSwitcherButton');
    if (!button) {
        button = document.createElement('button');
        button.id = 'themeSwitcherButton';
        button.type = 'button';
        button.className = 'btn theme-switcher theme-switcher-inline';
        button.addEventListener('click', () => {
            const nextMode = getNextThemeMode(getCurrentThemeMode());
            applyThemeMode(nextMode);
            saveThemePreference(nextMode);
            button.textContent = `Theme: ${getThemeLabel(nextMode)}`;
        });
        host.innerHTML = '';
        host.appendChild(button);
    }

    button.textContent = `Theme: ${getThemeLabel(getCurrentThemeMode())}`;
}

function initSmoothPageTransitions() {
    if (!document.body) return;
    if (document.body.classList.contains('no-page-transition')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('page-enter');

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (link.hasAttribute('download')) return;
        if (link.target && link.target !== '_self') return;
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

        const targetUrl = new URL(link.href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        if (targetUrl.origin !== currentUrl.origin) return;
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) return;

        event.preventDefault();
        document.body.classList.remove('page-enter');
        document.body.classList.add('page-exit');
        setTimeout(() => {
            window.location.href = targetUrl.pathname + targetUrl.search + targetUrl.hash;
        }, 360);
    }, true);
}

function normalizeSocialHandle(rawValue = '') {
    const input = String(rawValue || '').trim();
    if (!input || input.toLowerCase() === 'linked') return '';

    const cleanedInput = input.replace(/^@+/, '').trim();

    try {
        const parsed = new URL(cleanedInput.includes('://') ? cleanedInput : `https://${cleanedInput}`);
        const pathPart = parsed.pathname.replace(/^\/+/, '').split('/')[0];
        if (pathPart) return pathPart.replace(/^@+/, '');
    } catch {
    }

    return cleanedInput.split('/')[0].replace(/^@+/, '').trim();
}

function buildSocialLink(platform, value = '') {
    const username = normalizeSocialHandle(value);
    if (!username) return '';

    const domains = {
        github: 'https://github.com/',
        instagram: 'https://instagram.com/',
        twitter: 'https://x.com/'
    };

    const base = domains[platform];
    return base ? `${base}${username}` : '';
}

function socialHandleFromValue(value = '') {
    return normalizeSocialHandle(value);
}

function initThemeSystem() {
    if (!document.body) return;
    applySavedTheme();
    ensureThemeSwitcher();
    initSmoothPageTransitions();
}

function hexFromRgb(red, green, blue) {
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function getBannerColorCache() {
    try {
        const parsed = JSON.parse(localStorage.getItem(ZENPY_BANNER_COLOR_CACHE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function setBannerColorCache(cache) {
    localStorage.setItem(ZENPY_BANNER_COLOR_CACHE_KEY, JSON.stringify(cache));
}

async function extractDominantGifColor(assetPath, fallback = '#ff1493') {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.decoding = 'async';

        image.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const sampleWidth = 40;
                const sampleHeight = 24;
                canvas.width = sampleWidth;
                canvas.height = sampleHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return resolve(fallback);

                ctx.drawImage(image, 0, 0, sampleWidth, sampleHeight);
                const { data } = ctx.getImageData(0, 0, sampleWidth, sampleHeight);

                let bestScore = -1;
                let bestColor = fallback;

                for (let i = 0; i < data.length; i += 4) {
                    const red = data[i];
                    const green = data[i + 1];
                    const blue = data[i + 2];
                    const alpha = data[i + 3];
                    if (alpha < 32) continue;

                    const maxValue = Math.max(red, green, blue);
                    const minValue = Math.min(red, green, blue);
                    const saturation = maxValue === 0 ? 0 : (maxValue - minValue) / maxValue;
                    const brightness = maxValue / 255;

                    if (brightness < 0.18) continue;

                    const score = saturation * 0.75 + brightness * 0.25;
                    if (score > bestScore) {
                        bestScore = score;
                        bestColor = hexFromRgb(red, green, blue);
                    }
                }

                resolve(bestColor);
            } catch {
                resolve(fallback);
            }
        };

        image.onerror = () => resolve(fallback);
        image.src = assetPath;
    });
}

async function getBannerAccentColor(assetPath, fallback = '#ff1493') {
    if (!assetPath) return fallback;

    const cache = getBannerColorCache();
    if (cache[assetPath]) return cache[assetPath];

    const color = await extractDominantGifColor(assetPath, fallback);
    cache[assetPath] = color;
    setBannerColorCache(cache);
    return color;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSystem);
} else {
    initThemeSystem();
}

// Intercept OAuth Tokens from URL globally before any logic runs
(function() {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');
    
    if (urlToken) {
        localStorage.setItem('zenpy_token', urlToken);
        if (urlUser) {
            localStorage.setItem('zenpy_user', decodeURIComponent(urlUser));
        }
        // Clean URL so the token doesn't stay in the address bar
        window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

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
            if (u.image && el('sidebarAvatar')) {
                const img = el('sidebarAvatar').querySelector('img');
                if (img) {
                    if (u.image === 'default-avatar.png' || u.image === 'default-avatar.svg') {
                        img.src = '/assets/avatars/default-avatar.svg';
                    } else if (u.image.startsWith('http')) {
                        img.src = u.image;
                    } else {
                        img.src = `/assets/avatars/${u.image}`;
                    }
                    img.onerror = function() {
                        this.src = '/assets/avatars/default-avatar.svg';
                    };
                }
            }

            // Apply name style
            if (u.cssMap?.nameStyle && el('sidebarUsername')) {
                el('sidebarUsername').className = `sidebar-username ${u.cssMap.nameStyle}`;
            }
            // Apply frame
            if (u.cssMap?.frame && el('sidebarAvatar')) {
                const parts = el('sidebarAvatar').className.split(' ').filter(c => !c.includes('-frame') && !c.includes('-border') && c !== 'animated-avatar');
                parts.push(u.cssMap.frame);
                el('sidebarAvatar').className = parts.join(' ');
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
