/**
 * Profit calculation module
 * Main logic for calculating production/gathering profit
 */

/**
 * Calculate profit for an item/action combination
 * @param {string} itemHrid - Item HRID
 * @param {string} actionHrid - Action HRID
 * @param {Object} marketJson - Market data object
 * @returns {Promise<Object|null>} Profit calculation result
 */
async function calculateProfit(itemHrid, actionHrid, marketJson) {
    const actionDetailMap = getActionDetailMap();
    const itemDetailMap = getItemDetailMap();
    const characterSkills = getCharacterSkills();

    if (!actionDetailMap || !itemDetailMap || !characterSkills) {
        return null;
    }

    // Check if this is a production action (has input materials)
    const isProduction =
        actionDetailMap[actionHrid].inputItems && actionDetailMap[actionHrid].inputItems.length > 0;

    // Get tea buffs
    const teaBuffs = getTeaBuffsByActionHrid(actionHrid);

    // Calculate resource costs
    let inputItems = [];
    let totalResourcesAskPricePerAction = 0;

    if (isProduction) {
        inputItems = JSON.parse(JSON.stringify(actionDetailMap[actionHrid].inputItems));
        for (const item of inputItems) {
            item.name = itemDetailMap[item.itemHrid].name;
            item.perAskPrice = marketJson?.marketData[item.itemHrid]?.[0].a || 0;
            totalResourcesAskPricePerAction += item.perAskPrice * item.count;
        }

        // Apply artisan tea (less resource consumption)
        totalResourcesAskPricePerAction *= 1 - teaBuffs.lessResource / 100;
    }

    // Calculate drink costs per hour
    let drinksConsumedPerHourAskPrice = 0;
    const actionTypeDrinkSlotsMap = getActionTypeDrinkSlotsMap();
    const drinksList = actionTypeDrinkSlotsMap?.[actionDetailMap[actionHrid].type] || [];
    for (const drink of drinksList) {
        if (drink && drink.itemHrid) {
            drinksConsumedPerHourAskPrice += (marketJson?.marketData[drink.itemHrid]?.[0].a ?? 0) * 12;
        }
    }

    // Calculate actions per hour (with tool speed buffs)
    const baseTimePerActionSec = actionDetailMap[actionHrid].baseTimeCost / 1000000000;
    const toolPercent = getToolsSpeedBuffByActionHrid(actionHrid);
    const actualTimePerActionSec = baseTimePerActionSec / (1 + toolPercent / 100);
    let actionPerHour = 3600 / actualTimePerActionSec;

    // Calculate items per hour
    let droprate = null;
    if (isProduction) {
        droprate = actionDetailMap[actionHrid].outputItems[0].count;
    } else {
        const dropTable = actionDetailMap[actionHrid].dropTable[0];
        droprate = (dropTable.minCount + dropTable.maxCount) / 2;
    }
    let itemPerHour = actionPerHour * droprate;

    // Get level efficiency buff (overleveling)
    const requiredLevel = actionDetailMap[actionHrid].levelRequirement.level;
    let currentLevel = requiredLevel;
    for (const skill of characterSkills) {
        if (skill.skillHrid === actionDetailMap[actionHrid].levelRequirement.skillHrid) {
            currentLevel = skill.level;
            break;
        }
    }
    const levelEffBuff = currentLevel - requiredLevel > 0 ? currentLevel - requiredLevel : 0;

    // Get house efficiency buff
    const houseEffBuff = getHousesEffBuffByActionHrid(actionHrid);

    // Get equipment efficiency buff
    const itemEffiBuff = Number(getItemEffiBuffByActionHrid(actionHrid));

    // Apply total efficiency to actions and items
    const totalEfficiency = levelEffBuff + houseEffBuff + teaBuffs.efficiency + itemEffiBuff;
    actionPerHour *= 1 + totalEfficiency / 100;
    itemPerHour *= 1 + totalEfficiency / 100;

    // Calculate extra free items from tea (quantity buffs)
    const extraFreeItemPerHour = (itemPerHour * teaBuffs.quantity) / 100;

    // Get market prices
    const ask = marketJson?.marketData[itemHrid]?.[0].a || 0;
    const bid = marketJson?.marketData[itemHrid]?.[0].b || 0;
    const bidAfterTax = bid * 0.98; // 2% market tax

    // Calculate profit per hour
    let profitPerHour;
    if (isProduction) {
        profitPerHour =
            itemPerHour * (bidAfterTax - totalResourcesAskPricePerAction / droprate) +
            extraFreeItemPerHour * bidAfterTax -
            drinksConsumedPerHourAskPrice;
    } else {
        profitPerHour = itemPerHour * bidAfterTax + extraFreeItemPerHour * bidAfterTax - drinksConsumedPerHourAskPrice;
    }

    return {
        isProduction,
        inputItems,
        totalResourcesAskPricePerAction,
        drinksConsumedPerHourAskPrice,
        baseTimePerActionSec,
        toolPercent,
        actionPerHour,
        itemPerHour,
        extraFreeItemPerHour,
        levelEffBuff,
        houseEffBuff,
        teaBuffs,
        itemEffiBuff,
        totalEfficiency,
        droprate,
        ask,
        bid,
        bidAfterTax,
        profitPerHour,
    };
}

// Export to global scope for Tampermonkey
window.calculateProfit = calculateProfit;
