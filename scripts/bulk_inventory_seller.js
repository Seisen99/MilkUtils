// ==UserScript==
// @name         MWI Bulk Inventory Seller
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Bulk sell items from inventory at bid price (instant sell) or list at ask price
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
        DELAY_BETWEEN_SALES: 3000, // Delay between each sale in milliseconds (increased to 3s)
        MAX_RETRIES: 1, // Number of retries on spam protection
        SPAM_RETRY_DELAY: 10000, // Wait 10 seconds before retrying on spam protection
        COLORS: {
            primary: '#2196F3',
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3',
            bid: 'var(--color-market-buy)',
            ask: 'var(--color-market-sell)'
        }
    };

    // Language strings
    const LANG = {
        title: 'Bulk Inventory Seller',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        sellAtBid: 'Sell at Bid (Instant)',
        listAtAsk: 'List at Ask',
        close: 'Close',
        noItems: 'No sellable items in inventory',
        processing: 'Processing...',
        success: 'Success',
        failed: 'Failed',
        completed: 'Completed',
        cancelled: 'Cancelled',
        confirmSell: 'Confirm sell {count} items?',
        confirmList: 'Confirm list {count} items?',
        sellProgress: 'Selling item {current} of {total}',
        listProgress: 'Listing item {current} of {total}',
        itemSold: 'Sold {name} x{quantity} for {price}',
        itemListed: 'Listed {name} x{quantity} at {price}',
        itemFailed: 'Failed to sell {name}: {error}',
        noMarketData: 'No market data available',
        noBuyOrders: 'No buy orders available',
        noSellOrders: 'No sell orders available',
        insufficientDemand: 'Insufficient demand (need {need}, available {available})',
        filterPlaceholder: 'Filter items...',
        selectedCount: '{count} items selected',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All'
    };

    // Cache for sprite URLs
    let spriteCache = null;
    
    // Get sprite URL from game
    function getSpriteUrl() {
        if (spriteCache) return spriteCache;
        
        // Try to find sprite URL from existing SVG elements
        const svgUse = document.querySelector('svg use');
        if (svgUse) {
            const href = svgUse.getAttribute('href');
            if (href && href.includes('items_sprite')) {
                spriteCache = href.split('#')[0];
                return spriteCache;
            }
        }
        
        // Fallback to default path
        spriteCache = '/static/media/items_sprite.svg';
        return spriteCache;
    }

    // State management
    let isProcessing = false;
    let cancelRequested = false;
    let selectedItems = new Set();
    let inventoryItems = [];
    // let categorizedItems = {}; // Not needed with grid layout
    // let expandedCategories = new Set(); // Not needed with grid layout

    // Wait for page to load
    function waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
    }

    // Create floating button
    function createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'bulk-seller-btn';
        button.innerHTML = '💰';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: ${CONFIG.COLORS.primary};
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            z-index: 99998;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        `;
        
        button.addEventListener('click', openBulkSeller);
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(button);
    }

    // Get inventory items with categories from DOM
    function getInventoryItems() {
        try {
            const items = [];
            const inventoryContainer = document.querySelector('.Inventory_items__6SXv0');
            
            if (!inventoryContainer) {
                console.error('Inventory container not found');
                return [];
            }
            
            // Get all category sections
            const categorySections = inventoryContainer.querySelectorAll('.Inventory_itemGrid__20YAH');
            
            categorySections.forEach(section => {
                // Get category name
                const categoryLabel = section.querySelector('.Inventory_label__XEOAx .Inventory_categoryButton__35s1x');
                const categoryName = categoryLabel?.textContent || 'Other';
                
                // Get all items in this category
                const itemContainers = section.querySelectorAll('.Item_itemContainer__x7kH1');
                
                itemContainers.forEach(itemContainer => {
                    const itemElement = itemContainer.querySelector('.Item_item__2De2O');
                    if (!itemElement) return;
                    
                    // Get item icon and extract ID
                    const svgElement = itemElement.querySelector('svg[aria-label]');
                    const useElement = svgElement?.querySelector('use');
                    const href = useElement?.getAttribute('href');
                    
                    if (!href) return;
                    
                    // Extract item ID from href (#coin, #task_token, etc.)
                    const itemId = href.split('#')[1];
                    if (!itemId) return;
                    
                    // Get item name from aria-label
                    const itemName = svgElement.getAttribute('aria-label') || formatItemName(itemId);
                    
                    // Get item count
                    const countElement = itemElement.querySelector('.Item_count__1HVvv');
                    const countText = countElement?.textContent || '0';
                    const count = parseItemCount(countText);
                    
                    // Check for enhancement level
                    const levelElement = itemElement.querySelector('.script_itemLevel');
                    const enhancementLevel = levelElement ? parseInt(levelElement.textContent) || 0 : 0;
                    
                    // Skip if no count
                    if (count === 0) return;
                    
                    items.push({
                        id: itemId,
                        hrid: `/items/${itemId}`,
                        name: itemName,
                        count: count,
                        enhancementLevel: enhancementLevel,
                        category: categoryName,
                        svgElement: svgElement.cloneNode(true) // Store cloned SVG
                    });
                });
            });
            
            return items;
        } catch (error) {
            console.error('Error getting inventory items:', error);
            return [];
        }
    }
    
    // Parse item count (handles K, M, B suffixes)
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

    // Format item name from ID
    function formatItemName(itemId) {
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Categorize function removed - using grid layout

    // Create modal UI
    function createModal() {
        // Create backdrop first
        const backdrop = document.createElement('div');
        backdrop.id = 'bulk-seller-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 99999;
            backdrop-filter: blur(3px);
        `;
        
        const modal = document.createElement('div');
        modal.id = 'bulk-seller-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 0;
            z-index: 100000;
            width: 800px;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            animation: modalFadeIn 0.3s ease-out;
            overflow: hidden;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 12px;
            padding: 24px;
            max-width: 900px;
            max-height: 85vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            color: white;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            z-index: 100001;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">💰</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${LANG.title}</h2>
            </div>
            <button id="close-modal-btn" style="
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(244, 67, 54, 0.3)'; this.style.borderColor='rgba(244, 67, 54, 0.5)'"
               onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.2)'">✕</button>
        `;
        
        // Controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
            align-items: center;
        `;
        const buttonStyle = `
            padding: 8px 16px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.2s ease;
        `;
        
        controls.innerHTML = `
            <button id="select-all-btn" style="${buttonStyle}"
                    onmouseover="this.style.background='linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'; this.style.borderColor='rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'; this.style.borderColor='rgba(255,255,255,0.2)'">
                ${LANG.selectAll}
            </button>
            <button id="deselect-all-btn" style="${buttonStyle}"
                    onmouseover="this.style.background='linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'; this.style.borderColor='rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'; this.style.borderColor='rgba(255,255,255,0.2)'">
                ${LANG.deselectAll}
            </button>

            <input id="filter-input" type="text" placeholder="${LANG.filterPlaceholder}" style="
                flex: 1;
                padding: 8px 12px;
                background-color: rgba(0,0,0,0.4);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                min-width: 200px;
                font-size: 13px;
                transition: all 0.2s ease;
            " onfocus="this.style.borderColor='rgba(76, 175, 80, 0.6)'; this.style.outline='none'"
               onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
            <span id="selected-count" style="
                color: #4CAF50;
                font-size: 14px;
                font-weight: 600;
                background-color: rgba(76, 175, 80, 0.1);
                padding: 6px 12px;
                border-radius: 20px;
                border: 1px solid rgba(76, 175, 80, 0.3);
            ">${LANG.selectedCount.replace('{count}', '0')}</span>
        `;
        
        // Items grid
        const itemsList = document.createElement('div');
        itemsList.id = 'items-list';
        itemsList.style.cssText = `
            flex: 1;
            overflow-y: auto;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 20px;
            max-height: 500px;
            background-color: rgba(0,0,0,0.3);
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.2) transparent;
        `;
        
        // Add scrollbar styling
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = `
            #items-list::-webkit-scrollbar {
                width: 8px;
            }
            #items-list::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
            }
            #items-list::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.2);
                border-radius: 4px;
            }
            #items-list::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.3);
            }
        `;
        document.head.appendChild(scrollbarStyle);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
        `;
        actions.innerHTML = `
            <button id="sell-bid-btn" style="
                padding: 12px 24px;
                background-color: ${CONFIG.COLORS.bid};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">${LANG.sellAtBid}</button>
            <button id="list-ask-btn" style="
                padding: 12px 24px;
                background-color: ${CONFIG.COLORS.ask};
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">${LANG.listAtAsk}</button>
        `;
        
        // Progress area
        const progressArea = document.createElement('div');
        progressArea.id = 'progress-area';
        progressArea.style.cssText = `
            display: none;
            margin-top: 20px;
            padding: 15px;
            background-color: #333;
            border-radius: 4px;
        `;
        
        // Add modal fade in animation
        if (!document.getElementById('modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -45%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(header);
        container.appendChild(controls);
        container.appendChild(itemsList);
        container.appendChild(actions);
        container.appendChild(progressArea);
        modal.appendChild(container);
        backdrop.appendChild(modal);
        
        return backdrop;
    }

    // Render items list as grid
    function renderItemsList() {
        const itemsList = document.getElementById('items-list');
        const filterInput = document.getElementById('filter-input');
        const filter = filterInput.value.toLowerCase();
        
        itemsList.innerHTML = '';
        
        if (inventoryItems.length === 0) {
            itemsList.innerHTML = `<p style="text-align: center; color: #aaa;">${LANG.noItems}</p>`;
            return;
        }
        
        // Filter items
        const filteredItems = inventoryItems.filter(item => 
            filter === '' || 
            item.name.toLowerCase().includes(filter) || 
            item.id.toLowerCase().includes(filter)
        );
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
            gap: 8px;
            padding: 8px;
        `;
        
        // Render all filtered items as grid cells
        filteredItems.forEach(item => {
            const itemCell = document.createElement('div');
            const itemKey = `${item.id}-${item.enhancementLevel}`;
            const isSelected = selectedItems.has(itemKey);
            
            itemCell.style.cssText = `
                position: relative;
                width: 64px;
                height: 64px;
                background-color: ${isSelected ? 'rgba(76, 175, 80, 0.3)' : '#1a1a1a'};
                border: 2px solid ${isSelected ? '#4CAF50' : '#333'};
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            `;
            
            // Create wrapper for the SVG
            const svgWrapper = document.createElement('div');
            svgWrapper.style.cssText = `
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Clone and append the SVG
            if (item.svgElement) {
                const svgClone = item.svgElement.cloneNode(true);
                svgClone.style.width = '100%';
                svgClone.style.height = '100%';
                svgWrapper.appendChild(svgClone);
            }
            itemCell.appendChild(svgWrapper);
            
            // Add enhancement level badge if present
            if (item.enhancementLevel > 0) {
                const badge = document.createElement('span');
                badge.style.cssText = `
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    background-color: #4CAF50;
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    padding: 1px 4px;
                    border-radius: 3px;
                    line-height: 1;
                    z-index: 2;
                `;
                badge.textContent = `+${item.enhancementLevel}`;
                itemCell.appendChild(badge);
            }
            
            // Add count badge
            const countBadge = document.createElement('span');
            countBadge.style.cssText = `
                position: absolute;
                top: 2px;
                right: 2px;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                font-size: 11px;
                font-weight: bold;
                padding: 2px 4px;
                border-radius: 3px;
                line-height: 1;
                z-index: 2;
            `;
            countBadge.textContent = `x${item.count}`;
            itemCell.appendChild(countBadge);
            
            // Create tooltip div (hidden by default)
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                margin-bottom: 5px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            `;
            tooltip.textContent = `${item.name} (${item.category})`;
            itemCell.appendChild(tooltip);
            
            // Click handler
            itemCell.addEventListener('click', () => {
                if (selectedItems.has(itemKey)) {
                    selectedItems.delete(itemKey);
                    itemCell.style.backgroundColor = '#1a1a1a';
                    itemCell.style.borderColor = '#333';
                } else {
                    selectedItems.add(itemKey);
                    itemCell.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
                    itemCell.style.borderColor = '#4CAF50';
                }
                updateSelectedCount();
            });
            
            // Hover effects
            itemCell.addEventListener('mouseenter', () => {
                if (!selectedItems.has(itemKey)) {
                    itemCell.style.backgroundColor = '#2a2a2a';
                    itemCell.style.borderColor = '#555';
                }
                tooltip.style.opacity = '1';
            });
            
            itemCell.addEventListener('mouseleave', () => {
                if (!selectedItems.has(itemKey)) {
                    itemCell.style.backgroundColor = '#1a1a1a';
                    itemCell.style.borderColor = '#333';
                }
                tooltip.style.opacity = '0';
            });
            
            gridContainer.appendChild(itemCell);
        });
        
        itemsList.appendChild(gridContainer);
    }

    // Update selected count
    function updateSelectedCount() {
        const countSpan = document.getElementById('selected-count');
        countSpan.textContent = LANG.selectedCount.replace('{count}', selectedItems.size);
    }

    // Open bulk seller modal
    function openBulkSeller() {
        // Check if inventory is visible
        const inventoryContainer = document.querySelector('.Inventory_items__6SXv0');
        if (!inventoryContainer) {
            showToast('Please open your inventory first', 'warning');
            return;
        }
        
        // Get fresh inventory data
        inventoryItems = getInventoryItems();
        
        if (inventoryItems.length === 0) {
            showToast('No items found in inventory', 'warning');
            return;
        }
        
        selectedItems.clear();
        // expandedCategories.clear(); // Not needed
        
        // Categories removed - using grid layout instead
        
        // Create and show modal with backdrop
        const backdrop = createModal();
        document.body.appendChild(backdrop);
        
        // Render items
        renderItemsList();
        
        // Bind events
        document.getElementById('close-modal-btn').addEventListener('click', closeBulkSeller);
        document.getElementById('select-all-btn').addEventListener('click', selectAll);
        document.getElementById('deselect-all-btn').addEventListener('click', deselectAll);
        // Expand/collapse buttons removed
        document.getElementById('filter-input').addEventListener('input', renderItemsList);
        document.getElementById('sell-bid-btn').addEventListener('click', () => processSales('bid'));
        document.getElementById('list-ask-btn').addEventListener('click', () => processSales('ask'));
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeBulkSeller();
            }
        });
    }

    // Close modal
    function closeBulkSeller() {
        const backdrop = document.getElementById('bulk-seller-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        cancelRequested = false;
        isProcessing = false;
    }

    // Select all items
    function selectAll() {
        inventoryItems.forEach(item => {
            selectedItems.add(`${item.id}-${item.enhancementLevel}`);
        });
        renderItemsList();
        updateSelectedCount();
    }

    // Deselect all items
    function deselectAll() {
        selectedItems.clear();
        renderItemsList();
        updateSelectedCount();
    }

    // Expand/collapse removed - using grid layout

    // Process sales
    async function processSales(mode) {
        if (selectedItems.size === 0) {
            showToast('No items selected', 'warning');
            return;
        }
        
        if (isProcessing) {
            showToast('Already processing', 'warning');
            return;
        }
        
        // Confirm action
        const confirmMsg = mode === 'bid' ? 
            LANG.confirmSell.replace('{count}', selectedItems.size) :
            LANG.confirmList.replace('{count}', selectedItems.size);
            
        if (!confirm(confirmMsg)) {
            return;
        }
        
        isProcessing = true;
        cancelRequested = false;
        
        // Show progress area
        const progressArea = document.getElementById('progress-area');
        progressArea.style.display = 'block';
        progressArea.innerHTML = `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span id="progress-text">${LANG.processing}</span>
                    <button id="cancel-btn" style="
                        padding: 6px 12px;
                        background-color: ${CONFIG.COLORS.error};
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
            <div id="progress-log" style="
                max-height: 200px;
                overflow-y: auto;
                background-color: #1a1a1a;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
                font-family: monospace;
            "></div>
        `;
        
        document.getElementById('cancel-btn').addEventListener('click', () => {
            cancelRequested = true;
        });
        
        // Disable action buttons
        document.getElementById('sell-bid-btn').disabled = true;
        document.getElementById('list-ask-btn').disabled = true;
        
        try {
            // Process selected items
            const itemsToProcess = [];
            selectedItems.forEach(itemKey => {
                const [id, level] = itemKey.split('-');
                const item = inventoryItems.find(i => 
                    i.id === id && i.enhancementLevel === parseInt(level)
                );
                if (item) {
                    itemsToProcess.push(item);
                }
            });
            
            let successCount = 0;
            let failCount = 0;
            
            for (let i = 0; i < itemsToProcess.length; i++) {
                if (cancelRequested) {
                    addProgressLog(`${LANG.cancelled}`, 'warning');
                    break;
                }
                
                const item = itemsToProcess[i];
                const progressMsg = mode === 'bid' ?
                    LANG.sellProgress.replace('{current}', i + 1).replace('{total}', itemsToProcess.length) :
                    LANG.listProgress.replace('{current}', i + 1).replace('{total}', itemsToProcess.length);
                    
                updateProgressText(progressMsg);
                
                try {
                    let result = await processSingleItem(item, mode);
                    
                    // Check for spam protection error and retry
                    if (!result.success && result.error && result.error.includes('requestSpamProtection')) {
                        addProgressLog(
                            `⚠️ Spam protection détecté pour ${item.name}, attente de 10 secondes...`,
                            'warning'
                        );
                        await sleep(CONFIG.SPAM_RETRY_DELAY);
                        
                        // Retry once
                        addProgressLog(`🔄 Nouvel essai pour ${item.name}...`, 'info');
                        result = await processSingleItem(item, mode);
                    }
                    
                    if (result.success) {
                        successCount++;
                        const msg = mode === 'bid' ?
                            LANG.itemSold.replace('{name}', item.name)
                                .replace('{quantity}', result.quantity)
                                .replace('{price}', result.price) :
                            LANG.itemListed.replace('{name}', item.name)
                                .replace('{quantity}', result.quantity)
                                .replace('{price}', result.price);
                        addProgressLog(msg, 'success');
                    } else {
                        failCount++;
                        addProgressLog(
                            LANG.itemFailed.replace('{name}', item.name).replace('{error}', result.error),
                            'error'
                        );
                    }
                } catch (error) {
                    failCount++;
                    addProgressLog(
                        LANG.itemFailed.replace('{name}', item.name).replace('{error}', error.message),
                        'error'
                    );
                }
                
                // Delay between items
                if (i < itemsToProcess.length - 1 && !cancelRequested) {
                    await sleep(CONFIG.DELAY_BETWEEN_SALES);
                }
            }
            
            // Show completion message
            const completionMsg = `${LANG.completed}: ${successCount} ${LANG.success}, ${failCount} ${LANG.failed}`;
            updateProgressText(completionMsg);
            showToast(completionMsg, successCount > 0 ? 'success' : 'error');
            
            // Refresh inventory
            inventoryItems = getInventoryItems();
            selectedItems.clear();
            renderItemsList();
            
        } catch (error) {
            console.error('Error processing sales:', error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            isProcessing = false;
            document.getElementById('sell-bid-btn').disabled = false;
            document.getElementById('list-ask-btn').disabled = false;
        }
    }

    // Process single item
    async function processSingleItem(item, mode) {
        try {
            // Get market data
            const marketData = await getMarketData(item.hrid);
            if (!marketData) {
                return { success: false, error: LANG.noMarketData };
            }
            
            // Calculate price and check availability
            const priceData = calculatePrice(marketData, item.enhancementLevel, item.count, mode);
            if (!priceData.price || priceData.price <= 0) {
                return { success: false, error: mode === 'bid' ? LANG.noBuyOrders : LANG.noSellOrders };
            }
            
            // For bid mode, check if there's enough demand
            if (mode === 'bid' && priceData.availableQuantity < item.count) {
                return { 
                    success: false, 
                    error: LANG.insufficientDemand
                        .replace('{need}', item.count)
                        .replace('{available}', priceData.availableQuantity)
                };
            }
            
            // Execute the sale
            const quantity = mode === 'bid' ? 
                Math.min(item.count, priceData.availableQuantity) : 
                item.count;
                
            await executeSale(item.hrid, item.enhancementLevel, quantity, priceData.price, mode);
            
            return {
                success: true,
                quantity: quantity,
                price: priceData.price
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get market data
    async function getMarketData(itemHrid) {
        try {
            // Wait for PGE API to be ready
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

    // Calculate price
    function calculatePrice(marketData, enhancementLevel, quantity, mode) {
        try {
            const orderBook = marketData.orderBooks?.[enhancementLevel];
            if (!orderBook) {
                return { price: 0, availableQuantity: 0 };
            }
            
            if (mode === 'bid') {
                // Selling to buy orders (instant sell)
                const bids = orderBook.bids;
                if (!bids?.length) {
                    return { price: 0, availableQuantity: 0 };
                }
                
                let availableQuantity = 0;
                let lowestPrice = bids[0].price;
                
                for (const bid of bids) {
                    availableQuantity += bid.quantity;
                    lowestPrice = bid.price;
                    if (availableQuantity >= quantity) break;
                }
                
                return { price: lowestPrice, availableQuantity };
            } else {
                // Listing at ask price
                const asks = orderBook.asks;
                if (!asks?.length) {
                    // If no asks, use highest bid + 1
                    const bids = orderBook.bids;
                    const highestBid = bids?.[0]?.price || 0;
                    return { price: highestBid + 1, availableQuantity: quantity };
                }
                
                // List at lowest ask price
                return { price: asks[0].price, availableQuantity: quantity };
            }
        } catch (error) {
            console.error('Error calculating price:', error);
            return { price: 0, availableQuantity: 0 };
        }
    }

    // Execute sale
    async function executeSale(itemHrid, enhancementLevel, quantity, price, mode) {
        if (!window.PGE?.core) {
            throw new Error('PGE API not ready');
        }
        
        const isInstantSell = mode === 'bid';
        
        const successMessage = isInstantSell ? 
            'infoNotification.sellOrderCompleted' : 
            'infoNotification.sellListingProgress';
            
        const successPromise = window.PGE.waitForMessage('info', 15000,
            (responseData) => responseData.message === successMessage
        );
        
        const errorPromise = window.PGE.waitForMessage('error', 15000);
        
        window.PGE.core.handlePostMarketOrder(
            true,           // isSellOrder
            itemHrid,       // itemHrid
            enhancementLevel, // enhancementLevel
            quantity,       // quantity
            price,          // price
            isInstantSell   // isInstant
        );
        
        await Promise.race([
            successPromise,
            errorPromise.then(errorData => 
                Promise.reject(new Error(errorData.message || 'Sale failed'))
            )
        ]);
    }

    // Helper functions
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateProgressText(text) {
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = text;
        }
    }

    function addProgressLog(message, type = 'info') {
        const progressLog = document.getElementById('progress-log');
        if (!progressLog) return;
        
        const colors = {
            info: '#aaa',
            success: CONFIG.COLORS.success,
            error: CONFIG.COLORS.error,
            warning: CONFIG.COLORS.warning
        };
        
        const logEntry = document.createElement('div');
        logEntry.style.color = colors[type] || colors.info;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        progressLog.appendChild(logEntry);
        progressLog.scrollTop = progressLog.scrollHeight;
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background-color: ${CONFIG.COLORS[type] || CONFIG.COLORS.info};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 100002;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(-50%) translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                toast.remove();
                style.remove();
            }, 300);
        }, 3000);
    }

    // Initialize
    async function init() {
        await waitForPageLoad();
        
        // Wait a bit for the game to load
        await sleep(5000);
        
        // Create floating button
        createFloatingButton();
        
        console.log('Bulk Inventory Seller initialized');
    }

    // Start initialization
    init();

})();