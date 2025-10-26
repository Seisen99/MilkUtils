/**
 * SVG path creation utilities
 */

/**
 * Create a parabolic path between two elements
 * @param {HTMLElement} startElem - Start element
 * @param {HTMLElement} endElem - End element
 * @param {boolean} reversed - If true, reverse the path direction
 * @returns {string} SVG path d attribute
 */
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

// Export to global scope for Tampermonkey
window.createParabolaPath = createParabolaPath;
