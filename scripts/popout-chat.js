import { PopoutOpacityManager } from './popout-opacity.js';
import { PopoutMessageManager } from './popout-message-manager.js';
import { debugLog } from './sleek-chat-debug.js';

export class PopoutChatManager {
    static popoutApp = null;
    static popoutEl = null;  // Root HTMLElement of the popout window
    static isPopoutActive = false;
    static initialPositionSet = false;

    // Named handler references needed for removeEventListener cleanup
    static _headerMouseupHandler = null;

    static initialize(app, element) {
        console.log("PopoutChatManager: Starting initialization");

        this.popoutApp = app;
        this.popoutEl = element;
        this.isPopoutActive = true;

        try {
            this.hideHeader();
            this.injectControls();
            this.initializeOpacityManager();
            this.initializeMessageManager();
            this.setupCleanup();
            this.adjustInitialPosition();
            console.log("PopoutChatManager: Initialization complete!");
        } catch (error) {
            console.error("PopoutChatManager: ERROR during initialization", error);
        }
    }

    static adjustInitialPosition() {
        requestAnimationFrame(() => {
            const savedPosition = game.settings.get('sleek-chat', 'popoutPosition');

            if (savedPosition?.top && savedPosition?.left) {
                this.popoutEl.style.top = `${savedPosition.top}px`;
                this.popoutEl.style.left = `${savedPosition.left}px`;
                if (this.popoutApp?.position) {
                    this.popoutApp.position.top = savedPosition.top;
                    this.popoutApp.position.left = savedPosition.left;
                }
                console.log(`PopoutChatManager: Restored saved position - top: ${savedPosition.top}px, left: ${savedPosition.left}px`);
            } else {
                const popoutHeight = this.popoutEl.offsetHeight;
                const viewportHeight = window.innerHeight;
                const centeredTop = Math.max(20, (viewportHeight - popoutHeight) / 2);
                const currentLeft = Math.round(parseFloat(this.popoutEl.style.left) || 0);

                this.popoutEl.style.top = `${centeredTop}px`;
                if (this.popoutApp?.position) {
                    this.popoutApp.position.top = centeredTop;
                    this.popoutApp.position.left = currentLeft;
                }
                console.log(`PopoutChatManager: Centered position - top: ${centeredTop}px`);
            }

            this.ensureOnScreen();
            this.initialPositionSet = true;
            this.setupPositionSaving();
        });
    }

    static ensureOnScreen() {
        const popoutWidth = this.popoutEl.offsetWidth;
        const popoutHeight = this.popoutEl.offsetHeight;
        let top = Math.round(parseFloat(this.popoutEl.style.top) || 0);
        let left = Math.round(parseFloat(this.popoutEl.style.left) || 0);

        const maxTop = window.innerHeight - popoutHeight - 20;
        const maxLeft = window.innerWidth - popoutWidth - 20;

        top = Math.max(20, Math.min(top, maxTop));
        left = Math.max(20, Math.min(left, maxLeft));

        this.popoutEl.style.top = `${top}px`;
        this.popoutEl.style.left = `${left}px`;

        if (this.popoutApp?.position) {
            this.popoutApp.position.top = top;
            this.popoutApp.position.left = left;
        }

        console.log(`PopoutChatManager: ensureOnScreen - top: ${top}px, left: ${left}px`);
    }

    static setupPositionSaving() {
        const header = this.popoutEl.querySelector('.window-header');
        if (!header) {
            console.log("PopoutChatManager: Warning - .window-header not found, position saving disabled");
            return;
        }

        this._headerMouseupHandler = () => {
            setTimeout(() => {
                const top = Math.round(parseFloat(this.popoutEl.style.top) || 0);
                const left = Math.round(parseFloat(this.popoutEl.style.left) || 0);
                const position = { top, left };
                console.log(`[SLEEK] Saving position:`, position);
                game.settings.set('sleek-chat', 'popoutPosition', position);
            }, 100);
        };

        header.addEventListener('mouseup', this._headerMouseupHandler);
        console.log("PopoutChatManager: Position saving listener attached");
    }

    static hideHeader() {
        this.popoutEl.classList.add('sleek-popout-modified');
        console.log("PopoutChatManager: Added sleek-popout-modified class");
    }

    static injectControls() {
        if (this.popoutEl.querySelector('.sleek-popout-controls')) {
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

        const chatForm = this.popoutEl.querySelector('.chat-form');
        if (chatForm) {
            chatForm.insertAdjacentHTML('afterend', controlsHtml);
            console.log("PopoutChatManager: Controls injected after .chat-form");
        } else {
            console.log("PopoutChatManager: Warning - .chat-form not found, controls not injected");
        }
    }

    static initializeOpacityManager() {
        debugLog("PopoutChatManager: Initializing opacity manager");
        PopoutOpacityManager.initialize(this.popoutEl);
    }

    static initializeMessageManager() {
        debugLog("PopoutChatManager: Initializing message manager");
        PopoutMessageManager.initialize(this.popoutEl, this.popoutApp);
    }

    static setupCleanup() {
        debugLog("PopoutChatManager: Setting up cleanup hook");

        Hooks.once('closeChatLog', (app) => {
            if (app.isPopout) {
                debugLog("PopoutChatManager: Popout closed, cleaning up");
                this.cleanup();
            }
        });
    }

    static cleanup() {
        debugLog("PopoutChatManager: Cleaning up");

        const header = this.popoutEl?.querySelector('.window-header');
        if (header && this._headerMouseupHandler) {
            header.removeEventListener('mouseup', this._headerMouseupHandler);
        }
        this._headerMouseupHandler = null;

        PopoutOpacityManager.cleanup();
        PopoutMessageManager.cleanup();

        this.popoutApp = null;
        this.popoutEl = null;
        this.isPopoutActive = false;
        this.initialPositionSet = false;

        debugLog("PopoutChatManager: Cleanup complete");
    }

    static isActive() {
        return this.isPopoutActive;
    }

    static getPopoutEl() {
        return this.popoutEl;
    }
}
