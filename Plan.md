ZenPy - COMPLETE BLUEPRINT with Gamification & Real-time Chat

I love your vision! This is going to be an addictive, feature-rich platform. Let me create the complete blueprint with all your requirements.
🎮 GAMIFICATION SYSTEM DEEP DIVE
XP System

XP Calculation Formula:
text

Base XP = Question Number × 10
Time Bonus = (Optimal Time / Your Time) × 50 (capped at 100)
First Attempt Bonus = 50 if solved in first attempt
Streak Bonus = Streak × 10 (max 100)

Total XP = Base XP + Time Bonus + First Attempt Bonus + Streak Bonus

Example:

    Question 50 solved in 120 seconds (optimal time 60s)

    First attempt: Yes

    Streak: 5 days

text

Base = 500
Time Bonus = (60/120) × 50 = 25
First Attempt = 50
Streak Bonus = 50
Total = 625 XP

Zen Coin System

Earning Mechanics:

    Passive earning: Every 30 minutes active on platform = random 10-100 Zen coins

    XP Milestones: Every 1000 XP = 50 Zen coins bonus

    Question completion: First solve of day = 20 Zen coins

    Referral: Friend joins using your code = 200 Zen coins

Active Time Tracking:

    User must be interacting (typing, running code, chatting)

    AFK detection after 5 minutes of inactivity

    Progress bar shows time until next coin drop

    Notification: "You earned 45 Zen coins for your focus!"

Shop Items
Item	Cost	Effect	Rarity
Silver Name	500 Zen	Silver glow in chat/leaderboard	Common
Gold Name	2000 Zen	Gold shimmer animation	Rare
Rainbow Name	5000 Zen	Rainbow gradient animation	Epic
Neon Frame	1000 Zen	Pink neon border around avatar	Rare
Animated Avatar	3000 Zen	Avatar pulses/pulses	Epic
Name Sparkles	1500 Zen	✨ sparkles around name	Rare
Fire Effect	4000 Zen	🔥 flames when on streak	Legendary
Crown	10000 Zen	👑 appears next to name	Mythic
Custom Title	2500 Zen	"The Python Master" under name	Epic
Chat VIP	3000 Zen	Gold border in chat	Rare

Limited Time Items (Weekly Rotation):

    Halloween theme (Oct)

    Christmas theme (Dec)

    College festival themes

Achievements System
json

"achievements": [
  {
    "id": "first_steps",
    "name": "First Steps",
    "desc": "Complete Question 1",
    "xp": 100,
    "zen": 50
  },
  {
    "id": "speed_demon_10",
    "name": "Speed Demon",
    "desc": "Complete 10 questions under 2 min each",
    "xp": 500,
    "zen": 200
  },
  {
    "id": "streak_7",
    "name": "Weekly Warrior",
    "desc": "7 day streak",
    "xp": 1000,
    "zen": 300
  },
  {
    "id": "social_butterfly",
    "name": "Social Butterfly",
    "desc": "Send 100 chat messages",
    "xp": 300,
    "zen": 150
  },
  {
    "id": "perfectionist_50",
    "name": "Perfectionist",
    "desc": "50 questions solved in first attempt",
    "xp": 2000,
    "zen": 500
  }
]

Leaderboards (4 Types)

    Progression Leaderboard - Current question reached

    Speed Leaderboard - Average time per question

    XP Leaderboard - Total XP earned

    Zen Rich Leaderboard - Wealthiest users (Zen coins)

💬 REAL-TIME GLOBAL CHAT
Chat Features
text

[====================================]
|  🌍 GLOBAL CHAT - 127 online      |
|====================================|
|  [🔥] PythonMaster: Anyone stuck  |
|       on Q42? Hint: use loops     |
|                                    |
|  [✨] CodeWizard: @PythonMaster   |
|       thanks! got it working      |
|                                    |
|  [👑] ZenKing: just hit 10k XP!   |
|       🎉🎉🎉                      |
|                                    |
|  ⚠️ SYSTEM: @Newbie joined ZenPy!  |
|                                    |
|  [💬] Enter message... [SEND]     |
|====================================|

Chat Rules & Restrictions

    NO copy-paste in chat (disabled)

    Rate limiting: 5 messages per 10 seconds

    No links/images (text only)

    Profanity filter (auto-censor)

    Report button for inappropriate messages

    Mute system: 3 reports = 1 hour mute

Chat Special Features

    Mentions: @username highlights user (pink)

    Emojis: Limited set (😊🔥🎉💯👑✨)

    System messages: User joins/levels up/completes milestones

    Typing indicator: "Someone is typing..."

    Online status: Green dot for active users

    Name colors/effects: Based on shop items purchased

Chat Moderation

    Auto-mod for spam

    Mute/ban from chat only (not platform)

    Report logs stored in chat_reports.json

📁 UPDATED PROJECT STRUCTURE
text

zenpy/
├── index.html
├── login.html
├── signup.html
├── forgot-password.html
├── dashboard.html
├── practice.html
├── profile.html
├── leaderboard.html
├── shop.html              # NEW: Shop page
├── chat.html              # NEW: Dedicated chat page (or embedded in dashboard)
├── admin.html             # NEW: For you as founder
├── css/
├── js/
│   ├── auth.js
│   ├── dashboard.js
│   ├── compiler.js
│   ├── charts.js
│   ├── leaderboard.js
│   ├── gamification.js    # NEW: XP, Zen coins logic
│   ├── shop.js            # NEW: Shop functionality
│   ├── chat.js            # NEW: Real-time chat
│   ├── activityTracker.js # NEW: Tracks time for Zen coins
│   └── utils.js
├── data/
│   ├── users.json         # + xp, zen, inventory, achievements
│   ├── credentials.json
│   ├── progress.json      # + time per question for XP calc
│   ├── banned.json
│   ├── questions.json
│   ├── shop_items.json    # NEW: Shop inventory
│   ├── chat_messages.json # NEW: Last 100 messages (buffer)
│   ├── chat_reports.json  # NEW: Reported messages
│   └── activity_log.json  # NEW: For time tracking
├── server/
│   ├── server.js
│   ├── authMiddleware.js
│   └── otpGenerator.js     # NEW: Manual OTP (no email)
└── assets/

🔐 MANUAL OTP SYSTEM (No Email Service)

Since you don't have email service, here's a simple manual OTP system:
How it works:

    User signs up with email and password

    Instead of sending email, display OTP on screen with warning:
    text

    ╔════════════════════════════════════════════╗
    ║  📱 MANUAL VERIFICATION REQUIRED           ║
    ╠════════════════════════════════════════════╣
    ║  Your OTP:  123456                         ║
    ║                                            ║
    ║  ⚠️  FOR DEVELOPMENT ONLY                   ║
    ║  In production, this would be emailed.     ║
    ║  Please enter the OTP below to continue.   ║
    ╚════════════════════════════════════════════╝

    User enters OTP manually

    For production, you can later integrate:

        Gmail SMTP (free for 500 emails/day)

        SendGrid free tier (100 emails/day)

Forgot Password - Manual OTP:

Same concept - OTP displays on screen with note to check "email" (actually just on screen)
💻 COMPILER: PYODIDE IMPLEMENTATION
Pyodide Setup:
html

<!-- In practice.html -->
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>

Restricted Imports:
javascript

// Block dangerous modules
const blockedImports = ['os', 'sys', 'subprocess', 'socket', 'requests', 
                        'urllib', 'http', 'ftplib', 'telnetlib', 
                        'ctypes', 'winreg', 'tkinter'];

// Pyodide runs in browser sandbox - already safe
// But we can still check code before execution
function validateCode(code) {
    for (const imp of blockedImports) {
        if (code.includes(`import ${imp}`) || code.includes(`from ${imp}`)) {
            return { valid: false, message: `Import '${imp}' is not allowed` };
        }
    }
    return { valid: true };
}

Test Cases Runner:
javascript

async function runTests(code, testCases) {
    try {
        let pyodide = await loadPyodide();
        
        // Load the user's code
        await pyodide.runPythonAsync(code);
        
        let results = [];
        for (const test of testCases) {
            // Capture stdout
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
            `);
            
            // Run user's code with test input if needed
            if (test.input) {
                await pyodide.runPythonAsync(`print(${test.input})`);
            } else {
                await pyodide.runPythonAsync(code);
            }
            
            // Get output
            let output = pyodide.runPython('sys.stdout.getvalue()');
            
            // Compare with expected
            const passed = output === test.expectedOutput;
            results.push({ passed, output, expected: test.expectedOutput });
        }
        
        return results;
    } catch (error) {
        return { error: error.message };
    }
}

🕒 ACTIVITY TRACKER FOR ZEN COINS
How it works:
javascript

// activityTracker.js
class ActivityTracker {
    constructor(userEmail) {
        this.userEmail = userEmail;
        this.lastActiveTime = Date.now();
        this.totalActiveSeconds = 0;
        this.zenEarningInterval = null;
        this.checkInterval = null;
    }
    
    startTracking() {
        // Track mouse movements, keypresses, etc.
        document.addEventListener('mousemove', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
        document.addEventListener('click', () => this.updateActivity());
        
        // Every minute, check if user is active
        this.checkInterval = setInterval(() => this.checkActivity(), 60000);
        
        // Every 30 minutes, award Zen coins if active
        this.zenEarningInterval = setInterval(() => this.awardZenCoins(), 1800000);
    }
    
    updateActivity() {
        this.lastActiveTime = Date.now();
    }
    
    checkActivity() {
        const now = Date.now();
        const inactiveTime = (now - this.lastActiveTime) / 1000; // in seconds
        
        if (inactiveTime < 300) { // Less than 5 minutes inactive
            this.totalActiveSeconds += 60; // Add 1 minute
        }
    }
    
    awardZenCoins() {
        // Check if user was active for at least 15 of last 30 minutes
        if (this.totalActiveSeconds >= 900) { // 15 minutes
            const coinsEarned = Math.floor(Math.random() * 91) + 10; // 10-100
            this.updateUserZenCoins(coinsEarned);
            
            // Show notification
            this.showNotification(`✨ You earned ${coinsEarned} Zen coins for coding focus!`);
        }
        
        // Reset counter
        this.totalActiveSeconds = 0;
    }
}

🛒 SHOP PAGE (shop.html)
Layout:
text

╔══════════════════════════════════════════════════════╗
║  🛒 ZEN SHOP                            Your Zen: 2,450 ║
╠══════════════════════════════════════════════════════╣
║  ┌────────────────────────────────────────────────┐ ║
║  │ 🔍 [Search items...]       [🔄] [🎁] [👑]      │ ║
║  └────────────────────────────────────────────────┘ ║
║                                                      ║
║  ┌────────────────────────────────────────────────┐ ║
║  │  🌟 FEATURED ITEMS                              │ ║
║  ├────────────────────────────────────────────────┤ ║
║  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │ ║
║  │  │ 👑     │ │ 🔥     │ │ ✨     │ │ 💫     │  │ ║
║  │  │ CROWN  │ │ FIRE   │ │ SPARK- │ │ RAIN-  │  │ ║
║  │  │ 10,000 │ │ 4,000  │ │ LES    │ │ BOW    │  │ ║
║  │  │        │ │        │ │ 1,500  │ │ 5,000  │  │ ║
║  │  │ [BUY]  │ │ [BUY]  │ │ [BUY]  │ │ [BUY]  │  │ ║
║  │  └────────┘ └────────┘ └────────┘ └────────┘  │ ║
║  └────────────────────────────────────────────────┘ ║
║                                                      ║
║  ┌────────────────────────────────────────────────┐ ║
║  │  🎨 NAME STYLES                                 │ ║
║  ├────────────────────────────────────────────────┤ ║
║  │  • Silver Name    500 Zen  [OWNED]             │ ║
║  │  • Gold Name     2000 Zen  [BUY]               │ ║
║  │  • Rainbow Name  5000 Zen  [BUY]               │ ║
║  │  • Animated      8000 Zen  [LOCKED] (Need 50Q) │ ║
║  └────────────────────────────────────────────────┘ ║
║                                                      ║
║  ┌────────────────────────────────────────────────┐ ║
║  │  🖼️ AVATAR FRAMES                               │ ║
║  ├────────────────────────────────────────────────┤ ║
║  │  • Neon Frame    1000 Zen  [BUY]               │ ║
║  │  • Royal Frame   3000 Zen  [BUY]               │ ║
║  │  • Animated      6000 Zen  [BUY]               │ ║
║  └────────────────────────────────────────────────┘ ║
║                                                      ║
║  ┌────────────────────────────────────────────────┐ ║
║  │  💬 CHAT EXTRAS                                 │ ║
║  ├────────────────────────────────────────────────┤ ║
║  │  • VIP Border   3000 Zen  [BUY]               │ ║
║  │  • Custom Title 2500 Zen  [BUY]               │ ║
║  │  • Emoji Pack   1000 Zen  [BUY]               │ ║
║  └────────────────────────────────────────────────┘ ║
║                                                      ║
║  ┌────────────────────────────────────────────────┐ ║
║  │  ⏳ LIMITED TIME (7 days left)                  │ ║
║  ├────────────────────────────────────────────────┤ ║
║  │  🎃 Halloween Glow   1500 Zen  [BUY]           │ ║
║  │  🎄 Christmas Snow   1500 Zen  [BUY]           │ ║
║  └────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════╝

Inventory System:
json

// In users.json - inventory field
"inventory": {
  "owned": ["silver_name", "neon_frame"],
  "equipped": {
    "name_style": "silver_name",
    "frame": "neon_frame",
    "title": "Python Apprentice"
  },
  "zen": 2450
}

📊 DASHBOARD WITH GAMIFICATION
Enhanced Dashboard Sections:

    Top Bar:

        XP Bar (current level progress)

        Zen Coin counter with animation

        Streak flame icon with count

        Online timer (for Zen earning)

    Left Sidebar:

        Avatar with equipped frame

        Name with equipped style

        Title under name

        Level badge

        Quick stats: Q# / XP / Zen / Rank

    Main Area:

        Level Progress Card: Circular progress with next level rewards

        Recent Achievements: Toast notifications for new badges

        Daily Goals: (Complete 3 questions, earn 100 XP, etc.)

        Friend Activity: Live feed with equipped styles visible

        Zen Earning Timer: Progress ring showing time until next drop

    Mini-Games Section:

        Spin wheel for Zen coins (cost 50 Zen to spin)

        Daily bonus login rewards

        Question streak bonuses

💬 REAL-TIME CHAT IMPLEMENTATION
Using WebSocket (Socket.io):
javascript

// server/chatServer.js
const io = require('socket.io')(server);
const chatMessages = [];

io.on('connection', (socket) => {
    console.log('User connected');
    
    // Send last 50 messages to new user
    socket.emit('chat_history', chatMessages.slice(-50));
    
    // Handle new message
    socket.on('send_message', (data) => {
        const message = {
            username: data.username,
            message: data.message,
            timestamp: Date.now(),
            nameStyle: data.nameStyle,
            avatarFrame: data.avatarFrame,
            isVip: data.isVip
        };
        
        chatMessages.push(message);
        if (chatMessages.length > 100) chatMessages.shift();
        
        // Broadcast to all users
        io.emit('new_message', message);
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
        socket.broadcast.emit('user_typing', data);
    });
});

Chat HTML Structure:
html

<div class="chat-container">
    <div class="chat-header">
        <h3>🌍 GLOBAL CHAT <span class="online-count">42 online</span></h3>
    </div>
    
    <div class="chat-messages" id="chatMessages">
        <!-- Messages appear here with styled names -->
    </div>
    
    <div class="chat-input-area">
        <input type="text" 
               id="chatInput" 
               placeholder="Type your message..." 
               maxlength="200"
               onpaste="return false"
               oncopy="return false">
        <button id="sendChat" class="pink-btn">SEND</button>
    </div>
    
    <div class="chat-rules">
        ⚠️ No copy-paste • Be respectful • 5 msg/10s
    </div>
</div>

🚫 ANTI-COPY-PASTE SYSTEM
Multi-layer Protection:
javascript

// 1. Disable keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        warnUser('copy_attempt');
        return false;
    }
});

// 2. Disable context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    warnUser('copy_attempt');
});

// 3. Disable paste events
editor.on('paste', () => {
    warnUser('copy_attempt');
});

// 4. Track attempts
let copyAttempts = 0;
function warnUser(type) {
    copyAttempts++;
    const remaining = 5 - copyAttempts;
    
    if (copyAttempts >= 5) {
        banUser('permanent', 'Multiple copy-paste attempts');
        return;
    }
    
    showModal(`
        ╔══════════════════════════════════════╗
        ║  ⚠️  WARNING!                        ║
        ╠══════════════════════════════════════╣
        ║  Copy-paste is not allowed on ZenPy. ║
        ║                                      ║
        ║  Attempt ${copyAttempts}/5            ║
        ║  ${remaining} attempts remaining     ║
        ║                                      ║
        ║  Next attempt will result in BAN!    ║
        ╚══════════════════════════════════════╝
    `);
}

🔧 FREE HOSTING OPTIONS
Option 1: Render.com (Recommended)

    Free tier: 750 hours/month

    Supports Node.js backend

    Automatic SSL

    Easy GitHub integration

    Sleeps after 15 min inactivity (wakes on request)

Option 2: Cyclic.sh

    Generous free tier

    Built for Node.js

    No sleep (always on)

    Limited to 1000 requests/hour

Option 3: Vercel + MongoDB Atlas

    Frontend on Vercel (free)

    Backend as serverless functions

    MongoDB Atlas free tier for database

    More complex but scalable

Option 4: PythonAnywhere

    Free tier with one web app

    MySQL database included

    But limited to Python (not Node.js)

For this project: Render.com is easiest

    One-click deploy from GitHub

    Environment variables for secrets

    Custom domain support

📅 WEEKEND DEVELOPMENT PLAN
Saturday:
Time	Task
9AM-11AM	Setup project structure, HTML/CSS theme
11AM-1PM	Authentication pages (login/signup) with manual OTP
1PM-2PM	Break
2PM-4PM	Dashboard layout with stats
4PM-6PM	Practice page + Pyodide integration
6PM-8PM	Questions 1-10 with test cases
8PM-10PM	Progress tracking + JSON database
Sunday:
Time	Task
9AM-11AM	Gamification system (XP, Zen coins)
11AM-1PM	Leaderboards (4 types)
1PM-2PM	Break
2PM-4PM	Shop page + inventory system
4PM-6PM	Real-time chat with Socket.io
6PM-8PM	Copy-paste prevention + ban system
8PM-10PM	Deployment on Render.com
10PM-12AM	Testing with friends, bug fixes
🚀 NEXT STEPS

    Approve this expanded blueprint

    I'll start creating the actual HTML/CSS/JS files

    Set up the JSON structure

    Build authentication with manual OTP

    Create gamification engine

    Implement chat with WebSocket

    Deploy on Render.com by Sunday night

Questions for you:

    Should I start coding this now?

    Any specific color preferences for the chat?

    Want me to add any specific achievements or shop items?

    Should we have a referral system for extra Zen coins?

Let me know and I'll begin building! This is going to be legendary! 🔥
give me a zenpy txt file (everything we discussed) blue print for antigravity to vibecode this
text

ZENPY - COMPLETE DEVELOPMENT BLUEPRINT
=======================================
"A competitive Python learning platform with gamification, real-time chat, and leaderboards"
Created for: College friends (30-100 users)
Deadline: Sunday (Weekend vibe code)
Hosting: Render.com (free tier)

-------------------------------------------------------------------------------

TABLE OF CONTENTS
-----------------
1. PROJECT OVERVIEW
2. TECHNOLOGY STACK
3. FILE STRUCTURE
4. COLOR THEME & DESIGN
5. DATABASE SCHEMA (JSON FILES)
6. AUTHENTICATION SYSTEM (Manual OTP)
7. PAGES & THEIR ELEMENTS
8. GAMIFICATION SYSTEM (XP & ZEN COINS)
9. SHOP & CUSTOMIZATIONS
10. REAL-TIME CHAT
11. COMPILER (PYODIDE)
12. ANTI-COPY-PASTE & BAN SYSTEM
13. LEADERBOARDS (4 TYPES)
14. ACTIVITY TRACKER
15. API ENDPOINTS
16. DEPLOYMENT STEPS
17. WEEKEND DEVELOPMENT TIMELINE

-------------------------------------------------------------------------------

1. PROJECT OVERVIEW
-------------------
ZenPy is a gamified Python learning platform where users solve 100 progressive
questions. Features include:
- Sequential unlocking (must solve Q1 to access Q2)
- XP system with time-based bonuses
- Zen coins (earned by active time on platform)
- Shop for name styles, frames, effects
- 4 leaderboards (Progression, Speed, XP, Wealth)
- Real-time global chat with styled names
- Anti-copy-paste with 5-strike ban system
- Manual OTP verification (no email service needed for now)
- Dashboard with analytics and progress tracking

-------------------------------------------------------------------------------

2. TECHNOLOGY STACK
-------------------
Frontend:
- HTML5, CSS3, JavaScript (Vanilla - no frameworks)
- Chart.js for analytics graphs
- Socket.io-client for real-time chat
- Pyodide (Python compiler in browser)
- CodeMirror for code editor

Backend:
- Node.js with Express
- Socket.io for WebSocket
- File system (fs) for JSON database
- bcrypt for password hashing
- JWT for authentication

Database:
- JSON files (will migrate to MongoDB later)

-------------------------------------------------------------------------------

3. FILE STRUCTURE
-----------------
zenpy/
│
├── public/
│   ├── index.html              # Landing page
│   ├── login.html              # Login page
│   ├── signup.html             # Signup with OTP
│   ├── forgot-password.html    # Password reset
│   ├── dashboard.html          # Main dashboard (protected)
│   ├── practice.html           # Coding practice (protected)
│   ├── profile.html            # User profile (protected)
│   ├── leaderboard.html        # Leaderboards (protected)
│   ├── shop.html               # Zen shop (protected)
│   ├── chat.html               # Global chat (protected)
│   └── admin.html              # Founder admin panel
│
├── css/
│   ├── style.css               # Global styles
│   ├── theme.css               # Dark pink/black theme
│   ├── animations.css          # All animations
│   └── responsive.css          # Desktop-only (minimal)
│
├── js/
│   ├── auth.js                 # Login/signup logic
│   ├── dashboard.js            # Dashboard functionality
│   ├── compiler.js             # Pyodide integration
│   ├── gamification.js         # XP, Zen coins logic
│   ├── shop.js                 # Shop & inventory
│   ├── leaderboard.js          # Real-time leaderboard
│   ├── chat.js                 # Socket.io chat
│   ├── activityTracker.js      # Time tracking for Zen
│   ├── charts.js               # Analytics graphs
│   └── utils.js                # Helper functions
│
├── server/
│   ├── server.js               # Express main server
│   ├── authRoutes.js           # Authentication endpoints
│   ├── userRoutes.js           # User data endpoints
│   ├── questionRoutes.js       # Question endpoints
│   ├── leaderboardRoutes.js    # Leaderboard logic
│   ├── chatServer.js           # Socket.io chat server
│   ├── otpGenerator.js         # Manual OTP (no email)
│   └── middleware/
│       ├── auth.js             # JWT verification
│       └── banCheck.js         # Check banned users
│
├── data/
│   ├── credentials.json        # { email, passwordHash }
│   ├── users.json              # { email, username, image, bio, joined, xp, zen, inventory, equipped, achievements, streak, lastActive }
│   ├── progress.json           # { email, currentQuestion, questionTimes[{q, time, attempts}], totalTime, averageTime, completed }
│   ├── questions.json          # All 100 questions with test cases
│   ├── shop_items.json         # Available shop items
│   ├── banned.json             # { email, ip, reason, bannedAt }
│   ├── chat_messages.json      # Last 100 messages buffer
│   └── activity_log.json       # User activity timestamps
│
├── assets/
│   ├── images/
│   │   ├── default-avatar.png
│   │   ├── logo.png
│   │   └── badges/
│   └── icons/
│
├── package.json
└── README.md

-------------------------------------------------------------------------------

4. COLOR THEME & DESIGN
-----------------------
Primary Colors:
- Background: #0A0A0A (Deep Black)
- Secondary: #1A1A1A (Lighter Black)
- Cards: #222222 (Card Background)
- Accent: #FF1493 (Deep Pink)
- Accent Hover: #FF44A4 (Lighter Pink)
- Text Primary: #FFFFFF (White)
- Text Secondary: #CCCCCC (Light Grey)
- Text Muted: #888888 (Grey)
- Success: #00FF88 (Green)
- Warning: #FFAA00 (Yellow)
- Error: #FF4444 (Red)

Fonts:
- Headings: 'Poppins', sans-serif (Bold, 600)
- Body: 'Inter', sans-serif (Regular, 400)
- Code: 'Fira Code', monospace (with ligatures)

Animations:
- Hover glow effect on buttons (pink shadow)
- Fade-in on scroll
- Pulse animation for notifications
- Slide-in for modals
- Confetti on question completion
- XP bar fill animation
- Zen coin counter increment animation

-------------------------------------------------------------------------------

5. DATABASE SCHEMA (JSON FILES)
-------------------------------

5.1 credentials.json
--------------------
[
  {
    "email": "user@example.com",
    "passwordHash": "$2a$10$X9...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]

5.2 users.json
--------------
[
  {
    "email": "user@example.com",
    "username": "python_ninja",
    "image": "default-avatar.png",
    "bio": "CS student, love coding!",
    "joined": "2024-01-15T10:30:00Z",
    "xp": 1250,
    "level": 5,
    "zen": 450,
    "streak": 3,
    "longestStreak": 7,
    "totalActiveMinutes": 360,
    "inventory": {
      "owned": ["silver_name", "neon_frame"],
      "equipped": {
        "nameStyle": "silver_name",
        "frame": "neon_frame",
        "title": "Python Apprentice"
      }
    },
    "achievements": ["first_steps", "speed_demon_10"],
    "lastActive": "2024-01-15T10:30:00Z",
    "github": "",
    "linkedin": ""
  }
]

5.3 progress.json
-----------------
[
  {
    "email": "user@example.com",
    "currentQuestion": 42,
    "startTime": "2024-01-15T10:30:00Z",
    "questionTimes": [
      { "q": 1, "time": 120, "attempts": 1, "xpEarned": 150 },
      { "q": 2, "time": 180, "attempts": 2, "xpEarned": 130 }
    ],
    "totalTime": 3600,
    "averageTime": 85.7,
    "completed": false,
    "completedDate": null
  }
]

5.4 questions.json
------------------
[
  {
    "id": 1,
    "title": "Print Your Name",
    "description": "Write a program that prints your name to the screen.",
    "difficulty": "beginner",
    "category": "basics",
    "initialCode": "# Write your code here\n\n",
    "testCases": [
      {
        "input": "",
        "expectedOutput": "John\n",
        "type": "exact"
      }
    ],
    "hints": ["Use print() function"],
    "optimalTime": 60,
    "concepts": ["print", "strings"],
    "xpBase": 10
  }
]

5.5 shop_items.json
-------------------
[
  {
    "id": "silver_name",
    "name": "Silver Name",
    "description": "Your name glows silver in chat and leaderboards",
    "price": 500,
    "category": "name_style",
    "rarity": "common",
    "cssClass": "name-silver",
    "requirement": null
  },
  {
    "id": "gold_name",
    "name": "Gold Name",
    "description": "Your name shimmers with gold",
    "price": 2000,
    "category": "name_style",
    "rarity": "rare",
    "cssClass": "name-gold",
    "requirement": { "type": "questions", "value": 20 }
  },
  {
    "id": "rainbow_name",
    "name": "Rainbow Name",
    "description": "Your name cycles through rainbow colors",
    "price": 5000,
    "category": "name_style",
    "rarity": "epic",
    "cssClass": "name-rainbow",
    "requirement": { "type": "questions", "value": 50 }
  },
  {
    "id": "neon_frame",
    "name": "Neon Frame",
    "description": "Pink neon border around your avatar",
    "price": 1000,
    "category": "avatar_frame",
    "rarity": "rare",
    "cssClass": "frame-neon",
    "requirement": null
  },
  {
    "id": "crown",
    "name": "Crown 👑",
    "description": "A crown appears next to your name",
    "price": 10000,
    "category": "name_accessory",
    "rarity": "mythic",
    "cssClass": "crown",
    "requirement": { "type": "xp", "value": 10000 }
  },
  {
    "id": "fire_effect",
    "name": "Fire Effect 🔥",
    "description": "Flames around your name when on streak",
    "price": 4000,
    "category": "effect",
    "rarity": "legendary",
    "cssClass": "fire-effect",
    "requirement": { "type": "streak", "value": 7 }
  }
]

5.6 banned.json
---------------
[
  {
    "email": "spammer@example.com",
    "ip": "192.168.1.1",
    "reason": "copy_paste_attempts",
    "bannedAt": "2024-01-15T10:30:00Z",
    "expires": null
  }
]

5.7 chat_messages.json (in-memory buffer, last 100)
----------------------------------------------------
[
  {
    "username": "python_ninja",
    "message": "Anyone stuck on Q42?",
    "timestamp": 1705312230000,
    "nameStyle": "gold_name",
    "frame": "neon_frame",
    "title": "Python Master",
    "isVip": true
  }
]

-------------------------------------------------------------------------------

6. AUTHENTICATION SYSTEM (Manual OTP)
-------------------------------------

6.1 Signup Flow:
----------------
1. User fills: Email, Username, Password, Confirm Password
2. Validation:
   - Email format valid
   - Password: min 8 chars, 1 uppercase, 1 number
   - Passwords match
   - Email not in credentials.json
3. Generate 6-digit OTP
4. Store temp data in memory: { email, passwordHash, username, otp, expires }
5. Show OTP modal with: "YOUR OTP: 123456 (For development - would be emailed)"
6. User enters OTP
7. If correct, save to:
   - credentials.json
   - users.json (with default values)
   - progress.json (currentQuestion: 0)
8. Auto-login with JWT token
9. Redirect to dashboard

6.2 Login Flow:
---------------
1. User enters email and password
2. Find in credentials.json, compare hash
3. If match, create JWT token (24h expiry)
4. Store token in HttpOnly cookie
5. Redirect to dashboard
6. 5 failed attempts = 15min lockout

6.3 Forgot Password Flow:
-------------------------
1. User enters email
2. Check if exists in credentials.json
3. Generate 4-digit OTP
4. Show OTP modal: "YOUR OTP: 1234"
5. User enters OTP
6. If correct, show new password form
7. Update password hash in credentials.json
8. Redirect to login

6.4 Session Management:
----------------------
- JWT tokens with 24h expiry
- Auto-logout after 1h inactivity
- "Remember Me" = 7 day token

-------------------------------------------------------------------------------

7. PAGES & THEIR ELEMENTS
-------------------------

7.1 Landing Page (index.html)
------------------------------
Header:
- Logo + "ZenPy" with pink accent
- Login / Signup buttons

Hero Section:
- Animated tagline: "Code with Zen, Compete with Friends"
- CTA: "Start Your Journey" (to signup)
- Background: Animated gradient black to pink waves

Features Grid (3 columns):
- Sequential Mastery: "Unlock questions one by one"
- Real-time Leaderboard: "Compete with friends"
- Deep Analytics: "Track your progress"
- Gamification: "Earn XP and Zen coins"
- Customization: "Style your profile"
- Community: "Global chat with friends"

How It Works (steps):
1. Sign up (takes 2 minutes)
2. Start from Question 1
3. Code in built-in compiler
4. Unlock next question
5. Earn rewards and climb leaderboards

Live Preview:
- Animated leaderboard showing top 3 (fake data)
- "Current #1: PythonMaster - Question 47"

Stats Counters (animated):
- 100+ Questions
- 50+ Active Coders
- 1000+ Lines of Code

Footer:
- About | Privacy | Terms
- Social icons (GitHub, Discord)
- "Made with 💖 for coders"

7.2 Dashboard (dashboard.html) - Protected
-------------------------------------------
Layout: Sidebar + Main Content

Sidebar (fixed left, black background):
- Profile picture with equipped frame
- Username with equipped style
- Title under name
- Level: 5 (XP bar below)
- Zen: 2,450 (with icon)
- Streak: 🔥 3 days
- Navigation:
  🏠 Dashboard
  💻 Practice
  📈 My Analytics
  🏆 Leaderboards
  🛒 Shop
  💬 Chat
  👤 Profile
  🚪 Logout

Main Content:
1. Welcome Banner:
   "Welcome back, python_ninja!"
   Current: Question 42/100
   Motivational quote based on progress

2. Progress Cards (4):
   - Current Question: 42 [Unlock Next]
   - Total XP: 1,250 (Next level: 1,500)
   - Zen Coins: 2,450
   - Global Rank: #12

3. XP Progress Card:
   - Circular progress to next level
   - Level 5 → Level 6
   - Reward at next level: 100 Zen

4. Zen Earning Timer:
   - Progress ring showing 15/30 minutes
   - "15 min until next Zen drop"
   - Recent drop: +45 Zen

5. Question Timeline Chart:
   - Bar chart showing time per question
   - Color-coded: green (<opt), yellow, red (>2x opt)
   - Click bar to see details

6. Performance Radar Chart:
   - Categories: Speed, Accuracy, Logic, Debugging, Creativity
   - Based on performance

7. Recent Achievements:
   - Toast notifications for new badges
   - "Speed Demon" - Completed 10 questions under 2min

8. Friend Activity Feed:
   - "Rahul completed Q35 (Gold Name visible)"
   - "Priya is now #3 on leaderboard"
   - "Alex earned Fire effect!"

9. Daily Goals:
   - [ ] Complete 3 questions (+50 XP)
   - [ ] Code for 1 hour (+30 Zen)
   - [ ] Help someone in chat (+20 XP)

10. Recommended Next:
    - Based on weak areas: "Practice loops"

7.3 Practice Page (practice.html) - Protected
----------------------------------------------
Layout: 3 panels

Left Panel (Question):
- Question #42 | "Loop Challenge" | Difficulty: Medium
- Problem description
- Examples (if applicable)
- Hints (reveal on click, costs 10 Zen?)
- Concepts: loops, lists

Middle Panel (Code Editor):
- CodeMirror editor with Python syntax
- Line numbers
- Dark theme
- Initial code (if any)
- Copy-paste disabled
- Warning banner at top: "Copying is not allowed"

Right Panel (Output/Results):
- Console output
- Test cases:
  ✅ Test 1 passed
  ❌ Test 2 failed (Expected: 5, Got: 3)
  ✅ Test 3 passed
- Error messages
- Success message with confetti when all pass

Bottom Bar:
- [Run Code] [Submit] buttons
- Time taken: 2:34 (Optimal: 1:00)
- XP if solved: 150

Features:
- Auto-save every 30 seconds
- Cannot proceed until current question solved
- On correct solution: confetti, sound, XP calculation, next question unlocked

7.4 Leaderboard Page (leaderboard.html) - Protected
----------------------------------------------------
4 Tabs:

Tab 1: Progression Leaderboard
- Rank | Username (with style) | Question | Time Online | Trend
- Sorted by currentQuestion (desc), then totalTime
- Highlight current user in pink

Tab 2: Speed Leaderboard
- Rank | Username | Avg Time/Question | Questions Done
- Only users with ≥10 questions
- Sorted by avgTime (asc)

Tab 3: XP Leaderboard
- Rank | Username | Total XP | Level | Streak
- Sorted by XP (desc)

Tab 4: Zen Rich Leaderboard
- Rank | Username | Zen Coins | Items Owned
- Sorted by Zen (desc)

Filters:
- All Time | This Week | Today
- Friends Only toggle
- Search user

Real-time updates via WebSocket:
- When user completes question, leaderboard updates instantly
- Notification: "John just completed Q35 and is now #3!"

7.5 Shop Page (shop.html) - Protected
--------------------------------------
Header:
- "🛒 Zen Shop" | Your Zen: 2,450
- Search bar
- Filter by category

Categories:
- 🌟 Featured
- 🎨 Name Styles
- 🖼️ Avatar Frames
- ✨ Effects
- 💬 Chat Extras
- ⏳ Limited Time

Item Cards (grid layout):
┌─────────────────┐
│ 👑 CROWN        │
│ Price: 10,000   │
│ Rarity: Mythic  │
│ [BUY]           │
└─────────────────┘

- Owned items have "OWNED" badge
- Locked items show requirement: "Need 50 questions"
- Purchase confirmation modal

Inventory Section:
- "Your Items"
- Equip/Unequip buttons
- Preview how name looks

7.6 Chat Page (chat.html) - Protected
--------------------------------------

┌─────────────────────────────────────┐
│ 🌍 GLOBAL CHAT 42 online │
├─────────────────────────────────────┤
│ [👑] PythonMaster: Anyone on Q42? │
│ │
│ [✨] CodeWizard: @PythonMaster │
│ thanks for the hint! │
│ │
│ ⚠️ SYSTEM: Alex just reached Q50! │
│ │
│ [💬] Type message... [SEND] │
├─────────────────────────────────────┤
│ No copy-paste • 5 msg/10s • Be nice│
└─────────────────────────────────────┘
text


Features:
- Real-time messages with styled usernames
- Mentions (@username) highlight in pink
- System messages for milestones
- Typing indicator
- Rate limiting (5 messages/10s)
- Profanity filter
- Report button on messages

7.7 Profile Page (profile.html) - Protected
--------------------------------------------
Layout:

Left Column:
- Avatar with equipped frame
- Username with style
- Title
- Bio
- Join date
- Social links
- [Edit Profile] button

Middle Column:
- Stats grid:
  Questions: 42/100
  XP: 1,250 (Level 5)
  Zen: 2,450
  Streak: 3 days
  Avg Time: 85s
  Total Time: 36h

- Progress chart (line chart: questions over time)
- Recent activity feed

Right Column:
- Achievements/Badges grid
- Inventory showcase
- Friend comparison

7.8 Admin Page (admin.html) - Founder Only
-------------------------------------------
- View all users
- Ban/Unban users
- Add/edit questions
- View reports
- System stats

-------------------------------------------------------------------------------

8. GAMIFICATION SYSTEM
----------------------

8.1 XP System:
--------------
Base XP = Question Number × 10
Time Bonus = (Optimal Time / Your Time) × 50 (capped at 100)
First Attempt Bonus = 50 if solved in first attempt
Streak Bonus = Streak × 10 (max 100)
Total XP = Base + Time Bonus + First Attempt Bonus + Streak Bonus

Levels: Level = floor(XP / 250) + 1
Each level: +10 Zen reward

8.2 Zen Coin System:
--------------------
Earning:
- Active time: Every 30 minutes on platform = random 10-100 Zen
- XP milestones: Every 500 XP = 50 Zen
- First solve of day = 20 Zen
- Referral: Friend joins = 200 Zen
- Daily login: Streak day 7 = 100 Zen bonus

Active time tracking:
- Mouse movement, keypresses, clicks = active
- AFK detection after 5 min inactivity
- Progress bar: "XX min until next Zen drop"
- Notification on drop: "✨ You earned 45 Zen!"

8.3 Achievements:
-----------------
[
  {
    "id": "first_steps",
    "name": "First Steps",
    "desc": "Complete Question 1",
    "xp": 100,
    "zen": 50
  },
  {
    "id": "speed_demon_10",
    "name": "Speed Demon",
    "desc": "10 questions under 2 min",
    "xp": 500,
    "zen": 200
  },
  {
    "id": "streak_7",
    "name": "Weekly Warrior",
    "desc": "7 day streak",
    "xp": 1000,
    "zen": 300
  },
  {
    "id": "streak_30",
    "name": "Zen Master",
    "desc": "30 day streak",
    "xp": 5000,
    "zen": 2000
  },
  {
    "id": "perfectionist_50",
    "name": "Perfectionist",
    "desc": "50 first-attempt solves",
    "xp": 2000,
    "zen": 500
  },
  {
    "id": "social_butterfly",
    "name": "Social Butterfly",
    "desc": "100 chat messages",
    "xp": 300,
    "zen": 150
  },
  {
    "id": "rich_kid",
    "name": "Rich Kid",
    "desc": "Earn 5000 Zen",
    "xp": 1000,
    "zen": 0
  },
  {
    "id": "completionist",
    "name": "Python God",
    "desc": "Complete all 100 questions",
    "xp": 10000,
    "zen": 5000
  }
]

-------------------------------------------------------------------------------

9. SHOP & CUSTOMIZATIONS
------------------------

9.1 Name Styles:
----------------
.silver-name { color: #C0C0C0; text-shadow: 0 0 5px silver; }
.gold-name { color: #FFD700; text-shadow: 0 0 10px gold; animation: shimmer 2s infinite; }
.rainbow-name { animation: rainbow 3s linear infinite; }
.neon-pink { color: #FF1493; text-shadow: 0 0 10px #FF1493, 0 0 20px #FF1493; }
.flame-name { animation: flame 1s infinite; }

9.2 Avatar Frames:
------------------
.frame-neon { border: 3px solid #FF1493; box-shadow: 0 0 15px #FF1493; }
.frame-gold { border: 3px solid gold; box-shadow: 0 0 15px gold; }
.frame-royal { border: 3px solid purple; box-shadow: 0 0 15px purple; animation: pulse 2s infinite; }

9.3 Effects:
------------
.crown::after { content: " 👑"; }
.fire-effect { animation: fire 1s infinite; }
.sparkles { background: radial-gradient(circle, white, transparent); }

9.4 Chat Extras:
----------------
.vip-border { border-left: 3px solid gold; padding-left: 10px; }
.custom-title { font-size: 0.8em; color: #888; margin-top: -5px; }

-------------------------------------------------------------------------------

10. REAL-TIME CHAT
------------------

10.1 Server (chatServer.js):
----------------------------
const io = require('socket.io')(server);
const chatMessages = []; // In-memory buffer (last 100)

io.on('connection', (socket) => {
    // Get user data from JWT
    const user = getUserFromSocket(socket);
    
    // Send last 50 messages
    socket.emit('chat_history', chatMessages.slice(-50));
    
    // Broadcast online count
    io.emit('online_count', io.engine.clientsCount);
    
    // Handle new message
    socket.on('send_message', (data) => {
        // Rate limiting (per user)
        const now = Date.now();
        const userMessages = user.messageTimestamps.filter(t => now - t < 10000);
        if (userMessages.length >= 5) {
            socket.emit('error', 'Rate limit exceeded');
            return;
        }
        
        // Profanity filter (simple)
        const filtered = filterProfanity(data.message);
        
        const message = {
            username: user.username,
            message: filtered,
            timestamp: now,
            nameStyle: user.equipped.nameStyle,
            frame: user.equipped.frame,
            title: user.equipped.title,
            isVip: user.inventory.owned.includes('vip_border')
        };
        
        chatMessages.push(message);
        if (chatMessages.length > 100) chatMessages.shift();
        
        io.emit('new_message', message);
    });
    
    // Typing indicator
    socket.on('typing', () => {
        socket.broadcast.emit('user_typing', user.username);
    });
    
    socket.on('disconnect', () => {
        io.emit('online_count', io.engine.clientsCount);
    });
});

10.2 Client (chat.js):
----------------------
const socket = io();
const chatBox = document.getElementById('chatMessages');
const input = document.getElementById('chatInput');

socket.on('new_message', (msg) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.nameStyle}`;
    messageDiv.innerHTML = `
        <span class="avatar-frame ${msg.frame}">
            <img src="avatar.png">
        </span>
        <span class="username ${msg.nameStyle}">${msg.username}</span>
        ${msg.title ? `<span class="title">${msg.title}</span>` : ''}
        <span class="text">${msg.message}</span>
        <span class="time">${formatTime(msg.timestamp)}</span>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});

input.addEventListener('keypress', () => {
    socket.emit('typing');
});

document.getElementById('sendChat').addEventListener('click', () => {
    if (input.value.trim()) {
        socket.emit('send_message', { message: input.value });
        input.value = '';
    }
});

-------------------------------------------------------------------------------

11. COMPILER (PYODIDE)
----------------------

11.1 Setup in practice.html:
----------------------------
<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>

11.2 compiler.js:
-----------------
let pyodide;

async function initPyodide() {
    pyodide = await loadPyodide();
    console.log('Pyodide ready');
}

// Block dangerous imports
function validateCode(code) {
    const blocked = ['os', 'sys', 'subprocess', 'socket', 'requests', 
                     'urllib', 'http', 'ftplib', 'telnetlib', 'ctypes'];
    for (const imp of blocked) {
        if (code.includes(`import ${imp}`) || code.includes(`from ${imp}`)) {
            return { valid: false, message: `Import '${imp}' not allowed` };
        }
    }
    return { valid: true };
}

async function runCode(code, testCases) {
    if (!validateCode(code).valid) {
        return { error: 'Invalid imports detected' };
    }
    
    try {
        await pyodide.runPythonAsync(code);
        
        const results = [];
        for (const test of testCases) {
            // Redirect stdout
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
            `);
            
            // Run with test input
            if (test.input) {
                await pyodide.runPythonAsync(`print(${test.input})`);
            } else {
                await pyodide.runPythonAsync(code);
            }
            
            const output = pyodide.runPython('sys.stdout.getvalue()');
            const passed = output.trim() === test.expectedOutput.trim();
            results.push({ passed, output, expected: test.expectedOutput });
        }
        
        return { success: true, results };
    } catch (error) {
        return { error: error.message };
    }
}

11.3 Test Cases Structure:
--------------------------
For Question 1: "Print your name"
testCases = [
    {
        "input": "",
        "expectedOutput": "John\n",
        "type": "exact"
    }
]

For Question 5: "Add two numbers"
testCases = [
    {
        "input": "2, 3",
        "expectedOutput": "5\n"
    },
    {
        "input": "10, 20",
        "expectedOutput": "30\n"
    }
]

-------------------------------------------------------------------------------

12. ANTI-COPY-PASTE & BAN SYSTEM
--------------------------------

12.1 Prevention (multiple layers):
----------------------------------
// Disable keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        trackCopyAttempt();
        return false;
    }
});

// Disable context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    trackCopyAttempt();
});

// Disable paste in CodeMirror
editor.on('paste', () => {
    trackCopyAttempt();
});

// Disable drag and drop
document.addEventListener('dragstart', (e) => e.preventDefault());

12.2 Attempt Tracking:
----------------------
let copyAttempts = parseInt(localStorage.getItem('copyAttempts')) || 0;

function trackCopyAttempt() {
    copyAttempts++;
    localStorage.setItem('copyAttempts', copyAttempts);
    
    const remaining = 5 - copyAttempts;
    
    if (copyAttempts >= 5) {
        banUser('permanent', 'Multiple copy-paste attempts');
        return;
    }
    
    showWarning(`⚠️ Copy-paste is not allowed!
                 Attempt ${copyAttempts}/5
                 ${remaining} attempts remaining
                 Next attempt will result in BAN!`);
}

12.3 Ban System:
----------------
async function banUser(type, reason) {
    const userEmail = getCurrentUserEmail();
    const ip = await getUserIP();
    
    const banData = {
        email: userEmail,
        ip: ip,
        reason: reason,
        bannedAt: new Date().toISOString(),
        expires: type === 'temporary' ? Date.now() + 86400000 : null
    };
    
    // Save to banned.json via API
    await fetch('/api/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banData)
    });
    
    // Clear session and redirect
    localStorage.clear();
    window.location.href = '/banned.html';
}

12.4 Banned Page:
-----------------
╔══════════════════════════════════════╗
║         ACCESS DENIED                ║
╠══════════════════════════════════════╣
║ You have been banned from ZenPy.     ║
║ Reason: Multiple copy-paste attempts ║
║ Expires: Never (Permanent)           ║
║                                      ║
║ Contact: admin@zenpy.com             ║
╚══════════════════════════════════════╝

-------------------------------------------------------------------------------

13. LEADERBOARDS (4 TYPES)
---------------------------

13.1 Progression Leaderboard:
-----------------------------
SELECT username, equipped.nameStyle, currentQuestion, totalTime
FROM users JOIN progress ON users.email = progress.email
ORDER BY progress.currentQuestion DESC, progress.totalTime ASC
LIMIT 50

13.2 Speed Leaderboard:
-----------------------
SELECT username, equipped.nameStyle, AVG(q.time) as avgTime, COUNT(*) as completed
FROM users JOIN progress ON users.email = progress.email,
     JSON_EACH(progress.questionTimes) as q
WHERE completed >= 10
GROUP BY users.email
ORDER BY avgTime ASC
LIMIT 50

13.3 XP Leaderboard:
--------------------
SELECT username, equipped.nameStyle, xp, level, streak
FROM users
ORDER BY xp DESC
LIMIT 50

13.4 Zen Leaderboard:
---------------------
SELECT username, equipped.nameStyle, zen, 
       (SELECT COUNT(*) FROM json_each(inventory.owned)) as items
FROM users
ORDER BY zen DESC
LIMIT 50

13.5 Real-time Updates:
-----------------------
// Server
io.on('question_completed', (userData) => {
    // Recalculate rankings
    const newRankings = calculateLeaderboards();
    io.emit('leaderboard_update', newRankings);
});

// Client
socket.on('leaderboard_update', (data) => {
    updateLeaderboardTable(data);
    if (data.newTop1) {
        showNotification(`👑 ${data.newTop1} is now #1!`);
    }
});

-------------------------------------------------------------------------------

14. ACTIVITY TRACKER
--------------------

14.1 activityTracker.js:
------------------------
class ActivityTracker {
    constructor(userEmail) {
        this.userEmail = userEmail;
        this.lastActive = Date.now();
        this.activeMinutes = 0;
        this.sessionStart = Date.now();
        this.interval = null;
        this.zenInterval = null;
    }
    
    start() {
        // Track user activity
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.ping());
        });
        
        // Check activity every minute
        this.interval = setInterval(() => this.checkActivity(), 60000);
        
        // Award Zen every 30 minutes
        this.zenInterval = setInterval(() => this.awardZen(), 1800000);
    }
    
    ping() {
        this.lastActive = Date.now();
    }
    
    checkActivity() {
        const inactive = (Date.now() - this.lastActive) / 1000;
        if (inactive < 300) { // Less than 5 min inactive
            this.activeMinutes++;
            this.updateServer();
        }
    }
    
    awardZen() {
        if (this.activeMinutes >= 15) { // Active for at least 15 of last 30 min
            const zenEarned = Math.floor(Math.random() * 91) + 10; // 10-100
            this.addZen(zenEarned);
            this.showNotification(`✨ You earned ${zenEarned} Zen coins!`);
        }
        this.activeMinutes = 0; // Reset counter
    }
    
    async updateServer() {
        await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: this.userEmail,
                activeMinutes: this.activeMinutes,
                timestamp: Date.now()
            })
        });
    }
}

-------------------------------------------------------------------------------

15. API ENDPOINTS
-----------------

15.1 Authentication:
--------------------
POST /api/signup
Body: { email, username, password }
Response: { success: true, message: "OTP sent" }

POST /api/verify-otp
Body: { email, otp }
Response: { success: true, token: "jwt_token" }

POST /api/login
Body: { email, password }
Response: { success: true, token: "jwt_token" }

POST /api/forgot-password
Body: { email }
Response: { success: true, message: "OTP generated" }

POST /api/reset-password
Body: { email, otp, newPassword }
Response: { success: true }

15.2 User Data:
---------------
GET /api/user/:email
Headers: Authorization: Bearer <token>
Response: { user: {...}, progress: {...} }

PUT /api/user/profile
Body: { username, bio, github, linkedin, image }
Response: { success: true }

GET /api/user/progress/:email
Response: { currentQuestion, questionTimes, averageTime }

15.3 Questions:
---------------
GET /api/questions
Response: [ { id, title, difficulty, description, ... } ]

GET /api/question/:id
Response: { id, title, description, testCases, hints, optimalTime }

POST /api/question/:id/submit
Body: { code, timeTaken }
Response: { success: true, passed: true, xpEarned, zenEarned, nextUnlocked }

15.4 Leaderboards:
------------------
GET /api/leaderboard/progression
Response: [ { rank, username, nameStyle, currentQuestion, totalTime } ]

GET /api/leaderboard/speed
Response: [ { rank, username, nameStyle, avgTime, completed } ]

GET /api/leaderboard/xp
Response: [ { rank, username, nameStyle, xp, level, streak } ]

GET /api/leaderboard/zen
Response: [ { rank, username, nameStyle, zen, items } ]

15.5 Shop:
----------
GET /api/shop/items
Response: [ { id, name, price, category, rarity, requirement } ]

POST /api/shop/buy
Body: { itemId }
Response: { success: true, zenRemaining, inventory }

POST /api/shop/equip
Body: { itemId, slot }
Response: { success: true, equipped }

15.6 Ban System:
----------------
POST /api/ban
Body: { email, ip, reason, expires }
Response: { success: true }

GET /api/check-ban/:email/:ip
Response: { banned: true/false, reason, expires }

-------------------------------------------------------------------------------

16. DEPLOYMENT STEPS (Render.com)
---------------------------------

Step 1: Prepare Project
------------------------
- Initialize npm: npm init -y
- Install dependencies: 
  npm install express socket.io bcrypt jsonwebtoken cors dotenv
- Create .gitignore (node_modules, data/*.json except sample data)

Step 2: Create server.js
------------------------
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
// ... other routes

// API endpoints
require('./server/authRoutes')(app, fs, bcrypt, jwt);
require('./server/userRoutes')(app, fs);
require('./server/leaderboardRoutes')(app, fs);

// Chat server
require('./server/chatServer')(io, fs);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));

Step 3: Create package.json scripts
------------------------------------
"scripts": {
  "start": "node server/server.js",
  "dev": "nodemon server/server.js"
}

Step 4: Push to GitHub
-----------------------
git init
git add .
git commit -m "ZenPy initial commit"
git remote add origin https://github.com/wruzi/zenpy.git
git push -u origin main

