// ==UserScript==
// @name         MWI-Avatar-Plus
// @name:en      MWI-Avatar-Plus
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description:en Visualizing Attack/Heal Effects with SVG Animations + Custom Avatar Support (Modular Edition)
// @author       Seisen
// @license MIT
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        none
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/utils/geometry.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/utils/colors.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/core/constants.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/core/settings.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/ui/styles.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/ui/toast.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/ui/color-picker.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/ui/settings-panel.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/avatar/avatar-manager.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/avatar/avatar-observer.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/utils/svg-paths.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/animation-manager.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/effects/miss-effect.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/effects/hit-effect.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/effects/healing-particles.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/effects/dot-effect.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/projectiles/fireball.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/projectiles/arrow.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/projectiles/melee.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/animations/effect-coordinator.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-avatar-plus/modules/core/websocket.js?v=13
// ==/UserScript==

(function() {
    'use strict';

    // Initialize styles
    initializeStyles();

    // Load settings from localStorage
    readSettings();

    // Initialize settings panel
    waitForSetttins();

    // Initialize avatar system
    observeForAvatars();

    // Initialize WebSocket hook for battle tracking
    hookWS();
})();
