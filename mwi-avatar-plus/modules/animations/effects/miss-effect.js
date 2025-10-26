/**
 * Miss effect animation - shows "MISS" text with falling animation
 */

/**
 * Create miss effect animation
 * @param {HTMLElement} hitDamage - Damage container element
 * @param {Object} endPoint - End point coordinates {x, y}
 * @param {SVGElement} svg - SVG container
 * @param {boolean} isPlayerMiss - Whether this is a player miss
 */
function createMissEffect(hitDamage, endPoint, svg, isPlayerMiss = false) {
    if (!settingsMap.moreEffect.isTrue) {
        return null;
    }

    if (hitDamage !== undefined) {
        hitDamage.animate(
            [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
            {
                duration: 600,
                easing: 'ease-in-out'
            }
        );
    }
    if (!isPlayerMiss) {
        return;
    }
    const missText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    missText.textContent = "MISS";
    missText.setAttribute("x", endPoint ? endPoint.x : "0");
    missText.setAttribute("y", endPoint ? endPoint.y : "0");
    missText.setAttribute("text-anchor", "middle");
    missText.setAttribute("dominant-baseline", "middle");
    missText.style.fontSize = "18px";
    missText.style.fontWeight = "600";
    missText.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    missText.style.fill = "#888888";
    missText.style.stroke = "#ffffff";
    missText.style.strokeWidth = "2px";
    missText.style.paintOrder = "stroke";
    missText.style.opacity = "0";
    missText.style.userSelect = "none";
    missText.style.pointerEvents = "none";
    missText.style.filter = "drop-shadow(0px 1px 3px rgba(0,0,0,0.6))";
    missText.style.letterSpacing = "1px";

    svg.appendChild(missText);

    const side = Math.random() > 0.5 ? 1 : -1;
    const tilt = side * (10 + Math.random() * 15);
    const driftX = side * (20 + Math.random() * 30);
    const fallDistance = 50 + Math.random() * 30;
    requestAnimationFrame(() => {
        missText.animate([
            {
                transform: 'translate(0, 0) scale(0.8) rotate(0deg)',
                opacity: '0'
            },
            {
                transform: 'translate(0, -10px) scale(1.1) rotate(0deg)',
                opacity: '1',
                offset: 0.15
            },
            {
                transform: `translate(${driftX * 0.3}px, 5px) scale(1) rotate(${tilt * 0.3}deg)`,
                opacity: '0.9',
                offset: 0.4
            },
            {
                transform: `translate(${driftX * 0.7}px, ${fallDistance * 0.6}px) scale(0.95) rotate(${tilt * 0.7}deg)`,
                opacity: '0.6',
                offset: 0.7
            },
            {
                transform: `translate(${driftX}px, ${fallDistance}px) scale(0.9) rotate(${tilt}deg)`,
                opacity: '0'
            }
        ], {
            duration: 1500,
            easing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
            fill: 'forwards'
        }).onfinish = () => {
            if (missText.parentNode) {
                svg.removeChild(missText);
            }
        };
    });
    setTimeout(() => {
        if (missText.parentNode) {
            svg.removeChild(missText);
        }
    }, 2000);
}
