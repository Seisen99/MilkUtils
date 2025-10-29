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

/**
 * MWI Profit Calculator v3.1.4
 *
 * FIX in v3.1.4:
 * - Migrated from GitHub raw URLs to jsDelivr CDN
 * - Fixes 429 "Too Many Requests" rate limiting errors
 * - Faster loading with global CDN distribution
 *
 * FIX in v3.1.3:
 * - Added setTimeout(0) to force browser render cycle between price display and profit calculation
 * - This ensures price + loading indicator appear before heavy calculations start
 * - Should now have visible "⏳ Calculating profit..." indicator
 *
 * FIX in v3.1.2:
 * - Fixed progressive tooltip: removed await/async to allow non-blocking rendering
 * - Price now displays instantly while profit calculates in background
 * - Changed from async/await to .then().catch() for true async behavior
 *
 * FIX in v3.1.1:
 * - Fixed CSS selector error with itemHrid containing slashes
 * - Now using class + data-attribute instead of ID for loading indicator
 *
 * NEW in v3.1.0:
 * - Progressive tooltip loading: price displays instantly, profit calculates asynchronously
 * - Loading indicator shows while calculating profit for items with complex calculations
 * - Fixed stack quantity parsing for large numbers (supports both commas and spaces)
 *
 * NEW in v3.0.3:
 * - Rare Find buff from equipped items now applied to rare drop calculations
 * - Supports any equipment with skillingRareFind stat (rings, earrings, necklaces, etc.)
 * - Enhancement bonuses included in rare find calculation
 *
 * FIX in v3.0.2:
 * - Show total stack value in tooltip when hovering items with quantity > 1
 * - Display: "Price: 100 / 95" + "Total (×50): 5,000 / 4,750"
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

    console.log("MWI Profit Calculator v3.1.4 loaded successfully!");
    console.log("  ✓ Progressive tooltip loading (instant price display)");
    console.log("  ✓ Essences calculation enabled");
    console.log("  ✓ Rare drops calculation enabled");
    console.log("  ✓ Processing Tea bonus enabled");
})();
