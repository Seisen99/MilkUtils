# 🧪 Test Instructions for MWI Profit Calculator v3.0.0

## 📋 Pre-Testing Checklist

Before testing, ensure:
- [x] All files are created
- [x] Script is installed in Tampermonkey
- [x] You're on https://www.milkywayidle.com or test site

## 🎯 Test Scenarios

### Test 1: Basic Gathering (Processing Tea)
**Action**: Milk a Rainbow Cow (Unicow) with Processing Tea active

**Expected Results**:
- ✅ Tooltip shows: "🍵 Processing Tea: X Rainbow Cheese/h (+Y coins/h)"
- ✅ Processing items should be ~15% of total items/h
- ✅ Profit includes processing bonus

**How to verify**:
1. Hover over Rainbow Milk in inventory
2. Check tooltip for Processing Tea section
3. Verify the processed item name is "Rainbow Cheese"

---

### Test 2: Rare Drops (with Meteorite Cache)
**Action**: Hover over Rainbow Milk (while milking Unicow)

**Expected Results**:
- ✅ Shows "💎 Rare Drops: +X coins/h"
- ✅ Lists:
  - Butter of Proficiency (0.001%)
  - Medium Meteorite Cache (0.040%)
- ✅ Cache value is calculated (not 0)

**How to verify**:
1. Check console for any errors
2. Verify meteorite cache has a value (should be ~200k-500k depending on market)
3. Compare with edible_tools script if available

---

### Test 3: Essence Drops
**Action**: Hover over any gathered resource (Milk, Log, Cotton, etc.)

**Expected Results**:
- ✅ Shows "✨ Essences: +X coins/h"
- ✅ Lists the specific essence (e.g., "Milking Essence: X/h")
- ✅ Drop rate shown if >= 1%

**How to verify**:
1. Check that essence value is reasonable (~9% drop rate for gathering)
2. Verify essence price matches market

---

### Test 4: Production (No Processing Tea)
**Action**: Hover over a crafted item (Cheese, Lumber, Fabric, etc.)

**Expected Results**:
- ✅ NO Processing Tea section (production doesn't benefit)
- ✅ Shows input materials table
- ✅ Shows essences if applicable
- ✅ Profit calculation is correct

---

### Test 5: UI/Tooltip Improvements
**Action**: Hover over any item

**Expected Results**:
- ✅ NO long disclaimer text about "Ask price in, Bid price out..."
- ✅ Clean sections with emojis (🍵, ✨, 💎, 💰)
- ✅ Buff summary is small and collapsed at bottom
- ✅ Profit is bold and easy to read

---

## 🐛 Common Issues to Check

### Issue: "getItemValue is not defined"
**Cause**: `chest-values.js` not loaded before `profit.js`
**Fix**: Check @require order in main script

### Issue: "getProcessedItem is not defined"
**Cause**: `processing-mapping.js` not loaded before `profit.js`
**Fix**: Check @require order in main script

### Issue: Meteorite cache value is 0
**Cause**: `openableLootDropMap` not available or chest HRID incorrect
**Solution**: 
```javascript
// In browser console:
const initData = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("initClientData")));
console.log(initData.openableLootDropMap);
```

### Issue: Processing Tea not showing
**Possible causes**:
1. No Processing Tea active (check `teaBuffs.upgradedProduct`)
2. Item is production, not gathering
3. Item not in PROCESSING_MAP (check mapping)

---

## 🔍 Debug Commands

### Check if modules loaded:
```javascript
console.log("Processing Map:", typeof PROCESSING_MAP);
console.log("Chest Values:", typeof getChestValue);
console.log("Item Value:", typeof getItemValue);
```

### Check Processing Tea status:
```javascript
const actionHrid = "/actions/milking/unicow";
const teaBuffs = getTeaBuffsByActionHrid(actionHrid);
console.log("Processing Tea active:", teaBuffs.upgradedProduct > 0);
```

### Check chest value calculation:
```javascript
const marketJson = await fetchMarketJSON();
const value = getChestValue("/items/medium_meteorite_cache", marketJson);
console.log("Medium Meteorite Cache value:", value);
```

### Inspect rare drops for an action:
```javascript
const actionDetailMap = getActionDetailMap();
const unicowAction = actionDetailMap["/actions/milking/unicow"];
console.log("Rare drops:", unicowAction.rareDropTable);
console.log("Essences:", unicowAction.essenceDropTable);
```

---

## ✅ Success Criteria

The update is successful if:
1. ✅ All tooltips display without errors
2. ✅ Processing Tea section appears for gathering with tea active
3. ✅ Rare drops show with correct percentages
4. ✅ Meteorite caches have non-zero values
5. ✅ Essences are calculated and displayed
6. ✅ Total profit is higher than v2.0.1 (due to new bonuses)
7. ✅ UI is cleaner and easier to read

---

## 📊 Expected Profit Comparison

**Example: Rainbow Milk (Unicow) with all bonuses**

v2.0.1 Profit: ~X coins/hour
- Items only
- Tea quantity bonus
- No essences
- No rare drops
- No processing tea

v3.0.0 Profit: ~(X + Y) coins/hour
- Items
- Tea quantity bonus
- **+ Essences (~9% drop rate)**
- **+ Rare drops (butter + cache)**
- **+ Processing Tea (15% cheese bonus)**

**Expected increase**: 10-20% higher profit per hour

---

## 🚀 Next Steps After Testing

If all tests pass:
1. Commit changes to Git
2. Push to GitHub
3. Update version in GreasyFork/UserScript repository
4. Notify users of new features

If tests fail:
1. Note which test failed
2. Check console for errors
3. Use debug commands above
4. Report issue with details
