// ============================================
// ZenPy - Chat Server (Socket.io)
// Real-time global chat with styled names
// ============================================
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'zenpy_secret_key_change_in_production_2024';

// Simple profanity filter
const badWords = ['fuck', 'shit', 'ass', 'damn', 'bitch', 'dick', 'crap', 'hell'];

function filterProfanity(message) {
    let filtered = message;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
}

module.exports = function(io, readJSON, writeJSON) {
    // Track online users and rate limiting
    const onlineUsers = new Map(); // socketId -> { username, email }
    const messageTimestamps = new Map(); // email -> [timestamps]
    const chatReports = [];

    io.on('connection', (socket) => {
        let currentUser = null;

        // --- Authenticate on connect ---
        socket.on('authenticate', (token) => {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const users = readJSON('users.json');
                const user = users.find(u => u.email === decoded.email);

                if (user) {
                    currentUser = {
                        email: user.email,
                        username: user.username,
                        nameStyle: user.inventory?.equipped?.nameStyle || null,
                        frame: user.inventory?.equipped?.frame || null,
                        title: user.inventory?.equipped?.title || 'Newbie',
                        isVip: user.inventory?.owned?.includes('vip_border') || false
                    };
                    onlineUsers.set(socket.id, currentUser);

                    // Send chat history
                    const chatMessages = readJSON('chat_messages.json');
                    socket.emit('chat_history', chatMessages.slice(-50));
                    
                    // Broadcast online count
                    io.emit('online_count', onlineUsers.size);
                    
                    // System message for join
                    io.emit('system_message', {
                        type: 'join',
                        message: `${user.username} joined the chat!`,
                        timestamp: Date.now()
                    });

                    socket.emit('auth_success', { username: user.username });
                }
            } catch (e) {
                socket.emit('auth_error', 'Invalid token');
            }
        });

        // --- Send Message ---
        socket.on('send_message', (data) => {
            if (!currentUser) {
                socket.emit('error', 'Not authenticated');
                return;
            }

            // Rate limiting: 5 messages per 10 seconds
            const now = Date.now();
            const userTimestamps = messageTimestamps.get(currentUser.email) || [];
            const recentMessages = userTimestamps.filter(t => now - t < 10000);
            
            if (recentMessages.length >= 5) {
                socket.emit('error', 'Slow down! Rate limit: 5 messages per 10 seconds.');
                return;
            }

            recentMessages.push(now);
            messageTimestamps.set(currentUser.email, recentMessages);

            // Validate message
            let message = (data.message || '').trim();
            if (!message || message.length > 200) {
                socket.emit('error', 'Message must be 1-200 characters.');
                return;
            }

            // Filter profanity
            message = filterProfanity(message);

            // Check for links/images
            const urlRegex = /(https?:\/\/|www\.)/gi;
            if (urlRegex.test(message)) {
                socket.emit('error', 'Links are not allowed in chat.');
                return;
            }

            // Create message object
            const msg = {
                username: currentUser.username,
                message: message,
                timestamp: now,
                nameStyle: currentUser.nameStyle,
                frame: currentUser.frame,
                title: currentUser.title,
                isVip: currentUser.isVip
            };

            // Save to buffer
            const chatMessages = readJSON('chat_messages.json');
            chatMessages.push(msg);
            if (chatMessages.length > 100) chatMessages.shift();
            writeJSON('chat_messages.json', chatMessages);

            // Update user's chat message count
            const users = readJSON('users.json');
            const user = users.find(u => u.email === currentUser.email);
            if (user) {
                user.chatMessageCount = (user.chatMessageCount || 0) + 1;
                writeJSON('users.json', users);
            }

            // Broadcast
            io.emit('new_message', msg);
        });

        // --- Typing Indicator ---
        socket.on('typing', () => {
            if (currentUser) {
                socket.broadcast.emit('user_typing', {
                    username: currentUser.username,
                    timestamp: Date.now()
                });
            }
        });

        // --- Report Message ---
        socket.on('report_message', (data) => {
            if (!currentUser) return;

            const report = {
                reporter: currentUser.username,
                reportedUser: data.username,
                message: data.message,
                reason: data.reason || 'inappropriate',
                timestamp: Date.now()
            };

            chatReports.push(report);

            // Auto-mute after 3 reports
            const reportsForUser = chatReports.filter(r => r.reportedUser === data.username);
            if (reportsForUser.length >= 3) {
                io.emit('system_message', {
                    type: 'mute',
                    message: `${data.username} has been muted for 1 hour.`,
                    timestamp: Date.now()
                });
            }

            socket.emit('report_received', { message: 'Report submitted. Thank you!' });
        });

        // --- Disconnect ---
        socket.on('disconnect', () => {
            if (currentUser) {
                onlineUsers.delete(socket.id);
                io.emit('online_count', onlineUsers.size);
                io.emit('system_message', {
                    type: 'leave',
                    message: `${currentUser.username} left the chat.`,
                    timestamp: Date.now()
                });
            }
        });
    });
};
