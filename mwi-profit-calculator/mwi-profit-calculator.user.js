// ==UserScript==
// @name         MWI Profit Calculator
// @namespace    http://tampermonkey.net/
// @version      3.1.4
// @description  Calculate production profit with essences, rare drops, and processing tea bonus
// @author       Seisen
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/core/constants.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/core/data-manager.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/core/websocket.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/api/market-api.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/calculations/buffs.js?v=6
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/calculations/processing-mapping.js?v=4
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/calculations/chest-values.js?v=4
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/calculations/profit.js?v=6
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/ui/formatter.js?v=2
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/modules/ui/tooltip.js?v=13
// ==/UserScript==


(function() {
    'use strict';

    // Initialize WebSocket hook for data interception
    hookWS();

    // Fetch initial market data
    fetchMarketJSON(true);

    // Initialize tooltip observer
    initializeTooltipObserver();

    console.log("MWI Profit Calculator v3.1.4 loaded successfully!");
    console.log("  ✓ Progressive tooltip loading (instant price display)");
    console.log("  ✓ Essences calculation enabled");
    console.log("  ✓ Rare drops calculation enabled");
    console.log("  ✓ Processing Tea bonus enabled");
})();
