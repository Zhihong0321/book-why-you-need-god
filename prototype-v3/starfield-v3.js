/**
 * ============================================================
 * STARFIELD ENGINE V3 — Cinematic Reading Experience
 * ============================================================
 * 
 * PURPOSE:
 * This file controls the star canvas layer. It renders stars with
 * realistic depth (3 layers), rotation, and mood-driven behavior.
 * 
 * HOW TO USE THIS TEMPLATE:
 * When designing a new chapter, modify the CAMERAS object below.
 * Each mood preset controls how the starfield looks and feels.
 * You can also create NEW mood presets for custom chapter needs.
 * 
 * ============================================================
 * DESIGN GUIDE — What each parameter does:
 * ============================================================
 * 
 * starCount:      Number of stars visible (200–1800)
 *                 Low = lonely, empty void
 *                 High = dense star field, overwhelming
 * 
 * speed:          How fast stars drift (0.01–0.15)
 *                 Low = frozen, contemplative
 *                 High = rushing, traveling
 * 
 * direction:      Which way stars flow:
 *                 'center-zoom' = expanding outward from center (traveling forward)
 *                 'rise'        = floating upward (hope, ascension)
 *                 'sink'        = falling downward (weight, gravity, despair)
 *                 'drift-left'  = horizontal drift (time passing, journey)
 *                 'clockwise'   = rotating clockwise (grounding, rotational movement)
 *                 'anticlockwise'= rotating counter-clockwise (otherworldly, rotational movement)
 * 
 * brightnessRange: [min, max] star opacity (0.0–1.0)
 *                  Low min = many dim stars, feels distant
 *                  High max = bright vivid stars, feels alive
 *                  Narrow range = uniform look
 *                  Wide range = variety (some dim, some bright)
 * 
 * flareChance:    Probability per frame that a bright star "flares" (0.0001–0.01)
 *                 Low = dead, still sky
 *                 High = twinkling, alive, active
 * 
 * rotationSpeed:  How fast the entire starfield rotates (0.00001–0.0003)
 *                 0.00003 = barely perceptible (1 rotation per ~58 minutes)
 *                 0.00008 = slow drift (1 rotation per ~21 minutes)
 *                 0.0002  = noticeable rotation (1 rotation per ~8 minutes)
 * 
 * rotationDir:    1 = clockwise, -1 = counter-clockwise
 *                 Clockwise feels natural, grounding
 *                 Counter-clockwise feels unsettling, otherworldly
 * 
 * ============================================================
 * DEPTH LAYERS — How the 3 layers create realism:
 * ============================================================
 * 
 * 'far'  — 45% of stars. Tiny, dim, slow, rendered as soft glow.
 *          Like stars millions of light-years away.
 * 
 * 'mid'  — 37% of stars. Medium size, moderate speed, slightly soft.
 *          The "normal" stars you'd see with naked eye.
 * 
 * 'near' — 18% of stars. Large, bright, fast, sharp crisp dots.
 *          Like nearby stars flying past your viewport.
 * 
 * The speed/size/brightness difference between layers creates
 * parallax — the illusion of 3D depth on a 2D screen.
 * 
 * ============================================================
 * LIGHTSPEED — What happens during chapter transitions:
 * ============================================================
 * 
 * When triggerLightspeed() is called:
 * - 700 extra SMALL stars spawn near center
 * - Stars accelerate outward (center-zoom forced)
 * - Near stars get much brighter (but NOT bigger)
 * - Far stars barely change (realistic parallax)
 * - Canvas rotation freezes (traveling straight)
 * - Duration: ~1.5s accelerate, cruise until endLightspeed(), ~1.5s decelerate
 * 
 * ============================================================
 * SUGGESTIONS FOR AI CHAPTER DESIGNERS:
 * ============================================================
 * 
 * - "Opening a chapter about God's silence":
 *   Use weight preset but with rotationSpeed: 0 (completely still)
 * 
 * - "Revelation moment — truth flooding in":
 *   Use awe preset with speed: 0.12 and starCount: 1600
 * 
 * - "Gentle invitation, reader is curious":
 *   Use wonder preset as-is, or increase rotationSpeed slightly
 * 
 * - "Transition from doubt to belief":
 *   Start with weight, transition to wonder mid-section
 * 
 * - "Climax — all evidence converges":
 *   Use awe with flareChance: 0.008 (stars flaring everywhere)
 * 
 * - To create a CUSTOM mood, add a new key to CAMERAS:
 *   CAMERAS.myCustomMood = { starCount: 800, speed: 0.07, ... }
 *   Then call: setStarfieldMood('myCustomMood')
 * 
 * ============================================================
 */

(function () {
    'use strict';

    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let width, height, virtualHeight, starsFar = [], starsMid = [], starsNear = [], frameCount = 0;
    let spriteCache = [], dustPattern1 = null, dustPattern2 = null;

    // ============================================================
    // CAMERA PRESETS — One per mood. Modify these to change the feel.
    // ============================================================
    const CAMERAS = {
        // CALM: Gazing into the void. Few stars, slow, dim, gentle clockwise drift.
        // Use for: opening sections, conclusions, reflective moments
        calm: {
            starCount: 500,           // moderate density
            speed: 0.04,              // slow drift
            direction: 'center-zoom', // expanding outward
            brightnessRange: [0.3, 0.7],  // visible but not overwhelming
            flareChance: 0.001,       // rare twinkles
            rotationSpeed: 0.00006,   // very slow rotation (~29 min/revolution)
            rotationDir: 1            // clockwise (natural, grounding)
        },

        // WONDER: Something is out there. More stars appearing, rising upward.
        // Use for: curiosity sections, questions being asked, exploration
        wonder: {
            starCount: 750,           // more stars gathering
            speed: 0.055,             // moderate drift upward
            direction: 'rise',        // floating up (hope, curiosity)
            brightnessRange: [0.35, 0.8],  // brighter, more alive
            flareChance: 0.0025,      // occasional twinkles
            rotationSpeed: 0.00012,   // slightly faster rotation (~14 min/rev)
            rotationDir: 1            // clockwise
        },

        // AWE: Traveling through revelation. Dense, fast, overwhelming.
        // Use for: evidence sections, proof tables, climax arguments
        awe: {
            starCount: 1400,          // dense star field
            speed: 0.1,               // fast expansion
            direction: 'center-zoom', // rushing forward through space
            brightnessRange: [0.4, 0.9],  // bright, vivid
            flareChance: 0.005,       // frequent flares (alive, active)
            rotationSpeed: 0.00005,   // slow counter-rotation (disorienting scale)
            rotationDir: -1           // counter-clockwise (otherworldly)
        },

        // WEIGHT: The weight of eternity. Stars sinking, dim, nearly still.
        // Use for: endings, "wall beyond is eternity", heavy conclusions
        weight: {
            starCount: 450,           // sparse
            speed: 0.015,             // barely moving
            direction: 'sink',        // falling downward (gravity, weight)
            brightnessRange: [0.2, 0.5],  // dim, fading
            flareChance: 0.0003,      // almost no flares (dead sky)
            rotationSpeed: 0.00003,   // barely perceptible (~58 min/rev)
            rotationDir: -1           // counter-clockwise (unsettling)
        },

        // EARTH: Standing on a mountain, looking up at the night sky.
        // Use for: grounded moments, "you are human", mortality, before launch
        // Fewer stars (atmosphere filters faint ones), slow horizontal drift (earth rotation),
        // dimmer overall, very gentle rotation — like a real night sky from a mountaintop.
        earth: {
            starCount: 300,           // sparse (atmosphere blocks faint stars)
            speed: 0.02,              // very slow drift
            direction: 'drift-left',  // horizontal (earth's rotation feel)
            brightnessRange: [0.15, 0.5],  // dimmer (atmosphere + light pollution)
            flareChance: 0.0008,      // rare twinkles
            rotationSpeed: 0.00004,   // very slow (~43 min/rev)
            rotationDir: 1            // clockwise (natural, grounded)
        },
        clockwise: {
            starCount: 750,
            speed: 0.055,
            direction: 'clockwise',
            brightnessRange: [0.35, 0.8],
            flareChance: 0.0025,
            rotationSpeed: 0.00012,
            rotationDir: 1
        },
        anticlockwise: {
            starCount: 750,
            speed: 0.055,
            direction: 'anticlockwise',
            brightnessRange: [0.35, 0.8],
            flareChance: 0.0025,
            rotationSpeed: 0.00012,
            rotationDir: -1
        }
    };

    // ============================================================
    // STATE — Internal engine state. Don't modify directly.
    // Use setStarfieldMood() to change moods.
    // ============================================================
    let targetCamera = CAMERAS.calm;
    let lerpProgress = 1;           // 1 = fully transitioned
    const LERP_SPEED = 0.008;       // how fast mood transitions happen

    // Lightspeed state
    let lightspeedPhase = 'idle';   // idle | accelerating | cruising | decelerating
    let lightspeedTimer = 0;
    let lightspeedBoost = 1;        // speed multiplier during lightspeed (1–21)

    // Active interpolated values (what's actually rendering right now)
    let activeSpeed = 0.04;
    let activeBrightnessMin = 0.3;
    let activeBrightnessMax = 0.7;
    let activeFlareChance = 0.001;
    let activeDirection = 'center-zoom';
    let targetStarCount = 500;

    // Canvas rotation
    let canvasRotation = 0;
    let activeRotationSpeed = CAMERAS.calm.rotationSpeed;
    let activeRotationDir = CAMERAS.calm.rotationDir;

    // Dust parallax offset
    let dustOffsetX = 0, dustOffsetY = 0;

    // Cached lightspeed gradient (avoid per-frame allocation)
    let lsGradient = null, lsLastIntensity = -1;

    // ============================================================
    // STAR COLORS — Based on real stellar classification
    // ============================================================
    // Includes standard spectral classes (0-6) and transition/lightspeed colors (7-11)
    const ALL_COLORS = [
        { r: 210, g: 225, b: 255 },  // 0: Blue-white (O/B class, hottest)
        { r: 255, g: 252, b: 240 },  // 1: Pure white (F class)
        { r: 230, g: 235, b: 255 },  // 2: Pale blue-white
        { r: 195, g: 215, b: 255 },  // 3: Cool blue (A class)
        { r: 255, g: 240, b: 220 },  // 4: Warm white (G class, sun-like)
        { r: 255, g: 220, b: 180 },  // 5: Yellow-orange (K class)
        { r: 255, g: 195, b: 170 },  // 6: Orange-red (M class, red giants, rare)
        { r: 255, g: 200, b: 140 },  // 7: Transition warm gold
        { r: 200, g: 160, b: 255 },  // 8: Transition lavender
        { r: 140, g: 200, b: 255 },  // 9: Transition ice blue
        { r: 255, g: 160, b: 120 },  // 10: Transition coral
        { r: 180, g: 255, b: 200 }   // 11: Transition mint
    ];

    function pickStarColor() {
        var roll = Math.random();
        if (roll < 0.35) return 0;  // 35% blue-white
        if (roll < 0.55) return 1;  // 20% pure white
        if (roll < 0.70) return 2;  // 15% pale blue
        if (roll < 0.82) return 3;  // 12% cool blue
        if (roll < 0.90) return 4;  // 8% warm white
        if (roll < 0.96) return 5;  // 6% yellow-orange
        return 6;                   // 4% orange-red (rare)
    }

    // ============================================================
    // STAR SIZE — Soft power-law distribution
    // ============================================================
    // Most stars are small, few are large. Mimics real magnitude distribution.
    function starRadius() {
        var u = Math.random();
        var minR = 0.15;   // smallest possible star (still visible)
        var maxR = 2.0;    // largest possible star
        var alpha = 2.0;   // distribution steepness
        return Math.min(maxR, minR * Math.pow(1 - u * (1 - Math.pow(minR / maxR, alpha - 1)), -1 / (alpha - 1)));
    }

    // ============================================================
    // DEPTH LAYERS — Creates parallax (3D illusion)
    // ============================================================
    var DEPTH = {
        far:  { speed: 0.1,  bright: 0.4, size: 0.35 },  // tiny pinpoints, almost static
        mid:  { speed: 0.6,  bright: 0.85, size: 0.9 },   // normal visible stars
        near: { speed: 2.5,  bright: 1.3, size: 2.0 }     // big, bright, fast
    };

    function assignLayer() {
        var r = Math.random();
        return r < 0.45 ? 'far' : r < 0.82 ? 'mid' : 'near';
    }

    // ============================================================
    // SCINTILLATION NOISE — Makes twinkle look natural
    // ============================================================
    var NTABLE = new Float32Array(256);
    for (var ni = 0; ni < 256; ni++) NTABLE[ni] = Math.random();

    function noise1D(t) {
        var i = (t | 0) & 255;
        var f = t - (t | 0);
        var s = f * f * (3 - 2 * f); // smoothstep interpolation
        return NTABLE[i] * (1 - s) + NTABLE[(i + 1) & 255] * s;
    }

    // Precalculate noise table for high performance twinkling
    const SCINT_TABLE_SIZE = 2048;
    const SCINTILLATION_TABLE = new Float32Array(SCINT_TABLE_SIZE);
    for (var si = 0; si < SCINT_TABLE_SIZE; si++) {
        var t = si * 0.1;
        var octave1 = noise1D(t * 1.0);           // slow base variation
        var octave2 = noise1D(t * 2.3 + 100) * 0.5;  // medium detail
        var octave3 = noise1D(t * 5.1 + 200) * 0.25; // fast micro-flicker
        SCINTILLATION_TABLE[si] = (octave1 + octave2 + octave3) / 1.75;
    }

    // ============================================================
    // SPRITE CACHE — Pre-rendered canvases for blazing fast drawImage
    // ============================================================
    function buildSpriteCache() {
        spriteCache = [];
        for (var c = 0; c < ALL_COLORS.length; c++) {
            var col = ALL_COLORS[c];
            var r = col.r, g = col.g, b = col.b;

            // 1. Far sprite (extremely soft blur)
            var farCanvas = document.createElement('canvas');
            farCanvas.width = farCanvas.height = 32;
            var fCtx = farCanvas.getContext('2d');
            var sg = fCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
            sg.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.7)');
            sg.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ',0.3)');
            sg.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
            fCtx.fillStyle = sg;
            fCtx.beginPath(); fCtx.arc(16, 16, 16, 0, Math.PI * 2); fCtx.fill();

            // 2. Mid sprite (slightly soft)
            var midCanvas = document.createElement('canvas');
            midCanvas.width = midCanvas.height = 32;
            var mCtx = midCanvas.getContext('2d');
            var mg = mCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
            mg.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1.0)');
            mg.addColorStop(0.6, 'rgba(' + r + ',' + g + ',' + b + ',0.4)');
            mg.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
            mCtx.fillStyle = mg;
            mCtx.beginPath(); mCtx.arc(16, 16, 16, 0, Math.PI * 2); mCtx.fill();

            // 3. Near sprite (sharp)
            var nearCanvas = document.createElement('canvas');
            nearCanvas.width = nearCanvas.height = 16;
            var nCtx = nearCanvas.getContext('2d');
            nCtx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
            nCtx.beginPath(); nCtx.arc(8, 8, 8, 0, Math.PI * 2); nCtx.fill();

            // 4. Halo sprite (sharp star + larger soft glow)
            var haloCanvas = document.createElement('canvas');
            haloCanvas.width = haloCanvas.height = 64;
            var hCtx = haloCanvas.getContext('2d');
            var hg = hCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
            hg.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.162)');
            hg.addColorStop(0.25, 'rgba(' + r + ',' + g + ',' + b + ',0.09)');
            hg.addColorStop(0.6, 'rgba(' + r + ',' + g + ',' + b + ',0.0216)');
            hg.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
            hCtx.fillStyle = hg;
            hCtx.beginPath(); hCtx.arc(32, 32, 32, 0, Math.PI * 2); hCtx.fill();
            hCtx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
            hCtx.beginPath(); hCtx.arc(32, 32, 8, 0, Math.PI * 2); hCtx.fill();

            // 5. Spikes sprite (JWST diffraction spikes + halo + star)
            var spikesCanvas = document.createElement('canvas');
            spikesCanvas.width = spikesCanvas.height = 128;
            var sCtx = spikesCanvas.getContext('2d');
            var shg = sCtx.createRadialGradient(64, 64, 0, 64, 64, 16);
            shg.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.162)');
            shg.addColorStop(0.25, 'rgba(' + r + ',' + g + ',' + b + ',0.09)');
            shg.addColorStop(0.6, 'rgba(' + r + ',' + g + ',' + b + ',0.0216)');
            shg.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
            sCtx.fillStyle = shg;
            sCtx.beginPath(); sCtx.arc(64, 64, 16, 0, Math.PI * 2); sCtx.fill();

            sCtx.save();
            sCtx.globalCompositeOperation = 'screen';
            var spikeLength = 54;
            for (var i = 0; i < 3; i++) {
                var angle = i * Math.PI / 3 + Math.PI / 6;

                var ex = 64 + Math.cos(angle) * spikeLength;
                var ey = 64 + Math.sin(angle) * spikeLength;
                var g1 = sCtx.createLinearGradient(64, 64, ex, ey);
                g1.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.3)');
                g1.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',0.12)');
                g1.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
                sCtx.beginPath(); sCtx.moveTo(64, 64); sCtx.lineTo(ex, ey);
                sCtx.strokeStyle = g1; sCtx.lineWidth = 1.0; sCtx.stroke();

                var ex2 = 64 - Math.cos(angle) * spikeLength;
                var ey2 = 64 - Math.sin(angle) * spikeLength;
                var g2 = sCtx.createLinearGradient(64, 64, ex2, ey2);
                g2.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.3)');
                g2.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',0.12)');
                g2.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
                sCtx.beginPath(); sCtx.moveTo(64, 64); sCtx.lineTo(ex2, ey2);
                sCtx.strokeStyle = g2; sCtx.lineWidth = 1.0; sCtx.stroke();
            }
            sCtx.restore();

            sCtx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
            sCtx.beginPath(); sCtx.arc(64, 64, 4, 0, Math.PI * 2); sCtx.fill();

            spriteCache.push({
                far: farCanvas,
                mid: midCanvas,
                near: nearCanvas,
                halo: haloCanvas,
                spikes: spikesCanvas
            });
        }
    }

    // ============================================================
    // CREATE STAR — Generates one star with all properties
    // ============================================================
    function createStar(nearCenter) {
        var cx = width / 2;
        var cyViewport = (-canvasCurrentY / 100) * window.innerHeight + window.innerHeight / 2;
        var x, y;
        var isRotational = (activeDirection === 'clockwise' || activeDirection === 'anticlockwise');

        if (nearCenter) {
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * Math.min(width, height) * 0.45 + 15;
            x = cx + Math.cos(angle) * dist;
            y = cyViewport + Math.sin(angle) * dist;
        } else if (isRotational) {
            // Spawn in a majestic off-screen rotational sector
            var cxRot = -width * 0.4;
            var cyRot = cyViewport + window.innerHeight * 2.0;
            var R_min = Math.sqrt(Math.pow(0.4 * width, 2) + Math.pow(1.5 * window.innerHeight, 2));
            var R_max = Math.sqrt(Math.pow(1.4 * width, 2) + Math.pow(2.5 * window.innerHeight, 2));
            var angleCenter = Math.atan2(-2.0 * window.innerHeight, 0.9 * width);
            var angle = angleCenter + (Math.random() - 0.5) * (Math.PI / 1.5); // 120-degree sector
            var dist = Math.sqrt(R_min * R_min + Math.random() * (R_max * R_max - R_min * R_min));
            x = cxRot + Math.cos(angle - canvasRotation) * dist;
            y = cyRot + Math.sin(angle - canvasRotation) * dist;
        } else {
            x = Math.random() * width;
            y = Math.random() * height;
        }

        var layer = assignLayer();
        var baseRadius = starRadius() * DEPTH[layer].size;

        return {
            x: x, y: y,
            layer: layer,
            baseRadius: baseRadius,
            brightness: lerp(activeBrightnessMin, activeBrightnessMax, Math.random()) * DEPTH[layer].bright,
            // Fast scintillation
            scintIndex: Math.random() * SCINT_TABLE_SIZE,
            scintSpeed: Math.random() * 0.06 + 0.01,
            // Movement wobble
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.01 + 0.002,
            // Visual features
            isBright: baseRadius > 0.8,
            hasSpikes: baseRadius > 1.5,
            // Flare state
            flareTimer: 0,
            flareActive: false,
            flareDuration: 90 + Math.floor(Math.random() * 80),
            // Lifecycle
            life: 1,
            dying: false,
            colorIndex: pickStarColor()
        };
    }

    function createAndAddStar(nearCenter, isDying) {
        var s = createStar(nearCenter);
        if (isDying) s.dying = true;
        if (s.layer === 'far') starsFar.push(s);
        else if (s.layer === 'mid') starsMid.push(s);
        else starsNear.push(s);
        return s;
    }

    // ============================================================
    // DUST LAYER — Optimized tiled pattern fills
    // ============================================================
    function initDust() {
        if (dustPattern1 && dustPattern2) return;

        // Pattern 1: slow background dust
        var canvas1 = document.createElement('canvas');
        canvas1.width = canvas1.height = 1024;
        var ctx1 = canvas1.getContext('2d');
        ctx1.fillStyle = 'rgba(200,210,230,0.05)';
        for (var i = 0; i < 800; i++) {
            var dx = Math.random() * 1024;
            var dy = Math.random() * 1024;
            var size = Math.random() * 0.35 + 0.1;
            ctx1.fillRect(dx, dy, size, size);
        }
        dustPattern1 = ctx.createPattern(canvas1, 'repeat');

        // Pattern 2: nearer parallax dust
        var canvas2 = document.createElement('canvas');
        canvas2.width = canvas2.height = 1024;
        var ctx2 = canvas2.getContext('2d');
        ctx2.fillStyle = 'rgba(200,210,230,0.085)';
        for (var i = 0; i < 600; i++) {
            var dx = Math.random() * 1024;
            var dy = Math.random() * 1024;
            var size = Math.random() * 0.35 + 0.1;
            ctx2.fillRect(dx, dy, size, size);
        }
        dustPattern2 = ctx.createPattern(canvas2, 'repeat');
    }

    // ============================================================
    // INIT & RESIZE
    // ============================================================
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        virtualHeight = height * 3;
        initDust();
    }

    function init() {
        resize();
        starsFar = [];
        starsMid = [];
        starsNear = [];
        if (spriteCache.length === 0) {
            buildSpriteCache();
        }
        var count = CAMERAS.calm.starCount;
        for (var i = 0; i < count; i++) {
            createAndAddStar(false, false);
        }
    }

    // ============================================================
    // PUBLIC API — Call these from app.js or mood engine
    // ============================================================

    /**
     * Switch starfield to a mood preset.
     * @param {string} mood - Key from CAMERAS object ('calm', 'wonder', 'awe', 'weight')
     * 
     * SUGGESTION: You can add custom moods to CAMERAS and call them here.
     * Example: CAMERAS.revelation = { starCount: 1600, speed: 0.12, ... }
     *          setStarfieldMood('revelation')
     */
    window.setStarfieldMood = function (mood) {
        var cam = CAMERAS[mood];
        if (!cam || cam === targetCamera) return;
        targetCamera = cam;
        lerpProgress = 0;
        activeDirection = cam.direction;
        targetStarCount = cam.starCount;
        adjustStarCount();
    };

    function markStarsDying(count) {
        var kill = count;
        var arrays = [starsNear, starsMid, starsFar];
        for (var a = 0; a < arrays.length && kill > 0; a++) {
            var arr = arrays[a];
            for (var i = arr.length - 1; i >= 0 && kill > 0; i--) {
                if (!arr[i].dying) {
                    arr[i].dying = true;
                    kill--;
                }
            }
        }
    }

    /**
     * Engage lightspeed (chapter transition effect).
     * Call this when reader enters a transition zone between chapters.
     * Stars: small only, no big blobs. Near=fast+bright, far=slow+dim.
     */
    window.triggerLightspeed = function () {
        if (lightspeedPhase !== 'idle') return;
        lightspeedPhase = 'accelerating';
        lightspeedTimer = 0;
        activeDirection = 'center-zoom';

        // Spawn 700 extra SMALL stars (no big stars during lightspeed — breaks immersion)
        for (var i = 0; i < 700; i++) {
            var s = createStar(true);
            s.life = 0; // will fade in

            // Force small radius — lightspeed stars are distant points streaking past
            s.baseRadius = 0.15 + Math.random() * 0.4; // max 0.55px
            s.isBright = false;
            s.hasSpikes = false;

            // Assign depth: more near/mid for speed variety (parallax effect)
            var layerRoll = Math.random();
            if (layerRoll < 0.4) {
                s.layer = 'near';
                s.brightness = 0.6 + Math.random() * 0.35; // bright
            } else if (layerRoll < 0.75) {
                s.layer = 'mid';
                s.brightness = 0.4 + Math.random() * 0.3;
            } else {
                s.layer = 'far';
                s.brightness = 0.2 + Math.random() * 0.2; // dim
            }

            // Colorful lightspeed palette
            var roll = Math.random();
            if (roll < 0.25) s.colorIndex = 7;      // warm gold
            else if (roll < 0.40) s.colorIndex = 8;  // lavender
            else if (roll < 0.55) s.colorIndex = 9;  // ice blue
            else if (roll < 0.65) s.colorIndex = 10; // coral
            else if (roll < 0.75) s.colorIndex = 11; // mint
            // else: keep random star color

            if (s.layer === 'far') starsFar.push(s);
            else if (s.layer === 'mid') starsMid.push(s);
            else starsNear.push(s);
        }
    };

    /**
     * Disengage lightspeed (start decelerating).
     * Call this when the next chapter's content starts appearing.
     */
    window.endLightspeed = function () {
        if (lightspeedPhase === 'cruising' || lightspeedPhase === 'accelerating') {
            lightspeedPhase = 'decelerating';
            lightspeedTimer = 0;
            // Mark excess stars for fade-out removal
            var totalCount = starsFar.length + starsMid.length + starsNear.length;
            var excess = totalCount - targetStarCount;
            if (excess > 0) {
                markStarsDying(excess);
            }
        }
    };

    // Adjust star count when mood changes (3x for tall canvas)
    function adjustStarCount() {
        var target = targetStarCount * 3;
        var totalCount = starsFar.length + starsMid.length + starsNear.length;
        var diff = target - totalCount;
        if (diff > 0) {
            for (var i = 0; i < diff; i++) {
                var s = createAndAddStar(true, false);
                s.life = 0;
            }
        } else if (diff < 0) {
            markStarsDying(-diff);
        }
    }

    // ============================================================
    // UPDATE — Runs every frame. Moves stars, handles lightspeed.
    // ============================================================
    function updateStarsArray(arr) {
        var cx = width / 2;
        var cy = (-canvasCurrentY / 100) * window.innerHeight + window.innerHeight / 2;
        var dir = (lightspeedPhase !== 'idle') ? 'center-zoom' : activeDirection;
        for (var i = arr.length - 1; i >= 0; i--) {
            var s = arr[i];

            // Fast scintillation index progression
            s.scintIndex += s.scintSpeed;
            if (s.scintIndex >= SCINT_TABLE_SIZE) s.scintIndex -= SCINT_TABLE_SIZE;

            // Lifecycle: fade in / fade out
            if (s.dying) {
                s.life -= 0.008;
                if (s.life <= 0) { arr.splice(i, 1); continue; }
            } else if (s.life < 1) {
                s.life = Math.min(1, s.life + 0.012);
            }

            // Speed = base speed × depth multiplier × lightspeed boost
            var speed = activeSpeed * DEPTH[s.layer].speed * lightspeedBoost;

            // Movement direction
            if (dir === 'center-zoom') {
                var dx = s.x - cx, dy = s.y - cy;
                s.x += dx * speed * 0.008;
                s.y += dy * speed * 0.008;
            }
            else if (dir === 'rise') {
                s.y -= speed * 0.6;
                s.x += Math.sin(s.twinklePhase * 0.5) * speed * 0.06;
            }
            else if (dir === 'sink') {
                s.y += speed * 0.4;
                s.x += Math.cos(s.twinklePhase * 0.3) * speed * 0.03;
            }
            else if (dir === 'drift-left') {
                s.x -= speed * 0.5;
                s.y += Math.sin(s.twinklePhase) * speed * 0.03;
            }

            s.twinklePhase += s.twinkleSpeed;

            // Flare trigger (random bright pulse on bright stars)
            if (s.isBright && !s.flareActive && Math.random() < activeFlareChance) {
                s.flareActive = true; s.flareTimer = 0;
            }
            if (s.flareActive) {
                s.flareTimer++;
                if (s.flareTimer > s.flareDuration) s.flareActive = false;
            }

            // Respawn when off-screen
            if (dir === 'clockwise' || dir === 'anticlockwise') {
                var cxRot = -width * 0.4;
                var cyRot = cy + window.innerHeight * 2.0;
                var dx = s.x - cxRot;
                var dy = s.y - cyRot;
                var cos = Math.cos(canvasRotation);
                var sin = Math.sin(canvasRotation);
                var rx = cxRot + dx * cos - dy * sin;
                var ry = cyRot + dx * sin + dy * cos;
                var ryScreen = ry + (canvasCurrentY / 100) * window.innerHeight;

                // Sector buffer off-screen bounds check
                if (rx < -150 || rx > width + 150 || ryScreen < -150 || ryScreen > window.innerHeight + 150) {
                    respawnStar(s);
                }
            } else {
                if (s.x < -30 || s.x > width + 30 || s.y < -30 || s.y > height + 30) {
                    respawnStar(s);
                }
            }
        }
    }

    function update() {
        frameCount++;

        // --- Canvas rotation: mood-driven, freezes during lightspeed ---
        if (lightspeedPhase === 'idle') {
            if (activeDirection === 'clockwise') {
                canvasRotation += activeSpeed * 0.004;
            } else if (activeDirection === 'anticlockwise') {
                canvasRotation -= activeSpeed * 0.004;
            } else {
                canvasRotation += activeRotationSpeed * activeRotationDir;
            }
        }

        // --- Lightspeed phase machine ---
        if (lightspeedPhase !== 'idle') {
            lightspeedTimer++;
            if (lightspeedPhase === 'accelerating') {
                var t = Math.min(1, lightspeedTimer / 90);
                lightspeedBoost = 1 + t * t * 20;
                activeBrightnessMin = lerp(activeBrightnessMin, 0.5, t * t * 0.1);
                activeBrightnessMax = lerp(activeBrightnessMax, 1.0, t * t * 0.1);
                if (lightspeedTimer >= 90) { lightspeedPhase = 'cruising'; lightspeedTimer = 0; }
            } else if (lightspeedPhase === 'cruising') {
                lightspeedBoost = 21;
                activeBrightnessMin = lerp(activeBrightnessMin, 0.5, 0.03);
                activeBrightnessMax = lerp(activeBrightnessMax, 1.0, 0.03);
            } else if (lightspeedPhase === 'decelerating') {
                var t2 = 1 - Math.min(1, lightspeedTimer / 90);
                lightspeedBoost = 1 + t2 * t2 * 20;
                if (lightspeedTimer >= 90) { lightspeedPhase = 'idle'; lightspeedBoost = 1; }
            }
        }

        // --- Smooth transition between mood presets ---
        if (lerpProgress < 1) {
            lerpProgress = Math.min(1, lerpProgress + LERP_SPEED);
            var t3 = easeInOut(lerpProgress);
            activeSpeed = lerp(activeSpeed, targetCamera.speed, t3 * 0.02);
            activeBrightnessMin = lerp(activeBrightnessMin, targetCamera.brightnessRange[0], t3 * 0.02);
            activeBrightnessMax = lerp(activeBrightnessMax, targetCamera.brightnessRange[1], t3 * 0.02);
            activeFlareChance = lerp(activeFlareChance, targetCamera.flareChance, t3 * 0.02);
            activeRotationSpeed = lerp(activeRotationSpeed, targetCamera.rotationSpeed, t3 * 0.02);
            if (t3 > 0.5) activeRotationDir = targetCamera.rotationDir;
        }

        // --- Dust parallax (very subtle background drift) ---
        var dustSpeed = activeSpeed * 0.12 * lightspeedBoost;
        var dir = (lightspeedPhase !== 'idle') ? 'center-zoom' : activeDirection;
        if (dir === 'center-zoom') { dustOffsetX += dustSpeed * 0.003; dustOffsetY += dustSpeed * 0.003; }
        else if (dir === 'rise') { dustOffsetY -= dustSpeed * 0.25; }
        else if (dir === 'sink') { dustOffsetY += dustSpeed * 0.15; }
        else if (dir === 'drift-left') { dustOffsetX -= dustSpeed * 0.2; }

        // --- Move stars (partitioned arrays) ---
        updateStarsArray(starsFar);
        updateStarsArray(starsMid);
        updateStarsArray(starsNear);
    }

    function respawnStar(s) {
        var cx = width / 2;
        var cy = (-canvasCurrentY / 100) * window.innerHeight + window.innerHeight / 2;
        if (activeDirection === 'center-zoom') {
            var a = Math.random() * Math.PI * 2;
            var d = (lightspeedPhase !== 'idle')
                ? Math.random() * 30 + 3
                : Math.random() * Math.min(width, height) * 0.15 + 20;
            s.x = cx + Math.cos(a) * d; s.y = cy + Math.sin(a) * d;
        }
        else if (activeDirection === 'rise') { s.x = Math.random() * width; s.y = height + 15; }
        else if (activeDirection === 'sink') { s.x = Math.random() * width; s.y = -15; }
        else if (activeDirection === 'clockwise' || activeDirection === 'anticlockwise') {
            // Spawn in a majestic off-screen rotational sector
            var cxRot = -width * 0.4;
            var cyRot = cy + window.innerHeight * 2.0;
            var R_min = Math.sqrt(Math.pow(0.4 * width, 2) + Math.pow(1.5 * window.innerHeight, 2));
            var R_max = Math.sqrt(Math.pow(1.4 * width, 2) + Math.pow(2.5 * window.innerHeight, 2));
            var angleCenter = Math.atan2(-2.0 * window.innerHeight, 0.9 * width);
            var angle = angleCenter + (Math.random() - 0.5) * (Math.PI / 1.5); // 120-degree sector
            var dist = Math.sqrt(R_min * R_min + Math.random() * (R_max * R_max - R_min * R_min));
            s.x = cxRot + Math.cos(angle - canvasRotation) * dist;
            s.y = cyRot + Math.sin(angle - canvasRotation) * dist;
        }
        else { s.x = width + 15; s.y = Math.random() * height; }
        s.brightness = lerp(activeBrightnessMin, activeBrightnessMax, Math.random()) * DEPTH[s.layer].bright;
        s.scintIndex = Math.random() * SCINT_TABLE_SIZE;
        s.life = 0;
    }

    // ============================================================
    // DRAW — Renders everything to canvas each frame
    // ============================================================
    function draw() {
        ctx.clearRect(0, 0, width, height);

        // During big bang animation: HIDE normal stars (they break immersion)
        if (bigbangPhase !== 'idle' && bigbangPhase !== 'done') return;

        // Apply canvas rotation (entire starfield rotates as one)
        ctx.save();
        var cx = width / 2;
        var cy = (-canvasCurrentY / 100) * window.innerHeight + window.innerHeight / 2;
        var isRotatedOffCenter = (activeDirection === 'clockwise' || activeDirection === 'anticlockwise');

        if (isRotatedOffCenter) {
            var cxRot = -width * 0.4;
            var cyRot = cy + window.innerHeight * 2.0;
            ctx.translate(cxRot, cyRot);
            ctx.rotate(canvasRotation);
            ctx.translate(-cxRot, -cyRot);
        } else {
            ctx.translate(cx, cy);
            ctx.rotate(canvasRotation);
            ctx.translate(-cx, -cy);
        }

        // Layer 0: Background dust (optimized tiled patterns)
        drawDust();

        // Lightspeed center glow (warm purple radial) — cached gradient
        if (lightspeedPhase !== 'idle') {
            var intensity = Math.min(1, (lightspeedBoost - 1) / 8);
            if (!lsGradient || lsLastIntensity !== intensity) {
                var glowR = Math.max(width, height) * 0.5 * intensity;
                lsGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
                lsGradient.addColorStop(0, 'rgba(220,200,255,' + (intensity * 0.15) + ')');
                lsGradient.addColorStop(0.3, 'rgba(160,140,220,' + (intensity * 0.08) + ')');
                lsGradient.addColorStop(1, 'rgba(80,60,140,0)');
                lsLastIntensity = intensity;
            }
            ctx.fillStyle = lsGradient;
            ctx.fillRect(-50, -50, width + 100, height + 100);
        }

        // Stars rendered by depth layer (using partitioned arrays):
        var i;
        for (i = 0; i < starsFar.length; i++) {
            drawStar(starsFar[i]);
        }
        for (i = 0; i < starsMid.length; i++) {
            drawStar(starsMid[i]);
        }
        for (i = 0; i < starsNear.length; i++) {
            drawStar(starsNear[i]);
        }

        ctx.globalAlpha = 1.0; // Reset alpha state
        ctx.restore(); // end rotation transform
    }

    // --- Dust: tiled repeating pattern fills with parallax offset ---
    function drawDust() {
        if (!dustPattern1 || !dustPattern2) return;

        // Layer 1: slower, deeper
        var dx1 = (dustOffsetX * 0.08) % 1024;
        var dy1 = (dustOffsetY * 0.08) % 1024;

        ctx.save();
        ctx.translate(dx1, dy1);
        ctx.fillStyle = dustPattern1;
        ctx.fillRect(-dx1, -dy1, width, height);
        ctx.restore();

        // Layer 2: faster, nearer
        var dx2 = (dustOffsetX * 0.18) % 1024;
        var dy2 = (dustOffsetY * 0.18) % 1024;

        ctx.save();
        ctx.translate(dx2, dy2);
        ctx.fillStyle = dustPattern2;
        ctx.fillRect(-dx2, -dy2, width, height);
        ctx.restore();
    }

    // ============================================================
    // DRAW STAR — Renders one star based on its depth layer (from sprite cache)
    // ============================================================
    function drawStar(s) {
        // Scintillation lookup
        var twinkle = 0.5 + 0.5 * SCINTILLATION_TABLE[(s.scintIndex | 0) & 2047];
        
        // Easing curve for smooth physical scaling & optical accumulation
        var scale = s.life * (2 - s.life); 
        var alpha = s.brightness * twinkle * scale;
        var radius = s.baseRadius * scale;

        // Lightspeed brightness boost
        if (lightspeedPhase !== 'idle') {
            var boost = Math.min(4, (lightspeedBoost - 1) * 0.2);
            if (s.layer === 'near') alpha = Math.min(0.95, alpha * (1 + boost * 2.0));
            else if (s.layer === 'mid') alpha = Math.min(0.85, alpha * (1 + boost * 1.0));
            else alpha = Math.min(0.6, alpha * (1 + boost * 0.2));
        }

        // Flare effect (periodic bright pulse, only in normal mode)
        if (s.flareActive && lightspeedPhase === 'idle') {
            var prog = s.flareTimer / s.flareDuration;
            var curve = Math.pow(Math.sin(prog * Math.PI), 0.7); // fast attack, slow decay
            alpha = Math.min(1, alpha + curve * 0.5);
            radius = radius + curve * 1.0;
        }

        if (alpha <= 0) return;

        ctx.globalAlpha = alpha;
        var sprite = spriteCache[s.colorIndex];

        if (s.layer === 'far') {
            var drawR = radius * 2.5 + 0.8;
            ctx.drawImage(sprite.far, s.x - drawR, s.y - drawR, drawR * 2, drawR * 2);
        } else if (s.layer === 'mid') {
            var drawR = radius * 1.6 + 0.4;
            ctx.drawImage(sprite.mid, s.x - drawR, s.y - drawR, drawR * 2, drawR * 2);
        } else {
            // Near star
            if (s.hasSpikes && alpha > 0.4 && lightspeedPhase === 'idle') {
                var drawR = (radius * 12 + 6) * 1.185;
                ctx.drawImage(sprite.spikes, s.x - drawR, s.y - drawR, drawR * 2, drawR * 2);
            } else if (s.isBright && alpha > 0.2) {
                var drawR = (radius * 3.5 + 2) * 1.067;
                ctx.drawImage(sprite.halo, s.x - drawR, s.y - drawR, drawR * 2, drawR * 2);
            } else {
                var drawR = radius;
                ctx.drawImage(sprite.near, s.x - drawR, s.y - drawR, drawR * 2, drawR * 2);
            }
        }
    }

    // ============================================================
    // UTILITIES
    // ============================================================
    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOut(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }

    // ============================================================
    // BIG BANG REVERSE — Chapter Opening Transition
    // ============================================================
    //
    // SEQUENCE:
    // Phase 1 "expand"   (0–1.5s):  Stars spawn at center, expand outward
    // Phase 2 "reverse"  (1.5–4s):  REVERSE — stars converge BACK to center
    //                                Aurora fades to black. Stars accelerate inward.
    // Phase 3 "collapse" (4–5.5s):  All stars rush to singularity (center point).
    // Phase 4 "flash"    (5.5–6.5s): White flash fills screen.
    // Phase 5 "title"    (6.5–10s):  Chapter title on white, then fades to black.
    //
    // USAGE:
    //   triggerBigBangReverse('第二章', '我不是罪人')
    //
    // SUGGESTION: Use between major parts, not every chapter.
    //             For lighter transitions, use regular lightspeed.
    //
    var bigbangPhase = 'idle';
    var bigbangTimer = 0;
    var bigbangStars = [];

    // Timing (frames at 60fps)
    var BB_EXPAND = 150;     // 2.5s — longer expand so stars reach past screen edges
    var BB_REVERSE = 150;    // 2.5s
    var BB_COLLAPSE = 90;    // 1.5s
    var BB_FLASH = 120;      // 2s — SLOWER flash, gentle on eyes
    var BB_TITLE = 210;      // 3.5s

    window.triggerBigBangReverse = function (subtitle, title) {
        if (bigbangPhase !== 'idle') return;

        var titleEl = document.getElementById('bigbangTitle');
        if (titleEl && subtitle && title) {
            titleEl.querySelector('.bigbang-subtitle').textContent = subtitle;
            titleEl.querySelector('.bigbang-heading').textContent = title;
        }

        bigbangStars = [];
        for (var i = 0; i < 800; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * 20 + 2;
            bigbangStars.push({
                x: width / 2 + Math.cos(angle) * dist,
                y: height / 2 + Math.sin(angle) * dist,
                angle: angle,
                speed: 1 + Math.random() * 4,
                radius: 0.15 + Math.random() * 0.35,
                brightness: 0.4 + Math.random() * 0.5,
                colorIndex: pickStarColor(),
                dist: dist
            });
        }

        bigbangPhase = 'expand';
        bigbangTimer = 0;

        // Fade aurora to dark
        var allSets = document.querySelectorAll('.aurora-set');
        allSets.forEach(function (s) { s.classList.remove('active'); });
    };

    // Demo shortcut
    window.triggerBigBang = function () {
        window.triggerBigBangReverse('第二章', '我不是罪人');
    };

    function updateBigBang() {
        if (bigbangPhase === 'idle' || bigbangPhase === 'done') return;
        bigbangTimer++;

        var cx = width / 2;
        var cy = (-canvasCurrentY / 100) * window.innerHeight + window.innerHeight / 2;
        var progress;

        if (bigbangPhase === 'expand') {
            progress = bigbangTimer / BB_EXPAND;
            // Stars expand PAST screen edges for more impact before reversing
            var expandSpeed = 3 + progress * 10;
            for (var i = 0; i < bigbangStars.length; i++) {
                var s = bigbangStars[i];
                s.dist += s.speed * expandSpeed * 0.12;
                s.x = cx + Math.cos(s.angle) * s.dist;
                s.y = cy + Math.sin(s.angle) * s.dist;
            }
            if (bigbangTimer >= BB_EXPAND) { bigbangPhase = 'reverse'; bigbangTimer = 0; }
        }
        else if (bigbangPhase === 'reverse') {
            // SMOOTH REVERSE: drift outward briefly, then smoothly accelerate inward.
            // No visible "brake" — uses power curve for seamless direction change.
            progress = bigbangTimer / BB_REVERSE;
            for (var i = 0; i < bigbangStars.length; i++) {
                var s = bigbangStars[i];
                if (progress < 0.15) {
                    // First 15%: still drifting outward, decelerating
                    s.dist += s.speed * (1 - progress / 0.15) * 0.25;
                } else {
                    // After 15%: smooth inward acceleration (power 1.5 curve)
                    var inwardT = (progress - 0.15) / 0.85;
                    var inwardForce = Math.pow(inwardT, 1.5) * 10;
                    s.dist -= s.speed * inwardForce * 0.1;
                }
                if (s.dist < 0) s.dist = 0;
                s.x = cx + Math.cos(s.angle) * s.dist;
                s.y = cy + Math.sin(s.angle) * s.dist;
            }
            if (bigbangTimer >= BB_REVERSE) { bigbangPhase = 'collapse'; bigbangTimer = 0; }
        }
        else if (bigbangPhase === 'collapse') {
            // Final collapse: exponential pull. Flash ONLY when ALL stars reach center.
            var allAtCenter = true;
            for (var i = 0; i < bigbangStars.length; i++) {
                var s = bigbangStars[i];
                s.dist *= 0.88;
                if (s.dist < 1) s.dist = 0;
                if (s.dist > 0) allAtCenter = false;
                s.x = cx + Math.cos(s.angle) * s.dist;
                s.y = cy + Math.sin(s.angle) * s.dist;
                s.brightness = Math.min(1, s.brightness + 0.006);
            }
            // Flash when all converged OR safety timeout 3s
            if (allAtCenter || bigbangTimer >= 180) {
                bigbangPhase = 'flash'; bigbangTimer = 0;
            }
        }
        else if (bigbangPhase === 'flash') {
            // GRADUAL flash — peaks at warm white then SETTLES to soft grey.
            // Protects eyes: bright moment is brief, title shows on gentle background.
            progress = bigbangTimer / BB_FLASH;
            var overlay = document.getElementById('bigbangOverlay');
            if (bigbangTimer === 1) {
                overlay.classList.add('active');
            }
            var flashEl = overlay.querySelector('.bigbang-flash');
            // Peak at 70% around frame 40%, then ease down to 55% for title
            var flashOpacity;
            if (progress < 0.4) {
                // Ramp UP to peak (ease-in)
                flashOpacity = Math.pow(progress / 0.4, 1.8) * 0.72;
            } else {
                // Ease DOWN from peak to gentle grey
                var downT = (progress - 0.4) / 0.6;
                flashOpacity = 0.72 - downT * 0.17; // settles at ~0.55
            }
            if (flashEl) flashEl.style.opacity = flashOpacity;

            // Stars fade out during flash
            for (var i = 0; i < bigbangStars.length; i++) {
                bigbangStars[i].brightness *= 0.9;
            }

            if (bigbangTimer >= BB_FLASH) {
                bigbangPhase = 'title'; bigbangTimer = 0;
                bigbangStars = [];
                overlay.classList.add('show-title');
                // Lock flash at full opacity (solid grey background)
                if (flashEl) flashEl.style.opacity = '1';
                // Trigger typewriter effect on title
                bigbangTypewriter();
            }
        }
        else if (bigbangPhase === 'title') {
            if (bigbangTimer >= BB_TITLE) {
                bigbangPhase = 'done'; bigbangTimer = 0;
                var overlay = document.getElementById('bigbangOverlay');
                overlay.classList.add('fade-out');
                setTimeout(function () {
                    overlay.classList.remove('active', 'show-title', 'fade-out');
                    bigbangPhase = 'idle';
                    var calmAurora = document.getElementById('aurora-calm');
                    if (calmAurora) calmAurora.classList.add('active');
                }, 2000);
            }
        }
    }

    // Typewriter effect for big bang chapter title
    function bigbangTypewriter() {
        var subtitleEl = document.querySelector('#bigbangTitle .bigbang-subtitle');
        var headingEl = document.querySelector('#bigbangTitle .bigbang-heading');
        if (!subtitleEl || !headingEl) return;

        var subtitleText = subtitleEl.textContent;
        var headingText = headingEl.textContent;
        subtitleEl.textContent = '';
        headingEl.textContent = '';
        subtitleEl.style.opacity = '1';
        headingEl.style.opacity = '1';

        // Add cursor to subtitle
        var cursor = document.createElement('span');
        cursor.className = 'bb-cursor';
        cursor.textContent = '|';
        subtitleEl.appendChild(cursor);

        var charIndex = 0;
        var speed = 120; // ms per character (slower, more cinematic)

        // Type subtitle first
        function typeSubtitle() {
            if (charIndex < subtitleText.length) {
                subtitleEl.insertBefore(document.createTextNode(subtitleText.charAt(charIndex)), cursor);
                charIndex++;
                setTimeout(typeSubtitle, speed);
            } else {
                // Pause, then start heading
                setTimeout(function () {
                    subtitleEl.removeChild(cursor);
                    charIndex = 0;
                    headingEl.appendChild(cursor);
                    typeHeading();
                }, 400);
            }
        }

        function typeHeading() {
            if (charIndex < headingText.length) {
                headingEl.insertBefore(document.createTextNode(headingText.charAt(charIndex)), cursor);
                charIndex++;
                setTimeout(typeHeading, speed + Math.random() * 50);
            } else {
                // Done — fade cursor out
                setTimeout(function () {
                    cursor.style.transition = 'opacity 1s ease';
                    cursor.style.opacity = '0';
                    setTimeout(function () { cursor.remove(); }, 1000);
                }, 800);
            }
        }

        typeSubtitle();
    }

    function drawBigBang() {
        if (bigbangPhase === 'idle' || bigbangPhase === 'done' || bigbangPhase === 'flash' || bigbangPhase === 'title') return;

        var cx = width / 2;
        var cy = (-canvasCurrentY / 100) * window.innerHeight + window.innerHeight / 2;

        // Darken background during reverse/collapse
        if (bigbangPhase === 'reverse' || bigbangPhase === 'collapse') {
            var darkP = 0;
            if (bigbangPhase === 'reverse') darkP = bigbangTimer / BB_REVERSE * 0.4;
            else darkP = 0.4 + (bigbangTimer / BB_COLLAPSE) * 0.5;
            ctx.fillStyle = 'rgba(0,0,0,' + (darkP * 0.6) + ')';
            ctx.fillRect(0, 0, width, height);
        }

        // Singularity glow during collapse
        if (bigbangPhase === 'collapse') {
            var cp = bigbangTimer / BB_COLLAPSE;
            var gr = 30 * (1 - cp) + 3;
            var ga = 0.1 + cp * 0.4;
            var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
            glow.addColorStop(0, 'rgba(255,250,240,' + ga + ')');
            glow.addColorStop(0.5, 'rgba(200,180,255,' + (ga * 0.4) + ')');
            glow.addColorStop(1, 'rgba(100,80,160,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);
        }

        // Draw bigbang stars
        for (var i = 0; i < bigbangStars.length; i++) {
            var s = bigbangStars[i];
            if (s.dist <= 0) continue;
            var col = ALL_COLORS[s.colorIndex];
            ctx.fillStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + s.brightness + ')';
            ctx.fillRect(s.x - s.radius, s.y - s.radius, s.radius * 2, s.radius * 2);
        }
    }

    // ============================================================
    // VERTICAL TRAVEL — JS-driven, fast, long distance, no gap
    // ============================================================
    function easeInOutPower(t) {
        if (t < 0.5) return 16 * t * t * t * t * t;
        var f = t - 1;
        return 1 + 16 * f * f * f * f * f;
    }

    var travelAnim = null;
    var canvasCurrentY = -100;

    function animateTravel(fromVh, toVh, duration, onDone) {
        if (travelAnim) travelAnim.cancelled = true;
        var startTime = performance.now();
        var anim = { cancelled: false };
        travelAnim = anim;

        var starCanvas = document.getElementById('starfield');

        function tick(now) {
            if (anim.cancelled) return;
            var elapsed = now - startTime;
            var t = Math.min(1, elapsed / duration);
            var eased = easeInOutPower(t);
            var currentY = fromVh + (toVh - fromVh) * eased;
            canvasCurrentY = currentY;
            starCanvas.style.transform = 'translateY(' + currentY + 'vh)';

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                travelAnim = null;
                if (onDone) onDone();
            }
        }
        requestAnimationFrame(tick);
    }

    window.triggerDownToEarth = function () {
        var allSets = document.querySelectorAll('.aurora-set');
        allSets.forEach(function (s) { s.classList.remove('active'); });

        // Show mountain IMMEDIATELY — it travels in sync with the sky
        var mountain = document.getElementById('mountainLayer');
        if (mountain) { mountain.classList.remove('fly-away'); mountain.classList.add('visible'); }

        // Long distance: 200vh travel, 6s duration
        animateTravel(canvasCurrentY, -300, 6000, null);

        if (window.setStarfieldMood) window.setStarfieldMood('earth');
    };

    window.triggerFlyToSpace = function () {
        var mountain = document.getElementById('mountainLayer');
        if (mountain) { mountain.classList.remove('visible'); mountain.classList.add('fly-away'); }

        // Long distance back: 200vh travel, 6s duration
        animateTravel(canvasCurrentY, -100, 6000, function () {
            var wonderAurora = document.getElementById('aurora-wonder');
            if (wonderAurora) wonderAurora.classList.add('active');
            if (window.setStarfieldMood) window.setStarfieldMood('wonder');
        });
    };

    // ============================================================
    // MAIN LOOP — includes Big Bang + Vertical Travel
    // ============================================================
    function loop() {
        update();
        updateBigBang();
        draw();
        drawBigBang();
        requestAnimationFrame(loop);
    }

    init();
    loop();
    window.addEventListener('resize', resize);
})();