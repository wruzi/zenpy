// ============================================
// ZenPy - Main Server
// Express + Socket.io + JSON Database
// ============================================
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// --- Data Directory ---
const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSON(filename) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        if (!fs.existsSync(filepath)) return [];
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error(`Error reading ${filename}:`, e.message);
        return [];
    }
}

function writeJSON(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error(`Error writing ${filename}:`, e.message);
    }
}

app.locals.readJSON = readJSON;
app.locals.writeJSON = writeJSON;
app.locals.DATA_DIR = DATA_DIR;

// --- Ensure data files exist ---
const dataFiles = {
    'credentials.json': [],
    'users.json': [],
    'progress.json': [],
    'banned.json': [],
    'chat_messages.json': [],
    'activity_log.json': [],
    'follows.json': [],
    'direct_messages.json': [],
    'session_codes.json': []
};

Object.entries(dataFiles).forEach(([file, defaultData]) => {
    const filepath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filepath)) {
        writeJSON(file, defaultData);
    }
});

// --- Ensure avatars directory ---
const avatarsDir = path.join(__dirname, '..', 'assets', 'avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// --- Mount Routes ---
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const questionRoutes = require('./questionRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const uploadRoutes = require('./uploadRoutes');
const communityRoutes = require('./communityRoutes');
const dmRoutes = require('./dmRoutes');

authRoutes(app);
userRoutes(app);
questionRoutes(app);
leaderboardRoutes(app);
uploadRoutes(app);
communityRoutes(app);
dmRoutes(app);

// --- Chat Server (Socket.io) ---
const chatServer = require('./chatServer');
chatServer(io, readJSON, writeJSON);

// --- Serve Pages ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'login.html')));
app.get('/verify', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'verify.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'signup.html')));
app.get('/forgot-password', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'forgot-password.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html')));
app.get('/practice', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'practice.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'profile.html')));
app.get('/leaderboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'leaderboard.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'shop.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'chat.html')));
app.get('/community', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'community.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 ZenPy server running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🎮 Ready to code!\n`);
});
