/**
 * Arrow projectile animation with rotation along path
 */

/**
 * Create animated arrow projectile
 * @param {HTMLElement} startElem - Starting element
 * @param {HTMLElement} endElem - Target element
 * @param {string} pathD - SVG path d attribute
 * @param {SVGElement} svg - SVG container
 * @param {Object} trackerSetting - Tracker settings
 * @param {boolean} reversed - Reverse direction
 * @returns {SVGElement} The arrow group element
 */
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
