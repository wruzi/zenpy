// ============================================
// ZenPy - Leaderboard JS
// 4 Tab Leaderboards with avatars & SVG rank icons
// ============================================

if (!requireAuth()) { /* redirected */ }

let currentTab = 'progression';
let currentUser = null;

async function loadLeaderboard() {
    const data = await setupSidebar();
    if (data) currentUser = data.user;
    fetchLeaderboard(currentTab);
}

async function fetchLeaderboard(type) {
    const data = await apiCall(`/api/leaderboard/${type}`);
    if (!data?.success) return;

    updateTableHeaders(type);
    renderTable(data.leaderboard, type);
}

function switchTab(type) {
    currentTab = type;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
    fetchLeaderboard(type);
}

function updateTableHeaders(type) {
    const headers = {
        progression: '<th>#</th><th>User</th><th>Question</th><th>Completed</th><th>Total Time</th>',
        speed: '<th>#</th><th>User</th><th>Avg Time</th><th>Questions Done</th>',
        xp: '<th>#</th><th>User</th><th>XP</th><th>Level</th><th>Streak</th>',
        zen: '<th>#</th><th>User</th><th>Zen Coins</th><th>Items Owned</th>'
    };
    document.getElementById('tableHead').innerHTML = `<tr>${headers[type]}</tr>`;
}

// SVG rank medals
const rankIcons = {
    1: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="#0a0a12" font-size="12" font-weight="bold" font-family="JetBrains Mono">1</text></svg>',
    2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#C0C0C0" stroke-width="1"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="#0a0a12" font-size="12" font-weight="bold" font-family="JetBrains Mono">2</text></svg>',
    3: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#CD7F32" stroke="#CD7F32" stroke-width="1"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="#0a0a12" font-size="12" font-weight="bold" font-family="JetBrains Mono">3</text></svg>'
};

function renderTable(leaderboard, type) {
    const tbody = document.getElementById('tableBody');
    
    if (!leaderboard || leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-3">No data yet. Be the first!</td></tr>';
        return;
    }

    tbody.innerHTML = leaderboard.map(entry => {
        const isMe = currentUser && entry.username === currentUser.username;
        const rankDisplay = rankIcons[entry.rank] || `<span style="font-weight:700;opacity:0.6;">#${entry.rank}</span>`;
        const nameClass = entry.nameStyle || '';
        const avatarUrl = entry.image || '/assets/images/default-avatar.png';

        // Avatar + username cell
        const userCell = `
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <img src="${avatarUrl}" alt="" style="width:28px;height:28px;border:1px solid var(--border);object-fit:cover;flex-shrink:0;" onerror="this.src='/assets/images/default-avatar.png'">
                    <span class="${nameClass}">${escapeHTML(entry.username)}</span>
                    ${entry.title && entry.title !== 'Newbie' ? `<span class="text-muted text-sm">${entry.title}</span>` : ''}
                </div>
            </td>`;

        let cols = '';
        switch (type) {
            case 'progression':
                cols = `${userCell}
                    <td class="text-accent font-bold">Q${entry.currentQuestion}</td>
                    <td>${entry.questionsCompleted}</td>
                    <td>${formatTime(entry.totalTime)}</td>`;
                break;
            case 'speed':
                cols = `${userCell}
                    <td class="text-accent font-bold">${entry.avgTime}s</td>
                    <td>${entry.completed}</td>`;
                break;
            case 'xp':
                cols = `${userCell}
                    <td class="text-accent font-bold">${formatNumber(entry.xp)}</td>
                    <td>Lv.${entry.level}</td>
                    <td>${entry.streak > 0 ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="2"><path d="M12 22c-4.97 0-9-2.69-9-6s2-6.5 4-9c0 3.5 2 5 4 6.5 2-1.5 4-3 4-6.5 2 2.5 4 5 4 9s-4.03 6-7 6z"/></svg> ' + entry.streak : '-'}</td>`;
                break;
            case 'zen':
                cols = `${userCell}
                    <td class="text-warning font-bold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3h-3m2-8v1m0 6v1"/></svg> ${formatNumber(entry.zen)}</td>
                    <td>${entry.items}</td>`;
                break;
        }

        return `<tr class="${isMe ? 'highlight' : ''}">
            <td style="font-size:1.2rem;">${rankDisplay}</td>
            ${cols}
        </tr>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);
