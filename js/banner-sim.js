// ============================================
// ZenPy - Banner Simulation Effects
// JS equations + physics overlays for banner classes
// ============================================

(function () {
    const MIN_HEIGHT = 72;
    const dpr = () => Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const instances = new Set();
    const instanceMap = new WeakMap();

    function isEquationBanner(element) {
        return element.classList.contains('banner-equation-sim');
    }

    function isPhysicsBanner(element) {
        return element.classList.contains('banner-physics-sim');
    }

    function isSimBanner(element) {
        return isEquationBanner(element) || isPhysicsBanner(element);
    }

    function getBannerType(element) {
        if (isEquationBanner(element)) return 'equation';
        if (isPhysicsBanner(element)) return 'physics';
        return null;
    }

    function randomFrom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function drawDiamond(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
    }

    function drawCrystal(ctx, x, y, size, tilt = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.7, -size * 0.2);
        ctx.lineTo(size * 0.45, size);
        ctx.lineTo(-size * 0.5, size * 0.75);
        ctx.lineTo(-size * 0.85, -size * 0.15);
        ctx.closePath();
        ctx.restore();
    }

    function drawStarCross(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
    }

    function getPhysicsTheme(element) {
        const classList = element.classList;

        if (classList.contains('physics-theme-orbital')) {
            return {
                key: 'orbital',
                waveColor: 'rgba(102, 199, 255, 0.34)',
                particleColor: '#8fd9ff',
                speedMultiplier: 0.92,
                amplitude: 10,
                waveCount: 4,
                orbit: true,
                particleShape: 'star',
                spaceField: true
            };
        }

        if (classList.contains('physics-theme-collider')) {
            return {
                key: 'collider',
                waveColor: 'rgba(122, 255, 195, 0.34)',
                particleColor: '#8effcb',
                speedMultiplier: 1.28,
                amplitude: 7,
                waveCount: 5,
                collider: true,
                particleShape: 'square'
            };
        }

        if (classList.contains('physics-theme-ionstorm')) {
            return {
                key: 'ionstorm',
                waveColor: 'rgba(159, 217, 255, 0.36)',
                particleColor: '#b7e8ff',
                speedMultiplier: 1.18,
                amplitude: 12,
                waveCount: 3,
                lightning: true,
                particleShape: 'crystal'
            };
        }

        if (classList.contains('physics-theme-gravity')) {
            return {
                key: 'gravity',
                waveColor: 'rgba(197, 176, 255, 0.34)',
                particleColor: '#d7c8ff',
                speedMultiplier: 0.78,
                amplitude: 6,
                waveCount: 3,
                gravityWell: true,
                particleShape: 'diamond'
            };
        }

        if (classList.contains('physics-theme-reactor')) {
            return {
                key: 'reactor',
                waveColor: 'rgba(255, 216, 106, 0.34)',
                particleColor: '#ffe39a',
                speedMultiplier: 1.04,
                amplitude: 8,
                waveCount: 4,
                reactor: true,
                particleShape: 'diamond'
            };
        }

        if (classList.contains('physics-theme-wormhole')) {
            return {
                key: 'wormhole',
                waveColor: 'rgba(159, 208, 255, 0.34)',
                particleColor: '#b8deff',
                speedMultiplier: 1.1,
                amplitude: 6,
                waveCount: 4,
                wormhole: true,
                particleShape: 'star',
                spaceField: true
            };
        }

        if (classList.contains('physics-theme-magnetar')) {
            return {
                key: 'magnetar',
                waveColor: 'rgba(255, 106, 168, 0.34)',
                particleColor: '#ff9ac5',
                speedMultiplier: 0.96,
                amplitude: 9,
                waveCount: 5,
                magnetar: true,
                particleShape: 'crystal'
            };
        }

        if (classList.contains('physics-theme-photon')) {
            return {
                key: 'photon',
                waveColor: 'rgba(122, 255, 227, 0.34)',
                particleColor: '#abffe9',
                speedMultiplier: 1.34,
                amplitude: 5,
                waveCount: 6,
                photon: true,
                particleShape: 'diamond',
                spaceField: true
            };
        }

        return {
            key: 'default',
            waveColor: 'rgba(82, 255, 183, 0.24)',
            particleColor: '#8cffcc',
            speedMultiplier: 1,
            amplitude: 8,
            waveCount: 3,
            particleShape: 'dot'
        };
    }

    function makeTokens(type, width, height) {
        const tokenCount = Math.max(8, Math.min(22, Math.floor(width / 26)));
        const symbols = type === 'equation'
            ? ['E=mc²', '∇·E', '∫f(x)dx', 'λ', '∑', 'π', 'Δt', 'v²', 'ψ', '∂/∂x']
            : ['F=ma', 'p=mv', 'ω', 'θ', 'μ', 'ΣF', 'a→', 'v→', 'r̂', 'd/dt'];

        return Array.from({ length: tokenCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() * 0.32) + 0.08,
            vy: (Math.random() * 0.12) - 0.06,
            alpha: 0.22 + Math.random() * 0.42,
            scale: 10 + Math.random() * 8,
            text: randomFrom(symbols)
        }));
    }

    function resizeInstance(instance) {
        const rect = instance.element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;

        const pixelRatio = dpr();
        instance.canvas.width = Math.floor(rect.width * pixelRatio);
        instance.canvas.height = Math.floor(rect.height * pixelRatio);
        instance.canvas.style.width = `${Math.floor(rect.width)}px`;
        instance.canvas.style.height = `${Math.floor(rect.height)}px`;

        instance.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        instance.width = rect.width;
        instance.height = rect.height;

        if (!instance.tokens.length) {
            instance.tokens = makeTokens(instance.type, rect.width, rect.height);
        }

        return rect.height >= MIN_HEIGHT;
    }

    function drawEquation(instance, timeSec) {
        const { ctx, width, height, tokens } = instance;
        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(126, 243, 255, 0.16)';
        ctx.lineWidth = 1;
        const spacing = 22;
        for (let y = 0; y < height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y + Math.sin((timeSec + y * 0.03)) * 1.3);
            ctx.lineTo(width, y + Math.sin((timeSec + y * 0.03)) * 1.3);
            ctx.stroke();
        }

        tokens.forEach(token => {
            token.x += token.vx;
            token.y += token.vy;

            if (token.x > width + 40) token.x = -50;
            if (token.y > height + 16) token.y = -10;
            if (token.y < -12) token.y = height + 10;

            ctx.globalAlpha = token.alpha;
            ctx.fillStyle = '#86f4ff';
            ctx.font = `${token.scale}px JetBrains Mono, monospace`;
            ctx.fillText(token.text, token.x, token.y);
        });

        ctx.globalAlpha = 1;
    }

    function drawPhysics(instance, timeSec) {
        const { ctx, width, height, tokens } = instance;
        const theme = getPhysicsTheme(instance.element);
        ctx.clearRect(0, 0, width, height);

        const centerY = height * 0.5;

        if (theme.spaceField) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            for (let i = 0; i < 26; i++) {
                const x = (i * 43 + timeSec * (8 + (i % 4) * 2)) % (width + 16) - 8;
                const y = (i * 19) % height;
                const r = (i % 3 === 0) ? 1.2 : 0.8;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.strokeStyle = theme.waveColor;
        ctx.lineWidth = 1.1;

        for (let i = 0; i < theme.waveCount; i++) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 8) {
                const y = centerY + Math.sin((x * 0.03) + timeSec * (theme.speedMultiplier + i * 0.23)) * (theme.amplitude + i * 4);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        if (theme.orbit) {
            ctx.strokeStyle = 'rgba(143, 217, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(width * 0.2, centerY, 12 + Math.sin(timeSec * 1.6) * 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(width * 0.74, centerY, 18 + Math.cos(timeSec * 1.25) * 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (theme.collider) {
            const laneX = (timeSec * 110) % width;
            ctx.strokeStyle = 'rgba(122, 255, 195, 0.42)';
            ctx.beginPath();
            ctx.moveTo(laneX, 0);
            ctx.lineTo(width - laneX, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(width - laneX, 0);
            ctx.lineTo(laneX, height);
            ctx.stroke();
            ctx.fillStyle = 'rgba(122, 255, 195, 0.2)';
            ctx.fillRect((laneX + width * 0.5) % width, centerY - 5, 16, 10);
        }

        if (theme.lightning) {
            ctx.strokeStyle = 'rgba(183, 232, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(width * 0.1, height * 0.2);
            ctx.lineTo(width * 0.3, height * 0.45);
            ctx.lineTo(width * 0.26, height * 0.55);
            ctx.lineTo(width * 0.42, height * 0.82);
            ctx.stroke();
            ctx.lineWidth = 1.1;
        }

        if (theme.gravityWell) {
            ctx.strokeStyle = 'rgba(215, 200, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(width * 0.5, centerY, 10 + Math.sin(timeSec) * 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(width * 0.5, centerY, 22 + Math.sin(timeSec * 1.2) * 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (theme.reactor) {
            ctx.strokeStyle = 'rgba(255, 227, 154, 0.45)';
            const pulse = 8 + Math.abs(Math.sin(timeSec * 2.6)) * 9;
            ctx.beginPath();
            ctx.arc(width * 0.5, centerY, pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(width * 0.5, centerY - pulse - 5);
            ctx.lineTo(width * 0.5, centerY + pulse + 5);
            ctx.stroke();
        }

        if (theme.wormhole) {
            const cx = width * 0.52;
            const cy = centerY;
            ctx.strokeStyle = 'rgba(184, 222, 255, 0.42)';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(cx, cy, 8 + i * 10, 4 + i * 5, timeSec * 0.45 + i * 0.24, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        if (theme.magnetar) {
            ctx.strokeStyle = 'rgba(255, 154, 197, 0.42)';
            for (let i = 0; i < 4; i++) {
                const offset = i * 12;
                ctx.beginPath();
                for (let x = 0; x <= width; x += 10) {
                    const y = centerY + Math.sin((x * 0.025) + timeSec * 0.85 + offset) * (14 - i * 2);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            ctx.strokeStyle = 'rgba(255, 154, 197, 0.32)';
            ctx.beginPath();
            ctx.ellipse(width * 0.5, centerY, 36, 12, Math.sin(timeSec * 0.5) * 0.3, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (theme.photon) {
            const sweep = (timeSec * 150) % (width + 80) - 40;
            ctx.strokeStyle = 'rgba(171, 255, 233, 0.5)';
            for (let y = 8; y < height; y += 14) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(sweep, 0);
            ctx.lineTo(sweep - 36, height);
            ctx.stroke();
            ctx.lineWidth = 1.1;
        }

        tokens.forEach(token => {
            token.x += token.vx * (1.2 * theme.speedMultiplier);
            token.y += Math.sin(timeSec + token.x * 0.01) * 0.16 + token.vy * 0.6;

            if (theme.gravityWell) {
                const centerX = width * 0.5;
                const dx = centerX - token.x;
                const dy = centerY - token.y;
                const dist = Math.max(18, Math.hypot(dx, dy));
                token.x += (dx / dist) * 0.28;
                token.y += (dy / dist) * 0.18;
            }

            if (theme.photon) {
                token.y += Math.sin(timeSec * 2 + token.x * 0.02) * 0.35;
            }

            if (theme.wormhole) {
                token.y += Math.cos(timeSec * 1.5 + token.x * 0.015) * 0.24;
            }

            if (token.x > width + 30) token.x = -40;
            if (token.y > height + 20) token.y = -16;
            if (token.y < -20) token.y = height + 12;

            ctx.globalAlpha = token.alpha;
            ctx.fillStyle = theme.particleColor;

            const shape = theme.particleShape || 'dot';
            if (shape === 'star') {
                ctx.strokeStyle = theme.particleColor;
                ctx.lineWidth = 1;
                drawStarCross(ctx, token.x, token.y, 1.8);
                ctx.stroke();
                ctx.lineWidth = 1.1;
            } else if (shape === 'square') {
                ctx.fillRect(token.x - 1.2, token.y - 1.2, 2.4, 2.4);
            } else if (shape === 'diamond') {
                drawDiamond(ctx, token.x, token.y, 1.7);
                ctx.fill();
            } else if (shape === 'crystal') {
                drawCrystal(ctx, token.x, token.y, 2.3, Math.sin(timeSec + token.x * 0.02) * 0.5);
                ctx.fill();
                ctx.strokeStyle = theme.particleColor;
                ctx.globalAlpha = Math.min(1, token.alpha + 0.18);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(token.x, token.y, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.globalAlpha = 1;
    }

    let sweepCounter = 0;

    function animate(timestamp) {
        const timeSec = timestamp * 0.001;

        instances.forEach(instance => {
            if (!document.body.contains(instance.element)) {
                unmountBanner(instance.element);
                return;
            }

            const currentType = getBannerType(instance.element);
            if (!currentType) {
                unmountBanner(instance.element);
                return;
            }

            if (!instance.canvas.isConnected) {
                unmountBanner(instance.element);
                return;
            }

            if (instance.type !== currentType) {
                instance.type = currentType;
                instance.tokens = [];
                resizeInstance(instance);
            }

            if (instance.element.getBoundingClientRect().height < MIN_HEIGHT) return;
            if (Math.abs(instance.width - instance.element.clientWidth) > 1 || Math.abs(instance.height - instance.element.clientHeight) > 1) {
                resizeInstance(instance);
            }

            if (instance.type === 'equation') drawEquation(instance, timeSec);
            else drawPhysics(instance, timeSec);
        });

        sweepCounter += 1;
        if (sweepCounter % 180 === 0) {
            scan(document);
        }

        requestAnimationFrame(animate);
    }

    function unmountBanner(element) {
        if (!(element instanceof HTMLElement)) return;

        const instance = instanceMap.get(element);
        if (instance) {
            instances.delete(instance);
            instanceMap.delete(element);
            if (instance.canvas && instance.canvas.parentElement === element) {
                instance.canvas.remove();
            }
        }

        element.querySelectorAll('.banner-sim-canvas').forEach(canvas => {
            if (canvas.parentElement === element) canvas.remove();
        });

        delete element.dataset.bannerSimMounted;
    }

    function mountBanner(element) {
        if (!(element instanceof HTMLElement)) return;
        const bannerType = getBannerType(element);
        if (!bannerType) {
            unmountBanner(element);
            return;
        }

        const existing = instanceMap.get(element);
        if (existing) {
            if (existing.type !== bannerType) {
                existing.type = bannerType;
                existing.tokens = [];
            }
            return;
        }

        if (element.getBoundingClientRect().height < MIN_HEIGHT) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'banner-sim-canvas';
        element.appendChild(canvas);

        const instance = {
            element,
            canvas,
            ctx: canvas.getContext('2d'),
            type: bannerType,
            width: 0,
            height: 0,
            tokens: []
        };

        if (!instance.ctx) return;
        resizeInstance(instance);
        instances.add(instance);
        instanceMap.set(element, instance);
        element.dataset.bannerSimMounted = '1';
    }

    function scan(root = document) {
        if (!(root instanceof Element || root instanceof Document)) return;
        const elements = root.querySelectorAll('.banner-equation-sim, .banner-physics-sim');
        elements.forEach(mountBanner);
    }

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
                if (isSimBanner(mutation.target)) mountBanner(mutation.target);
                else unmountBanner(mutation.target);
                continue;
            }

            mutation.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches('.banner-equation-sim, .banner-physics-sim')) mountBanner(node);
                scan(node);
            });
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        scan(document);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    });

    if (!window.ZenPyBannerSim) {
        window.ZenPyBannerSim = { scan };
        requestAnimationFrame(animate);
    }
})();
