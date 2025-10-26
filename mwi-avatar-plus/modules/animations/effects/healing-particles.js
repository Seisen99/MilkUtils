/**
 * Healing particles animation - colorful particles flowing along a path
 */

/**
 * Create healing particles animation
 * @param {HTMLElement} startElem - Start element
 * @param {HTMLElement} endElem - End element
 * @param {string} pathD - SVG path d attribute
 * @param {SVGElement} svg - SVG container
 * @param {Object} trackerSetting - Tracker settings
 * @returns {SVGElement} The particle group element
 */
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
