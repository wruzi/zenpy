// ============================================
// ZenPy - Dashboard JS
// ============================================

if (!requireAuth()) { /* redirected */ }

let dashboardData = null;
let onboardingAvatarUploaded = false;
let onboardingTermsVisited = false;
let onboardingHandlersBound = false;
const TOTAL_QUESTIONS = 250;

async function loadDashboard() {
    const data = await setupSidebar();
    if (!data) return;
    dashboardData = data;
    
    const { user, progress } = data;
    
    // Welcome message
    document.getElementById('welcomeMsg').textContent = `Welcome back, ${user.username}`;
    document.getElementById('currentQuestionMsg').textContent = 
        `Currently on Question ${progress?.currentQuestion || 1} of ${TOTAL_QUESTIONS}`;

    // Top stats
    document.getElementById('topXP').textContent = formatNumber(user.xp);
    document.getElementById('topZen').textContent = formatNumber(user.zen);
    document.getElementById('topStreak').textContent = user.streak;

    // Stats cards
    document.getElementById('statCurrentQ').textContent = `${(progress?.currentQuestion - 1) || 0}/${TOTAL_QUESTIONS}`;
    document.getElementById('statTotalXP').textContent = formatNumber(user.xp);
    document.getElementById('statZen').textContent = formatNumber(user.zen);

    // Level progress
    const level = user.level;
    const xpInLevel = user.xp % 250;
    const xpPercent = (xpInLevel / 250) * 100;
    
    document.getElementById('levelBadge').textContent = `Level ${level}`;
    document.getElementById('levelValue').textContent = level;
    document.getElementById('xpProgressBar').style.width = xpPercent + '%';
    document.getElementById('xpText').textContent = `${xpInLevel} / 250 XP to next level`;

    // Circular progress
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (xpPercent / 100) * circumference;
    document.getElementById('levelCircle').style.strokeDashoffset = offset;

    // Get rank
    try {
        const lbData = await apiCall('/api/leaderboard/xp');
        if (lbData?.success) {
            const rank = lbData.leaderboard.findIndex(l => l.username === user.username) + 1;
            document.getElementById('statRank').textContent = rank > 0 ? `#${rank}` : '-';
        }
    } catch(e) { }

    // Achievements
    renderDashboardAchievements(user.achievements);

    // Charts
    if (progress?.questionTimes?.length > 0) {
        createQuestionTimesChart(progress.questionTimes);
        createPerformanceChart(progress, user);
    }

    // Quick Facts
    renderQuickFacts(user, progress);
    renderAdvancedAnalytics(user, progress);

    // Load Daily Quiz
    loadDailyQuiz();

    initializeOnboarding(user);
}

function isDefaultAvatar(image) {
    return !image || image === 'default-avatar.png' || image === 'default-avatar.svg';
}

function initializeOnboarding(user) {
    if (!user || user.profileSetupCompleted !== false) return;

    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) return;

    const usernameInput = document.getElementById('onboardUsername');
    const githubInput = document.getElementById('onboardGithub');
    const instagramInput = document.getElementById('onboardInstagram');
    const twitterInput = document.getElementById('onboardTwitter');
    const avatarStatus = document.getElementById('onboardAvatarStatus');

    if (usernameInput) usernameInput.value = user.username || '';
    if (githubInput) githubInput.value = socialHandleFromValue(user.github && user.github !== 'linked' ? user.github : '');
    if (instagramInput) instagramInput.value = socialHandleFromValue(user.instagram || '');
    if (twitterInput) twitterInput.value = socialHandleFromValue(user.twitter || '');

    onboardingAvatarUploaded = !isDefaultAvatar(user.image) && !String(user.image || '').startsWith('http');
    onboardingTermsVisited = false;

    if (avatarStatus) {
        avatarStatus.textContent = onboardingAvatarUploaded
            ? 'Avatar already uploaded.'
            : 'Upload an avatar to continue.';
        avatarStatus.style.color = onboardingAvatarUploaded ? 'var(--success)' : 'var(--text-muted)';
    }

    document.body.classList.add('onboarding-active');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    bindOnboardingHandlers();
}

function bindOnboardingHandlers() {
    if (onboardingHandlersBound) return;

    const avatarInput = document.getElementById('onboardAvatar');
    const submitButton = document.getElementById('onboardSubmit');
    const termsLink = document.getElementById('onboardingTermsLink');

    if (avatarInput) {
        avatarInput.addEventListener('change', () => {
            uploadOnboardingAvatar(avatarInput.files?.[0]);
        });
    }

    if (termsLink) {
        termsLink.addEventListener('click', () => {
            onboardingTermsVisited = true;
        });
    }

    if (submitButton) {
        submitButton.addEventListener('click', completeOnboarding);
    }

    onboardingHandlersBound = true;
}

async function uploadOnboardingAvatar(file) {
    const avatarStatus = document.getElementById('onboardAvatarStatus');
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('Avatar must be 2MB or smaller.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    if (avatarStatus) {
        avatarStatus.textContent = 'Uploading avatar...';
        avatarStatus.style.color = 'var(--info)';
    }

    try {
        const res = await fetch('/api/upload/avatar', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            body: formData
        });
        const data = await res.json();

        if (!data.success) {
            showToast(data.message || 'Avatar upload failed.', 'error');
            if (avatarStatus) {
                avatarStatus.textContent = 'Upload failed. Try again.';
                avatarStatus.style.color = 'var(--error)';
            }
            return;
        }

        onboardingAvatarUploaded = true;
        showToast('Avatar uploaded.', 'success');

        if (avatarStatus) {
            avatarStatus.textContent = 'Avatar uploaded successfully.';
            avatarStatus.style.color = 'var(--success)';
        }
    } catch (error) {
        showToast('Network error while uploading avatar.', 'error');
        if (avatarStatus) {
            avatarStatus.textContent = 'Upload failed. Try again.';
            avatarStatus.style.color = 'var(--error)';
        }
    }
}

async function completeOnboarding() {
    const usernameInput = document.getElementById('onboardUsername');
    const githubInput = document.getElementById('onboardGithub');
    const instagramInput = document.getElementById('onboardInstagram');
    const twitterInput = document.getElementById('onboardTwitter');
    const termsCheckbox = document.getElementById('onboardTermsCheck');
    const submitButton = document.getElementById('onboardSubmit');

    const username = String(usernameInput?.value || '').trim();
    if (username.length < 3 || username.length > 24) {
        showToast('Username must be 3-24 characters.', 'error');
        return;
    }

    // Avatar and terms are optional; username is mandatory only.
    // We still encourage users to upload an avatar and read terms, but don't block progression.

    // No blocking checks for avatar or terms.

    if (submitButton) submitButton.disabled = true;

    try {
        const res = await apiCall('/api/user/complete-onboarding', {
            method: 'POST',
            body: JSON.stringify({
                username,
                github: buildSocialLink('github', githubInput?.value || ''),
                instagram: buildSocialLink('instagram', instagramInput?.value || ''),
                twitter: buildSocialLink('twitter', twitterInput?.value || ''),
                termsAccepted: true
            })
        });

        if (!res?.success) {
            showToast(res?.message || 'Could not complete setup.', 'error');
            if (submitButton) submitButton.disabled = false;
            return;
        }

        showToast('Profile setup completed. Welcome!', 'success');
        window.location.reload();
    } catch (error) {
        showToast('Network error while completing setup.', 'error');
        if (submitButton) submitButton.disabled = false;
    }
}

function renderDashboardAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    const allAchievements = [
        { id: 'first_steps', name: 'First Steps', desc: 'Complete Q1', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' },
        { id: 'speed_demon_10', name: 'Speed Demon', desc: '10 fast solves', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
        { id: 'streak_7', name: 'Weekly Warrior', desc: '7 day streak', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="2"><path d="M12 22c-4.97 0-9-2.69-9-6s2-6.5 4-9c0 3.5 2 5 4 6.5 2-1.5 4-3 4-6.5 2 2.5 4 5 4 9s-4.03 6-7 6z"/></svg>' },
        { id: 'streak_30', name: 'Zen Master', desc: '30 day streak', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#9400D3" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
        { id: 'perfectionist_50', name: 'Perfectionist', desc: '50 first-attempt', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
        { id: 'social_butterfly', name: 'Social Butterfly', desc: '100 messages', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#FF1493" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' },
        { id: 'rich_kid', name: 'Rich Kid', desc: '5000 Zen earned', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3h-3m2-8v1m0 6v1"/></svg>' },
        { id: 'completionist', name: 'Python God', desc: '100 questions solved', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M2 18l3-11 5 5 2-7 2 7 5-5 3 11z"/><path d="M2 18h20"/></svg>' },
        { id: 'gpt_apprentice_150', name: 'GPT Apprentice', desc: '150 questions solved', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#00C2FF" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.2L18 21l-6-4-6 4 1.5-7.8L2 9h7z"/></svg>' },
        { id: 'gpt_engineer_200', name: 'GPT Engineer', desc: '200 questions solved', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>' },
        { id: 'zenpy_grandmaster_250', name: 'ZenPy Grandmaster', desc: 'All 250 solved', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M4 19h16"/><path d="M6 19l2-12 4 5 4-5 2 12"/></svg>' }
    ];

    const earned = allAchievements.filter(a => achievements.includes(a.id));
    const locked = allAchievements.filter(a => !achievements.includes(a.id));

    let html = '';

    if (earned.length > 0) {
        html += earned.map(a => `
            <div class="d-flex align-center gap-1 mb-1" style="padding:10px;border:1px solid var(--success);background:rgba(0,255,136,0.03);">
                <span style="width:28px;height:28px;display:flex;flex-shrink:0;">${a.svg}</span>
                <div>
                    <strong style="font-size:0.85rem;">${a.name}</strong>
                    <p class="text-muted text-sm" style="margin:0;">${a.desc}</p>
                </div>
                <span class="text-success text-sm" style="margin-left:auto;">Earned</span>
            </div>
        `).join('');
    }

    // Show locked achievements too (dimmed)
    html += locked.map(a => `
        <div class="d-flex align-center gap-1 mb-1" style="padding:10px;border:1px dashed var(--border);opacity:0.4;">
            <span style="width:28px;height:28px;display:flex;flex-shrink:0;">${a.svg}</span>
            <div>
                <strong style="font-size:0.85rem;">${a.name}</strong>
                <p class="text-muted text-sm" style="margin:0;">${a.desc}</p>
            </div>
            <span class="text-muted text-sm" style="margin-left:auto;">Locked</span>
        </div>
    `).join('');

    container.innerHTML = html;
}

function renderQuickFacts(user, progress) {
    const factsEl = document.getElementById('quickFacts');
    if (!factsEl) return;

    const solved = (progress?.currentQuestion - 1) || 0;
    const avgTime = progress?.averageTime ? Math.round(progress.averageTime) : 0;
    const times = (progress?.questionTimes || []).map(qt => Number(qt.time) || 0).filter(Boolean);
    const fastest = times.length > 0 ? Math.min(...times) : 0;
    const totalTime = times.reduce((sum, value) => sum + value, 0);

    factsEl.innerHTML = `
        <div class="d-flex align-center gap-1 mb-1" style="padding:8px;border:1px solid var(--border);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="text-sm">Total coding time: <strong>${formatTime(totalTime)}</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:8px;border:1px solid var(--border);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span class="text-sm">Average solve time: <strong>${avgTime ? avgTime + 's' : 'N/A'}</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:8px;border:1px solid var(--border);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span class="text-sm">Fastest solve: <strong>${fastest ? fastest + 's' : 'N/A'}</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:8px;border:1px solid var(--border);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2"><rect x="3" y="12" width="4" height="8"/><rect x="10" y="8" width="4" height="12"/><rect x="17" y="4" width="4" height="16"/></svg>
            <span class="text-sm">Completion: <strong>${Math.min(100, Math.round((solved / TOTAL_QUESTIONS) * 100))}%</strong> (${solved}/${TOTAL_QUESTIONS})</span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:8px;border:1px solid var(--border);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span class="text-sm">XP per question: <strong>${solved > 0 ? Math.round(user.xp / solved) : 0}</strong> avg</span>
        </div>
    `;
}

function renderAdvancedAnalytics(user, progress) {
    const analyticsEl = document.getElementById('advancedAnalytics');
    const insightsEl = document.getElementById('learningInsights');
    if (!analyticsEl || !insightsEl) return;

    const questionTimes = progress?.questionTimes || [];
    const solved = (progress?.currentQuestion - 1) || 0;
    const times = questionTimes.map(entry => Number(entry.time) || 0).filter(Boolean);
    const attempts = questionTimes.map(entry => Number(entry.attempts) || 1);

    const avg = times.length ? (times.reduce((sum, t) => sum + t, 0) / times.length) : 0;
    const variance = times.length
        ? (times.reduce((sum, t) => sum + ((t - avg) ** 2), 0) / times.length)
        : 0;
    const stdDev = Math.sqrt(variance);

    const fastCount = times.filter(t => t <= 45).length;
    const mediumCount = times.filter(t => t > 45 && t <= 120).length;
    const deepCount = times.filter(t => t > 120).length;

    const perfectAttempts = attempts.filter(a => a === 1).length;
    const perfectRate = attempts.length ? Math.round((perfectAttempts / attempts.length) * 100) : 0;
    const consistencyScore = avg ? Math.max(0, Math.min(100, Math.round(100 - ((stdDev / avg) * 100)))) : 0;

    const joinedDate = user?.joined ? new Date(user.joined) : new Date();
    const daysOnPlatform = Math.max(1, Math.ceil((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)));
    const solveVelocity = solved / daysOnPlatform;
    const projectedDaysToFinish = solveVelocity > 0 ? Math.ceil((Math.max(0, TOTAL_QUESTIONS - solved)) / solveVelocity) : null;
    const streakMomentum = Math.min(100, (user.streak || 0) * 8);

    analyticsEl.innerHTML = `
        <div class="d-flex align-center gap-1 mb-1" style="padding:9px;border:1px solid var(--border);">
            <span class="text-sm">Consistency Score: <strong>${consistencyScore}%</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:9px;border:1px solid var(--border);">
            <span class="text-sm">Perfect Attempt Rate: <strong>${perfectRate}%</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:9px;border:1px solid var(--border);">
            <span class="text-sm">Solve Velocity: <strong>${solveVelocity.toFixed(2)} q/day</strong></span>
        </div>
        <div style="padding:9px;border:1px solid var(--border);">
            <div class="text-sm mb-1">Pace Breakdown</div>
            <div class="text-sm text-muted">Fast (≤45s): ${fastCount} | Mid: ${mediumCount} | Deep: ${deepCount}</div>
        </div>
    `;

    insightsEl.innerHTML = `
        <div class="d-flex align-center gap-1 mb-1" style="padding:9px;border:1px solid var(--border);">
            <span class="text-sm">Streak Momentum: <strong>${streakMomentum}%</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:9px;border:1px solid var(--border);">
            <span class="text-sm">Days on platform: <strong>${daysOnPlatform}</strong></span>
        </div>
        <div class="d-flex align-center gap-1 mb-1" style="padding:9px;border:1px solid var(--border);">
            <span class="text-sm">Projected completion: <strong>${projectedDaysToFinish ? projectedDaysToFinish + ' days' : 'Need more solves'}</strong></span>
        </div>
        <div style="padding:9px;border:1px solid var(--border);">
            <div class="text-sm mb-1">Focus Suggestion</div>
            <div class="text-sm text-muted">${deepCount > fastCount ? 'Work on speed drills for easier questions to improve timing consistency.' : 'Great pace balance — push streak and attempt higher difficulty sets.'}</div>
        </div>
    `;
}

// Zen timer display is now handled by ActivityTracker (activityTracker.js)
// No duplicate timer logic here.

async function loadDailyQuiz() {
    try {
        const res = await apiCall('/api/daily-quiz');
        if (res?.success) {
            renderDailyQuiz(res);
        }
    } catch (e) { console.error('Error loading daily quiz', e); }
}

function renderDailyQuiz(data) {
    const { question, options, answeredToday } = data;
    document.getElementById('quizQuestionText').textContent = question;
    
    if (answeredToday) {
        showQuizCooldown();
    } else {
        const optionsHtml = options.map((opt, i) => `
            <button class="btn btn-outline" style="text-align: left; justify-content: flex-start; padding: 8px 12px; font-size: 0.9rem;" onclick="submitQuizAnswer(${i}, this)">
                ${opt}
            </button>
        `).join('');
        document.getElementById('quizOptions').innerHTML = optionsHtml;
        document.getElementById('quizContent').style.opacity = '1';
        document.getElementById('quizCooldownOverlay').style.display = 'none';
        document.getElementById('quizRewardBadge').style.display = 'inline-block';
    }
}

async function submitQuizAnswer(index, btnElement) {
    // Disable all buttons instantly
    const buttons = document.getElementById('quizOptions').querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    
    try {
        const res = await apiCall('/api/daily-quiz', {
            method: 'POST',
            body: JSON.stringify({ answerIndex: index })
        });
        if (res?.success) {
            // Highlight the selected button
            if (res.isCorrect) {
                btnElement.style.borderColor = 'var(--success)';
                btnElement.style.color = 'var(--success)';
                document.getElementById('sidebarZen').textContent = res.zen;
                document.getElementById('topZen').textContent = formatNumber(res.zen);
                document.getElementById('statZen').textContent = formatNumber(res.zen);
            } else {
                btnElement.style.borderColor = 'var(--error)';
                btnElement.style.color = 'var(--error)';
                // Highlight the correct one safely
                if (res.correctIndex !== undefined && buttons[res.correctIndex]) {
                    buttons[res.correctIndex].style.borderColor = 'var(--success)';
                    buttons[res.correctIndex].style.color = 'var(--success)';
                }
            }
            
            showToast(res.message, res.isCorrect ? 'success' : 'error');
            
            // Wait 2 seconds then show cooldown
            setTimeout(() => {
                showQuizCooldown();
            }, 2000);
        } else {
            showToast(res?.message || 'Error submitting answer', 'error');
            buttons.forEach(b => b.disabled = false);
        }
    } catch (e) {
        console.error(e);
        buttons.forEach(b => b.disabled = false);
    }
}

let quizTimerInterval = null;
function showQuizCooldown() {
    document.getElementById('quizContent').style.opacity = '0.05';
    document.getElementById('quizCooldownOverlay').style.display = 'flex';
    document.getElementById('quizRewardBadge').style.display = 'none';
    
    // Start countdown
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    updateQuizTimer();
    quizTimerInterval = setInterval(updateQuizTimer, 1000);
}

function updateQuizTimer() {
    const now = new Date();
    // Calculate 12 AM IST of the next day (IST is UTC+5:30)
    const currentIstMs = now.getTime() + (5.5 * 60 * 60 * 1000);
    const istDate = new Date(currentIstMs);
    
    // Next midnight in this artificial UTC representation
    const nextMidnightIstMs = Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate() + 1, 0, 0, 0, 0);
    
    const diffMs = nextMidnightIstMs - currentIstMs;
    
    if (diffMs <= 0) {
        clearInterval(quizTimerInterval);
        document.getElementById('quizCountdown').textContent = "00:00:00";
        loadDailyQuiz();
        return;
    }
    
    const h = Math.floor(diffMs / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    document.getElementById('quizCountdown').textContent = 
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
