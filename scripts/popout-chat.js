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
        // Wait for DOM to settle before setting position
        requestAnimationFrame(() => {
            // Check if we have a saved position
            const savedPosition = game.settings.get('sleek-chat', 'popoutPosition');

            if (savedPosition && savedPosition.top && savedPosition.left) {
                // Restore saved position (CSS and App)
                this.popoutHtml.css({
                    'top': `${savedPosition.top}px`,
                    'left': `${savedPosition.left}px`
                });

                // Sync app position immediately
                if (this.popoutApp && this.popoutApp.position) {
                    this.popoutApp.position.top = savedPosition.top;
                    this.popoutApp.position.left = savedPosition.left;
                }

                console.log(`PopoutChatManager: Restored saved position - top: ${savedPosition.top}px, left: ${savedPosition.left}px`);
            } else {
                // Center vertically
                const popoutHeight = this.popoutHtml.outerHeight();
                const viewportHeight = window.innerHeight;
                const centeredTop = Math.max(20, (viewportHeight - popoutHeight) / 2);
                const currentLeft = Math.round(parseFloat(this.popoutHtml.css('left')) || 0);

                this.popoutHtml.css('top', `${centeredTop}px`);

                // Sync app position
                if (this.popoutApp && this.popoutApp.position) {
                    this.popoutApp.position.top = centeredTop;
                    this.popoutApp.position.left = currentLeft;
                }

                console.log(`PopoutChatManager: Centered position - height: ${popoutHeight}px, viewport: ${viewportHeight}px, top: ${centeredTop}px`);
            }

            // Ensure on screen (this will also sync app.position)
            this.ensureOnScreen();

            // Mark as ready
            this.initialPositionSet = true;
            this.setupPositionSaving();

            const finalTop = Math.round(parseFloat(this.popoutHtml.css('top')) || 0);
            const finalLeft = Math.round(parseFloat(this.popoutHtml.css('left')) || 0);
            const appTop = this.popoutApp?.position?.top || 'N/A';
            const appLeft = this.popoutApp?.position?.left || 'N/A';
            console.log(`PopoutChatManager: Initial position FINAL - CSS(${finalTop}, ${finalLeft}) vs App(${appTop}, ${appLeft})`);
        });
    }

    static ensureOnScreen() {
        const popoutWidth = this.popoutHtml.outerWidth();
        const popoutHeight = this.popoutHtml.outerHeight();
        let top = Math.round(parseFloat(this.popoutHtml.css('top')) || 0);
        let left = Math.round(parseFloat(this.popoutHtml.css('left')) || 0);

        console.log(`PopoutChatManager: ensureOnScreen BEFORE - CSS top: ${top}px, left: ${left}px`);

        // Clamp to viewport bounds
        const maxTop = window.innerHeight - popoutHeight - 20;
        const maxLeft = window.innerWidth - popoutWidth - 20;

        top = Math.max(20, Math.min(top, maxTop));
        left = Math.max(20, Math.min(left, maxLeft));

        // Update CSS
        this.popoutHtml.css({ 'top': `${top}px`, 'left': `${left}px` });

        // CRITICAL: Sync Foundry's app.position to match CSS
        if (this.popoutApp && this.popoutApp.position) {
            this.popoutApp.position.top = top;
            this.popoutApp.position.left = left;
            console.log(`PopoutChatManager: Synced app.position to (${top}, ${left})`);
        }

        console.log(`PopoutChatManager: ensureOnScreen AFTER - top: ${top}px, left: ${left}px`);
    }

    static setupPositionSaving() {
        console.log("[SLEEK] Setting up position saving listeners");

        // Capture position at EXACT moment of mousedown (before Foundry's drag starts)
        this.popoutHtml.find('.window-header').on('mousedown.sleekPosition', (e) => {
            const cssTop = Math.round(parseFloat(this.popoutHtml.css('top')) || 0);
            const cssLeft = Math.round(parseFloat(this.popoutHtml.css('left')) || 0);
            const appTop = this.popoutApp?.position?.top || 'N/A';
            const appLeft = this.popoutApp?.position?.left || 'N/A';

            console.log(`[SLEEK CLICK] MOUSEDOWN on header - CSS(${cssTop}, ${cssLeft}) vs App(${appTop}, ${appLeft})`);
        });

        // Try mouseup on window-header to catch end of drag
        this.popoutHtml.find('.window-header').on('mouseup.sleekPosition', (e) => {
            // Small delay to let Foundry finish updating position
            setTimeout(() => {
                const cssTop = Math.round(parseFloat(this.popoutHtml.css('top')) || 0);
                const cssLeft = Math.round(parseFloat(this.popoutHtml.css('left')) || 0);

                console.log(`[SLEEK] MOUSEUP on header - CSS(${cssTop}, ${cssLeft})`);

                const position = {
                    top: cssTop,
                    left: cssLeft
                };

                console.log(`[SLEEK] SAVING position:`, position);
                game.settings.set('sleek-chat', 'popoutPosition', position);

                // Verify it saved
                const saved = game.settings.get('sleek-chat', 'popoutPosition');
                console.log(`[SLEEK] VERIFIED saved position:`, saved);
            }, 100);
        });

        // Also try all possible drag events for debugging
        ['dragstart', 'drag', 'dragend', 'dragstop'].forEach(eventName => {
            this.popoutHtml.on(`${eventName}.sleekPosition`, () => {
                console.log(`[SLEEK EVENT] ${eventName} fired`);
            });
        });

        console.log("[SLEEK] Position saving listeners attached");
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
                    <button class="sleek-nav-bottom" title="Jump to Bottom">▼</button>
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
        PopoutMessageManager.initialize(this.popoutHtml, this.popoutApp);
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

        // Remove position saving listeners
        if (this.popoutHtml) {
            this.popoutHtml.off('.sleekPosition');
            this.popoutHtml.find('.window-header').off('.sleekPosition');
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
