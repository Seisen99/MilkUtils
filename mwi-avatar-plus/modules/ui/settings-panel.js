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
            
            // Main title
            insertElem.insertAdjacentHTML(
                "beforeend",
                `<div class="settings-title">${
                    isZH ? "MWI-Avatar-Plus 设置" : "MWI-Avatar-Plus Settings"
                }</div>`
            );

            // Custom Avatar Section
            createCustomAvatarSectionNew(insertElem, settingsMap.customAvatar);

            // Spritesheet Avatar Section
            createSpritesheetAvatarSection(insertElem, settingsMap.spritesheetAvatar);

            // My Character Color Section
            createMyCharacterColorSection(insertElem, settingsMap.myCharacterColor);

            // Player Animation Settings Category
            insertElem.insertAdjacentHTML(
                "beforeend",
                `<div class="settings-category-title">🎬 ${isZH ? "玩家动画设置" : "Player Animation Settings"}</div>`
            );

            // Animation Auto-Detection Section (inside Player section)
            createGlobalDetectionModeSection(insertElem);

            // Player cards (tracker0-4)
            for (let i = 0; i <= 4; i++) {
                const setting = settingsMap[`tracker${i}`];
                if (setting) {
                    createCollapsiblePlayerCard(insertElem, setting, i);
                }
            }

            // Enemy card (tracker6)
            if (settingsMap.tracker6) {
                createCollapsibleEnemyCard(insertElem, settingsMap.tracker6);
            }

            // Other Settings Category (collapsible)
            createOtherSettingsSection(insertElem);

            insertElem.addEventListener("change", saveSettings);
        }
    }
    setTimeout(waitForSetttins, 500);
}

/**
 * Create Animation Auto-Detection section
 */
function createGlobalDetectionModeSection(insertElem) {
    const currentMode = getGlobalDetectionMode();
    
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="global-detection-section" style="margin-top: 0; margin-bottom: 16px;">
            <div class="global-detection-title">⚡ ${isZH ? "动画自动检测" : "Animation Auto-Detection"}</div>
            <p style="color: #999; font-size: 12px; margin: 8px 0 12px 0;">
                ${isZH ? "应用于所有玩家：" : "Apply to all players:"}
            </p>
            <div class="global-detection-options">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="globalDetectionMode" value="manual" ${currentMode === 'manual' ? 'checked' : ''}>
                    <span style="color: white; font-size: 14px;">🎮 ${isZH ? "手动设置" : "Manual (Set Below)"}</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="radio" name="globalDetectionMode" value="auto" ${currentMode === 'auto' ? 'checked' : ''}>
                    <span style="color: white; font-size: 14px;">⚡ ${isZH ? "自动检测技能" : "Auto-Detect Abilities"}</span>
                </label>
            </div>
        </div>`
    );

    setTimeout(() => {
        const radios = document.querySelectorAll('input[name="globalDetectionMode"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                setGlobalDetectionMode(e.target.value);
            });
        });
    }, 100);
}

/**
 * Get current global detection mode (based on majority of players)
 */
function getGlobalDetectionMode() {
    let autoCount = 0;
    let manualCount = 0;
    
    for (let i = 0; i <= 4; i++) {
        const tracker = settingsMap[`tracker${i}`];
        if (tracker && tracker.detectionMode === 'auto') {
            autoCount++;
        } else {
            manualCount++;
        }
    }
    
    return autoCount > manualCount ? 'auto' : 'manual';
}

/**
 * Set global detection mode for all players
 */
function setGlobalDetectionMode(mode) {
    for (let i = 0; i <= 4; i++) {
        if (settingsMap[`tracker${i}`]) {
            settingsMap[`tracker${i}`].detectionMode = mode;
        }
    }
    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
    
    // Update all player card badges and UI
    for (let i = 0; i <= 4; i++) {
        updatePlayerCardBadge(i, mode);
        updatePlayerCardManualSettings(i, mode);
    }
    
    showToast(
        isZH ? `所有玩家已设置为${mode === 'auto' ? '自动' : '手动'}模式` 
             : `All players set to ${mode} mode`, 
        3000
    );
}

/**
 * Update player card badge
 */
function updatePlayerCardBadge(playerIndex, mode) {
    const badge = document.getElementById(`badge_tracker${playerIndex}`);
    if (badge) {
        badge.className = `collapsible-badge badge-${mode}`;
        badge.textContent = mode === 'auto' ? '⚡ Auto' : '🎯 Manual';
    }
}

/**
 * Update player card manual settings visibility
 */
function updatePlayerCardManualSettings(playerIndex, mode) {
    const manualDiv = document.getElementById(`manualSettings_tracker${playerIndex}`);
    if (manualDiv) {
        if (mode === 'auto') {
            manualDiv.classList.add('disabled');
        } else {
            manualDiv.classList.remove('disabled');
        }
    }
}

/**
 * Create My Character Color section
 */
function createMyCharacterColorSection(insertElem, setting) {
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="my-character-color-section">
            <div class="section-title" style="color: #9333EA; font-size: 15px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                🎨 ${isZH ? "我的角色颜色" : "My Character Color"}
            </div>
            <p style="color: #999; font-size: 12px; margin: 8px 0 12px 0; line-height: 1.5;">
                ${isZH ? "为你的角色设置固定颜色，不受队伍位置影响。无论你在队伍的哪个位置，都会使用这个颜色。" 
                       : "Set a persistent color for your character, regardless of party position. Your character will always use this color no matter where they are in the party."}
            </p>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
                <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.desc}</span>
            </div>
            <div id="my-character-status" style="color: #C084FC; font-size: 12px; margin: 12px 0; padding: 10px 14px; background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(168, 85, 247, 0.1)); border-radius: 8px; border: 1px solid rgba(147, 51, 234, 0.3); display: none;">
                <span style="font-weight: 600;">📍 Currently applied to:</span> <span id="my-character-info">—</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="color-preview" id="colorPreview_${setting.id}"></div>
                <span class="color-label">${isZH ? "选择你的颜色" : "Choose Your Color"}</span>
            </div>
        </div>`
    );

    setTimeout(() => {
        setupMyCharacterColorPicker(setting);
        // Start updating character position info periodically
        setInterval(updateMyCharacterInfo, 500);
    }, 100);
}

/**
 * Setup color picker for My Character Color
 */
function setupMyCharacterColorPicker(setting) {
    const colorPreview = document.getElementById('colorPreview_' + setting.id);
    let currentColor = { r: setting.r, g: setting.g, b: setting.b };

    if (colorPreview) {
        colorPreview.addEventListener('click', () => {
            const settingColor = { r: settingsMap[setting.id].r, g: settingsMap[setting.id].g, b: settingsMap[setting.id].b }
            const modal = createColorPicker(settingColor, (newColor) => {
                currentColor = newColor;
                // Update both line color and frame color with the same value
                settingsMap[setting.id].r = newColor.r;
                settingsMap[setting.id].g = newColor.g;
                settingsMap[setting.id].b = newColor.b;
                settingsMap[setting.id].frameR = newColor.r;
                settingsMap[setting.id].frameG = newColor.g;
                settingsMap[setting.id].frameB = newColor.b;
                localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                updateColorPreview();
            }, isZH ? "我的角色颜色" : "My Character Color", setting.id);
            document.body.appendChild(modal);
        });
    }

    function updateColorPreview() {
        if (colorPreview) colorPreview.style.backgroundColor = `rgb(${currentColor.r},${currentColor.g},${currentColor.b})`;
    }

    updateColorPreview();
}

/**
 * Create custom avatar section with preview
 */
function createCustomAvatarSectionNew(insertElem, setting) {
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="avatar-section">
            <div class="section-title" style="color: #4ECDC4; font-size: 15px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                📷 ${isZH ? "自定义头像" : "Custom Avatar"}
            </div>
            <div class="avatar-controls">
                <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
                <span style="color: #fff; font-weight: 500; font-size: 14px;">${isZH ? "启用自定义头像" : "Enable Custom Avatar"}</span>
                <input type="file" id="avatar-file-input" accept="image/*" style="display:none">
                <button id="select-avatar-btn" class="settings-button">${isZH ? "📷 选择图片" : "📷 Select Image"}</button>
                <span id="avatar-file-name" class="file-status ${setting.avatarUrl ? 'active' : ''}">${setting.avatarUrl ? (isZH ? "✓ 已设置" : "✓ Set") : (isZH ? "未选择" : "No file")}</span>
            </div>
            <div class="avatar-preview-container">
                ${setting.avatarUrl ? 
                    `<img id="avatar-preview-img" class="avatar-preview-img" src="${setting.avatarUrl}" />` :
                    `<div class="avatar-placeholder">${isZH ? "未选择头像" : "No Avatar"}</div>`
                }
            </div>
        </div>`
    );

    setTimeout(() => {
        const fileInput = document.getElementById('avatar-file-input');
        const selectBtn = document.getElementById('select-avatar-btn');
        const fileName = document.getElementById('avatar-file-name');
        const previewContainer = document.querySelector('.avatar-preview-container');

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
                        
                        // Update preview
                        previewContainer.innerHTML = `<img id="avatar-preview-img" class="avatar-preview-img" src="${event.target.result}" />`;
                        
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
        }
    }, 100);
}

/**
 * Create custom avatar setting UI (OLD - kept for reference)
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
 * Create collapsible player card
 */
function createCollapsiblePlayerCard(insertElem, setting, playerIndex) {
    const isExpanded = false; // Default collapsed
    const badgeClass = setting.detectionMode === 'auto' ? 'badge-auto' : 'badge-manual';
    const badgeText = setting.detectionMode === 'auto' ? '⚡ Auto' : '🎯 Manual';

    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="collapsible-card player-card player-${playerIndex} ${isExpanded ? 'expanded' : ''}" id="card_tracker${playerIndex}">
            <div class="collapsible-header" data-target="tracker${playerIndex}">
                <div class="collapsible-header-left">
                    <span class="collapsible-title">🎮 ${isZH ? `玩家 #${playerIndex + 1}` : `Player #${playerIndex + 1}`}</span>
                    <span class="collapsible-badge ${badgeClass}" id="badge_tracker${playerIndex}">${badgeText}</span>
                </div>
                <span class="collapsible-icon">${isExpanded ? '▲' : '▼'}</span>
            </div>
            <div class="collapsible-content">
                <div class="collapsible-inner" id="content_tracker${playerIndex}">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        </div>`
    );

    // Add content
    const contentElem = document.getElementById(`content_tracker${playerIndex}`);
    createTrackerContent(contentElem, setting, true);

    // Add click event for expand/collapse
    setTimeout(() => {
        const header = document.querySelector(`[data-target="tracker${playerIndex}"]`);
        const card = document.getElementById(`card_tracker${playerIndex}`);
        
        if (header && card) {
            header.addEventListener('click', () => {
                card.classList.toggle('expanded');
                const icon = header.querySelector('.collapsible-icon');
                icon.textContent = card.classList.contains('expanded') ? '▲' : '▼';
            });
        }
    }, 100);
}

/**
 * Update My Character position info display
 */
function updateMyCharacterInfo() {
    const statusDiv = document.getElementById('my-character-status');
    const infoSpan = document.getElementById('my-character-info');
    
    if (!statusDiv || !infoSpan) return;
    
    // Check if My Character Color is enabled
    if (!settingsMap.myCharacterColor?.isTrue) {
        statusDiv.style.display = 'none';
        return;
    }
    
    // Get cached position from window.cachedPlayerPosition (set by getColorForPlayer during combat)
    const cached = window.cachedPlayerPosition;
    
    if (cached && cached.name && cached.index !== null) {
        statusDiv.style.display = 'block';
        infoSpan.textContent = `${cached.name} (Player #${cached.index + 1})`;
    } else {
        statusDiv.style.display = 'none';
    }
}

/**
 * Create collapsible enemy card
 */
function createCollapsibleEnemyCard(insertElem, setting) {
    const isExpanded = false; // Default collapsed

    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="collapsible-card enemy-card ${isExpanded ? 'expanded' : ''}" id="card_tracker6">
            <div class="collapsible-header" data-target="tracker6">
                <div class="collapsible-header-left">
                    <span class="collapsible-title">👹 ${isZH ? "敌人" : "Enemies"}</span>
                </div>
                <span class="collapsible-icon">${isExpanded ? '▲' : '▼'}</span>
            </div>
            <div class="collapsible-content">
                <div class="collapsible-inner" id="content_tracker6">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        </div>`
    );

    // Add content
    const contentElem = document.getElementById(`content_tracker6`);
    createTrackerContent(contentElem, setting, false);

    // Add click event for expand/collapse
    setTimeout(() => {
        const header = document.querySelector(`[data-target="tracker6"]`);
        const card = document.getElementById(`card_tracker6`);
        
        if (header && card) {
            header.addEventListener('click', () => {
                card.classList.toggle('expanded');
                const icon = header.querySelector('.collapsible-icon');
                icon.textContent = card.classList.contains('expanded') ? '▲' : '▼';
            });
        }
    }, 100);
}

/**
 * Create tracker content (shared between player and enemy cards)
 */
function createTrackerContent(containerElem, setting, isPlayerTracker) {
    let htmlContent = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
            <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
            <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.desc}</span>
            <input type="checkbox" data-number="${setting.id}" data-param="isTrueH" ${setting.isTrueH ? "checked" : ""}></input>
            <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.descH}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <div class="color-preview" id="colorPreview_${setting.id}"></div>
            <span class="color-label">${isZH ? "玩家颜色" : "Player Color"}</span>
        </div>`;

    if (isPlayerTracker) {
        htmlContent += `
        <div class="settings-section">
            <div class="section-title">
                ${isZH ? "🎯 动画检测" : "🎯 Animation Detection"}
            </div>
            <div class="section-content">
                <label>
                    <input type="radio" name="detectionMode_${setting.id}" value="manual" ${setting.detectionMode === "manual" ? "checked" : ""}>
                    <span>🎮 ${isZH ? "手动设置" : "Manual"}</span>
                </label>
                <label>
                    <input type="radio" name="detectionMode_${setting.id}" value="auto" ${setting.detectionMode === "auto" ? "checked" : ""}>
                    <span>⚡ ${isZH ? "自动检测" : "Auto"}</span>
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

    containerElem.innerHTML = htmlContent;

    // Setup color pickers
    setTimeout(() => {
        setupColorPickers(setting);
        
        if (isPlayerTracker) {
            setupPlayerTrackerEvents(setting);
        }
    }, 100);
}

/**
 * Setup color picker for a setting (unified for both line and frame)
 */
function setupColorPickers(setting) {
    const colorPreview = document.getElementById('colorPreview_'+setting.id);
    let currentColor = { r: setting.r, g: setting.g, b: setting.b };

    if (colorPreview) {
        colorPreview.addEventListener('click', () => {
            const settingColor = { r: settingsMap[setting.id].r, g: settingsMap[setting.id].g, b: settingsMap[setting.id].b }
            const modal = createColorPicker(settingColor, (newColor) => {
                currentColor = newColor;
                // Update both line color and frame color with the same value
                settingsMap[setting.id].r = newColor.r;
                settingsMap[setting.id].g = newColor.g;
                settingsMap[setting.id].b = newColor.b;
                settingsMap[setting.id].frameR = newColor.r;
                settingsMap[setting.id].frameG = newColor.g;
                settingsMap[setting.id].frameB = newColor.b;
                localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                updateColorPreview();
            }, isZH ? "玩家颜色" : "Player Color", setting.id);
            document.body.appendChild(modal);
        });
    }

    function updateColorPreview() {
        if (colorPreview) colorPreview.style.backgroundColor = `rgb(${currentColor.r},${currentColor.g},${currentColor.b})`;
    }

    updateColorPreview();
}

/**
 * Setup player tracker specific events (detection mode, animations, etc)
 */
function setupPlayerTrackerEvents(setting) {
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
            
            // Update badge
            const playerIndex = parseInt(setting.id.replace('tracker', ''));
            updatePlayerCardBadge(playerIndex, e.target.value);
            
            // Update global radio if needed
            updateGlobalDetectionModeRadio();
            
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
}

/**
 * Update global detection mode radio based on individual player settings
 */
function updateGlobalDetectionModeRadio() {
    const mode = getGlobalDetectionMode();
    const radios = document.querySelectorAll('input[name="globalDetectionMode"]');
    radios.forEach(radio => {
        if (radio.value === mode) {
            radio.checked = true;
        }
    });
}

/**
 * Create Other Settings section (collapsible)
 */
function createOtherSettingsSection(insertElem) {
    const isExpanded = false; // Default collapsed

    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="collapsible-card ${isExpanded ? 'expanded' : ''}" id="card_other_settings">
            <div class="collapsible-header" data-target="other_settings">
                <div class="collapsible-header-left">
                    <span class="collapsible-title">⚙️ ${isZH ? "其他设置" : "Other Settings"}</span>
                </div>
                <span class="collapsible-icon">${isExpanded ? '▲' : '▼'}</span>
            </div>
            <div class="collapsible-content">
                <div class="collapsible-inner" id="content_other_settings">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        </div>`
    );

    // Add content
    const contentElem = document.getElementById(`content_other_settings`);
    
    // Add other settings
    for (const setting of Object.values(settingsMap)) {
        if (setting.id === 'missedLine' || setting.id === 'moreEffect' || setting.id === 'keepOriginalDamageColor') {
            createSimpleSetting(contentElem, setting);
        }
    }

    // Add click event for expand/collapse
    setTimeout(() => {
        const header = document.querySelector(`[data-target="other_settings"]`);
        const card = document.getElementById(`card_other_settings`);
        
        if (header && card) {
            header.addEventListener('click', () => {
                card.classList.toggle('expanded');
                const icon = header.querySelector('.collapsible-icon');
                icon.textContent = card.classList.contains('expanded') ? '▲' : '▼';
            });
        }
    }, 100);
}

/**
 * Create tracker setting UI (for players and enemies) - OLD VERSION
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
        `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
            <span style="color: #fff; font-weight: 500; font-size: 14px;">${setting.desc}</span>
        </div>`
    );
}

/**
 * Create Spritesheet Avatar section with controls
 */
function createSpritesheetAvatarSection(insertElem, setting) {
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div class="spritesheet-avatar-section" style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 175, 123, 0.1)); border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.3);">
            <div class="section-title" style="color: #FF6B6B; font-size: 15px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                🎮 ${isZH ? "精灵动画头像" : "Spritesheet Avatar Animations"}
            </div>
            <p style="color: #999; font-size: 12px; margin: 8px 0 12px 0; line-height: 1.5;">
                ${isZH ? "使用精灵表单图像（spritesheet）为头像添加动画效果。需要idle和cast两个动画。" 
                       : "Add animated avatar using spritesheet images. Requires idle and cast animation spritesheets."}
            </p>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <input type="checkbox" id="spritesheet-enabled" ${setting.enabled ? "checked" : ""}></input>
                <span style="color: #fff; font-weight: 500; font-size: 14px;">${isZH ? "启用精灵动画" : "Enable Spritesheet Animations"}</span>
            </div>
            
            <!-- Idle Animation -->
            <div class="sprite-config-row" style="margin-bottom: 16px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                <div style="color: #4ECDC4; font-weight: 600; margin-bottom: 8px; font-size: 13px;">
                    💤 ${isZH ? "待机动画 (Idle)" : "Idle Animation"}
                </div>
                <input type="file" id="spritesheet-idle-input" accept="image/*" style="display:none">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
                    <button id="select-idle-btn" class="settings-button" style="font-size: 12px; padding: 6px 12px;">${isZH ? "📷 选择图片" : "📷 Select Image"}</button>
                    <span id="idle-file-name" class="file-status ${setting.idleUrl ? 'active' : ''}" style="font-size: 12px;">${setting.idleUrl ? (isZH ? "✓ 已设置" : "✓ Set") : (isZH ? "未选择" : "No file")}</span>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <label style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #999; font-size: 11px;">${isZH ? "帧数" : "Frames"}:</span>
                        <input type="number" id="idle-frames" value="${setting.idleFrames}" min="1" max="100" style="width: 60px; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; background: #2a2a2a; color: white; font-size: 12px;">
                    </label>
                    <label style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #999; font-size: 11px;">${isZH ? "时长(ms)" : "Duration(ms)"}:</span>
                        <input type="number" id="idle-duration" value="${setting.idleDuration}" min="100" max="5000" step="100" style="width: 80px; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; background: #2a2a2a; color: white; font-size: 12px;">
                    </label>
                </div>
            </div>
            
            <!-- Cast Animation -->
            <div class="sprite-config-row" style="margin-bottom: 16px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                <div style="color: #FF6B6B; font-weight: 600; margin-bottom: 8px; font-size: 13px;">
                    ⚡ ${isZH ? "施法动画 (Cast)" : "Cast Animation"}
                </div>
                <input type="file" id="spritesheet-cast-input" accept="image/*" style="display:none">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
                    <button id="select-cast-btn" class="settings-button" style="font-size: 12px; padding: 6px 12px;">${isZH ? "📷 选择图片" : "📷 Select Image"}</button>
                    <span id="cast-file-name" class="file-status ${setting.castUrl ? 'active' : ''}" style="font-size: 12px;">${setting.castUrl ? (isZH ? "✓ 已设置" : "✓ Set") : (isZH ? "未选择" : "No file")}</span>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <label style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #999; font-size: 11px;">${isZH ? "帧数" : "Frames"}:</span>
                        <input type="number" id="cast-frames" value="${setting.castFrames}" min="1" max="100" style="width: 60px; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; background: #2a2a2a; color: white; font-size: 12px;">
                    </label>
                    <label style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #999; font-size: 11px;">${isZH ? "时长(ms)" : "Duration(ms)"}:</span>
                        <input type="number" id="cast-duration" value="${setting.castDuration}" min="100" max="5000" step="100" style="width: 80px; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; background: #2a2a2a; color: white; font-size: 12px;">
                    </label>
                </div>
            </div>
            
            <!-- Frame Dimensions -->
            <div class="sprite-config-row" style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                <div style="color: #FFA07A; font-weight: 600; margin-bottom: 8px; font-size: 13px;">
                    📐 ${isZH ? "精灵尺寸" : "Sprite Dimensions"}
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <label style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #999; font-size: 11px;">${isZH ? "帧宽度" : "Frame Width"}:</span>
                        <input type="number" id="frame-width" value="${setting.frameWidth}" min="1" max="1000" style="width: 80px; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; background: #2a2a2a; color: white; font-size: 12px;">
                    </label>
                    <label style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #999; font-size: 11px;">${isZH ? "帧高度" : "Frame Height"}:</span>
                        <input type="number" id="frame-height" value="${setting.frameHeight}" min="1" max="1000" style="width: 80px; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; background: #2a2a2a; color: white; font-size: 12px;">
                    </label>
                </div>
            </div>
        </div>`
    );

    setTimeout(() => {
        // Enable checkbox
        const enableCheckbox = document.getElementById('spritesheet-enabled');
        enableCheckbox?.addEventListener('change', (e) => {
            settingsMap.spritesheetAvatar.enabled = e.target.checked;
            localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
            appliedAvatars.clear();
            setTimeout(applyCustomAvatar, 200);
            showToast(isZH ? '设置已更新！' : 'Settings updated!', 2000);
        });

        // Idle spritesheet
        const idleInput = document.getElementById('spritesheet-idle-input');
        const selectIdleBtn = document.getElementById('select-idle-btn');
        const idleFileName = document.getElementById('idle-file-name');
        
        console.log('🔧 Spritesheet elements found:', {
            idleInput: !!idleInput,
            selectIdleBtn: !!selectIdleBtn,
            idleFileName: !!idleFileName
        });
        
        selectIdleBtn?.addEventListener('click', () => {
            console.log('📷 Idle button clicked');
            idleInput?.click();
        });
        idleInput?.addEventListener('change', (e) => {
            console.log('📁 Idle file selected');
            const file = e.target.files[0];
            if (file) {
                console.log('📄 Reading file:', file.name, file.size);
                const reader = new FileReader();
                reader.onload = (event) => {
                    console.log('✅ Idle file loaded, length:', event.target.result.length);
                    settingsMap.spritesheetAvatar.idleUrl = event.target.result;
                    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                    idleFileName.textContent = isZH ? `✓ ${file.name}` : `✓ ${file.name}`;
                    idleFileName.classList.add('active');
                    appliedAvatars.clear();
                    setTimeout(applyCustomAvatar, 200);
                    showToast(isZH ? '待机动画已更新！' : 'Idle animation updated!', 2000);
                };
                reader.onerror = (error) => {
                    console.error('❌ Error reading file:', error);
                };
                reader.readAsDataURL(file);
            }
        });

        // Cast spritesheet
        const castInput = document.getElementById('spritesheet-cast-input');
        const selectCastBtn = document.getElementById('select-cast-btn');
        const castFileName = document.getElementById('cast-file-name');
        
        console.log('🔧 Cast elements found:', {
            castInput: !!castInput,
            selectCastBtn: !!selectCastBtn,
            castFileName: !!castFileName
        });
        
        selectCastBtn?.addEventListener('click', () => {
            console.log('⚡ Cast button clicked');
            castInput?.click();
        });
        castInput?.addEventListener('change', (e) => {
            console.log('📁 Cast file selected');
            const file = e.target.files[0];
            if (file) {
                console.log('📄 Reading file:', file.name, file.size);
                const reader = new FileReader();
                reader.onload = (event) => {
                    console.log('✅ Cast file loaded, length:', event.target.result.length);
                    settingsMap.spritesheetAvatar.castUrl = event.target.result;
                    localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
                    castFileName.textContent = isZH ? `✓ ${file.name}` : `✓ ${file.name}`;
                    castFileName.classList.add('active');
                    appliedAvatars.clear();
                    setTimeout(applyCustomAvatar, 200);
                    showToast(isZH ? '施法动画已更新！' : 'Cast animation updated!', 2000);
                };
                reader.onerror = (error) => {
                    console.error('❌ Error reading cast file:', error);
                };
                reader.readAsDataURL(file);
            }
        });

        // Configuration inputs
        const idleFramesInput = document.getElementById('idle-frames');
        const idleDurationInput = document.getElementById('idle-duration');
        const castFramesInput = document.getElementById('cast-frames');
        const castDurationInput = document.getElementById('cast-duration');
        const frameWidthInput = document.getElementById('frame-width');
        const frameHeightInput = document.getElementById('frame-height');

        const updateConfig = () => {
            settingsMap.spritesheetAvatar.idleFrames = parseInt(idleFramesInput?.value) || 6;
            settingsMap.spritesheetAvatar.idleDuration = parseInt(idleDurationInput?.value) || 600;
            settingsMap.spritesheetAvatar.castFrames = parseInt(castFramesInput?.value) || 8;
            settingsMap.spritesheetAvatar.castDuration = parseInt(castDurationInput?.value) || 800;
            settingsMap.spritesheetAvatar.frameWidth = parseInt(frameWidthInput?.value) || 231;
            settingsMap.spritesheetAvatar.frameHeight = parseInt(frameHeightInput?.value) || 190;
            localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
            appliedAvatars.clear();
            setTimeout(applyCustomAvatar, 200);
        };

        idleFramesInput?.addEventListener('change', updateConfig);
        idleDurationInput?.addEventListener('change', updateConfig);
        castFramesInput?.addEventListener('change', updateConfig);
        castDurationInput?.addEventListener('change', updateConfig);
        frameWidthInput?.addEventListener('change', updateConfig);
        frameHeightInput?.addEventListener('change', updateConfig);
    }, 100);
}

// Export to global scope for Tampermonkey
window.waitForSetttins = waitForSetttins;
