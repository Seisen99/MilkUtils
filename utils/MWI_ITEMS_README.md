# 📦 MWI Items List

Liste complète des **894 items** de Milky Way Idle extraite du script mooket.js.

## 📁 Fichiers disponibles

### 1. `mwi_items_list.json` (42KB)
Format JSON simple : `{ "hrid": "name" }`

```json
{
  "/items/coin": "Coin",
  "/items/holy_milk": "Holy Milk",
  "/items/polar_bear_shoes": "Polar Bear Shoes"
}
```

**Utilisation:**
```javascript
const items = require('./mwi_items_list.json');
console.log(items['/items/coin']); // "Coin"
```

---

### 2. `mwi_items_list.js` (43KB)
Format JavaScript avec fonctions helper

**Utilisation:**

```javascript
// Import
const { MWI_ITEMS, getItemName, getItemHrid, searchItems } = require('./mwi_items_list.js');

// 1. Obtenir le nom d'un item
getItemName('/items/holy_milk');
// → "Holy Milk"

// 2. Obtenir le HRID d'un item
getItemHrid('Polar Bear Shoes');
// → "/items/polar_bear_shoes"

// 3. Rechercher des items
searchItems('bear');
// → [
//     { hrid: "/items/polar_bear_shoes", name: "Polar Bear Shoes" },
//     { hrid: "/items/black_bear_shoes", name: "Black Bear Shoes" },
//     { hrid: "/items/grizzly_bear_shoes", name: "Grizzly Bear Shoes" }
//   ]

// 4. Accès direct au dictionnaire
MWI_ITEMS['/items/coin'];
// → "Coin"
```

**Dans un UserScript Tampermonkey:**
```javascript
// ==UserScript==
// @name         Mon Script MWI
// @require      https://raw.githubusercontent.com/.../mwi_items_list.js
// ==/UserScript==

// Les fonctions sont disponibles globalement
console.log(getItemName('/items/holy_milk')); // "Holy Milk"
console.log(searchItems('cheese').length);     // Nombre d'items fromage
```

---

## 📋 Catégories d'items

### Currency & Tokens
- Coin, Task Token, Cowbell
- Chimerical/Sinister/Enchanted/Pirate Tokens

### Chests & Caches
- Treasure Chests (Small/Medium/Large)
- Meteorite Caches
- Dungeon Chests (Chimerical, Sinister, etc.)

### Equipment
- Weapons (Swords, Spears, Bows, Staffs, etc.)
- Armor (Helmets, Plate Bodies, Tunics, etc.)
- Accessories (Rings, Necklaces, Charms, etc.)
- Tools (Brushes, Hatchets, Spatulas, etc.)

### Consumables
- Food (Donuts, Cakes, Yogurt, etc.)
- Drinks (Tea, Coffee)
- Combat Abilities

### Resources
- Milk & Cheese (Normal → Holy)
- Wood (Log → Lumber)
- Leather & Fabric
- Fruits & Vegetables
- Essences & Gems

### Materials
- Monster Drops (Fangs, Claws, Scales, etc.)
- Refinement Shards
- Catalysts

---

## 🔧 Cas d'usage

### Validation d'item
```javascript
function isValidItem(hrid) {
  return hrid in MWI_ITEMS;
}

isValidItem('/items/holy_milk');    // true
isValidItem('/items/fake_item');     // false
```

### Autocomplete
```javascript
function autocomplete(input) {
  return searchItems(input).slice(0, 10); // Top 10 résultats
}

autocomplete('mil');
// → [
//     { hrid: "/items/milk", name: "Milk" },
//     { hrid: "/items/holy_milk", name: "Holy Milk" },
//     { hrid: "/items/milking_tea", name: "Milking Tea" },
//     ...
//   ]
```

### Affichage formaté
```javascript
function displayItem(hrid) {
  const name = getItemName(hrid);
  return name ? `${name} (${hrid})` : 'Unknown Item';
}

displayItem('/items/polar_bear_shoes');
// → "Polar Bear Shoes (/items/polar_bear_shoes)"
```

---

## 📊 Statistiques

- **Total items:** 894
- **Format:** HRID → English Name
- **Source:** mooket.js v20251026.1.1
- **Dernière mise à jour:** 2025-10-28

---

## ⚠️ Notes

- Les items peuvent être améliorés (enhancement levels 0-20)
- Le HRID ne change pas selon le niveau d'amélioration
- Utilisez l'API mooket pour les prix : voir `MOOKET_API_DOCS.md`

---

## 🔗 Liens utiles

- [Mooket Script](https://greasyfork.org/scripts/530316)
- [Mooket API Documentation](./MOOKET_API_DOCS.md)
- [Milky Way Idle](https://www.milkywayidle.com/)
