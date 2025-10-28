/**
 * Spritesheet Animation Manager
 * Handles sprite-based avatar animations (idle, cast, etc.)
 */

const SpriteAnimator = {
    // Animation state tracking
    activeAnimations: new Map(),
    
    /**
     * Create and apply a spritesheet animation to an avatar element
     * @param {HTMLElement} avatarElement - The avatar container element
     * @param {Object} config - Animation configuration
     * @returns {Object} Animation controller
     */
    createSpritesheetAvatar(avatarElement, config) {
        if (!avatarElement || !config) return null;

        const avatarId = avatarElement._avatarId || ('sprite_' + Date.now() + '_' + Math.random());
        avatarElement._avatarId = avatarId;

        // Create or get spritesheet container
        let spriteContainer = avatarElement.querySelector('.sprite-animation-container');
        
        if (!spriteContainer) {
            spriteContainer = document.createElement('div');
            spriteContainer.className = 'sprite-animation-container';
            spriteContainer.style.cssText = `
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
                border-radius: inherit;
                pointer-events: none;
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
            `;
            
            // Hide default avatar elements
            const avatarInner = avatarElement.querySelector('.FullAvatar_avatar__2w8kS');
            const outfitInner = avatarElement.querySelector('.FullAvatar_avatarOutfit__3GHXg');
            if (avatarInner) avatarInner.style.display = 'none';
            if (outfitInner) outfitInner.style.display = 'none';
            
            avatarElement.style.position = 'relative';
            avatarElement.style.overflow = 'visible';
            avatarElement.insertBefore(spriteContainer, avatarElement.firstChild);
        }

        // Animation controller
        const controller = {
            avatarId,
            element: spriteContainer,
            currentAnimation: 'idle',
            animationTimeout: null,

            /**
             * Play a spritesheet animation
             * @param {string} animationType - 'idle' or 'cast'
             * @param {function} onComplete - Callback when animation completes
             */
            play(animationType, onComplete) {
                const animConfig = config[animationType];
                if (!animConfig || !animConfig.url) return;

                this.currentAnimation = animationType;
                
                // Clear any existing timeout
                if (this.animationTimeout) {
                    clearTimeout(this.animationTimeout);
                    this.animationTimeout = null;
                }

                const frameWidth = animConfig.frameWidth || 231;
                const frameHeight = animConfig.frameHeight || 190;
                const frameCount = animConfig.frames || 1;
                const duration = animConfig.duration || 1000;
                const loop = animConfig.loop !== undefined ? animConfig.loop : (animationType === 'idle');

                // Apply spritesheet animation
                this.element.style.cssText = `
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 1;
                    border-radius: inherit;
                    pointer-events: none;
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                    background-image: url('${animConfig.url}');
                    background-size: ${frameWidth * frameCount}px ${frameHeight}px;
                    background-position: 0 center;
                    background-repeat: no-repeat;
                    animation: sprite-animation-${avatarId} ${duration}ms steps(${frameCount}) ${loop ? 'infinite' : 'forwards'};
                `;

                // Create keyframes dynamically
                const styleId = `sprite-style-${avatarId}`;
                let styleElement = document.getElementById(styleId);
                
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = styleId;
                    document.head.appendChild(styleElement);
                }

                styleElement.textContent = `
                    @keyframes sprite-animation-${avatarId} {
                        from { background-position: 0 center; }
                        to { background-position: -${frameWidth * frameCount}px center; }
                    }
                `;

                // Handle animation completion for non-looping animations
                if (!loop && onComplete) {
                    this.animationTimeout = setTimeout(() => {
                        onComplete();
                    }, duration);
                }
            },

            /**
             * Switch to idle animation
             */
            idle() {
                this.play('idle');
            },

            /**
             * Play cast animation then return to idle
             * @param {number} duration - Optional custom duration
             */
            cast(duration) {
                const castConfig = config.cast;
                if (castConfig) {
                    if (duration) {
                        castConfig.duration = duration;
                    }
                    this.play('cast', () => {
                        this.idle();
                    });
                }
            },

            /**
             * Clean up animation resources
             */
            destroy() {
                if (this.animationTimeout) {
                    clearTimeout(this.animationTimeout);
                }
                const styleId = `sprite-style-${avatarId}`;
                const styleElement = document.getElementById(styleId);
                if (styleElement) {
                    styleElement.remove();
                }
                if (this.element && this.element.parentNode) {
                    this.element.remove();
                }
            }
        };

        // Store controller reference
        this.activeAnimations.set(avatarId, controller);

        // Start with idle animation
        controller.idle();

        return controller;
    },

    /**
     * Get animation controller by avatar ID
     * @param {string} avatarId - Avatar identifier
     * @returns {Object|null} Animation controller
     */
    getController(avatarId) {
        return this.activeAnimations.get(avatarId) || null;
    },

    /**
     * Get controller by avatar element
     * @param {HTMLElement} avatarElement - Avatar DOM element
     * @returns {Object|null} Animation controller
     */
    getControllerByElement(avatarElement) {
        if (!avatarElement || !avatarElement._avatarId) return null;
        return this.getController(avatarElement._avatarId);
    },

    /**
     * Trigger cast animation for all player avatars
     * @param {number} duration - Animation duration in ms
     */
    triggerCastForPlayer(duration = 800) {
        this.activeAnimations.forEach(controller => {
            controller.cast(duration);
        });
    },

    /**
     * Clean up all animations
     */
    cleanup() {
        this.activeAnimations.forEach(controller => {
            controller.destroy();
        });
        this.activeAnimations.clear();
    }
};

// Export to global scope for Tampermonkey
window.SpriteAnimator = SpriteAnimator;
