import { applyNavButtonHiding } from './main.js';
import { applyDiceColorFilter } from './main.js';
import { applyMessageFadeOutSettings } from './recent-message-display.js';

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
                    no: () => console.log("Reload canceled."),
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

    game.settings.register("sleek-chat", "showRecentMessage", {
        name: "Show Recent Message",
        hint: "Display the most recent chat message above the chat input area.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            if (value) {
                RecentMessageDisplay.init();
            } else {
                RecentMessageDisplay.removeContainer();
            }
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
            console.log(`Message Fade Out Time set to: ${value} seconds`);
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
            console.log(`Message Fade Out Opacity set to: ${value}`);
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
        default: 0.8,
        onChange: value => {
            // Placeholder for any immediate changes
            console.log(`Sleek Chat Opacity set to: ${value}`);
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

});
