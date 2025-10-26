/**
 * Color picker modal component
 */

/**
 * Create a color picker modal
 * @param {Object} initialColor - Initial color {r, g, b}
 * @param {Function} callback - Callback function when color is confirmed
 * @param {string} title - Modal title
 * @returns {HTMLElement} The modal backdrop element
 */
function createColorPicker(initialColor, callback, title = "", settingId) {
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
    let currentColor = {...initialColor};

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

    const getColorString = (color) => `rgb(${color.r},${color.g},${color.b})`;

    path.style.stroke = getColorString(initialColor);
    modal.append(preview, controls, actions);
    backdrop.append(modal);

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
    });

    return backdrop;
}
