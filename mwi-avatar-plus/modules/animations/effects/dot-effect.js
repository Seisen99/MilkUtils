/**
 * DoT (Damage over Time) effect animations
 * Creates visual effects for periodic damage like burning, poison, bleed, etc.
 */

/**
 * Create DoT burn effect animation
 * @param {HTMLElement} targetElem - Target element receiving DoT
 * @param {SVGElement} svg - SVG container
 * @param {Object} trackerSetting - Tracker settings
 * @param {string} dotType - Type of DoT: 'fire', 'poison', 'bleed'
 * @returns {SVGElement} The DoT effect group element
 */
function createDotEffect(targetElem, svg, trackerSetting, dotType = "fire") {
    const targetRect = targetElem.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;

    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

    // Color schemes for different DoT types
    const colorSchemes = {
        fire: {
            overlay: ['#ff6b00', '#ff0000', '#8b0000'],
            flames: ['#ff8c00', '#ff4500', '#ff0000'],
            particles: ['#ffaa00', '#ff6600', '#333333']
        },
        poison: {
            overlay: ['#00ff00', '#00cc00', '#006600'],
            flames: ['#00ff00', '#00cc00', '#009900'],
            particles: ['#66ff66', '#00cc00', '#003300']
        },
        bleed: {
            overlay: ['#ff0000', '#cc0000', '#660000'],
            flames: ['#ff0000', '#cc0000', '#990000'],
            particles: ['#ff6666', '#cc0000', '#330000']
        }
    };

    const colors = colorSchemes[dotType] || colorSchemes.fire;

    // Main group container
    const dotGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    dotGroup.style.opacity = '1';

    // Create defs for gradients
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(defs);
    }

    // Burning overlay gradient
    const overlayGradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
    overlayGradient.id = `dotOverlay_${uniqueId}`;
    overlayGradient.innerHTML = `
        <stop offset="0%" style="stop-color:${colors.overlay[0]};stop-opacity:0.6" />
        <stop offset="50%" style="stop-color:${colors.overlay[1]};stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:${colors.overlay[2]};stop-opacity:0" />
    `;
    defs.appendChild(overlayGradient);

    // Glow filter
    const glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    glowFilter.id = `dotGlow_${uniqueId}`;
    glowFilter.innerHTML = `
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    `;
    defs.appendChild(glowFilter);

    // Pulsing overlay circle
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    overlay.setAttribute("cx", centerX);
    overlay.setAttribute("cy", centerY);
    overlay.setAttribute("r", "30");
    overlay.setAttribute("fill", `url(#dotOverlay_${uniqueId})`);
    overlay.setAttribute("filter", `url(#dotGlow_${uniqueId})`);
    dotGroup.appendChild(overlay);

    // Pulsing animation for overlay
    overlay.animate([
        { r: '25', opacity: '0.8' },
        { r: '35', opacity: '0.5' },
        { r: '25', opacity: '0.8' }
    ], {
        duration: 700,
        easing: 'ease-in-out'
    });

    // Create flame shapes
    const flameGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const numFlames = 4;
    const flames = [];

    for (let i = 0; i < numFlames; i++) {
        const flame = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const angle = (i / numFlames) * Math.PI * 2;
        const offsetX = Math.cos(angle) * 15;
        const offsetY = Math.sin(angle) * 15;
        
        // Simple flame shape using path
        const flameHeight = 12 + Math.random() * 6;
        const flameWidth = 6 + Math.random() * 3;
        const flamePath = `
            M ${centerX + offsetX} ${centerY + offsetY}
            Q ${centerX + offsetX - flameWidth/2} ${centerY + offsetY - flameHeight/2},
              ${centerX + offsetX} ${centerY + offsetY - flameHeight}
            Q ${centerX + offsetX + flameWidth/2} ${centerY + offsetY - flameHeight/2},
              ${centerX + offsetX} ${centerY + offsetY}
            Z
        `;
        
        flame.setAttribute("d", flamePath);
        flame.setAttribute("fill", colors.flames[i % colors.flames.length]);
        flame.setAttribute("opacity", "0.7");
        flame.setAttribute("filter", `url(#dotGlow_${uniqueId})`);
        
        flameGroup.appendChild(flame);
        flames.push({ element: flame, startY: centerY + offsetY, offsetX: offsetX });
    }

    dotGroup.appendChild(flameGroup);

    // Animate flames rising and flickering
    flames.forEach((flameData, i) => {
        const { element, startY, offsetX } = flameData;
        
        element.animate([
            { 
                opacity: '0',
                transform: `translateY(0px) scale(0.8)`
            },
            { 
                opacity: '0.8',
                transform: `translateY(-10px) scale(1.1)`,
                offset: 0.3
            },
            { 
                opacity: '0.6',
                transform: `translateY(-20px) scale(0.9)`,
                offset: 0.6
            },
            { 
                opacity: '0',
                transform: `translateY(-30px) scale(0.7)`
            }
        ], {
            duration: 600,
            easing: 'ease-out',
            delay: i * 50
        });
    });

    // Create smoke/ash particles
    const particleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const numParticles = 8;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const angle = (i / numParticles) * Math.PI * 2;
        const offsetX = Math.cos(angle) * (10 + Math.random() * 10);
        const offsetY = Math.sin(angle) * (10 + Math.random() * 10);
        
        particle.setAttribute("cx", centerX + offsetX);
        particle.setAttribute("cy", centerY + offsetY);
        particle.setAttribute("r", 1 + Math.random() * 2);
        particle.setAttribute("fill", colors.particles[Math.floor(Math.random() * colors.particles.length)]);
        particle.setAttribute("opacity", "0");
        
        particleGroup.appendChild(particle);

        // Animate particles rising
        particle.animate([
            { 
                opacity: '0',
                transform: `translate(0px, 0px)`,
                r: particle.getAttribute("r")
            },
            { 
                opacity: '0.6',
                transform: `translate(${offsetX * 0.3}px, ${-15 + offsetY * 0.5}px)`,
                offset: 0.4
            },
            { 
                opacity: '0',
                transform: `translate(${offsetX * 0.6}px, ${-30 + offsetY}px)`,
                r: 0.5
            }
        ], {
            duration: 700,
            easing: 'ease-out',
            delay: i * 30
        });
    }

    dotGroup.appendChild(particleGroup);
    svg.appendChild(dotGroup);

    // Cleanup function
    const cleanUp = () => {
        try {
            if (dotGroup.parentNode) {
                svg.removeChild(dotGroup);
            }
            if (defs.contains(overlayGradient)) defs.removeChild(overlayGradient);
            if (defs.contains(glowFilter)) defs.removeChild(glowFilter);
            AnimationManager.removePath(dotGroup);
        } catch(e) {
        }
    };

    // Remove after animation completes
    setTimeout(cleanUp, 800);

    const forceCleanupTimer = setTimeout(cleanUp, 2000);

    return dotGroup;
}

// Export to global scope for Tampermonkey
window.createDotEffect = createDotEffect;
