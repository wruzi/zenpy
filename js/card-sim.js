// ============================================
// ZenPy - Profile Card Simulation Effects
// Simulated card themes for profile cards
// ============================================

(function () {
    const MIN_HEIGHT = 96;
    const instances = new Set();
    const instanceMap = new WeakMap();

    function getDevicePixelRatio() {
        return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    }

    function getTheme(element) {
        const classList = element.classList;

        if (classList.contains('card-sim-planets')) {
            return {
                key: 'planets',
                stars: '#b6dcff',
                glow: 'rgba(105, 184, 255, 0.28)',
                primary: '#79c7ff',
                secondary: '#8c9dff'
            };
        }

        if (classList.contains('card-sim-flowerfield')) {
            return {
                key: 'flowerfield',
                stars: '#ffd0e9',
                glow: 'rgba(255, 143, 204, 0.26)',
                primary: '#ff9fd4',
                secondary: '#b6ffcf'
            };
        }

        if (classList.contains('card-sim-crystals')) {
            return {
                key: 'crystals',
                stars: '#d2f7ff',
                glow: 'rgba(143, 238, 255, 0.24)',
                primary: '#9af1ff',
                secondary: '#c7f7ff'
            };
        }

        if (classList.contains('card-sim-lotus')) {
            return {
                key: 'lotus',
                stars: '#d8ffe1',
                glow: 'rgba(159, 255, 177, 0.22)',
                primary: '#adffc0',
                secondary: '#f2ffd8'
            };
        }

        if (classList.contains('card-sim-ambient')) {
            return {
                key: 'ambient',
                stars: '#cbe7ff',
                glow: 'rgba(140, 198, 255, 0.14)',
                primary: '#9ed0ff',
                secondary: '#c9e8ff'
            };
        }

        return null;
    }

    function isSimCard(element) {
        return !!getTheme(element);
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function makeStars(width, height, amount) {
        return Array.from({ length: amount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: randomRange(0.4, 1.5),
            speed: randomRange(0.015, 0.06),
            drift: randomRange(-0.03, 0.03)
        }));
    }

    function makeThemeData(themeKey, width, height) {
        if (themeKey === 'planets') {
            return {
                stars: makeStars(width, height, 52),
                orbits: [
                    { cx: width * 0.25, cy: height * 0.52, radius: Math.min(width, height) * 0.22, speed: 0.55, size: 3.4 },
                    { cx: width * 0.72, cy: height * 0.48, radius: Math.min(width, height) * 0.26, speed: -0.4, size: 4.2 }
                ]
            };
        }

        if (themeKey === 'flowerfield') {
            return {
                petals: Array.from({ length: 18 }, () => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: randomRange(2.2, 4.2),
                    speedY: randomRange(0.12, 0.4),
                    sway: randomRange(0.6, 1.8),
                    phase: randomRange(0, Math.PI * 2)
                })),
                pollen: makeStars(width, height, 36)
            };
        }

        if (themeKey === 'crystals') {
            return {
                shards: Array.from({ length: 16 }, () => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: randomRange(4, 9),
                    spin: randomRange(-0.6, 0.6),
                    angle: randomRange(0, Math.PI * 2),
                    driftX: randomRange(-0.15, 0.15),
                    driftY: randomRange(0.08, 0.26)
                })),
                sparkles: makeStars(width, height, 44)
            };
        }

        if (themeKey === 'ambient') {
            return {
                stars: makeStars(width, height, 34),
                orbits: [
                    { cx: width * 0.24, cy: height * 0.45, radius: Math.min(width, height) * 0.14, speed: 0.2, size: 1.9 },
                    { cx: width * 0.74, cy: height * 0.58, radius: Math.min(width, height) * 0.12, speed: -0.16, size: 1.6 }
                ]
            };
        }

        return {
            petals: Array.from({ length: 20 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                size: randomRange(2.4, 4.6),
                speedY: randomRange(0.08, 0.28),
                sway: randomRange(0.4, 1.4),
                phase: randomRange(0, Math.PI * 2)
            })),
            ripples: Array.from({ length: 3 }, (_, index) => ({
                x: width * (0.25 + index * 0.24),
                y: height * (0.7 + (index % 2) * 0.08),
                phase: randomRange(0, Math.PI * 2)
            }))
        };
    }

    function drawDiamond(context, x, y, size) {
        context.beginPath();
        context.moveTo(x, y - size);
        context.lineTo(x + size, y);
        context.lineTo(x, y + size);
        context.lineTo(x - size, y);
        context.closePath();
    }

    function resizeInstance(instance) {
        const rectangle = instance.element.getBoundingClientRect();
        if (rectangle.width <= 0 || rectangle.height <= 0) return;

        const pixelRatio = getDevicePixelRatio();
        instance.canvas.width = Math.floor(rectangle.width * pixelRatio);
        instance.canvas.height = Math.floor(rectangle.height * pixelRatio);
        instance.canvas.style.width = `${Math.floor(rectangle.width)}px`;
        instance.canvas.style.height = `${Math.floor(rectangle.height)}px`;

        instance.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        instance.width = rectangle.width;
        instance.height = rectangle.height;
        instance.data = makeThemeData(instance.theme.key, rectangle.width, rectangle.height);
    }

    function drawPlanets(instance, timeSec) {
        const { context, width, height, data, theme } = instance;

        context.fillStyle = theme.stars;
        data.stars.forEach(star => {
            star.x += star.speed;
            star.y += star.drift;
            if (star.x > width + 2) star.x = -2;
            if (star.y > height + 2) star.y = -2;
            if (star.y < -2) star.y = height + 2;

            context.globalAlpha = 0.35 + (star.size * 0.2);
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();
        });

        data.orbits.forEach((orbit, index) => {
            context.globalAlpha = 0.22;
            context.strokeStyle = theme.glow;
            context.beginPath();
            context.ellipse(orbit.cx, orbit.cy, orbit.radius, orbit.radius * 0.58, 0, 0, Math.PI * 2);
            context.stroke();

            const angle = timeSec * orbit.speed + index * 1.7;
            const planetX = orbit.cx + Math.cos(angle) * orbit.radius;
            const planetY = orbit.cy + Math.sin(angle) * orbit.radius * 0.58;
            context.globalAlpha = 0.9;
            context.fillStyle = index === 0 ? theme.primary : theme.secondary;
            context.beginPath();
            context.arc(planetX, planetY, orbit.size, 0, Math.PI * 2);
            context.fill();
        });

        context.globalAlpha = 1;
    }

    function drawFlowerfield(instance, timeSec) {
        const { context, width, height, data, theme } = instance;

        data.pollen.forEach(dot => {
            dot.x += dot.speed * 0.55;
            dot.y += dot.drift;
            if (dot.x > width + 2) dot.x = -2;
            if (dot.y > height + 2) dot.y = -2;
            if (dot.y < -2) dot.y = height + 2;

            context.globalAlpha = 0.22 + dot.size * 0.18;
            context.fillStyle = theme.secondary;
            context.beginPath();
            context.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
            context.fill();
        });

        data.petals.forEach((petal, index) => {
            petal.y += petal.speedY;
            petal.x += Math.sin(timeSec * petal.sway + petal.phase) * 0.2;
            if (petal.y > height + 8) {
                petal.y = -8;
                petal.x = Math.random() * width;
            }

            context.save();
            context.translate(petal.x, petal.y);
            context.rotate((timeSec * 0.7) + index);
            context.globalAlpha = 0.72;
            context.fillStyle = index % 2 === 0 ? theme.primary : theme.secondary;
            context.beginPath();
            context.ellipse(0, 0, petal.size * 1.2, petal.size * 0.62, 0, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        context.globalAlpha = 1;
    }

    function drawCrystals(instance, timeSec) {
        const { context, width, height, data, theme } = instance;

        data.sparkles.forEach(spark => {
            spark.x += spark.speed;
            if (spark.x > width + 2) spark.x = -2;

            context.globalAlpha = 0.2 + spark.size * 0.15;
            context.strokeStyle = theme.secondary;
            context.beginPath();
            context.moveTo(spark.x - 1.6, spark.y);
            context.lineTo(spark.x + 1.6, spark.y);
            context.moveTo(spark.x, spark.y - 1.6);
            context.lineTo(spark.x, spark.y + 1.6);
            context.stroke();
        });

        data.shards.forEach(shard => {
            shard.y += shard.driftY;
            shard.x += shard.driftX;
            shard.angle += shard.spin * 0.012;
            if (shard.y > height + 12) {
                shard.y = -10;
                shard.x = Math.random() * width;
            }

            context.save();
            context.translate(shard.x, shard.y);
            context.rotate(shard.angle + timeSec * 0.25);
            context.globalAlpha = 0.55;
            context.fillStyle = theme.primary;
            drawDiamond(context, 0, 0, shard.size * 0.45);
            context.fill();
            context.globalAlpha = 0.92;
            context.strokeStyle = theme.secondary;
            context.stroke();
            context.restore();
        });

        context.globalAlpha = 1;
    }

    function drawLotus(instance, timeSec) {
        const { context, width, height, data, theme } = instance;

        data.petals.forEach((petal, index) => {
            petal.y += petal.speedY;
            petal.x += Math.sin(timeSec * petal.sway + petal.phase) * 0.24;
            if (petal.y > height + 8) {
                petal.y = -8;
                petal.x = Math.random() * width;
            }

            context.save();
            context.translate(petal.x, petal.y);
            context.rotate(Math.sin(timeSec + index) * 0.55);
            context.globalAlpha = 0.62;
            context.fillStyle = index % 2 === 0 ? theme.primary : theme.secondary;
            context.beginPath();
            context.ellipse(0, 0, petal.size * 1.1, petal.size * 0.52, 0, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });

        data.ripples.forEach((ripple, index) => {
            const radius = 8 + Math.abs(Math.sin(timeSec * 1.2 + ripple.phase)) * 14;
            context.globalAlpha = 0.28;
            context.strokeStyle = theme.glow;
            context.beginPath();
            context.ellipse(ripple.x, ripple.y, radius, radius * 0.45, 0, 0, Math.PI * 2);
            context.stroke();

            if (index === 1) {
                context.globalAlpha = 0.68;
                context.fillStyle = theme.primary;
                context.beginPath();
                context.ellipse(ripple.x, ripple.y - 5, 6, 2.7, 0, 0, Math.PI * 2);
                context.fill();
            }
        });

        context.globalAlpha = 1;
    }

    function drawFrame(instance, timestampMs) {
        const timeSec = timestampMs * 0.001;
        const { context, width, height, theme } = instance;

        context.clearRect(0, 0, width, height);

        if (theme.key === 'planets') drawPlanets(instance, timeSec);
        else if (theme.key === 'flowerfield') drawFlowerfield(instance, timeSec);
        else if (theme.key === 'crystals') drawCrystals(instance, timeSec);
        else if (theme.key === 'ambient') drawPlanets(instance, timeSec);
        else drawLotus(instance, timeSec);
    }

    function unmount(element) {
        if (!(element instanceof HTMLElement)) return;

        const instance = instanceMap.get(element);
        if (instance) {
            instances.delete(instance);
            instanceMap.delete(element);
            if (instance.canvas && instance.canvas.parentElement === element) {
                instance.canvas.remove();
            }
        }

        element.querySelectorAll('.card-sim-canvas').forEach(canvas => {
            if (canvas.parentElement === element) canvas.remove();
        });

        delete element.dataset.cardSimMounted;
    }

    function mount(element) {
        if (!(element instanceof HTMLElement)) return;

        const theme = getTheme(element);
        if (!theme) {
            unmount(element);
            return;
        }

        const existing = instanceMap.get(element);
        if (existing) {
            if (existing.theme.key !== theme.key) {
                existing.theme = theme;
                resizeInstance(existing);
            }
            return;
        }

        const rectangle = element.getBoundingClientRect();
        if (rectangle.height < MIN_HEIGHT || rectangle.width <= 0) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'card-sim-canvas';
        element.appendChild(canvas);

        const context = canvas.getContext('2d');
        if (!context) return;

        const instance = {
            element,
            canvas,
            context,
            theme,
            width: rectangle.width,
            height: rectangle.height,
            data: null
        };

        resizeInstance(instance);
        instances.add(instance);
        instanceMap.set(element, instance);
        element.dataset.cardSimMounted = '1';
    }

    function scan(root = document) {
        if (!(root instanceof Element || root instanceof Document)) return;
        const targets = root.querySelectorAll('.card-sim-planets, .card-sim-flowerfield, .card-sim-crystals, .card-sim-lotus, .card-sim-ambient');
        targets.forEach(mount);
    }

    function animate(timestampMs) {
        instances.forEach(instance => {
            if (!document.body.contains(instance.element)) {
                unmount(instance.element);
                return;
            }

            if (!isSimCard(instance.element)) {
                unmount(instance.element);
                return;
            }

            if (!instance.canvas.isConnected) {
                unmount(instance.element);
                return;
            }

            if (Math.abs(instance.width - instance.element.clientWidth) > 1 || Math.abs(instance.height - instance.element.clientHeight) > 1) {
                resizeInstance(instance);
            }

            drawFrame(instance, timestampMs);
        });

        requestAnimationFrame(animate);
    }

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
                if (isSimCard(mutation.target)) mount(mutation.target);
                else unmount(mutation.target);
                continue;
            }

            mutation.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (isSimCard(node)) mount(node);
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

    if (!window.ZenPyCardSim) {
        window.ZenPyCardSim = { scan };
        requestAnimationFrame(animate);
    }
})();
