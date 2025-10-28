/**
 * Custom avatar management
 */

let isApplyingAvatar = false;
const appliedAvatars = new Set();
let lastBattlePanel = null;

/**
 * Get the current player's name
 * @returns {string|null} Player name or null
 */
function getPlayerName() {
    const nameElement = document.querySelector('.CharacterName_name__1amXp[data-name]');
    return nameElement ? nameElement.getAttribute('data-name') : null;
}

/**
 * Apply custom avatar to player avatars across the UI
 */
function applyCustomAvatar() {
    if (isApplyingAvatar) return;
    isApplyingAvatar = true;

    try {
        if (!settingsMap.customAvatar.isTrue || !settingsMap.customAvatar.avatarUrl) {
            return;
        }

        const playerName = getPlayerName();

        if (!playerName) {
            setTimeout(() => {
                isApplyingAvatar = false;
                applyCustomAvatar();
            }, 500);
            return;
        }

        const applyToAvatar = (avatar, location) => {
            if (!avatar) return false;

            if (!avatar._avatarId) {
                avatar._avatarId = 'avatar_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
            }

            const avatarKey = location + '-' + avatar._avatarId;
            if (appliedAvatars.has(avatarKey)) {
                return false;
            }

            // Check if using spritesheet animations (requires custom avatar to be enabled too)
            const useSpritesheet = settingsMap.customAvatar.isTrue &&
                                   settingsMap.spritesheetAvatar && 
                                   settingsMap.spritesheetAvatar.enabled && 
                                   settingsMap.spritesheetAvatar.idleUrl;

            if (useSpritesheet) {
                // Use SpriteAnimator for animated avatars
                const config = {
                    idle: {
                        url: settingsMap.spritesheetAvatar.idleUrl,
                        frames: settingsMap.spritesheetAvatar.idleFrames || 6,
                        frameWidth: settingsMap.spritesheetAvatar.frameWidth || 231,
                        frameHeight: settingsMap.spritesheetAvatar.frameHeight || 190,
                        duration: settingsMap.spritesheetAvatar.idleDuration || 600,
                        loop: true
                    },
                    cast: {
                        url: settingsMap.spritesheetAvatar.castUrl || settingsMap.spritesheetAvatar.idleUrl,
                        frames: settingsMap.spritesheetAvatar.castFrames || 8,
                        frameWidth: settingsMap.spritesheetAvatar.frameWidth || 231,
                        frameHeight: settingsMap.spritesheetAvatar.frameHeight || 190,
                        duration: settingsMap.spritesheetAvatar.castDuration || 800,
                        loop: false
                    }
                };

                SpriteAnimator.createSpritesheetAvatar(avatar, config);
                appliedAvatars.add(avatarKey);
                return true;
            } else if (settingsMap.customAvatar.isTrue && settingsMap.customAvatar.avatarUrl) {
                // Use simple image for static avatars
                let img = avatar.querySelector('img.custom-avatar-img');
                const avatarInner = avatar.querySelector('.FullAvatar_avatar__2w8kS');
                const outfitInner = avatar.querySelector('.FullAvatar_avatarOutfit__3GHXg');

                if (!img) {
                    img = document.createElement('img');
                    img.className = 'custom-avatar-img';
                    img.style.cssText = `
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 1;
                        border-radius: inherit;
                        pointer-events: none;
                    `;

                    avatar.style.position = 'relative';
                    avatar.style.overflow = 'visible';

                    if (avatarInner) avatarInner.style.display = 'none';
                    if (outfitInner) outfitInner.style.display = 'none';

                    avatar.insertBefore(img, avatar.firstChild);
                }

                if (img && img.src !== settingsMap.customAvatar.avatarUrl) {
                    img.src = settingsMap.customAvatar.avatarUrl;
                    img.style.zIndex = '1';

                    if (avatarInner) avatarInner.style.display = 'none';
                    if (outfitInner) outfitInner.style.display = 'none';

                    avatar.style.overflow = 'visible';

                    appliedAvatars.add(avatarKey);
                    return true;
                }

                return false;
            } else {
                // No custom avatar configured, keep default avatar visible
                return false;
            }
        };

        // Apply to header avatar
        const headerAvatar = document.querySelector('.Header_header__1DxsV .FullAvatar_fullAvatar__3RB2h');
        applyToAvatar(headerAvatar, 'header');

        // Apply to Party panel
        const partyPanel = document.querySelector('.Party_partySlots__3zGeH');
        if (partyPanel) {
            const partySlots = partyPanel.querySelectorAll('.Party_partySlot__1xuiq');
            partySlots.forEach((slot, idx) => {
                const nameElem = slot.querySelector('.CharacterName_name__1amXp[data-name]');
                if (nameElem) {
                    const slotPlayerName = nameElem.getAttribute('data-name');
                    if (slotPlayerName === playerName) {
                        const avatar = slot.querySelector('.FullAvatar_fullAvatar__3RB2h');
                        if (avatar) {
                            applyToAvatar(avatar, 'party-slot-' + idx);
                        }
                    }
                }
            });
        }

        // Apply to Battle panel
        const battlePanel = document.querySelector('.BattlePanel_playersArea__vvwlB');

        if (battlePanel && battlePanel !== lastBattlePanel) {
            const keysToDelete = Array.from(appliedAvatars).filter(key =>
                key.startsWith('combat-player-') || key.startsWith('combat-avatar-')
            );
            keysToDelete.forEach(key => appliedAvatars.delete(key));
            lastBattlePanel = battlePanel;
        }

        if (battlePanel) {
            const allCombatNames = battlePanel.querySelectorAll('.CombatUnit_name__1SlO1');

            allCombatNames.forEach((nameElem, index) => {
                const nameText = nameElem.textContent.trim();

                if (nameText === playerName) {
                    let combatUnit = nameElem.closest('.CombatUnit_combatUnit__1G_Qp');

                    if (!combatUnit) {
                        combatUnit = nameElem.parentElement;
                        let maxAttempts = 5;
                        while (combatUnit && maxAttempts > 0) {
                            const avatar = combatUnit.querySelector('.FullAvatar_fullAvatar__3RB2h');
                            if (avatar) {
                                applyToAvatar(avatar, 'combat-player-' + index);
                                break;
                            }
                            combatUnit = combatUnit.parentElement;
                            maxAttempts--;
                        }
                    } else {
                        const avatar = combatUnit.querySelector('.FullAvatar_fullAvatar__3RB2h');

                        if (avatar) {
                            applyToAvatar(avatar, 'combat-player-' + index);
                        }
                    }
                }
            });

            const allPlayerAvatars = battlePanel.querySelectorAll('.FullAvatar_fullAvatar__3RB2h');

            allPlayerAvatars.forEach((avatar, idx) => {
                const combatUnit = avatar.closest('.CombatUnit_combatUnit__1G_Qp');
                if (combatUnit) {
                    const nameElem = combatUnit.querySelector('.CombatUnit_name__1SlO1');
                    if (nameElem) {
                        const name = nameElem.textContent.trim();
                        if (name === playerName) {
                            applyToAvatar(avatar, 'combat-avatar-' + idx);
                        }
                    }
                }
            });
        }

    } finally {
        isApplyingAvatar = false;
    }
}

// Export to global scope for Tampermonkey
window.getPlayerName = getPlayerName;
window.appliedAvatars = appliedAvatars;
window.applyCustomAvatar = applyCustomAvatar;
