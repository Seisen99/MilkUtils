/**
 * Settings panel UI generation and management
 */

/**
 * Wait for the settings panel to be available and inject our settings
 */
function waitForSetttins() {
    const targetNode = document.querySelector("div.SettingsPanel_profileTab__214Bj");
    if (targetNode) {
        if (!targetNode.querySelector("#tracker_settings")) {
            targetNode.insertAdjacentHTML("beforeend", `<div id="tracker_settings"></div>`);
            const insertElem = targetNode.querySelector("div#tracker_settings");
            insertElem.insertAdjacentHTML(
                "beforeend",
                `<div class="settings-title">${
                    isZH ? "MWI-Avatar-Plus 设置" : "MWI-Avatar-Plus Settings"
                }</div>`
            );

            for (const setting of Object.values(settingsMap)) {
                if (setting.id === "customAvatar") {
                    createCustomAvatarSetting(insertElem, setting);
                } else if (/^tracker\d$/.test(setting.id)){
                    createTrackerSetting(insertElem, setting);
                }else{
                    createSimpleSetting(insertElem, setting);
                }
            }

            insertElem.addEventListener("change", saveSettings);
        }
    }
    setTimeout(waitForSetttins, 500);
}

/**
 * Create custom avatar setting UI
 */
function createCustomAvatarSetting(insertElem, setting) {
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="tracker-option">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
                <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.desc}</span>
                <input type="file" id="avatar-file-input" accept="image/*" style="display:none">
                <button id="select-avatar-btn" class="settings-button">${isZH ? "📷 选择图片" : "📷 Select Image"}</button>
                <span id="avatar-file-name" class="file-status ${setting.avatarUrl ? 'active' : ''}">${setting.avatarUrl ? (isZH ? "✓ 已设置" : "✓ Set") : (isZH ? "未选择" : "No file")}</span>
            </div>
        </div>`
    );

    setTimeout(() => {
        const fileInput = document.getElementById('avatar-file-input');
        const selectBtn = document.getElementById('select-avatar-btn');
        const fileName = document.getElementById('avatar-file-name');

        if (selectBtn && fileInput && fileName) {
            selectBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        settingsMap.customAvatar.avatarUrl = event.target.result;
                        localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                        fileName.textContent = isZH ? `✓ ${file.name}` : `✓ ${file.name}`;
                        fileName.classList.add('active');
                        appliedAvatars.clear();
                        setTimeout(applyCustomAvatar, 200);
                        showToast(isZH ? '头像已更新！' : 'Avatar updated!', 3000);
                    };
                    reader.onerror = (error) => {
                        showToast(isZH ? '读取文件失败' : 'Failed to read file', 3000);
                    };
                    reader.readAsDataURL(file);
                }
            });

            if (settingsMap.customAvatar.avatarUrl) {
                fileName.textContent = isZH ? '✓ 已设置（点击重新选择）' : '✓ Set (click to change)';
                fileName.classList.add('active');
            }
        }
    }, 100);
}

/**
 * Create tracker setting UI (for players and enemies)
 */
function createTrackerSetting(insertElem, setting) {
    const isPlayerTracker = setting.id !== "tracker6";

    let htmlContent = `<div class="tracker-option">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
            <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
            <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.desc}</span>
            <input type="checkbox" data-number="${setting.id}" data-param="isTrueH" ${setting.isTrueH ? "checked" : ""}></input>
            <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.descH}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <div class="color-preview" id="colorPreview_${setting.id}"></div>
            <span class="color-label">${isZH ? "线条颜色" : "Line Color"}</span>
            <div class="color-preview" id="colorPreviewFrame_${setting.id}"></div>
            <span class="color-label">${isZH ? "伤害框颜色" : "Damage Frame Color"}</span>
        </div>`;

    if (isPlayerTracker) {
        htmlContent += `
        <div class="settings-section">
            <div class="section-title">
                ${isZH ? "🎯 检测模式" : "🎯 Detection Mode"}
            </div>
            <div class="section-content">
                <label>
                    <input type="radio" name="detectionMode_${setting.id}" value="manual" ${setting.detectionMode === "manual" ? "checked" : ""}>
                    <span>🎮 ${isZH ? "手动" : "Manual"}</span>
                </label>
                <label>
                    <input type="radio" name="detectionMode_${setting.id}" value="auto" ${setting.detectionMode === "auto" ? "checked" : ""}>
                    <span>🤖 ${isZH ? "自动" : "Auto"}</span>
                </label>
            </div>
        </div>
        <div id="manualSettings_${setting.id}" class="settings-section ${setting.detectionMode === "auto" ? "disabled" : ""}">
            <div class="section-title">
                ${isZH ? "⚔️ 动画类型" : "⚔️ Animation Type"}
            </div>
            <div class="section-content" style="margin-bottom: 12px;">
                <label>
                    <input type="radio" name="attackType_${setting.id}" value="none" ${setting.attackAnimation === "none" ? "checked" : ""}>
                    <span>❌ ${isZH ? "无" : "None"}</span>
                </label>
                <label>
                    <input type="radio" name="attackType_${setting.id}" value="melee" ${setting.attackAnimation === "melee" ? "checked" : ""}>
                    <span>⚔️ ${isZH ? "近战" : "Melee"}</span>
                </label>
                <label>
                    <input type="radio" name="attackType_${setting.id}" value="ranged" ${setting.attackAnimation === "ranged" ? "checked" : ""}>
                    <span>🏹 ${isZH ? "远程" : "Ranged"}</span>
                </label>
                <label>
                    <input type="radio" name="attackType_${setting.id}" value="mage" ${setting.attackAnimation === "mage" ? "checked" : ""}>
                    <span>🔮 ${isZH ? "法师" : "Mage"}</span>
                </label>
            </div>
            <div class="section-title" style="margin-top: 12px;">
                ${isZH ? "🎨 火球颜色" : "🎨 Fireball Color"}
            </div>
            <div class="section-content">
                <label>
                    <input type="radio" name="fireballColor_${setting.id}" value="green" ${setting.fireballColor === "green" ? "checked" : ""}>
                    <span style="color: #70e000;">🟢 ${isZH ? "绿色" : "Green"}</span>
                </label>
                <label>
                    <input type="radio" name="fireballColor_${setting.id}" value="red" ${setting.fireballColor === "red" ? "checked" : ""}>
                    <span style="color: #ff4d4d;">🔴 ${isZH ? "红色" : "Red"}</span>
                </label>
                <label>
                    <input type="radio" name="fireballColor_${setting.id}" value="blue" ${setting.fireballColor === "blue" ? "checked" : ""}>
                    <span style="color: #4d9eff;">🔵 ${isZH ? "蓝色" : "Blue"}</span>
                </label>
            </div>
        </div>`;
    }

    htmlContent += `</div>`;

    insertElem.insertAdjacentHTML("beforeend", htmlContent);

    // Setup color pickers
    const colorPreview = document.getElementById('colorPreview_'+setting.id);
    let currentColor = { r: setting.r, g: setting.g, b: setting.b };

    colorPreview.addEventListener('click', () => {
        const settingColor = { r: settingsMap[setting.id].r, g: settingsMap[setting.id].g, b: settingsMap[setting.id].b }
        const modal = createColorPicker(settingColor, (newColor) => {
            currentColor = newColor;
            settingsMap[setting.id].r = newColor.r;
            settingsMap[setting.id].g = newColor.g;
            settingsMap[setting.id].b = newColor.b;
            localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
            updatePreview();
        }, isZH ? "线条颜色" : "Line Color", setting.id);
        document.body.appendChild(modal);
    });

    const colorPreviewFrame = document.getElementById('colorPreviewFrame_'+setting.id);
    let currentFrameColor = { r: setting.frameR, g: setting.frameG, b: setting.frameB };

    colorPreviewFrame.addEventListener('click', () => {
        const settingFrameColor = { r: settingsMap[setting.id].frameR, g: settingsMap[setting.id].frameG, b: settingsMap[setting.id].frameB }
        const modal = createColorPicker(settingFrameColor, (newColor) => {
            currentFrameColor = newColor;
            settingsMap[setting.id].frameR = newColor.r;
            settingsMap[setting.id].frameG = newColor.g;
            settingsMap[setting.id].frameB = newColor.b;
            localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
            updatePreview();
        }, isZH ? "伤害框颜色" : "Damage Frame Color", setting.id);
        document.body.appendChild(modal);
    });

    function updatePreview() {
        colorPreview.style.backgroundColor = `rgb(${currentColor.r},${currentColor.g},${currentColor.b})`;
        colorPreviewFrame.style.backgroundColor = `rgb(${currentFrameColor.r},${currentFrameColor.g},${currentFrameColor.b})`;
    }

    updatePreview();

    if (isPlayerTracker) {
        setTimeout(() => {
            // Detection mode toggle
            const detectionRadios = document.querySelectorAll(`input[name="detectionMode_${setting.id}"]`);
            detectionRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    settingsMap[setting.id].detectionMode = e.target.value;
                    
                    // Toggle disabled state for manual settings
                    const manualDiv = document.getElementById(`manualSettings_${setting.id}`);
                    if (e.target.value === "auto") {
                        manualDiv.classList.add("disabled");
                    } else {
                        manualDiv.classList.remove("disabled");
                    }
                    
                    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                });
            });

            const attackRadios = document.querySelectorAll(`input[name="attackType_${setting.id}"]`);
            attackRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    settingsMap[setting.id].attackAnimation = e.target.value;
                    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                });
            });

            const colorRadios = document.querySelectorAll(`input[name="fireballColor_${setting.id}"]`);
            colorRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    settingsMap[setting.id].fireballColor = e.target.value;
                    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                });
            });
        }, 100);
    }
}

/**
 * Create simple checkbox setting
 */
function createSimpleSetting(insertElem, setting) {
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="tracker-option">
            <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
            <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.desc}</span>
        </div>`
    );
}

// Export to global scope for Tampermonkey
window.waitForSetttins = waitForSetttins;
