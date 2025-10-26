/**
 * Toast notification system
 */

/**
 * Show a toast notification message
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the toast in milliseconds
 */
function showToast(message, duration = 5000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '50px';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(60, 60, 60, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';

    document.body.appendChild(toast);

    // Force reflow
    void toast.offsetWidth;

    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}
