/**
 * Avatar mutation observer - watches for DOM changes to apply custom avatars
 */

let avatarObserverTimeout = null;
const avatarObserver = new MutationObserver(() => {
    if (!settingsMap.customAvatar.isTrue || !settingsMap.customAvatar.avatarUrl) return;

    if (avatarObserverTimeout) {
        clearTimeout(avatarObserverTimeout);
    }

    avatarObserverTimeout = setTimeout(() => {
        applyCustomAvatar();
    }, 100);
});

/**
 * Start observing the game page for avatar changes
 */
function observeForAvatars() {
    const targetNode = document.querySelector('.GamePage_gamePage__ixiPl');
    if (targetNode) {
        avatarObserver.observe(targetNode, {
            childList: true,
            subtree: true
        });
        setTimeout(applyCustomAvatar, 500);
    } else {
        setTimeout(observeForAvatars, 500);
    }
}

// Export to global scope for Tampermonkey
window.observeForAvatars = observeForAvatars;
