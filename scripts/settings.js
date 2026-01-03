import { debugLog } from './sleek-chat-debug.js';

Hooks.once('init', function() {
    // Popout Chat Opacity Settings
    game.settings.register("sleek-chat", "popoutChatOpacity", {
        name: "Popout Chat Opacity",
        hint: "Set opacity for the entire chat popout window",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0.2,
            max: 1.0,
            step: 0.1
        },
        default: 1.0
    });

    // Debug Mode
    game.settings.register("sleek-chat", "debugMode", {
        name: "Enable Debug Mode",
        hint: "Enable debug logging to the console for troubleshooting",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            debugLog(`Debug Mode ${value ? 'enabled' : 'disabled'}`);
        }
    });
});
