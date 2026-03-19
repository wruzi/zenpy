// ============================================
// ZenPy - Authentication JS
// Login, Signup (QR Session Code), Forgot Password
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (localStorage.getItem('zenpy_token')) {
        const page = window.location.pathname;
        if (['/login', '/signup', '/forgot-password', '/'].includes(page)) {
            window.location.href = '/dashboard';
            return;
        }
    }

    // --- Login Form ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const errorMsg = document.getElementById('errorMsg');
            
            btn.disabled = true;
            btn.innerHTML = '<svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"/></svg> Logging in...';
            errorMsg.classList.add('hidden');

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        rememberMe: document.getElementById('rememberMe')?.checked || false
                    })
                });

                const data = await res.json();

                if (data.success) {
                    localStorage.setItem('zenpy_token', data.token);
                    localStorage.setItem('zenpy_user', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = 'Connection error. Please try again.';
                errorMsg.classList.remove('hidden');
            }

            btn.disabled = false;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Login';
        });
    }

    // --- Signup Form (QR Session Code) ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        let signupEmail = '';
        let countdownInterval = null;

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('signupBtn');
            const errorMsg = document.getElementById('errorMsg');
            
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                errorMsg.textContent = 'Passwords do not match.';
                errorMsg.classList.remove('hidden');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Creating account...';
            errorMsg.classList.add('hidden');

            try {
                const res = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, password })
                });

                const data = await res.json();

                if (data.success) {
                    signupEmail = email;
                    const code = data.sessionCode;

                    // Redirect to the new verify page so QR can render properly on a visually fresh page
                    window.location.href = `/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&expires=${data.expiresIn || 600}`;

                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = 'Connection error. Please try again.';
                errorMsg.classList.remove('hidden');
            }

            btn.disabled = false;
            btn.textContent = 'Create Account';
        });

        // Verify session code is now handled inside verify.html
    }

    // --- Forgot Password Form ---
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        let resetEmail = '';

        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMsg = document.getElementById('errorMsg');
            const email = document.getElementById('email').value;

            errorMsg.classList.add('hidden');

            try {
                const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();

                if (data.success && data.sessionCode) {
                    resetEmail = email;
                    forgotForm.classList.add('hidden');
                    document.getElementById('resetSection').classList.remove('hidden');
                    document.getElementById('codeDisplay').textContent = data.sessionCode;
                } else {
                    const successMsg = document.getElementById('successMsg');
                    successMsg.textContent = 'If an account exists, a reset code has been generated.';
                    successMsg.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = 'Connection error.';
                errorMsg.classList.remove('hidden');
            }
        });

        const resetForm = document.getElementById('resetForm');
        if (resetForm) {
            resetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const errorMsg = document.getElementById('errorMsg');
                const code = document.getElementById('resetCode').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNew = document.getElementById('confirmNewPassword').value;

                if (newPassword !== confirmNew) {
                    errorMsg.textContent = 'Passwords do not match.';
                    errorMsg.classList.remove('hidden');
                    return;
                }

                try {
                    const res = await fetch('/api/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: resetEmail, code, newPassword })
                    });

                    const data = await res.json();

                    if (data.success) {
                        if (typeof showToast === 'function') showToast('Password reset! Redirecting to login...', 'success');
                        setTimeout(() => { window.location.href = '/login'; }, 1500);
                    } else {
                        errorMsg.textContent = data.message;
                        errorMsg.classList.remove('hidden');
                    }
                } catch (err) {
                    errorMsg.textContent = 'Connection error.';
                    errorMsg.classList.remove('hidden');
                }
            });
        }
    }
});
