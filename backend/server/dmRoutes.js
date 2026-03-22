// ============================================
// ZenPy - DM Routes
// Private messaging between users
// ============================================
const authMiddleware = require('./middleware/auth');

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    // ---- GET CONVERSATIONS LIST ----
    app.get('/api/dm/conversations', authMiddleware, (req, res) => {
        const messages = readJSON('direct_messages.json');
        const users = readJSON('users.json');
        const myEmail = req.user.email;

        // Get unique conversation partners
        const partners = new Set();
        messages.forEach(m => {
            if (m.from === myEmail) partners.add(m.to);
            if (m.to === myEmail) partners.add(m.from);
        });

        const conversations = Array.from(partners).map(partnerEmail => {
            const u = users.find(usr => usr.email === partnerEmail);
            if (!u) return null;

            // Get last message
            const convoMessages = messages.filter(m =>
                (m.from === myEmail && m.to === partnerEmail) ||
                (m.from === partnerEmail && m.to === myEmail)
            );
            const lastMsg = convoMessages[convoMessages.length - 1];
            const unread = convoMessages.filter(m => m.to === myEmail && !m.read).length;

            return {
                email: partnerEmail,
                username: u.username,
                image: u.image,
                lastMessage: lastMsg ? lastMsg.message : '',
                lastTimestamp: lastMsg ? lastMsg.timestamp : 0,
                unread
            };
        }).filter(Boolean).sort((a, b) => b.lastTimestamp - a.lastTimestamp);

        res.json({ success: true, conversations });
    });

    // ---- GET MESSAGES WITH A USER ----
    app.get('/api/dm/:email', authMiddleware, (req, res) => {
        const messages = readJSON('direct_messages.json');
        const myEmail = req.user.email;
        const partnerEmail = req.params.email;

        const convo = messages.filter(m =>
            (m.from === myEmail && m.to === partnerEmail) ||
            (m.from === partnerEmail && m.to === myEmail)
        );

        // Mark incoming as read
        let changed = false;
        messages.forEach(m => {
            if (m.from === partnerEmail && m.to === myEmail && !m.read) {
                m.read = true;
                changed = true;
            }
        });
        if (changed) writeJSON('direct_messages.json', messages);

        res.json({ success: true, messages: convo });
    });

    // ---- SEND MESSAGE ----
    app.post('/api/dm/send', authMiddleware, (req, res) => {
        const { to, message } = req.body;

        if (!to || !message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message and recipient required.' });
        }

        if (to === req.user.email) {
            return res.status(400).json({ success: false, message: "Can't message yourself." });
        }

        // Check recipient exists
        const users = readJSON('users.json');
        if (!users.find(u => u.email === to)) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const messages = readJSON('direct_messages.json');
        const newMsg = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            from: req.user.email,
            to,
            message: message.trim().substring(0, 500), // Max 500 chars
            timestamp: Date.now(),
            read: false
        };

        messages.push(newMsg);

        // Keep last 10000 messages total
        if (messages.length > 10000) messages.splice(0, messages.length - 10000);
        writeJSON('direct_messages.json', messages);

        res.json({ success: true, message: newMsg });
    });

    // ---- GET UNREAD COUNT ----
    app.get('/api/dm/unread', authMiddleware, (req, res) => {
        const messages = readJSON('direct_messages.json');
        const unread = messages.filter(m => m.to === req.user.email && !m.read).length;
        res.json({ success: true, unread });
    });
};
