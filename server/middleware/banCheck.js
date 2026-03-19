// ============================================
// ZenPy - Ban Check Middleware
// ============================================
const path = require('path');
const fs = require('fs');

function banCheck(req, res, next) {
    const { readJSON } = req.app.locals;
    const banned = readJSON('banned.json');
    
    // Check by email if user is authenticated
    if (req.user && req.user.email) {
        const ban = banned.find(b => b.email === req.user.email);
        if (ban) {
            // Check if ban has expired
            if (ban.expires && new Date(ban.expires) < new Date()) {
                // Ban expired, remove it
                const updated = banned.filter(b => b.email !== req.user.email);
                req.app.locals.writeJSON('banned.json', updated);
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'You have been banned from ZenPy.',
                    reason: ban.reason,
                    expires: ban.expires
                });
            }
        }
    }

    // Check by IP
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipBan = banned.find(b => b.ip === clientIP);
    if (ipBan) {
        if (ipBan.expires && new Date(ipBan.expires) < new Date()) {
            const updated = banned.filter(b => b.ip !== clientIP);
            req.app.locals.writeJSON('banned.json', updated);
        } else {
            return res.status(403).json({
                success: false,
                message: 'Your IP has been banned from ZenPy.',
                reason: ipBan.reason,
                expires: ipBan.expires
            });
        }
    }

    next();
}

module.exports = banCheck;
