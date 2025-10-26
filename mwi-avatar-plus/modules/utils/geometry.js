/**
 * Geometry utilities for element positioning
 */

/**
 * Get the center point of a DOM element
 * @param {HTMLElement} element - The DOM element
 * @returns {{x: number, y: number}} Center coordinates
 */
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

// Export to global scope for Tampermonkey
window.getElementCenter = getElementCenter;
