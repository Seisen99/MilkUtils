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
                } else {
                    settingsMap[option.id].isTrue = option.isTrue;
                    if (option.isTrueH !== undefined) settingsMap[option.id].isTrueH = option.isTrueH;
                    if (option.r !== undefined) settingsMap[option.id].r = option.r;
                    if (option.g !== undefined) settingsMap[option.id].g = option.g;
                    if (option.b !== undefined) settingsMap[option.id].b = option.b;
                    if (option.frameR !== undefined) settingsMap[option.id].frameR = option.frameR;
                    if (option.frameG !== undefined) settingsMap[option.id].frameG = option.frameG;
                    if (option.frameB !== undefined) settingsMap[option.id].frameB = option.frameB;
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
