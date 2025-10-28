# MWI Profit Calculator - Technical Explanation

## Overview
This userscript calculates production profit for items in MilkyWayIdle by intercepting game data and fetching market prices.

---

## Data Sources

### 1. **WebSocket Interception**
The script hooks into the game's WebSocket communication to capture player data:

```javascript
// Intercepts MessageEvent.prototype.data
MessageEvent.prototype.data getter → hooks all WebSocket messages
```

**Captured data:**
- `init_character_data` → Player skills, items, houses, equipped drinks
- `init_client_data` → Game definitions (actions, items, abilities)

### 2. **localStorage (Compressed)**
Static game data stored by the game itself:
```javascript
localStorage.getItem("initClientData") → LZ-String compressed JSON
```
Decompressed using: `LZString.decompressFromUTF16()`

### 3. **Market API**
Price data fetched from official API:
```
https://www.milkywayidle.com/game_data/marketplace.json
```
Cached for 1 hour in localStorage.

---

## Key Data Structures

### Player Data (from WebSocket)
```javascript
initData_characterSkills = [
    { skillHrid: "/skills/foraging", level: 50, exp: 123456 }
]

initData_characterItems = [
    { itemHrid: "/items/celestial_brush", 
      itemLocationHrid: "/item_locations/tool_foraging",
      enhancementLevel: 5 }
]

initData_characterHouseRoomMap = {
    "/house_rooms/garden": { level: 10 }
}

initData_actionTypeDrinkSlotsMap = {
    "/action_types/foraging": [
        { itemHrid: "/items/gathering_tea", slot: 0 }
    ]
}
```

### Game Definitions (from localStorage/WebSocket)
```javascript
initData_actionDetailMap = {
    "/actions/foraging/blueberry": {
        type: "/action_types/foraging",
        baseTimeCost: 3000000000, // nanoseconds
        inputItems: [...],
        outputItems: [...],
        levelRequirement: { skillHrid: "/skills/foraging", level: 1 }
    }
}

initData_itemDetailMap = {
    "/items/gathering_tea": {
        consumableDetail: {
            buffs: [
                { typeHrid: "/buff_types/gathering", flatBoost: 0.05 }
            ]
        }
    }
}
```

### Market Data (from API)
```javascript
marketData = {
    "/items/blueberry": {
        0: { a: 72, b: 70 }  // ask (sell) / bid (buy) prices
    }
}
```

---

## Buff Calculations

### 1. **Level Buff (Overleveling)**
```
levelEffBuff = currentLevel - requiredLevel
```
Example: Level 50 doing level 1 action → +49% efficiency

### 2. **House Buff**
```
houseEffBuff = house.level × 1.5
```
Mapping:
```javascript
"/action_types/foraging" → "/house_rooms/garden"
"/action_types/milking" → "/house_rooms/dairy_barn"
```

### 3. **Tool Speed Buff**
```
toolBuff = baseSpeed × (1 + enhanceBonus/100)
enhanceBonus = itemEnhanceLevelToBuffBonusMap[enhancementLevel]
```
Example: +5 tool = 12% bonus

### 4. **Equipment Efficiency Buff**
```javascript
propertyName = actionType + "Efficiency"
// e.g., "foragingEfficiency"
```

### 5. **Tea Buffs**
Extracted from `consumableDetail.buffs`:
- `/buff_types/gathering` → quantity (extra items)
- `/buff_types/gourmet` → quantity
- `/buff_types/efficiency` → efficiency
- `/buff_types/artisan` → lessResource (reduces material cost)
- `/buff_types/{skill}_level` → efficiency (skill-specific tea)

---

## Profit Formula

### Production Actions (with materials)
```
itemPerHour = (3600 / actualTimePerActionSec) × droprate × (1 + totalEfficiency/100)
extraFreeItems = itemPerHour × teaQuantityBuff/100
materialCost = sum(inputItems × askPrice) × (1 - teaLessResource/100)

profitPerHour = itemPerHour × (bidAfterTax - materialCostPerItem)
              + extraFreeItems × bidAfterTax
              - drinksConsumedPerHour
```

### Gathering Actions (no materials)
```
profitPerHour = itemPerHour × bidAfterTax
              + extraFreeItems × bidAfterTax
              - drinksConsumedPerHour
```

Where:
- `bidAfterTax = bid × 0.98` (2% market tax)
- `totalEfficiency = levelBuff + houseBuff + teaBuff + equipmentBuff`
- `drinksConsumedPerHour = sum(drinkPrices) × 12` (5min cooldown)

---

## Tooltip Display Flow

1. **MutationObserver** detects tooltip appearance
2. Extract item name → find `itemHrid`
3. Find associated action → `getActionHridFromItemName()`
4. Fetch market prices → `fetchMarketJSON()`
5. Calculate all buffs → `getTeaBuffs()`, `getHouseBuff()`, etc.
6. Calculate profit → `calculateProfit()`
7. Inject HTML into tooltip with:
   - Material costs table
   - Buff breakdown
   - Production statistics
   - Profit per action/hour/day

---

## Dependencies

### External Libraries
- **lz-string** (1.5.0): Decompress game data from localStorage
- **Tampermonkey GM API**: `GM.xmlHttpRequest`, `GM_setValue`

### Required Permissions
- `@grant GM.xmlHttpRequest` - Fetch market API
- `@grant GM_getValue/GM_setValue` - Storage
- `@match https://www.milkywayidle.com/*` - Game website

---

## Hardcoded Mappings

These are static relationships defined in the script:

```javascript
// Action type → House room
actionHridToHouseNamesMap

// Action type → Tool buff property name
actionHridToToolsSpeedBuffNamesMap

// Enhancement level → Bonus percentage
itemEnhanceLevelToBuffBonusMap
```

---

## Performance Optimizations

1. **Market API Cache**: 1 hour localStorage cache
2. **Static Data**: Game definitions loaded once on page load
3. **Lazy Calculation**: Profit only calculated when tooltip appears
4. **Async/Await**: Non-blocking API calls

---

## Limitations & Notes

### Not Included in Calculations:
- **Processing Tea** (upgradedProduct buff) - transforms items, doesn't affect profit
- **Wisdom Tea** (extraExp) - only affects XP
- **Rare drops** - unpredictable
- **Community buffs** - external to player data
- **Pouch consumables** - additional food buffs

### Assumptions:
- Uses **Ask prices** for material costs (buying from market)
- Uses **Bid prices** for output (selling to market)
- Drinks consumed at maximum rate (12 per hour)
- 2% tax applied only on sales, not purchases

---

## Error Handling

```javascript
// Missing data → returns 0 or null
if (!initData_characterSkills) return 0;

// Failed API → graceful degradation
if (!marketJson) return null;

// Item not found → skip calculation
if (!itemHrid) return;
```

---

## Development Notes

### Adding New Buff Types:
Edit `getTeaBuffsByActionHrid()` to recognize new `buff.typeHrid` values.

### Adding New Actions:
Update mapping tables if new action types or house rooms are added.

### Debugging:
All intercepted WebSocket messages are logged to console:
```javascript
console.log("Received init_character_data:", obj);
```
