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
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/core/constants.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/core/data-manager.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/core/websocket.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/api/market-api.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/calculations/buffs.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/calculations/profit.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/ui/formatter.js
// @require      file:///home/bob/Code/AgentsTesting/MilkyUtils/mwi-profit-calculator/modules/ui/tooltip.js
// ==/UserScript==

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
