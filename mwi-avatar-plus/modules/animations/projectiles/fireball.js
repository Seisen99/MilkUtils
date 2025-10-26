/**
 * Fireball projectile animation with gradient and particle trail
 */

/**
 * Create animated fireball projectile
 * @param {HTMLElement} startElem - Starting element
 * @param {HTMLElement} endElem - Target element
 * @param {string} pathD - SVG path d attribute
 * @param {SVGElement} svg - SVG container
 * @param {Object} trackerSetting - Tracker settings
 * @param {boolean} reversed - Reverse direction
 * @param {string} fireballColor - Color scheme: 'green', 'red', or 'blue'
 * @returns {SVGElement} The fireball group element
 */
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
