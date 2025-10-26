/**
 * WebSocket message interception for battle tracking
 */

// Battle state tracking
let monstersHP = [];
let monstersMP = [];
let monstersDmgCounter = [];
let playersHP = [];
let playersMP = [];
let playersDmgCounter = [];

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
    let obj = JSON.parse(message);
    if (obj && obj.type === "new_battle") {
        monstersHP = obj.monsters.map((monster) => monster.currentHitpoints);
        monstersMP = obj.monsters.map((monster) => monster.currentManapoints);
        monstersDmgCounter = obj.monsters.map((monster) => monster.damageSplatCounter);
        playersHP = obj.players.map((player) => player.currentHitpoints);
        playersMP = obj.players.map((player) => player.currentManapoints);
        playersDmgCounter = obj.players.map((player) => player.damageSplatCounter);
    } else if (obj && obj.type === "battle_updated" && monstersHP.length) {
        const mMap = obj.mMap;
        const pMap = obj.pMap;
        const monsterIndices = Object.keys(obj.mMap);
        const playerIndices = Object.keys(obj.pMap);

        let castMonster = -1;
        monsterIndices.forEach((monsterIndex) => {
            if(mMap[monsterIndex].cMP < monstersMP[monsterIndex]){castMonster = monsterIndex;}
            monstersMP[monsterIndex] = mMap[monsterIndex].cMP;
        });
        let castPlayer = -1;
        playerIndices.forEach((userIndex) => {
            if(pMap[userIndex].cMP < playersMP[userIndex]){castPlayer = userIndex;}
            playersMP[userIndex] = pMap[userIndex].cMP;
        });

        // Debug logging - only for player index 1
        const debugPlayerIndex = '1';
        if (monsterIndices.length > 0 && playerIndices.includes(debugPlayerIndex)) {
            console.log('🔥 PLAYER 1 DAMAGE:', {playerIndices, castPlayer, monsterIndices});
        }
        if (castPlayer === -1 && monsterIndices.length > 0 && playerIndices.includes(debugPlayerIndex)) {
            console.log('💀 PLAYER 1 DOT DETECTED:', {playerIndices, monsterIndices});
        }

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
                            if(userIndex === castPlayer) {
                                createLine(userIndex, mIndex, hpDiff);
                            }
                        });
                    } else {
                        createLine(playerIndices[0], mIndex, hpDiff);
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
    if (hpDiff >= 0) {
        if (reversed){
            if (!settingsMap.tracker6.isTrue) {
                return null;
            }
        } else {
            if (!settingsMap["tracker"+from].isTrue) {
                return null;
            }
        }
    } else {
        if (reversed){
            if (!settingsMap.tracker6.isTrueH) {
                return null;
            }
        } else {
            if (!settingsMap["tracker"+from].isTrueH) {
                return null;
            }
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

// Export to global scope for Tampermonkey
window.hookWS = hookWS;
