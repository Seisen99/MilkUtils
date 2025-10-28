# MWI Profit Calculator - Changelog

## Version 3.0.0 (2025-10-28)

### 🎉 Major Features Added

#### ✨ Essence Drops Calculation
- Automatically calculates value of essence drops per hour
- Displays essence drops in tooltip with drop rates
- Integrated into profit calculations

#### 💎 Rare Drops Calculation
- Calculates expected value of rare drops per hour
- Handles both tradeable items and non-tradeable chests
- **Smart Chest Valuation**: Uses `openableLootDropMap` to calculate chest values based on their contents
- Displays rare drops with individual drop rates (%) in tooltip
- Includes items like:
  - Butter of Proficiency (0.001%)
  - Thread of Expertise
  - Meteorite Caches (calculated from their drop tables)

#### 🍵 Processing Tea Bonus
- Calculates 15% chance to get processed items directly
- Works for gathering actions (Milking, Woodcutting, Foraging)
- Mappings included:
  - Milk → Cheese (all tiers)
  - Log → Lumber (all wood types)
  - Cotton → Cotton Fabric
  - Flax → Linen Fabric
  - Bamboo Branch → Bamboo Fabric
  - Cocoon → Silk Fabric
  - Radiant Fiber → Radiant Fabric
- Shows number of processed items per hour and value bonus

### 🎨 UI Improvements

#### Simplified Tooltip
- Removed lengthy explanation text
- Cleaner, more organized layout
- Color-coded sections:
  - 🍵 **Gold**: Processing Tea
  - ✨ **Purple**: Essences
  - 💎 **Red**: Rare Drops
  - 💰 **Green**: Profit Summary
  
#### New Information Display
- Production rate (actions/h → items/h)
- Processing Tea items per hour
- Essence drops with rates
- Rare drops with individual percentages
- Collapsed buff summary (less visual clutter)

### 🔧 Technical Changes

#### New Modules
- `processing-mapping.js`: Maps raw resources to processed items
- `chest-values.js`: Calculates chest values from drop tables

#### Enhanced Profit Calculation
- `profit.js` now includes:
  - `essenceValuePerHour`
  - `essenceDetails[]`
  - `rareDropsValuePerHour`
  - `rareDropDetails[]`
  - `processingTeaBonusPerHour`
  - `processingTeaItemsPerHour`
  - `processedItemHrid`
  - `hasProcessingTea`

#### Data Sources
- Uses `actionDetailMap.essenceDropTable` for essences
- Uses `actionDetailMap.rareDropTable` for rare drops
- Uses `initClientData.openableLootDropMap` for chest values
- Recursive chest valuation (chests can contain other chests)

### 📊 Accuracy Improvements
- **100% accurate** rare drop calculations (uses game data directly)
- **Dynamic chest pricing** (no hardcoded values)
- **2% market tax** applied to all calculations
- **Complete profit formula** now includes all bonuses

---

## Version 2.0.1 (Previous)
- Refactored modular architecture
- WebSocket data interception
- Basic profit calculations
- Tooltip display system
