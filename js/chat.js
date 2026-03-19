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
    addSystemMessage(`Welcome to the chat, ${data.username}! 🎉`);
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
    div.className = `chat-msg ${msg.isVip ? 'vip-border' : ''}`;
    
    // Parse mentions
    let messageText = escapeHTML(msg.message);
    messageText = messageText.replace(/@(\w+)/g, '<span class="mention">@$1</span>');

    div.innerHTML = `
        <div class="msg-avatar ${msg.frame || ''}">
            <img src="/assets/images/default-avatar.png" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22 fill=%22%23FF1493%22>🧑‍💻</text></svg>'">
        </div>
        <div class="msg-content">
            <div class="msg-header">
                <span class="msg-username ${msg.nameStyle || ''}">${escapeHTML(msg.username)}</span>
                ${msg.title ? `<span class="msg-title">${escapeHTML(msg.title)}</span>` : ''}
                <span class="msg-time">${formatTimestamp(msg.timestamp)}</span>
            </div>
            <div class="msg-text">${messageText}</div>
        </div>
    `;
    chatMessages.appendChild(div);
}

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
