/**
 * WebSocket message interception for battle tracking
 */

// Battle state tracking
let currentBattleId = null; // Track current battle to avoid re-initialization
let monstersHP = [];
let monstersMP = [];
let monstersDmgCounter = [];
let playersHP = [];
let playersMP = [];
let playersDmgCounter = [];
let playersIsAutoAtk = []; // Track auto-attack state per player
let playersLastAbility = []; // Track last ability cast per player
let playersActiveDoTs = []; // Track active DoTs with remaining ticks per player
let playersAbilityInfo = []; // Track auto-detected ability info {animation, damageType, fireballColor}

// Abilities that apply Damage over Time effects
const DOT_ABILITIES = [
    '/abilities/maim',      // Bleed DoT (melee)
    '/abilities/firestorm'  // Burn DoT (fire magic) - 2 ticks after cast
];

/**
 * Get player name by their index in battle
 * Uses the same detection method as avatar-manager.js
 * @param {number} playerIndex - Player index (0-4)
 * @returns {string|null} Player name or null
 */
function getPlayerNameByIndex(playerIndex) {
    const battlePanel = document.querySelector('.BattlePanel_playersArea__vvwlB');
    if (!battlePanel) return null;
    
    // Use the SAME method as avatar-manager.js (which works!)
    const allCombatNames = battlePanel.querySelectorAll('.CombatUnit_name__1SlO1');
    if (allCombatNames[playerIndex]) {
        return allCombatNames[playerIndex].textContent.trim();
    }
    return null;
}

/**
 * Get color settings for a player, considering My Character Color override
 * @param {number} playerIndex - Player index (0-4)
 * @returns {Object} Color settings {r, g, b, frameR, frameG, frameB, isTrue, isTrueH}
 */
function getColorForPlayer(playerIndex) {
    // Check if My Character Color feature is enabled
    if (settingsMap.myCharacterColor?.isTrue) {
        const playerNameAtIndex = getPlayerNameByIndex(playerIndex);
        const myPlayerName = getPlayerName();
        
        console.log(`🎨 getColorForPlayer(${playerIndex}):`, {
            myCharacterColorEnabled: settingsMap.myCharacterColor.isTrue,
            playerNameAtIndex,
            myPlayerName,
            match: playerNameAtIndex === myPlayerName
        });
        
        // If this player is the current user's character, use My Character Color
        if (playerNameAtIndex && myPlayerName && playerNameAtIndex === myPlayerName) {
            console.log(`   ✅ Using My Character Color for player ${playerIndex}`, {
                r: settingsMap.myCharacterColor.r,
                g: settingsMap.myCharacterColor.g,
                b: settingsMap.myCharacterColor.b
            });
            
            // Get base tracker settings to preserve animation settings
            const baseTracker = settingsMap["tracker" + playerIndex] || {};
            
            return {
                // Override with My Character Color
                r: settingsMap.myCharacterColor.r,
                g: settingsMap.myCharacterColor.g,
                b: settingsMap.myCharacterColor.b,
                frameR: settingsMap.myCharacterColor.frameR,
                frameG: settingsMap.myCharacterColor.frameG,
                frameB: settingsMap.myCharacterColor.frameB,
                
                // Keep all other properties from tracker (animations, detection mode, etc.)
                isTrue: baseTracker.isTrue ?? true,
                isTrueH: baseTracker.isTrueH ?? true,
                detectionMode: baseTracker.detectionMode ?? "manual",
                attackAnimation: baseTracker.attackAnimation ?? "none",
                fireballColor: baseTracker.fireballColor ?? "green",
                id: baseTracker.id,
                desc: baseTracker.desc,
                descH: baseTracker.descH,
            };
        }
    }
    
    // Fallback to position-based color
    return settingsMap["tracker" + playerIndex] || { r: 255, g: 100, b: 0, frameR: 255, frameG: 100, frameB: 0, isTrue: true, isTrueH: true };
}

// WebSocket timing logger (disabled - use for performance debugging only)
let wsTimingLogger = {
    enabled: false, // Set to false to disable timing logs
    lastMessageTime: 0,
    intervals: [],
    messageCount: 0,
    startTime: 0,
    
    reset() {
        this.lastMessageTime = 0;
        this.intervals = [];
        this.messageCount = 0;
        this.startTime = Date.now();
    },
    
    logMessage() {
        if (!this.enabled) return;
        
        const now = Date.now();
        this.messageCount++;
        
        if (this.startTime === 0) {
            this.startTime = now;
        }
        
        if (this.lastMessageTime > 0) {
            const interval = now - this.lastMessageTime;
            this.intervals.push(interval);
            
            // Log every 10th message to avoid spam
            if (this.messageCount % 10 === 0) {
                const avgInterval = this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length;
                const minInterval = Math.min(...this.intervals);
                const maxInterval = Math.max(...this.intervals);
                const elapsed = ((now - this.startTime) / 1000).toFixed(1);
                const frequency = (this.messageCount / ((now - this.startTime) / 1000)).toFixed(2);
                
                console.log(`⏱️ WebSocket Stats (${this.messageCount} messages, ${elapsed}s):`, {
                    avgInterval: `${avgInterval.toFixed(0)}ms`,
                    minInterval: `${minInterval}ms`,
                    maxInterval: `${maxInterval}ms`,
                    frequency: `${frequency} msg/s`
                });
            }
        }
        
        this.lastMessageTime = now;
    },
    
    getStats() {
        const now = Date.now();
        const elapsed = (now - this.startTime) / 1000;
        const avgInterval = this.intervals.length > 0 
            ? this.intervals.reduce((a, b) => a + b, 0) / this.intervals.length 
            : 0;
        
        return {
            messageCount: this.messageCount,
            elapsedTime: elapsed.toFixed(1) + 's',
            avgInterval: avgInterval.toFixed(0) + 'ms',
            frequency: (this.messageCount / elapsed).toFixed(2) + ' msg/s',
            minInterval: this.intervals.length > 0 ? Math.min(...this.intervals) + 'ms' : 'N/A',
            maxInterval: this.intervals.length > 0 ? Math.max(...this.intervals) + 'ms' : 'N/A'
        };
    }
};

// Expose to global scope for manual control
window.wsTimingLogger = wsTimingLogger;

/**
 * Hook into WebSocket to intercept battle messages
 */
function hookWS() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const oriGet = dataProperty.get;

    dataProperty.get = hookedGet;
    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

    function hookedGet() {
        const socket = this.currentTarget;
        if (!(socket instanceof WebSocket)) {
            return oriGet.call(this);
        }
        if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
            return oriGet.call(this);
        }

        const message = oriGet.call(this);
        Object.defineProperty(this, "data", { value: message }); // Anti-loop

        return handleMessage(message);
    }
}

/**
 * Handle incoming WebSocket messages
 * @param {string} message - Raw WebSocket message
 * @returns {string} The original message
 */
function handleMessage(message) {
    // Log WebSocket timing
    wsTimingLogger.logMessage();
    
    let obj = JSON.parse(message);
    
    // 🔍 DEBUG: Log all WebSocket messages
    console.log('📨 WebSocket Message:', obj);
    
    if (obj && obj.type === "new_battle") {
        // Only initialize if this is ACTUALLY a new battle (different battleId)
        if (currentBattleId !== obj.battleId) {
            currentBattleId = obj.battleId;
            
            // Reset timing stats on new battle
            wsTimingLogger.reset();
            monstersHP = obj.monsters.map((monster) => monster.currentHitpoints);
            monstersMP = obj.monsters.map((monster) => monster.currentManapoints);
            monstersDmgCounter = obj.monsters.map((monster) => monster.damageSplatCounter);
            playersHP = obj.players.map((player) => player.currentHitpoints);
            playersMP = obj.players.map((player) => player.currentManapoints);
            playersDmgCounter = obj.players.map((player) => player.damageSplatCounter);
            playersIsAutoAtk = obj.players.map(() => false); // Initialize auto-attack state
            playersLastAbility = obj.players.map(() => null); // Initialize last ability tracker
            playersActiveDoTs = obj.players.map(() => ({ ticksRemaining: 0 })); // Initialize DoT tracker
            
            // PERSIST ANIMATIONS: Keep previous animations between battles, resize if needed
            const newPlayerCount = obj.players.length;
            if (playersAbilityInfo.length !== newPlayerCount) {
                // Resize array: keep existing data, fill new slots with null
                playersAbilityInfo.length = newPlayerCount;
                for (let i = 0; i < newPlayerCount; i++) {
                    if (playersAbilityInfo[i] === undefined) {
                        playersAbilityInfo[i] = null;
                    }
                }
                console.log(`   📐 Resized playersAbilityInfo to ${newPlayerCount} players (kept previous animations)`);
            } else {
                console.log(`   💾 Kept previous playersAbilityInfo for ${newPlayerCount} players`);
            }
            
            // Re-export to window after updating arrays (critical for external access)
            window.playersAbilityInfo = playersAbilityInfo;
            window.playersLastAbility = playersLastAbility;
            
            console.log(`✅ new_battle (ID: ${obj.battleId}): Initialized arrays for ${obj.players.length} players`);
            console.log('   playersAbilityInfo:', playersAbilityInfo);
            console.log('   playersLastAbility:', playersLastAbility);
            console.log('   window.playersAbilityInfo:', window.playersAbilityInfo);
        } else {
            console.log(`♻️ new_battle (ID: ${obj.battleId}): SKIPPED re-initialization (same battle)`);
        }
    } else if (obj && obj.type === "battle_updated" && monstersHP.length) {
        const mMap = obj.mMap;
        const pMap = obj.pMap;
        const monsterIndices = Object.keys(obj.mMap);
        const playerIndices = Object.keys(obj.pMap);

        // 🔍 DEBUG: Log player map when present
        if (Object.keys(pMap).length > 0) {
            console.log('👥 pMap:', pMap);
        }

        let castMonster = -1;
        monsterIndices.forEach((monsterIndex) => {
            if(mMap[monsterIndex].cMP < monstersMP[monsterIndex]){castMonster = monsterIndex;}
            monstersMP[monsterIndex] = mMap[monsterIndex].cMP;
        });
        let castPlayer = -1;
        playerIndices.forEach((userIndex) => {
            const playerData = pMap[userIndex];
            
            // Update cast detection
            if(playerData.cMP < playersMP[userIndex]){castPlayer = parseInt(userIndex);}
            playersMP[userIndex] = playerData.cMP;
            
            // Update auto-attack state if present in message
            if (playerData.hasOwnProperty('isAutoAtk')) {
                playersIsAutoAtk[userIndex] = playerData.isAutoAtk;
                console.log(`🤖 Player ${userIndex} isAutoAtk:`, playerData.isAutoAtk);
            }
            // If abilityHrid is present, track it and set auto-attack to false
            if (playerData.hasOwnProperty('abilityHrid')) {
                playersLastAbility[userIndex] = playerData.abilityHrid;
                playersIsAutoAtk[userIndex] = false;
                
                console.log(`✨ Player ${userIndex} cast ability:`, playerData.abilityHrid);
                console.log(`   Detection mode for tracker${userIndex}:`, settingsMap["tracker"+userIndex]?.detectionMode);
                
                // AUTO-DETECTION: If mode is auto, detect animation type from ability database
                if (settingsMap["tracker"+userIndex] && settingsMap["tracker"+userIndex].detectionMode === "auto") {
                    const abilityName = formatAbilityName(playerData.abilityHrid);
                    const abilityData = getAbilityData(abilityName);
                    
                    console.log(`   🔍 Auto-detection: "${playerData.abilityHrid}" → "${abilityName}"`);
                    console.log(`   📖 Ability data:`, abilityData);
                    
                    if (abilityData && abilityData.animation !== "none") {
                        playersAbilityInfo[userIndex] = {
                            animation: abilityData.animation,           // "melee"/"ranged"/"mage"
                            damageType: abilityData.damageType,         // "fire"/"water"/"nature"
                            fireballColor: abilityData.fireballColor || "green"
                        };
                        console.log(`   ✅ Auto-detected animation for player ${userIndex}:`, playersAbilityInfo[userIndex]);
                    } else {
                        // Ability is buff/support/unknown → KEEP previous animation (don't reset)
                        console.log(`   ⚠️ Non-offensive ability "${abilityName}" - keeping previous animation:`, playersAbilityInfo[userIndex]);
                    }
                }
                // Note: Manual mode doesn't touch playersAbilityInfo (handled in effect-coordinator)
                
                // If a DoT ability is cast, activate DoT tracking (2 ticks for Firestorm)
                if (DOT_ABILITIES.includes(playerData.abilityHrid)) {
                    playersActiveDoTs[userIndex] = { ticksRemaining: 2, ability: playerData.abilityHrid };
                    console.log(`   🔥 DoT ability activated for player ${userIndex}`);
                }
            }
        });

        let hurtMonster = false;
        let hurtPlayer = false;
        let monsterLifeSteal = {from:null, to:null, hpDiff:null};
        let playerLifeSteal = {from:null, to:null, hpDiff:null};
        monstersHP.forEach((mHP, mIndex) => {
            const monster = mMap[mIndex];
            if (monster) {
                const hpDiff = mHP - monster.cHP;
                if (hpDiff > 0) {hurtMonster = true;}
                let dmgSplat = false;
                if (monstersDmgCounter[mIndex] < monster.dmgCounter) {dmgSplat = true;}
                monstersHP[mIndex] = monster.cHP;
                monstersDmgCounter[mIndex] = monster.dmgCounter;
                if (dmgSplat && hpDiff >= 0 && playerIndices.length > 0) {
                    if (playerIndices.length > 1) {
                        playerIndices.forEach((userIndex) => {
                            // Check player state
                            const isAutoAttack = playersIsAutoAtk[userIndex] === true;
                            const hasDotActive = playersActiveDoTs[userIndex]?.ticksRemaining > 0;
                            
                            // DoT tick: castPlayer = -1 AND player has active DoT AND not auto-attack
                            const isDot = (castPlayer === -1) && hasDotActive && !isAutoAttack;
                            
                            // Animate if: it's a DoT OR it's the player who cast
                            if (isDot || parseInt(userIndex) === castPlayer) {
                                if (isDot) {
                                    // DoT damage - show burn effect
                                    createDotLine(userIndex, mIndex, hpDiff);
                                    // Consume one DoT tick
                                    playersActiveDoTs[userIndex].ticksRemaining--;
                                } else {
                                    // Normal cast or auto-attack - show projectile
                                    createLine(userIndex, mIndex, hpDiff);
                                }
                            }
                        });
                    } else {
                        // Solo player
                        const userIndex = playerIndices[0];
                        const isAutoAttack = playersIsAutoAtk[userIndex] === true;
                        const hasDotActive = playersActiveDoTs[userIndex]?.ticksRemaining > 0;
                        const isDot = (castPlayer === -1) && hasDotActive && !isAutoAttack;
                        
                        if (isDot) {
                            // DoT damage in solo
                            createDotLine(userIndex, mIndex, hpDiff);
                            // Consume one DoT tick
                            playersActiveDoTs[userIndex].ticksRemaining--;
                        } else {
                            // Normal cast or auto-attack
                            createLine(userIndex, mIndex, hpDiff);
                        }
                    }
                }
                if (hpDiff < 0 ) {
                    if (castMonster > -1){
                        createLine(mIndex, castMonster, hpDiff, true);
                    }else{
                        monsterLifeSteal.from=mIndex;
                        monsterLifeSteal.to=mIndex;
                        monsterLifeSteal.hpDiff=hpDiff;
                    }
                }
            }
        });

        playersHP.forEach((pHP, pIndex) => {
            const player = pMap[pIndex];
            if (player) {
                const hpDiff = pHP - player.cHP;
                if (hpDiff > 0) {hurtPlayer = true;}
                let dmgSplat = false;
                if (playersDmgCounter[pIndex] < player.dmgCounter) {dmgSplat = true;}
                playersHP[pIndex] = player.cHP;
                playersDmgCounter[pIndex] = player.dmgCounter;
                if (dmgSplat && hpDiff >= 0 && monsterIndices.length > 0) {
                    if (monsterIndices.length > 1) {
                        monsterIndices.forEach((monsterIndex) => {
                            if(monsterIndex === castMonster) {
                                createLine(pIndex, monsterIndex, hpDiff, true);
                            }
                        });
                    } else {
                        createLine(pIndex, monsterIndices[0], hpDiff, true);
                    }
                }
                if (hpDiff < 0 ) {
                    if (castPlayer > -1){
                        createLine(castPlayer, pIndex, hpDiff);
                    }else{
                        playerLifeSteal.from=pIndex;
                        playerLifeSteal.to=pIndex;
                        playerLifeSteal.hpDiff=hpDiff;
                    }
                }
            }
        });
        if (hurtMonster && playerLifeSteal.from !== null) {
            createLine(playerLifeSteal.from, playerLifeSteal.to, playerLifeSteal.hpDiff);
        }
        if (hurtPlayer && monsterLifeSteal.from !== null) {
            createLine(monsterLifeSteal.from, monsterLifeSteal.to, monsterLifeSteal.hpDiff, true);
        }
    }
    return message;
}

/**
 * Create animation line for damage/heal
 * Manages SVG container and calls effect coordinator
 */
let isResizeListenerAdded = false;
function createLine(from, to, hpDiff, reversed = false) {
    if (hpDiff === 0 && !settingsMap.missedLine.isTrue) {return null;}
    
    // Get appropriate color settings (with My Character Color override if enabled)
    const colorSettings = reversed ? settingsMap.tracker6 : getColorForPlayer(from);
    
    if (hpDiff >= 0) {
        if (!colorSettings.isTrue) {
            return null;
        }
    } else {
        if (!colorSettings.isTrueH) {
            return null;
        }
    }

    if (!AnimationManager.canCreate()) {
        return null;
    }
    const container = document.querySelector(".BattlePanel_playersArea__vvwlB");
    if (container && container.children.length > 0) {
        const playersContainer = container.children[0];
        const monsterContainer = document.querySelector(".BattlePanel_monstersArea__2dzrY").children[0];
        const effectFrom = (reversed&&hpDiff<0)?monsterContainer.children[from]:playersContainer.children[from];
        const effectTo = (!reversed&&hpDiff<0)?playersContainer.children[to]:monsterContainer.children[to];
        const svg = document.getElementById('svg-container');
        if(!svg){
            const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgContainer.id = 'svg-container';
            Object.assign(svgContainer.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: '190'
            });

            svgContainer.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
            svgContainer.setAttribute('preserveAspectRatio', 'none');
            const updateViewBox = () => {
                if (document.getElementById('svg-container') !== undefined) {
                    document.getElementById('svg-container').setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
                }
            };
            document.querySelector(".GamePage_mainPanel__2njyb").appendChild(svgContainer);
            updateViewBox();
            if (!isResizeListenerAdded) {
                window.addEventListener('resize', () => {
                    updateViewBox();
                });
                isResizeListenerAdded = true;
            }
        }

        if (reversed) {
            createEffect(effectFrom, effectTo, hpDiff, from, reversed);
        } else {
            createEffect(effectFrom, effectTo, hpDiff, from, reversed);
        }
    }
}

/**
 * Create DoT (Damage over Time) effect animation
 * Shows burn/poison effect on monster without projectile
 * @param {number} playerIndex - Player index who applied the DoT
 * @param {number} monsterIndex - Monster index receiving DoT
 * @param {number} hpDiff - HP difference (damage amount)
 */
function createDotLine(playerIndex, monsterIndex, hpDiff) {
    // Get color settings with My Character Color override if enabled
    const colorSettings = getColorForPlayer(playerIndex);
    
    // Check if animations are enabled for this player
    if (!colorSettings.isTrue) {
        return null;
    }

    if (!AnimationManager.canCreate()) {
        return null;
    }

    const monsterContainer = document.querySelector(".BattlePanel_monstersArea__2dzrY")?.children[0];
    if (!monsterContainer || !monsterContainer.children[monsterIndex]) {
        return null;
    }

    const targetMonster = monsterContainer.children[monsterIndex];
    let svg = document.getElementById('svg-container');
    
    // Create SVG container if it doesn't exist
    if (!svg) {
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.id = 'svg-container';
        Object.assign(svgContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: '190'
        });

        svgContainer.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
        svgContainer.setAttribute('preserveAspectRatio', 'none');
        
        const gamePanel = document.querySelector(".GamePage_mainPanel__2njyb");
        if (gamePanel) {
            gamePanel.appendChild(svgContainer);
            svg = svgContainer;
        } else {
            return null;
        }
    }

    // Use the color settings we already fetched (with My Character Color override)
    const trackerSetting = colorSettings;

    // Create DoT effect (fire type by default)
    const dotEffect = createDotEffect(targetMonster, svg, trackerSetting, "fire");
    if (dotEffect) {
        AnimationManager.addPath(dotEffect);
    }

    return dotEffect;
}

// Export to global scope for Tampermonkey
window.hookWS = hookWS;
window.playersAbilityInfo = playersAbilityInfo;
window.getColorForPlayer = getColorForPlayer;
window.getPlayerNameByIndex = getPlayerNameByIndex;
