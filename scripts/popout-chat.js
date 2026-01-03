import { PopoutOpacityManager } from './popout-opacity.js';
import { PopoutMessageManager } from './popout-message-manager.js';
import { debugLog } from './sleek-chat-debug.js';

export class PopoutChatManager {
    static popoutApp = null;
    static popoutHtml = null;
    static isPopoutActive = false;
    static initialPositionSet = false;

    static initialize(app, html, data) {
        console.log("PopoutChatManager: Starting initialization");
        console.log("PopoutChatManager: html =", html);

        this.popoutApp = app;
        // Wrap in jQuery if it's a DOM element
        this.popoutHtml = html instanceof jQuery ? html : $(html);
        this.isPopoutActive = true;

        console.log("PopoutChatManager: popoutHtml after jQuery wrap =", this.popoutHtml);

        try {
            console.log("PopoutChatManager: Step 1 - hiding header");
            this.hideHeader();

            console.log("PopoutChatManager: Step 2 - injecting controls");
            this.injectControls();

            console.log("PopoutChatManager: Step 3 - initializing opacity manager");
            this.initializeOpacityManager();

            console.log("PopoutChatManager: Step 4 - initializing message manager");
            this.initializeMessageManager();

            console.log("PopoutChatManager: Step 5 - setup cleanup");
            this.setupCleanup();

            console.log("PopoutChatManager: Step 6 - adjust initial position");
            this.adjustInitialPosition();

            console.log("PopoutChatManager: Initialization complete!");
        } catch (error) {
            console.error("PopoutChatManager: ERROR during initialization", error);
        }
    }

    static adjustInitialPosition() {
        // Check if we have a saved position
        const savedPosition = game.settings.get('sleek-chat', 'popoutPosition');

        if (savedPosition && savedPosition.top && savedPosition.left) {
            // Restore saved position
            this.popoutHtml.css({
                'top': `${savedPosition.top}px`,
                'left': `${savedPosition.left}px`
            });
            console.log(`PopoutChatManager: Restored saved position - top: ${savedPosition.top}px, left: ${savedPosition.left}px`);
            this.ensureOnScreen();
            this.initialPositionSet = true;
            this.setupPositionSaving();
            return;
        }

        // Wait for DOM to settle, then center vertically
        requestAnimationFrame(() => {
            const popoutHeight = this.popoutHtml.outerHeight();
            const viewportHeight = window.innerHeight;
            const centeredTop = Math.max(20, (viewportHeight - popoutHeight) / 2);

            this.popoutHtml.css('top', `${centeredTop}px`);
            console.log(`PopoutChatManager: Centered position - height: ${popoutHeight}px, viewport: ${viewportHeight}px, top: ${centeredTop}px`);
            this.ensureOnScreen();
            this.initialPositionSet = true;
            this.setupPositionSaving();
        });
    }

    static ensureOnScreen() {
        requestAnimationFrame(() => {
            const popoutWidth = this.popoutHtml.outerWidth();
            const popoutHeight = this.popoutHtml.outerHeight();
            let top = parseInt(this.popoutHtml.css('top')) || 0;
            let left = parseInt(this.popoutHtml.css('left')) || 0;

            // Clamp to viewport bounds
            const maxTop = window.innerHeight - popoutHeight - 20;
            const maxLeft = window.innerWidth - popoutWidth - 20;

            top = Math.max(20, Math.min(top, maxTop));
            left = Math.max(20, Math.min(left, maxLeft));

            this.popoutHtml.css({ 'top': `${top}px`, 'left': `${left}px` });
            debugLog(`PopoutChatManager: Ensured on screen - top: ${top}px, left: ${left}px`);
        });
    }

    static setupPositionSaving() {
        // Save position when window is dragged
        this.popoutHtml.on('dragstop.sleekPosition', () => {
            const position = {
                top: parseInt(this.popoutHtml.css('top')) || 0,
                left: parseInt(this.popoutHtml.css('left')) || 0
            };
            game.settings.set('sleek-chat', 'popoutPosition', position);
            debugLog(`PopoutChatManager: Saved position - top: ${position.top}px, left: ${position.left}px`);
        });
    }

    static hideHeader() {
        // Add modifier class to the popout container
        console.log("PopoutChatManager: Adding sleek-popout-modified class");
        const popoutContainer = this.popoutHtml.closest('#chat-popout');
        console.log("PopoutChatManager: found containers:", popoutContainer.length);

        if (popoutContainer.length > 0) {
            popoutContainer.addClass('sleek-popout-modified');
            console.log("PopoutChatManager: Added sleek-popout-modified class");
        } else {
            console.log("PopoutChatManager: WARNING - #chat-popout container not found");
        }
    }

    static injectControls() {
        console.log("PopoutChatManager: Injecting controls");

        // Check if controls already exist
        if (this.popoutHtml.find('.sleek-popout-controls').length > 0) {
            console.log("PopoutChatManager: Controls already exist, skipping injection");
            return;
        }

        const controlsHtml = `
            <div class="sleek-popout-controls">
                <div class="navigation-buttons">
                    <button class="sleek-nav-prev" title="Previous Message">◀ Prev</button>
                    <button class="sleek-nav-next" title="Next Message">Next ▶</button>
                </div>
            </div>
        `;

        // Inject at the bottom (after chat-form)
        const chatForm = this.popoutHtml.find('.chat-form');
        if (chatForm.length > 0) {
            chatForm.after(controlsHtml);
            console.log("PopoutChatManager: Controls injected at bottom");
        } else {
            console.log("PopoutChatManager: Warning - .chat-form not found, controls not injected");
        }
    }

    static initializeOpacityManager() {
        debugLog("PopoutChatManager: Initializing opacity manager");
        PopoutOpacityManager.initialize(this.popoutHtml);
    }

    static initializeMessageManager() {
        debugLog("PopoutChatManager: Initializing message manager");
        PopoutMessageManager.initialize(this.popoutHtml);
    }

    static setupCleanup() {
        debugLog("PopoutChatManager: Setting up cleanup hook");

        Hooks.once('closeChatLog', (app) => {
            if (app.options.popOut) {
                debugLog("PopoutChatManager: Popout closed, cleaning up");
                this.cleanup();
            }
        });
    }

    static cleanup() {
        debugLog("PopoutChatManager: Cleaning up");

        // Remove position saving listener
        if (this.popoutHtml) {
            this.popoutHtml.off('.sleekPosition');
        }

        // Cleanup sub-managers
        PopoutOpacityManager.cleanup();
        PopoutMessageManager.cleanup();

        // Clear references
        this.popoutApp = null;
        this.popoutHtml = null;
        this.isPopoutActive = false;
        this.initialPositionSet = false;

        debugLog("PopoutChatManager: Cleanup complete");
    }

    static isActive() {
        return this.isPopoutActive;
    }

    static getPopoutHtml() {
        return this.popoutHtml;
    }
}
