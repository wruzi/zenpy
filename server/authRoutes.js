const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zenpy_secret_key_change_in_production_2024';

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    function getOrCreateUser(email, defaultUsername, provider, profileId, avatarUrl) {
        const users = readJSON('users.json');
        let user = users.find(u => u.email === email);

        if (!user) {
            const now = new Date().toISOString();
            user = {
                email: email,
                username: defaultUsername || email.split('@')[0],
                image: avatarUrl || 'Popcat%20Cartoon.jpg',
                bio: '',
                joined: now,
                xp: 0,
                level: 1,
                zen: 100,
                streak: 0,
                longestStreak: 0,
                totalActiveMinutes: 0,
                inventory: {
                    owned: [],
                    equipped: {
                        nameStyle: null,
                        frame: null,
                        title: 'Newbie',
                        effect: null,
                        chatExtra: null,
                        chatColor: null,
                        chatBackground: null,
                        profile_card: null,
                        banner: null
                    }
                },
                achievements: [],
                lastActive: now,
                github: provider === 'github' ? 'linked' : '',
                instagram: '',
                twitter: '',
                chatMessageCount: 0,
                provider: provider,
                providerId: profileId,
                profileSetupCompleted: false,
                onboardingCompletedAt: null,
                termsAccepted: false,
                termsAcceptedAt: null
            };
            users.push(user);
            writeJSON('users.json', users);

            // Save to progress
            const progress = readJSON('progress.json');
            progress.push({
                email: email,
                currentQuestion: 1,
                startTime: now,
                questionTimes: [],
                totalTime: 0,
                averageTime: 0,
                completed: false,
                completedDate: null
            });
            writeJSON('progress.json', progress);
        }
        return user;
    }

    // --- Passport GitHub Setup ---
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID || 'placeholder',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder',
        callbackURL: "/auth/github/callback",
        scope: ['user:email']
    },
    function(accessToken, refreshToken, profile, cb) {
        let email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
        email = email.toLowerCase();
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        const user = getOrCreateUser(email, profile.username || profile.displayName, 'github', profile.id, avatar);
        return cb(null, user);
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        const users = readJSON('users.json');
        const user = users.find(u => u.email === email);
        done(null, user);
    });

    // --- OAuth Routes ---

    // GitHub Auth
    app.get('/auth/github',
        passport.authenticate('github', { scope: [ 'user:email' ] }));

    app.get('/auth/github/callback', 
        passport.authenticate('github', { failureRedirect: '/login' }),
        function(req, res) {
            handleSuccessfulOauthAndRedirectToFrontend(req, res);
        });

    function handleSuccessfulOauthAndRedirectToFrontend(req, res) {
        const user = req.user;
        const bannedUser = readJSON('banned.json').find(b => b.email === user.email);

        if (bannedUser) {
            return req.logout(err => {
                if (err) console.error("Error logging out banned user:", err);
                const query = `?reason=${encodeURIComponent(bannedUser.reason)}&unbanDate=${bannedUser.unbanDate || 'Permanent'}`;
                res.redirect(`/banned.html${query}`);
            });
        }

        const token = jwt.sign(
            { email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const now = new Date();
        const lastActive = new Date(user.lastActive || now);
        const dayDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
            user.streak++;
            if (user.streak > user.longestStreak) user.longestStreak = user.streak;
        } else if (dayDiff > 1) {
            user.streak = 1;
        }
        user.lastActive = now.toISOString();

        const users = readJSON('users.json');
        const idx = users.findIndex(u => u.email === user.email);
        if (idx !== -1) {
            users[idx] = user;
            writeJSON('users.json', users);
        }

        res.redirect(`/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify({email: user.email, username: user.username}))}`);
    }

    app.get('/api/me', (req, res) => {
        if (req.user) {
            return res.json({ success: true, user: req.user });
        }
        res.status(401).json({ success: false, message: 'Not logged in' });
    });
};