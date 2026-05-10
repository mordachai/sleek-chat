import { debugLog } from './sleek-chat-debug.js';

Hooks.once('init', function() {
    // Faded Opacity Setting
    game.settings.register("sleek-chat", "fadedOpacity", {
        name: "Faded Opacity",
        hint: "Opacity level when the chat is faded (inactive)",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0.2,
            max: 1.0,
            step: 0.1
        },
        default: 0.5
    });

    // Fade Out Time Setting
    game.settings.register("sleek-chat", "fadeOutTime", {
        name: "Fade Out Time",
        hint: "Time in milliseconds before chat fades to the faded opacity level",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 10000,
            step: 100
        },
        default: 7000
    });

    // Popout Position (hidden setting for saving window position)
    game.settings.register("sleek-chat", "popoutPosition", {
        scope: "client",
        config: false,
        type: Object,
        default: null
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
