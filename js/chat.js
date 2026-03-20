// ============================================
// ZenPy - Chat JS (Socket.io Client)
// Real-time global chat
// ============================================

if (!requireAuth()) { /* redirected */ }

const socket = io();
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
let chatUserName = '';
let typingTimeout = null;

// Initialize
async function initChat() {
    const data = await setupSidebar();
    if (data) chatUserName = data.user.username;
    
    // Authenticate with socket
    const token = getToken();
    socket.emit('authenticate', token);
}

// --- Socket Events ---
socket.on('auth_success', (data) => {
    chatUserName = data.username;
});

socket.on('auth_error', (msg) => {
    showToast('Chat authentication failed: ' + msg, 'error');
});

socket.on('chat_history', (messages) => {
    chatMessages.innerHTML = '';
    messages.forEach(msg => renderMessage(msg));
    scrollToBottom();
});

socket.on('new_message', (msg) => {
    renderMessage(msg);
    scrollToBottom();
});

socket.on('system_message', (data) => {
    addSystemMessage(data.message);
});

socket.on('online_count', (count) => {
    document.getElementById('onlineCount').textContent = count + ' online';
});

socket.on('user_typing', (data) => {
    const indicator = document.getElementById('typingIndicator');
    indicator.innerHTML = `<span class="typing-indicator">${escapeHTML(data.username)} is typing<span>.</span><span>.</span><span>.</span></span>`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => { indicator.innerHTML = ''; }, 3000);
});

socket.on('error', (msg) => {
    showToast(msg, 'warning');
});

socket.on('report_received', (data) => {
    showToast(data.message, 'success');
});

// --- Render Message ---
function renderMessage(msg) {
    const div = document.createElement('div');
    const isSelf = msg.username === chatUserName;
    div.className = `chat-msg ${msg.isVip ? 'vip-border' : ''} ${isSelf ? 'me' : 'other'}`;
    const bubbleClass = [msg.chatBackground, msg.chatColor].filter(Boolean).join(' ');

    // Parse mentions
    let messageText = escapeHTML(msg.message);
    messageText = messageText.replace(/@(\w+)/g, '<span class="mention">@$1</span>');

    // Handle avatar
    let avatarUrl = msg.image || '/assets/avatars/Popcat%20Cartoon.jpg';
    if (avatarUrl === 'default-avatar.png' || avatarUrl === '/assets/images/default-avatar.png') {
        avatarUrl = '/assets/avatars/Popcat%20Cartoon.jpg';
    } else if (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
        avatarUrl = `/assets/avatars/${avatarUrl}`;
    }

    div.innerHTML = `
        <div class="msg-avatar ${msg.frame || ''}">
            <img src="${avatarUrl}" alt="" onerror="this.src='/assets/avatars/Popcat%20Cartoon.jpg'">
        </div>
        <div class="msg-content ${msg.chatStyle || ''}">
            <div class="msg-header">
                <div class="msg-meta">
                    <span class="msg-username mention-target ${msg.nameStyle || ''}" data-username="${encodeURIComponent(msg.username)}">${escapeHTML(msg.username)}</span>
                    ${msg.title ? `<span class="msg-title">${escapeHTML(msg.title)}</span>` : ''}
                    <span class="msg-time">${formatTimestamp(msg.timestamp)}</span>
                </div>
                <button class="msg-copy-btn" type="button" title="Copy message">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
            </div>
            <div class="msg-text ${bubbleClass}">${messageText}</div>
        </div>
    `;
    chatMessages.appendChild(div);
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

chatMessages.addEventListener('click', async (event) => {
    const mentionTarget = event.target.closest('.mention-target');
    if (mentionTarget) {
        const username = decodeURIComponent(mentionTarget.dataset.username || '');
        if (username) {
            const prefix = chatInput.value && !chatInput.value.endsWith(' ') ? ' ' : '';
            chatInput.value = `${chatInput.value}${prefix}@${username} `;
            chatInput.focus();
        }
        return;
    }

    const copyButton = event.target.closest('.msg-copy-btn');
    if (!copyButton) return;

    const msgText = copyButton.closest('.msg-content')?.querySelector('.msg-text')?.textContent?.trim();
    if (!msgText) return;

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(msgText);
        } else {
            fallbackCopy(msgText);
        }
        showToast('Message copied', 'success');
    } catch (error) {
        fallbackCopy(msgText);
        showToast('Message copied', 'success');
    }
});

function addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg system-msg';
    div.innerHTML = `<div class="msg-text">⚡ ${text}</div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
}

// --- Send Message ---
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    socket.emit('send_message', { message });
    chatInput.value = '';
    chatInput.focus();
}

// Enter key to send
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        socket.emit('typing');
    }
});

// --- Emoji Picker ---
function toggleEmojis() {
    document.getElementById('emojiDropdown').classList.toggle('show');
}

function addEmoji(emoji) {
    chatInput.value += emoji;
    chatInput.focus();
    document.getElementById('emojiDropdown').classList.remove('show');
}

// Close emoji picker on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.emoji-picker')) {
        document.getElementById('emojiDropdown').classList.remove('show');
    }
});

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', initChat);
