/**
 * Chest value calculation module
 * Calculates expected value of non-tradeable chests based on their drop tables
 */

/**
 * Calculate the expected value of a chest based on its drop table
 * Uses openableLootDropMap from game data
 * @param {string} chestHrid - Chest item HRID
 * @param {Object} marketJson - Market data object
 * @returns {number} Expected bid value of the chest
 */
function getChestValue(chestHrid, marketJson) {
    // Get init client data
    const compressedData = localStorage.getItem("initClientData");
    if (!compressedData) {
        return 0;
    }

    let initData;
    try {
        const decompressed = LZString.decompressFromUTF16(compressedData);
        if (!decompressed) return 0;
        initData = JSON.parse(decompressed);
    } catch (error) {
        console.error("Error decompressing init client data:", error);
        return 0;
    }

    // Check if chest has a drop table
    if (!initData?.openableLootDropMap?.[chestHrid]) {
        return 0;
    }

    const drops = initData.openableLootDropMap[chestHrid];
    let totalBidValue = 0;

    for (const drop of drops) {
        const expectedYield = ((drop.minCount + drop.maxCount) / 2) * drop.dropRate;
        
        // Get item price (recursively handle nested chests)
        let itemValue;
        if (marketJson?.marketData?.[drop.itemHrid]?.[0]?.b) {
            itemValue = marketJson.marketData[drop.itemHrid][0].b * 0.98; // Apply 2% tax
        } else {
            // If item not tradeable, it might be another chest
            itemValue = getChestValue(drop.itemHrid, marketJson);
        }
        
        totalBidValue += itemValue * expectedYield;
    }

    return totalBidValue;
}

/**
 * Get item value (handles both tradeable items and chests)
 * @param {string} itemHrid - Item HRID
 * @param {Object} marketJson - Market data object
 * @returns {number} Item value (bid price with tax)
 */
function getItemValue(itemHrid, marketJson) {
    // Try to get from market
    if (marketJson?.marketData?.[itemHrid]?.[0]?.b) {
        return marketJson.marketData[itemHrid][0].b * 0.98; // Apply 2% tax
    }
    
    // If not tradeable, try as chest
    return getChestValue(itemHrid, marketJson);
}

// Export to global scope for Tampermonkey
unsafeWindow.getChestValue = getChestValue;
unsafeWindow.getItemValue = getItemValue;
