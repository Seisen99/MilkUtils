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

    // ===== NEW: Calculate Essence drops value =====
    let essenceValuePerHour = 0;
    let essenceDetails = [];
    if (actionDetailMap[actionHrid].essenceDropTable) {
        for (const essence of actionDetailMap[actionHrid].essenceDropTable) {
            const essencePrice = unsafeWindow.getItemValue(essence.itemHrid, marketJson);
            const avgEssencePerAction = essence.dropRate * (essence.minCount + essence.maxCount) / 2;
            const essencePerHour = actionPerHour * avgEssencePerAction;
            const essenceValue = essencePerHour * essencePrice;
            essenceValuePerHour += essenceValue;
            
            essenceDetails.push({
                itemHrid: essence.itemHrid,
                name: itemDetailMap[essence.itemHrid]?.name || "Unknown",
                dropRate: essence.dropRate,
                perHour: essencePerHour,
                valuePerHour: essenceValue
            });
        }
    }

    // ===== NEW: Calculate Rare drops value =====
    let rareDropsValuePerHour = 0;
    let rareDropDetails = [];
    const rareFindBuff = unsafeWindow.getRareFindBuff(); // Get Rare Find from equipped items
    
    if (actionDetailMap[actionHrid].rareDropTable) {
        for (const rare of actionDetailMap[actionHrid].rareDropTable) {
            const rarePrice = unsafeWindow.getItemValue(rare.itemHrid, marketJson);
            // Apply Rare Find buff to drop rate
            const avgRarePerAction = rare.dropRate * (1 + rareFindBuff) * (rare.minCount + rare.maxCount) / 2;
            const rarePerHour = actionPerHour * avgRarePerAction;
            const rareValue = rarePerHour * rarePrice;
            rareDropsValuePerHour += rareValue;
            
            rareDropDetails.push({
                itemHrid: rare.itemHrid,
                name: itemDetailMap[rare.itemHrid]?.name || "Unknown",
                dropRate: rare.dropRate * (1 + rareFindBuff), // Show actual drop rate with buff
                perHour: rarePerHour,
                valuePerHour: rareValue
            });
        }
    }

    // ===== NEW: Calculate Processing Tea bonus =====
    let processingTeaBonusPerHour = 0;
    let processingTeaItemsPerHour = 0;
    let processedItemHrid = null;
    const hasProcessingTea = teaBuffs.upgradedProduct > 0;
    
    if (!isProduction && hasProcessingTea) {
        processedItemHrid = unsafeWindow.getProcessedItem(itemHrid);
        if (processedItemHrid) {
            const rawPrice = bidAfterTax;
            const processedPrice = unsafeWindow.getItemValue(processedItemHrid, marketJson);
            const priceDifference = processedPrice - rawPrice;
            
            // 15% of items become processed directly
            processingTeaItemsPerHour = itemPerHour * 0.15;
            processingTeaBonusPerHour = processingTeaItemsPerHour * priceDifference;
        }
    }

    // Calculate profit per hour (including all bonuses)
    let profitPerHour;
    if (isProduction) {
        profitPerHour =
            itemPerHour * (bidAfterTax - totalResourcesAskPricePerAction / droprate) +
            extraFreeItemPerHour * bidAfterTax +
            essenceValuePerHour +
            rareDropsValuePerHour -
            drinksConsumedPerHourAskPrice;
    } else {
        profitPerHour = 
            itemPerHour * bidAfterTax + 
            extraFreeItemPerHour * bidAfterTax + 
            processingTeaBonusPerHour +
            essenceValuePerHour +
            rareDropsValuePerHour -
            drinksConsumedPerHourAskPrice;
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
        // New fields
        essenceValuePerHour,
        essenceDetails,
        rareDropsValuePerHour,
        rareDropDetails,
        processingTeaBonusPerHour,
        processingTeaItemsPerHour,
        processedItemHrid,
        hasProcessingTea,
    };
}

// Export to global scope for Tampermonkey
unsafeWindow.calculateProfit = calculateProfit;
