// ============================================
// ZenPy - Question Routes
// GET /api/questions, /api/question/:id
// POST /api/question/:id/submit
// ============================================
const authMiddleware = require('./middleware/auth');

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;

    // ---- GET ALL QUESTIONS (list view) ----
    app.get('/api/questions', authMiddleware, (req, res) => {
        const questions = readJSON('questions.json');
        const progress = readJSON('progress.json');
        const userProgress = progress.find(p => p.email === req.user.email);
        const currentQ = userProgress ? userProgress.currentQuestion : 1;

        // Return basic info (no test cases or solutions)
        const questionList = questions.map(q => ({
            id: q.id,
            title: q.title,
            difficulty: q.difficulty,
            category: q.category,
            concepts: q.concepts,
            locked: q.id > currentQ,
            completed: userProgress ? userProgress.questionTimes.some(qt => qt.q === q.id) : false
        }));

        res.json({ success: true, questions: questionList, currentQuestion: currentQ });
    });

    // ---- GET SINGLE QUESTION ----
    app.get('/api/question/:id', authMiddleware, (req, res) => {
        const questionId = parseInt(req.params.id);
        const questions = readJSON('questions.json');
        const progress = readJSON('progress.json');
        const userProgress = progress.find(p => p.email === req.user.email);
        const currentQ = userProgress ? userProgress.currentQuestion : 1;

        // Check if question is unlocked
        if (questionId > currentQ) {
            return res.status(403).json({
                success: false,
                message: `You need to complete Question ${currentQ} first.`
            });
        }

        const question = questions.find(q => q.id === questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }

        // Don't send expected outputs to client for anti-cheat
        const safeQuestion = {
            id: question.id,
            title: question.title,
            description: question.description,
            difficulty: question.difficulty,
            category: question.category,
            initialCode: question.initialCode,
            hints: question.hints,
            optimalTime: question.optimalTime,
            concepts: question.concepts,
            xpBase: question.xpBase,
            subjective: question.subjective || false,
            testCaseCount: question.testCases.length,
            // Send test cases but mark which are visible
            visibleTests: question.testCases.filter(t => !t.hidden).map(t => {
                if (t.type === 'compile_only') return { type: 'compile_only', description: t.description };
                if (t.type === 'output_contains') return { type: 'output_contains', mustContain: t.mustContain, description: t.description };
                if (t.type === 'line_count') return { type: 'line_count', expectedLines: t.expectedLines, description: t.description };
                return { input: t.input, expectedOutput: t.expectedOutput };
            })
        };

        res.json({ success: true, question: safeQuestion });
    });

    // ---- SUBMIT SOLUTION ----
    app.post('/api/question/:id/submit', authMiddleware, (req, res) => {
        try {
            const questionId = parseInt(req.params.id);
            const { results, timeTaken } = req.body;
            // results = array of { passed: boolean } from client-side Pyodide execution

            const questions = readJSON('questions.json');
            const question = questions.find(q => q.id === questionId);
            if (!question) {
                return res.status(404).json({ success: false, message: 'Question not found.' });
            }

            const progress = readJSON('progress.json');
            const users = readJSON('users.json');
            const userProgress = progress.find(p => p.email === req.user.email);
            const user = users.find(u => u.email === req.user.email);

            if (!userProgress || !user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Check all tests passed
            const allPassed = results && results.every(r => r.passed);
            if (!allPassed) {
                return res.json({
                    success: true,
                    passed: false,
                    message: 'Some test cases failed. Keep trying!'
                });
            }

            // Check if already completed
            const alreadyCompleted = userProgress.questionTimes.some(qt => qt.q === questionId);
            
            // Calculate XP
            const baseXP = questionId * 10;
            const timeBonus = Math.min(100, Math.round((question.optimalTime / Math.max(timeTaken, 1)) * 50));
            const isFirstAttempt = !alreadyCompleted;
            const firstAttemptBonus = isFirstAttempt ? 50 : 0;
            const streakBonus = Math.min(100, (user.streak || 0) * 10);
            const totalXP = baseXP + timeBonus + firstAttemptBonus + streakBonus;

            // Zen rewards
            let zenEarned = 0;
            // First solve of day
            const today = new Date().toDateString();
            const solvedToday = userProgress.questionTimes.some(qt => {
                return new Date(qt.timestamp || 0).toDateString() === today;
            });
            if (!solvedToday) zenEarned += 20;

            // Update progress
            if (!alreadyCompleted) {
                const existingAttempt = userProgress.questionTimes.find(qt => qt.q === questionId);
                if (existingAttempt) {
                    existingAttempt.attempts++;
                    existingAttempt.time = Math.min(existingAttempt.time, timeTaken);
                } else {
                    userProgress.questionTimes.push({
                        q: questionId,
                        time: timeTaken,
                        attempts: 1,
                        xpEarned: totalXP,
                        timestamp: Date.now()
                    });
                }

                // Move to next question
                if (questionId >= userProgress.currentQuestion) {
                    userProgress.currentQuestion = questionId + 1;
                }

                // Update totals
                userProgress.totalTime = userProgress.questionTimes.reduce((s, qt) => s + qt.time, 0);
                userProgress.averageTime = userProgress.totalTime / userProgress.questionTimes.length;

                // Check completion (all 100 done)
                if (userProgress.questionTimes.length >= 100) {
                    userProgress.completed = true;
                    userProgress.completedDate = new Date().toISOString();
                }
            }

            // Update user XP and Zen
            user.xp += totalXP;
            user.zen += zenEarned;
            user.level = Math.floor(user.xp / 250) + 1;

            // XP milestone Zen bonus (every 500 XP)
            const prevMilestone = Math.floor((user.xp - totalXP) / 500);
            const newMilestone = Math.floor(user.xp / 500);
            if (newMilestone > prevMilestone) {
                const milestoneZen = (newMilestone - prevMilestone) * 50;
                user.zen += milestoneZen;
                zenEarned += milestoneZen;
            }

            // Check achievements
            const newAchievements = [];

            // First Steps
            if (questionId === 1 && !user.achievements.includes('first_steps')) {
                user.achievements.push('first_steps');
                user.xp += 100;
                user.zen += 50;
                newAchievements.push({ id: 'first_steps', name: 'First Steps', xp: 100, zen: 50 });
            }

            // Speed Demon (10 questions under 2 min)
            const fastSolves = userProgress.questionTimes.filter(qt => qt.time < 120).length;
            if (fastSolves >= 10 && !user.achievements.includes('speed_demon_10')) {
                user.achievements.push('speed_demon_10');
                user.xp += 500;
                user.zen += 200;
                newAchievements.push({ id: 'speed_demon_10', name: 'Speed Demon', xp: 500, zen: 200 });
            }

            // Perfectionist (50 first-attempt solves)
            const firstAttemptSolves = userProgress.questionTimes.filter(qt => qt.attempts === 1).length;
            if (firstAttemptSolves >= 50 && !user.achievements.includes('perfectionist_50')) {
                user.achievements.push('perfectionist_50');
                user.xp += 2000;
                user.zen += 500;
                newAchievements.push({ id: 'perfectionist_50', name: 'Perfectionist', xp: 2000, zen: 500 });
            }

            // Weekly Warrior (7 day streak)
            if (user.streak >= 7 && !user.achievements.includes('streak_7')) {
                user.achievements.push('streak_7');
                user.xp += 1000;
                user.zen += 300;
                newAchievements.push({ id: 'streak_7', name: 'Weekly Warrior', xp: 1000, zen: 300 });
            }

            // Zen Master (30 day streak)
            if (user.streak >= 30 && !user.achievements.includes('streak_30')) {
                user.achievements.push('streak_30');
                user.xp += 5000;
                user.zen += 2000;
                newAchievements.push({ id: 'streak_30', name: 'Zen Master', xp: 5000, zen: 2000 });
            }

            // Python God (100 questions)
            if (userProgress.questionTimes.length >= 100 && !user.achievements.includes('completionist')) {
                user.achievements.push('completionist');
                user.xp += 10000;
                user.zen += 5000;
                newAchievements.push({ id: 'completionist', name: 'Python God', xp: 10000, zen: 5000 });
            }

            // Recalculate level after achievement bonuses
            user.level = Math.floor(user.xp / 250) + 1;

            // Save data
            writeJSON('progress.json', progress);
            writeJSON('users.json', users);

            res.json({
                success: true,
                passed: true,
                message: alreadyCompleted ? 'Question solved again!' : 'Question solved! 🎉',
                xpEarned: totalXP,
                zenEarned,
                xpBreakdown: {
                    base: baseXP,
                    timeBonus,
                    firstAttemptBonus,
                    streakBonus
                },
                totalXP: user.xp,
                totalZen: user.zen,
                level: user.level,
                nextQuestion: userProgress.currentQuestion,
                newAchievements,
                completed: userProgress.completed
            });

        } catch (error) {
            console.error('Submit error:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    });

    // ---- GET TEST CASES (for Pyodide execution) ----
    app.get('/api/question/:id/tests', authMiddleware, (req, res) => {
        const questionId = parseInt(req.params.id);
        const questions = readJSON('questions.json');
        const question = questions.find(q => q.id === questionId);

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }

        res.json({
            success: true,
            testCases: question.testCases
        });
    });
};
