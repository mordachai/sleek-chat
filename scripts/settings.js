import { debugLog } from './sleek-chat-debug.js';
import { applyNavButtonHiding } from './main.js';
import { applyDiceColorFilter } from './main.js';
import { applyMessageFadeOutSettings } from './recent-message-display.js';
import { updateDragAndDropState } from './drag-drop.js';

Hooks.once('init', function() {
    const reloadRequiredSettings = [
        "hideNavButtonsAll",
        "hideNavButtonsForPlayers",
        "hideTotalResult",
        "hideAdvDisadv",
    ];

    reloadRequiredSettings.forEach(setting => {
        game.settings.register("sleek-chat", setting, {
            name: setting === "hideNavButtonsAll" ? "Hide Always" : 
                  setting === "hideNavButtonsForPlayers" ? "Apply only to Players" : 
                  setting === "hideTotalResult" ? "Hide Total Result in Rolls" :
                  setting === "hideAdvDisadv" ? "Hide Adv./Disadv. Buttons" : setting,
            hint: setting === "hideNavButtonsAll" ? "Check this box to hide the menus even if the sidebar is not collapsed."
                 : setting === "hideNavButtonsForPlayers" ? "If checked, the navigation buttons will only be hidden for players (non-GMs)."
                 : setting === "hideTotalResult" ? "Check this to hide the total result in chat rolls. Useful for dice pool systems."
                 : setting === "hideAdvDisadv" ? "Check this to hide both buttons. Use it if your system doesn't require these rolls."
                 : "This setting requires a reload to take effect.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                Dialog.confirm({
                    title: "Reload Application?",
                    content: "<p>Some of the changed settings require a reload of the application to take effect. Would you like to reload now?</p>",
                    yes: () => window.location.reload(),
                    no: () => debugLog("Reload canceled."),
                    defaultYes: true
                });
            }
        });
    });

    // Register other settings without forcing a reload
    game.settings.register("sleek-chat", "hideChat", {
        name: "Hide Chat Messages",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideCombat", {
        name: "Hide Combat Encounters",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideScenes", {
        name: "Hide Scenes",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideActors", {
        name: "Hide Actors",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideItems", {
        name: "Hide Items",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideJournal", {
        name: "Hide Journal",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideTables", {
        name: "Hide Rollable Tables",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideCards", {
        name: "Hide Card Stacks",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hidePlaylists", {
        name: "Hide Playlists",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideCompendium", {
        name: "Hide Compendium Packs",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "hideSettings", {
        name: "Hide Game Settings",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => applyNavButtonHiding()
    });

    game.settings.register("sleek-chat", "enableDragAndDrop", {
        name: "Enable Drag and Drop",
        hint: "Allow the Sleek Chat interface to be dragged and positioned anywhere on the screen.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            updateDragAndDropState(value);
        }
    });

    game.settings.register("sleek-chat", "messageFadeOutTime", {
        name: "Message Fade Out Time (seconds)",
        hint: "Set the time in seconds for messages to fade out.",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 20,
            step: 0.5
        },
        default: 5,
        onChange: value => {
            // Placeholder for any immediate changes
            debugLog(`Message Fade Out Time set to: ${value} seconds`);
        }
    });

    // Register new setting for message fade-out opacity
    game.settings.register("sleek-chat", "messageFadeOutOpacity", {
        name: "Message Fade Out Opacity",
        hint: "Set the final opacity level for messages when they fade out.",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        },
        default: 0.5,
        onChange: value => {
            // Placeholder for any immediate changes
            debugLog(`Message Fade Out Opacity set to: ${value}`);
        }
    });

    // Register new setting for Sleek Chat opacity
    game.settings.register("sleek-chat", "sleekChatOpacity", {
        name: "Sleek Chat Opacity",
        hint: "Set the opacity of the Sleek Chat interface.",
        scope: "client",
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        },
        default: 0.7,
        onChange: value => {
            // Placeholder for any immediate changes
            debugLog(`Sleek Chat Opacity set to: ${value}`);
        }
    });

    game.settings.register("sleek-chat", "diceColorFilter", {
        name: "Dice Color",
        hint: "Select the color of the dice used in the Sleek Chat.",
        scope: "client",
        config: true,
        type: String, // The type is String because the setting value is a string representing the selected option.
        choices: {
            "white": "White",
            "red": "Red",
            "green": "Green",
            "cyan": "Cyan",
            "blue": "Blue",
            "pink": "Pink",
            "yellow": "Yellow"
        },
        default: "white",
        onChange: value => {
            applyDiceColorFilter(value);
        }
    });

    game.settings.register("sleek-chat", "d4ResultRanges", {
        name: "d4 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d4 (e.g., '1;2-3;4').",
        scope: "world",
        config: true,
        type: String,
        default: "1;2-3;4",
        onChange: value => {
            debugLog("Updated d4 result ranges:", value);
        }
    });
    
    game.settings.register("sleek-chat", "d6ResultRanges", {
        name: "d6 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d6 (e.g., '1;2-5;6').",
        scope: "world",
        config: true,
        type: String,
        default: "1;2-5;6",
        onChange: value => {
            debugLog("Updated d6 result ranges:", value);
        }
    });
    
    game.settings.register("sleek-chat", "d8ResultRanges", {
        name: "d8 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d8 (e.g., '1-2;3-6;7-8').",
        scope: "world",
        config: true,
        type: String,
        default: "1;2-7;8",
        onChange: value => {
            debugLog("Updated d8 result ranges:", value);
        }
    });

    game.settings.register("sleek-chat", "d10ResultRanges", {
        name: "d10 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d4 (e.g., '1;2-9;10').",
        scope: "world",
        config: true,
        type: String,
        default: "1;2-9;10",
        onChange: value => {
            debugLog("Updated d10 result ranges:", value);
        }
    });
    
    game.settings.register("sleek-chat", "d12ResultRanges", {
        name: "d12 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d6 (e.g., '1;2-11;12').",
        scope: "world",
        config: true,
        type: String,
        default: "1;2-11;12",
        onChange: value => {
            debugLog("Updated d12 result ranges:", value);
        }
    });
    
    game.settings.register("sleek-chat", "d20ResultRanges", {
        name: "d20 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d8 (e.g., '1;2-9;20').",
        scope: "world",
        config: true,
        type: String,
        default: "1;2-9;20",
        onChange: value => {
            debugLog("Updated d20 result ranges:", value);
        }
    });

    game.settings.register("sleek-chat", "d100ResultRanges", {
        name: "d100 Result Ranges",
        hint: "Enter the fumble, normal, and critical ranges for d8 (e.g., '1-5;6-94;95-100').",
        scope: "world",
        config: true,
        type: String,
        default: "1-5;6-94;95-100",
        onChange: value => {
            debugLog("Updated d100 result ranges:", value);
        }
    });

    // Register the Debug Mode setting
    game.settings.register("sleek-chat", "debugMode", {
        name: "Enable Debug Mode",
        hint: "If enabled, debug messages will be printed to the console.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            if (value) {
                debugLog("Debug Mode enabled.");
            } else {
                debugLog("Debug Mode disabled.");
            }
        }
    });

});
