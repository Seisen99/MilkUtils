/**
 * Fixed panel module
 * Manages a fixed-position panel for displaying item profit information
 */

// Panel state
let fixedPanel = null;
let panelVisible = false;

/**
 * Initialize the fixed panel element
 */
function initializeFixedPanel() {
    if (fixedPanel) return; // Already initialized

    // Create panel container
    fixedPanel = document.createElement('div');
    fixedPanel.id = 'mwi-profit-fixed-panel';
    fixedPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 480px;
        max-height: 600px;
        overflow-y: auto;
        background: linear-gradient(135deg, rgba(20, 30, 40, 0.98) 0%, rgba(30, 40, 50, 0.98) 100%);
        border: 2px solid rgba(76, 175, 80, 0.5);
        border-radius: 12px;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: #e0e0e0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
        z-index: 99999;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
        backdrop-filter: blur(10px);
    `;

    // Add scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
        #mwi-profit-fixed-panel::-webkit-scrollbar {
            width: 8px;
        }
        #mwi-profit-fixed-panel::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        #mwi-profit-fixed-panel::-webkit-scrollbar-thumb {
            background: rgba(76, 175, 80, 0.5);
            border-radius: 4px;
        }
        #mwi-profit-fixed-panel::-webkit-scrollbar-thumb:hover {
            background: rgba(76, 175, 80, 0.7);
        }
        .mwi-profit-section {
            margin: 12px 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            border-left: 3px solid rgba(76, 175, 80, 0.6);
        }
        .mwi-profit-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .mwi-profit-table th,
        .mwi-profit-table td {
            padding: 6px 8px;
            text-align: left;
        }
        .mwi-profit-table th {
            border-bottom: 1px solid rgba(76, 175, 80, 0.4);
            font-weight: 600;
            color: #4CAF50;
        }
        .mwi-profit-table tr:not(:last-child) td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(fixedPanel);
    console.log("Fixed profit panel initialized");
}

/**
 * Show the fixed panel
 */
function showFixedPanel() {
    if (!fixedPanel) return;
    panelVisible = true;
    fixedPanel.style.opacity = '1';
    fixedPanel.style.transform = 'translateY(0)';
}

/**
 * Hide the fixed panel
 */
function hideFixedPanel() {
    if (!fixedPanel) return;
    panelVisible = false;
    fixedPanel.style.opacity = '0';
    fixedPanel.style.transform = 'translateY(20px)';
}

/**
 * Update fixed panel with item price information
 * @param {Object} data - Item data object
 * @param {string} data.itemName - Item name
 * @param {number} data.ask - Ask price
 * @param {number} data.bid - Bid price
 * @param {number} data.stackQuantity - Stack quantity
 * @param {boolean} data.isProducible - Whether item is producible
 */
function updateFixedPanelPrice(data) {
    if (!fixedPanel) initializeFixedPanel();

    const { itemName, ask, bid, stackQuantity, isProducible } = data;

    let html = `
        <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 2px solid rgba(76, 175, 80, 0.3);">
            <div style="font-size: 18px; font-weight: bold; color: #4CAF50; margin-bottom: 8px;">
                ${itemName}
            </div>
            <div style="font-size: 15px; color: #90EE90;">
                <span style="font-weight: 600;">Market Price:</span> 
                <span style="color: #fff;">${numberFormatter(ask)}</span> / 
                <span style="color: #fff;">${numberFormatter(bid)}</span>
            </div>
    `;

    if (stackQuantity > 1) {
        html += `
            <div style="font-size: 13px; color: #b0b0b0; margin-top: 4px;">
                Stack Total (×${stackQuantity}): 
                <span style="color: #fff;">${numberFormatter(ask * stackQuantity)}</span> / 
                <span style="color: #fff;">${numberFormatter(bid * stackQuantity)}</span>
            </div>
        `;
    }

    html += `</div>`;

    if (isProducible) {
        html += `
            <div style="text-align: center; padding: 12px; background: rgba(76, 175, 80, 0.15); border-radius: 8px; border: 1px solid rgba(76, 175, 80, 0.3);">
                <div style="font-size: 16px; color: #90EE90; margin-bottom: 4px;">
                    💡 Press <span style="font-weight: bold; font-size: 18px; color: #4CAF50; padding: 2px 8px; background: rgba(76, 175, 80, 0.2); border-radius: 4px;">K</span> to calculate profit
                </div>
                <div style="font-size: 12px; color: #b0b0b0; margin-top: 4px;">
                    Detailed production analysis available
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="text-align: center; padding: 8px; color: #888; font-size: 13px; font-style: italic;">
                This item cannot be produced
            </div>
        `;
    }

    fixedPanel.innerHTML = html;
    showFixedPanel();
}

/**
 * Update fixed panel with profit calculation results
 * @param {Object} data - Combined data object
 * @param {string} data.itemName - Item name
 * @param {number} data.ask - Ask price
 * @param {number} data.bid - Bid price
 * @param {number} data.stackQuantity - Stack quantity
 * @param {Object} data.profit - Profit calculation result
 */
function updateFixedPanelProfit(data) {
    if (!fixedPanel) initializeFixedPanel();

    const { itemName, ask, bid, stackQuantity, profit } = data;

    let html = `
        <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 2px solid rgba(76, 175, 80, 0.3);">
            <div style="font-size: 18px; font-weight: bold; color: #4CAF50; margin-bottom: 8px;">
                ${itemName}
            </div>
            <div style="font-size: 15px; color: #90EE90;">
                <span style="font-weight: 600;">Market Price:</span> 
                <span style="color: #fff;">${numberFormatter(ask)}</span> / 
                <span style="color: #fff;">${numberFormatter(bid)}</span>
            </div>
    `;

    if (stackQuantity > 1) {
        html += `
            <div style="font-size: 13px; color: #b0b0b0; margin-top: 4px;">
                Stack Total (×${stackQuantity}): 
                <span style="color: #fff;">${numberFormatter(ask * stackQuantity)}</span> / 
                <span style="color: #fff;">${numberFormatter(bid * stackQuantity)}</span>
            </div>
        `;
    }

    html += `</div>`;

    // Input materials table for production
    if (profit.isProduction && profit.inputItems.length > 0) {
        html += `
            <div class="mwi-profit-section">
                <div style="font-weight: 600; color: #4CAF50; margin-bottom: 8px; font-size: 15px;">
                    📦 Input Materials
                </div>
                <table class="mwi-profit-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Material</th>
                            <th style="text-align: center;">Count</th>
                            <th style="text-align: right;">Ask Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="font-weight: 600; background: rgba(76, 175, 80, 0.1);">
                            <td>Total</td>
                            <td style="text-align: center;">${profit.inputItems.reduce((sum, item) => sum + item.count, 0)}</td>
                            <td style="text-align: right;">${numberFormatter(profit.totalResourcesAskPricePerAction)}</td>
                        </tr>
        `;
        for (const item of profit.inputItems) {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center;">${item.count}</td>
                    <td style="text-align: right;">${numberFormatter(item.perAskPrice)}</td>
                </tr>
            `;
        }
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    // Production statistics
    html += `
        <div class="mwi-profit-section">
            <div style="font-weight: 600; color: #4CAF50; margin-bottom: 6px; font-size: 15px;">
                ⚙️ Production Rate
            </div>
            <div style="font-size: 14px;">
                <strong>${Number(profit.actionPerHour).toFixed(1)}</strong> actions/h → 
                <strong>${Number(profit.itemPerHour + profit.extraFreeItemPerHour).toFixed(1)}</strong> items/h
            </div>
        </div>
    `;

    // Processing Tea bonus
    if (profit.hasProcessingTea && profit.processingTeaItemsPerHour > 0) {
        const itemDetailMap = getItemDetailMap();
        const processedItemName = itemDetailMap[profit.processedItemHrid]?.name || "Processed";
        html += `
            <div class="mwi-profit-section" style="border-left-color: #FFD700;">
                <div style="font-weight: 600; color: #FFD700; margin-bottom: 6px; font-size: 15px;">
                    🍵 Processing Tea Bonus
                </div>
                <div style="font-size: 14px;">
                    ${Number(profit.processingTeaItemsPerHour).toFixed(1)} ${processedItemName}/h
                    <div style="color: #FFD700; font-weight: 600; margin-top: 4px;">
                        +${numberFormatter(profit.processingTeaBonusPerHour)}/h
                    </div>
                </div>
            </div>
        `;
    }

    // Essence drops
    if (profit.essenceDetails && profit.essenceDetails.length > 0) {
        html += `
            <div class="mwi-profit-section" style="border-left-color: #9C27B0;">
                <div style="font-weight: 600; color: #BB86FC; margin-bottom: 6px; font-size: 15px;">
                    ✨ Essence Drops
                </div>
                <div style="color: #BB86FC; font-weight: 600; font-size: 14px; margin-bottom: 6px;">
                    +${numberFormatter(profit.essenceValuePerHour)}/h
                </div>
        `;
        for (const essence of profit.essenceDetails) {
            if (essence.dropRate >= 0.01) {
                html += `
                    <div style="font-size: 13px; margin-left: 8px; color: #d0d0d0;">
                        • ${essence.name}: ${Number(essence.perHour).toFixed(2)}/h
                    </div>
                `;
            }
        }
        html += `</div>`;
    }

    // Rare drops
    if (profit.rareDropDetails && profit.rareDropDetails.length > 0) {
        html += `
            <div class="mwi-profit-section" style="border-left-color: #FF6B6B;">
                <div style="font-weight: 600; color: #FF8A8A; margin-bottom: 6px; font-size: 15px;">
                    💎 Rare Drops
                </div>
                <div style="color: #FF8A8A; font-weight: 600; font-size: 14px; margin-bottom: 6px;">
                    +${numberFormatter(profit.rareDropsValuePerHour)}/h
                </div>
        `;
        for (const rare of profit.rareDropDetails) {
            const ratePercent = (rare.dropRate * 100).toFixed(rare.dropRate < 0.01 ? 3 : 2);
            html += `
                <div style="font-size: 13px; margin-left: 8px; color: #d0d0d0;">
                    • ${rare.name} (${ratePercent}%): ${numberFormatter(rare.valuePerHour)}/h
                </div>
            `;
        }
        html += `</div>`;
    }

    // Drinks cost
    if (profit.drinksConsumedPerHourAskPrice > 0) {
        html += `
            <div class="mwi-profit-section" style="border-left-color: #FF5722;">
                <div style="font-weight: 600; color: #FF7043; margin-bottom: 6px; font-size: 15px;">
                    🍺 Drinks Cost
                </div>
                <div style="font-size: 14px; color: #FF7043;">
                    -${numberFormatter(profit.drinksConsumedPerHourAskPrice)}/h
                </div>
            </div>
        `;
    }

    // Profit summary (highlighted)
    html += `
        <div style="margin-top: 16px; padding: 14px; background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.2) 100%); border-radius: 8px; border: 2px solid rgba(76, 175, 80, 0.5);">
            <div style="font-size: 17px; font-weight: bold; color: #4CAF50; margin-bottom: 8px;">
                💰 Profit Analysis
            </div>
            <div style="font-size: 15px; line-height: 1.6;">
                <div><strong>${numberFormatter(profit.profitPerHour / profit.actionPerHour)}</strong> per action</div>
                <div><strong style="color: #90EE90;">${numberFormatter(profit.profitPerHour)}</strong> per hour</div>
                <div><strong style="color: #76FF03;">${numberFormatter(24 * profit.profitPerHour)}</strong> per day</div>
            </div>
        </div>
    `;

    // Buff summary
    html += `
        <div style="margin-top: 12px; padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 6px; font-size: 12px; color: #999;">
            <strong>Active Buffs:</strong> +${profit.totalEfficiency.toFixed(1)}% efficiency 
            (${profit.levelEffBuff}% level, ${profit.houseEffBuff}% house, ${profit.teaBuffs.efficiency}% tea, ${profit.itemEffiBuff}% equip), 
            +${profit.toolPercent}% speed
        </div>
    `;

    fixedPanel.innerHTML = html;
    showFixedPanel();
}

/**
 * Update panel with calculating indicator
 * @param {string} itemName - Item name
 */
function showFixedPanelCalculating(itemName) {
    if (!fixedPanel) return;
    
    const header = fixedPanel.querySelector('div:first-child');
    const prompt = fixedPanel.querySelector('[style*="Press"]')?.parentElement;
    
    if (prompt) {
        prompt.innerHTML = `
            <div style="text-align: center; padding: 12px; color: #90EE90;">
                <div style="font-size: 15px;">⏳ Calculating profit details...</div>
            </div>
        `;
    }
}

// Export to global scope for Tampermonkey
unsafeWindow.initializeFixedPanel = initializeFixedPanel;
unsafeWindow.showFixedPanel = showFixedPanel;
unsafeWindow.hideFixedPanel = hideFixedPanel;
unsafeWindow.updateFixedPanelPrice = updateFixedPanelPrice;
unsafeWindow.updateFixedPanelProfit = updateFixedPanelProfit;
unsafeWindow.showFixedPanelCalculating = showFixedPanelCalculating;
