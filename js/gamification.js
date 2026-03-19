// ============================================
// ZenPy - Gamification JS
// XP system, Zen coins, Achievements
// ============================================

// XP Calculation (mirrored from server, used for display prediction)
function calculateXP(questionId, timeTaken, optimalTime, isFirstAttempt, streak) {
    const baseXP = questionId * 10;
    const timeBonus = Math.min(100, Math.round((optimalTime / Math.max(timeTaken, 1)) * 50));
    const firstAttemptBonus = isFirstAttempt ? 50 : 0;
    const streakBonus = Math.min(100, streak * 10);
    return {
        base: baseXP,
        timeBonus,
        firstAttemptBonus,
        streakBonus,
        total: baseXP + timeBonus + firstAttemptBonus + streakBonus
    };
}

// Level from XP
function levelFromXP(xp) {
    return Math.floor(xp / 250) + 1;
}

// XP to next level
function xpToNextLevel(xp) {
    const currentLevel = levelFromXP(xp);
    return currentLevel * 250 - xp;
}

// Zen earning from active time
function calculateZenEarning(activeMinutes) {
    if (activeMinutes >= 15) {
        return Math.floor(Math.random() * 91) + 10; // 10-100
    }
    return 0;
}
