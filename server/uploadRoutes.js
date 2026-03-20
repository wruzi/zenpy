// ============================================
// ZenPy - Upload Routes
// POST /api/upload/avatar — avatar file upload
// ============================================
const authMiddleware = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'assets', 'avatars');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = req.user.email.replace(/[^a-z0-9]/gi, '_') + '_' + Date.now() + ext;
        cb(null, safeName);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG, JPG, GIF, WEBP images are allowed.'));
        }
    }
});

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    // ---- UPLOAD AVATAR ----
    app.post('/api/upload/avatar', authMiddleware, (req, res) => {
        avatarUpload.single('avatar')(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ success: false, message: 'File too large. Max 2MB.' });
                    }
                }
                return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded.' });
            }

            // Update user record
            const users = readJSON('users.json');
            const user = users.find(u => u.email === req.user.email);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Delete old avatar if not default
            if (user.image && user.image !== 'default-avatar.png' && user.image !== 'Popcat Cartoon.jpg' && user.image !== 'Popcat%20Cartoon.jpg' && !user.image.startsWith('http')) {
                const oldPath = path.join(__dirname, '..', 'assets', 'avatars', user.image);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
                }
            }

            user.image = req.file.filename;
            writeJSON('users.json', users);

            res.json({
                success: true,
                message: 'Avatar uploaded!',
                image: req.file.filename,
                url: `/assets/avatars/${req.file.filename}`
            });
        });
    });
};
