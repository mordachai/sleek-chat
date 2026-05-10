import { debugLog } from './sleek-chat-debug.js';
// Note: settings.js is loaded first in module.json, no need to import it here
import { PopoutChatManager } from './popout-chat.js';
import { PopoutMessageManager } from './popout-message-manager.js';
import { PopoutOpacityManager } from './popout-opacity.js';

// In v14, renderChatLog receives (app, element, context, options) where element is an HTMLElement.
// app.isPopout is true when the chat is rendered as a floating popout window.
Hooks.on("renderChatLog", (app, element, context, options) => {
    debugLog("Sleek Chat: renderChatLog hook fired, isPopout:", app.isPopout);

    if (app.isPopout) {
        console.log("Sleek Chat: POPOUT DETECTED - Initializing modifications");
        PopoutChatManager.initialize(app, element);
        return;
    }

    debugLog("Sleek Chat: Sidebar chat - no modifications");
});

// Hook for new chat messages
Hooks.on('createChatMessage', (message, options, userId) => {
    debugLog("New chat message detected:", message.id);

    if (PopoutChatManager.isActive()) {
        PopoutMessageManager.handleNewMessage(message.id);
        PopoutOpacityManager.handleNewMessage();
    }
});

// Hook to handle deleted messages
Hooks.on('deleteChatMessage', (message, options, userId) => {
    debugLog("Chat message deleted:", message.id);

    if (PopoutChatManager.isActive()) {
        PopoutMessageManager.handleDeletedMessage(message.id);
    }
});
