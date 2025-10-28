/**
 * Settings management - read/save from localStorage
 */

/**
 * Read settings from localStorage and merge with defaults
 */
function readSettings() {
    const ls = localStorage.getItem("tracker_settingsMap");
    if (ls) {
        const lsObj = JSON.parse(ls);
        for (const option of Object.values(lsObj)) {
            if (settingsMap.hasOwnProperty(option.id)) {
                if (option.id === "customAvatar") {
                    settingsMap[option.id].isTrue = option.isTrue !== undefined ? option.isTrue : false;
                    settingsMap[option.id].avatarUrl = option.avatarUrl || "";
                } else if (option.id === "spritesheetAvatar") {
                    settingsMap[option.id].enabled = option.enabled !== undefined ? option.enabled : false;
                    settingsMap[option.id].idleUrl = option.idleUrl || "";
                    settingsMap[option.id].castUrl = option.castUrl || "";
                    settingsMap[option.id].idleFrames = option.idleFrames || 6;
                    settingsMap[option.id].castFrames = option.castFrames || 8;
                    settingsMap[option.id].frameWidth = option.frameWidth || 231;
                    settingsMap[option.id].frameHeight = option.frameHeight || 190;
                    settingsMap[option.id].idleDuration = option.idleDuration || 600;
                    settingsMap[option.id].castDuration = option.castDuration || 800;
                } else {
                    settingsMap[option.id].isTrue = option.isTrue;
                    if (option.isTrueH !== undefined) settingsMap[option.id].isTrueH = option.isTrueH;
                    if (option.r !== undefined) settingsMap[option.id].r = option.r;
                    if (option.g !== undefined) settingsMap[option.id].g = option.g;
                    if (option.b !== undefined) settingsMap[option.id].b = option.b;
                    
                    // Auto-sync frame colors with line colors (unified color system)
                    if (option.frameR !== undefined) settingsMap[option.id].frameR = option.frameR;
                    else if (option.r !== undefined) settingsMap[option.id].frameR = option.r;
                    
                    if (option.frameG !== undefined) settingsMap[option.id].frameG = option.frameG;
                    else if (option.g !== undefined) settingsMap[option.id].frameG = option.g;
                    
                    if (option.frameB !== undefined) settingsMap[option.id].frameB = option.frameB;
                    else if (option.b !== undefined) settingsMap[option.id].frameB = option.b;
                    
                    if (option.detectionMode !== undefined) settingsMap[option.id].detectionMode = option.detectionMode;
                    if (option.attackAnimation !== undefined) settingsMap[option.id].attackAnimation = option.attackAnimation;
                    if (option.fireballColor !== undefined) settingsMap[option.id].fireballColor = option.fireballColor;
                }
            }
        }
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    for (const checkbox of document.querySelectorAll("div#tracker_settings input[type='checkbox']")) {
        settingsMap[checkbox.dataset.number][checkbox.dataset.param] = checkbox.checked;
        localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
    }
    appliedAvatars.clear();
    setTimeout(applyCustomAvatar, 200);
}

// Export to global scope for Tampermonkey
window.readSettings = readSettings;
window.saveSettings = saveSettings;
