// ============================================
// ZenPy - User Routes
// Profile, Progress, Activity, Shop, Ban
// ============================================
const authMiddleware = require('./middleware/auth');
const banCheck = require('./middleware/banCheck');

module.exports = function(app) {
    const { readJSON, writeJSON, getItemCssClass } = app.locals;
    const DEFAULT_AVATARS = new Set(['default-avatar.png', 'Popcat Cartoon.jpg', 'Popcat%20Cartoon.jpg']);

    function ensureInventoryShape(user) {
        if (!user.inventory || typeof user.inventory !== 'object') {
            user.inventory = {};
        }

        if (!Array.isArray(user.inventory.owned)) {
            user.inventory.owned = [];
        }

        if (!user.inventory.equipped || typeof user.inventory.equipped !== 'object') {
            user.inventory.equipped = {};
        }

        const equipped = user.inventory.equipped;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'nameStyle')) equipped.nameStyle = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'frame')) equipped.frame = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'title')) equipped.title = 'Newbie';
        if (!Object.prototype.hasOwnProperty.call(equipped, 'effect')) equipped.effect = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'chatExtra')) equipped.chatExtra = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'chatColor')) equipped.chatColor = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'chatBackground')) equipped.chatBackground = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'profile_card')) equipped.profile_card = null;
        if (!Object.prototype.hasOwnProperty.call(equipped, 'banner')) equipped.banner = null;
    }

    function ensureOnboardingShape(user) {
        if (!Object.prototype.hasOwnProperty.call(user, 'profileSetupCompleted')) {
            user.profileSetupCompleted = true;
        }
        if (!Object.prototype.hasOwnProperty.call(user, 'onboardingCompletedAt')) {
            user.onboardingCompletedAt = user.profileSetupCompleted ? (user.joined || new Date().toISOString()) : null;
        }
        if (!Object.prototype.hasOwnProperty.call(user, 'termsAccepted')) {
            user.termsAccepted = !!user.profileSetupCompleted;
        }
        if (!Object.prototype.hasOwnProperty.call(user, 'termsAcceptedAt')) {
            user.termsAcceptedAt = user.termsAccepted ? (user.joined || new Date().toISOString()) : null;
        }
    }

    function hasCustomAvatar(user) {
        return !!(user.image && !DEFAULT_AVATARS.has(user.image));
    }

    function buildNameStyleClass(equipped = {}) {
        return [
            getItemCssClass(equipped.nameStyle),
            getItemCssClass(equipped.effect)
        ].filter(Boolean).join(' ') || null;
    }

    function buildCssMap(user) {
        return {
            nameStyle: buildNameStyleClass(user.inventory?.equipped || {}),
            frame: getItemCssClass(user.inventory?.equipped?.frame) || null,
            profileCard: getItemCssClass(user.inventory?.equipped?.profile_card) || null,
            chatStyle: getItemCssClass(user.inventory?.equipped?.chatExtra) || null,
            chatColor: getItemCssClass(user.inventory?.equipped?.chatColor) || null,
            chatBackground: getItemCssClass(user.inventory?.equipped?.chatBackground) || null,
            banner: getItemCssClass(user.inventory?.equipped?.banner) || null
        };
    }

    // ---- GET USER DATA ----
    app.get('/api/user/:email', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');
        const user = users.find(u => u.email === req.params.email);
        const userProgress = progress.find(p => p.email === req.params.email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        
        // Enrich user with mapped CSS classes so frontend can just apply them
        const enrichedUser = { ...user };
        ensureInventoryShape(enrichedUser);
        ensureOnboardingShape(enrichedUser);
        if (enrichedUser.inventory && enrichedUser.inventory.equipped) {
            enrichedUser.cssMap = buildCssMap(enrichedUser);
        }

        res.json({ success: true, user: enrichedUser, progress: userProgress });
    });

    // ---- GET CURRENT USER (from token) ----
    app.get('/api/user', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');
        const user = users.find(u => u.email === req.user.email);
        const userProgress = progress.find(p => p.email === req.user.email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Enrich user with mapped CSS classes
        const enrichedUser = { ...user };
        ensureInventoryShape(enrichedUser);
        ensureOnboardingShape(enrichedUser);
        if (enrichedUser.inventory && enrichedUser.inventory.equipped) {
            enrichedUser.cssMap = buildCssMap(enrichedUser);
        }

        res.json({ success: true, user: enrichedUser, progress: userProgress });
    });

    // ---- DAILY QUIZ ----
    const dailyQuestions = [
        { q: "What is the output of print(2 ** 3)?", options: ["6", "8", "9"], answer: 1 },
        { q: "Which of the following is immutable in Python?", options: ["List", "Dictionary", "Tuple"], answer: 2 },
        { q: "How do you insert an element at a specific index in a list?", options: ["append()", "add()", "insert()"], answer: 2 },
        { q: "What gets printed? print(type([]))", options: ["<class 'list'>", "<class 'array'>", "<type 'list'>"], answer: 0 },
        { q: "Which keyword is used for defining a function?", options: ["func", "def", "lambda"], answer: 1 },
        { q: "How to get the length of a list 'lst'?", options: ["lst.length()", "length(lst)", "len(lst)"], answer: 2 },
        { q: "Which operator is used for floor division?", options: ["//", "/", "%"], answer: 0 }
    ];

    function getDailyQuizIndex() {
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istTime = Date.now() + istOffsetMs;
        return Math.floor(istTime / 86400000) % dailyQuestions.length;
    }

    app.get('/api/daily-quiz', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const quizIndex = getDailyQuizIndex();
        const quiz = dailyQuestions[quizIndex];
        
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istTime = Date.now() + istOffsetMs;
        const todayStr = new Date(istTime).toISOString().split('T')[0];

        res.json({
            success: true,
            question: quiz.q,
            options: quiz.options,
            answeredToday: user.lastQuizDate === todayStr
        });
    });

    app.post('/api/daily-quiz', authMiddleware, (req, res) => {
        const { answerIndex } = req.body;
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istTime = Date.now() + istOffsetMs;
        const todayStr = new Date(istTime).toISOString().split('T')[0];

        if (user.lastQuizDate === todayStr) {
            return res.status(400).json({ success: false, message: 'Already answered today!' });
        }

        const quizIndex = getDailyQuizIndex();
        const quiz = dailyQuestions[quizIndex];
        
        user.lastQuizDate = todayStr;

        let isCorrect = false;
        if (Number(answerIndex) === Number(quiz.answer)) {
            user.zen = (user.zen || 0) + 100;
            isCorrect = true;
        }
        
        writeJSON('users.json', users);

        res.json({
            success: true,
            isCorrect,
            correctIndex: quiz.answer,
            message: isCorrect ? 'Correct! +100 Zen Coins' : 'Better Knowledge Next time!',
            zen: user.zen
        });
    });

    // ---- UPDATE PROFILE ----
    app.put('/api/user/profile', authMiddleware, (req, res) => {
        const { username, bio, github, linkedin } = req.body;
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check username uniqueness if changed
        if (username && username !== user.username) {
            if (users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.email !== req.user.email)) {
                return res.status(400).json({ success: false, message: 'Username already taken.' });
            }
            user.username = username;
        }

        if (bio !== undefined) user.bio = bio;
        if (github !== undefined) user.github = github;
        if (linkedin !== undefined) user.linkedin = linkedin;

        writeJSON('users.json', users);
        res.json({ success: true, message: 'Profile updated.', user });
    });

    // ---- GET PROGRESS ----
    app.get('/api/user/progress/:email', authMiddleware, (req, res) => {
        const progress = readJSON('progress.json');
        const userProgress = progress.find(p => p.email === req.params.email);

        if (!userProgress) {
            return res.status(404).json({ success: false, message: 'Progress not found.' });
        }

        res.json({ success: true, progress: userProgress });
    });

    // ---- ACTIVITY TRACKING ----
    app.post('/api/activity', authMiddleware, (req, res) => {
        const { activeMinutes } = req.body;
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.totalActiveMinutes = (user.totalActiveMinutes || 0) + (activeMinutes || 1);
        user.lastActive = new Date().toISOString();
        writeJSON('users.json', users);

        // Log activity
        const activityLog = readJSON('activity_log.json');
        activityLog.push({
            email: req.user.email,
            activeMinutes: activeMinutes || 1,
            timestamp: Date.now()
        });
        // Keep last 1000 entries
        if (activityLog.length > 1000) activityLog.splice(0, activityLog.length - 1000);
        writeJSON('activity_log.json', activityLog);

        res.json({ success: true });
    });

    // ---- ADD ZEN COINS ----
    app.post('/api/user/add-zen', authMiddleware, (req, res) => {
        const { amount, reason } = req.body;
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount.' });

        user.zen = (user.zen || 0) + amount;
        writeJSON('users.json', users);

        // Check achievements
        checkAchievements(user, users);

        res.json({ success: true, zen: user.zen });
    });

    // ---- SHOP: BUY ITEM ----
    app.post('/api/shop/buy', authMiddleware, (req, res) => {
        const { itemId } = req.body;
        const shopItems = readJSON('shop_items.json');
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');
        
        const user = users.find(u => u.email === req.user.email);
        const item = shopItems.find(i => i.id === itemId);
        const userProgress = progress.find(p => p.email === req.user.email);

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

        ensureInventoryShape(user);

        // Check if already owned
        if (user.inventory.owned.includes(itemId)) {
            return res.status(400).json({ success: false, message: 'You already own this item.' });
        }

        // Check requirement
        if (item.requirement) {
            if (item.requirement.type === 'questions' && userProgress) {
                if (userProgress.currentQuestion < item.requirement.value) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `You need to reach question ${item.requirement.value} first.` 
                    });
                }
            }
            if (item.requirement.type === 'xp' && user.xp < item.requirement.value) {
                return res.status(400).json({ 
                    success: false, 
                    message: `You need ${item.requirement.value} XP first.` 
                });
            }
            if (item.requirement.type === 'streak' && user.streak < item.requirement.value) {
                return res.status(400).json({ 
                    success: false, 
                    message: `You need a ${item.requirement.value}-day streak first.` 
                });
            }
        }

        // Check zen balance
        if (user.zen < item.price) {
            return res.status(400).json({ 
                success: false, 
                message: `Not enough Zen coins. You need ${item.price - user.zen} more.` 
            });
        }

        // Purchase
        user.zen -= item.price;
        user.inventory.owned.push(itemId);
        writeJSON('users.json', users);

        res.json({
            success: true,
            message: `Purchased ${item.name}!`,
            zenRemaining: user.zen,
            inventory: user.inventory
        });
    });

    // ---- SHOP: EQUIP ITEM ----
    app.post('/api/shop/equip', authMiddleware, (req, res) => {
        const { itemId, slot } = req.body;
        const users = readJSON('users.json');
        const shopItems = readJSON('shop_items.json');
        const user = users.find(u => u.email === req.user.email);

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        ensureInventoryShape(user);

        // Check if owned (allow null to unequip)
        if (itemId && !user.inventory.owned.includes(itemId)) {
            return res.status(400).json({ success: false, message: 'You don\'t own this item.' });
        }

        // Valid slots: nameStyle, frame, title, effect, chatExtra, chatColor, chatBackground, profile_card, banner
        const validSlots = ['nameStyle', 'frame', 'title', 'effect', 'chatExtra', 'chatColor', 'chatBackground', 'profile_card', 'banner'];
        if (!validSlots.includes(slot)) {
            return res.status(400).json({ success: false, message: 'Invalid slot.' });
        }

        const expectedCategoryBySlot = {
            nameStyle: 'name_style',
            frame: 'avatar_frame',
            effect: 'effect',
            title: 'name_accessory',
            chatExtra: 'chat_extra',
            chatColor: 'chat_color',
            chatBackground: 'chat_background',
            profile_card: 'profile_card',
            banner: 'profile_banner'
        };

        if (itemId) {
            const item = shopItems.find(i => i.id === itemId);
            if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

            if (item.category !== expectedCategoryBySlot[slot]) {
                return res.status(400).json({ success: false, message: 'Item does not match slot type.' });
            }

            if (slot === 'title') {
                user.inventory.equipped[slot] = item.name;
            } else {
                user.inventory.equipped[slot] = itemId;
            }
        } else {
            user.inventory.equipped[slot] = slot === 'title' ? 'Newbie' : null;
        }
        writeJSON('users.json', users);

        res.json({ success: true, equipped: user.inventory.equipped });
    });

    // ---- UPDATE PROFILE (PUT /api/user) ----
    app.put('/api/user', authMiddleware, (req, res) => {
        const { username, bio, github, instagram, twitter } = req.body;
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (username && username !== user.username) {
            if (users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.email !== req.user.email)) {
                return res.status(400).json({ success: false, message: 'Username already taken.' });
            }
            user.username = username;
        }

        if (bio !== undefined) user.bio = bio;
        if (github !== undefined) user.github = github;
        if (instagram !== undefined) user.instagram = instagram;
        if (twitter !== undefined) user.twitter = twitter;

        writeJSON('users.json', users);
        res.json({ success: true, message: 'Profile updated.', user });
    });

    // ---- COMPLETE FIRST-LOGIN ONBOARDING ----
    app.post('/api/user/complete-onboarding', authMiddleware, (req, res) => {
        const { username, github, instagram, twitter, termsAccepted } = req.body;
        const users = readJSON('users.json');
        const user = users.find(u => u.email === req.user.email);

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        ensureOnboardingShape(user);

        const cleanUsername = String(username || '').trim();
        if (cleanUsername.length < 3 || cleanUsername.length > 24) {
            return res.status(400).json({ success: false, message: 'Username must be 3-24 characters.' });
        }

        if (users.some(u => u.email !== user.email && (u.username || '').toLowerCase() === cleanUsername.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Username already taken.' });
        }

        if (!termsAccepted) {
            return res.status(400).json({ success: false, message: 'You must accept Terms & Conditions.' });
        }

        if (!hasCustomAvatar(user)) {
            return res.status(400).json({ success: false, message: 'Please upload an avatar before continuing.' });
        }

        user.username = cleanUsername;
        if (github !== undefined) user.github = String(github || '').trim();
        if (instagram !== undefined) user.instagram = String(instagram || '').trim();
        if (twitter !== undefined) user.twitter = String(twitter || '').trim();

        const nowIso = new Date().toISOString();
        user.profileSetupCompleted = true;
        user.onboardingCompletedAt = nowIso;
        user.termsAccepted = true;
        user.termsAcceptedAt = nowIso;

        writeJSON('users.json', users);
        res.json({ success: true, message: 'Profile setup completed.', user });
    });

    // ---- SHOP: GET ITEMS ----
    app.get('/api/shop/items', authMiddleware, (req, res) => {
        const shopItems = readJSON('shop_items.json');
        res.json({ success: true, items: shopItems });
    });

    // ---- BAN USER ----
    app.post('/api/ban', authMiddleware, (req, res) => {
        const { email, reason, type } = req.body;
        const banned = readJSON('banned.json');

        // Get client IP
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const banData = {
            email: email || req.user.email,
            ip: ip,
            reason: reason || 'copy_paste_attempts',
            bannedAt: new Date().toISOString(),
            expires: type === 'temporary' ? new Date(Date.now() + 86400000).toISOString() : null
        };

        banned.push(banData);
        writeJSON('banned.json', banned);

        res.json({ success: true, message: 'User banned.' });
    });

    // ---- CHECK BAN ----
    app.get('/api/check-ban', (req, res) => {
        const banned = readJSON('banned.json');
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        const ban = banned.find(b => b.ip === ip);
        if (ban && (!ban.expires || new Date(ban.expires) > new Date())) {
            return res.json({ banned: true, reason: ban.reason, expires: ban.expires });
        }
        res.json({ banned: false });
    });

    // ---- GET ALL USERS (for admin/leaderboard) ----
    app.get('/api/users', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        // Return without sensitive data
        const safeUsers = users.map(u => ({
            email: u.email,
            username: u.username,
            image: u.image,
            xp: u.xp,
            level: u.level,
            zen: u.zen,
            streak: u.streak,
            joined: u.joined,
            inventory: u.inventory,
            achievements: u.achievements
        }));
        res.json({ success: true, users: safeUsers });
    });

    // ---- ADMIN: GET ALL DATA ----
    app.get('/api/admin/stats', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');
        const banned = readJSON('banned.json');
        const chatMessagesRaw = readJSON('global_chat_messages.json');
        const chatMessages = Array.isArray(chatMessagesRaw) ? chatMessagesRaw : [];

        res.json({
            success: true,
            stats: {
                totalUsers: users.length,
                bannedUsers: banned.length,
                totalMessages: chatMessages.length,
                averageXP: users.reduce((s, u) => s + u.xp, 0) / (users.length || 1),
                averageProgress: progress.reduce((s, p) => s + p.currentQuestion, 0) / (progress.length || 1)
            },
            users,
            banned
        });
    });

    // ---- ADMIN: UNBAN USER ----
    app.post('/api/admin/unban', authMiddleware, (req, res) => {
        const { email } = req.body;
        let banned = readJSON('banned.json');
        banned = banned.filter(b => b.email !== email);
        writeJSON('banned.json', banned);
        res.json({ success: true, message: 'User unbanned.' });
    });

    // Helper: Check achievements
    function checkAchievements(user, users) {
        const newAchievements = [];

        if (user.zen >= 5000 && !user.achievements.includes('rich_kid')) {
            user.achievements.push('rich_kid');
            user.xp += 1000;
            newAchievements.push('rich_kid');
        }

        if (user.chatMessageCount >= 100 && !user.achievements.includes('social_butterfly')) {
            user.achievements.push('social_butterfly');
            user.xp += 300;
            user.zen += 150;
            newAchievements.push('social_butterfly');
        }

        if (newAchievements.length > 0) {
            user.level = Math.floor(user.xp / 250) + 1;
            writeJSON('users.json', users);
        }
        return newAchievements;
    }
};
