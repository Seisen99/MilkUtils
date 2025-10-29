// ==UserScript==
// @name         MWI-Avatar-Plus
// @name:en      MWI-Avatar-Plus
// @namespace    http://tampermonkey.net/
// @version      2.5.0
// @description:en Visualizing Attack/Heal Effects with SVG Animations + Custom Avatar Support + Auto-Detection
// @author       Seisen
// @license MIT
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/mwi-avatar-plus.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/mwi-avatar-plus.user.js
// DEV NOTE: Pour forcer un refresh immédiat pendant le dev, utilise un commit hash spécifique
// ou purge le cache JSDelivr via : https://www.jsdelivr.com/tools/purge
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/utils/geometry.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/utils/colors.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/core/constants.js?v=4
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/core/settings.js?v=4
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/ui/styles.js?v=7
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/ui/toast.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/ui/color-picker.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/ui/settings-panel.js?v=10
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/avatar/avatar-manager.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/avatar/avatar-observer.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/abilities_database.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/utils/svg-paths.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/animation-manager.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/effects/miss-effect.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/effects/hit-effect.js?v=14
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/effects/healing-particles.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/effects/dot-effect.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/projectiles/fireball.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/projectiles/arrow.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/projectiles/melee.js?v=1
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/animations/effect-coordinator.js?v=6
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-avatar-plus/modules/core/websocket.js?v=31
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

    // Initialization complete
    console.log('✅ MWI-Avatar-Plus initialized successfully');
})();
