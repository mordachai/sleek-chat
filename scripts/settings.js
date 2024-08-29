import { applyNavButtonHiding } from './main.js';

Hooks.once('init', function() {
    const reloadRequiredSettings = [
        "hideNavButtonsAll",
        "hideNavButtonsForPlayers",
        "hideTotalResult",
        "hideAdvDisadv"
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
});
