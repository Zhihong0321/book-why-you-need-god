/**
 * Demo controller for V3 preview
 * Allows switching moods + triggering transitions via buttons
 */

(function () {
    'use strict';

    let currentMood = 'calm';
    let lightspeedActive = false;
    let onEarth = false;

    window.switchMood = function (mood) {
        const buttons = document.querySelectorAll('.demo-buttons button');
        buttons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === mood) {
                btn.classList.add('active');
            }
        });

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

        if (window.setStarfieldMood) window.setStarfieldMood(mood);

        var allSets = document.querySelectorAll('.aurora-set');
        allSets.forEach(function (s) { s.classList.remove('active'); });
        var newAurora = document.getElementById('aurora-' + mood);
        if (newAurora) newAurora.classList.add('active');

        currentMood = mood;
    };

    // ============================================================
    // DOWN TO EARTH / FLY TO SPACE — now handled by starfield engine
    // ============================================================
    // These are defined in starfield-v3.js as window.triggerDownToEarth
    // and window.triggerFlyToSpace. No need to duplicate here.

})();
