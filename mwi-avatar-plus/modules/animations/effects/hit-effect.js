/**
 * Hit effect animation - creates impact particles, waves, and damage scaling
 */

/**
 * Create hit effect with particles and shake
 * @param {Object} point - Impact point {x, y}
 * @param {SVGElement} container - SVG container
 * @param {SVGElement} path - The animation path element
 * @param {HTMLElement} hitTarget - Target element to shake
 * @param {number} explosionSize - Size multiplier for the effect
 * @param {HTMLElement} hitDamage - Damage number element
 * @param {string} frameColor - Frame color for damage
 * @param {string} frameBorderColor - Border color for damage
 * @param {Object} trackerSetting - Tracker settings object
 */
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
            if (settingsMap.keepOriginalDamageColor.isTrue) {
                // Use hue-rotate filter for temporary color change (returns to red)
                const hueFilter = calculateHueRotation(trackerSetting.frameR, trackerSetting.frameG, trackerSetting.frameB);
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
                // Use hue-rotate filter with long duration (no permanent styles)
                const hueFilter = calculateHueRotation(trackerSetting.frameR, trackerSetting.frameG, trackerSetting.frameB);
                hitDamage.animate([
                    { filter: `${hueFilter} brightness(1.2) saturate(1.5)` }
                ], {
                    duration: 10000, // 10 seconds - way longer than damage display
                    fill: 'none', // No fill:forwards to avoid permanent inline styles
                    easing: 'linear'
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

// Export to global scope for Tampermonkey
window.createHitEffect = createHitEffect;
