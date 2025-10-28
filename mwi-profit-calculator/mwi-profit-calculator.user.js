// ==UserScript==
// @name         MWI Profit Calculator
// @namespace    http://tampermonkey.net/
// @version      3.0.1
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
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/core/constants.js?v=2
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/core/data-manager.js?v=2
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/core/websocket.js?v=2
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/api/market-api.js?v=2
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/calculations/buffs.js?v=2
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/calculations/processing-mapping.js?v=4
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/calculations/chest-values.js?v=4
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/calculations/profit.js?v=4
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/ui/formatter.js?v=2
// @require      https://raw.githubusercontent.com/Seisen99/MilkUtils/master/mwi-profit-calculator/modules/ui/tooltip.js?v=4
// ==/UserScript==

/**
 * MWI Profit Calculator v3.0.1
 *
 * FIX in v3.0.1:
 * - Fixed unsafeWindow references for getItemValue and getProcessedItem
 *
 * NEW in v3.0.0:
 * - Essence drops calculation and display
 * - Rare drops calculation (including chest values)
 * - Processing Tea bonus (15% chance to get processed items)
 * - Improved tooltip layout and readability
 *
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

    console.log("MWI Profit Calculator v3.0.1 loaded successfully!");
    console.log("  ✓ Essences calculation enabled");
    console.log("  ✓ Rare drops calculation enabled");
    console.log("  ✓ Processing Tea bonus enabled");
})();
