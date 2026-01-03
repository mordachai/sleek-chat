import { debugLog } from './sleek-chat-debug.js';

export class PopoutOpacityManager {
    static popoutHtml = null;

    static initialize(html) {
        console.log("PopoutOpacityManager: Initializing");
        // Ensure jQuery wrapped
        this.popoutHtml = html instanceof jQuery ? html : $(html);
        this.applyStoredOpacity();
        this.bindOpacityControls();
        debugLog("PopoutOpacityManager: Initialization complete");
    }

    static bindOpacityControls() {
        const chatOpacitySlider = this.popoutHtml.find('#sleek-chat-opacity');

        if (chatOpacitySlider.length === 0) {
            console.log("PopoutOpacityManager: Warning - Opacity slider not found in DOM");
            return;
        }

        chatOpacitySlider.on('input', (e) => {
            const value = parseFloat(e.target.value);
            this.applyChatOpacity(value);
            game.settings.set('sleek-chat', 'popoutChatOpacity', value);
            console.log(`PopoutOpacityManager: Chat opacity set to ${value}`);
        });

        console.log("PopoutOpacityManager: Opacity controls bound");
    }

    static applyChatOpacity(value) {
        const windowContent = this.popoutHtml.find('.window-content');
        if (windowContent.length > 0) {
            windowContent.css('opacity', value);
            console.log(`PopoutOpacityManager: Applied chat opacity ${value}`);
        } else {
            console.log("PopoutOpacityManager: Warning - .window-content element not found");
        }
    }

    static applyStoredOpacity() {
        const chatOpacity = game.settings.get('sleek-chat', 'popoutChatOpacity');
        this.applyChatOpacity(chatOpacity);
        console.log(`PopoutOpacityManager: Applied stored opacity: ${chatOpacity}`);
    }

    static cleanup() {
        debugLog("PopoutOpacityManager: Cleaning up");
        this.popoutHtml = null;
    }
}
