// ==========================================
// ABILITIES DATABASE
// Source: https://milkywayidle.wiki.gg/wiki/Abilities
// ==========================================
// 
// Structure:
// {
//   "Ability Name": {
//     category: "melee" | "ranged" | "magic" | "buff" | "special" | "support",
//     animation: "melee" | "ranged" | "mage" | "none",
//     damageType: "stab" | "slash" | "smash" | "physical" | "fire" | "water" | "nature",
//     fireballColor: "red" | "blue" | "green" (optionnel, pour les spells mage)
//   }
// }

const ABILITIES_DATABASE = {
    // ==========================================
    // MELEE ABILITIES - STAB
    // ==========================================
    "Poke": {
        category: "melee",
        animation: "melee",
        damageType: "stab"
    },
    "Impale": {
        category: "melee",
        animation: "melee",
        damageType: "stab"
    },
    "Puncture": {
        category: "melee",
        animation: "melee",
        damageType: "stab"
    },
    "Penetrating Strike": {
        category: "melee",
        animation: "melee",
        damageType: "stab"
    },

    // ==========================================
    // MELEE ABILITIES - SLASH
    // ==========================================
    "Scratch": {
        category: "melee",
        animation: "melee",
        damageType: "slash"
    },
    "Cleave": {
        category: "melee",
        animation: "melee",
        damageType: "slash"
    },
    "Maim": {
        category: "melee",
        animation: "melee",
        damageType: "slash"
    },
    "Crippling Slash": {
        category: "melee",
        animation: "melee",
        damageType: "slash"
    },

    // ==========================================
    // MELEE ABILITIES - SMASH
    // ==========================================
    "Smack": {
        category: "melee",
        animation: "melee",
        damageType: "smash"
    },
    "Sweep": {
        category: "melee",
        animation: "melee",
        damageType: "smash"
    },
    "Stunning Blow": {
        category: "melee",
        animation: "melee",
        damageType: "smash"
    },

    // ==========================================
    // RANGED ABILITIES - PHYSICAL
    // ==========================================
    "Quick Shot": {
        category: "ranged",
        animation: "ranged",
        damageType: "physical"
    },
    "Rain Of Arrows": {
        category: "ranged",
        animation: "ranged",
        damageType: "physical"
    },
    "Silencing Shot": {
        category: "ranged",
        animation: "ranged",
        damageType: "physical"
    },
    "Steady Shot": {
        category: "ranged",
        animation: "ranged",
        damageType: "physical"
    },
    "Pestilent Shot": {
        category: "ranged",
        animation: "ranged",
        damageType: "physical"
    },
    "Penetrating Shot": {
        category: "ranged",
        animation: "ranged",
        damageType: "physical"
    },

    // ==========================================
    // RANGED ABILITIES - FIRE
    // ==========================================
    "Flame Arrow": {
        category: "ranged",
        animation: "ranged",
        damageType: "fire"
    },

    // ==========================================
    // RANGED ABILITIES - WATER
    // ==========================================
    "Aqua Arrow": {
        category: "ranged",
        animation: "ranged",
        damageType: "water"
    },

    // ==========================================
    // MAGIC ABILITIES - WATER
    // ==========================================
    "Water Strike": {
        category: "magic",
        animation: "mage",
        damageType: "water",
        fireballColor: "blue"
    },
    "Ice Spear": {
        category: "magic",
        animation: "mage",
        damageType: "water",
        fireballColor: "blue"
    },
    "Frost Surge": {
        category: "magic",
        animation: "mage",
        damageType: "water",
        fireballColor: "blue"
    },
    "Mana Spring": {
        category: "magic",
        animation: "mage",
        damageType: "water",
        fireballColor: "blue"
    },

    // ==========================================
    // MAGIC ABILITIES - NATURE
    // ==========================================
    "Entangle": {
        category: "magic",
        animation: "mage",
        damageType: "nature",
        fireballColor: "green"
    },
    "Toxic Pollen": {
        category: "magic",
        animation: "mage",
        damageType: "nature",
        fireballColor: "green"
    },
    "Nature's Veil": {
        category: "magic",
        animation: "mage",
        damageType: "nature",
        fireballColor: "green"
    },
    "Life Drain": {
        category: "magic",
        animation: "mage",
        damageType: "nature",
        fireballColor: "green"
    },

    // ==========================================
    // MAGIC ABILITIES - FIRE
    // ==========================================
    "Fireball": {
        category: "magic",
        animation: "mage",
        damageType: "fire",
        fireballColor: "red"
    },
    "Flame Blast": {
        category: "magic",
        animation: "mage",
        damageType: "fire",
        fireballColor: "red"
    },
    "Firestorm": {
        category: "magic",
        animation: "mage",
        damageType: "fire",
        fireballColor: "red"
    },
    "Smoke Burst": {
        category: "magic",
        animation: "mage",
        damageType: "fire",
        fireballColor: "red"
    },

    // ==========================================
    // SUPPORT ABILITIES - HEALING
    // ==========================================
    "Minor Heal": {
        category: "support",
        animation: "none",
        damageType: "healing"
    },
    "Heal": {
        category: "support",
        animation: "none",
        damageType: "healing"
    },
    "Quick Aid": {
        category: "support",
        animation: "none",
        damageType: "healing"
    },
    "Rejuvenate": {
        category: "support",
        animation: "none",
        damageType: "healing"
    },

    // ==========================================
    // BUFFING ABILITIES
    // ==========================================
    "Taunt": {
        category: "buff",
        animation: "none",
        damageType: "threat"
    },
    "Provoke": {
        category: "buff",
        animation: "none",
        damageType: "threat"
    },
    "Toughness": {
        category: "buff",
        animation: "none",
        damageType: "defensive"
    },
    "Elusiveness": {
        category: "buff",
        animation: "none",
        damageType: "defensive"
    },
    "Precision": {
        category: "buff",
        animation: "none",
        damageType: "offensive"
    },
    "Berserk": {
        category: "buff",
        animation: "none",
        damageType: "offensive"
    },
    "Elemental Affinity": {
        category: "buff",
        animation: "none",
        damageType: "offensive"
    },
    "Frenzy": {
        category: "buff",
        animation: "none",
        damageType: "offensive"
    },
    "Spike Shell": {
        category: "buff",
        animation: "none",
        damageType: "defensive"
    },
    "Arcane Reflection": {
        category: "buff",
        animation: "none",
        damageType: "defensive"
    },
    "Vampirism": {
        category: "buff",
        animation: "none",
        damageType: "offensive"
    },

    // ==========================================
    // SPECIAL ABILITIES
    // ==========================================
    "Revive": {
        category: "special",
        animation: "none",
        damageType: "resurrection"
    },
    "Insanity": {
        category: "special",
        animation: "none",
        damageType: "offensive"
    },
    "Invincible": {
        category: "special",
        animation: "none",
        damageType: "defensive"
    },
    "Fierce Aura": {
        category: "special",
        animation: "none",
        damageType: "aura"
    },
    "Aqua Aura": {
        category: "special",
        animation: "none",
        damageType: "aura"
    },
    "Sylvan Aura": {
        category: "special",
        animation: "none",
        damageType: "aura"
    },
    "Flame Aura": {
        category: "special",
        animation: "none",
        damageType: "aura"
    },
    "Speed Aura": {
        category: "special",
        animation: "none",
        damageType: "aura"
    },
    "Critical Aura": {
        category: "special",
        animation: "none",
        damageType: "aura"
    }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Récupère les données d'une ability par son nom
 * @param {string} abilityName - Nom de l'ability
 * @returns {Object|null} - Données de l'ability ou null si non trouvée
 */
function getAbilityData(abilityName) {
    return ABILITIES_DATABASE[abilityName] || null;
}

/**
 * Vérifie si une ability est offensive (inflige des dégâts)
 * @param {string} abilityName - Nom de l'ability
 * @returns {boolean}
 */
function isOffensiveAbility(abilityName) {
    const ability = ABILITIES_DATABASE[abilityName];
    if (!ability) return false;
    
    return ability.category === "melee" || 
           ability.category === "ranged" || 
           ability.category === "magic";
}

/**
 * Récupère la couleur de fireball appropriée pour une ability
 * @param {string} abilityName - Nom de l'ability
 * @returns {string} - "red", "blue", "green", ou "green" par défaut
 */
function getFireballColor(abilityName) {
    const ability = ABILITIES_DATABASE[abilityName];
    if (!ability || !ability.fireballColor) return "green";
    
    return ability.fireballColor;
}

/**
 * Récupère toutes les abilities par catégorie
 * @param {string} category - Catégorie recherchée
 * @returns {Array} - Tableau de noms d'abilities
 */
function getAbilitiesByCategory(category) {
    return Object.keys(ABILITIES_DATABASE).filter(
        name => ABILITIES_DATABASE[name].category === category
    );
}

/**
 * Récupère toutes les abilities par type de dégât
 * @param {string} damageType - Type de dégât recherché
 * @returns {Array} - Tableau de noms d'abilities
 */
function getAbilitiesByDamageType(damageType) {
    return Object.keys(ABILITIES_DATABASE).filter(
        name => ABILITIES_DATABASE[name].damageType === damageType
    );
}

// ==========================================
// EXPORTS (pour utilisation dans d'autres modules si nécessaire)
// ==========================================
// Note: Dans le contexte Tampermonkey, ces fonctions seront disponibles
// globalement car le script s'exécute dans le scope global de la page

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ABILITIES_DATABASE,
        getAbilityData,
        isOffensiveAbility,
        getFireballColor,
        getAbilitiesByCategory,
        getAbilitiesByDamageType
    };
}
