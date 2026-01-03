import { PopoutOpacityManager } from './popout-opacity.js';
import { PopoutMessageManager } from './popout-message-manager.js';
import { debugLog } from './sleek-chat-debug.js';

export class PopoutChatManager {
    static popoutApp = null;
    static popoutHtml = null;
    static isPopoutActive = false;

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

            console.log("PopoutChatManager: Initialization complete!");
        } catch (error) {
            console.error("PopoutChatManager: ERROR during initialization", error);
        }
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

        // Cleanup sub-managers
        PopoutOpacityManager.cleanup();
        PopoutMessageManager.cleanup();

        // Clear references
        this.popoutApp = null;
        this.popoutHtml = null;
        this.isPopoutActive = false;

        debugLog("PopoutChatManager: Cleanup complete");
    }

    static isActive() {
        return this.isPopoutActive;
    }

    static getPopoutHtml() {
        return this.popoutHtml;
    }
}
