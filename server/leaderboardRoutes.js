// ============================================
// ZenPy - Leaderboard Routes
// 4 Leaderboards: Progression, Speed, XP, Zen
// Now includes user avatar image
// ============================================
const authMiddleware = require('./middleware/auth');

module.exports = function(app) {
    const { readJSON, getItemCssClass } = app.locals;

    function getNameStyleClass(user) {
        return [
            getItemCssClass(user.inventory?.equipped?.nameStyle),
            getItemCssClass(user.inventory?.equipped?.effect)
        ].filter(Boolean).join(' ') || null;
    }

    function getAvatarPath(user) {
        if (!user.image || user.image === 'default-avatar.png' || user.image === 'Popcat Cartoon.jpg' || user.image === 'Popcat%20Cartoon.jpg') return '/assets/avatars/Popcat%20Cartoon.jpg';
        if (user.image.startsWith('http')) return user.image;
        return `/assets/avatars/${user.image}`;
    }

    // ---- PROGRESSION LEADERBOARD ----
    app.get('/api/leaderboard/progression', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');

        const leaderboard = progress.map(p => {
            const user = users.find(u => u.email === p.email);
            if (!user) return null;
            return {
                username: user.username,
                image: getAvatarPath(user),
                nameStyle: getNameStyleClass(user),
                frame: getItemCssClass(user.inventory?.equipped?.frame) || null,
                banner: getItemCssClass(user.inventory?.equipped?.banner) || null,
                title: user.inventory?.equipped?.title || 'Newbie',
                currentQuestion: p.currentQuestion,
                totalTime: p.totalTime,
                questionsCompleted: p.questionTimes.length
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            if (b.currentQuestion !== a.currentQuestion) return b.currentQuestion - a.currentQuestion;
            return a.totalTime - b.totalTime;
        })
        .slice(0, 50)
        .map((entry, i) => ({ rank: i + 1, ...entry }));

        res.json({ success: true, leaderboard });
    });

    // ---- SPEED LEADERBOARD ----
    app.get('/api/leaderboard/speed', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');

        const leaderboard = progress
            .filter(p => p.questionTimes.length >= 5) // Lowered to 5 for testing
            .map(p => {
                const user = users.find(u => u.email === p.email);
                if (!user) return null;
                const avgTime = p.questionTimes.reduce((s, qt) => s + qt.time, 0) / p.questionTimes.length;
                return {
                    username: user.username,
                    image: getAvatarPath(user),
                    nameStyle: getNameStyleClass(user),
                    frame: getItemCssClass(user.inventory?.equipped?.frame) || null,
                    banner: getItemCssClass(user.inventory?.equipped?.banner) || null,
                    avgTime: Math.round(avgTime * 10) / 10,
                    completed: p.questionTimes.length
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.avgTime - b.avgTime)
            .slice(0, 50)
            .map((entry, i) => ({ rank: i + 1, ...entry }));

        res.json({ success: true, leaderboard });
    });

    // ---- XP LEADERBOARD ----
    app.get('/api/leaderboard/xp', authMiddleware, (req, res) => {
        const users = readJSON('users.json');

        const leaderboard = users
            .map(u => ({
                username: u.username,
                image: getAvatarPath(u),
                nameStyle: getNameStyleClass(u),
                frame: getItemCssClass(u.inventory?.equipped?.frame) || null,
                banner: getItemCssClass(u.inventory?.equipped?.banner) || null,
                xp: u.xp,
                level: u.level,
                streak: u.streak
            }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 50)
            .map((entry, i) => ({ rank: i + 1, ...entry }));

        res.json({ success: true, leaderboard });
    });

    // ---- ZEN LEADERBOARD ----
    app.get('/api/leaderboard/zen', authMiddleware, (req, res) => {
        const users = readJSON('users.json');

        const leaderboard = users
            .map(u => ({
                username: u.username,
                image: getAvatarPath(u),
                nameStyle: getNameStyleClass(u),
                frame: getItemCssClass(u.inventory?.equipped?.frame) || null,
                banner: getItemCssClass(u.inventory?.equipped?.banner) || null,
                zen: u.zen,
                items: u.inventory?.owned?.length || 0
            }))
            .sort((a, b) => b.zen - a.zen)
            .slice(0, 50)
            .map((entry, i) => ({ rank: i + 1, ...entry }));

        res.json({ success: true, leaderboard });
    });
};
