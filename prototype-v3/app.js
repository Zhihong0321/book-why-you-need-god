/**
 * Mood Swing Engine & Interactive Book Director v3
 * 
 * Coordinated systems:
 * 1. Background Music: Eased volume fading, crossfades, mute, toast.
 * 2. Visuals: Coordinates aurora layers & starfield moods.
 * 3. Text animations: Staggered fade-up, text glow, character typewriter, smart character-level Chinese reveal.
 * 4. Earth-to-Space Intro: Starts down on earth (mountain silhouette), launches into space on click.
 * 5. Reference Database: Populates slide-up detail cards for [NDEXP-XXX] anchors.
 */

(function () {
    'use strict';

    // ===== CONFIGURATION =====
    const FADE_DURATION = 5000;       // 5 seconds for music fade in/out
    const MAX_VOLUME = 0.28;          // background level
    const MOOD_TRACKS = {
        calm: 'track-calm',
        wonder: 'track-wonder',
        awe: 'track-awe',
        weight: 'track-weight'
    };
    const TRACK_INFO = {
        'track-calm': { title: 'Snowfall', artist: 'Scott Buckley' },
        'track-wonder': { title: 'Filaments', artist: 'Scott Buckley' },
        'track-awe': { title: 'Horizons', artist: 'Scott Buckley' },
        'track-weight': { title: 'Escape', artist: 'Sappheiros' }
    };

    // ===== STATE VARIABLES =====
    let currentMood = 'calm';
    let currentAudio = null;
    let isMuted = false;
    let isStarted = false;
    let lightspeedActive = false;
    let activeFades = new Map();
    let toastTimer = null;

    // ===== DOM ELEMENTS =====
    const startOverlay = document.getElementById('startOverlay');
    const startBtn = document.getElementById('startBtn');
    const contentContainer = document.getElementById('mainContent');
    const musicToggle = document.getElementById('musicToggle');
    const musicToast = document.getElementById('musicToast');
    const musicToastText = document.getElementById('musicToastText');

    // ===== INITIALIZE: START ON EARTH =====
    // On load, force down to earth camera & mount mountain
    window.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            if (window.triggerDownToEarth) {
                window.triggerDownToEarth();
            }
        }, 150);
    });

    // ===== START READING TRIGGER =====
    startBtn.addEventListener('click', function () {
        isStarted = true;
        startOverlay.classList.add('hidden');
        contentContainer.classList.add('visible');

        // Launch from Earth into Space (Visual flight sequence)
        if (window.triggerFlyToSpace) {
            window.triggerFlyToSpace();
        }

        // Start Calm Music (Snowfall)
        const firstTrack = document.getElementById(MOOD_TRACKS.calm);
        if (firstTrack) {
            firstTrack.volume = 0;
            firstTrack.play().catch(function () {});
            fadeVolume(firstTrack, 0, MAX_VOLUME, FADE_DURATION);
            currentAudio = firstTrack;
            showToast(MOOD_TRACKS.calm);
        }

        setTimeout(function () {
            startOverlay.style.display = 'none';
        }, 2200);
    });

    // ===== MANUAL MOOD SWITCHER (Director's Console) =====
    window.switchMood = function (mood) {
        if (!isStarted) {
            // Force start overlay away if director wants override
            isStarted = true;
            startOverlay.style.display = 'none';
            contentContainer.classList.add('visible');
        }

        const buttons = document.querySelectorAll('.demo-buttons button');
        buttons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(mood.toLowerCase())) {
                btn.classList.add('active');
            }
        });

        // Lightspeed transition zone logic
        if (mood === 'lightspeed') {
            if (!lightspeedActive) {
                if (window.triggerLightspeed) window.triggerLightspeed();
                lightspeedActive = true;
            }
            var allSets = document.querySelectorAll('.aurora-set');
            allSets.forEach(function (s) { s.classList.remove('active'); });
            var lsAurora = document.getElementById('aurora-lightspeed');
            if (lsAurora) lsAurora.classList.add('active');
            currentMood = 'lightspeed';
            return;
        }

        if (lightspeedActive) {
            if (window.endLightspeed) window.endLightspeed();
            lightspeedActive = false;
        }

        // Normal starfield transition
        if (window.setStarfieldMood) window.setStarfieldMood(mood);

        // Aurora transition
        var allSets = document.querySelectorAll('.aurora-set');
        allSets.forEach(function (s) { s.classList.remove('active'); });
        var newAurora = document.getElementById('aurora-' + mood);
        if (newAurora) {
            newAurora.classList.add('active');
        } else {
            var calmAurora = document.getElementById('aurora-calm');
            if (calmAurora) calmAurora.classList.add('active');
        }

        // Sound transition
        const trackId = MOOD_TRACKS[mood];
        if (trackId) {
            transitionMusic(trackId);
        }

        currentMood = mood;
    };

    // Helper functions for manual override
    window.triggerBigBang = function () {
        if (window.triggerBigBangReverse) {
            window.triggerBigBangReverse('第一章', '濒死体验科学审计');
        }
    };
    
    window.triggerDownToEarth = function () {
        if (window.setStarfieldMood) window.setStarfieldMood('earth');
        var mountain = document.getElementById('mountainLayer');
        if (mountain) {
            mountain.classList.remove('fly-away');
            mountain.classList.add('visible');
        }
        var starfield = document.getElementById('starfield');
        if (starfield) {
            starfield.style.transform = 'translateY(-300vh)';
        }
        var allSets = document.querySelectorAll('.aurora-set');
        allSets.forEach(function (s) { s.classList.remove('active'); });
    };

    window.triggerFlyToSpace = function () {
        var mountain = document.getElementById('mountainLayer');
        if (mountain) {
            mountain.classList.remove('visible');
            mountain.classList.add('fly-away');
        }
        var starfield = document.getElementById('starfield');
        if (starfield) {
            starfield.style.transform = 'translateY(-100vh)';
        }
        var wonderAurora = document.getElementById('aurora-wonder');
        if (wonderAurora) wonderAurora.classList.add('active');
        if (window.setStarfieldMood) window.setStarfieldMood('wonder');
    };

    // ===== AUDIO CONTROLS (MUTE/UNMUTE) =====
    musicToggle.addEventListener('click', function () {
        isMuted = !isMuted;
        musicToggle.classList.toggle('muted', isMuted);

        if (currentAudio) {
            if (isMuted) {
                fadeVolume(currentAudio, currentAudio.volume, 0, 1500);
            } else {
                fadeVolume(currentAudio, 0, MAX_VOLUME, 1500);
            }
        }
    });

    // ===== MUSIC FADING SYSTEM =====
    function transitionMusic(newTrackId) {
        const newAudio = document.getElementById(newTrackId);
        if (!newAudio || newAudio === currentAudio) return;

        // Fade out current
        if (currentAudio) {
            const oldAudio = currentAudio;
            fadeVolume(oldAudio, oldAudio.volume, 0, FADE_DURATION, function () {
                oldAudio.pause();
            });
        }

        // Fade in new (staggered overlap)
        const targetVol = isMuted ? 0 : MAX_VOLUME;
        newAudio.volume = 0;
        newAudio.play().catch(function () {});

        setTimeout(function () {
            fadeVolume(newAudio, 0, targetVol, FADE_DURATION);
        }, 600);

        currentAudio = newAudio;
        showToast(newTrackId);
    }

    function fadeVolume(audio, from, to, duration, onComplete) {
        const existingFade = activeFades.get(audio);
        if (existingFade) {
            clearInterval(existingFade);
            activeFades.delete(audio);
        }

        const steps = 50;
        const stepTime = duration / steps;
        let currentStep = 0;

        audio.volume = from;

        const interval = setInterval(function () {
            currentStep++;
            const progress = currentStep / steps;
            // Sine curve easing
            const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
            const newVol = from + (to - from) * eased;
            
            audio.volume = Math.max(0, Math.min(1, newVol));

            if (currentStep >= steps) {
                clearInterval(interval);
                activeFades.delete(audio);
                audio.volume = to;
                if (onComplete) onComplete();
            }
        }, stepTime);

        activeFades.set(audio, interval);
    }

    // ===== TOAST NOTIFICATION =====
    function showToast(trackId) {
        const info = TRACK_INFO[trackId];
        if (!info) return;

        musicToastText.textContent = info.title + ' \u2014 ' + info.artist;

        if (toastTimer) clearTimeout(toastTimer);
        musicToast.classList.remove('visible', 'glow');

        setTimeout(function () {
            musicToast.classList.add('visible');
        }, 100);

        setTimeout(function () {
            musicToast.classList.add('glow');
        }, 500);

        setTimeout(function () {
            musicToast.classList.remove('glow');
        }, 2200);

        toastTimer = setTimeout(function () {
            musicToast.classList.remove('visible');
        }, 5000);
    }

    // ===== SCROLL-TRIGGERED MOOD TRANSITIONS =====
    const zones = document.querySelectorAll('.zone[data-mood]');
    const zoneObserver = new IntersectionObserver(function (entries) {
        if (!isStarted) return;
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const mood = entry.target.getAttribute('data-mood');
                if (mood && mood !== currentMood) {
                    // Update starfield cameras
                    if (window.setStarfieldMood) {
                        window.setStarfieldMood(mood);
                    }

                    // Update aurora nebula set
                    const allSets = document.querySelectorAll('.aurora-set');
                    allSets.forEach(function (s) { s.classList.remove('active'); });
                    const newAurora = document.getElementById('aurora-' + mood);
                    if (newAurora) newAurora.classList.add('active');

                    // Crossfade audio track
                    const trackId = MOOD_TRACKS[mood];
                    if (trackId) {
                        transitionMusic(trackId);
                    }

                    // Update local state
                    currentMood = mood;

                    // Sync Director buttons
                    const buttons = document.querySelectorAll('.demo-buttons button');
                    buttons.forEach(function (btn) {
                        btn.classList.remove('active');
                        if (btn.textContent.toLowerCase() === mood) {
                            btn.classList.add('active');
                        }
                    });
                }
            }
        });
    }, { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' });

    zones.forEach(function (z) { zoneObserver.observe(z); });

    // ===== LIGHTSPEED TRANSITION OBSERVERS =====
    const transitionEls = document.querySelectorAll('.zone-transition[data-transition="lightspeed"]');
    transitionEls.forEach(function (el) {
        const enterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && isStarted) {
                    if (window.triggerLightspeed) window.triggerLightspeed();
                    
                    var allSets = document.querySelectorAll('.aurora-set');
                    allSets.forEach(function(s) { s.classList.remove('active'); });
                    var lsAurora = document.getElementById('aurora-lightspeed');
                    if (lsAurora) lsAurora.classList.add('active');
                }
            });
        }, { threshold: 0.15 });
        enterObserver.observe(el);

        var nextZone = el.nextElementSibling;
        if (nextZone) {
            const exitObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && isStarted) {
                        if (window.endLightspeed) window.endLightspeed();
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -70% 0px' });
            exitObserver.observe(nextZone);
        }
    });

    // ===== TEXT ANIMATIONS INTERSECTION OBSERVERS =====
    
    // 1. Staggered Fade Up
    const fadeUpEls = document.querySelectorAll('.fx-fade-up');
    const fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    fadeUpEls.forEach(function (el) { fadeObserver.observe(el); });

    // 2. Cinematic Blockquotes
    const quoteEls = document.querySelectorAll('.fx-quote');
    const quoteObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                quoteObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    quoteEls.forEach(function (el) { quoteObserver.observe(el); });

    // 3. Text Glow Pulse
    const glowEls = document.querySelectorAll('.fx-glow');
    const glowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                glowObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    glowEls.forEach(function (el) { glowObserver.observe(el); });

    // 4. Typewriter (Driven by JS character by character)
    const twEls = document.querySelectorAll('.fx-typewriter');
    const twObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                startTypewriter(entry.target);
                twObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    twEls.forEach(function (el) { twObserver.observe(el); });

    function startTypewriter(el) {
        const fullText = el.getAttribute('data-text') || el.textContent;
        el.textContent = '';
        el.classList.add('visible');

        const cursor = document.createElement('span');
        cursor.className = 'tw-cursor';
        el.appendChild(cursor);

        let i = 0;
        const speed = 50; 

        function type() {
            if (i < fullText.length) {
                const charNode = document.createTextNode(fullText.charAt(i));
                el.insertBefore(charNode, cursor);
                i++;
                setTimeout(type, speed + Math.random() * 20);
            } else {
                setTimeout(function () {
                    cursor.style.transition = 'opacity 1s ease';
                    cursor.style.opacity = '0';
                    setTimeout(function () { cursor.remove(); }, 1000);
                }, 1500);
            }
        }
        type();
    }

    // 5. Staggered Word Reveal (Poetic reveal for key conclusions)
    const revealEls = document.querySelectorAll('.fx-reveal');
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                startReveal(entry.target);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    function startReveal(el) {
        const text = el.textContent.trim();
        el.textContent = '';
        el.classList.add('visible');

        // Check if Chinese is present. If Chinese with no spaces, split character-by-character
        const isChinese = /[\u4e00-\u9fa5]/.test(text);
        let segments;
        if (isChinese && !text.includes(' ')) {
            segments = text.split('');
        } else {
            segments = text.split(/\s+/);
        }

        const spans = [];
        segments.forEach(function (seg, idx) {
            const span = document.createElement('span');
            span.className = 'reveal-word';
            span.textContent = seg;
            el.appendChild(span);
            if (!isChinese && idx < segments.length - 1) {
                el.appendChild(document.createTextNode(' '));
            }
            spans.push(span);
        });

        // Stagger reveal trigger
        spans.forEach(function (span, idx) {
            setTimeout(function () {
                span.classList.add('shown');
            }, idx * (isChinese ? 120 : 180));
        });
    }

    // ===== REFERENCE SYSTEM SYSTEM =====
    const REFS = {
        'NDEXP-001': {
            author: 'van Lommel, P. et al.',
            title: 'Near-death experience in survivors of cardiac arrest',
            source: 'The Lancet',
            year: '2001',
            type: 'JOURNAL',
            used_for: 'Prospective study of 344 cardiac arrest survivors showing NDE clarity is inversely correlated with brain damage.'
        },
        'NDEXP-002': {
            author: 'Parnia, S. et al.',
            title: 'AWARE—AWAreness during REsuscitation',
            source: 'Resuscitation',
            year: '2014',
            type: 'JOURNAL',
            used_for: 'AWARE study of 2,060 cardiac arrest patients showing NDE during flat EEG states.'
        },
        'NDEXP-003': {
            author: 'Ring, K. & Cooper, S.',
            title: 'Mindsight: Near-Death and Out-of-Body Experiences in the Blind',
            source: 'William James Center',
            year: '1999',
            type: 'BOOK',
            used_for: 'Study of 31 visually impaired/blind NDErs reporting visual perception.'
        },
        'NDEXP-004': {
            author: 'Morse, M.',
            title: 'Closer to the Light: Learning from the Near-Death Experiences of Children',
            source: 'Villard Books',
            year: '1990',
            type: 'BOOK',
            used_for: 'Children aged 3-12 reporting NDE experiences without religious education or media exposure.'
        },
        'NDEXP-005': {
            author: 'Greyson, B.',
            title: 'Incidence and correlates of near-death experiences in a cardiac care unit',
            source: 'General Hospital Psychiatry',
            year: '2003',
            type: 'JOURNAL',
            used_for: 'NDE scale data showing cognitive clarity scores above normal waking baseline.'
        },
        'NDEXP-006': {
            author: '刘建勋等',
            title: '唐山大地震濒死体验调查研究',
            source: '中国内部报告',
            year: '1979',
            type: 'PRIMARY',
            used_for: '81 NDE reports from Tangshan earthquake survivors in materialist-education environment showing Western-identical core elements.'
        },
        'NDEXP-007': {
            author: 'Pasricha, S. & Stevenson, I.',
            title: 'Near-death experiences in India',
            source: 'Academic journal',
            year: '1986',
            type: 'JOURNAL',
            used_for: 'Hindu-culture NDE study showing core protocol consistent despite cultural coloring.'
        },
        'NDEXP-008': {
            author: 'Greyson, B.',
            title: 'Near-death experiences in suicide attempters',
            source: 'JAMA',
            year: '1991',
            type: 'JOURNAL',
            used_for: 'Showing suicide attempt NDEs are consistent with non-suicide, educational rather than escapist.'
        },
        'NDEXP-009': {
            author: 'Parnia, S. et al.',
            title: 'AWARE II',
            source: 'Circulation',
            year: '2020',
            type: 'JOURNAL',
            used_for: 'Hidden target experiment, verifying out-of-body perception.'
        },
        'NDEXP-010': {
            author: 'van Lommel, P.',
            title: 'Consciousness Beyond Life',
            source: 'HarperOne',
            year: '2010',
            type: 'BOOK',
            used_for: 'Detailed record of denture case (1979) proving verified perception during pupil dilation.'
        },
        'NDEXP-011': {
            author: 'IANDS',
            title: 'Al Sullivan Case',
            source: 'IANDS Archives',
            year: '1988',
            type: 'CASE STUDY',
            used_for: 'Heart surgery patient accurately described surgeon\'s unique habits during anesthesia.'
        }
    };

    const refPanel = document.getElementById('refPanel');
    const refPanelId = document.getElementById('refPanelId');
    const refPanelBody = document.getElementById('refPanelBody');
    const refPanelClose = document.getElementById('refPanelClose');

    // Click handler delegation for [NDEXP-XXX] tags
    document.addEventListener('click', function (e) {
        const tag = e.target.closest('.ref-tag');
        if (tag) {
            const refKey = tag.getAttribute('data-ref');
            openRef(refKey);
            return;
        }

        // Close when clicking outside refPanel
        if (refPanel.classList.contains('open') && !refPanel.contains(e.target)) {
            closeRef();
        }
    });

    refPanelClose.addEventListener('click', closeRef);

    function openRef(key) {
        const data = REFS[key];
        if (!data) return;

        refPanelId.textContent = '[' + key + ']';

        let html = '';
        html += '<div class="ref-field"><span class="ref-label">Author</span><span class="ref-value">' + data.author + '</span></div>';
        html += '<div class="ref-field"><span class="ref-label">Title</span><span class="ref-value">' + data.title + '</span></div>';
        html += '<div class="ref-field"><span class="ref-label">Source</span><span class="ref-value">' + data.source + ' (' + data.year + ')</span></div>';
        html += '<div class="ref-field"><span class="ref-label">Type</span><span class="ref-value">' + data.type + '</span></div>';
        html += '<div class="ref-field"><span class="ref-label">Used for</span><span class="ref-value">' + data.used_for + '</span></div>';

        refPanelBody.innerHTML = html;
        refPanel.classList.add('open');
    }

    function closeRef() {
        refPanel.classList.remove('open');
    }

    // Keyboard ESC listener
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeRef();
    });

})();
