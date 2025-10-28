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

    // Find insertion point
    let insertAfterElem = null;
    const amountSpan = tooltip.querySelectorAll("span")[1];
    if (amountSpan && getOriTextFromElement(amountSpan).includes("Amount:")) {
        insertAfterElem = amountSpan.parentNode.nextSibling;
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

    // Show market prices
    appendHTMLStr += `<div style="color: ${window.SCRIPT_COLOR_TOOLTIP};">Price: ${numberFormatter(ask)} / ${numberFormatter(bid)}</div>`;

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

    // Add profit information header
    appendHTMLStr += `<div style="color: ${window.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem;">Production profit (Ask price in, Bid price out after tax; Not including processing tea, community buffs, rare drops, pouch buffs):</div>`;

    // Show input materials table for production actions
    if (profit.isProduction && profit.inputItems.length > 0) {
        appendHTMLStr += `
            <div style="color: ${window.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem;">
                <table style="width:100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid ${window.SCRIPT_COLOR_TOOLTIP};">
                        <th style="text-align: left;">Material</th>
                        <th style="text-align: center;">Count</th>
                        <th style="text-align: right;">Ask</th>
                    </tr>
                    <tr style="border-bottom: 1px solid ${window.SCRIPT_COLOR_TOOLTIP};">
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

    // Show buff details
    appendHTMLStr += `<div style="color: ${window.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem;">${profit.baseTimePerActionSec.toFixed(
        2
    )}s base speed, x${profit.droprate} base drop rate, +${profit.toolPercent}% tool speed, +${profit.levelEffBuff}% level eff, +${
        profit.houseEffBuff
    }% house eff, +${profit.teaBuffs.efficiency}% tea eff, +${profit.itemEffiBuff}% equipment eff, +${
        profit.teaBuffs.quantity
    }% tea extra outcome, +${profit.teaBuffs.lessResource}% tea lower resource</div>`;

    // Show drinks consumption
    appendHTMLStr += `<div style="color: ${window.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem;">Drinks consumed per hour: ${numberFormatter(
        profit.drinksConsumedPerHourAskPrice
    )}</div>`;

    // Show production statistics
    appendHTMLStr += `<div style="color: ${window.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem;">Actions per hour: ${Number(
        profit.actionPerHour
    ).toFixed(1)} times, Production per hour: ${Number(profit.itemPerHour + profit.extraFreeItemPerHour).toFixed(1)} items</div>`;

    // Show profit summary
    appendHTMLStr += `<div style="color: ${window.SCRIPT_COLOR_TOOLTIP};">Profit: ${numberFormatter(
        profit.profitPerHour / profit.actionPerHour
    )}/action, ${numberFormatter(profit.profitPerHour)}/hour, ${numberFormatter(24 * profit.profitPerHour)}/day</div>`;

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
window.getOriTextFromElement = getOriTextFromElement;
window.getActionHridFromItemName = getActionHridFromItemName;
window.handleTooltipItem = handleTooltipItem;
window.initializeTooltipObserver = initializeTooltipObserver;
