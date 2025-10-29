/**
 * Tooltip handling module
 * Manages item tooltip enhancement with profit calculations
 */

// Cache for profit calculations (itemHrid -> profit data)
const profitCache = new Map();

// Current active tooltip data
let currentTooltipData = null;

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
 * Build profit HTML from calculation result
 * @param {Object} profit - Profit calculation result
 * @returns {string} HTML string for profit display
 */
function buildProfitHTML(profit) {
    let profitHTML = "";

    // Show input materials table for production actions
    if (profit.isProduction && profit.inputItems.length > 0) {
        profitHTML += `
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
            profitHTML += `
                <tr>
                    <td style="text-align: left;">${item.name}</td>
                    <td style="text-align: center;">${item.count}</td>
                    <td style="text-align: right;">${numberFormatter(item.perAskPrice)}</td>
                </tr>`;
        }
        profitHTML += `</table></div>`;
    }

    // Show production statistics
    profitHTML += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem; margin-top: 4px;">
        <b>Production:</b> ${Number(profit.actionPerHour).toFixed(1)} actions/h → ${Number(profit.itemPerHour + profit.extraFreeItemPerHour).toFixed(1)} items/h
    </div>`;

    // Show Processing Tea bonus (if active)
    if (profit.hasProcessingTea && profit.processingTeaItemsPerHour > 0) {
        const itemDetailMap = getItemDetailMap();
        const processedItemName = itemDetailMap[profit.processedItemHrid]?.name || "Processed";
        profitHTML += `<div style="color: #FFD700; font-size: 0.625rem;">
            <b>🍵 Processing Tea:</b> ${Number(profit.processingTeaItemsPerHour).toFixed(1)} ${processedItemName}/h 
            (+${numberFormatter(profit.processingTeaBonusPerHour)}/h)
        </div>`;
    }

    // Show Essence drops (if any)
    if (profit.essenceDetails && profit.essenceDetails.length > 0) {
        profitHTML += `<div style="color: #9C27B0; font-size: 0.625rem;">
            <b>✨ Essences:</b> +${numberFormatter(profit.essenceValuePerHour)}/h`;
        for (const essence of profit.essenceDetails) {
            if (essence.dropRate >= 0.01) { // Only show if >= 1%
                profitHTML += `<br>&nbsp;&nbsp;• ${essence.name}: ${Number(essence.perHour).toFixed(2)}/h`;
            }
        }
        profitHTML += `</div>`;
    }

    // Show Rare drops (if any)
    if (profit.rareDropDetails && profit.rareDropDetails.length > 0) {
        profitHTML += `<div style="color: #FF6B6B; font-size: 0.625rem;">
            <b>💎 Rare Drops:</b> +${numberFormatter(profit.rareDropsValuePerHour)}/h`;
        for (const rare of profit.rareDropDetails) {
            const ratePercent = (rare.dropRate * 100).toFixed(rare.dropRate < 0.01 ? 3 : 2);
            profitHTML += `<br>&nbsp;&nbsp;• ${rare.name} (${ratePercent}%): ${numberFormatter(rare.valuePerHour)}/h`;
        }
        profitHTML += `</div>`;
    }

    // Show drinks consumption
    if (profit.drinksConsumedPerHourAskPrice > 0) {
        profitHTML += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem; margin-top: 4px;">
            <b>Drinks cost:</b> -${numberFormatter(profit.drinksConsumedPerHourAskPrice)}/h
        </div>`;
    }

    // Show profit summary (bold and bigger)
    profitHTML += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; margin-top: 6px; font-weight: bold;">
        <b>💰 Profit:</b> ${numberFormatter(profit.profitPerHour / profit.actionPerHour)}/action, 
        ${numberFormatter(profit.profitPerHour)}/hour, 
        ${numberFormatter(24 * profit.profitPerHour)}/day
    </div>`;

    // Show buff summary (collapsed)
    profitHTML += `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.5625rem; margin-top: 4px; opacity: 0.7;">
        Buffs: +${profit.totalEfficiency.toFixed(1)}% efficiency (${profit.levelEffBuff}% level, ${profit.houseEffBuff}% house, ${profit.teaBuffs.efficiency}% tea, ${profit.itemEffiBuff}% equip), +${profit.toolPercent}% speed
    </div>`;

    return profitHTML;
}

/**
 * Calculate and display profit for current tooltip
 */
async function calculateAndDisplayProfit() {
    if (!currentTooltipData) return;

    const { tooltip, itemHrid, actionHrid, stackQuantity, profitIndicatorElem } = currentTooltipData;

    // Check if tooltip still exists
    if (!document.body.contains(tooltip) || !profitIndicatorElem) return;

    // Check cache first
    if (profitCache.has(itemHrid)) {
        const profit = profitCache.get(itemHrid);
        profitIndicatorElem.outerHTML = buildProfitHTML(profit);
        return;
    }

    // Show calculating indicator
    profitIndicatorElem.innerHTML = `<span style="opacity: 0.6;">⏳ Calculating...</span>`;

    try {
        const marketJson = await fetchMarketJSON();
        if (!marketJson) {
            profitIndicatorElem.innerHTML = `<span style="color: #FF6B6B;">❌ Market data unavailable</span>`;
            return;
        }

        const profit = await calculateProfit(itemHrid, actionHrid, marketJson);
        
        // Check if tooltip still exists
        if (!document.body.contains(tooltip) || !profitIndicatorElem) return;

        if (!profit) {
            profitIndicatorElem.remove();
            return;
        }

        // Cache the result
        profitCache.set(itemHrid, profit);

        // Build and display profit HTML
        const profitHTML = buildProfitHTML(profit);
        profitIndicatorElem.outerHTML = profitHTML;

    } catch (error) {
        console.error("Error calculating profit:", error);
        if (profitIndicatorElem && document.body.contains(profitIndicatorElem)) {
            profitIndicatorElem.innerHTML = `<span style="color: #FF6B6B;">❌ Error calculating profit</span>`;
        }
    }
}

/**
 * Handle tooltip display for an item (instant price display)
 * @param {HTMLElement} tooltip - Tooltip element
 */
function handleTooltipItem(tooltip) {
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
        // Extract quantity from "Amount: 50" or "Amount: 37,000" or "Amount: 37 000" text
        const amountText = getOriTextFromElement(amountSpan);
        const match = amountText.match(/Amount:\s*([\d,\s]+)/);
        if (match) {
            // Remove commas AND spaces before parsing (37,000 → 37000 or 37 000 → 37000)
            const cleanNumber = match[1].replace(/[,\s]/g, '');
            stackQuantity = parseInt(cleanNumber);
        }
    } else {
        insertAfterElem = tooltip.querySelectorAll("span")[0].parentNode.nextSibling;
    }

    if (!insertAfterElem) return;

    // Get market data and display price immediately
    fetchMarketJSON().then(marketJson => {
        if (!marketJson) return;

        const ask = marketJson?.marketData[itemHrid]?.[0].a;
        const bid = marketJson?.marketData[itemHrid]?.[0].b;

        // Show market prices IMMEDIATELY (fast)
        let priceHTML = `<div style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP};">Price: ${numberFormatter(ask)} / ${numberFormatter(bid)}`;
        if (stackQuantity > 1) {
            priceHTML += `<br><span style="opacity: 0.8;">Total (×${stackQuantity}): ${numberFormatter(ask * stackQuantity)} / ${numberFormatter(bid * stackQuantity)}</span>`;
        }
        priceHTML += `</div>`;

        // Check if this item is producible
        const actionHrid = getActionHridFromItemName(itemName);
        if (!actionHrid) {
            // Not producible, just show price
            insertAfterElem.insertAdjacentHTML("afterend", priceHTML);
            return;
        }

        // Add profit calculation prompt
        const profitPromptHTML = `<div class="profit-prompt-indicator" data-item-hrid="${itemHrid}" style="color: ${unsafeWindow.SCRIPT_COLOR_TOOLTIP}; font-size: 0.625rem; margin-top: 4px; padding: 4px 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; border-left: 3px solid #4CAF50;">
            <span style="opacity: 0.9;">💡 Press <b style="color: #4CAF50; font-size: 0.75rem;">K</b> to calculate profit details</span>
        </div>`;
        
        insertAfterElem.insertAdjacentHTML("afterend", priceHTML + profitPromptHTML);

        // Store current tooltip data for keyboard handler
        const profitIndicatorElem = tooltip.querySelector(`.profit-prompt-indicator[data-item-hrid="${itemHrid}"]`);
        currentTooltipData = {
            tooltip,
            itemHrid,
            actionHrid,
            stackQuantity,
            profitIndicatorElem
        };

    }).catch(error => {
        console.error("Error fetching market data:", error);
    });
}

/**
 * Handle keyboard events for profit calculation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardShortcut(event) {
    // Check if K key is pressed
    if (event.key === 'k' || event.key === 'K') {
        // Don't trigger if user is typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        if (currentTooltipData) {
            calculateAndDisplayProfit();
        }
    }
}

/**
 * Initialize tooltip observer
 */
function initializeTooltipObserver() {
    const tooltipObserver = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
            for (const added of mutation.addedNodes) {
                if (added.classList && added.classList.contains("MuiTooltip-popper")) {
                    if (added.querySelector("div.ItemTooltipText_name__2JAHA")) {
                        handleTooltipItem(added);
                    }
                }
            }
            // Reset current tooltip data when tooltip is removed
            for (const removed of mutation.removedNodes) {
                if (removed.classList && removed.classList.contains("MuiTooltip-popper")) {
                    if (currentTooltipData && currentTooltipData.tooltip === removed) {
                        currentTooltipData = null;
                    }
                }
            }
        }
    });

    tooltipObserver.observe(document.body, { attributes: false, childList: true, characterData: false });
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    console.log("Tooltip observer initialized (Press K to calculate profit)");
}

// Export to global scope for Tampermonkey
unsafeWindow.getOriTextFromElement = getOriTextFromElement;
unsafeWindow.getActionHridFromItemName = getActionHridFromItemName;
unsafeWindow.handleTooltipItem = handleTooltipItem;
unsafeWindow.initializeTooltipObserver = initializeTooltipObserver;
unsafeWindow.calculateAndDisplayProfit = calculateAndDisplayProfit;
