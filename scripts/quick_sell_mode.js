// ==UserScript==
// @name         MWI Quick Sell Mode
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Toggle quick sell mode - click any inventory item to instantly sell at bid price
// @author       Assistant
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=milkywayidle.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        COLORS: {
            primary: '#2196F3',
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            active: '#4CAF50',
            inactive: '#666',
            bid: 'var(--color-market-buy)'
        }
    };

    // State
    let isQuickSellMode = false;
    let isProcessingSale = false;
    let clickHandler = null;

    // Language strings
    const LANG = {
        quickSellOn: '⚡ Quick Sell: ON',
        quickSellOff: '💰 Quick Sell: OFF',
        clickToToggle: 'Click to toggle Quick Sell Mode',
        quickSellActive: 'Quick Sell Mode Active - Click items to sell at bid price',
        quickSellInactive: 'Quick Sell Mode Inactive',
        processing: 'Processing sale...',
        sold: 'Sold {name} x{quantity} for {price} coins',
        failed: 'Failed to sell {name}: {error}',
        noBuyOrders: 'No buy orders available',
        noMarketData: 'Could not fetch market data',
        insufficientDemand: 'Not enough demand (need {need}, available {available})'
    };

    // Wait for page load
    function waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
    }

    // Sleep helper
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Create toggle button
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'quick-sell-toggle';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 25px;
            background-color: ${isQuickSellMode ? CONFIG.COLORS.active : CONFIG.COLORS.inactive};
            color: white;
            border: none;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        button.innerHTML = isQuickSellMode ? LANG.quickSellOn : LANG.quickSellOff;
        button.title = LANG.clickToToggle;
        
        button.addEventListener('click', toggleQuickSellMode);
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        });
        
        document.body.appendChild(button);
        return button;
    }

    // Create status indicator
    function createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'quick-sell-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            border-radius: 20px;
            background-color: ${isQuickSellMode ? CONFIG.COLORS.active : CONFIG.COLORS.inactive};
            color: white;
            font-size: 13px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            opacity: ${isQuickSellMode ? '1' : '0'};
            pointer-events: none;
        `;
        indicator.textContent = isQuickSellMode ? LANG.quickSellActive : LANG.quickSellInactive;
        
        document.body.appendChild(indicator);
        return indicator;
    }

    // Create price display above toggle button
    function createPriceDisplay() {
        const priceDisplay = document.createElement('div');
        priceDisplay.id = 'quick-sell-price';
        priceDisplay.style.cssText = `
            position: fixed;
            bottom: 75px;
            right: 20px;
            padding: 10px 16px;
            border-radius: 20px;
            background-color: rgba(0, 0, 0, 0.85);
            color: #4CAF50;
            font-size: 13px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            opacity: 0;
            pointer-events: none;
            text-align: center;
            min-width: 150px;
        `;
        priceDisplay.innerHTML = '<div style="font-size: 10px; color: #888; margin-bottom: 2px;">Hover item for price</div>';
        
        document.body.appendChild(priceDisplay);
        return priceDisplay;
    }

    // Update UI elements
    function updateUI() {
        const button = document.getElementById('quick-sell-toggle');
        const indicator = document.getElementById('quick-sell-indicator');
        const priceDisplay = document.getElementById('quick-sell-price');
        
        if (button) {
            button.style.backgroundColor = isQuickSellMode ? CONFIG.COLORS.active : CONFIG.COLORS.inactive;
            button.innerHTML = isQuickSellMode ? LANG.quickSellOn : LANG.quickSellOff;
        }
        
        if (indicator) {
            indicator.style.backgroundColor = isQuickSellMode ? CONFIG.COLORS.active : CONFIG.COLORS.inactive;
            indicator.textContent = isQuickSellMode ? LANG.quickSellActive : LANG.quickSellInactive;
            indicator.style.opacity = isQuickSellMode ? '1' : '0';
        }
        
        if (priceDisplay) {
            priceDisplay.style.opacity = isQuickSellMode ? '0' : '0';
            if (!isQuickSellMode) {
                priceDisplay.innerHTML = '<div style="font-size: 10px; color: #888; margin-bottom: 2px;">Hover item for price</div>';
            }
        }
        
        // Update inventory item visual feedback
        updateInventoryItemsVisual();
    }
    
    // Update price display
    function updatePriceDisplay(itemName, unitPrice, quantity, totalPrice, warning = null) {
        const priceDisplay = document.getElementById('quick-sell-price');
        if (!priceDisplay || !isQuickSellMode) return;
        
        let html = `<div style="font-size: 11px; color: #aaa; margin-bottom: 3px;">${itemName}</div>`;
        html += `<div style="font-size: 14px; color: #4CAF50;">💰 ${formatNumber(totalPrice)}</div>`;
        html += `<div style="font-size: 10px; color: #888; margin-top: 2px;">${formatNumber(unitPrice)} × ${quantity}</div>`;
        
        if (warning) {
            html += `<div style="font-size: 10px; color: #ff9800; margin-top: 3px;">⚠️ ${warning}</div>`;
        }
        
        priceDisplay.innerHTML = html;
        priceDisplay.style.opacity = '1';
    }
    
    // Hide price display
    function hidePriceDisplay() {
        const priceDisplay = document.getElementById('quick-sell-price');
        if (!priceDisplay) return;
        
        priceDisplay.style.opacity = '0';
        setTimeout(() => {
            if (priceDisplay.style.opacity === '0') {
                priceDisplay.innerHTML = '<div style="font-size: 10px; color: #888; margin-bottom: 2px;">Hover item for price</div>';
            }
        }, 300);
    }

    // Update inventory items visual
    function updateInventoryItemsVisual() {
        const inventoryItems = document.querySelectorAll('.Item_itemContainer__x7kH1');
        
        inventoryItems.forEach(itemContainer => {
            if (isQuickSellMode) {
                // Add hover effect
                itemContainer.style.transition = 'all 0.2s ease';
                itemContainer.style.cursor = 'pointer';
                
                // Add custom hover class
                itemContainer.classList.add('quick-sell-hover');
                
                // Create style if doesn't exist
                if (!document.getElementById('quick-sell-styles')) {
                    const style = document.createElement('style');
                    style.id = 'quick-sell-styles';
                    style.textContent = `
                        .quick-sell-hover:hover {
                            transform: scale(1.05);
                            filter: brightness(1.2);
                            box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
                        }
                        .quick-sell-processing {
                            animation: pulse 0.5s infinite;
                        }
                        @keyframes pulse {
                            0% { opacity: 0.6; }
                            50% { opacity: 1; }
                            100% { opacity: 0.6; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Add hover listener for price tooltip
                setupPriceTooltip(itemContainer);
            } else {
                // Remove hover effect
                itemContainer.style.cursor = '';
                itemContainer.classList.remove('quick-sell-hover');
                
                // Remove price tooltip listeners
                removePriceTooltip(itemContainer);
            }
        });
    }

    // Toggle quick sell mode
    function toggleQuickSellMode() {
        isQuickSellMode = !isQuickSellMode;
        updateUI();
        
        if (isQuickSellMode) {
            setupClickHandler();
            showToast(LANG.quickSellActive, 'success');
        } else {
            removeClickHandler();
            showToast(LANG.quickSellInactive, 'info');
        }
    }

    // Setup click handler
    function setupClickHandler() {
        clickHandler = async (e) => {
            // Check if clicked on inventory item
            const itemContainer = e.target.closest('.Item_itemContainer__x7kH1');
            if (!itemContainer || isProcessingSale) return;
            
            // Prevent default behavior
            e.preventDefault();
            e.stopPropagation();
            
            // Get item info
            const itemData = getItemDataFromElement(itemContainer);
            if (!itemData) {
                showToast('Could not get item data', 'error');
                return;
            }
            
            // Visual feedback
            itemContainer.classList.add('quick-sell-processing');
            
            try {
                await processSale(itemData, itemContainer);
            } finally {
                itemContainer.classList.remove('quick-sell-processing');
            }
        };
        
        // Add click handler with capture to intercept before game handlers
        document.addEventListener('click', clickHandler, true);
    }

    // Remove click handler
    function removeClickHandler() {
        if (clickHandler) {
            document.removeEventListener('click', clickHandler, true);
            clickHandler = null;
        }
    }

    // Get item data from element
    function getItemDataFromElement(itemContainer) {
        try {
            const itemElement = itemContainer.querySelector('.Item_item__2De2O');
            if (!itemElement) return null;
            
            // Get item icon and extract ID
            const svgElement = itemElement.querySelector('svg[aria-label]');
            const useElement = svgElement?.querySelector('use');
            const href = useElement?.getAttribute('href');
            
            if (!href) return null;
            
            // Extract item ID
            const itemId = href.split('#')[1];
            if (!itemId) return null;
            
            // Get item name
            const itemName = svgElement.getAttribute('aria-label') || formatItemName(itemId);
            
            // Get item count
            const countElement = itemElement.querySelector('.Item_count__1HVvv');
            const countText = countElement?.textContent || '0';
            const count = parseItemCount(countText);
            
            // Check for enhancement level
            // Note: For ability books and tools, the level shown is the requirement level, not enhancement
            // Only equipment items can actually be enhanced
            const levelElement = itemElement.querySelector('.script_itemLevel');
            const isAbilityBook = itemId.includes('ability_book') || itemName.toLowerCase().includes('ability');
            const isTool = itemId.includes('tool') || ['hammer', 'needle', 'chisel', 'saw', 'shears', 'cooking_pot'].some(t => itemId.includes(t));
            
            // Only use enhancement level for equipment that can actually be enhanced
            let enhancementLevel = 0;
            if (levelElement && !isAbilityBook && !isTool) {
                // Check if this is truly an enhancement level (usually shown differently than requirement level)
                // For now, assume any level element on non-ability/non-tool items is enhancement
                enhancementLevel = parseInt(levelElement.textContent) || 0;
            }
            
            // Log item detection for debugging
            console.log('Detected item:', {
                id: itemId,
                name: itemName,
                count: count,
                enhancementLevel: enhancementLevel,
                hasLevelElement: !!levelElement,
                isAbilityBook: isAbilityBook,
                isTool: isTool
            });
            
            if (count === 0) return null;
            
            return {
                id: itemId,
                hrid: `/items/${itemId}`,
                name: itemName,
                count: count,
                enhancementLevel: enhancementLevel
            };
        } catch (error) {
            console.error('Error getting item data:', error);
            return null;
        }
    }

    // Parse item count
    function parseItemCount(countText) {
        if (!countText) return 0;
        
        const text = countText.trim().toUpperCase();
        if (text.endsWith('K')) {
            return parseFloat(text.slice(0, -1)) * 1000;
        } else if (text.endsWith('M')) {
            return parseFloat(text.slice(0, -1)) * 1000000;
        } else if (text.endsWith('B')) {
            return parseFloat(text.slice(0, -1)) * 1000000000;
        }
        
        return parseInt(text) || 0;
    }

    // Format item name
    function formatItemName(itemId) {
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Process sale
    async function processSale(itemData, itemContainer) {
        if (isProcessingSale) return;
        
        isProcessingSale = true;
        let processingToast = null;
        
        try {
            // Show processing toast
            processingToast = showToast(LANG.processing, 'info', 0);
            
            // Get market data
            const marketData = await getMarketData(itemData.hrid);
            if (!marketData) {
                throw new Error(LANG.noMarketData);
            }
            
            // Log market data for debugging
            console.log('Market data for', itemData.name, ':', marketData);
            if (marketData.orderBooks) {
                console.log('OrderBooks structure:', {
                    isArray: Array.isArray(marketData.orderBooks),
                    length: marketData.orderBooks.length,
                    keys: Object.keys(marketData.orderBooks),
                    firstElement: marketData.orderBooks[0]
                });
            }
            
            // Calculate bid price
            const priceData = calculateBidPrice(marketData, itemData.enhancementLevel, itemData.count);
            if (!priceData.price || priceData.price <= 0) {
                throw new Error(LANG.noBuyOrders);
            }
            
            // Check demand
            if (priceData.availableQuantity < itemData.count) {
                throw new Error(
                    LANG.insufficientDemand
                        .replace('{need}', itemData.count)
                        .replace('{available}', priceData.availableQuantity)
                );
            }
            
            // Execute sale
            const quantity = Math.min(itemData.count, priceData.availableQuantity);
            await executeSale(itemData.hrid, itemData.enhancementLevel, quantity, priceData.price);
            
            // Success
            showToast(
                LANG.sold
                    .replace('{name}', itemData.name)
                    .replace('{quantity}', quantity)
                    .replace('{price}', priceData.price * quantity),
                'success'
            );
            
            // Flash success animation
            itemContainer.style.animation = 'none';
            setTimeout(() => {
                itemContainer.style.animation = 'flash-success 0.5s ease';
            }, 10);
            
        } catch (error) {
            showToast(
                LANG.failed
                    .replace('{name}', itemData.name)
                    .replace('{error}', error.message),
                'error'
            );
        } finally {
            // Always remove processing toast
            if (processingToast) {
                processingToast.remove();
            }
            isProcessingSale = false;
        }
    }

    // Get market data
    async function getMarketData(itemHrid) {
        try {
            if (!window.PGE?.core) {
                throw new Error('PGE API not ready');
            }
            
            const responsePromise = window.PGE.waitForMessage(
                'market_item_order_books_updated',
                8000,
                (responseData) => responseData.marketItemOrderBooks?.itemHrid === itemHrid
            );
            
            window.PGE.core.handleGetMarketItemOrderBooks(itemHrid);
            
            const response = await responsePromise;
            return response.marketItemOrderBooks;
        } catch (error) {
            console.error('Error getting market data:', error);
            return null;
        }
    }

    // Calculate bid price
    function calculateBidPrice(marketData, enhancementLevel, quantity) {
        try {
            let orderBook = null;
            
            // Try different ways to access orderBook based on item type
            if (marketData.orderBooks) {
                // First try with enhancement level
                orderBook = marketData.orderBooks[enhancementLevel];
                
                // If not found, try other strategies
                if (!orderBook) {
                    // For arrays, if there's only one element, use it regardless of enhancement level
                    if (Array.isArray(marketData.orderBooks) && marketData.orderBooks.length === 1) {
                        orderBook = marketData.orderBooks[0];
                        console.log('Using single orderBook entry for enhanced item');
                    }
                    // Try index 0 for any item
                    else if (marketData.orderBooks[0]) {
                        orderBook = marketData.orderBooks[0];
                        console.log('Using orderBook at index 0');
                    }
                    // Try string "0"
                    else if (marketData.orderBooks["0"]) {
                        orderBook = marketData.orderBooks["0"];
                        console.log('Using orderBook at string index "0"');
                    }
                    // Check if orderBooks itself has bid structure
                    else if (typeof marketData.orderBooks.bids !== 'undefined') {
                        orderBook = marketData.orderBooks;
                        console.log('Using orderBooks directly');
                    }
                }
            }
            
            // Also check if orderBook is directly in marketData (for some item types)
            if (!orderBook && marketData.bids) {
                orderBook = marketData;
                console.log('Using marketData directly');
            }
            
            if (!orderBook) {
                console.log('No orderBook found for enhancement level', enhancementLevel, 'in', marketData);
                return { price: 0, availableQuantity: 0 };
            }
            
            const bids = orderBook.bids;
            if (!bids?.length) {
                console.log('No bids found in orderBook:', orderBook);
                return { price: 0, availableQuantity: 0 };
            }
            
            let availableQuantity = 0;
            let lowestPrice = bids[0].price;
            
            for (const bid of bids) {
                availableQuantity += bid.quantity;
                lowestPrice = bid.price;
                if (availableQuantity >= quantity) break;
            }
            
            console.log('Calculated price:', lowestPrice, 'available quantity:', availableQuantity);
            return { price: lowestPrice, availableQuantity };
        } catch (error) {
            console.error('Error calculating price:', error);
            return { price: 0, availableQuantity: 0 };
        }
    }

    // Execute sale
    async function executeSale(itemHrid, enhancementLevel, quantity, price) {
        if (!window.PGE?.core) {
            throw new Error('PGE API not ready');
        }
        
        const successPromise = window.PGE.waitForMessage('info', 15000,
            (responseData) => responseData.message === 'infoNotification.sellOrderCompleted'
        );
        
        const errorPromise = window.PGE.waitForMessage('error', 15000);
        
        window.PGE.core.handlePostMarketOrder(
            true,           // isSellOrder
            itemHrid,       // itemHrid
            enhancementLevel, // enhancementLevel
            quantity,       // quantity
            price,          // price
            true            // isInstant (bid sell)
        );
        
        await Promise.race([
            successPromise,
            errorPromise.then(errorData => 
                Promise.reject(new Error(errorData.message || 'Sale failed'))
            )
        ]);
    }

    // Setup price tooltip on hover
    function setupPriceTooltip(itemContainer) {
        // Remove existing listeners if any
        removePriceTooltip(itemContainer);
        
        const mouseEnterHandler = async (e) => {
            // Don't show if processing
            if (isProcessingSale) return;
            
            const itemData = getItemDataFromElement(itemContainer);
            if (!itemData) return;
            
            // Show loading in price display
            const priceDisplay = document.getElementById('quick-sell-price');
            if (priceDisplay) {
                priceDisplay.innerHTML = '<div style="font-size: 11px; color: #aaa;">Loading...</div>';
                priceDisplay.style.opacity = '1';
            }
            
            // Get price
            try {
                const marketData = await getMarketData(itemData.hrid);
                if (marketData) {
                    const priceData = calculateBidPrice(marketData, itemData.enhancementLevel, itemData.count);
                    if (priceData.price > 0) {
                        const quantity = Math.min(itemData.count, priceData.availableQuantity);
                        const totalPrice = priceData.price * quantity;
                        
                        let warning = null;
                        if (priceData.availableQuantity < itemData.count) {
                            warning = `Only ${quantity}/${itemData.count} available`;
                        }
                        
                        updatePriceDisplay(itemData.name, priceData.price, quantity, totalPrice, warning);
                    } else {
                        if (priceDisplay) {
                            priceDisplay.innerHTML = '<div style="font-size: 11px; color: #f44336;">❌ No buy orders</div>';
                            priceDisplay.style.opacity = '1';
                        }
                    }
                } else {
                    if (priceDisplay) {
                        priceDisplay.innerHTML = '<div style="font-size: 11px; color: #f44336;">❌ No market data</div>';
                        priceDisplay.style.opacity = '1';
                    }
                }
            } catch (error) {
                console.error('Error loading price:', error);
                if (priceDisplay) {
                    priceDisplay.innerHTML = '<div style="font-size: 11px; color: #f44336;">❌ Error</div>';
                    priceDisplay.style.opacity = '1';
                }
            }
        };
        
        const mouseLeaveHandler = () => {
            hidePriceDisplay();
        };
        
        itemContainer._quickSellMouseEnter = mouseEnterHandler;
        itemContainer._quickSellMouseLeave = mouseLeaveHandler;
        
        itemContainer.addEventListener('mouseenter', mouseEnterHandler);
        itemContainer.addEventListener('mouseleave', mouseLeaveHandler);
    }
    
    // Remove price tooltip
    function removePriceTooltip(itemContainer) {
        if (itemContainer._quickSellMouseEnter) {
            itemContainer.removeEventListener('mouseenter', itemContainer._quickSellMouseEnter);
            delete itemContainer._quickSellMouseEnter;
        }
        if (itemContainer._quickSellMouseLeave) {
            itemContainer.removeEventListener('mouseleave', itemContainer._quickSellMouseLeave);
            delete itemContainer._quickSellMouseLeave;
        }
    }
    
    // Format number with commas
    function formatNumber(num) {
        return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Show toast notification
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background-color: ${CONFIG.COLORS[type] || CONFIG.COLORS.primary};
            color: white;
            border-radius: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            font-size: 14px;
            font-weight: 500;
            animation: slideUp 0.3s ease;
            max-width: 400px;
            text-align: center;
        `;
        toast.textContent = message;
        
        // Add animation
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideUp {
                    from {
                        transform: translateX(-50%) translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(-50%) translateY(20px);
                        opacity: 0;
                    }
                }
                @keyframes flash-success {
                    0%, 100% { background-color: transparent; }
                    50% { background-color: rgba(76, 175, 80, 0.3); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    }

    // Observer for inventory changes
    function setupInventoryObserver() {
        const observer = new MutationObserver(() => {
            if (isQuickSellMode) {
                updateInventoryItemsVisual();
            }
        });
        
        // Observe for inventory changes
        const inventoryContainer = document.querySelector('.Inventory_items__6SXv0');
        if (inventoryContainer) {
            observer.observe(inventoryContainer, {
                childList: true,
                subtree: true
            });
        }
        
        // Also observe for page navigation
        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
    }

    // Initialize
    async function init() {
        await waitForPageLoad();
        await sleep(5000); // Wait for game to load
        
        // Create UI elements
        createToggleButton();
        createStatusIndicator();
        createPriceDisplay();
        
        // Setup observer
        setupInventoryObserver();
        
        console.log('Quick Sell Mode initialized');
    }

    // Start
    init();

})();