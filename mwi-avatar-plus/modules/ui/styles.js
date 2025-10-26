/**
 * CSS styles injection
 */

/**
 * Inject Party Info panel avatar z-index fix
 */
function injectPartyAvatarStyles() {
    const partyAvatarStyle = document.createElement('style');
    partyAvatarStyle.id = 'mwi-avatar-plus-party-zindex';
    partyAvatarStyle.textContent = `
        /* Fix z-index layering specifically for Party Info panel */
        .Party_partyInfo__3eK97 .Party_partySlot__1xuiq {
            position: relative;
            z-index: 1;
        }

        .Party_partyInfo__3eK97 .Party_avatar__2ZZwM {
            position: relative;
            z-index: 0;
        }

        .Party_partyInfo__3eK97 .Party_avatar__2ZZwM .custom-avatar-img {
            z-index: 2 !important;
        }

        .Party_partyInfo__3eK97 .Party_partyButtons__2aRgc {
            position: relative;
            z-index: 10;
        }
    `;

    if (!document.getElementById('mwi-avatar-plus-party-zindex')) {
        document.head.appendChild(partyAvatarStyle);
    }
}

/**
 * Inject settings panel styles
 */
function injectSettingsPanelStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .tracker-option {
          display: flex;
          align-items: center;
        }

        .color-preview {
            cursor: pointer;
            width: 20px;
            height: 20px;
            margin: 3px 3px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }

        .color-picker-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.5);
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            z-index: 1000;
        }

        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        }

        .modal-actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize all styles
 */
function initializeStyles() {
    injectPartyAvatarStyles();
    injectSettingsPanelStyles();
}

// Export to global scope for Tampermonkey
window.initializeStyles = initializeStyles;
