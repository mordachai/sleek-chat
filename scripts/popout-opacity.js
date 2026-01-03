import { debugLog } from './sleek-chat-debug.js';

export class PopoutOpacityManager {
    static popoutHtml = null;
    static popoutContainer = null;
    static fadeTimer = null;
    static isHovered = false;
    static isFocused = false;

    // ⚙️ ANIMATION DURATION - Adjust this value to change slide-in animation speed
    static SLIDE_ANIMATION_DURATION = 300; // milliseconds (must match CSS animation duration)

    static initialize(html) {
        console.log("PopoutOpacityManager: Initializing");
        // Ensure jQuery wrapped
        this.popoutHtml = html instanceof jQuery ? html : $(html);
        this.popoutContainer = this.popoutHtml.closest('#chat-popout');

        if (this.popoutContainer.length === 0) {
            console.log("PopoutOpacityManager: Warning - #chat-popout container not found");
            return;
        }

        // Set initial opacity to 100% and enable CSS transitions
        this.setupOpacityTransition();
        this.setOpacity(1.0, false); // Start at 100%, no animation

        // Bind hover and focus listeners
        this.bindHoverListeners();
        this.bindFocusListeners();

        // Start the initial fade timer
        this.startFadeTimer();

        debugLog("PopoutOpacityManager: Initialization complete");
    }

    static setupOpacityTransition() {
        // Add CSS transition for smooth opacity changes
        const windowContent = this.popoutHtml.find('.window-content');
        if (windowContent.length > 0) {
            windowContent.css('transition', 'opacity 300ms ease-in-out');
            debugLog("PopoutOpacityManager: CSS transition enabled");
        }
    }

    static bindHoverListeners() {
        this.popoutContainer.on('mouseenter.sleekOpacity', () => {
            debugLog("PopoutOpacityManager: Mouse entered chat");
            this.isHovered = true;
            this.handleInteractionStart();
        });

        this.popoutContainer.on('mouseleave.sleekOpacity', () => {
            debugLog("PopoutOpacityManager: Mouse left chat");
            this.isHovered = false;
            this.handleInteractionEnd();
        });

        debugLog("PopoutOpacityManager: Hover listeners bound");
    }

    static bindFocusListeners() {
        // Listen to focus on any input/textarea in the chat
        this.popoutHtml.on('focusin.sleekOpacity', 'input, textarea', () => {
            debugLog("PopoutOpacityManager: Input focused");
            this.isFocused = true;
            this.handleInteractionStart();
        });

        this.popoutHtml.on('focusout.sleekOpacity', 'input, textarea', () => {
            debugLog("PopoutOpacityManager: Input blurred");
            this.isFocused = false;
            this.handleInteractionEnd();
        });

        debugLog("PopoutOpacityManager: Focus listeners bound");
    }

    static handleInteractionStart() {
        // User is interacting (hover or focus)
        this.clearFadeTimer();
        this.setOpacity(1.0, true); // Fade to 100% smoothly
        debugLog("PopoutOpacityManager: Interaction started - opacity set to 100%");
    }

    static handleInteractionEnd() {
        // Check if user is still interacting in any way
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
        const windowContent = this.popoutHtml.find('.window-content');
        if (windowContent.length > 0) {
            if (animated) {
                windowContent.css('opacity', value);
            } else {
                // Disable transition temporarily for instant change
                windowContent.css('transition', 'none');
                windowContent.css('opacity', value);
                // Re-enable transition after a brief moment
                setTimeout(() => {
                    windowContent.css('transition', 'opacity 300ms ease-in-out');
                }, 10);
            }
            debugLog(`PopoutOpacityManager: Opacity set to ${value} (animated: ${animated})`);
        } else {
            console.log("PopoutOpacityManager: Warning - .window-content element not found");
        }
    }

    static handleNewMessage() {
        debugLog("PopoutOpacityManager: New message - resetting to 100% and restarting timer after animation");
        this.setOpacity(1.0, true);

        // Only restart timer if user is not currently interacting
        // Wait for slide animation to complete before starting fade timer
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

        // Clear timer
        this.clearFadeTimer();

        // Remove event listeners
        if (this.popoutContainer) {
            this.popoutContainer.off('.sleekOpacity');
        }
        if (this.popoutHtml) {
            this.popoutHtml.off('.sleekOpacity');
        }

        // Clear references
        this.popoutHtml = null;
        this.popoutContainer = null;
        this.isHovered = false;
        this.isFocused = false;

        debugLog("PopoutOpacityManager: Cleanup complete");
    }
}
