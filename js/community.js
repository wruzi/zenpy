// ============================================
// ZenPy - Community JS
// User discovery, follow/unfollow, DM, profiles
// ============================================

if (!requireAuth()) { /* redirected */ }

let allUsers = [];
let currentDMPartner = null;
let dmPollInterval = null;
let myEmail = null;

async function loadCommunity() {
    const data = await setupSidebar();
    if (!data) return;
    myEmail = data.user.email;

    fetchUsers();
    fetchUnread();

    // Search filter
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        renderUsers(allUsers.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.bio || '').toLowerCase().includes(q)
        ));
    });

    // DM enter key
    document.getElementById('dmInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendDM();
    });
}

async function fetchUsers() {
    const data = await apiCall('/api/community/users');
    if (data?.success) {
        allUsers = data.users;
        renderUsers(allUsers);
    }
}

async function fetchUnread() {
    const data = await apiCall('/api/dm/unread');
    if (data?.success && data.unread > 0) {
        const badge = document.getElementById('unreadBadge');
        badge.textContent = data.unread;
        badge.style.display = 'inline';
    }
}

function getAvatarUrl(user) {
    if (!user.image || user.image === 'default-avatar.png') return '/assets/images/default-avatar.png';
    return `/assets/avatars/${user.image}`;
}

function renderUsers(users) {
    const grid = document.getElementById('communityGrid');

    if (users.length === 0) {
        grid.innerHTML = '<p class="text-muted text-sm">No users found.</p>';
        return;
    }

    grid.innerHTML = users.map(u => {
        const avatarUrl = getAvatarUrl(u);
        const socialLinks = [];
        if (u.github) socialLinks.push(`<a href="${escapeHTML(u.github)}" target="_blank" title="GitHub"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg></a>`);
        if (u.instagram) socialLinks.push(`<a href="${escapeHTML(u.instagram)}" target="_blank" title="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>`);
        if (u.twitter) socialLinks.push(`<a href="${escapeHTML(u.twitter)}" target="_blank" title="X / Twitter"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.73 16H20L8.27 4H4z"/><path d="M4 20l6.77-8.5"/><path d="M20 4l-6.77 8.5"/></svg></a>`);

        return `
            <div class="user-card">
                <div class="user-card-header">
                    <div class="user-card-avatar"><img src="${avatarUrl}" alt="" onerror="this.src='/assets/images/default-avatar.png'"></div>
                    <div>
                        <div class="user-card-name" style="cursor:pointer;" onclick="viewProfile('${u.email}')">${escapeHTML(u.username)}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted);">Lv.${u.level} — Q${u.currentQuestion}</div>
                    </div>
                </div>
                <div class="user-card-bio">${u.bio ? escapeHTML(u.bio) : '<span style="opacity:0.3">No bio yet</span>'}</div>
                <div class="user-card-stats">
                    <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${formatNumber(u.xp)} XP</span>
                    <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2"><path d="M12 22c-4.97 0-9-2.69-9-6s2-6.5 4-9c0 3.5 2 5 4 6.5 2-1.5 4-3 4-6.5 2 2.5 4 5 4 9s-4.03 6-7 6z"/></svg> ${u.streak}d</span>
                    <span class="follow-stats">${u.followers} followers</span>
                </div>
                ${socialLinks.length > 0 ? `<div class="user-card-links">${socialLinks.join('')}</div>` : ''}
                <div class="user-card-actions">
                    ${u.isMe ? '<span class="badge" style="font-size:0.7rem;">You</span>' : `
                        <button class="btn ${u.isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleFollow('${u.email}', this)">
                            ${u.isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="openDM('${u.email}', '${escapeHTML(u.username)}', '${avatarUrl}')">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                            DM
                        </button>
                    `}
                </div>
            </div>`;
    }).join('');
}

async function toggleFollow(email, btn) {
    const user = allUsers.find(u => u.email === email);
    if (!user) return;

    const endpoint = user.isFollowing ? '/api/unfollow' : '/api/follow';
    const data = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email })
    });

    if (data?.success) {
        user.isFollowing = !user.isFollowing;
        user.followers += user.isFollowing ? 1 : -1;
        showToast(data.message, 'success');
        renderUsers(allUsers);
    } else {
        showToast(data?.message || 'Error', 'error');
    }
}

// --- DM Functions ---
function openDM(email, username, avatarUrl) {
    currentDMPartner = email;
    document.getElementById('dmUsername').textContent = username;
    document.getElementById('dmAvatar').querySelector('img').src = avatarUrl;
    document.getElementById('dmOverlay').classList.add('active');
    document.getElementById('dmInput').value = '';
    loadMessages(email);

    // Poll every 3 seconds
    if (dmPollInterval) clearInterval(dmPollInterval);
    dmPollInterval = setInterval(() => loadMessages(email, true), 3000);
}

function closeDM() {
    document.getElementById('dmOverlay').classList.remove('active');
    currentDMPartner = null;
    if (dmPollInterval) clearInterval(dmPollInterval);
}

function showDMList() {
    // Open DM with conversation list
    openConversationList();
}

async function openConversationList() {
    const data = await apiCall('/api/dm/conversations');
    if (!data?.success) return;

    if (data.conversations.length === 0) {
        showToast('No conversations yet. Click DM on a user to start!', 'info');
        return;
    }

    // Show first conversation
    const first = data.conversations[0];
    const avatarUrl = getAvatarUrl(first);
    openDM(first.email, first.username, avatarUrl);
}

async function loadMessages(email, silent = false) {
    const data = await apiCall(`/api/dm/${email}`);
    if (!data?.success) return;

    const container = document.getElementById('dmMessages');
    if (data.messages.length === 0) {
        container.innerHTML = '<p class="text-muted text-sm" style="text-align:center;margin:auto;">Start a conversation</p>';
        return;
    }

    container.innerHTML = data.messages.map(m => {
        const isSent = m.from === myEmail;
        const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="dm-msg ${isSent ? 'sent' : 'received'}">
                ${escapeHTML(m.message)}
                <div class="dm-msg-time">${time}</div>
            </div>`;
    }).join('');

    if (!silent) container.scrollTop = container.scrollHeight;
}

async function sendDM() {
    const input = document.getElementById('dmInput');
    const message = input.value.trim();
    if (!message || !currentDMPartner) return;

    input.value = '';

    const data = await apiCall('/api/dm/send', {
        method: 'POST',
        body: JSON.stringify({ to: currentDMPartner, message })
    });

    if (data?.success) {
        loadMessages(currentDMPartner);
    } else {
        showToast(data?.message || 'Failed to send', 'error');
    }
}

// --- Profile Modal ---
async function viewProfile(email) {
    const data = await apiCall(`/api/community/user/${email}`);
    if (!data?.success) return;

    const u = data.user;
    const avatarUrl = getAvatarUrl(u);
    const modal = document.getElementById('profileModal');

    const socialLinks = [];
    if (u.github) socialLinks.push(`<a href="${escapeHTML(u.github)}" target="_blank" style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg> GitHub</a>`);
    if (u.instagram) socialLinks.push(`<a href="${escapeHTML(u.instagram)}" target="_blank" style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg> Instagram</a>`);
    if (u.twitter) socialLinks.push(`<a href="${escapeHTML(u.twitter)}" target="_blank" style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.73 16H20L8.27 4H4z"/><path d="M4 20l6.77-8.5"/><path d="M20 4l-6.77 8.5"/></svg> X</a>`);

    modal.innerHTML = `
        <div style="text-align:center;">
            <div class="profile-modal-avatar"><img src="${avatarUrl}" alt="" onerror="this.src='/assets/images/default-avatar.png'"></div>
            <h3 style="font-size:1.1rem;margin-bottom:2px;">${escapeHTML(u.username)}</h3>
            <p class="text-muted text-sm">${u.inventory?.equipped?.title || 'Newbie'}</p>
            ${u.bio ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin:8px 0;">${escapeHTML(u.bio)}</p>` : ''}
        </div>
        <hr style="margin:12px 0;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;gap:8px;margin-bottom:12px;">
            <div><strong style="font-size:1rem;">${formatNumber(u.xp)}</strong><br><span class="text-muted text-sm">XP</span></div>
            <div><strong style="font-size:1rem;">Q${u.currentQuestion}</strong><br><span class="text-muted text-sm">Progress</span></div>
            <div><strong style="font-size:1rem;">${u.streak}</strong><br><span class="text-muted text-sm">Streak</span></div>
        </div>
        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:12px;">
            <span class="text-muted text-sm">${u.followers} followers</span>
            <span class="text-muted text-sm">${u.following} following</span>
        </div>
        ${socialLinks.length > 0 ? `<div style="display:flex;justify-content:center;gap:12px;margin-bottom:12px;">${socialLinks.join('')}</div>` : ''}
        <div style="display:flex;gap:8px;justify-content:center;">
            ${u.isMe ? '' : `
                <button class="btn ${u.isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleFollow('${u.email}', this);closeProfile();">
                    ${u.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button class="btn btn-ghost btn-sm" onclick="closeProfile();openDM('${u.email}','${escapeHTML(u.username)}','${avatarUrl}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> DM
                </button>
            `}
            <button class="btn btn-ghost btn-sm" onclick="closeProfile()">Close</button>
        </div>
    `;

    document.getElementById('profileOverlay').classList.add('active');
}

function closeProfile() {
    document.getElementById('profileOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', loadCommunity);
