/**
 * Global constants and configuration for MWI Profit Calculator
 */

// API Configuration
const MARKET_API_URL = "https://www.milkywayidle.com/game_data/marketplace.json";

// UI Configuration
const SCRIPT_COLOR_TOOLTIP = "darkgreen";
const THOUSAND_SEPERATOR = new Intl.NumberFormat().format(1111).replaceAll("1", "").at(0) || "";

// Cache Configuration
const MARKET_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Action Type to Tool Speed Buff Mapping
const actionHridToToolsSpeedBuffNamesMap = {
    "/action_types/brewing": "brewingSpeed",
    "/action_types/cheesesmithing": "cheesesmithingSpeed",
    "/action_types/cooking": "cookingSpeed",
    "/action_types/crafting": "craftingSpeed",
    "/action_types/foraging": "foragingSpeed",
    "/action_types/milking": "milkingSpeed",
    "/action_types/tailoring": "tailoringSpeed",
    "/action_types/woodcutting": "woodcuttingSpeed",
    "/action_types/alchemy": "alchemySpeed",
};

// Action Type to House Room Mapping
const actionHridToHouseNamesMap = {
    "/action_types/brewing": "/house_rooms/brewery",
    "/action_types/cheesesmithing": "/house_rooms/forge",
    "/action_types/cooking": "/house_rooms/kitchen",
    "/action_types/crafting": "/house_rooms/workshop",
    "/action_types/foraging": "/house_rooms/garden",
    "/action_types/milking": "/house_rooms/dairy_barn",
    "/action_types/tailoring": "/house_rooms/sewing_parlor",
    "/action_types/woodcutting": "/house_rooms/log_shed",
    "/action_types/alchemy": "/house_rooms/laboratory",
};

// Item Enhancement Level to Buff Bonus Mapping
const itemEnhanceLevelToBuffBonusMap = {
    0: 0,
    1: 2,
    2: 4.2,
    3: 6.6,
    4: 9.2,
    5: 12.0,
    6: 15.0,
    7: 18.2,
    8: 21.6,
    9: 25.2,
    10: 29.0,
    11: 33.0,
    12: 37.2,
    13: 41.6,
    14: 46.2,
    15: 51.0,
    16: 56.0,
    17: 61.2,
    18: 66.6,
    19: 72.2,
    20: 78.0,
};

// Export to global scope for Tampermonkey
window.MARKET_API_URL = MARKET_API_URL;
window.SCRIPT_COLOR_TOOLTIP = SCRIPT_COLOR_TOOLTIP;
window.THOUSAND_SEPERATOR = THOUSAND_SEPERATOR;
window.MARKET_CACHE_DURATION = MARKET_CACHE_DURATION;
window.actionHridToToolsSpeedBuffNamesMap = actionHridToToolsSpeedBuffNamesMap;
window.actionHridToHouseNamesMap = actionHridToHouseNamesMap;
window.itemEnhanceLevelToBuffBonusMap = itemEnhanceLevelToBuffBonusMap;
