/**
 * Starfield — Cinematic space travel with mood-driven camera presets
 * 
 * Mood controls:
 * - Star count (density)
 * - Flow direction (center-zoom, drift-left, rise-up, converge)
 * - Speed
 * - Brightness range
 * - Flare frequency
 * 
 * Camera presets:
 * - calm:   few stars, center zoom outward, very slow — gazing into endless void
 * - wonder: more stars appearing, slight upward drift — something is out there
 * - awe:    dense field, faster, stars streaming past — travelling through revelation
 * - weight: stars slow to near-stop, dim, sinking — the weight of eternity
 */

(function () {
    'use strict';

    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    let planets = [];
    let animFrame;

    // ===== CAMERA PRESETS =====
    const CAMERAS = {
        calm: {
            starCount: 350,
            speed: 0.03,
            direction: 'center-zoom',
            brightnessRange: [0.04, 0.25],
            flareChance: 0.0008,
            planetCount: 2,
        },
        wonder: {
            starCount: 600,
            speed: 0.045,
            direction: 'rise',
            brightnessRange: [0.06, 0.35],
            flareChance: 0.002,
            planetCount: 2,
        },
        awe: {
            starCount: 1200,
            speed: 0.09,
            direction: 'center-zoom',
            brightnessRange: [0.08, 0.5],
            flareChance: 0.004,
            planetCount: 3,
        },
        weight: {
            starCount: 400,
            speed: 0.01,
            direction: 'sink',
            brightnessRange: [0.03, 0.15],
            flareChance: 0.0003,
            planetCount: 1,
        }
    };

    // ===== STATE =====
    let currentCamera = CAMERAS.calm;
    let targetCamera = CAMERAS.calm;
    let lerpProgress = 1;
    const LERP_SPEED = 0.008;

    // Lightspeed state
    let lightspeedPhase = 'idle'; // idle | accelerating | cruising | decelerating
    let lightspeedTimer = 0;
    let lightspeedStretch = 1; // 1 = normal, higher = streaked
    let lightspeedBoost = 1;  // speed multiplier

    // Interpolated values (what's actually rendering)
    let activeSpeed = currentCamera.speed;
    let activeBrightnessMin = currentCamera.brightnessRange[0];
    let activeBrightnessMax = currentCamera.brightnessRange[1];
    let activeFlareChance = currentCamera.flareChance;
    let activeDirection = currentCamera.direction;
    let targetStarCount = currentCamera.starCount;

    // ===== INIT =====
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Star color palette — real stellar classification colors
    const STAR_COLORS = [
        { r: 210, g: 225, b: 255 },  // blue-white (hot O/B class)
        { r: 255, g: 240, b: 220 },  // warm white (sun-like G class)
        { r: 195, g: 215, b: 255 },  // cool blue (A class)
        { r: 255, g: 220, b: 180 },  // yellow-orange (K class)
        { r: 255, g: 195, b: 170 },  // orange-red (M class, red giants)
        { r: 230, g: 235, b: 255 },  // pale blue-white
        { r: 255, g: 252, b: 240 },  // pure white (F class)
    ];

    function pickStarColor() {
        // Weighted distribution: mostly blue/white, fewer warm/red
        const roll = Math.random();
        if (roll < 0.35) return STAR_COLORS[0];      // blue-white
        if (roll < 0.55) return STAR_COLORS[6];      // pure white
        if (roll < 0.70) return STAR_COLORS[5];      // pale blue-white
        if (roll < 0.82) return STAR_COLORS[2];      // cool blue
        if (roll < 0.90) return STAR_COLORS[1];      // warm white
        if (roll < 0.96) return STAR_COLORS[3];      // yellow-orange
        return STAR_COLORS[4];                        // orange-red (rare)
    }

    function createStar(nearCenter) {
        const cx = width / 2;
        const cy = height / 2;
        let x, y;

        if (nearCenter) {
            // Spread across most of the screen, not just dead center
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * Math.min(width, height) * 0.4 + 20;
            x = cx + Math.cos(angle) * dist;
            y = cy + Math.sin(angle) * dist;
        } else {
            x = Math.random() * width;
            y = Math.random() * height;
        }

        const isBright = Math.random() < 0.08;
        const color = pickStarColor();

        return {
            x: x,
            y: y,
            z: Math.random() * 2.5 + 0.3,
            baseRadius: isBright ? (Math.random() * 0.6 + 0.4) : (Math.random() * 0.3 + 0.08),
            brightness: lerp(activeBrightnessMin, activeBrightnessMax, Math.random()),
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.012 + 0.002,
            isBright: isBright,
            flareTimer: 0,
            flareActive: false,
            life: 1, // for fade-in/out when count changes
            dying: false,
            color: color
        };
    }

    function createPlanet() {
        const colors = [
            'rgba(70, 95, 155, 0.2)',
            'rgba(110, 75, 55, 0.15)',
            'rgba(55, 75, 95, 0.2)',
            'rgba(90, 60, 100, 0.12)',
        ];
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.8 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: (Math.random() - 0.5) * 0.015
        };
    }

    function init() {
        resize();
        stars = [];
        planets = [];
        for (let i = 0; i < currentCamera.starCount; i++) {
            stars.push(createStar(false));
        }
        for (let i = 0; i < currentCamera.planetCount; i++) {
            planets.push(createPlanet());
        }
    }

    // ===== PUBLIC: SET MOOD =====
    window.setStarfieldMood = function (mood) {
        const cam = CAMERAS[mood];
        if (!cam || cam === targetCamera) return;

        targetCamera = cam;
        lerpProgress = 0;
        activeDirection = cam.direction;
        targetStarCount = cam.starCount;
        adjustStarCount();
    };

    // ===== PUBLIC: TRIGGER LIGHTSPEED =====
    // Now scroll-driven: engage/disengage, not fire-and-forget
    window.triggerLightspeed = function () {
        if (lightspeedPhase === 'idle') {
            console.log('[Starfield] Lightspeed ENGAGE');
            lightspeedPhase = 'accelerating';
            lightspeedTimer = 0;
            activeDirection = 'center-zoom';
            // Spawn extra stars — with more color variety (warmer mix)
            var extraStars = 600;
            for (var i = 0; i < extraStars; i++) {
                var s = createStar(true);
                s.life = 0;
                // Override color: more warm stars during lightspeed
                var roll = Math.random();
                if (roll < 0.25) s.color = { r: 255, g: 200, b: 140 }; // warm gold
                else if (roll < 0.40) s.color = { r: 200, g: 160, b: 255 }; // lavender
                else if (roll < 0.55) s.color = { r: 140, g: 200, b: 255 }; // ice blue
                else if (roll < 0.65) s.color = { r: 255, g: 160, b: 120 }; // salmon/orange
                else if (roll < 0.75) s.color = { r: 180, g: 255, b: 200 }; // mint green
                // else keep original random color
                stars.push(s);
            }
        }
    };

    window.endLightspeed = function () {
        if (lightspeedPhase === 'cruising' || lightspeedPhase === 'accelerating') {
            console.log('[Starfield] Lightspeed DISENGAGE');
            lightspeedPhase = 'decelerating';
            lightspeedTimer = 0;
            // Mark extra stars as dying (back to target count)
            var excess = stars.length - targetStarCount;
            for (var i = stars.length - 1; i >= 0 && excess > 0; i--) {
                if (!stars[i].dying) {
                    stars[i].dying = true;
                    excess--;
                }
            }
        }
    };

    function adjustStarCount() {
        const diff = targetStarCount - stars.length;

        if (diff > 0) {
            // Add stars (spawn near center, they'll drift out)
            for (let i = 0; i < diff; i++) {
                const s = createStar(true);
                s.life = 0; // fade in
                stars.push(s);
            }
        } else if (diff < 0) {
            // Mark excess stars as dying
            let toKill = Math.abs(diff);
            for (let i = stars.length - 1; i >= 0 && toKill > 0; i--) {
                if (!stars[i].dying) {
                    stars[i].dying = true;
                    toKill--;
                }
            }
        }
    }

    // ===== UPDATE =====
    function update() {
        // Lightspeed phase management
        // No streaks — instead: more stars, brighter, faster center-zoom, nebula intensifies
        if (lightspeedPhase !== 'idle') {
            lightspeedTimer++;
            if (lightspeedPhase === 'accelerating') {
                const t = Math.min(1, lightspeedTimer / 90);
                const curve = t * t;
                lightspeedBoost = 1 + curve * 20;  // much faster
                lightspeedStretch = 1;
                activeBrightnessMin = lerp(activeBrightnessMin, 0.3, curve * 0.08);
                activeBrightnessMax = lerp(activeBrightnessMax, 1.0, curve * 0.08);
                if (lightspeedTimer >= 90) {
                    lightspeedPhase = 'cruising';
                    lightspeedTimer = 0;
                }
            } else if (lightspeedPhase === 'cruising') {
                lightspeedBoost = 21;
                lightspeedStretch = 1;
                activeBrightnessMin = lerp(activeBrightnessMin, 0.3, 0.03);
                activeBrightnessMax = lerp(activeBrightnessMax, 1.0, 0.03);
            } else if (lightspeedPhase === 'decelerating') {
                const t = 1 - Math.min(1, lightspeedTimer / 90);
                const curve = t * t;
                lightspeedBoost = 1 + curve * 20;
                lightspeedStretch = 1;
                if (lightspeedTimer >= 90) {
                    lightspeedPhase = 'idle';
                    lightspeedStretch = 1;
                    lightspeedBoost = 1;
                }
            }
        }

        // Lerp camera values
        if (lerpProgress < 1) {
            lerpProgress = Math.min(1, lerpProgress + LERP_SPEED);
            const t = easeInOut(lerpProgress);

            activeSpeed = lerp(activeSpeed, targetCamera.speed, t * 0.02);
            activeBrightnessMin = lerp(activeBrightnessMin, targetCamera.brightnessRange[0], t * 0.02);
            activeBrightnessMax = lerp(activeBrightnessMax, targetCamera.brightnessRange[1], t * 0.02);
            activeFlareChance = lerp(activeFlareChance, targetCamera.flareChance, t * 0.02);
        }

        const cx = width / 2;
        const cy = height / 2;

        for (let i = stars.length - 1; i >= 0; i--) {
            const s = stars[i];

            // Life management (fade in / fade out)
            if (s.dying) {
                s.life -= 0.008;
                if (s.life <= 0) {
                    stars.splice(i, 1);
                    continue;
                }
            } else if (s.life < 1) {
                s.life = Math.min(1, s.life + 0.01);
            }

            // Movement based on direction (boosted during lightspeed)
            const speed = activeSpeed * s.z * 0.4 * lightspeedBoost;

            // During lightspeed, force center-zoom regardless of current direction
            const dir = (lightspeedPhase !== 'idle') ? 'center-zoom' : activeDirection;

            switch (dir) {
                case 'center-zoom':
                    // Expand from center
                    const dx = s.x - cx;
                    const dy = s.y - cy;
                    s.x += dx * speed * 0.012;
                    s.y += dy * speed * 0.012;
                    break;

                case 'rise':
                    // Drift upward with slight spread
                    s.y -= speed * 0.8;
                    s.x += (Math.sin(s.twinklePhase * 0.5) * speed * 0.1);
                    break;

                case 'sink':
                    // Slowly fall
                    s.y += speed * 0.5;
                    s.x += (Math.cos(s.twinklePhase * 0.3) * speed * 0.05);
                    break;

                case 'drift-left':
                    // Horizontal drift
                    s.x -= speed * 0.7;
                    s.y += Math.sin(s.twinklePhase) * speed * 0.05;
                    break;
            }

            // Twinkle
            s.twinklePhase += s.twinkleSpeed;

            // Flare
            if (s.isBright && !s.flareActive && Math.random() < activeFlareChance) {
                s.flareActive = true;
                s.flareTimer = 0;
            }
            if (s.flareActive) {
                s.flareTimer++;
                if (s.flareTimer > 120) s.flareActive = false;
            }

            // Respawn if out of bounds
            if (s.x < -20 || s.x > width + 20 || s.y < -20 || s.y > height + 20) {
                respawnStar(s);
            }
        }

        // Planets
        for (let i = 0; i < planets.length; i++) {
            const p = planets[i];
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < -30 || p.x > width + 30) p.speedX *= -1;
            if (p.y < -30 || p.y > height + 30) p.speedY *= -1;
        }
    }

    function respawnStar(s) {
        const cx = width / 2;
        const cy = height / 2;

        switch (activeDirection) {
            case 'center-zoom':
                // Respawn near center
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 40 + 5;
                s.x = cx + Math.cos(angle) * dist;
                s.y = cy + Math.sin(angle) * dist;
                break;
            case 'rise':
                // Respawn at bottom
                s.x = Math.random() * width;
                s.y = height + 10;
                break;
            case 'sink':
                // Respawn at top
                s.x = Math.random() * width;
                s.y = -10;
                break;
            case 'drift-left':
                // Respawn at right
                s.x = width + 10;
                s.y = Math.random() * height;
                break;
        }
        s.z = Math.random() * 3 + 0.5;
        s.brightness = lerp(activeBrightnessMin, activeBrightnessMax, Math.random());
    }

    // ===== DRAW =====
    function draw() {
        ctx.clearRect(0, 0, width, height);

        // During lightspeed: warm center glow (brighter, more vibrant)
        if (lightspeedPhase !== 'idle') {
            const intensity = Math.min(1, (lightspeedBoost - 1) / 8);
            const cx = width / 2;
            const cy = height / 2;
            const glowRadius = Math.max(width, height) * 0.5 * intensity;
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
            gradient.addColorStop(0, 'rgba(220, 200, 255, ' + (intensity * 0.12) + ')');
            gradient.addColorStop(0.3, 'rgba(160, 140, 220, ' + (intensity * 0.06) + ')');
            gradient.addColorStop(1, 'rgba(80, 60, 140, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Planets
        for (let i = 0; i < planets.length; i++) {
            const p = planets[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        // Stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            const twinkle = 0.7 + 0.3 * Math.sin(s.twinklePhase);
            let alpha = s.brightness * twinkle * s.life;
            let radius = s.baseRadius;

            // During lightspeed: bigger, brighter, but preserve color
            if (lightspeedPhase !== 'idle') {
                const boost = Math.min(5, (lightspeedBoost - 1) * 0.25);
                alpha = Math.min(0.85, alpha * (1 + boost)); // cap at 0.85 to preserve color tint
                radius = radius * (1 + boost * 0.5); // much bigger dots
            }

            // Flare
            if (s.flareActive && lightspeedPhase === 'idle') {
                const progress = s.flareTimer / 120;
                const curve = Math.sin(progress * Math.PI);
                alpha = Math.min(1, alpha + curve * 0.4);
                radius = s.baseRadius + curve * 0.6;

                if (curve > 0.3) {
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, radius + 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + s.color.r + ',' + s.color.g + ',' + s.color.b + ',' + (curve * 0.06) + ')';
                    ctx.fill();
                }
            }

            // Draw as dots (no streaks)
            if (radius < 0.4) {
                ctx.fillStyle = 'rgba(' + s.color.r + ',' + s.color.g + ',' + s.color.b + ',' + alpha + ')';
                ctx.fillRect(s.x, s.y, radius * 2, radius * 2);
            } else {
                ctx.beginPath();
                ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + s.color.r + ',' + s.color.g + ',' + s.color.b + ',' + alpha + ')';
                ctx.fill();
            }
        }
    }

    // ===== UTILITIES =====
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeInOut(t) {
        return 0.5 - 0.5 * Math.cos(Math.PI * t);
    }

    // ===== LOOP =====
    function loop() {
        update();
        draw();
        animFrame = requestAnimationFrame(loop);
    }

    // ===== START =====
    init();
    loop();

    window.addEventListener('resize', resize);

})();
