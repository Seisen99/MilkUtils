// ==UserScript==
// @name         MWI Profit Calculator
// @namespace    http://tampermonkey.net/
// @version      3.3.0
// @description  Calculate production profit with essences, rare drops, and processing tea bonus
// @author       Seisen
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        GM_addStyle
// @updateURL    https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/mwi-profit-calculator.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@master/mwi-profit-calculator/mwi-profit-calculator.user.js
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
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@515ad46/mwi-profit-calculator/modules/ui/fixed-panel.js
// @require      https://cdn.jsdelivr.net/gh/Seisen99/MilkUtils@515ad46/mwi-profit-calculator/modules/ui/tooltip.js
// ==/UserScript==


(function() {
    'use strict';

    // Initialize WebSocket hook for data interception
    hookWS();

    // Fetch initial market data
    fetchMarketJSON(true);

    // Initialize tooltip observer
    initializeTooltipObserver();

    console.log("MWI Profit Calculator v3.3.0 loaded successfully!");
    console.log("  ✓ Instant tooltip display (no lag)");
    console.log("  ✓ Fixed panel display (bottom-left corner, larger text)");
    console.log("  ✓ Press K to calculate profit details");
    console.log("  ✓ Profit calculation caching enabled");
    console.log("  ✓ Essences, rare drops, and processing tea support");
})();
