import { debugLog } from './sleek-chat-debug.js';

export class PopoutOpacityManager {
    static popoutEl = null;
    static fadeTimer = null;
    static isHovered = false;
    static isFocused = false;

    static SLIDE_ANIMATION_DURATION = 300;

    // Named handler references needed for removeEventListener cleanup
    static _mouseenterHandler = null;
    static _mouseleaveHandler = null;
    static _focusinHandler = null;
    static _focusoutHandler = null;

    static initialize(element) {
        console.log("PopoutOpacityManager: Initializing");
        this.popoutEl = element;

        this.setupOpacityTransition();
        this.setOpacity(1.0, false);
        this.bindHoverListeners();
        this.bindFocusListeners();
        this.startFadeTimer();

        debugLog("PopoutOpacityManager: Initialization complete");
    }

    static setupOpacityTransition() {
        const windowContent = this.popoutEl.querySelector('.window-content');
        if (windowContent) {
            windowContent.style.transition = 'opacity 300ms ease-in-out';
            debugLog("PopoutOpacityManager: CSS transition enabled");
        }
    }

    static bindHoverListeners() {
        this._mouseenterHandler = () => {
            debugLog("PopoutOpacityManager: Mouse entered chat");
            this.isHovered = true;
            this.handleInteractionStart();
        };
        this._mouseleaveHandler = () => {
            debugLog("PopoutOpacityManager: Mouse left chat");
            this.isHovered = false;
            this.handleInteractionEnd();
        };

        this.popoutEl.addEventListener('mouseenter', this._mouseenterHandler);
        this.popoutEl.addEventListener('mouseleave', this._mouseleaveHandler);
        debugLog("PopoutOpacityManager: Hover listeners bound");
    }

    static bindFocusListeners() {
        this._focusinHandler = (e) => {
            if (e.target.matches('input, textarea')) {
                debugLog("PopoutOpacityManager: Input focused");
                this.isFocused = true;
                this.handleInteractionStart();
            }
        };
        this._focusoutHandler = (e) => {
            if (e.target.matches('input, textarea')) {
                debugLog("PopoutOpacityManager: Input blurred");
                this.isFocused = false;
                this.handleInteractionEnd();
            }
        };

        this.popoutEl.addEventListener('focusin', this._focusinHandler);
        this.popoutEl.addEventListener('focusout', this._focusoutHandler);
        debugLog("PopoutOpacityManager: Focus listeners bound");
    }

    static handleInteractionStart() {
        this.clearFadeTimer();
        this.setOpacity(1.0, true);
        debugLog("PopoutOpacityManager: Interaction started - opacity set to 100%");
    }

    static handleInteractionEnd() {
        if (!this.isHovered && !this.isFocused) {
            debugLog("PopoutOpacityManager: All interactions ended - starting fade timer");
            this.startFadeTimer();
        } else {
            debugLog("PopoutOpacityManager: Still interacting - timer not started");
        }
    }

    static startFadeTimer() {
        this.clearFadeTimer();
        const fadeOutTime = game.settings.get('sleek-chat', 'fadeOutTime');
        debugLog(`PopoutOpacityManager: Starting fade timer (${fadeOutTime}ms)`);
        this.fadeTimer = setTimeout(() => {
            debugLog("PopoutOpacityManager: Fade timer expired - fading to faded opacity");
            this.fadeToInactive();
        }, fadeOutTime);
    }

    static clearFadeTimer() {
        if (this.fadeTimer) {
            clearTimeout(this.fadeTimer);
            this.fadeTimer = null;
            debugLog("PopoutOpacityManager: Fade timer cleared");
        }
    }

    static fadeToInactive() {
        const fadedOpacity = game.settings.get('sleek-chat', 'fadedOpacity');
        this.setOpacity(fadedOpacity, true);
        debugLog(`PopoutOpacityManager: Faded to inactive opacity (${fadedOpacity})`);
    }

    static setOpacity(value, animated = true) {
        const windowContent = this.popoutEl?.querySelector('.window-content');
        if (!windowContent) {
            console.log("PopoutOpacityManager: Warning - .window-content element not found");
            return;
        }

        if (!animated) {
            windowContent.style.transition = 'none';
            windowContent.style.opacity = value;
            setTimeout(() => {
                windowContent.style.transition = 'opacity 300ms ease-in-out';
            }, 10);
        } else {
            windowContent.style.opacity = value;
        }
        debugLog(`PopoutOpacityManager: Opacity set to ${value} (animated: ${animated})`);
    }

    static handleNewMessage() {
        debugLog("PopoutOpacityManager: New message - resetting to 100% and restarting timer after animation");
        this.setOpacity(1.0, true);

        if (!this.isHovered && !this.isFocused) {
            setTimeout(() => {
                if (!this.isHovered && !this.isFocused) {
                    this.startFadeTimer();
                }
            }, this.SLIDE_ANIMATION_DURATION);
        }
    }

    static cleanup() {
        debugLog("PopoutOpacityManager: Cleaning up");

        this.clearFadeTimer();

        if (this.popoutEl) {
            this.popoutEl.removeEventListener('mouseenter', this._mouseenterHandler);
            this.popoutEl.removeEventListener('mouseleave', this._mouseleaveHandler);
            this.popoutEl.removeEventListener('focusin', this._focusinHandler);
            this.popoutEl.removeEventListener('focusout', this._focusoutHandler);
        }

        this.popoutEl = null;
        this.isHovered = false;
        this.isFocused = false;
        this._mouseenterHandler = null;
        this._mouseleaveHandler = null;
        this._focusinHandler = null;
        this._focusoutHandler = null;

        debugLog("PopoutOpacityManager: Cleanup complete");
    }
}
