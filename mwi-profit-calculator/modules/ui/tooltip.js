/**
 * Tooltip handling module
 * Manages item tooltip enhancement with profit calculations
 */

/**
 * Get original text from element (handles data-original-text attribute)
 * @param {HTMLElement} elem - Element to get text from
 * @returns {string} Original text content
 */
function getOriTextFromElement(elem) {
    if (!elem) return "";
    return elem.getAttribute("data-original-text") || elem.textContent;
}

/**
 * Convert item name to action HRID
 * @param {string} name - Item name
 * @returns {string|null} Action HRID
 */
function getActionHridFromItemName(name) {
    let newName = name.replace("Milk", "Cow");
    newName = newName.replace("Log", "Tree");
    newName = newName.replace("Cowing", "Milking");
    newName = newName.replace("Rainbow Cow", "Unicow");

    const actionDetailMap = getActionDetailMap();
    if (!actionDetailMap) {
        return null;
    }

    for (const action of Object.values(actionDetailMap)) {
        if (action.name === newName) {
            return action.hrid;
        }
    }
    return null;
}

/**
 * Handle tooltip display for an item
 * @param {HTMLElement} tooltip - Tooltip element
 */
async function handleTooltipItem(tooltip) {
    const itemNameElem = tooltip.querySelector("div.ItemTooltipText_name__2JAHA span");
    if (!itemNameElem) return;

    let itemName = getOriTextFromElement(itemNameElem);
    const itemHrid = getItemHridFromName(itemName);
    if (!itemHrid) return;

    // Find insertion point and extract stack quantity
    let insertAfterElem = null;
    let stackQuantity = 1;
    const amountSpan = tooltip.querySelectorAll("span")[1];
    if (amountSpan && getOriTextFromElement(amountSpan).includes("Amount:")) {
        insertAfterElem = amountSpan.parentNode.nextSibling;
        // Extract quantity from "Amount: 50" text
        const amountText = getOriTextFromElement(amountSpan);
        const match = amountText.match(/Amount:\s*(\d+)/);
        if (match) {
            stackQuantity = parseInt(match[1]);
        }
    } else {
        insertAfterElem = tooltip.querySelectorAll("span")[0].parentNode.nextSibling;
    }

    if (!insertAfterElem) return;

    // Get market data
    const marketJson = await fetchMarketJSON();
    if (!marketJson) return;

    const ask = marketJson?.marketData[itemHrid]?.[0].a;
    const bid = marketJson?.marketData[itemHrid]?.[0].b;

    let appendHTMLStr = "";

    // Show market prices (unit price + total if stack > 1)
    appendHTMLStr += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP};">Price: ${numberFormatter(ask)} / ${numberFormatter(bid)}`;
    if (stackQuantity > 1) {
        appendHTMLStr += `<br><span style="opacity: 0.8;">Total (×${stackQuantity}): ${numberFormatter(ask * stackQuantity)} / ${numberFormatter(bid * stackQuantity)}</span>`;
    }
    appendHTMLStr += `</div>`;

    // Calculate profit if this item is producible
    const actionHrid = getActionHridFromItemName(itemName);
    if (!actionHrid) {
        insertAfterElem.insertAdjacentHTML("afterend", appendHTMLStr);
        return;
    }

    const profit = await calculateProfit(itemHrid, actionHrid, marketJson);
    if (!profit) {
        insertAfterElem.insertAdjacentHTML("afterend", appendHTMLStr);
        return;
    }

    // Show input materials table for production actions
    if (profit.isProduction && profit.inputItems.length > 0) {
        appendHTMLStr += `
            <div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem;">
                <table style="width:100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid ${unsafeWindow.SCRIPT_COLOR_TOOLTIP};">
                        <th style="text-align: left;">Material</th>
                        <th style="text-align: center;">Count</th>
                        <th style="text-align: right;">Ask</th>
                    </tr>
                    <tr style="border-bottom: 1px solid ${unsafeWindow.SCRIPT_COLOR_TOOLTIP};">
                        <td style="text-align: left;"><b>Total</b></td>
                        <td style="text-align: center;"><b>${profit.inputItems.reduce((sum, item) => sum + item.count, 0)}</b></td>
                        <td style="text-align: right;"><b>${numberFormatter(profit.totalResourcesAskPricePerAction)}</b></td>
                    </tr>`;

        for (const item of profit.inputItems) {
            appendHTMLStr += `
                <tr>
                    <td style="text-align: left;">${item.name}</td>
                    <td style="text-align: center;">${item.count}</td>
                    <td style="text-align: right;">${numberFormatter(item.perAskPrice)}</td>
                </tr>`;
        }
        appendHTMLStr += `</table></div>`;
    }

    // Show production statistics
    appendHTMLStr += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem; margin-top: 4px;">
        <b>Production:</b> ${Number(profit.actionPerHour).toFixed(1)} actions/h → ${Number(profit.itemPerHour + profit.extraFreeItemPerHour).toFixed(1)} items/h
    </div>`;

    // Show Processing Tea bonus (if active)
    if (profit.hasProcessingTea && profit.processingTeaItemsPerHour > 0) {
        const itemDetailMap = getItemDetailMap();
        const processedItemName = itemDetailMap[profit.processedItemHrid]?.name || "Processed";
        appendHTMLStr += `<div style="color: #FFD700; font-size: 0.625rem;">
            <b>🍵 Processing Tea:</b> ${Number(profit.processingTeaItemsPerHour).toFixed(1)} ${processedItemName}/h 
            (+${numberFormatter(profit.processingTeaBonusPerHour)}/h)
        </div>`;
    }

    // Show Essence drops (if any)
    if (profit.essenceDetails && profit.essenceDetails.length > 0) {
        appendHTMLStr += `<div style="color: #9C27B0; font-size: 0.625rem;">
            <b>✨ Essences:</b> +${numberFormatter(profit.essenceValuePerHour)}/h`;
        for (const essence of profit.essenceDetails) {
            if (essence.dropRate >= 0.01) { // Only show if >= 1%
                appendHTMLStr += `<br>&nbsp;&nbsp;• ${essence.name}: ${Number(essence.perHour).toFixed(2)}/h`;
            }
        }
        appendHTMLStr += `</div>`;
    }

    // Show Rare drops (if any)
    if (profit.rareDropDetails && profit.rareDropDetails.length > 0) {
        appendHTMLStr += `<div style="color: #FF6B6B; font-size: 0.625rem;">
            <b>💎 Rare Drops:</b> +${numberFormatter(profit.rareDropsValuePerHour)}/h`;
        for (const rare of profit.rareDropDetails) {
            const ratePercent = (rare.dropRate * 100).toFixed(rare.dropRate < 0.01 ? 3 : 2);
            appendHTMLStr += `<br>&nbsp;&nbsp;• ${rare.name} (${ratePercent}%): ${numberFormatter(rare.valuePerHour)}/h`;
        }
        appendHTMLStr += `</div>`;
    }

    // Show drinks consumption
    if (profit.drinksConsumedPerHourAskPrice > 0) {
        appendHTMLStr += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem; margin-top: 4px;">
            <b>Drinks cost:</b> -${numberFormatter(profit.drinksConsumedPerHourAskPrice)}/h
        </div>`;
    }

    // Show profit summary (bold and bigger)
    appendHTMLStr += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; margin-top: 6px; font-weight: bold;">
        <b>💰 Profit:</b> ${numberFormatter(profit.profitPerHour / profit.actionPerHour)}/action, 
        ${numberFormatter(profit.profitPerHour)}/hour, 
        ${numberFormatter(24 * profit.profitPerHour)}/day
    </div>`;

    // Show buff summary (collapsed)
    appendHTMLStr += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.5625rem; margin-top: 4px; opacity: 0.7;">
        Buffs: +${profit.totalEfficiency.toFixed(1)}% efficiency (${profit.levelEffBuff}% level, ${profit.houseEffBuff}% house, ${profit.teaBuffs.efficiency}% tea, ${profit.itemEffiBuff}% equip), +${profit.toolPercent}% speed
    </div>`;

    insertAfterElem.insertAdjacentHTML("afterend", appendHTMLStr);
}

/**
 * Initialize tooltip observer
 */
function initializeTooltipObserver() {
    const tooltipObserver = new MutationObserver(async function (mutations) {
        for (const mutation of mutations) {
            for (const added of mutation.addedNodes) {
                if (added.classList && added.classList.contains("MuiTooltip-popper")) {
                    if (added.querySelector("div.ItemTooltipText_name__2JAHA")) {
                        await handleTooltipItem(added);
                    }
                }
            }
        }
    });

    tooltipObserver.observe(document.body, { attributes: false, childList: true, characterData: false });
    console.log("Tooltip observer initialized");
}

// Export to global scope for Tampermonkey
unsafeWindow.getOriTextFromElement = getOriTextFromElement;
unsafeWindow.getActionHridFromItemName = getActionHridFromItemName;
unsafeWindow.handleTooltipItem = handleTooltipItem;
unsafeWindow.initializeTooltipObserver = initializeTooltipObserver;
