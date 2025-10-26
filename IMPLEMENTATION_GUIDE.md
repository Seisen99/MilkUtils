# 🎯 Guide d'Implémentation - Détection Automatique des Spells

## 📋 Vue d'ensemble

Ajouter une détection automatique des sorts lancés en combat pour appliquer automatiquement les animations correspondantes basées sur le type de spell (melee/ranged/mage) et le type de dégâts (fire/water/nature/physical).

## 🏗️ Architecture

### Structure DOM du Combat
```
.BattlePanel_playersArea__vvwlB
└─ Container (premier enfant)
    ├─ .CombatUnit_combatUnit__1G_Qp (Player #0)
    │   ├─ .CombatUnit_name__1SlO1 (texte: "PlayerName")
    │   └─ .ProgressBar_text__102Yn (texte: "Fireball") ← DÉTECTER ICI
    │
    ├─ .CombatUnit_combatUnit__1G_Qp (Player #1)
    │   ├─ .CombatUnit_name__1SlO1
    │   └─ .ProgressBar_text__102Yn
    │
    └─ ... (jusqu'à 5 joueurs max)
```

## 📦 Composants à Ajouter

### 1. Base de Données des Abilities
**Fichier:** `abilities_database.js` (à intégrer dans `combat_animation.js`)

```javascript
const ABILITIES_DATABASE = {
    // MELEE - Stab
    "Poke": { category: "melee", animation: "melee", damageType: "stab" },
    "Impale": { category: "melee", animation: "melee", damageType: "stab" },
    
    // MELEE - Slash
    "Scratch": { category: "melee", animation: "melee", damageType: "slash" },
    "Cleave": { category: "melee", animation: "melee", damageType: "slash" },
    
    // RANGED
    "Quick Shot": { category: "ranged", animation: "ranged", damageType: "physical" },
    "Flame Arrow": { category: "ranged", animation: "ranged", damageType: "fire", fireballColor: "red" },
    
    // MAGIC - Water
    "Water Strike": { category: "magic", animation: "mage", damageType: "water", fireballColor: "blue" },
    "Ice Spear": { category: "magic", animation: "mage", damageType: "water", fireballColor: "blue" },
    
    // MAGIC - Fire
    "Fireball": { category: "magic", animation: "mage", damageType: "fire", fireballColor: "red" },
    "Flame Blast": { category: "magic", animation: "mage", damageType: "fire", fireballColor: "red" },
    
    // MAGIC - Nature
    "Entangle": { category: "magic", animation: "mage", damageType: "nature", fireballColor: "green" },
    "Toxic Pollen": { category: "magic", animation: "mage", damageType: "nature", fireballColor: "green" },
    
    // HEAL & BUFF (pas d'animation d'attaque)
    "Minor Heal": { category: "support", animation: "none" },
    "Heal": { category: "support", animation: "none" },
    // ... etc
};
```

### 2. Nouvelle Option dans Settings

Ajouter un toggle dans `settingsMap`:
```javascript
settingsMap = {
    // ... options existantes ...
    
    autoDetectSpells: {
        id: "autoDetectSpells",
        desc: isZH ? "检测自动施法" : "Auto-detect spell casting",
        isTrue: false,  // Désactivé par défaut pour ne pas casser l'existant
    }
};
```

Interface dans les settings:
```html
<div class="tracker-option">
    <input type="checkbox" data-number="autoDetectSpells" data-param="isTrue" />
    <span>🔍 Auto-detect spell casting</span>
    <span style="font-size: 11px; color: #888; margin-left: 10px;">
        (Overrides manual animation settings when enabled)
    </span>
</div>
```

### 3. Système de Détection par MutationObserver

**Emplacement:** Dans `combat_animation.js`, après la fonction `hookWS()`

```javascript
// ==========================================
// SPELL DETECTION SYSTEM
// ==========================================

const SpellDetector = {
    observer: null,
    lastSpellByPlayer: {}, // Cache: {playerIndex: "SpellName"}
    lastDetectionTime: {}, // Throttling: {playerIndex: timestamp}
    THROTTLE_MS: 150, // Minimum 150ms entre 2 détections par joueur
    
    init() {
        if (!settingsMap.autoDetectSpells.isTrue) return;
        
        const battlePanel = document.querySelector('.BattlePanel_playersArea__vvwlB');
        if (!battlePanel) {
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        this.observer = new MutationObserver((mutations) => {
            this.handleMutations(mutations);
        });
        
        this.observer.observe(battlePanel, {
            childList: true,
            subtree: true,
            characterData: true,
            characterDataOldValue: true
        });
        
        console.log('[SpellDetector] Initialized');
    },
    
    handleMutations(mutations) {
        for (const mutation of mutations) {
            // Détecter changement dans ProgressBar_text
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const target = mutation.target.nodeType === Node.TEXT_NODE 
                    ? mutation.target.parentElement 
                    : mutation.target;
                
                if (target && target.className && 
                    target.className.includes('ProgressBar_text')) {
                    this.onSpellDetected(target);
                }
            }
        }
    },
    
    onSpellDetected(progressBarElement) {
        const spellName = progressBarElement.textContent.trim();
        if (!spellName) return;
        
        // Remonter au CombatUnit parent
        const combatUnit = progressBarElement.closest('.CombatUnit_combatUnit__1G_Qp');
        if (!combatUnit) return;
        
        // Trouver l'index du joueur
        const playersContainer = document.querySelector('.BattlePanel_playersArea__vvwlB');
        if (!playersContainer || !playersContainer.children[0]) return;
        
        const playerIndex = Array.from(playersContainer.children[0].children)
            .indexOf(combatUnit);
        
        if (playerIndex === -1 || playerIndex > 4) return;
        
        // Throttling
        const now = Date.now();
        if (this.lastDetectionTime[playerIndex] && 
            now - this.lastDetectionTime[playerIndex] < this.THROTTLE_MS) {
            return;
        }
        
        // Cache check
        if (this.lastSpellByPlayer[playerIndex] === spellName) {
            return;
        }
        
        // Lookup spell
        const abilityData = ABILITIES_DATABASE[spellName];
        if (!abilityData) {
            console.log(`[SpellDetector] Unknown spell: ${spellName}`);
            return;
        }
        
        // Appliquer l'animation
        this.applySpellAnimation(playerIndex, abilityData, spellName);
        
        // Update cache
        this.lastSpellByPlayer[playerIndex] = spellName;
        this.lastDetectionTime[playerIndex] = now;
    },
    
    applySpellAnimation(playerIndex, abilityData, spellName) {
        const trackerKey = `tracker${playerIndex}`;
        const tracker = settingsMap[trackerKey];
        
        if (!tracker) return;
        
        // Sauvegarder l'animation manuelle originale
        if (!tracker._originalAnimation) {
            tracker._originalAnimation = tracker.attackAnimation;
            tracker._originalFireballColor = tracker.fireballColor;
        }
        
        // Appliquer l'animation du spell
        if (abilityData.animation === "none") {
            // Spell de support, pas d'animation d'attaque
            return;
        }
        
        tracker.attackAnimation = abilityData.animation;
        
        if (abilityData.fireballColor) {
            tracker.fireballColor = abilityData.fireballColor;
        }
        
        console.log(`[SpellDetector] Player ${playerIndex} casting ${spellName} → ${abilityData.animation}`);
        
        // Auto-reset après 5 secondes (au cas où)
        setTimeout(() => {
            if (tracker._originalAnimation) {
                tracker.attackAnimation = tracker._originalAnimation;
                tracker.fireballColor = tracker._originalFireballColor;
            }
        }, 5000);
    },
    
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            console.log('[SpellDetector] Stopped');
        }
        
        // Restaurer les animations manuelles
        for (let i = 0; i <= 4; i++) {
            const tracker = settingsMap[`tracker${i}`];
            if (tracker && tracker._originalAnimation) {
                tracker.attackAnimation = tracker._originalAnimation;
                tracker.fireballColor = tracker._originalFireballColor;
                delete tracker._originalAnimation;
                delete tracker._originalFireballColor;
            }
        }
    }
};

// Initialiser au chargement
setTimeout(() => SpellDetector.init(), 2000);
```

### 4. Intégration avec le Système Existant

**Modifier la fonction `saveSettings()`:**
```javascript
function saveSettings() {
    for (const checkbox of document.querySelectorAll("div#tracker_settings input[type='checkbox']")) {
        settingsMap[checkbox.dataset.number][checkbox.dataset.param] = checkbox.checked;
        localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
    }
    
    // Réinitialiser le SpellDetector si le toggle change
    if (settingsMap.autoDetectSpells.isTrue) {
        SpellDetector.init();
    } else {
        SpellDetector.stop();
    }
    
    appliedAvatars.clear();
    setTimeout(applyCustomAvatar, 200);
}
```

**Modifier `createEffect()` pour utiliser l'animation détectée:**

La fonction `createEffect()` utilise déjà `playerTrackerSetting.attackAnimation`, donc aucun changement n'est nécessaire! Le système de détection modifie directement `settingsMap[trackerX].attackAnimation`, ce qui est automatiquement pris en compte.

## 🎨 UI/UX dans les Settings

Position dans les settings (après les trackers):
```
┌─────────────────────────────────────┐
│ MWI-Avatar-Plus Settings:           │
├─────────────────────────────────────┤
│ ☑ Enable custom avatar              │
│ Attack type: ⚔️ Melee 🏹 Ranged 🔮 Mage │
│                                     │
│ ☑ Enable player #1 damage line     │
│   Animation: ⚔️ Melee               │
│   ...                               │
│                                     │
│ ☑ Enable player #2 damage line     │
│   Animation: 🔮 Mage                │
│   ...                               │
│                                     │
│ ── AUTO-DETECTION ─────────────     │
│ ☐ 🔍 Auto-detect spell casting      │
│   (Overrides manual settings)       │
├─────────────────────────────────────┤
│ ☑ Show original damage color        │
│ ☑ Effects extension                 │
│ ☑ Enable missed attack line         │
└─────────────────────────────────────┘
```

## ⚡ Optimisations Performance

### 1. Throttling
- Maximum 1 détection par 150ms par joueur
- Évite les détections multiples pendant le cast

### 2. Cache
- `lastSpellByPlayer` : évite de réappliquer le même spell
- `lastDetectionTime` : throttling par joueur

### 3. Observer Ciblé
- Observer UNIQUEMENT `.BattlePanel_playersArea__vvwlB`
- Pas d'observation globale du document

### 4. Early Exit
- Vérifications rapides avant le traitement complet:
  - Spell name vide → return
  - Index joueur invalide → return
  - Spell identique au précédent → return
  - Throttle pas expiré → return

### 5. Lazy Init
- Le SpellDetector s'initialise seulement si `autoDetectSpells.isTrue`
- Attend que le battlePanel soit disponible

## 🔄 Workflow de Détection

```
1. MutationObserver détecte changement dans ProgressBar_text
   ↓
2. Extraire spellName (ex: "Fireball")
   ↓
3. Remonter au .CombatUnit_combatUnit__1G_Qp parent
   ↓
4. Calculer playerIndex (position dans le groupe 0-4)
   ↓
5. Vérifier throttling (< 150ms depuis dernier ? → skip)
   ↓
6. Vérifier cache (même spell ? → skip)
   ↓
7. Lookup dans ABILITIES_DATABASE
   ↓
8. Appliquer animation: 
   settingsMap[`tracker${playerIndex}`].attackAnimation = abilityData.animation
   ↓
9. Mettre à jour cache et timestamp
   ↓
10. createEffect() utilise automatiquement la nouvelle animation
```

## 🐛 Debugging

Ajouter des logs pour debug:
```javascript
// Dans onSpellDetected():
console.log(`[SpellDetector] Detected: "${spellName}" by Player #${playerIndex}`);

// Dans applySpellAnimation():
console.log(`[SpellDetector] Applying ${abilityData.animation} animation for ${spellName}`);
```

Pour désactiver les logs en production:
```javascript
const DEBUG_SPELL_DETECTOR = false;

function debugLog(...args) {
    if (DEBUG_SPELL_DETECTOR) {
        console.log(...args);
    }
}
```

## 📝 Points d'Attention

### ⚠️ NE PAS TOUCHER
- La logique de `createEffect()` existante
- Les animations manuelles existantes
- Le système de particules et effets
- La structure de `settingsMap` (sauf ajout de `autoDetectSpells`)

### ✅ À MODIFIER
- Ajouter `ABILITIES_DATABASE` au début du script
- Ajouter `SpellDetector` object
- Ajouter option dans `settingsMap`
- Modifier UI des settings (ajouter le toggle)
- Modifier `saveSettings()` pour gérer le toggle

### 🔄 Fallback Manuel
Si `autoDetectSpells.isTrue = false`:
- Le système manuel fonctionne exactement comme avant
- Aucun MutationObserver actif
- Pas de détection automatique
- Les animations sont configurées manuellement par l'utilisateur

Si `autoDetectSpells.isTrue = true`:
- MutationObserver actif
- Détection automatique des spells
- Les animations manuelles sont **sauvegardées** dans `_originalAnimation`
- Les animations sont **temporairement overridées** par la détection
- Si un spell n'est pas dans la database → fallback sur l'animation manuelle

## 🚀 Ordre d'Implémentation

1. ✅ Créer `abilities_database.js` avec tous les spells
2. ⬜ Intégrer `ABILITIES_DATABASE` dans `combat_animation.js`
3. ⬜ Ajouter `autoDetectSpells` dans `settingsMap`
4. ⬜ Créer l'objet `SpellDetector`
5. ⬜ Ajouter l'UI du toggle dans les settings
6. ⬜ Modifier `saveSettings()` pour gérer le toggle
7. ⬜ Tester avec différents spells
8. ⬜ Optimiser si nécessaire

## 🧪 Tests à Effectuer

1. **Test activation/désactivation:**
   - Toggle ON → détection active
   - Toggle OFF → système manuel fonctionne

2. **Test multi-joueur:**
   - 5 joueurs avec des spells différents
   - Vérifier que chaque animation correspond au bon joueur

3. **Test performance:**
   - Combat long (> 5 min)
   - Vérifier pas de memory leak
   - Vérifier fluidité des animations

4. **Test edge cases:**
   - Spell inconnu → fallback manuel
   - Changement de spell rapide
   - Plusieurs joueurs castent en même temps

## 📚 Ressources

- Classes CSS importantes:
  - `.BattlePanel_playersArea__vvwlB` : zone de combat joueurs
  - `.CombatUnit_combatUnit__1G_Qp` : conteneur unité
  - `.CombatUnit_name__1SlO1` : nom du joueur
  - `.ProgressBar_text__102Yn` : texte du spell (cast bar)

- Wiki Abilities: https://milkywayidle.wiki.gg/wiki/Abilities

---

**Note finale:** Cette implémentation est 100% rétrocompatible. Si la détection auto est désactivée, le script fonctionne exactement comme avant!
