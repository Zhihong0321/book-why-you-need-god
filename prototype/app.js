/**
 * Mood Swing Engine v2
 * 
 * Three control channels:
 * 1. Music — long crossfade (5s fade out, 5s fade in, never abrupt)
 * 2. Aurora colors — CSS custom properties with 5s CSS transition
 * 3. Aurora speed — animation-duration change (handled by CSS transition)
 * 
 * Core principle: SUBTLE. If the reader notices a change, it's too fast.
 */

(function () {
    'use strict';

    // ===== CONFIG =====
    const FADE_DURATION = 5000;       // 5 seconds for music fade in/out
    const MAX_VOLUME = 0.28;          // background level — never dominant
    const SCROLL_DEBOUNCE = 400;      // ms between mood checks
    const ZONE_THRESHOLD = 0.4;       // how far into viewport before zone activates

    // Mood → track mapping
    const MOOD_TRACKS = {
        calm: 'track-calm',
        wonder: 'track-wonder',
        awe: 'track-awe',
        weight: 'track-weight'
    };

    // Track metadata for toast notification
    const TRACK_INFO = {
        'track-calm': { title: 'Snowfall', artist: 'Scott Buckley' },
        'track-wonder': { title: 'Filaments', artist: 'Scott Buckley' },
        'track-awe': { title: 'Horizons', artist: 'Scott Buckley' },
        'track-weight': { title: 'Escape', artist: 'Sappheiros' }
    };

    // ===== STATE =====
    let currentMood = null;
    let currentAudio = null;
    let isMuted = false;
    let isStarted = false;
    let activeFades = new Map(); // track active fade intervals to cancel them

    // ===== DOM =====
    const overlay = document.getElementById('startOverlay');
    const startBtn = document.getElementById('startBtn');
    const content = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('musicToggle');
    const zones = document.querySelectorAll('.zone[data-mood]');
    const musicToast = document.getElementById('musicToast');
    const musicToastText = document.getElementById('musicToastText');
    let toastTimer = null;

    // ===== INIT: START BUTTON =====
    startBtn.addEventListener('click', function () {
        isStarted = true;
        overlay.classList.add('hidden');
        content.classList.add('visible');

        // Aurora: calm is already active via HTML class

        // Begin first track with fade in
        const firstTrack = document.getElementById(MOOD_TRACKS.calm);
        firstTrack.volume = 0;
        firstTrack.play().catch(() => {});
        fadeVolume(firstTrack, 0, MAX_VOLUME, FADE_DURATION);
        currentAudio = firstTrack;
        currentMood = 'calm';

        // Show first track toast
        showToast('track-calm');

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2200);
    });

    // ===== MUSIC TOGGLE =====
    toggleBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        toggleBtn.classList.toggle('muted', isMuted);

        if (currentAudio) {
            if (isMuted) {
                fadeVolume(currentAudio, currentAudio.volume, 0, 1500);
            } else {
                fadeVolume(currentAudio, 0, MAX_VOLUME, 1500);
            }
        }
    });

    // ===== SCROLL DETECTION =====
    let scrollTimer = null;

    window.addEventListener('scroll', function () {
        if (!isStarted) return;

        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(checkMood, SCROLL_DEBOUNCE);
    });

    function checkMood() {
        const viewportMid = window.innerHeight * ZONE_THRESHOLD;
        let detectedMood = currentMood;

        for (let i = zones.length - 1; i >= 0; i--) {
            const rect = zones[i].getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.6) {
                detectedMood = zones[i].dataset.mood;
                break;
            }
        }

        if (detectedMood && detectedMood !== currentMood) {
            transitionMood(detectedMood);
        }
    }

    // ===== MOOD TRANSITION =====
    function transitionMood(newMood) {
        const oldMood = currentMood;
        currentMood = newMood;

        // 1. Aurora crossfade
        const allSets = document.querySelectorAll('.aurora-set');
        allSets.forEach(s => s.classList.remove('active'));
        const newSet = document.getElementById('aurora-' + newMood);
        if (newSet) newSet.classList.add('active');

        // 2. Starfield camera change
        if (window.setStarfieldMood) {
            window.setStarfieldMood(newMood);
        }

        // 3. Music crossfade
        const newTrackId = MOOD_TRACKS[newMood];
        const newAudio = document.getElementById(newTrackId);

        if (newAudio && newAudio !== currentAudio) {
            // Fade out current
            if (currentAudio) {
                const oldAudio = currentAudio;
                fadeVolume(oldAudio, oldAudio.volume, 0, FADE_DURATION, function () {
                    oldAudio.pause();
                });
            }

            // Fade in new (start after a brief overlap gap)
            const targetVol = isMuted ? 0 : MAX_VOLUME;
            newAudio.volume = 0;
            newAudio.play().catch(() => {});

            // Slight delay so the old track fades a bit first
            setTimeout(function () {
                fadeVolume(newAudio, 0, targetVol, FADE_DURATION);
            }, 800);

            currentAudio = newAudio;

            // Show toast notification
            showToast(newTrackId);
        }
    }

    // ===== TOAST NOTIFICATION =====
    function showToast(trackId) {
        const info = TRACK_INFO[trackId];
        if (!info) return;

        musicToastText.textContent = info.title + ' \u2014 ' + info.artist;

        // Reset
        if (toastTimer) clearTimeout(toastTimer);
        musicToast.classList.remove('visible', 'glow');

        // Slide in from top-right
        setTimeout(function () {
            musicToast.classList.add('visible');
        }, 100);

        // Glow pulse after appearing
        setTimeout(function () {
            musicToast.classList.add('glow');
        }, 600);

        // Remove glow after ~1s
        setTimeout(function () {
            musicToast.classList.remove('glow');
        }, 1800);

        // Slide out back to top-right
        toastTimer = setTimeout(function () {
            musicToast.classList.remove('visible');
        }, 5000);
    }

    // ===== FADE VOLUME UTILITY =====
    // Smooth volume ramp with easing (sine curve)
    function fadeVolume(audio, from, to, duration, onComplete) {
        // Cancel any existing fade on this audio element
        const existingFade = activeFades.get(audio);
        if (existingFade) {
            clearInterval(existingFade);
            activeFades.delete(audio);
        }

        const steps = 60;
        const stepTime = duration / steps;
        let currentStep = 0;

        audio.volume = clamp(from);

        const interval = setInterval(function () {
            currentStep++;
            // Sine easing for natural feel
            const progress = currentStep / steps;
            const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
            const newVol = from + (to - from) * eased;
            audio.volume = clamp(newVol);

            if (currentStep >= steps) {
                clearInterval(interval);
                activeFades.delete(audio);
                audio.volume = clamp(to);
                if (onComplete) onComplete();
            }
        }, stepTime);

        activeFades.set(audio, interval);
    }

    function clamp(v) {
        return Math.max(0, Math.min(1, v));
    }

})();

// ===== TEXT EFFECTS ENGINE =====
// Separate from mood engine — uses IntersectionObserver for scroll-triggered effects
(function () {
    'use strict';

    // --- FADE UP: simple reveal ---
    const fadeUpEls = document.querySelectorAll('.fx-fade-up');
    const fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    fadeUpEls.forEach(function (el) { fadeObserver.observe(el); });

    // --- CINEMATIC QUOTE: glow border + scale entrance ---
    const quoteEls = document.querySelectorAll('.fx-quote');
    const quoteObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                quoteObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    quoteEls.forEach(function (el) { quoteObserver.observe(el); });

    // --- LIGHTSPEED TRANSITION: engage when entering, disengage EARLY (30% of next zone visible) ---
    const transitionEls = document.querySelectorAll('.zone-transition[data-transition="lightspeed"]');
    transitionEls.forEach(function (el) {
        // Observer for ENTERING the transition zone
        const enterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Engage lightspeed stars
                    if (window.triggerLightspeed) window.triggerLightspeed();
                    // Activate vibrant aurora
                    var allSets = document.querySelectorAll('.aurora-set');
                    allSets.forEach(function(s) { s.classList.remove('active'); });
                    var lsAurora = document.getElementById('aurora-lightspeed');
                    if (lsAurora) lsAurora.classList.add('active');
                }
            });
        }, { threshold: 0.15 });
        enterObserver.observe(el);

        // Observer for the NEXT zone after this transition — brake early
        var nextZone = el.nextElementSibling;
        if (nextZone) {
            const exitObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        // Next chapter is 30% visible — start braking
                        if (window.endLightspeed) window.endLightspeed();
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -70% 0px' });
            exitObserver.observe(nextZone);
        }
    });
    console.log('[Lightspeed] Observing', transitionEls.length, 'transition zones');

    // --- GLOW: pulse when enters view ---
    const glowEls = document.querySelectorAll('.fx-glow');
    const glowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                glowObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    glowEls.forEach(function (el) { glowObserver.observe(el); });

    // --- TYPEWRITER: character by character ---
    const twEls = document.querySelectorAll('.fx-typewriter');
    const twObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                startTypewriter(entry.target);
                twObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    twEls.forEach(function (el) { twObserver.observe(el); });

    function startTypewriter(el) {
        const fullText = el.getAttribute('data-text') || el.textContent;
        el.textContent = '';
        el.classList.add('visible');

        const cursor = document.createElement('span');
        cursor.className = 'tw-cursor';
        el.appendChild(cursor);

        let i = 0;
        const speed = 45; // ms per character

        function type() {
            if (i < fullText.length) {
                const charNode = document.createTextNode(fullText.charAt(i));
                el.insertBefore(charNode, cursor);
                i++;
                setTimeout(type, speed + Math.random() * 20);
            } else {
                // Remove cursor after a pause
                setTimeout(function () {
                    cursor.style.transition = 'opacity 1s ease';
                    cursor.style.opacity = '0';
                    setTimeout(function () { cursor.remove(); }, 1000);
                }, 1500);
            }
        }
        type();
    }

    // --- REVEAL: word by word ---
    const revealEls = document.querySelectorAll('.fx-reveal');
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                startReveal(entry.target);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    function startReveal(el) {
        const text = el.textContent.trim();
        el.textContent = '';
        el.classList.add('visible');

        const words = text.split(/\s+/);
        const spans = [];

        words.forEach(function (word, idx) {
            const span = document.createElement('span');
            span.className = 'reveal-word';
            span.textContent = word;
            el.appendChild(span);
            if (idx < words.length - 1) {
                el.appendChild(document.createTextNode(' '));
            }
            spans.push(span);
        });

        // Stagger reveal
        spans.forEach(function (span, idx) {
            setTimeout(function () {
                span.classList.add('shown');
            }, idx * 180);
        });
    }

})();
