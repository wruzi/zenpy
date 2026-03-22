// ============================================
// ZenPy - Question Routes
// GET /api/questions, /api/question/:id
// POST /api/question/:id/submit
// ============================================
const authMiddleware = require('./middleware/auth');

module.exports = function(app) {
    const { readJSON, writeJSON } = app.locals;
    const normalizeOutput = (text) => String(text || '').replace(/\r\n/g, '\n').trim();

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

        res.json({ success: true, questions: questionList, currentQuestion: currentQ, totalQuestions: questions.length });
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
            // results = array of raw execution outputs/errors from client-side Pyodide execution

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

            const submittedResults = Array.isArray(results) ? results : [];
            const expectedTests = question.testCases || [];
            if (submittedResults.length !== expectedTests.length) {
                return res.json({
                    success: true,
                    passed: false,
                    message: 'Invalid test submission. Please retry.'
                });
            }

            const allPassed = expectedTests.every((test, index) => {
                const result = submittedResults[index] || {};
                const output = normalizeOutput(result.output);
                const hasError = !!result.error;

                if (test.type === 'compile_only') {
                    return !hasError;
                }

                if (hasError) {
                    return false;
                }

                if (test.type === 'output_contains') {
                    return output.includes(String(test.mustContain || '').trim());
                }

                if (test.type === 'line_count') {
                    const lineCount = output ? output.split('\n').filter(Boolean).length : 0;
                    return lineCount === Number(test.expectedLines || 0);
                }

                return output === normalizeOutput(test.expectedOutput);
            });

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

                const solvedCount = userProgress.questionTimes.length;

                // Solve milestone bonus: +1000 Zen every 10 first-time solves
                if (solvedCount > 0 && solvedCount % 10 === 0) {
                    user.zen += 1000;
                    zenEarned += 1000;
                }

                // Check completion (all 250 done)
                if (solvedCount >= 250) {
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

            // Nitro Solver (25 questions under 2 min)
            if (fastSolves >= 25 && !user.achievements.includes('nitro_solver_25')) {
                user.achievements.push('nitro_solver_25');
                user.xp += 1400;
                user.zen += 500;
                newAchievements.push({ id: 'nitro_solver_25', name: 'Nitro Solver', xp: 1400, zen: 500 });
            }

            // Perfectionist (50 first-attempt solves)
            const firstAttemptSolves = userProgress.questionTimes.filter(qt => qt.attempts === 1).length;
            if (firstAttemptSolves >= 50 && !user.achievements.includes('perfectionist_50')) {
                user.achievements.push('perfectionist_50');
                user.xp += 2000;
                user.zen += 500;
                newAchievements.push({ id: 'perfectionist_50', name: 'Perfectionist', xp: 2000, zen: 500 });
            }

            // One-Shot Legend (100 first-attempt solves)
            if (firstAttemptSolves >= 100 && !user.achievements.includes('oneshot_legend_100')) {
                user.achievements.push('oneshot_legend_100');
                user.xp += 4500;
                user.zen += 1200;
                newAchievements.push({ id: 'oneshot_legend_100', name: 'One-Shot Legend', xp: 4500, zen: 1200 });
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

            // Iron Discipline (60 day streak)
            if (user.streak >= 60 && !user.achievements.includes('streak_60')) {
                user.achievements.push('streak_60');
                user.xp += 8000;
                user.zen += 3500;
                newAchievements.push({ id: 'streak_60', name: 'Iron Discipline', xp: 8000, zen: 3500 });
            }

            // Python God (100 questions)
            if (userProgress.questionTimes.length >= 100 && !user.achievements.includes('completionist')) {
                user.achievements.push('completionist');
                user.xp += 10000;
                user.zen += 5000;
                newAchievements.push({ id: 'completionist', name: 'Python God', xp: 10000, zen: 5000 });
            }

            // GPT Apprentice (150 questions)
            if (userProgress.questionTimes.length >= 150 && !user.achievements.includes('gpt_apprentice_150')) {
                user.achievements.push('gpt_apprentice_150');
                user.xp += 4000;
                user.zen += 1200;
                newAchievements.push({ id: 'gpt_apprentice_150', name: 'GPT Apprentice', xp: 4000, zen: 1200 });
            }

            // GPT Engineer (200 questions)
            if (userProgress.questionTimes.length >= 200 && !user.achievements.includes('gpt_engineer_200')) {
                user.achievements.push('gpt_engineer_200');
                user.xp += 7000;
                user.zen += 2200;
                newAchievements.push({ id: 'gpt_engineer_200', name: 'GPT Engineer', xp: 7000, zen: 2200 });
            }

            // Neural Architect (220 questions)
            if (userProgress.questionTimes.length >= 220 && !user.achievements.includes('neural_architect_220')) {
                user.achievements.push('neural_architect_220');
                user.xp += 9000;
                user.zen += 3000;
                newAchievements.push({ id: 'neural_architect_220', name: 'Neural Architect', xp: 9000, zen: 3000 });
            }

            // ZenPy Grandmaster (250 questions)
            if (userProgress.questionTimes.length >= 250 && !user.achievements.includes('zenpy_grandmaster_250')) {
                user.achievements.push('zenpy_grandmaster_250');
                user.xp += 15000;
                user.zen += 6000;
                newAchievements.push({ id: 'zenpy_grandmaster_250', name: 'ZenPy Grandmaster', xp: 15000, zen: 6000 });
            }

            // XP Titan (50,000 XP)
            if (user.xp >= 50000 && !user.achievements.includes('xp_titan_50k')) {
                user.achievements.push('xp_titan_50k');
                user.xp += 3000;
                user.zen += 1200;
                newAchievements.push({ id: 'xp_titan_50k', name: 'XP Titan', xp: 3000, zen: 1200 });
            }

            // Zen Vault (20,000 Zen)
            if (user.zen >= 20000 && !user.achievements.includes('zen_vault_20k')) {
                user.achievements.push('zen_vault_20k');
                user.xp += 2200;
                user.zen += 800;
                newAchievements.push({ id: 'zen_vault_20k', name: 'Zen Vault', xp: 2200, zen: 800 });
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
            testCases: (question.testCases || []).map(test => {
                if (test.type === 'compile_only') {
                    return { type: 'compile_only', description: test.description || 'Code must compile and run.' };
                }
                if (test.type === 'output_contains') {
                    return { type: 'output_contains', input: test.input || '', mustContain: test.mustContain || '', hidden: !!test.hidden };
                }
                if (test.type === 'line_count') {
                    return { type: 'line_count', input: test.input || '', expectedLines: test.expectedLines || 0, hidden: !!test.hidden };
                }
                return { input: test.input || '', hidden: !!test.hidden };
            })
        });
    });
};
