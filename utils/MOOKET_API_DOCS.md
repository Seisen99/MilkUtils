# 📘 Mooket API - Documentation Technique

**Base URL:** `https://mooket.qi-e.top`  
**Auteur:** IOMisaka  
**Version:** Crowdsourcée temps réel  
**Script source:** [Greasyfork #530316](https://greasyfork.org/scripts/530316)

---

## 🌐 REST API Endpoints

### 1. **GET** `/market/api.json`
**Description:** Snapshot complet des prix actuels du marché

**Response:**
```json
{
  "timestamp": 1761689535,
  "marketData": {
    "/items/{item_hrid}": {
      "{enhancement_level}": {
        "a": 10500000,  // Ask (prix vente - lowest seller)
        "b": 10000000   // Bid (prix achat - highest buyer)
      }
    }
  }
}
```

**Caractéristiques:**
- ✅ **832+ items** trackés
- ✅ **Levels 0-20** pour items améliorables
- ✅ Valeur `-1` = pas d'ordre actif
- ⏱️ Mise à jour: **temps réel** (crowdsourcé)
- 💾 Cache recommandé: **10 minutes**

---

### 2. **GET** `/market/item/history`
**Description:** Historique des prix pour un item spécifique

**Paramètres:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Item HRID | `/items/holy_milk` |
| `level` | int | Enhancement level (0-20) | `0` |
| `time` | int | Période en secondes | `86400` (1 jour) |

**Périodes communes:**
- `86400` = 1 jour
- `604800` = 7 jours  
- `2592000` = 30 jours

**Response:**
```json
{
  "bids": [
    {
      "time": 1761600628,  // Unix timestamp
      "price": 460
    }
    // ~150 points de données
  ],
  "asks": [
    {
      "time": 1761600628,
      "price": 470
    }
  ]
}
```

**Caractéristiques:**
- 📊 ~**150 points** de données par période
- 🕐 Timestamps Unix (secondes)
- ⚠️ Retourne `{"bids":[],"asks":[]}` si pas de données

**Exemple:**
```bash
curl "https://mooket.qi-e.top/market/item/history?name=/items/polar_bear_shoes&level=10&time=604800"
```

---

### 3. **POST** `/market/upload/order`
**Description:** Upload des données de marché (contribution communautaire)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "type": "market_item_order_books_updated",
  "time": 1761689535,
  "marketItemOrderBooks": {
    "itemHrid": "/items/holy_milk",
    "orderBooks": [
      {
        "bids": [{"price": 460, ...}],
        "asks": [{"price": 470, ...}]
      }
    ]
  }
}
```

**Note:** Normalement utilisé automatiquement par le script mooket.js

---

## 🔌 WebSocket API

### Connection
```
wss://mooket.qi-e.top/market/ws
```

**Caractéristiques:**
- ♻️ Auto-reconnect intégré
- 💓 Heartbeat: message `"ping"` (ignoré)
- ⏱️ Reconnect interval: **10 secondes**

---

### Messages WebSocket

#### 📤 **Client → Server**

##### 1. Subscribe à des items
```json
{
  "type": "SubscribeItems",
  "items": ["/items/holy_milk", "/items/polar_bear_shoes"]
}
```

##### 2. Requête prix spécifique
```json
{
  "type": "GetItemPrice",
  "name": "/items/holy_milk",
  "level": 0
}
```

##### 3. Upload données marché
```json
{
  "type": "market_item_order_books_updated",
  "time": 1761689535,
  "marketItemOrderBooks": { ... }
}
```

---

#### 📥 **Server → Client**

##### 1. Réponse prix
```json
{
  "type": "ItemPrice",
  "name": "/items/holy_milk",
  "level": 0,
  "bid": 460,
  "ask": 470,
  "time": 1761689535,
  "ttl": 300
}
```

##### 2. Mise à jour marché
```json
{
  "type": "market_item_order_books_updated",
  "time": 1761689535,
  "marketItemOrderBooks": { ... }
}
```

##### 3. Heartbeat
```
"ping"
```

---

## 📋 Format des Items

### Item HRID
```
/items/{item_name}
```

**Exemples:**
- `/items/holy_milk`
- `/items/polar_bear_shoes`
- `/items/vampiric_bow`

### Enhancement Levels
- **0-20** pour équipements améliorables
- **0** uniquement pour consommables/ressources

---

## 💡 Best Practices

### 1. Caching
```javascript
// Cache API JSON pendant 10 minutes
const CACHE_TTL = 600000; // 10 min en ms

async function getCachedMarket() {
  const cached = localStorage.getItem('mooket_cache');
  const timestamp = localStorage.getItem('mooket_cache_time');
  
  if (cached && Date.now() - timestamp < CACHE_TTL) {
    return JSON.parse(cached);
  }
  
  const data = await fetch('https://mooket.qi-e.top/market/api.json')
    .then(r => r.json());
  
  localStorage.setItem('mooket_cache', JSON.stringify(data));
  localStorage.setItem('mooket_cache_time', Date.now());
  
  return data;
}
```

### 2. WebSocket avec reconnect
```javascript
class MooketWS {
  constructor() {
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket('wss://mooket.qi-e.top/market/ws');
    
    this.ws.onmessage = (e) => {
      if (e.data === 'ping') return;
      const msg = JSON.parse(e.data);
      this.handleMessage(msg);
    };
    
    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 10000);
    };
  }
  
  subscribe(items) {
    this.ws.send(JSON.stringify({
      type: 'SubscribeItems',
      items: items
    }));
  }
}
```

### 3. Gestion des valeurs -1
```javascript
function getPrice(priceData) {
  return {
    ask: priceData.a === -1 ? null : priceData.a,
    bid: priceData.b === -1 ? null : priceData.b,
    hasAsks: priceData.a !== -1,
    hasBids: priceData.b !== -1
  };
}
```

---

## ⚠️ Limitations & Notes

- 🔒 Pas d'authentification requise
- 📊 Données crowdsourcées (fiabilité dépend de la communauté)
- 🚫 Pas de rate limiting documenté (soyez raisonnable)
- 🐄 Mode Ironman: upload mais pas de WebSocket
- ⏰ Timestamps en **secondes Unix** (pas millisecondes)
- 🔢 Prix en **integers** (pas de décimales)

---

## 🎯 Exemple d'utilisation complète

```javascript
// 1. Récupérer tous les prix actuels
const market = await fetch('https://mooket.qi-e.top/market/api.json')
  .then(r => r.json());

const holyMilk = market.marketData['/items/holy_milk']['0'];
console.log(`Holy Milk: ${holyMilk.a}/${holyMilk.b}`);

// 2. Récupérer l'historique 7 jours
const history = await fetch(
  'https://mooket.qi-e.top/market/item/history?' + 
  new URLSearchParams({
    name: '/items/polar_bear_shoes',
    level: 10,
    time: 604800
  })
).then(r => r.json());

// 3. Tracer un graphique
const chartData = history.bids.map(p => ({
  x: new Date(p.time * 1000),
  y: p.price
}));
```

---

**Dernière mise à jour:** 2025-10-28  
**Status:** ✅ Opérationnel
