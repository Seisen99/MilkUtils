/**
 * Melee weapon (Granite Bludgeon) smash animation
 */

/**
 * Create mace smash effect animation
 * @param {HTMLElement} targetElem - Target element to smash
 * @param {SVGElement} svg - SVG container
 * @param {Object} trackerSetting - Tracker settings
 * @returns {SVGElement} The mace group element
 */
function createMaceSmashEffect(targetElem, svg, trackerSetting) {
    const targetRect = targetElem.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;

    const swingRadius = 80;
    const startAngle = -240;
    const impactAngle = -90;
    const endAngle = -140;

    const rotationCenterX = centerX - swingRadius;
    const rotationCenterY = centerY;

    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

    const maceGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    maceGroup.style.opacity = '0';
    maceGroup.style.transformOrigin = '0 0';

    // Granite Bludgeon SVG
    const bludgeonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const imageScale = 1.6;
    const svgRotationCompensation = 135;
    bludgeonGroup.setAttribute("transform", `rotate(${svgRotationCompensation}) scale(${imageScale}) translate(0, -51)`);
    
    // Granite Bludgeon SVG paths
    bludgeonGroup.innerHTML = `
        <path d="M12.8103 41.4993L29.1548 25.1548L25.6925 21.6925L9.34796 38.037L12.8103 41.4993Z" fill="#898989"/>
        <path d="M12.8103 41.4993L29.1548 25.1548L25.6925 21.6925L9.34796 38.037L12.8103 41.4993Z" fill="white" fill-opacity="0.6"/>
        <path d="M12.8555 42.8391L8.00818 37.9918L4.34245e-07 46L-4.08692e-07 48L3 51L5 51L12.8555 42.8391Z" fill="#898989"/>
        <path d="M12.8555 42.8391L8.00818 37.9918L4.34245e-07 46L-4.08692e-07 48L3 51L5 51L12.8555 42.8391Z" fill="white" fill-opacity="0.6"/>
        <path d="M45.6162 6.82575L44.2202 5.42207C40.7187 6.1124 36.2458 9.76641 34 12C31.7541 14.2336 28.7823 19.845 27.376 22.1742L28.772 23.5779C31.3416 22.4184 35.4908 20.4901 39 17C41.8073 14.208 44.9067 10.3234 45.6162 6.82575Z" fill="#898989"/>
        <path d="M45.6162 6.82575L44.2202 5.42207C40.7187 6.1124 36.2458 9.76641 34 12C31.7541 14.2336 28.7823 19.845 27.376 22.1742L28.772 23.5779C31.3416 22.4184 35.4908 20.4901 39 17C41.8073 14.208 44.9067 10.3234 45.6162 6.82575Z" fill="white" fill-opacity="0.4"/>
        <path d="M39.4999 18C44.0619 13.463 44.9067 10.3234 46.3142 7.52759L47.7102 8.93127C47.6987 13.1308 46.3626 16.9677 42.7782 20.8165C39.1937 24.6653 35.0656 25.6949 30.8661 25.6834L29.47 24.2797C32.2736 22.8876 35.9907 21.49 39.4999 18Z" fill="#898989"/>
        <path d="M39.4999 18C44.0619 13.463 44.9067 10.3234 46.3142 7.52759L47.7102 8.93127C47.6987 13.1308 46.3626 16.9677 42.7782 20.8165C39.1937 24.6653 35.0656 25.6949 30.8661 25.6834L29.47 24.2797C32.2736 22.8876 35.9907 21.49 39.4999 18Z" fill="white" fill-opacity="0.2"/>
        <path d="M43.4763 21.5184C47.968 17.0512 48.4032 11.4996 48.4083 9.63312L49.8043 11.0368C50.4947 14.5383 49.562 19.654 45.5703 23.6239C41.5786 27.5938 36.4579 28.4984 32.9602 27.7889L31.5642 26.3853C34.3639 26.3929 38.9845 25.9856 43.4763 21.5184Z" fill="#898989"/>
        <path d="M33 11.5C37.1872 6.61495 40.7187 6.11239 43.5222 4.72021L42.1262 3.31653C37.9267 3.30503 34.0825 4.62009 30.2141 8.1834C26.3457 11.7467 25.2935 15.8691 25.282 20.0687L26.6781 21.4724C28.0856 18.6765 30 15 33 11.5Z" fill="#898989"/>
        <path d="M33 11.5C37.1872 6.61495 40.7187 6.11239 43.5222 4.72021L42.1262 3.31653C37.9267 3.30503 34.0825 4.62009 30.2141 8.1834C26.3457 11.7467 25.2935 15.8691 25.282 20.0687L26.6781 21.4724C28.0856 18.6765 30 15 33 11.5Z" fill="white" fill-opacity="0.2"/>
        <path d="M29.5161 7.48155C34.0079 3.01432 39.5618 2.60957 41.4282 2.61469L40.0322 1.211C36.5345 0.501496 31.4138 1.40613 27.4221 5.37603C23.4304 9.34594 22.4977 14.4616 23.188 17.9631L24.5841 19.3668C24.5917 16.5671 25.0243 11.9488 29.5161 7.48155Z" fill="#898989"/>
        <path d="M49.5 9.49997L41.5 1.49997C43 1.99997 43.6191 1.91205 46.2426 4.53551C48.8661 7.15897 49 7.99997 49.5 9.49997Z" fill="#898989"/>
        <path d="M49.5 9.49997L41.5 1.49997C43 1.99997 43.6191 1.91205 46.2426 4.53551C48.8661 7.15897 49 7.99997 49.5 9.49997Z" fill="white" fill-opacity="0.4"/>
        <path d="M50 1L45.5 3C46.6794 3.85937 47.2168 4.411 48 5.5L50 1Z" fill="#898989"/>
        <path d="M50 1L45.5 3C46.6794 3.85937 47.2168 4.411 48 5.5L50 1Z" fill="white" fill-opacity="0.6"/>
    `;
    
    bludgeonGroup.style.filter = "drop-shadow(0 0 6px rgba(200,200,200,0.6))";

    // Particules de splash
    const splashGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    splashGroup.style.opacity = '1';
    svg.appendChild(splashGroup);

    const splashParticles = [];
    for (let i = 0; i < 12; i++) {
        const particle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const angle = (i / 12) * Math.PI * 2;
        particle.setAttribute("width", "3");
        particle.setAttribute("height", "8");
        particle.setAttribute("rx", "1");
        particle.setAttribute("fill", "#ffffff");
        particle.setAttribute("opacity", "0");
        particle.setAttribute("transform", `rotate(${angle * (180/Math.PI)})`);
        splashGroup.appendChild(particle);
        splashParticles.push({element: particle, angle: angle});
    }

    maceGroup.appendChild(bludgeonGroup);
    svg.appendChild(maceGroup);

    maceGroup.animate([
        {
            opacity: '0',
            transform: `translate(${rotationCenterX}px, ${rotationCenterY}px) rotate(${startAngle}deg) scale(0.7)`,
            offset: 0
        },
        {
            opacity: '1',
            transform: `translate(${rotationCenterX}px, ${rotationCenterY}px) rotate(${startAngle}deg) scale(1)`,
            offset: 0.12
        },
        {
            opacity: '1',
            transform: `translate(${rotationCenterX}px, ${rotationCenterY}px) rotate(${impactAngle}deg) scale(1.1)`,
            offset: 0.45
        },
        {
            opacity: '1',
            transform: `translate(${rotationCenterX}px, ${rotationCenterY}px) rotate(${endAngle}deg) scale(1)`,
            offset: 0.85
        },
        {
            opacity: '0',
            transform: `translate(${rotationCenterX}px, ${rotationCenterY}px) rotate(${endAngle}deg) scale(0.9)`,
            offset: 1
        }
    ], {
        duration: 700,
        easing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)'
    });

    setTimeout(() => {
        splashParticles.forEach((particleData, i) => {
            const {element, angle} = particleData;
            const distance = 35;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            element.animate([
                {
                    opacity: '0',
                    transform: `translate(${centerX}px, ${centerY}px) rotate(${angle * (180/Math.PI)}deg) scale(1)`
                },
                {
                    opacity: '0.9',
                    transform: `translate(${centerX + endX * 0.3}px, ${centerY + endY * 0.3}px) rotate(${angle * (180/Math.PI)}deg) scale(1.2)`,
                    offset: 0.3
                },
                {
                    opacity: '0',
                    transform: `translate(${centerX + endX}px, ${centerY + endY}px) rotate(${angle * (180/Math.PI)}deg) scale(0.8)`
                }
            ], {
                duration: 400,
                easing: 'ease-out',
                delay: i * 15
            });
        });
    }, 315);

    const cleanUp = () => {
        try {
            if (maceGroup.parentNode) {
                svg.removeChild(maceGroup);
            }
            if (splashGroup.parentNode) {
                svg.removeChild(splashGroup);
            }
            AnimationManager.removePath(maceGroup);
        } catch(e) {
        }
    };

    setTimeout(cleanUp, 900);

    return maceGroup;
}

// Export to global scope for Tampermonkey
window.createMaceSmashEffect = createMaceSmashEffect;
