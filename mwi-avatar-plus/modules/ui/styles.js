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
        /* Main settings container */
        #tracker_settings {
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95));
            border: 1px solid rgba(255, 165, 0, 0.3);
            border-radius: 12px;
            padding: 24px;
            margin-top: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 165, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        /* Settings title */
        .settings-title {
            font-size: 18px;
            font-weight: 700;
            color: #ff9500;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid rgba(255, 165, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .settings-title::before {
            content: "⚙️";
            font-size: 22px;
        }

        /* Tracker option container */
        .tracker-option {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
        }

        .tracker-option:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 165, 0, 0.3);
            box-shadow: 0 4px 12px rgba(255, 165, 0, 0.1);
        }

        /* Checkbox styling */
        .tracker-option input[type="checkbox"] {
            appearance: none;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            margin-right: 10px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .tracker-option input[type="checkbox"]:hover {
            border-color: #ff9500;
            box-shadow: 0 0 8px rgba(255, 149, 0, 0.3);
        }

        .tracker-option input[type="checkbox"]:checked {
            background: linear-gradient(135deg, #ff9500, #ff6b00);
            border-color: #ff9500;
        }

        .tracker-option input[type="checkbox"]:checked::after {
            content: "✓";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            font-weight: bold;
        }

        /* Radio button styling */
        .tracker-option input[type="radio"] {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            margin-right: 6px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
        }

        .tracker-option input[type="radio"]:hover {
            border-color: #4ECDC4;
        }

        .tracker-option input[type="radio"]:checked {
            border-color: #4ECDC4;
            background: rgba(78, 205, 196, 0.2);
        }

        .tracker-option input[type="radio"]:checked::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ECDC4;
        }

        /* Labels */
        .tracker-option label {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
            user-select: none;
        }

        .tracker-option label:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .tracker-option label span {
            font-size: 14px;
        }

        /* Color preview */
        .color-preview {
            cursor: pointer;
            width: 32px;
            height: 32px;
            margin: 0 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .color-preview:hover {
            border-color: #4ECDC4;
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
        }

        /* Color label */
        .color-label {
            color: #999;
            font-size: 13px;
            margin-left: 4px;
        }

        /* Section styling */
        .settings-section {
            background: rgba(255, 255, 255, 0.02);
            border-left: 3px solid #4ECDC4;
            padding: 12px 16px;
            margin: 12px 0;
            border-radius: 4px;
        }

        .section-title {
            color: #FFD700;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-content {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }

        /* Button styling */
        .settings-button {
            padding: 8px 16px;
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
            color: white;
            border: 1px solid rgba(76, 175, 80, 0.5);
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
        }

        .settings-button:hover {
            background: linear-gradient(135deg, rgba(76, 175, 80, 1), rgba(56, 142, 60, 1));
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
            transform: translateY(-1px);
        }

        .settings-button:active {
            transform: translateY(0);
        }

        /* File name display */
        .file-status {
            color: #888;
            font-size: 12px;
            font-style: italic;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .file-status.active {
            color: #4ECDC4;
            border-color: rgba(78, 205, 196, 0.3);
            background: rgba(78, 205, 196, 0.1);
        }

        /* Color picker modal */
        .color-picker-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.98), rgba(20, 20, 30, 0.98));
            padding: 24px;
            border: 1px solid rgba(255, 165, 0, 0.3);
            border-radius: 12px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 165, 0, 0.2);
            z-index: 1000;
            backdrop-filter: blur(10px);
        }

        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999;
            backdrop-filter: blur(4px);
        }

        .modal-actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }

        /* Disabled state */
        .settings-section.disabled {
            opacity: 0.4;
            pointer-events: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            #tracker_settings {
                padding: 16px;
            }
            
            .tracker-option {
                padding: 12px;
            }
            
            .section-content {
                flex-direction: column;
                align-items: flex-start;
            }
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
