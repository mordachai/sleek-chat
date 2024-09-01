// sleek-chat-debug.js
export function debugLog(...args) {
    if (game.settings.get("sleek-chat", "debugMode")) {
        console.log(...args);
    }
}
