# 🐄 Mooket Resources - Documentation complète

Documentation et ressources pour utiliser l'API Mooket dans vos scripts Milky Way Idle.

## 📚 Fichiers disponibles

### 1. 📘 **MOOKET_API_DOCS.md** (6.2KB)
Documentation complète de l'API Mooket avec :
- ✅ REST API endpoints (GET/POST)
- ✅ WebSocket API temps réel
- ✅ Exemples de code
- ✅ Best practices
- ✅ Gestion du cache

**→ Consultez ce fichier pour intégrer l'API Mooket dans vos scripts**

---

### 2. 📦 **mwi_items_list.json** (42KB)
Liste de **894 items** au format JSON simple :
```json
{ "/items/holy_milk": "Holy Milk" }
```

**Utilisation :**
```javascript
const items = require('./mwi_items_list.json');
```

---

### 3. 🔧 **mwi_items_list.js** (43KB)
Liste des items avec **fonctions helper** :
- `getItemName(hrid)` - HRID → Nom
- `getItemHrid(name)` - Nom → HRID  
- `searchItems(query)` - Recherche

**Utilisation :**
```javascript
const { getItemName } = require('./mwi_items_list.js');
console.log(getItemName('/items/holy_milk')); // "Holy Milk"
```

---

### 4. 📖 **MWI_ITEMS_README.md** (3.7KB)
Guide d'utilisation détaillé de `mwi_items_list.js` avec :
- Exemples d'utilisation
- Cas d'usage (validation, autocomplete, etc.)
- Catégories d'items
- Statistiques

---

## 🚀 Quick Start

### Utiliser l'API Mooket

```javascript
// 1. Récupérer tous les prix actuels
const market = await fetch('https://mooket.qi-e.top/market/api.json')
  .then(r => r.json());

console.log(market.marketData['/items/holy_milk']['0']);
// { a: 470, b: 460 }

// 2. Récupérer l'historique 7 jours
const history = await fetch(
  'https://mooket.qi-e.top/market/item/history?' + 
  new URLSearchParams({
    name: '/items/polar_bear_shoes',
    level: 10,
    time: 604800
  })
).then(r => r.json());

console.log(`${history.bids.length} points de données`);
```

### Utiliser la liste d'items

```javascript
// Dans un UserScript
// @require file:///path/to/mwi_items_list.js

// Rechercher des items
const cheeseItems = searchItems('cheese');
console.log(`${cheeseItems.length} items fromage trouvés`);

// Valider un HRID
if (getItemName('/items/unknown')) {
  console.log('Item valide');
}
```

---

## 🎯 Cas d'usage

### 1. Calculateur de profit
```javascript
// Combiner API prix + liste items
const itemHrid = getItemHrid('Holy Milk');
const market = await fetch('https://mooket.qi-e.top/market/api.json')
  .then(r => r.json());

const price = market.marketData[itemHrid]['0'];
console.log(`${getItemName(itemHrid)}: ${price.a} / ${price.b}`);
```

### 2. Historique de prix avec graphiques
```javascript
async function plotItemHistory(itemName, days = 7) {
  const hrid = getItemHrid(itemName);
  const history = await fetch(
    `https://mooket.qi-e.top/market/item/history?` + 
    `name=${hrid}&level=0&time=${days * 86400}`
  ).then(r => r.json());
  
  // Tracer avec Chart.js
  const data = history.bids.map(p => ({
    x: new Date(p.time * 1000),
    y: p.price
  }));
  
  return data;
}

plotItemHistory('Holy Milk', 7);
```

### 3. Autocomplete d'items
```javascript
function itemAutocomplete(input) {
  const results = searchItems(input).slice(0, 10);
  return results.map(item => ({
    label: item.name,
    value: item.hrid
  }));
}

// Input: "bear"
// Output: [
//   { label: "Polar Bear Shoes", value: "/items/polar_bear_shoes" },
//   { label: "Black Bear Shoes", value: "/items/black_bear_shoes" },
//   ...
// ]
```

---

## 📊 Statistiques

### API Mooket
- **Base URL:** https://mooket.qi-e.top
- **Items trackés:** 832+
- **Enhancement levels:** 0-20
- **Update:** Temps réel (crowdsourcé)
- **WebSocket:** ws://mooket.qi-e.top/market/ws

### Liste d'items
- **Total items:** 894
- **Format:** HRID ↔ English Name
- **Source:** mooket.js v20251026.1.1

---

## 🔗 Liens utiles

- [Mooket Script (Greasyfork)](https://greasyfork.org/scripts/530316)
- [Milky Way Idle](https://www.milkywayidle.com/)
- [API Documentation](./MOOKET_API_DOCS.md)
- [Items Guide](./MWI_ITEMS_README.md)

---

## ⚠️ Notes importantes

- L'API Mooket est **crowdsourcée** (données de la communauté)
- Pas d'authentification requise
- Cache recommandé : **10 minutes** pour `/market/api.json`
- WebSocket pour updates temps réel
- Mode Ironman : upload seulement, pas de WebSocket

---

**Dernière mise à jour:** 2025-10-28
