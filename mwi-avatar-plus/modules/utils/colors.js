/**
 * Color manipulation utilities
 */

/**
 * Calculate hue rotation filter for target RGB color
 * @param {number} targetR - Red value (0-255)
 * @param {number} targetG - Green value (0-255)
 * @param {number} targetB - Blue value (0-255)
 * @returns {string} CSS hue-rotate filter string
 */
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

// Export to global scope for Tampermonkey
window.calculateHueRotation = calculateHueRotation;
