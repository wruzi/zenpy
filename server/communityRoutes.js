// ============================================
// ZenPy - Community Routes
// Follow/unfollow, user listing, public profiles
// ============================================
const authMiddleware = require('./middleware/auth');

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    // ---- GET ALL COMMUNITY USERS ----
    app.get('/api/community/users', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');
        const follows = readJSON('follows.json');

        const myFollowing = follows
            .filter(f => f.follower === req.user.email)
            .map(f => f.following);

        const result = users.map(u => {
            const p = progress.find(pr => pr.email === u.email);
            const followerCount = follows.filter(f => f.following === u.email).length;
            const followingCount = follows.filter(f => f.follower === u.email).length;

            return {
                email: u.email,
                username: u.username,
                image: u.image,
                bio: u.bio || '',
                level: u.level,
                xp: u.xp,
                streak: u.streak,
                zen: u.zen,
                joined: u.joined,
                github: u.github || '',
                instagram: u.instagram || '',
                twitter: u.twitter || '',
                currentQuestion: p ? p.currentQuestion : 1,
                questionsCompleted: p ? p.questionTimes.length : 0,
                achievements: u.achievements || [],
                followers: followerCount,
                following: followingCount,
                isFollowing: myFollowing.includes(u.email),
                isMe: u.email === req.user.email,
                inventory: u.inventory
            };
        });

        res.json({ success: true, users: result });
    });

    // ---- GET SINGLE USER PROFILE ----
    app.get('/api/community/user/:email', authMiddleware, (req, res) => {
        const users = readJSON('users.json');
        const progress = readJSON('progress.json');
        const follows = readJSON('follows.json');

        const u = users.find(usr => usr.email === req.params.email);
        if (!u) return res.status(404).json({ success: false, message: 'User not found.' });

        const p = progress.find(pr => pr.email === u.email);
        const followerCount = follows.filter(f => f.following === u.email).length;
        const followingCount = follows.filter(f => f.follower === u.email).length;
        const isFollowing = follows.some(f => f.follower === req.user.email && f.following === u.email);

        res.json({
            success: true,
            user: {
                email: u.email,
                username: u.username,
                image: u.image,
                bio: u.bio || '',
                level: u.level,
                xp: u.xp,
                streak: u.streak,
                zen: u.zen,
                joined: u.joined,
                github: u.github || '',
                instagram: u.instagram || '',
                twitter: u.twitter || '',
                currentQuestion: p ? p.currentQuestion : 1,
                questionsCompleted: p ? p.questionTimes.length : 0,
                achievements: u.achievements || [],
                followers: followerCount,
                following: followingCount,
                isFollowing,
                isMe: u.email === req.user.email,
                inventory: u.inventory
            }
        });
    });

    // ---- FOLLOW ----
    app.post('/api/follow', authMiddleware, (req, res) => {
        const { email } = req.body;
        if (email === req.user.email) {
            return res.status(400).json({ success: false, message: "Can't follow yourself." });
        }

        const follows = readJSON('follows.json');
        const existing = follows.find(f => f.follower === req.user.email && f.following === email);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already following.' });
        }

        follows.push({
            follower: req.user.email,
            following: email,
            timestamp: Date.now()
        });
        writeJSON('follows.json', follows);

        res.json({ success: true, message: 'Followed!' });
    });

    // ---- UNFOLLOW ----
    app.post('/api/unfollow', authMiddleware, (req, res) => {
        const { email } = req.body;
        let follows = readJSON('follows.json');
        const before = follows.length;
        follows = follows.filter(f => !(f.follower === req.user.email && f.following === email));
        writeJSON('follows.json', follows);

        res.json({ success: true, message: follows.length < before ? 'Unfollowed.' : 'Not following.' });
    });

    // ---- GET FOLLOWERS ----
    app.get('/api/followers/:email', authMiddleware, (req, res) => {
        const follows = readJSON('follows.json');
        const users = readJSON('users.json');
        const followers = follows
            .filter(f => f.following === req.params.email)
            .map(f => {
                const u = users.find(usr => usr.email === f.follower);
                return u ? { email: u.email, username: u.username, image: u.image, level: u.level } : null;
            })
            .filter(Boolean);

        res.json({ success: true, followers });
    });

    // ---- GET FOLLOWING ----
    app.get('/api/following/:email', authMiddleware, (req, res) => {
        const follows = readJSON('follows.json');
        const users = readJSON('users.json');
        const following = follows
            .filter(f => f.follower === req.params.email)
            .map(f => {
                const u = users.find(usr => usr.email === f.following);
                return u ? { email: u.email, username: u.username, image: u.image, level: u.level } : null;
            })
            .filter(Boolean);

        res.json({ success: true, following });
    });
};
