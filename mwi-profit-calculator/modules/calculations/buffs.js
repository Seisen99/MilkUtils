/**
 * Buff calculations module
 * Handles all buff calculations: tools, equipment, houses, tea/drinks
 */

/**
 * Calculate tool speed buff for an action
 * @param {string} actionHrid - Action HRID
 * @returns {number} Total tool speed buff percentage
 */
function getToolsSpeedBuffByActionHrid(actionHrid) {
    let totalBuff = 0;
    const characterItems = getCharacterItems();
    const actionDetailMap = getActionDetailMap();
    const itemDetailMap = getItemDetailMap();

    if (!characterItems || !actionDetailMap || !itemDetailMap) {
        return 0;
    }

    for (const item of characterItems) {
        if (item.itemLocationHrid.includes("_tool")) {
            const buffName = window.actionHridToToolsSpeedBuffNamesMap[actionDetailMap[actionHrid].type];
            const enhanceBonus = 1 + window.itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] / 100;
            const buff = itemDetailMap[item.itemHrid].equipmentDetail?.noncombatStats[buffName] || 0;
            totalBuff += buff * enhanceBonus;
        }
    }
    return Number(totalBuff * 100).toFixed(1);
}

/**
 * Calculate equipment efficiency buff for an action
 * @param {string} actionHrid - Action HRID
 * @returns {number} Total equipment efficiency buff percentage
 */
function getItemEffiBuffByActionHrid(actionHrid) {
    let buff = 0;
    const characterItems = getCharacterItems();
    const actionDetailMap = getActionDetailMap();
    const itemDetailMap = getItemDetailMap();

    if (!characterItems || !actionDetailMap || !itemDetailMap) {
        return 0;
    }

    const propertyName = actionDetailMap[actionHrid].type.replace("/action_types/", "") + "Efficiency";

    for (const item of characterItems) {
        if (item.itemLocationHrid === "/item_locations/inventory") {
            continue;
        }
        const itemDetail = itemDetailMap[item.itemHrid];
        const specificStat = itemDetail?.equipmentDetail?.noncombatStats[propertyName];
        if (specificStat && specificStat > 0) {
            const enhanceBonus = 1 + window.itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] / 100;
            buff += specificStat * enhanceBonus;
        }
    }
    return Number(buff * 100).toFixed(1);
}

/**
 * Calculate house efficiency buff for an action
 * @param {string} actionHrid - Action HRID
 * @returns {number} House efficiency buff percentage
 */
function getHousesEffBuffByActionHrid(actionHrid) {
    const characterHouseRoomMap = getCharacterHouseRoomMap();
    const actionDetailMap = getActionDetailMap();

    if (!characterHouseRoomMap || !actionDetailMap) {
        return 0;
    }

    const houseName = window.actionHridToHouseNamesMap[actionDetailMap[actionHrid].type];
    if (!houseName) {
        return 0;
    }
    const house = characterHouseRoomMap[houseName];
    if (!house) {
        return 0;
    }
    return house.level * 1.5;
}

/**
 * Calculate tea/drink buffs for an action
 * @param {string} actionHrid - Action HRID
 * @returns {Object} Tea buffs object with different buff types
 */
function getTeaBuffsByActionHrid(actionHrid) {
    const teaBuffs = {
        efficiency: 0, // Efficiency tea, specific teas, -Artisan tea
        quantity: 0, // Gathering tea, Gourmet tea
        lessResource: 0, // Artisan tea
        extraExp: 0, // Wisdom tea (not used)
        upgradedProduct: 0, // Processing tea (not used)
    };

    const actionTypeDrinkSlotsMap = getActionTypeDrinkSlotsMap();
    const actionDetailMap = getActionDetailMap();
    const itemDetailMap = getItemDetailMap();

    if (!actionTypeDrinkSlotsMap || !actionDetailMap || !itemDetailMap) {
        return teaBuffs;
    }

    const actionTypeId = actionDetailMap[actionHrid].type;
    const teaList = actionTypeDrinkSlotsMap[actionTypeId];

    if (!teaList) {
        return teaBuffs;
    }

    for (const tea of teaList) {
        if (!tea || !tea.itemHrid) {
            continue;
        }

        const itemDetail = itemDetailMap[tea.itemHrid];
        if (!itemDetail?.consumableDetail?.buffs) {
            continue;
        }

        for (const buff of itemDetail.consumableDetail.buffs) {
            if (buff.typeHrid === "/buff_types/artisan") {
                teaBuffs.lessResource += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/action_level") {
                teaBuffs.efficiency -= buff.flatBoost;
            } else if (buff.typeHrid === "/buff_types/gathering") {
                teaBuffs.quantity += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/gourmet") {
                teaBuffs.quantity += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/wisdom") {
                teaBuffs.extraExp += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/processing") {
                teaBuffs.upgradedProduct += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/efficiency") {
                teaBuffs.efficiency += buff.flatBoost * 100;
            } else if (buff.typeHrid === `/buff_types/${actionTypeId.replace("/action_types/", "")}_level`) {
                teaBuffs.efficiency += buff.flatBoost;
            }
        }
    }

    return teaBuffs;
}

// Export to global scope for Tampermonkey
window.getToolsSpeedBuffByActionHrid = getToolsSpeedBuffByActionHrid;
window.getItemEffiBuffByActionHrid = getItemEffiBuffByActionHrid;
window.getHousesEffBuffByActionHrid = getHousesEffBuffByActionHrid;
window.getTeaBuffsByActionHrid = getTeaBuffsByActionHrid;
