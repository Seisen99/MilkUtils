/**
 * Color picker modal component with circular HSV picker
 */

/**
 * Convert RGB to HSV
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Object} HSV values {h: 0-360, s: 0-1, v: 0-1}
 */
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;
    
    if (diff !== 0) {
        if (max === r) {
            h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            h = ((b - r) / diff + 2) / 6;
        } else {
            h = ((r - g) / diff + 4) / 6;
        }
    }
    
    return { h: h * 360, s, v };
}

/**
 * Convert HSV to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} v - Value (0-1)
 * @returns {Object} RGB values {r: 0-255, g: 0-255, b: 0-255}
 */
function hsvToRgb(h, s, v) {
    h = h / 360;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Create a color picker modal with circular HSV picker
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
        titleElem.style.cssText = 'color: white; margin: 0 0 20px 0; text-align: center; font-size: 18px;';
        modal.appendChild(titleElem);
    }

    // Convert initial RGB to HSV
    let currentHsv = rgbToHsv(initialColor.r, initialColor.g, initialColor.b);
    let currentRgb = {...initialColor};

    // Create container for picker
    const pickerContainer = document.createElement('div');
    pickerContainer.className = 'color-picker-container';

    // Canvas for color wheel
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 280;
    canvas.className = 'color-wheel-canvas';
    const ctx = canvas.getContext('2d');

    // Draw color wheel
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 130;
    const innerRadius = 90;

    function drawColorWheel() {
        // Draw hue ring
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 90) * Math.PI / 180;
            const endAngle = (angle + 1 - 90) * Math.PI / 180;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();
            
            const rgb = hsvToRgb(angle, 1, 1);
            ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
            ctx.fill();
        }

        // Draw saturation/value square
        const squareSize = innerRadius * 1.4;
        const squareX = centerX - squareSize / 2;
        const squareY = centerY - squareSize / 2;

        // Get current hue color
        const hueRgb = hsvToRgb(currentHsv.h, 1, 1);
        
        // Create gradients
        const satGradient = ctx.createLinearGradient(squareX, squareY, squareX + squareSize, squareY);
        satGradient.addColorStop(0, 'white');
        satGradient.addColorStop(1, `rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);
        
        ctx.fillStyle = satGradient;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
        
        const valGradient = ctx.createLinearGradient(squareX, squareY, squareX, squareY + squareSize);
        valGradient.addColorStop(0, 'rgba(0,0,0,0)');
        valGradient.addColorStop(1, 'rgba(0,0,0,1)');
        
        ctx.fillStyle = valGradient;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
    }

    function drawHandles() {
        // Clear previous handles
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawColorWheel();

        // Draw hue handle on ring
        const hueAngle = (currentHsv.h - 90) * Math.PI / 180;
        const hueRadius = (outerRadius + innerRadius) / 2;
        const hueX = centerX + Math.cos(hueAngle) * hueRadius;
        const hueY = centerY + Math.sin(hueAngle) * hueRadius;

        ctx.beginPath();
        ctx.arc(hueX, hueY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw saturation/value handle on square
        const squareSize = innerRadius * 1.4;
        const squareX = centerX - squareSize / 2;
        const squareY = centerY - squareSize / 2;
        const svX = squareX + currentHsv.s * squareSize;
        const svY = squareY + (1 - currentHsv.v) * squareSize;

        ctx.beginPath();
        ctx.arc(svX, svY, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${currentRgb.r},${currentRgb.g},${currentRgb.b})`;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawHandles();

    // Preview
    const preview = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    preview.setAttribute("width", "280");
    preview.setAttribute("height", "80");
    preview.style.cssText = 'display: block; margin-top: 15px;';
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.style.cssText = 'stroke-width: 8px; fill: none; stroke-linecap: round;';
    path.setAttribute("d", "M 20 60 Q 140 10 260 60");
    path.style.stroke = `rgb(${currentRgb.r},${currentRgb.g},${currentRgb.b})`;
    preview.appendChild(path);

    // RGB display
    const rgbDisplay = document.createElement('div');
    rgbDisplay.className = 'rgb-display';
    rgbDisplay.textContent = `RGB(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`;

    function updateColor() {
        currentRgb = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
        path.style.stroke = `rgb(${currentRgb.r},${currentRgb.g},${currentRgb.b})`;
        rgbDisplay.textContent = `RGB(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`;
        drawHandles();
    }

    // Mouse interaction
    let isDragging = false;
    let dragTarget = null;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if clicking on hue ring
        if (distance >= innerRadius && distance <= outerRadius) {
            dragTarget = 'hue';
            isDragging = true;
            updateHue(x, y);
        }
        // Check if clicking on saturation/value square
        else if (distance < innerRadius) {
            dragTarget = 'sv';
            isDragging = true;
            updateSaturationValue(x, y);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (dragTarget === 'hue') {
            updateHue(x, y);
        } else if (dragTarget === 'sv') {
            updateSaturationValue(x, y);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        dragTarget = null;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        dragTarget = null;
    });

    function updateHue(x, y) {
        const dx = x - centerX;
        const dy = y - centerY;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        if (angle < 0) angle += 360;
        currentHsv.h = angle;
        updateColor();
    }

    function updateSaturationValue(x, y) {
        const squareSize = innerRadius * 1.4;
        const squareX = centerX - squareSize / 2;
        const squareY = centerY - squareSize / 2;

        const s = Math.max(0, Math.min(1, (x - squareX) / squareSize));
        const v = Math.max(0, Math.min(1, 1 - (y - squareY) / squareSize));

        currentHsv.s = s;
        currentHsv.v = v;
        updateColor();
    }

    // Buttons
    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = isZH ? '✓ 确定' : '✓ OK';
    confirmBtn.className = 'confirm-button';
    confirmBtn.onclick = () => {
        callback(currentRgb);
        backdrop.remove();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = isZH ? '✕ 取消' : '✕ Cancel';
    cancelBtn.className = 'cancel-button';
    cancelBtn.onclick = () => backdrop.remove();

    actions.append(cancelBtn, confirmBtn);

    pickerContainer.append(canvas, preview, rgbDisplay);
    modal.append(pickerContainer, actions);
    backdrop.append(modal);

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
    });

    return backdrop;
}

// Export to global scope for Tampermonkey
window.createColorPicker = createColorPicker;
