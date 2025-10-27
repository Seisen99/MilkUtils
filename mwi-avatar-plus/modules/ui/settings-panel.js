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
                `<div style="float: left; color: orange">${
                    isZH ? "MWI-Avatar-Plus 设置 ：" : "MWI-Avatar-Plus Settings: "
                }</div></br>`
            );

            for (const setting of Object.values(settingsMap)) {
                if (setting.id === "customAvatar") {
                    createCustomAvatarSetting(insertElem, setting);
                } else if (setting.id === "attackAnimation") {
                    createAttackAnimationSetting(insertElem, setting);
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
        `<div class="tracker-option" style="margin-bottom: 10px;">
            <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
            <span style="margin-right:10px">${setting.desc}</span>
            <input type="file" id="avatar-file-input" accept="image/*" style="display:none">
            <button id="select-avatar-btn" style="padding: 4px 12px; background: rgba(76, 175, 80, 0.8); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 8px;">${isZH ? "选择图片" : "Select Image"}</button>
            <span id="avatar-file-name" style="color: #888; font-size: 11px; font-style: italic;">${setting.avatarUrl ? (isZH ? "已设置" : "Set") : (isZH ? "未选择" : "No file")}</span>
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
                        fileName.textContent = file.name;
                        fileName.style.color = '#4ECDC4';
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
                fileName.textContent = isZH ? '已设置（点击重新选择）' : 'Set (click to change)';
                fileName.style.color = '#4ECDC4';
            }
        }
    }, 100);
}

/**
 * Create attack animation setting UI
 */
function createAttackAnimationSetting(insertElem, setting) {
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="tracker-option" style="margin-bottom: 10px;">
            <span style="margin-right:10px; color: #4ECDC4; font-weight: 600;">${setting.desc}:</span>
            <label style="margin-right: 15px; cursor: pointer;">
                <input type="radio" name="attackType" value="melee" ${setting.value === "melee" ? "checked" : ""}>
                <span style="color: white;">⚔️ ${isZH ? "近战" : "Melee"}</span>
            </label>
            <label style="margin-right: 15px; cursor: pointer;">
                <input type="radio" name="attackType" value="ranged" ${setting.value === "ranged" ? "checked" : ""}>
                <span style="color: white;">🏹 ${isZH ? "远程" : "Ranged"}</span>
            </label>
            <label style="cursor: pointer;">
                <input type="radio" name="attackType" value="mage" ${setting.value === "mage" ? "checked" : ""}>
                <span style="color: white;">🔮 ${isZH ? "法师" : "Mage"}</span>
            </label>
        </div>`
    );

    setTimeout(() => {
        const radioButtons = document.querySelectorAll('input[name="attackType"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                settingsMap.attackAnimation.value = e.target.value;
                localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
            });
        });
    }, 100);
}

/**
 * Create tracker setting UI (for players and enemies)
 */
function createTrackerSetting(insertElem, setting) {
    const isPlayerTracker = setting.id !== "tracker6";

    let htmlContent = `<div class="tracker-option" style="margin-bottom: 15px;">
        <div style="margin-bottom: 5px;">
            <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
            <span style="margin-right:5px">${setting.desc}</span>
            <input type="checkbox" data-number="${setting.id}" data-param="isTrueH" ${setting.isTrueH ? "checked" : ""}></input>
            <span style="margin-right:5px">${setting.descH}</span>
            <div class="color-preview" id="colorPreview_${setting.id}"></div>${isZH ? "←线条颜色" : "←line color"}
            <div class="color-preview" id="colorPreviewFrame_${setting.id}" style="margin-left:10px"></div>${isZH ? "←伤害框颜色" : "←damage frame color"}
        </div>`;

    if (isPlayerTracker) {
        htmlContent += `
        <div style="margin-left: 20px; margin-top: 8px; margin-bottom: 8px;">
            <span style="color: #FFD700; font-weight: 600; margin-right: 10px;">${isZH ? "检测模式:" : "Detection Mode:"}</span>
            <label style="margin-right: 15px; cursor: pointer;">
                <input type="radio" name="detectionMode_${setting.id}" value="manual" ${setting.detectionMode === "manual" ? "checked" : ""}>
                <span style="color: white;">🎮 ${isZH ? "手动" : "Manual"}</span>
            </label>
            <label style="cursor: pointer;">
                <input type="radio" name="detectionMode_${setting.id}" value="auto" ${setting.detectionMode === "auto" ? "checked" : ""}>
                <span style="color: white;">🤖 ${isZH ? "自动" : "Auto"}</span>
            </label>
        </div>
        <div id="manualSettings_${setting.id}" style="margin-left: 20px; margin-top: 5px; ${setting.detectionMode === "auto" ? "opacity: 0.4; pointer-events: none;" : ""}">
            <span style="color: #4ECDC4; font-weight: 500; margin-right: 10px;">${isZH ? "动画类型:" : "Animation:"}</span>
            <label style="margin-right: 10px; cursor: pointer;">
                <input type="radio" name="attackType_${setting.id}" value="none" ${setting.attackAnimation === "none" ? "checked" : ""}>
                <span style="color: white;">❌ ${isZH ? "无" : "None"}</span>
            </label>
            <label style="margin-right: 10px; cursor: pointer;">
                <input type="radio" name="attackType_${setting.id}" value="melee" ${setting.attackAnimation === "melee" ? "checked" : ""}>
                <span style="color: white;">⚔️ ${isZH ? "近战" : "Melee"}</span>
            </label>
            <label style="margin-right: 10px; cursor: pointer;">
                <input type="radio" name="attackType_${setting.id}" value="ranged" ${setting.attackAnimation === "ranged" ? "checked" : ""}>
                <span style="color: white;">🏹 ${isZH ? "远程" : "Ranged"}</span>
            </label>
            <label style="margin-right: 15px; cursor: pointer;">
                <input type="radio" name="attackType_${setting.id}" value="mage" ${setting.attackAnimation === "mage" ? "checked" : ""}>
                <span style="color: white;">🔮 ${isZH ? "法师" : "Mage"}</span>
            </label>

            <span style="color: #4ECDC4; font-weight: 500; margin-right: 10px;">${isZH ? "火球颜色:" : "Fireball Color:"}</span>
            <label style="margin-right: 10px; cursor: pointer;">
                <input type="radio" name="fireballColor_${setting.id}" value="green" ${setting.fireballColor === "green" ? "checked" : ""}>
                <span style="color: #70e000;">🟢 ${isZH ? "绿色" : "Green"}</span>
            </label>
            <label style="margin-right: 10px; cursor: pointer;">
                <input type="radio" name="fireballColor_${setting.id}" value="red" ${setting.fireballColor === "red" ? "checked" : ""}>
                <span style="color: #ff4d4d;">🔴 ${isZH ? "红色" : "Red"}</span>
            </label>
            <label style="cursor: pointer;">
                <input type="radio" name="fireballColor_${setting.id}" value="blue" ${setting.fireballColor === "blue" ? "checked" : ""}>
                <span style="color: #4d9eff;">🔵 ${isZH ? "蓝色" : "Blue"}</span>
            </label>
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
                    
                    // Gray out manual settings if auto is selected
                    const manualDiv = document.getElementById(`manualSettings_${setting.id}`);
                    if (e.target.value === "auto") {
                        manualDiv.style.opacity = "0.4";
                        manualDiv.style.pointerEvents = "none";
                    } else {
                        manualDiv.style.opacity = "1";
                        manualDiv.style.pointerEvents = "auto";
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
        `<div class="tracker-option"><input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
    <span style="margin-right:5px">${setting.desc}</span></div>`
    );
}

// Export to global scope for Tampermonkey
window.waitForSetttins = waitForSetttins;
