/**
 * Market API module for fetching and caching market data
 */

/**
 * Fetch market data from API with caching
 * @param {boolean} forceFetch - Force fetch even if cache is valid
 * @returns {Promise<Object|null>} Market data object
 */
async function fetchMarketJSON(forceFetch = false) {
    // Check cache (1 hour validity)
    if (
        !forceFetch &&
        localStorage.getItem("MWI_ProfitCalc_marketAPI_timestamp") &&
        Date.now() - localStorage.getItem("MWI_ProfitCalc_marketAPI_timestamp") < window.MARKET_CACHE_DURATION
    ) {
        return JSON.parse(localStorage.getItem("MWI_ProfitCalc_marketAPI_json"));
    }

    // Get appropriate XHR function
    const sendRequest =
        typeof GM.xmlHttpRequest === "function" ? GM.xmlHttpRequest : typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : null;

    if (typeof sendRequest != "function") {
        console.error("No GM xmlHttpRequest available");
        return null;
    }

    // Fetch from API
    console.log("Fetching market data from API...");
    const response = await sendRequest({
        url: window.MARKET_API_URL,
        method: "GET",
        synchronous: true,
        timeout: 5000,
    });

    if (response?.status === 200) {
        try {
            const jsonObj = JSON.parse(response.responseText);

            if (jsonObj && jsonObj.timestamp && jsonObj.marketData) {
                // Add fixed prices for non-tradeable items
                jsonObj.marketData["/items/coin"] = { 0: { a: 1, b: 1 } };
                jsonObj.marketData["/items/task_token"] = { 0: { a: 0, b: 0 } };

                // Save to cache
                localStorage.setItem("MWI_ProfitCalc_marketAPI_timestamp", Date.now());
                localStorage.setItem("MWI_ProfitCalc_marketAPI_json", JSON.stringify(jsonObj));

                console.log("Market data fetched successfully");
                return jsonObj;
            }
        } catch (error) {
            console.error("Failed to parse market JSON:", error);
        }
    }

    console.error("Failed to fetch market data");
    return null;
}

// Export to global scope for Tampermonkey
window.fetchMarketJSON = fetchMarketJSON;
