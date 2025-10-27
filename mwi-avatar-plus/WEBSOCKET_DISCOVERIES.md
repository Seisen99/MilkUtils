# WebSocket Discoveries - Animation System

## 📡 Découvertes WebSocket

### 1. Structure des messages `battle_updated`

Le WebSocket envoie des messages avec la structure suivante :

```javascript
{
    type: "battle_updated",
    pMap: {
        "0": {
            cHP: 1000,           // HP actuel
            cMP: 50,             // Mana actuel (après cast)
            dmgCounter: 5,       // Compteur de dégâts
            isAutoAtk: true,     // État auto-attack
            abilityHrid: "/abilities/fireball"  // ⭐ Ability castée (découverte clé !)
        }
    },
    mMap: {
        "0": {
            cHP: 800,
            cMP: 100,
            dmgCounter: 3
        }
    }
}
```

### 2. Détection du cast avec `abilityHrid`

**Découverte majeure :** Le champ `abilityHrid` contient l'ability castée !

- Format : `/abilities/fireball`, `/abilities/firestorm`, `/abilities/precision`
- Présent pour **toutes les abilities** (attaques, buffs, heals, auras)
- Permet de détecter le type d'action sans scanner le DOM !

### 3. Détection du cast avec `cMP` (mana)

```javascript
// Détection par consommation de mana
if (playerData.cMP < playersMP[userIndex]) {
    castPlayer = userIndex; // Ce joueur a casté
}
```

**MAIS :** Les buffs très rapides (0.3s) arrivent parfois avec `castPlayer = -1`

---

## 🔥 Système DoT (Damage over Time)

### Abilities DoT détectées

```javascript
const DOT_ABILITIES = [
    '/abilities/maim',      // Bleed DoT (melee)
    '/abilities/firestorm'  // Burn DoT (fire magic)
];
```

### Mécanique des DoT (Firestorm exemple)

```
Tour 1: Cast Firestorm → 100% dégâts instantanés (castPlayer = "1")
Tour 2: Tick DoT #1 → 50% dégâts (castPlayer = -1) ← Animation DoT
Tour 3: Tick DoT #2 → 50% dégâts (castPlayer = -1) ← Animation DoT
```

**Solution implémentée :**
- Tracker `playersActiveDoTs[]` avec `ticksRemaining: 2`
- Détection : `castPlayer === -1` + `hasDotActive` + `!isAutoAttack`
- Consommer un tick à chaque dégât DoT détecté

### Code de détection DoT

```javascript
// Au cast d'un DoT
if (DOT_ABILITIES.includes(playerData.abilityHrid)) {
    playersActiveDoTs[userIndex] = { 
        ticksRemaining: 2, 
        ability: playerData.abilityHrid 
    };
}

// À la détection de dégâts
const hasDotActive = playersActiveDoTs[userIndex]?.ticksRemaining > 0;
const isDot = (castPlayer === -1) && hasDotActive && !isAutoAttack;

if (isDot) {
    createDotLine(userIndex, mIndex, hpDiff); // Animation DoT
    playersActiveDoTs[userIndex].ticksRemaining--;
} else {
    createLine(userIndex, mIndex, hpDiff); // Animation normale
}
```

---

## ⏱️ Timing du WebSocket

### Mesures effectuées

```
Fréquence moyenne : ~200-270ms entre messages (4-5 msg/s)
Intervalle minimum : 2-4ms (actions groupées)
Intervalle maximum : 1150-1750ms (pauses)
```

### Implications pour les animations

```
Timeline typique :
├─ Joueur caste ability (ex: buff 0.3s)
├─ ~200ms plus tard → WebSocket reçu
├─ Animation déclenchée
└─ Action déjà active depuis ~200ms
```

**Conséquence :** Les animations ont ~200-300ms de retard, mais c'est acceptable pour l'UX.

---

## 🎨 Abilities Database

### Structure existante

Fichier : `abilities_database.js`

```javascript
const ABILITIES_DATABASE = {
    "Fireball": {
        category: "magic",
        animation: "mage",
        damageType: "fire",
        fireballColor: "red"
    },
    "Ice Spear": {
        category: "magic",
        animation: "mage",
        damageType: "water",
        fireballColor: "blue"
    },
    "Precision": {
        category: "buff",
        animation: "none",
        damageType: "offensive"
    }
    // ... etc
}
```

### Mapping HRID → Nom

**Problème :** WebSocket envoie `/abilities/fireball`, database utilise `"Fireball"`

**Solution nécessaire :**
```javascript
function formatAbilityName(hrid) {
    // "/abilities/fireball" → "Fireball"
    const name = hrid.split('/').pop(); // "fireball"
    return name.charAt(0).toUpperCase() + name.slice(1); // "Fireball"
    // Note: Gérer les cas spéciaux (snake_case, etc.)
}
```

---

## 🔧 État actuel du système

### ✅ Ce qui fonctionne

1. **Détection des DoT** (Firestorm, Maim)
   - Animation de flammes distincte des projectiles
   - Tracking des ticks restants
   - Respect des settings par joueur

2. **Animations d'attaque**
   - Melee (mace smash)
   - Ranged (arrow)
   - Mage (fireball avec couleurs configurables)

3. **Détection des buffs dans le WebSocket**
   - `abilityHrid` contient les buffs
   - `lastAbility` persiste après le cast

4. **Settings par joueur**
   - Désactivation des animations par tracker
   - Logs conditionnels (uniquement si animations activées)

### 🚧 À implémenter

1. **Intégration de abilities_database.js**
   - Auto-détection du type d'animation
   - Auto-sélection des couleurs selon l'élément
   - Mapping HRID → Nom de l'ability

2. **Animations de buffs**
   - Flash/aura au cast
   - Différenciation offensive/defensive
   - Animations courtes (200-400ms max)

3. **Auto-détection complète**
   - Plus besoin de configuration manuelle
   - Le script détecte automatiquement melee/ranged/mage
   - Couleurs automatiques (feu=rouge, eau=bleu, nature=vert)

---

## 📋 Problèmes résolus

### 1. "Fireballs fantômes"
**Cause :** Proc AOE 30% du bâton magique, pas un bug !

### 2. DoT détectés comme attaques normales
**Cause :** `lastAbility` écrasée par les sorts suivants
**Solution :** Tracker `playersActiveDoTs[]` séparé

### 3. Animations multi-joueurs
**Problème :** Confusion entre les DoT de différents joueurs
**Solution :** Logs conditionnels + vérification des settings

---

## 🎯 Plan d'action futur

### Phase 1 : Intégration database
1. Charger `abilities_database.js` dans le script
2. Créer fonction de mapping HRID → Nom
3. Auto-détecter type d'animation au cast

### Phase 2 : Animations buffs
1. Détecter changement de `abilityHrid` pour les buffs
2. Créer animations courtes (flash/aura)
3. Différencier par catégorie (offensive/defensive/aura)

### Phase 3 : Auto-couleurs
1. Mapper damageType → couleur
   - `fire` → rouge
   - `water` → bleu
   - `nature` → vert
   - `physical` → orange
2. Appliquer automatiquement aux projectiles

---

## 🔍 Code snippets utiles

### Activer/désactiver le timing logger

```javascript
// Dans la console
wsTimingLogger.enabled = false  // Désactiver
wsTimingLogger.enabled = true   // Activer
wsTimingLogger.getStats()       // Voir stats
wsTimingLogger.reset()          // Reset
```

### Vérifier les abilities disponibles

```javascript
// Filtrer par catégorie
getAbilitiesByCategory("buff")
getAbilitiesByCategory("magic")

// Filtrer par type de dégât
getAbilitiesByDamageType("fire")
```

---

## 📦 Fichiers modifiés

- `mwi-avatar-plus/modules/core/websocket.js` (v=15)
  - Ajout `playersActiveDoTs[]`
  - Ajout tracking `abilityHrid`
  - Ajout `wsTimingLogger`
  - Détection DoT avec ticks restants

- `mwi-avatar-plus/modules/animations/effects/dot-effect.js`
  - Animation de flammes/burn pour DoT
  - Support fire/poison/bleed

- `mwi-avatar-plus/mwi-avatar-plus.user.js`
  - Version cache WebSocket : v=15

---

## 💡 Notes importantes

1. **Le WebSocket est event-driven**, pas du polling
2. **Les buffs sont détectés** même s'ils sont très rapides
3. **`lastAbility` persiste** jusqu'au prochain cast
4. **Les DoT tickent 2 fois** après le cast (pour Firestorm)
5. **Le timing ~200ms est acceptable** pour les animations

---

**Document créé le :** 2025-10-27  
**Contexte :** Implémentation système de détection DoT et découvertes WebSocket  
**Version script actuelle :** 2.3.0 (websocket v=15)
