/**
 * Effect coordinator - orchestrates all combat animations
 * Determines which animation type to show based on player settings and battle context
 */

/**
 * Create appropriate effect based on damage type, player settings, etc.
 * @param {HTMLElement} startElem - Starting element (attacker)
 * @param {HTMLElement} endElem - Target element
 * @param {number} hpDiff - HP difference (positive = damage, negative = heal, 0 = miss)
 * @param {number} index - Player/enemy index
 * @param {boolean} reversed - True if enemy attacking player
 */
function createEffect(startElem, endElem, hpDiff, index, reversed = false) {
    let hitTarget = undefined;
    let hitDamage = undefined;
    if (reversed) {
        if (hpDiff >= 0) {
            hitTarget = startElem.querySelector('.FullAvatar_fullAvatar__3RB2h');
        }
        const dmgContainer = startElem.querySelector('.CombatUnit_splatsContainer__2xcc0');
        if (dmgContainer) {
            const dmgDivs = dmgContainer.querySelectorAll('div');
            for (const div of dmgDivs) {
                if (div.innerText.trim() === '') {
                    startElem = div;
                    hitDamage = div;
                    break;
                }
            }
        }
    } else {
        if (hpDiff >= 0) {
            hitTarget = endElem.querySelector('.CombatUnit_monsterIcon__2g3AZ');
        }
        const dmgContainer = endElem.querySelector('.CombatUnit_splatsContainer__2xcc0');
        if (dmgContainer) {
            const dmgDivs = dmgContainer.querySelectorAll('div');
            for (const div of dmgDivs) {
                if (div.innerText.trim() === '') {
                    endElem = div;
                    hitDamage = div;
                    break;
                }
            }
        }
    }


    const playerName = getPlayerName();
    let isPlayerWithCustomAvatar = false;
    let isAllyHeal = false;
    let playerAttackType = "none";
    let playerFireballColor = "green";

    if (!reversed) {
        if (hpDiff < 0) {
            isAllyHeal = true;
        }

        if (index >= 0 && index <= 4) {
            const playerTrackerSetting = settingsMap["tracker" + index];
            if (playerTrackerSetting && playerTrackerSetting.attackAnimation && playerTrackerSetting.attackAnimation !== "none") {
                playerAttackType = playerTrackerSetting.attackAnimation;
                playerFireballColor = playerTrackerSetting.fireballColor || "green";
            }
        }

        if (settingsMap.customAvatar.isTrue && playerName) {
            const container = document.querySelector(".BattlePanel_playersArea__vvwlB");
            if (container && container.children.length > 0) {
                const playersContainer = container.children[0];
                const casterElem = playersContainer.children[index];

                if (casterElem) {
                    const nameElem = casterElem.querySelector('.CombatUnit_name__1SlO1');
                    if (nameElem && nameElem.textContent.trim() === playerName) {
                        isPlayerWithCustomAvatar = true;
                    }
                }
            }
        }
    }

    let strokeWidth = '1px';
    let filterWidth = '1px';
    let explosionSize = 1;
    const hpDiffCoeff = hpDiff > 0 ? hpDiff : (-2*hpDiff);
    if (hpDiffCoeff >= 1000){
        strokeWidth = '5px';
        filterWidth = '6px';
        explosionSize = 6;
    } else if (hpDiffCoeff >= 700) {
        strokeWidth = '4px';
        filterWidth = '5px';
        explosionSize = 5;
    } else if (hpDiffCoeff >= 500) {
        strokeWidth = '3px';
        filterWidth = '4px';
        explosionSize = 4;
    } else if (hpDiffCoeff >= 300) {
        strokeWidth = '2px';
        filterWidth = '3px';
        explosionSize = 3;
    } else if (hpDiffCoeff >= 100) {
        filterWidth = '2px';
        explosionSize = 2;
    }

    const svg = document.getElementById('svg-container');

    if (reversed) {index = 6;}
    const trackerSetting = settingsMap["tracker"+index];
    const lineColor = "rgba("+trackerSetting.r+", "+trackerSetting.g+", "+trackerSetting.b+", 1)";
    const filterColor = "rgba("+trackerSetting.r+", "+trackerSetting.g+", "+trackerSetting.b+", 0.8)";
    let frameColor = undefined;
    let frameBorderColor = undefined;
    if (hpDiff > 0) {
        frameColor = "rgba("+trackerSetting.frameR+", "+trackerSetting.frameG+", "+trackerSetting.frameB+", 0.9)";
        frameBorderColor = "rgba("+trackerSetting.frameR+", "+trackerSetting.frameG+", "+trackerSetting.frameB+", 1)";
    }

    const pathD = createParabolaPath(startElem, endElem, reversed);

    if (playerAttackType !== "none" && !reversed && hpDiff >= 0) {
        if (hpDiff === 0) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.style.stroke = lineColor;
            path.style.strokeWidth = '1px';
            path.style.fill = 'none';
            path.style.opacity = '0.3';
            path.style.strokeDasharray = '5, 5';
            path.setAttribute('d', pathD);
            svg.appendChild(path);
            AnimationManager.addPath(path);
            const endXY = pathD.split(', ')[1].split(' ');
            const endPoint = { x: endXY[0], y: endXY[1] };
            setTimeout(() => {
                createMissEffect(hitDamage, endPoint, svg, true);
            }, 100);
            setTimeout(() => {
                path.style.transition = 'opacity 0.3s';
                path.style.opacity = '0';
                setTimeout(() => {
                    if (path.parentNode) svg.removeChild(path);
                    AnimationManager.removePath(path);
                }, 300);
            }, 600);
            return;
        }

        if (playerAttackType === "mage") {
            const fireball = createFireballAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed, playerFireballColor);
            AnimationManager.addPath(fireball);
            setTimeout(() => {
                const endXY = pathD.split(', ')[1].split(' ');
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, fireball, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, 500);
            return;
        }
        else if (playerAttackType === "ranged") {
            const arrow = createArrowAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed);
            AnimationManager.addPath(arrow);
            setTimeout(() => {
                const endXY = pathD.split(', ')[1].split(' ');
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, arrow, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, 500);
            return;
        }
        else if (playerAttackType === "melee") {
            const mace = createMaceSmashEffect(endElem, svg, trackerSetting);
            AnimationManager.addPath(mace);
            setTimeout(() => {
                const endXY = pathD.split(', ')[1].split(' ');
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, mace, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, 300);
            return;
        }
    }

    if (isPlayerWithCustomAvatar && hpDiff === 0) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.style.stroke = lineColor;
        path.style.strokeWidth = '1px';
        path.style.fill = 'none';
        path.style.opacity = '0.3';
        path.style.strokeDasharray = '5, 5';
        path.setAttribute('d', pathD);
        svg.appendChild(path);
        AnimationManager.addPath(path);
        const endXY = pathD.split(', ')[1].split(' ');
        const endPoint = { x: endXY[0], y: endXY[1] };
        setTimeout(() => {
            createMissEffect(hitDamage, endPoint, svg, true);
        }, 100);
        setTimeout(() => {
            path.style.transition = 'opacity 0.3s';
            path.style.opacity = '0';
            setTimeout(() => {
                if (path.parentNode) svg.removeChild(path);
                AnimationManager.removePath(path);
            }, 300);
        }, 600);

        return;
    }
    if (isPlayerWithCustomAvatar && hpDiff > 0) {
        const attackType = settingsMap.attackAnimation.value;

        if (attackType === "mage") {
            const fireball = createFireballAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed, "green");
            AnimationManager.addPath(fireball);
            setTimeout(() => {
                const endXY = pathD.split(', ')[1].split(' ');
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, fireball, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, 500);
        }
        else if (attackType === "ranged") {
            const arrow = createArrowAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed);
            AnimationManager.addPath(arrow);
            setTimeout(() => {
                const endXY = pathD.split(', ')[1].split(' ');
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, arrow, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, 500);
        }
        else if (attackType === "melee") {
            const mace = createMaceSmashEffect(endElem, svg, trackerSetting);
            AnimationManager.addPath(mace);
            setTimeout(() => {
                const endXY = pathD.split(', ')[1].split(' ');
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, mace, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, 300);
        }

        return;
    }
    if (isAllyHeal) {
        const healParticles = createHealingParticles(startElem, endElem, pathD, svg, trackerSetting);
        AnimationManager.addPath(healParticles);
        setTimeout(() => {
            if (hitTarget) {
                hitTarget.animate([
                    { filter: 'brightness(1) drop-shadow(0 0 0px transparent)' },
                    { filter: 'brightness(1.3) drop-shadow(0 0 15px #7dffb3)' },
                    { filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }
                ], {
                    duration: 800,
                    easing: 'ease-in-out'
                });
            }
        }, 300);

        return;
    }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    Object.assign(path.style, {
        stroke: lineColor,
        strokeWidth: strokeWidth,
        fill: 'none',
        strokeLinecap: 'round',
        filter: 'drop-shadow(0 0 '+filterWidth+' '+filterColor+')'
    });

    path.setAttribute('d', pathD);
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.opacity = '1';

    svg.appendChild(path);
    AnimationManager.addPath(path);
    const cleanUp = () => {
        try {
            if (path.parentNode) {
                svg.removeChild(path);
            }
            AnimationManager.removePath(path);
        } catch(e) {
        }
    };
    const endXY = pathD.split(', ')[1].split(' ');
    if (hpDiff === 0) {
        requestAnimationFrame(() => {
            path.style.transition = 'stroke-dashoffset 0.1s linear, opacity 0.3s linear';
            path.style.strokeDashoffset = '0';
            path.style.opacity = '0.4';
        });
        createMissEffect(hitDamage, null, svg, false);
    } else {
        requestAnimationFrame(() => {
            path.style.transition = 'stroke-dashoffset 0.1s linear';
            path.style.strokeDashoffset = '0';
            path.addEventListener('transitionend', () => {
                createHitEffect({x:endXY[0], y:endXY[1]}, svg, path, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
            }, {once: true});
        });
    }
    setTimeout(() => {
        path.style.transition = 'none';

        requestAnimationFrame(() => {
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = '0';

            path.style.transition = 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 1, 1)';
            path.style.strokeDashoffset = -length;

            const removeElement = () => {
                cleanUp();
                path.removeEventListener('transitionend', removeElement);
            };
            path.addEventListener('transitionend', removeElement);
        });
    }, 600);
    const forceCleanupTimer = setTimeout(cleanUp, 5000);
    path.addEventListener('transitionend', () => clearTimeout(forceCleanupTimer));
}

// Export to global scope for Tampermonkey
window.createEffect = createEffect;
window.getPlayerName = getPlayerName;
