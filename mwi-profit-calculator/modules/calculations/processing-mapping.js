/**
 * Processing Tea mapping module
 * Maps gathered resources to their processed versions
 * Processing Tea gives 15% chance to get processed item directly per action
 */

// Mapping: Raw resource → Processed item
const PROCESSING_MAP = {
    // Milking → Cheesesmithing
    "/items/milk": "/items/cheese",
    "/items/verdant_milk": "/items/verdant_cheese",
    "/items/azure_milk": "/items/azure_cheese",
    "/items/burble_milk": "/items/burble_cheese",
    "/items/crimson_milk": "/items/crimson_cheese",
    "/items/rainbow_milk": "/items/rainbow_cheese",
    "/items/holy_milk": "/items/holy_cheese",
    
    // Woodcutting → Crafting (Lumber)
    "/items/log": "/items/lumber",
    "/items/birch_log": "/items/birch_lumber",
    "/items/cedar_log": "/items/cedar_lumber",
    "/items/purpleheart_log": "/items/purpleheart_lumber",
    "/items/ginkgo_log": "/items/ginkgo_lumber",
    "/items/redwood_log": "/items/redwood_lumber",
    "/items/arcane_log": "/items/arcane_lumber",
    
    // Foraging → Tailoring (Fabric)
    "/items/cotton": "/items/cotton_fabric",
    "/items/flax": "/items/linen_fabric",
    "/items/bamboo_branch": "/items/bamboo_fabric",
    "/items/cocoon": "/items/silk_fabric",
    "/items/radiant_fiber": "/items/radiant_fabric",
};

/**
 * Get processed item HRID from raw resource HRID
 * @param {string} rawItemHrid - Raw resource HRID
 * @returns {string|null} Processed item HRID or null
 */
function getProcessedItem(rawItemHrid) {
    return PROCESSING_MAP[rawItemHrid] || null;
}

/**
 * Check if an item can be processed
 * @param {string} itemHrid - Item HRID
 * @returns {boolean} True if item has a processed version
 */
function canBeProcessed(itemHrid) {
    return itemHrid in PROCESSING_MAP;
}

// Export to global scope for Tampermonkey
unsafeWindow.PROCESSING_MAP = PROCESSING_MAP;
unsafeWindow.getProcessedItem = getProcessedItem;
unsafeWindow.canBeProcessed = canBeProcessed;
