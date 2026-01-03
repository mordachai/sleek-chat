import { debugLog } from './sleek-chat-debug.js';
// Note: settings.js is loaded first in module.json, no need to import it here
import { PopoutChatManager } from './popout-chat.js';
import { PopoutMessageManager } from './popout-message-manager.js';
import { PopoutOpacityManager } from './popout-opacity.js';

// Hook to render the custom Sleek Chat UI on Chat Log render
Hooks.on("renderChatLog", async (app, html, data) => {
    console.log("Sleek Chat: renderChatLog hook fired");
    console.log("Sleek Chat: app.id =", app.id);
    console.log("Sleek Chat: app.options.classes =", app.options.classes);

    // Check if this is a popout window (v13 uses id: 'chat-popout')
    const isPopout = app.id === 'chat-popout' || app.options.classes?.includes('sidebar-popout');

    if (isPopout) {
        console.log("Sleek Chat: POPOUT DETECTED - Initializing modifications");
        PopoutChatManager.initialize(app, html, data);
        return; // Skip any other logic for popout
    }

    // Sidebar chat - no modifications needed
    console.log("Sleek Chat: Sidebar chat - no modifications");
});

// Hook for new chat messages
Hooks.on('createChatMessage', (message, options, userId) => {
    debugLog("New chat message detected:", message.id);

    // Handle popout if active
    if (PopoutChatManager.isActive()) {
        PopoutMessageManager.handleNewMessage(message.id);
        PopoutOpacityManager.handleNewMessage();
    }
});

// Hook to handle deleted messages
Hooks.on('deleteChatMessage', (message, options, userId) => {
    debugLog("Chat message deleted:", message.id);

    // Handle popout if active
    if (PopoutChatManager.isActive()) {
        PopoutMessageManager.handleDeletedMessage(message.id);
    }
});
