// ============================================
// ZenPy - Authentication Routes
// POST /api/signup, /api/verify-session-code, /api/login
// POST /api/forgot-password, /api/reset-password
// No OTP — uses QR-based 4-digit session codes
// ============================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'zenpy_secret_key_change_in_production_2024';

// Track login attempts for lockout
const loginAttempts = new Map();

// In-memory session codes (also persisted to JSON for restart resilience)
const sessionCodes = new Map();

function generate4DigitCode() {
    return crypto.randomInt(1000, 9999).toString();
}

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    // ---- SIGNUP ----
    app.post('/api/signup', async (req, res) => {
        try {
            const { email, username, password } = req.body;

            // Validation
            if (!email || !username || !password) {
                return res.status(400).json({ success: false, message: 'All fields are required.' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: 'Invalid email format.' });
            }

            if (password.length < 8) {
                return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
            }
            if (!/[A-Z]/.test(password)) {
                return res.status(400).json({ success: false, message: 'Password must contain at least 1 uppercase letter.' });
            }
            if (!/[0-9]/.test(password)) {
                return res.status(400).json({ success: false, message: 'Password must contain at least 1 number.' });
            }

            if (username.length < 3 || username.length > 20) {
                return res.status(400).json({ success: false, message: 'Username must be 3-20 characters.' });
            }

            // Check existing
            const credentials = readJSON('credentials.json');
            if (credentials.find(c => c.email === email.toLowerCase())) {
                return res.status(400).json({ success: false, message: 'Email already registered.' });
            }

            const users = readJSON('users.json');
            if (users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase())) {
                return res.status(400).json({ success: false, message: 'Username already taken.' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Generate 4-digit session code
            const code = generate4DigitCode();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

            // Store pending signup with session code
            sessionCodes.set(code, {
                type: 'signup',
                email: email.toLowerCase(),
                username,
                passwordHash,
                expiresAt,
                used: false
            });

            // Persist to JSON
            let codes = readJSON('session_codes.json');
            if (!Array.isArray(codes)) codes = [];
            codes.push({
                code,
                email: email.toLowerCase(),
                username,
                passwordHash,
                type: 'signup',
                expiresAt,
                used: false
            });
            writeJSON('session_codes.json', codes);

            res.json({
                success: true,
                message: 'Session code generated. Scan the QR or enter the code below.',
                sessionCode: code,
                expiresIn: 600 // seconds
            });

        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ success: false, message: 'Server error.', error: error.message, stack: error.stack });
        }
    });

    // ---- VERIFY SESSION CODE (Complete Signup) ----
    app.post('/api/verify-session-code', async (req, res) => {
        try {
            const { email, code } = req.body;
            const emailLower = email.toLowerCase();

            // Find code in memory or JSON
            let session = sessionCodes.get(code);
            if (!session) {
                // Try from JSON
                const codes = readJSON('session_codes.json');
                const found = codes.find(c => c.code === code && c.email === emailLower && !c.used);
                if (found) {
                    session = found;
                }
            }

            if (!session) {
                return res.status(400).json({ success: false, message: 'Invalid session code.' });
            }

            if (session.used) {
                return res.status(400).json({ success: false, message: 'This code has already been used.' });
            }

            if (Date.now() > session.expiresAt) {
                return res.status(400).json({ success: false, message: 'Session code expired. Please sign up again.' });
            }

            if (session.email !== emailLower) {
                return res.status(400).json({ success: false, message: 'Code does not match this email.' });
            }

            // Mark as used
            session.used = true;
            sessionCodes.delete(code);

            const codes = readJSON('session_codes.json');
            const codeEntry = codes.find(c => c.code === code);
            if (codeEntry) codeEntry.used = true;
            writeJSON('session_codes.json', codes);

            const now = new Date().toISOString();

            // Save to credentials
            const credentials = readJSON('credentials.json');
            credentials.push({
                email: emailLower,
                passwordHash: session.passwordHash,
                createdAt: now
            });
            writeJSON('credentials.json', credentials);

            // Save to users
            const users = readJSON('users.json');
            users.push({
                email: emailLower,
                username: session.username,
                image: 'default-avatar.png',
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
                    equipped: { nameStyle: null, frame: null, title: 'Newbie', effect: null, chatExtra: null }
                },
                achievements: [],
                lastActive: now,
                github: '',
                instagram: '',
                twitter: '',
                chatMessageCount: 0
            });
            writeJSON('users.json', users);

            // Save to progress
            const progress = readJSON('progress.json');
            progress.push({
                email: emailLower,
                currentQuestion: 1,
                startTime: now,
                questionTimes: [],
                totalTime: 0,
                averageTime: 0,
                completed: false,
                completedDate: null
            });
            writeJSON('progress.json', progress);

            // Create JWT
            const token = jwt.sign(
                { email: emailLower, username: session.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Account created successfully! Welcome to ZenPy!',
                token,
                user: { email: emailLower, username: session.username }
            });

        } catch (error) {
            console.error('Verify session code error:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    });

    // ---- LOGIN (email + password only) ----
    app.post('/api/login', async (req, res) => {
        try {
            const { email, password, rememberMe } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password required.' });
            }

            const emailLower = email.toLowerCase();

            // Check lockout
            const attempts = loginAttempts.get(emailLower);
            if (attempts && attempts.count >= 5) {
                const lockoutEnd = attempts.lockedUntil;
                if (lockoutEnd && Date.now() < lockoutEnd) {
                    const minutesLeft = Math.ceil((lockoutEnd - Date.now()) / 60000);
                    return res.status(429).json({
                        success: false,
                        message: `Too many attempts. Try again in ${minutesLeft} minutes.`
                    });
                } else {
                    loginAttempts.delete(emailLower);
                }
            }

            // Check banned
            const banned = readJSON('banned.json');
            const ban = banned.find(b => b.email === emailLower);
            if (ban && (!ban.expires || new Date(ban.expires) > new Date())) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been banned.',
                    reason: ban.reason
                });
            }

            // Find credentials
            const credentials = readJSON('credentials.json');
            const cred = credentials.find(c => c.email === emailLower);
            if (!cred) {
                trackFailedLogin(emailLower);
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            // Compare password
            const match = await bcrypt.compare(password, cred.passwordHash);
            if (!match) {
                trackFailedLogin(emailLower);
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            // Reset login attempts
            loginAttempts.delete(emailLower);

            // Get user data
            const users = readJSON('users.json');
            const user = users.find(u => u.email === emailLower);

            // Update last active and streak
            if (user) {
                const lastActive = new Date(user.lastActive);
                const now = new Date();
                const dayDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    user.streak++;
                    if (user.streak > user.longestStreak) user.longestStreak = user.streak;
                } else if (dayDiff > 1) {
                    user.streak = 1;
                }
                user.lastActive = now.toISOString();
                writeJSON('users.json', users);
            }

            const token = jwt.sign(
                { email: emailLower, username: user ? user.username : '' },
                JWT_SECRET,
                { expiresIn: rememberMe ? '7d' : '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful!',
                token,
                user: user ? {
                    email: user.email,
                    username: user.username,
                    xp: user.xp,
                    level: user.level,
                    zen: user.zen,
                    streak: user.streak
                } : null
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    });

    // ---- FORGOT PASSWORD ----
    app.post('/api/forgot-password', (req, res) => {
        try {
            const { email } = req.body;
            const emailLower = email.toLowerCase();

            const credentials = readJSON('credentials.json');
            const cred = credentials.find(c => c.email === emailLower);
            
            if (!cred) {
                return res.json({ success: true, message: 'If an account exists, a reset code has been generated.' });
            }

            const code = generate4DigitCode();
            const expiresAt = Date.now() + 10 * 60 * 1000;

            sessionCodes.set(code, { type: 'reset', email: emailLower, expiresAt, used: false });

            res.json({
                success: true,
                message: 'Reset code generated.',
                sessionCode: code,
                expiresIn: 600
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    });

    // ---- RESET PASSWORD ----
    app.post('/api/reset-password', async (req, res) => {
        try {
            const { email, code, newPassword } = req.body;
            const emailLower = email.toLowerCase();

            if (!newPassword || newPassword.length < 8) {
                return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
            }

            const session = sessionCodes.get(code);
            if (!session || session.type !== 'reset' || session.email !== emailLower) {
                return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
            }

            if (Date.now() > session.expiresAt) {
                return res.status(400).json({ success: false, message: 'Reset code expired.' });
            }

            sessionCodes.delete(code);

            const credentials = readJSON('credentials.json');
            const cred = credentials.find(c => c.email === emailLower);
            if (cred) {
                cred.passwordHash = await bcrypt.hash(newPassword, 10);
                writeJSON('credentials.json', credentials);
            }

            res.json({ success: true, message: 'Password reset successfully! Please login.' });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    });

    function trackFailedLogin(email) {
        const attempts = loginAttempts.get(email) || { count: 0 };
        attempts.count++;
        if (attempts.count >= 5) {
            attempts.lockedUntil = Date.now() + 15 * 60 * 1000;
        }
        loginAttempts.set(email, attempts);
    }
};
