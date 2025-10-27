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
            border: 1px solid rgba(67, 87, 175, 0.3);
            border-radius: 12px;
            padding: 24px;
            margin-top: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(67, 87, 175, 0.1);
            backdrop-filter: blur(10px);
        }

        /* Settings title */
        .settings-title {
            font-size: 18px;
            font-weight: 700;
            color: #4357af;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid rgba(67, 87, 175, 0.3);
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
            border-color: rgba(67, 87, 175, 0.3);
            box-shadow: 0 4px 12px rgba(67, 87, 175, 0.1);
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
            border-color: #4357af;
            box-shadow: 0 0 8px rgba(67, 87, 175, 0.3);
        }

        .tracker-option input[type="checkbox"]:checked {
            background: linear-gradient(135deg, #4357af, #2d3e7f);
            border-color: #4357af;
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
            padding: 28px;
            border: 1px solid rgba(67, 87, 175, 0.3);
            border-radius: 16px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(67, 87, 175, 0.2);
            z-index: 1000;
            backdrop-filter: blur(10px);
            min-width: 320px;
        }

        .color-picker-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .color-wheel-canvas {
            cursor: crosshair;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.02);
        }

        .rgb-display {
            color: #4ECDC4;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Courier New', monospace;
            padding: 8px 16px;
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.3);
            border-radius: 6px;
            text-align: center;
            margin-top: 8px;
        }

        .confirm-button, .cancel-button {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .confirm-button {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
            color: white;
            border: 1px solid rgba(76, 175, 80, 0.5);
        }

        .confirm-button:hover {
            background: linear-gradient(135deg, rgba(76, 175, 80, 1), rgba(56, 142, 60, 1));
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
            transform: translateY(-1px);
        }

        .cancel-button {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cancel-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
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

        /* Global Detection Mode Section */
        .global-detection-section {
            background: rgba(67, 87, 175, 0.1);
            border: 1px solid rgba(67, 87, 175, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }

        .global-detection-title {
            color: #4357af;
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .global-detection-options {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        /* Avatar Section */
        .avatar-section {
            background: rgba(78, 205, 196, 0.05);
            border: 1px solid rgba(78, 205, 196, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }

        /* My Character Color Section */
        .my-character-color-section {
            background: rgba(147, 51, 234, 0.05);
            border: 1px solid rgba(147, 51, 234, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }

        .avatar-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        .avatar-preview-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 150px;
            height: 150px;
            margin: 0 auto;
            border: 2px solid rgba(78, 205, 196, 0.3);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.3);
            overflow: hidden;
            position: relative;
        }

        .avatar-preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .avatar-placeholder {
            color: #666;
            font-size: 13px;
            text-align: center;
            font-style: italic;
        }

        /* Collapsible Card Styles */
        .settings-category-title {
            color: #4357af;
            font-size: 16px;
            font-weight: 600;
            margin: 24px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(67, 87, 175, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .collapsible-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .collapsible-card:hover {
            border-color: rgba(67, 87, 175, 0.3);
            box-shadow: 0 2px 8px rgba(67, 87, 175, 0.1);
        }

        .collapsible-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 16px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.03);
            transition: background 0.2s ease;
            user-select: none;
        }

        .collapsible-header:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .collapsible-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }

        .collapsible-title {
            color: #fff;
            font-size: 15px;
            font-weight: 600;
        }

        .collapsible-badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-auto {
            background: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
            border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .badge-manual {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
            border: 1px solid rgba(255, 193, 7, 0.3);
        }

        .you-badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(168, 85, 247, 0.3));
            color: #C084FC;
            border: 1px solid rgba(147, 51, 234, 0.5);
            box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
            animation: pulse-you 2s ease-in-out infinite;
        }

        @keyframes pulse-you {
            0%, 100% {
                box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
            }
            50% {
                box-shadow: 0 2px 12px rgba(147, 51, 234, 0.4);
            }
        }

        .collapsible-icon {
            color: #4357af;
            font-size: 18px;
            transition: transform 0.3s ease;
        }

        .collapsible-card.expanded .collapsible-icon {
            transform: rotate(180deg);
        }

        .collapsible-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .collapsible-card.expanded .collapsible-content {
            max-height: 600px;
        }

        .collapsible-inner {
            padding: 16px;
            background: rgba(0, 0, 0, 0.2);
        }

        /* Player card specific styles */
        .player-card {
            border-left: 3px solid;
        }

        .player-card.player-0 { border-left-color: rgb(255, 99, 132); }
        .player-card.player-1 { border-left-color: rgb(54, 162, 235); }
        .player-card.player-2 { border-left-color: rgb(255, 206, 86); }
        .player-card.player-3 { border-left-color: rgb(75, 192, 192); }
        .player-card.player-4 { border-left-color: rgb(153, 102, 255); }
        .player-card.enemy-card { border-left-color: rgb(255, 0, 0); }

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

            .avatar-preview-container {
                width: 120px;
                height: 120px;
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
