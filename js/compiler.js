// ============================================
// ZenPy - Compiler JS (Pyodide Integration)
// Practice page: code editor, test runner, anti-cheat
// ============================================

if (!requireAuth()) { /* redirected */ }

let pyodide = null;
let editor = null;
let currentQuestion = null;
let currentQuestionId = 1;
let timerInterval = null;
let secondsElapsed = 0;
let copyAttempts = parseInt(localStorage.getItem('zenpy_copyAttempts')) || 0;

// --- Initialize Pyodide ---
async function initPyodide() {
    try {
        pyodide = await loadPyodide();
        document.getElementById('pyodideLoading').style.display = 'none';
        console.log('Pyodide ready');
    } catch (err) {
        console.error('Pyodide load error:', err);
        document.getElementById('pyodideLoading').innerHTML = `
            <h3 style="color:var(--error);">Failed to load Python</h3>
            <p>Please refresh the page to try again.</p>
            <button onclick="location.reload()" class="btn btn-primary mt-2">Refresh</button>
        `;
    }
}

// --- Initialize CodeMirror ---
function initCodeMirror() {
    const textarea = document.getElementById('codeEditor');
    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'python',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        autoCloseBrackets: true,
        matchBrackets: true,
        lineWrapping: true
    });

    // Disable paste in editor
    editor.on('paste', (cm, e) => {
        e.preventDefault();
        trackCopyAttempt();
    });

    // Auto-save every 30 seconds
    setInterval(() => {
        if (editor && currentQuestionId) {
            localStorage.setItem(`zenpy_code_q${currentQuestionId}`, editor.getValue());
        }
    }, 30000);
}

// --- Anti-Copy-Paste System ---
function setupAntiCheat() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
            const target = e.target;
            if (target.closest('.console-output') || target.closest('.test-details')) return;
            e.preventDefault();
            trackCopyAttempt();
            return false;
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.panel-editor')) {
            e.preventDefault();
            trackCopyAttempt();
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.closest('.panel-editor')) {
            e.preventDefault();
        }
    });
}

function trackCopyAttempt() {
    copyAttempts++;
    localStorage.setItem('zenpy_copyAttempts', copyAttempts);
    const remaining = 5 - copyAttempts;

    if (copyAttempts >= 5) {
        fetch('/api/ban', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'copy_paste_attempts', type: 'permanent' })
        }).then(() => {
            localStorage.clear();
            window.location.href = '/login';
        });
        return;
    }

    showToast(`Copy-paste not allowed! Attempt ${copyAttempts}/5. ${remaining} remaining before ban.`, 'warning');
}

// --- Load Question ---
async function loadQuestion(qId) {
    currentQuestionId = qId;
    
    const data = await apiCall(`/api/question/${qId}`);
    if (!data || !data.success) {
        showToast(data?.message || 'Failed to load question', 'error');
        return;
    }

    currentQuestion = data.question;

    // Update UI
    document.getElementById('questionTitle').textContent = `Q${qId}: ${currentQuestion.title}`;
    document.getElementById('qNumber').textContent = `Q${qId}`;
    document.getElementById('qTitle').textContent = currentQuestion.title;
    document.getElementById('qDescription').innerHTML = formatDescription(currentQuestion.description);
    document.getElementById('optimalTime').textContent = currentQuestion.optimalTime;

    // Difficulty badge
    const diffEl = document.getElementById('qDifficulty');
    diffEl.textContent = currentQuestion.difficulty;
    diffEl.className = 'q-difficulty ' + currentQuestion.difficulty;

    // Concepts
    const conceptsEl = document.getElementById('qConcepts');
    conceptsEl.innerHTML = (currentQuestion.concepts || []).map(c => 
        `<span class="q-concept">${c}</span>`
    ).join('');

    // Hints (with SVG icon instead of emoji)
    const hintEl = document.getElementById('hintContent');
    hintEl.innerHTML = (currentQuestion.hints || []).map(h => 
        `<p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M9 18h6m-5 4h4M12 2a7 7 0 00-3 13.33V17h6v-1.67A7 7 0 0012 2z"/></svg>${h}</p>`
    ).join('');
    hintEl.classList.remove('show');

    // Set editor code — NEVER pre-fill answers
    const savedCode = localStorage.getItem(`zenpy_code_q${qId}`);
    if (savedCode) {
        editor.setValue(savedCode);
    } else {
        // Default welcome message — no answer code
        editor.setValue('# Welcome to ZenPy, code here!\n\n');
    }

    // Reset output
    document.getElementById('consoleOutput').textContent = 'Run your code to see output here...';
    document.getElementById('consoleOutput').style.color = 'var(--text-secondary)';
    document.getElementById('testResults').innerHTML = '<p class="text-muted text-sm">Submit your code to run test cases.</p>';

    // Reset timer
    secondsElapsed = 0;
    startTimer();

    // Show subjective badge if applicable
    if (currentQuestion.subjective) {
        const descEl = document.getElementById('qDescription');
        descEl.innerHTML += `<div style="margin-top:10px;padding:6px 10px;border:1px dashed var(--info);color:var(--info);font-size:0.78rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Open-ended question — use your own values. Any valid Python that compiles and produces output will pass.
        </div>`;
    }

    updatePotentialXP();
}

function formatDescription(desc) {
    return desc.replace(/`([^`]+)`/g, '<code>$1</code>')
               .replace(/\n/g, '<br>');
}

// --- Timer ---
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const display = document.getElementById('timerDisplay');
        display.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${formatTime(secondsElapsed)}`;

        if (currentQuestion && secondsElapsed > currentQuestion.optimalTime * 2) {
            display.className = 'timer danger';
        } else if (currentQuestion && secondsElapsed > currentQuestion.optimalTime) {
            display.className = 'timer warning';
        }

        updatePotentialXP();
    }, 1000);
}

function updatePotentialXP() {
    if (!currentQuestion) return;
    const baseXP = currentQuestionId * 10;
    const timeBonus = Math.min(100, Math.round((currentQuestion.optimalTime / Math.max(secondsElapsed, 1)) * 50));
    const total = baseXP + timeBonus + 50;
    document.getElementById('potentialXP').textContent = total;
}

// --- Run Code (just output, no tests) ---
async function runCode() {
    if (!pyodide) {
        showToast('Python is still loading...', 'warning');
        return;
    }

    const code = editor.getValue();
    
    // Validate imports
    const blocked = ['os', 'sys', 'subprocess', 'socket', 'requests', 'urllib', 'http', 'ftplib', 'telnetlib', 'ctypes'];
    for (const imp of blocked) {
        if (code.includes(`import ${imp}`) || code.includes(`from ${imp}`)) {
            document.getElementById('consoleOutput').textContent = `Error: Import '${imp}' is not allowed on ZenPy.`;
            document.getElementById('consoleOutput').style.color = 'var(--error)';
            return;
        }
    }

    const runBtn = document.getElementById('runBtn');
    runBtn.disabled = true;
    runBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Running...';

    try {
        // Override input() to use prompt() — user sees a dialog and types their value
        // Collected inputs are shown in the console output
        pyodide.runPython(`
import sys
from io import StringIO
_zenpy_stdout = StringIO()
_zenpy_inputs_log = []
sys.stdout = _zenpy_stdout
sys.stderr = _zenpy_stdout
`);
        // Register a JS-callable input function
        pyodide.globals.set('_js_prompt', (promptText) => {
            const val = prompt(promptText ? `[Python input] ${promptText}` : '[Python input] Enter a value:');
            return val === null ? '' : val;
        });

        pyodide.runPython(`
import pyodide_js
def input(prompt_text=''):
    val = _js_prompt(prompt_text)
    _zenpy_inputs_log.append(f">>> {prompt_text}{val}")
    return val
`);

        await pyodide.runPythonAsync(code);
        
        const output = pyodide.runPython('_zenpy_stdout.getvalue()');
        const inputLog = pyodide.runPython(`"\\n".join(_zenpy_inputs_log)`);
        
        let display = '';
        if (inputLog) display += inputLog + '\n';
        display += output || '(No output)';
        
        document.getElementById('consoleOutput').textContent = display;
        document.getElementById('consoleOutput').style.color = output ? 'var(--success)' : 'var(--text-muted)';
    } catch (err) {
        document.getElementById('consoleOutput').textContent = 'Error: ' + err.message;
        document.getElementById('consoleOutput').style.color = 'var(--error)';
    }

    runBtn.disabled = false;
    runBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run';
}

// --- Submit Code (run tests) ---
async function submitCode() {
    if (!pyodide) {
        showToast('Python is still loading...', 'warning');
        return;
    }

    const code = editor.getValue();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Testing...';

    try {
        // Get test cases from server
        const testData = await apiCall(`/api/question/${currentQuestionId}/tests`);
        if (!testData?.success) throw new Error('Failed to load tests');

        const testCases = testData.testCases;
        const results = [];
        const testResultsEl = document.getElementById('testResults');
        testResultsEl.innerHTML = '';

        // SVG icons for pass/fail
        const passIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
        const failIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        for (let i = 0; i < testCases.length; i++) {
            const test = testCases[i];

            // Handle different test types for subjective questions
            if (test.type === 'compile_only') {
                // Just check if code compiles/runs without runtime errors
                try {
                    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
                    await pyodide.runPythonAsync(code);
                    results.push({ passed: true });

                    testResultsEl.innerHTML += `
                        <div class="test-case passed">
                            <span class="test-icon">${passIcon}</span>
                            <div>
                                <strong>Compile Check</strong> Passed
                            </div>
                        </div>`;
                } catch (err) {
                    results.push({ passed: false });
                    testResultsEl.innerHTML += `
                        <div class="test-case failed">
                            <span class="test-icon">${failIcon}</span>
                            <div><strong>Compile</strong> Error<div class="test-details">${escapeHTML(err.message)}</div></div>
                        </div>`;
                }
                continue;
            }

            if (test.type === 'output_contains') {
                try {
                    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
                    await pyodide.runPythonAsync(code);
                    const output = pyodide.runPython('sys.stdout.getvalue()');
                    const passed = output && output.includes(test.mustContain);
                    results.push({ passed });

                    testResultsEl.innerHTML += `
                        <div class="test-case ${passed ? 'passed' : 'failed'}">
                            <span class="test-icon">${passed ? passIcon : failIcon}</span>
                            <div>
                                <strong>Output Check</strong> ${passed ? 'Passed' : 'Failed'}
                                ${!passed ? `<div class="test-details">Output must contain: "${escapeHTML(test.mustContain)}"</div>` : ''}
                            </div>
                        </div>`;
                } catch (err) {
                    results.push({ passed: false });
                    testResultsEl.innerHTML += `
                        <div class="test-case failed">
                            <span class="test-icon">${failIcon}</span>
                            <div><strong>Output Check</strong> Error<div class="test-details">${escapeHTML(err.message)}</div></div>
                        </div>`;
                }
                continue;
            }

            if (test.type === 'line_count') {
                try {
                    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
                    await pyodide.runPythonAsync(code);
                    const output = pyodide.runPython('sys.stdout.getvalue()');
                    const lines = output.trim().split('\n').filter(l => l.length > 0);
                    const passed = lines.length >= test.expectedLines;
                    results.push({ passed });

                    testResultsEl.innerHTML += `
                        <div class="test-case ${passed ? 'passed' : 'failed'}">
                            <span class="test-icon">${passed ? passIcon : failIcon}</span>
                            <div>
                                <strong>Line Count</strong> ${passed ? 'Passed' : 'Failed'}
                                ${!passed ? `<div class="test-details">Expected at least ${test.expectedLines} lines, got ${lines.length}</div>` : ''}
                            </div>
                        </div>`;
                } catch (err) {
                    results.push({ passed: false });
                    testResultsEl.innerHTML += `
                        <div class="test-case failed">
                            <span class="test-icon">${failIcon}</span>
                            <div><strong>Line Count</strong> Error<div class="test-details">${escapeHTML(err.message)}</div></div>
                        </div>`;
                }
                continue;
            }

            // Standard exact-match test case
            try {
                pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
                if (test.input) {
                    const inputs = test.input.split('\n');
                    pyodide.runPython(`
_inputs = ${JSON.stringify(inputs)}
_input_idx = 0
def input(prompt=''):
    global _input_idx
    if _input_idx < len(_inputs):
        val = _inputs[_input_idx]
        _input_idx += 1
        return val
    return ''
`);
                }

                await pyodide.runPythonAsync(code);
                const output = pyodide.runPython('sys.stdout.getvalue()');
                const expected = test.expectedOutput;
                const passed = output.trim() === expected.trim();
                results.push({ passed });

                testResultsEl.innerHTML += `
                    <div class="test-case ${passed ? 'passed' : 'failed'}">
                        <span class="test-icon">${passed ? passIcon : failIcon}</span>
                        <div>
                            <strong>Test ${i + 1}</strong> ${passed ? 'Passed' : 'Failed'}
                            ${!passed ? `<div class="test-details">Expected: ${escapeHTML(expected.trim())}<br>Got: ${escapeHTML(output.trim())}</div>` : ''}
                        </div>
                    </div>`;
            } catch (err) {
                results.push({ passed: false });
                testResultsEl.innerHTML += `
                    <div class="test-case failed">
                        <span class="test-icon">${failIcon}</span>
                        <div><strong>Test ${i + 1}</strong> Error<div class="test-details">${escapeHTML(err.message)}</div></div>
                    </div>`;
            }
        }

        // Submit results to server
        const allPassed = results.every(r => r.passed);
        const submitData = await apiCall(`/api/question/${currentQuestionId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ results, timeTaken: secondsElapsed })
        });

        if (submitData?.passed) {
            showToast(`${submitData.message} +${submitData.xpEarned} XP!`, 'success');
            triggerConfetti();

            if (submitData.xpBreakdown) {
                const b = submitData.xpBreakdown;
                setTimeout(() => {
                    showToast(`XP: Base ${b.base} + Time ${b.timeBonus} + First ${b.firstAttemptBonus} + Streak ${b.streakBonus}`, 'info');
                }, 1500);
            }

            if (submitData.zenEarned > 0) {
                setTimeout(() => showToast(`+${submitData.zenEarned} Zen coins!`, 'info'), 3000);
            }

            if (submitData.newAchievements?.length > 0) {
                submitData.newAchievements.forEach((a, i) => {
                    setTimeout(() => showToast(`Achievement: ${a.name}!`, 'success'), 4500 + i * 1500);
                });
            }

            setTimeout(() => {
                buildQuestionNav(submitData.nextQuestion);
                if (submitData.nextQuestion <= 100) {
                    loadQuestion(submitData.nextQuestion);
                }
            }, 2000);
        }

    } catch (err) {
        showToast('Error running tests: ' + err.message, 'error');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Submit';
}

// --- Confetti Effect ---
function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF1493', '#FFD700', '#00FF88', '#FF4444', '#1E90FF', '#9400D3'];
    const pieces = [];

    for (let i = 0; i < 100; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 100,
            w: 5 + Math.random() * 10,
            h: 5 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 2 + Math.random() * 4,
            angle: Math.random() * 360,
            spin: (Math.random() - 0.5) * 10
        });
    }

    let frames = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
            p.y += p.speed;
            p.angle += p.spin;
        });
        frames++;
        if (frames < 150) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
}

// --- Hint Toggle ---
function toggleHint() {
    document.getElementById('hintContent').classList.toggle('show');
}

// --- Reset Code ---
function resetCode() {
    if (currentQuestion) {
        editor.setValue('# Welcome to ZenPy, code here!\n\n');
        localStorage.removeItem(`zenpy_code_q${currentQuestionId}`);
    }
}

// --- Question Navigation ---
async function buildQuestionNav(currentQ) {
    const data = await apiCall('/api/questions');
    if (!data?.success) return;

    const nav = document.getElementById('questionNav');
    nav.innerHTML = data.questions.slice(0, Math.min(currentQ + 5, 100)).map(q => {
        let cls = 'q-nav-btn';
        if (q.completed) cls += ' completed';
        else if (q.id === currentQ) cls += ' current';
        else if (q.locked) cls += ' locked';
        
        return `<button class="${cls}" onclick="${q.locked ? '' : `loadQuestion(${q.id})`}" ${q.locked ? 'disabled' : ''} title="Q${q.id}: ${q.title}">${q.id}</button>`;
    }).join('');
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', async () => {
    initCodeMirror();
    setupAntiCheat();
    await initPyodide();

    const data = await apiCall('/api/user');
    if (data?.success) {
        const currentQ = data.progress?.currentQuestion || 1;
        buildQuestionNav(currentQ);

        const params = new URLSearchParams(window.location.search);
        const qId = parseInt(params.get('q')) || currentQ;
        loadQuestion(Math.min(qId, currentQ));
    }
});
