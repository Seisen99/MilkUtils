/**
 * Data manager for game data storage and decompression
 */

// Global data storage
let initData_characterSkills = null;
let initData_characterItems = null;
let initData_characterHouseRoomMap = null;
let initData_actionTypeDrinkSlotsMap = null;
let initData_actionDetailMap = null;
let initData_itemDetailMap = null;

let itemEnNameToHridMap = {};

/**
 * Decompress game data from localStorage
 * @param {string} compressedData - LZ-compressed data
 * @returns {Object|null} Decompressed data object
 */
function decompressInitClientData(compressedData) {
    try {
        const decompressedJson = LZString.decompressFromUTF16(compressedData);
        if (!decompressedJson) {
            throw new Error("decompressFromUTF16 returned null");
        }
        return JSON.parse(decompressedJson);
    } catch (error) {
        console.error("decompressInitClientData error:", error);
        return null;
    }
}

/**
 * Initialize static game data from localStorage
 */
function initializeStaticData() {
    if (localStorage.getItem("initClientData")) {
        const obj = decompressInitClientData(localStorage.getItem("initClientData"));
        console.log("Loaded initClientData:", obj);

        initData_actionDetailMap = obj.actionDetailMap;
        initData_itemDetailMap = obj.itemDetailMap;

        // Build item name to hrid mapping
        buildItemNameToHridMap();
    }
}

/**
 * Build mapping from item names to hrids
 */
function buildItemNameToHridMap() {
    if (!initData_itemDetailMap) return;
    
    itemEnNameToHridMap = {};
    for (const [key, value] of Object.entries(initData_itemDetailMap)) {
        itemEnNameToHridMap[value.name] = key;
    }
}

/**
 * Update character data from WebSocket message
 * @param {Object} data - Character data object
 */
function updateCharacterData(data) {
    initData_characterSkills = data.characterSkills;
    initData_characterItems = data.characterItems;
    initData_characterHouseRoomMap = data.characterHouseRoomMap;
    initData_actionTypeDrinkSlotsMap = data.actionTypeDrinkSlotsMap;
    console.log("Character data updated");
}

/**
 * Update static game data from WebSocket message
 * @param {Object} data - Client data object
 */
function updateClientData(data) {
    initData_actionDetailMap = data.actionDetailMap;
    initData_itemDetailMap = data.itemDetailMap;
    buildItemNameToHridMap();
    console.log("Client data updated");
}

/**
 * Get all character skills
 * @returns {Array|null} Character skills array
 */
function getCharacterSkills() {
    return initData_characterSkills;
}

/**
 * Get all character items
 * @returns {Array|null} Character items array
 */
function getCharacterItems() {
    return initData_characterItems;
}

/**
 * Get character house room map
 * @returns {Object|null} House room map
 */
function getCharacterHouseRoomMap() {
    return initData_characterHouseRoomMap;
}

/**
 * Get action type drink slots map
 * @returns {Object|null} Drink slots map
 */
function getActionTypeDrinkSlotsMap() {
    return initData_actionTypeDrinkSlotsMap;
}

/**
 * Get action detail map
 * @returns {Object|null} Action detail map
 */
function getActionDetailMap() {
    return initData_actionDetailMap;
}

/**
 * Get item detail map
 * @returns {Object|null} Item detail map
 */
function getItemDetailMap() {
    return initData_itemDetailMap;
}

/**
 * Get item hrid from item name
 * @param {string} itemName - Item name
 * @returns {string|undefined} Item hrid
 */
function getItemHridFromName(itemName) {
    return itemEnNameToHridMap[itemName];
}

// Initialize on load
initializeStaticData();

// Export to global scope for Tampermonkey
unsafeWindow.decompressInitClientData = decompressInitClientData;
unsafeWindow.initializeStaticData = initializeStaticData;
unsafeWindow.updateCharacterData = updateCharacterData;
unsafeWindow.updateClientData = updateClientData;
unsafeWindow.getCharacterSkills = getCharacterSkills;
unsafeWindow.getCharacterItems = getCharacterItems;
unsafeWindow.getCharacterHouseRoomMap = getCharacterHouseRoomMap;
unsafeWindow.getActionTypeDrinkSlotsMap = getActionTypeDrinkSlotsMap;
unsafeWindow.getActionDetailMap = getActionDetailMap;
unsafeWindow.getItemDetailMap = getItemDetailMap;
unsafeWindow.getItemHridFromName = getItemHridFromName;
