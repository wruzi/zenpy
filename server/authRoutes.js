const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');
const { generateOTP, storeOTP, verifyOTP, getOTPData } = require('./otpGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'zenpy_secret_key_change_in_production_2024';
const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
const RESEND_FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || process.env.ESEND_FROM_EMAIL || '').trim();
const SIGNUP_OTP_TTL_MS = 10 * 60 * 1000;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    function validateSignupInput({ email, username, password }) {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedUsername = (username || '').trim();

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return { valid: false, message: 'Please enter a valid email address.' };
        }
        if (!normalizedUsername || normalizedUsername.length < 3 || normalizedUsername.length > 20) {
            return { valid: false, message: 'Username must be between 3 and 20 characters.' };
        }
        if (!password || password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters.' };
        }

        return {
            valid: true,
            email: normalizedEmail,
            username: normalizedUsername
        };
    }

    function createBaseUser(email, username, provider, providerId = '', avatarUrl = null) {
        const now = new Date().toISOString();
        return {
            email,
            username: username || email.split('@')[0],
            image: avatarUrl || 'default-avatar.svg',
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
            provider,
            providerId,
            profileSetupCompleted: false,
            onboardingCompletedAt: null,
            termsAccepted: false,
            termsAcceptedAt: null
        };
    }

    function createProgressRecord(email) {
        const now = new Date().toISOString();
        return {
            email,
            currentQuestion: 1,
            startTime: now,
            questionTimes: [],
            totalTime: 0,
            averageTime: 0,
            completed: false,
            completedDate: null
        };
    }

    function updateStreakAndLastActive(user) {
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
    }

    function findBanByEmail(email) {
        return readJSON('banned.json').find(b => b.email === email);
    }

    async function sendSignupOtpEmail(email, username, otp) {
        if (!resend) {
            throw new Error('Email service not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.');
        }

        const fromEmail = RESEND_FROM_EMAIL;
        if (!fromEmail) {
            throw new Error('RESEND_FROM_EMAIL is missing.');
        }

        if (!fromEmail.toLowerCase().endsWith('@zenpy.games')) {
            throw new Error('RESEND_FROM_EMAIL must be on zenpy.games (verified domain).');
        }

        console.log('[OTP]', 'sending from', fromEmail, 'to', email, 'otp->', otp);

        const safeName = username || email.split('@')[0];

        const sendResult = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'ZenPy signup verification code',
            html: `
                <div style="font-family:JetBrains Mono, monospace; max-width:520px; margin:0 auto; padding:24px; border:2px solid #2a2a3a; background:#16161e; color:#e8e8f0;">
                    <h2 style="margin:0 0 12px 0; color:#FF1493;">ZenPy Email Verification</h2>
                    <p style="margin:0 0 10px 0;">Hey ${safeName},</p>
                    <p style="margin:0 0 16px 0; color:#b0b0c0;">Use this one-time code to complete your signup:</p>
                    <div style="font-size:30px; letter-spacing:0.25em; font-weight:800; color:#FF1493; margin:8px 0 16px 0;">${otp}</div>
                    <p style="margin:0 0 10px 0; color:#b0b0c0;">This code expires in 10 minutes.</p>
                    <p style="margin:0; color:#6a6a80; font-size:12px;">If you did not request this, you can safely ignore this email.</p>
                </div>
            `,
            text: `ZenPy verification code: ${otp}. This code expires in 10 minutes.`
        });

        if (sendResult && sendResult.error) {
            throw new Error(sendResult.error.message || 'Failed to send OTP email.');
        }
    }

    function getOrCreateUser(email, defaultUsername, provider, profileId, avatarUrl) {
        const users = readJSON('users.json');
        let user = users.find(u => u.email === email);

        if (!user) {
            user = createBaseUser(email, defaultUsername, provider, profileId, avatarUrl);
            users.push(user);
            writeJSON('users.json', users);

            // Save to progress
            const progress = readJSON('progress.json');
            progress.push(createProgressRecord(email));
            writeJSON('progress.json', progress);
        } else {
            let changed = false;

            if (!user.provider || user.provider !== provider) {
                user.provider = provider;
                changed = true;
            }

            if (provider === 'github') {
                if (user.github !== 'linked') {
                    user.github = 'linked';
                    changed = true;
                }
                if (profileId && user.providerId !== profileId) {
                    user.providerId = profileId;
                    changed = true;
                }
                if (avatarUrl && (!user.image || user.image === 'default-avatar.png' || user.image === 'default-avatar.svg')) {
                    user.image = avatarUrl;
                    changed = true;
                }
            }

            if (changed) {
                writeJSON('users.json', users);
            }
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

    app.post('/api/auth/signup/request-otp', async (req, res) => {
        try {
            const { email, username, password } = req.body;
            const validation = validateSignupInput({ email, username, password });
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const users = readJSON('users.json');
            if (users.some(u => u.email === validation.email)) {
                return res.status(409).json({ success: false, message: 'Email is already registered. Please login.' });
            }
            if (users.some(u => (u.username || '').toLowerCase() === validation.username.toLowerCase())) {
                return res.status(409).json({ success: false, message: 'Username is already taken.' });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const otp = generateOTP();
            storeOTP(validation.email, otp, {
                email: validation.email,
                username: validation.username,
                passwordHash,
                purpose: 'signup'
            }, SIGNUP_OTP_TTL_MS);

            await sendSignupOtpEmail(validation.email, validation.username, otp);

            res.json({ success: true, message: 'OTP sent to your email.' });
        } catch (error) {
            console.error('Signup OTP request error:', error.message);
            res.status(500).json({ success: false, message: error.message || 'Could not send OTP right now.' });
        }
    });

    app.post('/api/auth/signup/resend-otp', async (req, res) => {
        try {
            const email = (req.body.email || '').trim().toLowerCase();
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required.' });
            }

            const otpData = getOTPData(email);
            if (!otpData || !otpData.data || otpData.data.purpose !== 'signup') {
                return res.status(404).json({ success: false, message: 'No pending signup found. Request OTP again.' });
            }

            const now = Date.now();
            if (otpData.data.lastResendAt && now - otpData.data.lastResendAt < 45000) {
                return res.status(429).json({ success: false, message: 'Please wait a few seconds before resending OTP.' });
            }

            const newOtp = generateOTP();
            storeOTP(email, newOtp, {
                ...otpData.data,
                lastResendAt: now
            }, SIGNUP_OTP_TTL_MS);
            await sendSignupOtpEmail(email, otpData.data.username, newOtp);

            res.json({ success: true, message: 'A new OTP has been sent.' });
        } catch (error) {
            console.error('Resend OTP error:', error.message);
            res.status(500).json({ success: false, message: error.message || 'Could not resend OTP right now.' });
        }
    });

    app.post('/api/auth/signup/verify-otp', (req, res) => {
        try {
            const email = (req.body.email || '').trim().toLowerCase();
            const otp = (req.body.otp || '').trim();

            if (!email || !otp) {
                return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
            }

            const verification = verifyOTP(email, otp);
            if (!verification.valid) {
                return res.status(400).json({ success: false, message: verification.message });
            }

            const payload = verification.data || {};
            if (payload.purpose !== 'signup' || !payload.passwordHash || !payload.username) {
                return res.status(400).json({ success: false, message: 'Invalid OTP payload.' });
            }

            const users = readJSON('users.json');
            if (users.some(u => u.email === email)) {
                return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
            }
            if (users.some(u => (u.username || '').toLowerCase() === payload.username.toLowerCase())) {
                return res.status(409).json({ success: false, message: 'Username already taken.' });
            }

            const user = createBaseUser(email, payload.username, 'local', 'local');
            user.passwordHash = payload.passwordHash;
            users.push(user);
            writeJSON('users.json', users);

            const progress = readJSON('progress.json');
            progress.push(createProgressRecord(email));
            writeJSON('progress.json', progress);

            const token = jwt.sign(
                { email: user.email, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                token,
                user: {
                    email: user.email,
                    username: user.username,
                    image: user.image
                }
            });
        } catch (error) {
            console.error('Signup verify error:', error.message);
            res.status(500).json({ success: false, message: 'Failed to verify signup OTP.' });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        try {
            const email = (req.body.email || '').trim().toLowerCase();
            const password = req.body.password || '';

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required.' });
            }

            const users = readJSON('users.json');
            const user = users.find(u => u.email === email);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            const bannedUser = findBanByEmail(user.email);
            if (bannedUser) {
                return res.status(403).json({
                    success: false,
                    message: 'You are banned from ZenPy.',
                    reason: bannedUser.reason,
                    unbanDate: bannedUser.unbanDate || 'Permanent'
                });
            }

            if (!user.passwordHash) {
                return res.status(400).json({ success: false, message: 'This account uses GitHub login. Use Continue with GitHub.' });
            }

            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            updateStreakAndLastActive(user);
            const idx = users.findIndex(u => u.email === user.email);
            if (idx !== -1) {
                users[idx] = user;
                writeJSON('users.json', users);
            }

            const token = jwt.sign(
                { email: user.email, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                token,
                user: {
                    email: user.email,
                    username: user.username,
                    image: user.image
                }
            });
        } catch (error) {
            console.error('Login error:', error.message);
            res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
        }
    });

    function handleSuccessfulOauthAndRedirectToFrontend(req, res) {
        const user = req.user;
        const bannedUser = findBanByEmail(user.email);

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

        updateStreakAndLastActive(user);

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