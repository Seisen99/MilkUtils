/**
 * Animation pool and cooldown management
 */

const AnimationManager = {
    maxPaths: 50,
    activePaths: new Set(),
    isCoolingDown: false,
    coolDownTimer: null,

    canCreate() {
        if (this.isCoolingDown) return false;
        if (this.activePaths.size >= this.maxPaths) {
            this.triggerCoolDown();
            return false;
        }
        return this.activePaths.size < this.maxPaths;
    },

    addPath(path) {
        this.activePaths.add(path);
    },

    removePath(path) {
        this.activePaths.delete(path);
    },

    triggerCoolDown() {
        this.activePaths.clear();
        const svg = document.getElementById('svg-container');
        if(svg && svg !== undefined) {
            svg.innerHTML = '';
        }
        showToast(isZH?'动画超过限制数'+this.maxPaths+'，进入5秒冷却':'Animation limit reached ('+this.maxPaths+'), entering 5s cooldown');
        this.isCoolingDown = true;

        if (this.coolDownTimer) {
            clearTimeout(this.coolDownTimer);
        }

        this.coolDownTimer = setTimeout(() => {
            this.isCoolingDown = false;
            this.coolDownTimer = null;
        }, 5000);
    }
};

// Export to global scope for Tampermonkey
window.AnimationManager = AnimationManager;
