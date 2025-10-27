# WebSocket Discoveries - Animation System

## 📡 Découvertes WebSocket

### 1. Structure des messages `battle_updated`

Le WebSocket envoie des messages avec la structure suivante :

```javascript
{
    type: "battle_updated",
    battleId: 142,
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

### 3. Messages `new_battle`

**Problème découvert :** Le serveur envoie **plusieurs fois** le même `new_battle` pendant un combat !

```javascript
{
    type: "new_battle",
    battleId: 142,  // ⭐ Même ID envoyé plusieurs fois !
    players: [...],
    monsters: [...]
}
```

**Solution implémentée :**
```javascript
let currentBattleId = null;

if (obj.type === "new_battle" && currentBattleId !== obj.battleId) {
    currentBattleId = obj.battleId;
    // Initialiser UNIQUEMENT si c'est un NOUVEAU battleId
}
```

Sans cette vérification, les arrays se réinitialisaient en plein combat, effaçant les animations détectées !

### 4. Détection du cast avec `cMP` (mana)

```javascript
// Détection par consommation de mana
if (playerData.cMP < playersMP[userIndex]) {
    castPlayer = parseInt(userIndex); // ⚠️ IMPORTANT: parseInt() pour éviter bugs de typage
}
```

**Bug résolu :** `castPlayer` était comparé en string vs number, causant des animations qui ne fonctionnaient que pour le player à l'index 0.

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

---

## 🎨 Système d'Auto-Détection (Implémenté ✅)

### Architecture complète

```
WebSocket (abilityHrid) → formatAbilityName() → abilities_database.js → playersAbilityInfo[]
                                                                              ↓
                                                                    effect-coordinator.js
                                                                              ↓
                                                                    Animations SVG
```

### 1. Mapping HRID → Nom d'ability

**Implémentation finale :**

```javascript
function formatAbilityName(hrid) {
    // "/abilities/ice_spear" → "Ice Spear"
    const parts = hrid.split('/');
    const abilityKey = parts[parts.length - 1];
    
    return abilityKey
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
```

**Cas supportés :**
- `/abilities/fireball` → `"Fireball"`
- `/abilities/ice_spear` → `"Ice Spear"`
- `/abilities/elemental_affinity` → `"Elemental Affinity"`

### 2. Structure de `playersAbilityInfo[]`

```javascript
playersAbilityInfo[userIndex] = {
    animation: "mage",           // "melee" | "ranged" | "mage"
    damageType: "fire",          // "fire" | "water" | "nature" | "smash" | etc.
    fireballColor: "red"         // Couleur du projectile
};
```

### 3. Mode Auto vs Manual

**Interface utilisateur :**
- Toggle "Manual/Auto" dans les settings de chaque tracker (tracker0-4)
- En mode Auto : grisé les settings manuels
- En mode Manual : utilise les settings configurés par l'utilisateur

**Logique de priorité dans `effect-coordinator.js` :**

```javascript
// PRIORITY 1: Auto-detection (if mode is auto AND info is available)
if (settingsMap["tracker" + index].detectionMode === "auto" && 
    window.playersAbilityInfo[index]) {
    playerAttackType = window.playersAbilityInfo[index].animation;
    playerFireballColor = window.playersAbilityInfo[index].fireballColor;
}
// PRIORITY 2: Manual settings
else if (settingsMap["tracker" + index].detectionMode === "manual") {
    playerAttackType = settingsMap["tracker" + index].attackAnimation;
    playerFireballColor = settingsMap["tracker" + index].fireballColor;
}
```

### 4. Persistance entre combats

**Problème :** À chaque nouveau combat, `playersAbilityInfo` était réinitialisé à `[]`, forçant les joueurs à caster une ability avant de voir les animations SVG.

**Solution finale :**

```javascript
// Dans new_battle
const newPlayerCount = obj.players.length;
if (playersAbilityInfo.length !== newPlayerCount) {
    // Redimensionner en gardant les données existantes
    playersAbilityInfo.length = newPlayerCount;
    for (let i = 0; i < newPlayerCount; i++) {
        if (playersAbilityInfo[i] === undefined) {
            playersAbilityInfo[i] = null;
        }
    }
}
// Sinon : garder tel quel, ne PAS réinitialiser
```

**Comportement obtenu :**
- ✅ Les animations persistent entre les combats successifs
- ✅ Si changement de groupe : flash de 1-2 sec avec animations incorrectes, puis auto-correction
- ✅ Si redimensionnement du groupe : conserve les animations des joueurs existants

### 5. Conservation lors du cast de buffs/supports

**Problème critique découvert :**

Quand un joueur castait un buff (ex: Speed Aura, Berserk, Precision), le code faisait :
```javascript
playersAbilityInfo[userIndex] = null; // ❌ EFFAÇAIT l'animation !
```

Résultat : Animations SVG → lignes par défaut dès le premier buff casté.

**Solution :**

```javascript
if (abilityData && abilityData.animation !== "none") {
    // Offensive ability → mettre à jour
    playersAbilityInfo[userIndex] = { animation, damageType, fireballColor };
} else {
    // Buff/support/unknown → GARDER l'animation précédente
    // Ne PAS toucher à playersAbilityInfo[userIndex]
}
```

**Résultat final :**
- Player caste `Fireball` → `playersAbilityInfo[0] = {mage, fire, red}`
- Player caste `Speed Aura` (buff) → `playersAbilityInfo[0]` **reste** `{mage, fire, red}` ✅
- Auto-attacks suivants → Animations mage avec fireball rouge ! ✅

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

## 🔧 État actuel du système (v2.5.0)

### ✅ Fonctionnalités implémentées

1. **Auto-détection complète des animations**
   - Détection automatique basée sur `abilityHrid` du WebSocket
   - Mapping HRID → Nom → Database → Animation type
   - Support des abilities snake_case (`ice_spear`, `elemental_affinity`)
   - Couleurs automatiques selon damageType (fire=rouge, water=bleu, nature=vert)

2. **Système Manual/Auto par joueur**
   - Toggle dans l'UI pour chaque tracker (tracker0-4)
   - Mode Auto : utilise la détection WebSocket
   - Mode Manual : utilise les settings configurés
   - Priorité : Auto > Manual > Lignes par défaut

3. **Persistance des animations**
   - Conservation entre les combats successifs
   - Conservation lors du cast de buffs/supports
   - Redimensionnement intelligent du groupe
   - Auto-correction au changement de groupe

4. **Détection des DoT** (Firestorm, Maim)
   - Animation de flammes distincte des projectiles
   - Tracking des ticks restants
   - Respect des settings par joueur

5. **Animations d'attaque**
   - Melee (mace smash)
   - Ranged (arrow)
   - Mage (fireball avec couleurs auto-détectées)

6. **Robustesse**
   - Gestion des `new_battle` multiples (vérification battleId)
   - Typage correct des indices (parseInt)
   - Export vers `window.*` pour accès cross-fichiers

---

## 📋 Bugs résolus

### 1. "Fireballs fantômes"
**Cause :** Proc AOE 30% du bâton magique, pas un bug !

### 2. DoT détectés comme attaques normales
**Cause :** `lastAbility` écrasée par les sorts suivants  
**Solution :** Tracker `playersActiveDoTs[]` séparé

### 3. Animations multi-joueurs
**Problème :** Confusion entre les DoT de différents joueurs  
**Solution :** Logs conditionnels + vérification des settings

### 4. Réinitialisations multiples en combat
**Cause :** Serveur envoie `new_battle` plusieurs fois avec même `battleId`  
**Solution :** Tracking de `currentBattleId` pour éviter re-init

### 5. Animations uniquement pour player 0
**Cause :** `castPlayer` comparé en string vs number  
**Solution :** `parseInt(userIndex)` dans la comparaison

### 6. Perte d'animations entre combats
**Cause :** `playersAbilityInfo` réinitialisé à chaque `new_battle`  
**Solution :** Conservation des animations, redimensionnement uniquement si nécessaire

### 7. Perte d'animations après cast de buff
**Cause :** `playersAbilityInfo[index] = null` quand `animation === "none"`  
**Solution :** Ne PAS écraser, garder l'animation offensive précédente

### 8. `playersAbilityInfo` vide dans effect-coordinator
**Cause :** Export vers `window.*` fait une seule fois, puis arrays recréés  
**Solution :** Ré-exporter après chaque redimensionnement/création d'array

---

## 🔍 Code snippets utiles

### Activer/désactiver le timing logger

```javascript
// Dans la console
wsTimingLogger.enabled = false  // Désactiver (défaut)
wsTimingLogger.enabled = true   // Activer
wsTimingLogger.getStats()       // Voir stats
wsTimingLogger.reset()          // Reset
```

### Inspecter l'état de l'auto-détection

```javascript
// Voir les animations détectées
window.playersAbilityInfo
// → [{animation: "mage", damageType: "fire", fireballColor: "red"}, null, {animation: "melee", ...}]

// Voir les dernières abilities castées
window.playersLastAbility
// → ["/abilities/fireball", "/abilities/mystic_aura", "/abilities/stunning_blow"]

// Vérifier la database
getAbilityData("Fireball")
// → {category: "magic", animation: "mage", damageType: "fire", fireballColor: "red"}

// Tester le mapping HRID
formatAbilityName("/abilities/ice_spear")
// → "Ice Spear"
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

### Core system
- `mwi-avatar-plus/modules/core/websocket.js` (v=24)
  - Ajout tracking `currentBattleId` (éviter ré-init multiples)
  - Ajout `playersAbilityInfo[]` avec persistance
  - Auto-détection via `formatAbilityName()` + `getAbilityData()`
  - Conservation des animations entre combats
  - Conservation lors du cast de buffs/supports
  - Fix typage `parseInt(userIndex)`
  - Ré-export `window.*` après chaque modification d'array

- `mwi-avatar-plus/modules/core/constants.js` (v=3)
  - Ajout `detectionMode: "manual"` pour chaque tracker
  - Suppression du setting global `attackAnimation` (redondant)

- `mwi-avatar-plus/modules/core/settings.js` (v=3)
  - Support de persistance pour `detectionMode`

### UI
- `mwi-avatar-plus/modules/ui/settings-panel.js` (v=3)
  - Ajout toggle Manual/Auto pour chaque tracker
  - UI grisée en mode Auto
  - Suppression du setting global attack type

### Animations
- `mwi-avatar-plus/modules/animations/effect-coordinator.js` (v=4)
  - Priorité Auto > Manual > Défaut
  - Lecture de `window.playersAbilityInfo[index]`
  - Suppression du forcing custom avatar (tous utilisent même système)

- `mwi-avatar-plus/modules/animations/effects/dot-effect.js`
  - Animation de flammes/burn pour DoT
  - Support fire/poison/bleed

### Database
- `mwi-avatar-plus/abilities_database.js` (v=2)
  - Ajout `formatAbilityName()` avec support snake_case
  - Export global `window.formatAbilityName` et `window.getAbilityData`
  - Database étendue avec ~50+ abilities

### Main script
- `mwi-avatar-plus/mwi-avatar-plus.user.js`
  - Version cache-busting mise à jour pour tous les modules modifiés
  - Version script : 2.4.0 → 2.5.0

---

## 💡 Notes importantes

1. **Le WebSocket est event-driven**, pas du polling
2. **Les buffs sont détectés** même s'ils sont très rapides
3. **`lastAbility` persiste** jusqu'au prochain cast
4. **Les DoT tickent 2 fois** après le cast (pour Firestorm)
5. **Le timing ~200ms est acceptable** pour les animations
6. **`new_battle` est envoyé plusieurs fois** avec le même battleId
7. **Les animations persistent entre combats** pour une UX fluide
8. **Flash de 1-2 sec possible** au changement de groupe, puis auto-correction
9. **Les buffs ne cassent plus les animations** grâce à la conservation
10. **Tous les exports doivent être refaits** après modification d'arrays

---

## 🎯 Améliorations futures possibles

### Détection de changement de groupe (Option A)
Actuellement, on accepte un flash de 1-2 sec d'animation incorrecte au changement de groupe.

**Amélioration possible :**
```javascript
// Comparer les player IDs pour détecter un vrai changement de groupe
function checkIfSamePlayerGroup(newPlayers) {
    // Si > 50% des joueurs sont identiques, considérer comme même groupe
    // Sinon, reset playersAbilityInfo
}
```

Complexité : Moyenne  
Bénéfice : Faible (cas rare, flash mineur)  
**Priorité : Basse**

### Animations de buffs visuelles
Actuellement, les buffs sont détectés mais ne montrent pas d'animation spécifique.

**Amélioration possible :**
- Flash/aura courte (200-400ms) au cast d'un buff
- Couleur selon type (offensive=rouge, defensive=bleu, aura=vert)

Complexité : Moyenne  
Bénéfice : Moyen (améliore feedback visuel)  
**Priorité : Moyenne**

### Auto-détection basée sur équipement
Pré-remplir `playersAbilityInfo` en analysant les abilities équipées dans `new_battle`.

Complexité : Élevée  
Bénéfice : Faible (persistance résout déjà 95% du problème)  
**Priorité : Très basse**

---

**Document créé le :** 2025-10-27  
**Dernière mise à jour :** 2025-10-27  
**Contexte :** Implémentation complète du système d'auto-détection des animations  
**Version script actuelle :** 2.5.0 (websocket v=24)  
**Feature branch :** `feature/auto-detection-animations` (prêt pour merge vers `main`)
