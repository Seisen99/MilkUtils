// ==UserScript==
// @name         MWI-Avatar-Plus
// @name:en      MWI-Avatar-Plus
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description:en Visualizing Attack/Heal Effects with Animated Lines + Custom Avatar Support
// @author       Artintel
// @license MIT
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Inject CSS for Party Info panel avatar z-index fix
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

    // Inject the style only once
    if (!document.getElementById('mwi-avatar-plus-party-zindex')) {
        document.head.appendChild(partyAvatarStyle);
    }

    const isZHInGameSetting = localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh");
    let isZH = isZHInGameSetting;
    let settingsMap = {
        customAvatar: {
            id: "customAvatar",
            desc: isZH ? "启用自定义头像" : "Enable custom avatar",
            isTrue: false,
            avatarUrl: "",
        },
        attackAnimation: {
            id: "attackAnimation",
            desc: isZH ? "类型攻击" : "Attack type",
            value: "mage",
        },
        tracker0 : {
            id: "tracker0",
            desc: isZH ? "启用玩家 #1 伤害线":"Enable player #1 damage line",
            isTrue: true,
            descH: isZH ? "启用玩家 #1 治疗线":"Enable player #1 healing line",
            isTrueH: true,
            r: 255,
            g: 99,
            b: 132,
            frameR: 255,
            frameG: 99,
            frameB: 132,
            attackAnimation: "none",
            fireballColor: "green",
        },
        tracker1 : {
            id: "tracker1",
            desc: isZH ? "启用玩家 #2 伤害线":"Enable player #2 damage line",
            isTrue: true,
            descH: isZH ? "启用玩家 #2 治疗线":"Enable player #2 healing line",
            isTrueH: true,
            r: 54,
            g: 162,
            b: 235,
            frameR: 54,
            frameG: 162,
            frameB: 235,
            attackAnimation: "none",
            fireballColor: "green",
        },
        tracker2 : {
            id: "tracker2",
            desc: isZH ? "启用玩家 #3 伤害线":"Enable player #3 damage line",
            isTrue: true,
            descH: isZH ? "启用玩家 #3 治疗线":"Enable player #3 healing line",
            isTrueH: true,
            r: 255,
            g: 206,
            b: 86,
            frameR: 255,
            frameG: 206,
            frameB: 86,
            attackAnimation: "none",
            fireballColor: "green",
        },
        tracker3 : {
            id: "tracker3",
            desc: isZH ? "启用玩家 #4 伤害线":"Enable player #4 damage line",
            isTrue: true,
            descH: isZH ? "启用玩家 #4 治疗线":"Enable player #4 healing line",
            isTrueH: true,
            r: 75,
            g: 192,
            b: 192,
            frameR: 75,
            frameG: 192,
            frameB: 192,
            attackAnimation: "none",
            fireballColor: "green",
        },
        tracker4 : {
            id: "tracker4",
            desc: isZH ? "启用玩家 #5 伤害线":"Enable player #5 damage line",
            isTrue: true,
            descH: isZH ? "启用玩家 #5 治疗线":"Enable player #5 healing line",
            isTrueH: true,
            r: 153,
            g: 102,
            b: 255,
            frameR: 153,
            frameG: 102,
            frameB: 255,
            attackAnimation: "none",
            fireballColor: "green",
        },
        tracker6 : {
            id: "tracker6",
            desc: isZH ? "启用敌人伤害线":"Enable enemies damage line",
            isTrue: true,
            descH: isZH ? "启用敌人治疗线":"Enable enemies healing line",
            isTrueH: true,
            r: 255,
            g: 0,
            b: 0,
            frameR: 255,
            frameG: 0,
            frameB: 0,
        },
        missedLine : {
            id: "missedLine",
            desc: isZH ? "启用被闪避的攻击线":"Enable missed attack line",
            isTrue: true,
        },
        moreEffect : {
            id: "moreEffect",
            desc: isZH ? "特效拓展：击中时有粒子效果和目标震动":"Effects extension: particle effects & Target shake on hit",
            isTrue: true,
        },
        keepOriginalDamageColor : {
            id: "keepOriginalDamageColor",
            desc: isZH ? "显示原始伤害颜色（动画结束后恢复红色）" : "Show original damage color (return to red after animation)",
            isTrue: true,
        }
    };
    readSettings();


    const waitForSetttins = () => {
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
                    } else if (setting.id === "attackAnimation") {
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
                    } else if (/^tracker\d$/.test(setting.id)){
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
                            <div style="margin-left: 20px; margin-top: 5px;">
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
                            }, isZH ? "线条颜色" : "Line Color");
                            document.body.appendChild(modal);
                        });

                        function updatePreview() {
                            colorPreview.style.backgroundColor = `rgb(${currentColor.r},${currentColor.g},${currentColor.b})`;
                            colorPreviewFrame.style.backgroundColor = `rgb(${currentFrameColor.r},${currentFrameColor.g},${currentFrameColor.b})`;
                        }


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
                            }, isZH ? "伤害框颜色" : "Damage Frame Color");
                            document.body.appendChild(modal);
                        });

                        updatePreview();

                        if (isPlayerTracker) {
                            setTimeout(() => {
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

                        function createColorPicker(initialColor, callback, title = "") {
                            const backdrop = document.createElement('div');
                            backdrop.className = 'modal-backdrop';

                            const modal = document.createElement('div');
                            modal.className = 'color-picker-modal';


                            if (title) {
                                const titleElem = document.createElement('h3');
                                titleElem.textContent = title;
                                titleElem.style.color = 'white';
                                titleElem.style.marginTop = '0';
                                titleElem.style.marginBottom = '15px';
                                titleElem.style.textAlign = 'center';
                                modal.appendChild(titleElem);
                            }


                            const preview = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                            preview.setAttribute("width", "200");
                            preview.setAttribute("height", "150");
                            preview.style.display = 'block';
                            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                            Object.assign(path.style, {
                                strokeWidth: '5px',
                                fill: 'none',
                                strokeLinecap: 'round',
                            });
                            path.setAttribute("d", "M 0 130 Q 100 0 200 130");
                            preview.appendChild(path);


                            const controls = document.createElement('div');
                            ['r', 'g', 'b'].forEach(channel => {
                                const container = document.createElement('div');
                                container.className = 'slider-container';


                                const label = document.createElement('label');
                                label.textContent = channel.toUpperCase() + ':';
                                label.style.color = "white";


                                const slider = document.createElement('input');
                                slider.type = 'range';
                                slider.min = 0;
                                slider.max = 255;
                                slider.value = initialColor[channel];


                                const input = document.createElement('input');
                                input.type = 'number';
                                input.min = 0;
                                input.max = 255;
                                input.value = initialColor[channel];
                                input.style.width = '60px';


                                const updateChannel = (value) => {
                                    value = Math.min(255, Math.max(0, parseInt(value) || 0));
                                    slider.value = value;
                                    input.value = value;
                                    currentColor[channel] = value;
                                    path.style.stroke = getColorString(currentColor);
                                };

                                slider.addEventListener('input', (e) => updateChannel(e.target.value));
                                input.addEventListener('change', (e) => updateChannel(e.target.value));

                                container.append(label, slider, input);
                                controls.append(container);
                            });


                            const actions = document.createElement('div');
                            actions.className = 'modal-actions';

                            const confirmBtn = document.createElement('button');
                            confirmBtn.textContent = isZH ? '确定':'OK';
                            confirmBtn.onclick = () => {
                                callback(currentColor);
                                backdrop.remove();
                            };

                            const cancelBtn = document.createElement('button');
                            cancelBtn.textContent = isZH ? '取消':'Cancel';
                            cancelBtn.onclick = () => backdrop.remove();

                            actions.append(cancelBtn, confirmBtn);


                            const getColorString = (color) =>
                            `rgb(${color.r},${color.g},${color.b})`;

                            path.style.stroke = getColorString(settingsMap[setting.id]);
                            modal.append(preview, controls, actions);
                            backdrop.append(modal);


                            backdrop.addEventListener('click', (e) => {
                                if (e.target === backdrop) backdrop.remove();
                            });

                            return backdrop;
                        }
                    }else{
                        insertElem.insertAdjacentHTML(
                            "beforeend",
                            `<div class="tracker-option"><input type="checkbox" data-number="${setting.id}" data-param="isTrue" ${setting.isTrue ? "checked" : ""}></input>
                        <span style="margin-right:5px">${setting.desc}</span></div>`
                        );
                    }
                }

                insertElem.addEventListener("change", saveSettings);
            }
        }
        setTimeout(waitForSetttins, 500);
    };
    waitForSetttins();

    function saveSettings() {
        for (const checkbox of document.querySelectorAll("div#tracker_settings input[type='checkbox']")) {
            settingsMap[checkbox.dataset.number][checkbox.dataset.param] = checkbox.checked;
            localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
        }
        appliedAvatars.clear();
        setTimeout(applyCustomAvatar, 200);
    }

    function readSettings() {
        const ls = localStorage.getItem("tracker_settingsMap");
        if (ls) {
            const lsObj = JSON.parse(ls);
            for (const option of Object.values(lsObj)) {
                if (settingsMap.hasOwnProperty(option.id)) {
                    if (option.id === "customAvatar") {
                        settingsMap[option.id].isTrue = option.isTrue !== undefined ? option.isTrue : false;
                        settingsMap[option.id].avatarUrl = option.avatarUrl || "";
                    } else if (option.id === "attackAnimation") {
                        settingsMap[option.id].value = option.value || "mage";
                    } else {
                        settingsMap[option.id].isTrue = option.isTrue;
                        if (option.isTrueH !== undefined) settingsMap[option.id].isTrueH = option.isTrueH;
                        if (option.r !== undefined) settingsMap[option.id].r = option.r;
                        if (option.g !== undefined) settingsMap[option.id].g = option.g;
                        if (option.b !== undefined) settingsMap[option.id].b = option.b;
                        if (option.frameR !== undefined) settingsMap[option.id].frameR = option.frameR;
                        if (option.frameG !== undefined) settingsMap[option.id].frameG = option.frameG;
                        if (option.frameB !== undefined) settingsMap[option.id].frameB = option.frameB;
                        if (option.attackAnimation !== undefined) settingsMap[option.id].attackAnimation = option.attackAnimation;
                        if (option.fireballColor !== undefined) settingsMap[option.id].fireballColor = option.fireballColor;
                    }
                }
            }
        }
    }

    function getPlayerName() {
        const nameElement = document.querySelector('.CharacterName_name__1amXp[data-name]');
        return nameElement ? nameElement.getAttribute('data-name') : null;
    }

    let isApplyingAvatar = false;
    const appliedAvatars = new Set();
    let lastBattlePanel = null;

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
                    avatar._avatarId = 'avatar_' + Date.now() + '_' + Math.random();
                }

                const avatarKey = location + '-' + avatar._avatarId;
                if (appliedAvatars.has(avatarKey)) {
                    return false;
                }

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
            };

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

    const observeForAvatars = () => {
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
    };
    observeForAvatars();

    let monstersHP = [];
    let monstersMP = [];
    let monstersDmgCounter = [];
    let playersHP = [];
    let playersMP = [];
    let playersDmgCounter = [];
    hookWS();

    function hookWS() {
        const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
        const oriGet = dataProperty.get;

        dataProperty.get = hookedGet;
        Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

        function hookedGet() {
            const socket = this.currentTarget;
            if (!(socket instanceof WebSocket)) {
                return oriGet.call(this);
            }
            if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
                return oriGet.call(this);
            }

            const message = oriGet.call(this);
            Object.defineProperty(this, "data", { value: message }); // Anti-loop

            return handleMessage(message);
        }
    }


    function showToast(message, duration = 5000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.bottom = '50px';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(60, 60, 60, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';


        document.body.appendChild(toast);


        void toast.offsetWidth;


        toast.style.opacity = '1';


        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }

    const AnimationManager = {
        maxPaths: 50,
        activePaths: new Set(),
        isCoolingDown: false,
        coolDownTimer: null,

        canCreate() {
            if (this.isCoolingDown) return false;
            if (this.activePaths.size >= this.maxPaths) {
                this.triggerCoolDown();
                return false;
            }
            return this.activePaths.size < this.maxPaths;
        },

        addPath(path) {
            this.activePaths.add(path);
        },

        removePath(path) {
            this.activePaths.delete(path);
        },

        triggerCoolDown() {
            this.activePaths.clear();
            const svg = document.getElementById('svg-container');
            if(svg && svg !== undefined) {
                svg.innerHTML = '';
            }
            showToast(isZH?'动画超过限制数'+this.maxPaths+'，进入5秒冷却':'Animation limit reached ('+this.maxPaths+'), entering 5s cooldown');
            this.isCoolingDown = true;

            if (this.coolDownTimer) {
                clearTimeout(this.coolDownTimer);
            }

            this.coolDownTimer = setTimeout(() => {
                this.isCoolingDown = false;
                this.coolDownTimer = null;
            }, 5000);
        }
    };

    function getElementCenter(element) {
        const rect = element.getBoundingClientRect();
        if (element.innerText.trim() === '') {
            return {
                x: rect.left + rect.width/2,
                y: rect.top
            };
        }
        return {
            x: rect.left + rect.width/2,
            y: rect.top + rect.height/2
        };
    }

    function createParabolaPath(startElem, endElem, reversed = false) {
        const start = getElementCenter(startElem);
        const end = getElementCenter(endElem);


        const curveRatio = reversed ? 4:2.5;
        const curveHeight = -Math.abs(start.x - end.x)/curveRatio;

        const controlPoint = {
            x: (start.x + end.x) / 2,
            y: Math.min(start.y, end.y) + curveHeight
        };

        if (reversed) {return `M ${end.x} ${end.y} Q ${controlPoint.x} ${controlPoint.y}, ${start.x} ${start.y}`;}
        return `M ${start.x} ${start.y} Q ${controlPoint.x} ${controlPoint.y}, ${end.x} ${end.y}`;
    }


    function createFireballAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed = false, fireballColor = "green") {
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
        }


        const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

        const colorSchemes = {
            green: {
                gradient: ['#caffbf', '#9ef01a', '#70e000', '#38b000'],
                glow: ['#9ef01a', '#70e000', '#38b000'],
                particles: ['#70e000', '#9ef01a']
            },
            red: {
                gradient: ['#ffcaca', '#ff4d4d', '#ff0000', '#b30000'],
                glow: ['#ff4d4d', '#ff0000', '#b30000'],
                particles: ['#ff0000', '#ff4d4d']
            },
            blue: {
                gradient: ['#cae0ff', '#4d9eff', '#0066ff', '#0047b3'],
                glow: ['#4d9eff', '#0066ff', '#0047b3'],
                particles: ['#0066ff', '#4d9eff']
            }
        };

        const colors = colorSchemes[fireballColor] || colorSchemes.green;

        const fireballGradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        fireballGradient.id = `fireballGradient_${uniqueId}`;
        fireballGradient.innerHTML = `
            <stop offset="0%" style="stop-color:${colors.gradient[0]};stop-opacity:0.7" />
            <stop offset="40%" style="stop-color:${colors.gradient[1]};stop-opacity:0.6" />
            <stop offset="70%" style="stop-color:${colors.gradient[2]};stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:${colors.gradient[3]};stop-opacity:0.2" />
        `;
        defs.appendChild(fireballGradient);
        const glowGradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        glowGradient.id = `glowGradient_${uniqueId}`;
        glowGradient.innerHTML = `
            <stop offset="0%" style="stop-color:${colors.glow[0]};stop-opacity:0.5" />
            <stop offset="50%" style="stop-color:${colors.glow[1]};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${colors.glow[2]};stop-opacity:0" />
        `;
        defs.appendChild(glowGradient);
        const glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        glowFilter.id = `glow_${uniqueId}`;
        glowFilter.innerHTML = `
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        defs.appendChild(glowFilter);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("id", `fireballPath_${uniqueId}`);
        path.style.fill = "none";
        path.style.stroke = "none";
        svg.appendChild(path);
        const fireballGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        fireballGroup.style.opacity = '1';
        const trailGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const particles = [];
        const numParticles = 8;
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            particle.setAttribute("r", (5 - i * 0.4).toString());
            particle.setAttribute("fill", i % 2 === 0 ? colors.particles[0] : colors.particles[1]);
            particle.setAttribute("opacity", (0.4 - i * 0.04).toString());
            trailGroup.appendChild(particle);
            particles.push(particle);
        }
        const mainBallGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        halo.setAttribute("r", "25");
        halo.setAttribute("fill", `url(#glowGradient_${uniqueId})`);
        halo.setAttribute("filter", `url(#glow_${uniqueId})`);
        mainBallGroup.appendChild(halo);
        const mainBall = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        mainBall.setAttribute("r", "20");
        mainBall.setAttribute("fill", `url(#fireballGradient_${uniqueId})`);
        mainBall.setAttribute("filter", `url(#glow_${uniqueId})`);
        mainBallGroup.appendChild(mainBall);
        const innerDetail1 = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        innerDetail1.setAttribute("rx", "8");
        innerDetail1.setAttribute("ry", "12");
        innerDetail1.setAttribute("fill", colors.gradient[0]);
        innerDetail1.setAttribute("opacity", "0.5");
        innerDetail1.setAttribute("transform", "translate(0,-3)");
        mainBallGroup.appendChild(innerDetail1);

        const innerDetail2 = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        innerDetail2.setAttribute("rx", "6");
        innerDetail2.setAttribute("ry", "10");
        const lightColor = fireballColor === "green" ? "#e0ffe0" : (fireballColor === "red" ? "#ffe0e0" : "#e0f0ff");
        innerDetail2.setAttribute("fill", lightColor);
        innerDetail2.setAttribute("opacity", "0.3");
        innerDetail2.setAttribute("transform", "translate(-3,0)");
        mainBallGroup.appendChild(innerDetail2);
        const sparkle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sparkle1.setAttribute("cx", "-5");
        sparkle1.setAttribute("cy", "-5");
        sparkle1.setAttribute("r", "2");
        sparkle1.setAttribute("fill", "#ffffff");
        sparkle1.setAttribute("opacity", "0.6");
        mainBallGroup.appendChild(sparkle1);
        fireballGroup.appendChild(trailGroup);
        fireballGroup.appendChild(mainBallGroup);
        svg.appendChild(fireballGroup);

        const pathLength = path.getTotalLength();
        const duration = 500;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const point = path.getPointAtLength(pathLength * progress);
            mainBallGroup.setAttribute("transform", `translate(${point.x}, ${point.y})`);
            particles.forEach((particle, i) => {
                const trailProgress = Math.max(0, progress - (i + 1) * 0.02);
                const trailPoint = path.getPointAtLength(pathLength * trailProgress);
                particle.setAttribute("cx", trailPoint.x);
                particle.setAttribute("cy", trailPoint.y);
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
        const cleanUp = () => {
            try {
                if (fireballGroup.parentNode) {
                    svg.removeChild(fireballGroup);
                }
                if (path.parentNode) {
                    svg.removeChild(path);
                }
                if (defs.contains(fireballGradient)) defs.removeChild(fireballGradient);
                if (defs.contains(glowGradient)) defs.removeChild(glowGradient);
                if (defs.contains(glowFilter)) defs.removeChild(glowFilter);
                AnimationManager.removePath(fireballGroup);
            } catch(e) {
            }
        };

        setTimeout(() => {
            fireballGroup.style.transition = 'opacity 0.3s';
            fireballGroup.style.opacity = '0';
            setTimeout(cleanUp, 300);
        }, 600);
        const forceCleanupTimer = setTimeout(cleanUp, 5000);

        return fireballGroup;
    }


    function createArrowAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed = false) {
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
        }

        const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

        const arrowGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        arrowGradient.id = `arrowGradient_${uniqueId}`;
        arrowGradient.innerHTML = `
            <stop offset="0%" style="stop-color:#c0c0c0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b4513;stop-opacity:1" />
        `;
        defs.appendChild(arrowGradient);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("id", `arrowPath_${uniqueId}`);
        path.style.fill = "none";
        path.style.stroke = "none";
        svg.appendChild(path);

        const arrowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        arrowGroup.style.opacity = '1';

        const arrowShaft = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        arrowShaft.setAttribute("width", "30");
        arrowShaft.setAttribute("height", "3");
        arrowShaft.setAttribute("x", "-15");
        arrowShaft.setAttribute("y", "-1.5");
        arrowShaft.setAttribute("fill", "#8b4513");
        arrowShaft.setAttribute("rx", "1");

        const arrowHead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        arrowHead.setAttribute("points", "15,-6 25,0 15,6");
        arrowHead.setAttribute("fill", "#c0c0c0");
        arrowHead.setAttribute("stroke", "#a0a0a0");
        arrowHead.setAttribute("stroke-width", "0.5");

        const arrowTail = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        arrowTail.setAttribute("points", "-15,-3 -18,0 -15,3");
        arrowTail.setAttribute("fill", "#d2691e");

        arrowGroup.appendChild(arrowShaft);
        arrowGroup.appendChild(arrowHead);
        arrowGroup.appendChild(arrowTail);

        const trailGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const particles = [];
        const numParticles = 5;
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            particle.setAttribute("r", (2 - i * 0.3).toString());
            particle.setAttribute("fill", "#d2691e");
            particle.setAttribute("opacity", (0.6 - i * 0.1).toString());
            trailGroup.appendChild(particle);
            particles.push(particle);
        }

        svg.appendChild(trailGroup);
        svg.appendChild(arrowGroup);

        const pathLength = path.getTotalLength();
        const duration = 500;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const point = path.getPointAtLength(pathLength * progress);

            let angle = 0;
            if (progress < 0.99) {
                const nextPoint = path.getPointAtLength(Math.min(pathLength * progress + 1, pathLength));
                angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
            }

            arrowGroup.setAttribute("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`);

            particles.forEach((particle, i) => {
                const trailProgress = Math.max(0, progress - (i + 1) * 0.05);
                const trailPoint = path.getPointAtLength(pathLength * trailProgress);
                particle.setAttribute("cx", trailPoint.x);
                particle.setAttribute("cy", trailPoint.y);
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);

        const cleanUp = () => {
            try {
                if (arrowGroup.parentNode) {
                    svg.removeChild(arrowGroup);
                }
                if (trailGroup.parentNode) {
                    svg.removeChild(trailGroup);
                }
                if (path.parentNode) {
                    svg.removeChild(path);
                }
                if (defs.contains(arrowGradient)) defs.removeChild(arrowGradient);
                AnimationManager.removePath(arrowGroup);
            } catch(e) {
            }
        };

        setTimeout(() => {
            arrowGroup.style.transition = 'opacity 0.3s';
            arrowGroup.style.opacity = '0';
            setTimeout(cleanUp, 300);
        }, 600);
        const forceCleanupTimer = setTimeout(cleanUp, 5000);

        return arrowGroup;
    }


    function createSwordSlashEffect(targetElem, svg, trackerSetting) {
        const targetRect = targetElem.getBoundingClientRect();
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;

        // Angles en degrés pour la rotation du marteau (0° = 3h sur une horloge)
        const startAngle = -240; // 10h sur l'horloge - marteau levé à gauche
        const impactAngle = -90;  // 12h - marteau frappe vers le bas sur la cible
        const endAngle = -140;    // Retour partiel vers 10h30

        // Position du bout du manche (le point de pivot fixe) - légèrement à gauche et au-dessus de la cible
        const handleBaseX = centerX - 40;
        const handleBaseY = centerY - 30;

        const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
        }

        const swordGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        swordGradient.id = `swordGradient_${uniqueId}`;
        swordGradient.setAttribute("x1", "0%");
        swordGradient.setAttribute("y1", "0%");
        swordGradient.setAttribute("x2", "0%");
        swordGradient.setAttribute("y2", "100%");
        swordGradient.innerHTML = `
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:#e0e0e0;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#c0c0c0;stop-opacity:0.6" />
        `;
        defs.appendChild(swordGradient);

        const hammerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        hammerGroup.style.opacity = '0';

        // Granite Bludgeon SVG - Original weapon from game
        // Le SVG original a le manche en bas-gauche (12, 42) et la tête en haut-droite (diagonale ~45°)
        // On translate pour mettre l'origine au bout du manche, puis on rotate pour orienter la tête vers 10h
        const weaponGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        weaponGroup.setAttribute("transform", "translate(-12, -42) scale(1.8) rotate(135 25.5 25.5)");
        weaponGroup.innerHTML = `
            <path d="M12.8103 41.4993L29.1548 25.1548L25.6925 21.6925L9.34796 38.037L12.8103 41.4993Z" fill="#898989"/>
            <path d="M12.8103 41.4993L29.1548 25.1548L25.6925 21.6925L9.34796 38.037L12.8103 41.4993Z" fill="white" fill-opacity="0.6"/>
            <path d="M12.8555 42.8391L8.00818 37.9918L4.34245e-07 46L-4.08692e-07 48L3 51L5 51L12.8555 42.8391Z" fill="#898989"/>
            <path d="M12.8555 42.8391L8.00818 37.9918L4.34245e-07 46L-4.08692e-07 48L3 51L5 51L12.8555 42.8391Z" fill="white" fill-opacity="0.6"/>
            <path d="M45.6162 6.82575L44.2202 5.42207C40.7187 6.1124 36.2458 9.76641 34 12C31.7541 14.2336 28.7823 19.845 27.376 22.1742L28.772 23.5779C31.3416 22.4184 35.4908 20.4901 39 17C41.8073 14.208 44.9067 10.3234 45.6162 6.82575Z" fill="#898989"/>
            <path d="M45.6162 6.82575L44.2202 5.42207C40.7187 6.1124 36.2458 9.76641 34 12C31.7541 14.2336 28.7823 19.845 27.376 22.1742L28.772 23.5779C31.3416 22.4184 35.4908 20.4901 39 17C41.8073 14.208 44.9067 10.3234 45.6162 6.82575Z" fill="white" fill-opacity="0.4"/>
            <path d="M39.4999 18C44.0619 13.463 44.9067 10.3234 46.3142 7.52759L47.7102 8.93127C47.6987 13.1308 46.3626 16.9677 42.7782 20.8165C39.1937 24.6653 35.0656 25.6949 30.8661 25.6834L29.47 24.2797C32.2736 22.8876 35.9907 21.49 39.4999 18Z" fill="#898989"/>
            <path d="M39.4999 18C44.0619 13.463 44.9067 10.3234 46.3142 7.52759L47.7102 8.93127C47.6987 13.1308 46.3626 16.9677 42.7782 20.8165C39.1937 24.6653 35.0656 25.6949 30.8661 25.6834L29.47 24.2797C32.2736 22.8876 35.9907 21.49 39.4999 18Z" fill="white" fill-opacity="0.2"/>
            <path d="M43.4763 21.5184C47.968 17.0512 48.4032 11.4996 48.4083 9.63312L49.8043 11.0368C50.4947 14.5383 49.562 19.654 45.5703 23.6239C41.5786 27.5938 36.4579 28.4984 32.9602 27.7889L31.5642 26.3853C34.3639 26.3929 38.9845 25.9856 43.4763 21.5184Z" fill="#898989"/>
            <path d="M33 11.5C37.1872 6.61495 40.7187 6.11239 43.5222 4.72021L42.1262 3.31653C37.9267 3.30503 34.0825 4.62009 30.2141 8.1834C26.3457 11.7467 25.2935 15.8691 25.282 20.0687L26.6781 21.4724C28.0856 18.6765 30 15 33 11.5Z" fill="#898989"/>
            <path d="M33 11.5C37.1872 6.61495 40.7187 6.11239 43.5222 4.72021L42.1262 3.31653C37.9267 3.30503 34.0825 4.62009 30.2141 8.1834C26.3457 11.7467 25.2935 15.8691 25.282 20.0687L26.6781 21.4724C28.0856 18.6765 30 15 33 11.5Z" fill="white" fill-opacity="0.2"/>
            <path d="M29.5161 7.48155C34.0079 3.01432 39.5618 2.60957 41.4282 2.61469L40.0322 1.211C36.5345 0.501496 31.4138 1.40613 27.4221 5.37603C23.4304 9.34594 22.4977 14.4616 23.188 17.9631L24.5841 19.3668C24.5917 16.5671 25.0243 11.9488 29.5161 7.48155Z" fill="#898989"/>
            <path d="M49.5 9.49997L41.5 1.49997C43 1.99997 43.6191 1.91205 46.2426 4.53551C48.8661 7.15897 49 7.99997 49.5 9.49997Z" fill="#898989"/>
            <path d="M49.5 9.49997L41.5 1.49997C43 1.99997 43.6191 1.91205 46.2426 4.53551C48.8661 7.15897 49 7.99997 49.5 9.49997Z" fill="white" fill-opacity="0.4"/>
            <path d="M50 1L45.5 3C46.6794 3.85937 47.2168 4.411 48 5.5L50 1Z" fill="#898989"/>
            <path d="M50 1L45.5 3C46.6794 3.85937 47.2168 4.411 48 5.5L50 1Z" fill="white" fill-opacity="0.6"/>
        `;
        weaponGroup.style.filter = "drop-shadow(0 0 4px rgba(200,200,200,0.4))";
        hammerGroup.appendChild(weaponGroup);

        // Créer un groupe séparé pour les particules de splash qui n'est pas affecté par la rotation du marteau
        const splashGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        splashGroup.style.opacity = '1';
        svg.appendChild(splashGroup);

        const splashParticles = [];
        for (let i = 0; i < 12; i++) {
            const particle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const angle = (i / 12) * Math.PI * 2;
            particle.setAttribute("width", "3");
            particle.setAttribute("height", "8");
            particle.setAttribute("rx", "1");
            particle.setAttribute("fill", "#ffffff");
            particle.setAttribute("opacity", "0");
            particle.setAttribute("transform", `rotate(${angle * (180/Math.PI)})`);
            splashGroup.appendChild(particle);
            splashParticles.push({element: particle, angle: angle});
        }

        svg.appendChild(hammerGroup);

        // Positionner le bout du manche (point de pivot) à un endroit fixe près de la cible
        // Le marteau pivote autour de ce point, qui ne bouge pas
        hammerGroup.style.transformOrigin = '0px 0px'; // Pivot à l'origine du groupe (bout du manche)

        // Animation - Le marteau reste au même endroit (handleBaseX, handleBaseY) et pivote uniquement
        hammerGroup.animate([
            {
                opacity: '0',
                transform: `translate(${handleBaseX}px, ${handleBaseY}px) rotate(${startAngle}deg) scale(0.7)`,
                offset: 0
            },
            {
                opacity: '1',
                transform: `translate(${handleBaseX}px, ${handleBaseY}px) rotate(${startAngle}deg) scale(1)`,
                offset: 0.12
            },
            {
                opacity: '1',
                transform: `translate(${handleBaseX}px, ${handleBaseY}px) rotate(${impactAngle}deg) scale(1.1)`,
                offset: 0.45
            },
            {
                opacity: '1',
                transform: `translate(${handleBaseX}px, ${handleBaseY}px) rotate(${endAngle}deg) scale(1)`,
                offset: 0.85
            },
            {
                opacity: '0',
                transform: `translate(${handleBaseX}px, ${handleBaseY}px) rotate(${endAngle}deg) scale(0.9)`,
                offset: 1
            }
        ], {
            duration: 700,
            easing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)'
        });

        // Déclencher les particules au moment de l'impact (à 315ms pour correspondre à l'impact à 45% de 700ms)
        setTimeout(() => {
            splashParticles.forEach((particleData, i) => {
                const {element, angle} = particleData;
                const distance = 35;
                const endX = Math.cos(angle) * distance;
                const endY = Math.sin(angle) * distance;

                // Les particules partent du centre de la cible (là où la tête frappe)
                element.animate([
                    {
                        opacity: '0',
                        transform: `translate(${centerX}px, ${centerY}px) rotate(${angle * (180/Math.PI)}deg) scale(1)`
                    },
                    {
                        opacity: '0.9',
                        transform: `translate(${centerX + endX * 0.3}px, ${centerY + endY * 0.3}px) rotate(${angle * (180/Math.PI)}deg) scale(1.2)`,
                        offset: 0.3
                    },
                    {
                        opacity: '0',
                        transform: `translate(${centerX + endX}px, ${centerY + endY}px) rotate(${angle * (180/Math.PI)}deg) scale(0.8)`
                    }
                ], {
                    duration: 400,
                    easing: 'ease-out',
                    delay: i * 15
                });
            });
        }, 315);

        const cleanUp = () => {
            try {
                if (hammerGroup.parentNode) {
                    svg.removeChild(hammerGroup);
                }
                if (splashGroup.parentNode) {
                    svg.removeChild(splashGroup);
                }
                if (defs.contains(swordGradient)) defs.removeChild(swordGradient);
                AnimationManager.removePath(hammerGroup);
            } catch(e) {
            }
        };

        setTimeout(cleanUp, 900);

        return hammerGroup;
    }


    function createHealingParticles(startElem, endElem, pathD, svg, trackerSetting) {
        const healGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        healGroup.style.opacity = '1';
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.style.fill = "none";
        path.style.stroke = "none";
        svg.appendChild(path);

        const pathLength = path.getTotalLength();
        const particles = [];
        const numParticles = 15;
        const particleDelay = 30;
        const particleDuration = 400;
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            const size = 2 + Math.random() * 3;
            particle.setAttribute("r", size.toString());
            const colors = [
                "#7dff7d", // Vert très clair
                "#7dffd4", // Turquoise clair
                "#7dd4ff", // Bleu ciel
                "#a8ff7d", // Vert lime clair
                "#7dffff", // Cyan clair
                "#b3ffb3", // Vert pastel
                "#99e6ff"  // Bleu pastel
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.setAttribute("fill", color);
            particle.setAttribute("opacity", "0");
            particle.style.filter = `drop-shadow(0 0 ${size}px ${color})`;

            healGroup.appendChild(particle);
            particles.push({
                element: particle,
                delay: i * particleDelay,
                offset: Math.random() * 0.3 - 0.15,
                speed: 0.8 + Math.random() * 0.4
            });
        }

        svg.appendChild(healGroup);
        particles.forEach((particleData) => {
            const { element, delay, offset, speed } = particleData;

            setTimeout(() => {
                const startTime = performance.now();
                const duration = particleDuration / speed;

                function animateParticle(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const basePoint = path.getPointAtLength(pathLength * progress);
                    const wave = Math.sin(progress * Math.PI * 4) * 10;
                    const perpAngle = Math.atan2(basePoint.y - path.getPointAtLength(Math.max(0, pathLength * progress - 1)).y,
                                                  basePoint.x - path.getPointAtLength(Math.max(0, pathLength * progress - 1)).x) + Math.PI/2;

                    element.setAttribute("cx", basePoint.x + Math.cos(perpAngle) * wave * offset);
                    element.setAttribute("cy", basePoint.y + Math.sin(perpAngle) * wave * offset);
                    let opacity;
                    if (progress < 0.2) {
                        opacity = progress * 5;
                    } else if (progress > 0.8) {
                        opacity = (1 - progress) * 5;
                    } else {
                        opacity = 1;
                    }
                    element.setAttribute("opacity", opacity * 0.8);
                    const sparkle = 0.8 + Math.sin(elapsed * 0.01) * 0.2;
                    element.style.filter = `drop-shadow(0 0 ${parseFloat(element.getAttribute("r")) * sparkle}px ${element.getAttribute("fill")})`;

                    if (progress < 1) {
                        requestAnimationFrame(animateParticle);
                    }
                }

                requestAnimationFrame(animateParticle);
            }, delay);
        });
        const cleanUp = () => {
            try {
                if (healGroup.parentNode) {
                    svg.removeChild(healGroup);
                }
                if (path.parentNode) {
                    svg.removeChild(path);
                }
                AnimationManager.removePath(healGroup);
            } catch(e) {
            }
        };

        const totalDuration = (numParticles * particleDelay) + particleDuration + 500;
        setTimeout(cleanUp, totalDuration);
        setTimeout(cleanUp, 5000);

        return healGroup;
    }

    function createEffect(startElem, endElem, hpDiff, index, reversed = false) {
        let hitTarget = undefined;
        let hitDamage = undefined;
        if (reversed) {
            if (hpDiff >= 0) {
                hitTarget = startElem.querySelector('.FullAvatar_fullAvatar__3RB2h');
            }
            const dmgContainer = startElem.querySelector('.CombatUnit_splatsContainer__2xcc0');
            if (dmgContainer) {
                const dmgDivs = dmgContainer.querySelectorAll('div');
                for (const div of dmgDivs) {
                    if (div.innerText.trim() === '') {
                        startElem = div;
                        hitDamage = div;
                        break;
                    }
                }
            }
        } else {
            if (hpDiff >= 0) {
                hitTarget = endElem.querySelector('.CombatUnit_monsterIcon__2g3AZ');
            }
            const dmgContainer = endElem.querySelector('.CombatUnit_splatsContainer__2xcc0');
            if (dmgContainer) {
                const dmgDivs = dmgContainer.querySelectorAll('div');
                for (const div of dmgDivs) {
                    if (div.innerText.trim() === '') {
                        endElem = div;
                        hitDamage = div;
                        break;
                    }
                }
            }
        }


        const playerName = getPlayerName();
        let isPlayerWithCustomAvatar = false;
        let isAllyHeal = false;
        let playerAttackType = "none";
        let playerFireballColor = "green";

        if (!reversed) {
            if (hpDiff < 0) {
                isAllyHeal = true;
            }

            if (index >= 0 && index <= 4) {
                const playerTrackerSetting = settingsMap["tracker" + index];
                if (playerTrackerSetting && playerTrackerSetting.attackAnimation && playerTrackerSetting.attackAnimation !== "none") {
                    playerAttackType = playerTrackerSetting.attackAnimation;
                    playerFireballColor = playerTrackerSetting.fireballColor || "green";
                }
            }

            if (settingsMap.customAvatar.isTrue && playerName) {
                const container = document.querySelector(".BattlePanel_playersArea__vvwlB");
                if (container && container.children.length > 0) {
                    const playersContainer = container.children[0];
                    const casterElem = playersContainer.children[index];

                    if (casterElem) {
                        const nameElem = casterElem.querySelector('.CombatUnit_name__1SlO1');
                        if (nameElem && nameElem.textContent.trim() === playerName) {
                            isPlayerWithCustomAvatar = true;
                        }
                    }
                }
            }
        }

        let strokeWidth = '1px';
        let filterWidth = '1px';
        let explosionSize = 1;
        const hpDiffCoeff = hpDiff > 0 ? hpDiff : (-2*hpDiff);
        if (hpDiffCoeff >= 1000){
            strokeWidth = '5px';
            filterWidth = '6px';
            explosionSize = 6;
        } else if (hpDiffCoeff >= 700) {
            strokeWidth = '4px';
            filterWidth = '5px';
            explosionSize = 5;
        } else if (hpDiffCoeff >= 500) {
            strokeWidth = '3px';
            filterWidth = '4px';
            explosionSize = 4;
        } else if (hpDiffCoeff >= 300) {
            strokeWidth = '2px';
            filterWidth = '3px';
            explosionSize = 3;
        } else if (hpDiffCoeff >= 100) {
            filterWidth = '2px';
            explosionSize = 2;
        }

        const svg = document.getElementById('svg-container');

        if (reversed) {index = 6;}
        const trackerSetting = settingsMap["tracker"+index];
        const lineColor = "rgba("+trackerSetting.r+", "+trackerSetting.g+", "+trackerSetting.b+", 1)";
        const filterColor = "rgba("+trackerSetting.r+", "+trackerSetting.g+", "+trackerSetting.b+", 0.8)";
        let frameColor = undefined;
        let frameBorderColor = undefined;
        if (hpDiff > 0) {
            frameColor = "rgba("+trackerSetting.frameR+", "+trackerSetting.frameG+", "+trackerSetting.frameB+", 0.9)";
            frameBorderColor = "rgba("+trackerSetting.frameR+", "+trackerSetting.frameG+", "+trackerSetting.frameB+", 1)";
        }

        const pathD = createParabolaPath(startElem, endElem, reversed);

        if (playerAttackType !== "none" && !reversed && hpDiff >= 0) {
            if (hpDiff === 0) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.style.stroke = lineColor;
                path.style.strokeWidth = '1px';
                path.style.fill = 'none';
                path.style.opacity = '0.3';
                path.style.strokeDasharray = '5, 5';
                path.setAttribute('d', pathD);
                svg.appendChild(path);
                AnimationManager.addPath(path);
                const endXY = pathD.split(', ')[1].split(' ');
                const endPoint = { x: endXY[0], y: endXY[1] };
                setTimeout(() => {
                    createMissEffect(hitDamage, endPoint, svg, true);
                }, 100);
                setTimeout(() => {
                    path.style.transition = 'opacity 0.3s';
                    path.style.opacity = '0';
                    setTimeout(() => {
                        if (path.parentNode) svg.removeChild(path);
                        AnimationManager.removePath(path);
                    }, 300);
                }, 600);
                return;
            }

            if (playerAttackType === "mage") {
                const fireball = createFireballAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed, playerFireballColor);
                AnimationManager.addPath(fireball);
                setTimeout(() => {
                    const endXY = pathD.split(', ')[1].split(' ');
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, fireball, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, 500);
                return;
            }
            else if (playerAttackType === "ranged") {
                const arrow = createArrowAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed);
                AnimationManager.addPath(arrow);
                setTimeout(() => {
                    const endXY = pathD.split(', ')[1].split(' ');
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, arrow, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, 500);
                return;
            }
            else if (playerAttackType === "melee") {
                const slash = createSwordSlashEffect(endElem, svg, trackerSetting);
                AnimationManager.addPath(slash);
                setTimeout(() => {
                    const endXY = pathD.split(', ')[1].split(' ');
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, slash, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, 300);
                return;
            }
        }

        if (isPlayerWithCustomAvatar && hpDiff === 0) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.style.stroke = lineColor;
            path.style.strokeWidth = '1px';
            path.style.fill = 'none';
            path.style.opacity = '0.3';
            path.style.strokeDasharray = '5, 5';
            path.setAttribute('d', pathD);
            svg.appendChild(path);
            AnimationManager.addPath(path);
            const endXY = pathD.split(', ')[1].split(' ');
            const endPoint = { x: endXY[0], y: endXY[1] };
            setTimeout(() => {
                createMissEffect(hitDamage, endPoint, svg, true);
            }, 100);
            setTimeout(() => {
                path.style.transition = 'opacity 0.3s';
                path.style.opacity = '0';
                setTimeout(() => {
                    if (path.parentNode) svg.removeChild(path);
                    AnimationManager.removePath(path);
                }, 300);
            }, 600);

            return;
        }
        if (isPlayerWithCustomAvatar && hpDiff > 0) {
            const attackType = settingsMap.attackAnimation.value;

            if (attackType === "mage") {
                const fireball = createFireballAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed, "green");
                AnimationManager.addPath(fireball);
                setTimeout(() => {
                    const endXY = pathD.split(', ')[1].split(' ');
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, fireball, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, 500);
            }
            else if (attackType === "ranged") {
                const arrow = createArrowAnimation(startElem, endElem, pathD, svg, trackerSetting, reversed);
                AnimationManager.addPath(arrow);
                setTimeout(() => {
                    const endXY = pathD.split(', ')[1].split(' ');
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, arrow, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, 500);
            }
            else if (attackType === "melee") {
                const slash = createSwordSlashEffect(endElem, svg, trackerSetting);
                AnimationManager.addPath(slash);
                setTimeout(() => {
                    const endXY = pathD.split(', ')[1].split(' ');
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, slash, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, 300);
            }

            return;
        }
        if (isAllyHeal) {
            const healParticles = createHealingParticles(startElem, endElem, pathD, svg, trackerSetting);
            AnimationManager.addPath(healParticles);
            setTimeout(() => {
                if (hitTarget) {
                    hitTarget.animate([
                        { filter: 'brightness(1) drop-shadow(0 0 0px transparent)' },
                        { filter: 'brightness(1.3) drop-shadow(0 0 15px #7dffb3)' },
                        { filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }
                    ], {
                        duration: 800,
                        easing: 'ease-in-out'
                    });
                }
            }, 300);

            return;
        }
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        Object.assign(path.style, {
            stroke: lineColor,
            strokeWidth: strokeWidth,
            fill: 'none',
            strokeLinecap: 'round',
            filter: 'drop-shadow(0 0 '+filterWidth+' '+filterColor+')'
        });

        path.setAttribute('d', pathD);
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.opacity = '1';

        svg.appendChild(path);
        AnimationManager.addPath(path);
        const cleanUp = () => {
            try {
                if (path.parentNode) {
                    svg.removeChild(path);
                }
                AnimationManager.removePath(path);
            } catch(e) {
            }
        };
        const endXY = pathD.split(', ')[1].split(' ');
        if (hpDiff === 0) {
            requestAnimationFrame(() => {
                path.style.transition = 'stroke-dashoffset 0.1s linear, opacity 0.3s linear';
                path.style.strokeDashoffset = '0';
                path.style.opacity = '0.4';
            });
            createMissEffect(hitDamage, null, svg, false);
        } else {
            requestAnimationFrame(() => {
                path.style.transition = 'stroke-dashoffset 0.1s linear';
                path.style.strokeDashoffset = '0';
                path.addEventListener('transitionend', () => {
                    createHitEffect({x:endXY[0], y:endXY[1]}, svg, path, hitTarget, explosionSize, hitDamage, frameColor, frameBorderColor, trackerSetting);
                }, {once: true});
            });
        }
        setTimeout(() => {
            path.style.transition = 'none';

            requestAnimationFrame(() => {
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = '0';

                path.style.transition = 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 1, 1)';
                path.style.strokeDashoffset = -length;

                const removeElement = () => {
                    cleanUp();
                    path.removeEventListener('transitionend', removeElement);
                };
                path.addEventListener('transitionend', removeElement);
            });
        }, 600);
        const forceCleanupTimer = setTimeout(cleanUp, 5000);
        path.addEventListener('transitionend', () => clearTimeout(forceCleanupTimer));
    }


    function createMissEffect(hitDamage, endPoint, svg, isPlayerMiss = false) {
        if (!settingsMap.moreEffect.isTrue) {
            return null;
        }

        if (hitDamage !== undefined) {
            hitDamage.animate(
                [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
                {
                    duration: 600,
                    easing: 'ease-in-out'
                }
            );
        }
        if (!isPlayerMiss) {
            return;
        }
        const missText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        missText.textContent = "MISS";
        missText.setAttribute("x", endPoint ? endPoint.x : "0");
        missText.setAttribute("y", endPoint ? endPoint.y : "0");
        missText.setAttribute("text-anchor", "middle");
        missText.setAttribute("dominant-baseline", "middle");
        missText.style.fontSize = "18px";
        missText.style.fontWeight = "600";
        missText.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        missText.style.fill = "#888888";
        missText.style.stroke = "#ffffff";
        missText.style.strokeWidth = "2px";
        missText.style.paintOrder = "stroke";
        missText.style.opacity = "0";
        missText.style.userSelect = "none";
        missText.style.pointerEvents = "none";
        missText.style.filter = "drop-shadow(0px 1px 3px rgba(0,0,0,0.6))";
        missText.style.letterSpacing = "1px";

        svg.appendChild(missText);

        const side = Math.random() > 0.5 ? 1 : -1;
        const tilt = side * (10 + Math.random() * 15);
        const driftX = side * (20 + Math.random() * 30);
        const fallDistance = 50 + Math.random() * 30;
        requestAnimationFrame(() => {
            missText.animate([
                {
                    transform: 'translate(0, 0) scale(0.8) rotate(0deg)',
                    opacity: '0'
                },
                {
                    transform: 'translate(0, -10px) scale(1.1) rotate(0deg)',
                    opacity: '1',
                    offset: 0.15
                },
                {
                    transform: `translate(${driftX * 0.3}px, 5px) scale(1) rotate(${tilt * 0.3}deg)`,
                    opacity: '0.9',
                    offset: 0.4
                },
                {
                    transform: `translate(${driftX * 0.7}px, ${fallDistance * 0.6}px) scale(0.95) rotate(${tilt * 0.7}deg)`,
                    opacity: '0.6',
                    offset: 0.7
                },
                {
                    transform: `translate(${driftX}px, ${fallDistance}px) scale(0.9) rotate(${tilt}deg)`,
                    opacity: '0'
                }
            ], {
                duration: 1500,
                easing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
                fill: 'forwards'
            }).onfinish = () => {
                if (missText.parentNode) {
                    svg.removeChild(missText);
                }
            };
        });
        setTimeout(() => {
            if (missText.parentNode) {
                svg.removeChild(missText);
            }
        }, 2000);
    }


    function calculateHueRotation(targetR, targetG, targetB) {
        const r = targetR / 255;
        const g = targetG / 255;
        const b = targetB / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;

        if (max !== min) {
            const d = max - min;
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        const targetHue = h * 360;

        return `hue-rotate(${targetHue}deg)`;
    }
    function createHitEffect(point, container, path, hitTarget = undefined, explosionSize = 1, hitDamage = undefined, frameColor = undefined, frameBorderColor = undefined, trackerSetting = undefined) {
        if (!settingsMap.moreEffect.isTrue) {
            return null;
        }
        const WAVE_CONFIG = {
            startSize: explosionSize*2,
            endSize: explosionSize*4,
            strokeWidth: 3,
            duration: 500
        };
        const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        core.setAttribute("cx", point.x);
        core.setAttribute("cy", point.y);
        core.setAttribute("r", "0");
        core.style.fill = 'rgba(255,255,255,0.9)';
        core.style.filter = 'blur(4px)';
        container.appendChild(core);

        core.animate([
            {
                r: WAVE_CONFIG.startSize,
                opacity: 1,
                strokeWidth: WAVE_CONFIG.strokeWidth
            },
            {
                r: WAVE_CONFIG.endSize,
                opacity: 0,
                strokeWidth: 0
            }
        ], {
            duration: WAVE_CONFIG.duration,
            easing: 'ease-out'
        }).onfinish = () => core.remove();

        const PARTICLES_CONFIG = {
            count: explosionSize*3,
            baseSize: 1+explosionSize/3,
            sizeVariation: 1.5,
            minSpeed: explosionSize*4,
            maxSpeed: explosionSize*8
        };

        for(let i=0; i<PARTICLES_CONFIG.count; i++) {
            const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const size = PARTICLES_CONFIG.baseSize + Math.random()*PARTICLES_CONFIG.sizeVariation;
            particle.setAttribute("cx", point.x);
            particle.setAttribute("cy", point.y);
            particle.setAttribute("r", size);
            particle.style.fill = path.style.stroke;
            container.appendChild(particle);


            const angle = Math.random() * Math.PI*2;
            const dist = PARTICLES_CONFIG.minSpeed + Math.random()*(PARTICLES_CONFIG.maxSpeed-PARTICLES_CONFIG.minSpeed);
            particle.animate([
                {transform: `translate(0,0)`, opacity: 1},
                {transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`, opacity: 0}
            ], {
                duration: 400,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
        if (hitTarget!==undefined) {
            const shake = explosionSize*2-1;
            if (explosionSize < 3) {
                hitTarget.animate([
                    {transform: 'translate(0,0)'},
                    {transform: `translate(-${shake*2}px,-${shake}px)`},
                    {transform: `translate(${shake}px,${shake*2}px)`},
                    {transform: 'translate(0,0)'}
                ], {
                    duration: 90+explosionSize*10,
                    iterations: 2
                });
            } else if (explosionSize < 5) {
                hitTarget.animate([
                    {transform: 'translate(0,0)'},
                    {transform: `translate(-${shake*2}px,-${shake}px)`},
                    {transform: `translate(${shake}px,${shake*2}px)`},
                    {transform: `translate(-${shake}px,-${shake}px)`},
                    {transform: 'translate(0,0)'}
                ], {
                    duration: 90+explosionSize*10,
                    iterations: 2
                });
            } else {
                hitTarget.animate([
                    {transform: 'translate(0,0)'},
                    {transform: `translate(-${shake*2}px,-${shake}px)`},
                    {transform: `translate(${shake}px,-${shake}px)`},
                    {transform: `translate(${shake}px,${shake*2}px)`},
                    {transform: `translate(-${shake}px,${shake}px)`},
                    {transform: 'translate(0,0)'}
                ], {
                    duration: 90+explosionSize*10,
                    iterations: 2
                });
            }
        }
        if (hitDamage!==undefined) {
            const originalZIndex = hitDamage.style.zIndex || 'auto';

            if (frameColor && frameBorderColor && trackerSetting) {
                const hueFilter = calculateHueRotation(trackerSetting.frameR, trackerSetting.frameG, trackerSetting.frameB);

                if (settingsMap.keepOriginalDamageColor.isTrue) {
                    hitDamage.animate([
                        { filter: `${hueFilter} brightness(1.2) saturate(1.5)`, offset: 0 },
                        { filter: `${hueFilter} brightness(1.2) saturate(1.5)`, offset: 0.85 },
                        { filter: 'none', offset: 1 }
                    ], {
                        duration: explosionSize < 3 ? 1500 : (explosionSize < 5 ? 1800 : 2100),
                        easing: 'ease-out',
                        fill: 'none'
                    });
                } else {
                    hitDamage.animate([
                        { filter: `${hueFilter} brightness(1.2) saturate(1.5)` }
                    ], {
                        duration: 3000,
                        fill: 'forwards'
                    });
                }
            }

            if (explosionSize < 3) {
                hitDamage.animate([
                    { transform: 'scale(1)', offset: 0 },
                    { transform: 'scale(1.2)', offset: 0.6 },
                    { transform: 'scale(0.9)', offset: 0.85 },
                    { transform: 'scale(1)', offset: 1 }
                ], {
                    duration: 1500,
                    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                });
            } else if (explosionSize < 5) {
                hitDamage.animate([
                    { transform: 'scale(1)', offset: 0 },
                    { transform: 'scale(1.4)', offset: 0.6 },
                    { transform: 'scale(0.9)', offset: 0.85 },
                    { transform: 'scale(1)', offset: 1 }
                ], {
                    duration: 1800,
                    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                });
            } else {
                hitDamage.animate([
                    { transform: 'scale(1)', offset: 0 },
                    { transform: 'scale(1.6)', offset: 0.6 },
                    { transform: 'scale(0.9)', offset: 0.85 },
                    { transform: 'scale(1)', offset: 1 }
                ], {
                    duration: 2100,
                    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                });
            }
        }
    }


    let isResizeListenerAdded = false;
    function createLine(from, to, hpDiff, reversed = false) {
        if (hpDiff === 0 && !settingsMap.missedLine.isTrue) {return null;}
        if (hpDiff >= 0) {
            if (reversed){
                if (!settingsMap.tracker6.isTrue) {
                    return null;
                }
            } else {
                if (!settingsMap["tracker"+from].isTrue) {
                    return null;
                }
            }
        } else {
            if (reversed){
                if (!settingsMap.tracker6.isTrueH) {
                    return null;
                }
            } else {
                if (!settingsMap["tracker"+from].isTrueH) {
                    return null;
                }
            }
        }
        if (!AnimationManager.canCreate()) {
            return null;
        }
        const container = document.querySelector(".BattlePanel_playersArea__vvwlB");
        if (container && container.children.length > 0) {
            const playersContainer = container.children[0];
            const monsterContainer = document.querySelector(".BattlePanel_monstersArea__2dzrY").children[0];
            const effectFrom = (reversed&&hpDiff<0)?monsterContainer.children[from]:playersContainer.children[from];
            const effectTo = (!reversed&&hpDiff<0)?playersContainer.children[to]:monsterContainer.children[to];
            const svg = document.getElementById('svg-container');
            if(!svg){
                const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgContainer.id = 'svg-container';
                Object.assign(svgContainer.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: '190'
                });

                svgContainer.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
                svgContainer.setAttribute('preserveAspectRatio', 'none');
                const updateViewBox = () => {
                    if (document.getElementById('svg-container') !== undefined) {
                        document.getElementById('svg-container').setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
                    }
                };
                document.querySelector(".GamePage_mainPanel__2njyb").appendChild(svgContainer);
                updateViewBox();
                if (!isResizeListenerAdded) {
                    window.addEventListener('resize', () => {
                        updateViewBox();
                    });
                    isResizeListenerAdded = true;
                }
            }

            if (reversed) {
                createEffect(effectFrom, effectTo, hpDiff, from, reversed);
            } else {
                createEffect(effectFrom, effectTo, hpDiff, from, reversed);
            }
        }

    }

    function handleMessage(message) {
        let obj = JSON.parse(message);
        if (obj && obj.type === "new_battle") {
            monstersHP = obj.monsters.map((monster) => monster.currentHitpoints);
            monstersMP = obj.monsters.map((monster) => monster.currentManapoints);
            monstersDmgCounter = obj.monsters.map((monster) => monster.damageSplatCounter);
            playersHP = obj.players.map((player) => player.currentHitpoints);
            playersMP = obj.players.map((player) => player.currentManapoints);
            playersDmgCounter = obj.players.map((player) => player.damageSplatCounter);
        } else if (obj && obj.type === "battle_updated" && monstersHP.length) {
            const mMap = obj.mMap;
            const pMap = obj.pMap;
            const monsterIndices = Object.keys(obj.mMap);
            const playerIndices = Object.keys(obj.pMap);

            let castMonster = -1;
            monsterIndices.forEach((monsterIndex) => {
                if(mMap[monsterIndex].cMP < monstersMP[monsterIndex]){castMonster = monsterIndex;}
                monstersMP[monsterIndex] = mMap[monsterIndex].cMP;
            });
            let castPlayer = -1;
            playerIndices.forEach((userIndex) => {
                if(pMap[userIndex].cMP < playersMP[userIndex]){castPlayer = userIndex;}
                playersMP[userIndex] = pMap[userIndex].cMP;
            });

            let hurtMonster = false;
            let hurtPlayer = false;
            let monsterLifeSteal = {from:null, to:null, hpDiff:null};
            let playerLifeSteal = {from:null, to:null, hpDiff:null};
            monstersHP.forEach((mHP, mIndex) => {
                const monster = mMap[mIndex];
                if (monster) {
                    const hpDiff = mHP - monster.cHP;
                    if (hpDiff > 0) {hurtMonster = true;}
                    let dmgSplat = false;
                    if (monstersDmgCounter[mIndex] < monster.dmgCounter) {dmgSplat = true;}//判断是否受击（包括命中和miss）
                    monstersHP[mIndex] = monster.cHP;
                    monstersDmgCounter[mIndex] = monster.dmgCounter;
                    if (dmgSplat && hpDiff >= 0 && playerIndices.length > 0) {
                        if (playerIndices.length > 1) {
                            playerIndices.forEach((userIndex) => {
                                if(userIndex === castPlayer) {
                                    createLine(userIndex, mIndex, hpDiff);
                                }
                            });
                        } else {
                            createLine(playerIndices[0], mIndex, hpDiff);
                        }
                    }
                    if (hpDiff < 0 ) {
                        if (castMonster > -1){
                            createLine(mIndex, castMonster, hpDiff, true);
                        }else{
                            monsterLifeSteal.from=mIndex;
                            monsterLifeSteal.to=mIndex;
                            monsterLifeSteal.hpDiff=hpDiff;
                        }
                    }
                }
            });

            playersHP.forEach((pHP, pIndex) => {
                const player = pMap[pIndex];
                if (player) {
                    const hpDiff = pHP - player.cHP;
                    if (hpDiff > 0) {hurtPlayer = true;}
                    let dmgSplat = false;
                    if (playersDmgCounter[pIndex] < player.dmgCounter) {dmgSplat = true;}//判断是否受击（包括命中和miss）
                    playersHP[pIndex] = player.cHP;
                    playersDmgCounter[pIndex] = player.dmgCounter;
                    if (dmgSplat && hpDiff >= 0 && monsterIndices.length > 0) {
                        if (monsterIndices.length > 1) {
                            monsterIndices.forEach((monsterIndex) => {
                                if(monsterIndex === castMonster) {
                                    createLine(pIndex, monsterIndex, hpDiff, true);
                                }
                            });
                        } else {
                            createLine(pIndex, monsterIndices[0], hpDiff, true);
                        }
                    }
                    if (hpDiff < 0 ) {
                        if (castPlayer > -1){
                            createLine(castPlayer, pIndex, hpDiff);
                        }else{
                            playerLifeSteal.from=pIndex;
                            playerLifeSteal.to=pIndex;
                            playerLifeSteal.hpDiff=hpDiff;
                        }
                    }
                }
            });
            if (hurtMonster && playerLifeSteal.from !== null) {
                createLine(playerLifeSteal.from, playerLifeSteal.to, playerLifeSteal.hpDiff);
            }
            if (hurtPlayer && monsterLifeSteal.from !== null) {
                createLine(monsterLifeSteal.from, monsterLifeSteal.to, monsterLifeSteal.hpDiff, true);
            }
        }
        return message;
    }

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

})();
