// ==UserScript==
// @name         MWI Profit Calculator
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Calculate production profit for MilkyWayIdle items with detailed tooltips (Refactored)
// @author       Extracted from MWITools
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/core/constants.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/core/data-manager.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/core/websocket.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/api/market-api.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/calculations/buffs.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/calculations/profit.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/ui/formatter.js?v=1
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/ui/tooltip.js?v=1
// ==/UserScript==

/**
 * MWI Profit Calculator v2.0.0
 * 
 * This is the GitHub version with remote @require URLs.
 * Repository: https://github.com/Seisen99/MilkUtils
 * 
 * The ?v=X query parameter is used for cache busting when you update modules.
 * Increment the version number when you make changes to force browser to reload.
 */

(function() {
    'use strict';

    // Initialize WebSocket hook for data interception
    hookWS();

    // Fetch initial market data
    fetchMarketJSON(true);

    // Initialize tooltip observer
    initializeTooltipObserver();

    console.log("MWI Profit Calculator v2.0.0 loaded successfully!");
})();
