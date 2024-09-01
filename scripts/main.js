import './settings.js';
import { RecentMessageDisplay } from './recent-message-display.js';
import { updateDragAndDropState } from './drag-drop.js';

// Function to apply navigation button hiding based on settings
export function applyNavButtonHiding() {
    const hideAll = game.settings.get("sleek-chat", "hideNavButtonsAll");
    const hideForPlayersOnly = game.settings.get("sleek-chat", "hideNavButtonsForPlayers");

    function updateButtonVisibility() {
        const isGM = game.user.isGM;
        const isCollapsed = document.getElementById('sidebar').classList.contains('collapsed');

        console.log(`"Apply only to Players" is set to: ${hideForPlayersOnly}`);
        console.log(`Current user is GM: ${isGM}`);
        console.log(`"Hide Always" is set to: ${hideAll}`);
        console.log(`Sidebar is collapsed: ${isCollapsed}`);

        // Skip hiding logic if the user is a GM and "Apply only to Players" is true
        if (isGM && hideForPlayersOnly) {
            console.log("Hiding is skipped because 'Apply only to Players' is true and the current user is a GM.");
            return;
        }

        const buttons = {
            chat: document.querySelector('[data-tab="chat"]'),
            combat: document.querySelector('[data-tab="combat"]'),
            scenes: document.querySelector('[data-tab="scenes"]'),
            actors: document.querySelector('[data-tab="actors"]'),
            items: document.querySelector('[data-tab="items"]'),
            journal: document.querySelector('[data-tab="journal"]'),
            tables: document.querySelector('[data-tab="tables"]'),
            cards: document.querySelector('[data-tab="cards"]'),
            playlists: document.querySelector('[data-tab="playlists"]'),
            compendium: document.querySelector('[data-tab="compendium"]'),
            settings: document.querySelector('[data-tab="settings"]'),
        };

        Object.keys(buttons).forEach(key => {
            const button = buttons[key];
            const hideSetting = game.settings.get("sleek-chat", `hide${key.charAt(0).toUpperCase() + key.slice(1)}`);

            console.log(`Checkbox for "${key}" is set to: ${hideSetting}`);

            if (button) {
                if (hideAll && hideSetting) {
                    // Hide if "Hide Always" is enabled and the setting for the menu is true
                    button.style.display = "none";
                    console.log(`Menu "${key}" is hidden due to "Hide Always" setting.`);
                } else if (!hideAll && isCollapsed && hideSetting) {
                    // Hide if sidebar is collapsed and the individual setting is true
                    button.style.display = "none";
                    console.log(`Menu "${key}" is hidden because the sidebar is collapsed and the setting is enabled.`);
                } else {
                    // Show the menu in other cases
                    button.style.display = "";
                    console.log(`Menu "${key}" is shown based on sidebar state or "Hide Always" being disabled.`);
                }
            }
        });

        // Refresh the sidebar to apply changes
        ui.sidebar.render(true);
    }

    // Initial visibility update
    updateButtonVisibility();

    // Observe changes in the sidebar state
    const observer = new MutationObserver(() => {
        updateButtonVisibility();
    });

    observer.observe(document.getElementById('sidebar'), { attributes: true, attributeFilter: ['class'] });

    // Handle the case when settings are changed
    Hooks.on('updateSetting', updateButtonVisibility);
}

// Function to synchronize player settings with GM settings
export function synchronizePlayerSettings() {
    const keysToSync = [
        "hideNavButtonsAll",
        "hideChat",
        "hideCombat",
        "hideScenes",
        "hideActors",
        "hideItems",
        "hideJournal",
        "hideTables",
        "hideCards",
        "hidePlaylists",
        "hideCompendium",
        "hideSettings",
        "hideTotalResult",
        "hideAdvDisadv"
    ];

    keysToSync.forEach(key => {
        const gmSetting = game.settings.get("sleek-chat", key);
        game.settings.set("sleek-chat", key, gmSetting);
    });

    applyNavButtonHiding();
}

// Hook to render the custom Sleek Chat UI on Chat Log render
Hooks.on("renderChatLog", async (app, html, data) => {
    console.log("renderChatLog: Starting to render Sleek Chat UI for all users.");

    // Load your custom toolbar template
    const templatePath = "modules/sleek-chat/templates/dice-toolbar.html";
    const users = game.users.filter(user => user.id !== game.user.id);
    const toolbarHTML = await renderTemplate(templatePath, { users });

    console.log("Toolbar HTML generated. Appending to body.");
    $('body').append(toolbarHTML);

    // Select the custom chat input element
    const chatInput = document.getElementById('custom-chat-input');

    // Event listener for sending message on Enter key press
    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();  // Prevent the default behavior of adding a new line
            sendMessage();
        }
    });

    // Function to handle sending messages
    function sendMessage() {
        // Capture the content from the chat input including images and formatting
        const messageContent = chatInput.innerHTML.trim();
        if (messageContent.length === 0) return;  // Do not send empty messages

        // Get the selected whisper recipient (if any)
        const whisperRecipient = document.getElementById('whisper-recipient').value;
        let whisper = null;
        if (whisperRecipient) {
            whisper = [whisperRecipient];
        }

        // Create and send the chat message
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.IC,
            whisper: whisper
        });

        // Clear the input field after sending the message
        chatInput.innerHTML = '';
    }

    let selectedDiceCounts = {};
    let advantage = false;
    let disadvantage = false;

    const hideAdvDisadv = game.settings.get("sleek-chat", "hideAdvDisadv");
    const hideTotalResult = game.settings.get("sleek-chat", "hideTotalResult");

    if (hideAdvDisadv) {
        $('#advantage-toggle').hide();
        $('#disadvantage-toggle').hide();
        console.log("Advantage/Disadvantage buttons are hidden");
    }

    const updateVisibility = () => {
        const sidebar = document.getElementById('sidebar');
        const isCollapsed = sidebar.classList.contains('collapsed');
        const toolbar = document.querySelector('.sleek-chat');
        const recentMessageContainer = document.querySelector('.recent-message-container');
        const navButtonsContainer = document.querySelector('.nav-buttons-container');

        console.log("Sidebar is collapsed:", isCollapsed);

        if (toolbar) {
            toolbar.style.display = isCollapsed ? 'flex' : 'none';
            console.log("Toolbar visibility set to:", isCollapsed ? 'flex' : 'none');
        }
        if (recentMessageContainer) {
            recentMessageContainer.style.display = isCollapsed ? 'block' : 'none';
            console.log("Recent message container visibility set to:", isCollapsed ? 'block' : 'none');
        }
        if (navButtonsContainer) {
            navButtonsContainer.style.display = isCollapsed ? 'flex' : 'none';
            console.log("Nav buttons container visibility set to:", isCollapsed ? 'flex' : 'none');
        }
    };

    updateVisibility();

    const observer = new MutationObserver(() => {
        updateVisibility();
    });
    observer.observe(document.getElementById('sidebar'), { attributes: true, attributeFilter: ['class'] });

    $('.sleek-chat button').on("click", ev => {
        const dice = ev.currentTarget.dataset.dice;
        if (!dice) return;

        if (!selectedDiceCounts[dice]) {
            selectedDiceCounts[dice] = 0;
        }

        selectedDiceCounts[dice] += 1;
        updateDiceCount(dice, selectedDiceCounts[dice]);
    });

    $('.sleek-chat button').on("contextmenu", ev => {
        ev.preventDefault();
        const dice = ev.currentTarget.dataset.dice;
        if (!dice) return;

        if (selectedDiceCounts[dice] && selectedDiceCounts[dice] > 0) {
            selectedDiceCounts[dice] -= 1;
            updateDiceCount(dice, selectedDiceCounts[dice]);
        }
    });

    $('#decrease-modifier').click(() => {
        const modifierField = $('#modifier');
        let modifierValue = parseInt(modifierField.val()) || 0;
        modifierField.val(modifierValue - 1);
    });

    $('#increase-modifier').click(() => {
        const modifierField = $('#modifier');
        let modifierValue = parseInt(modifierField.val()) || 0;
        modifierField.val(modifierValue + 1);
    });

    $('#advantage-toggle').click(() => {
        advantage = !advantage;
        disadvantage = false;
        $('#advantage-toggle').toggleClass("active", advantage);
        $('#disadvantage-toggle').removeClass("active");
    });

    $('#disadvantage-toggle').click(() => {
        disadvantage = !disadvantage;
        advantage = false;
        $('#disadvantage-toggle').toggleClass("active", disadvantage);
        $('#advantage-toggle').removeClass("active");
    });

    $('#roll-dice').click(async () => {
        let rolls = [];
    
        for (let dice in selectedDiceCounts) {
            let count = selectedDiceCounts[dice];
            if (count > 0) {
                if (advantage) {
                    rolls.push(`${count === 1 ? 2 : count}${dice}kh`);
                } else if (disadvantage) {
                    rolls.push(`${count === 1 ? 2 : count}${dice}kl`);
                } else {
                    rolls.push(`${count}${dice}`);
                }
            }
        }
    
        if (rolls.length === 0) {
            ui.notifications.warn("Please select at least one die to roll.");
            return;
        }
    
        const modifier = parseInt($('#modifier').val()) || 0;
        let rollFormula = rolls.join(" + ") + (modifier !== 0 ? ` + ${modifier}` : "");
        const roll = new Roll(rollFormula, {}, {backgroundColor: 'rgba(128, 128, 255, 0.2)'}); // Example background color
    
        console.log("Evaluating roll formula:", rollFormula);
        await roll.evaluate({async: true});  // Ensure roll is fully evaluated before proceeding
        console.log("Roll evaluation complete. Total result:", roll.total);

        const templateData = {
            title: "Dice Roll",
            description: `Rolling ${rollFormula}`,
            diceResults: roll.terms
                .filter(term => term instanceof Die)
                .flatMap(term => term.results.map(r => r.result))
                .join(", "),
            total: hideTotalResult ? null : roll.total
        };

        const content = await renderTemplate("modules/sleek-chat/templates/common-roll.hbs", templateData);

        console.log("Creating chat message with content:", content);

        // Create and insert the chat message
        const chatMessage = await ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content,
            rolls: [roll],
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll  // Include the roll in the message data
        });

        console.log("Chat message created successfully.");
        
        // Update the RecentMessageDisplay with the new message ID
        RecentMessageDisplay.updateRecentMessage(chatMessage.id);

        // Reset the dice selection and UI
        selectedDiceCounts = {};
        $('.dice-count').text("0").hide();
        $('#modifier').val(0);
        advantage = false;
        disadvantage = false;
        $('#advantage-toggle').removeClass("active");
        $('#disadvantage-toggle').removeClass("active");
    });

    function updateDiceCount(dice, count) {
        const countElement = $(`.dice-count[data-dice="${dice}"]`);
        if (count > 0) {
            countElement.text(count).css('display', 'flex');
        } else {
            countElement.text("0").css('display', 'none');
        }
    }
});

// Hook to run when Foundry VTT is fully ready
Hooks.on('ready', () => {
    console.log("Foundry VTT is ready.");
    applyNavButtonHiding();

    // Apply Sleek Chat Opacity
    const sleekChatOpacity = game.settings.get("sleek-chat", "sleekChatOpacity");
    $('.sleek-chat').css('opacity', sleekChatOpacity);
    console.log("Sleek Chat Opacity set to:", sleekChatOpacity);

    // Apply the dice color filter on startup
    const diceColorFilter = game.settings.get("sleek-chat", "diceColorFilter");
    applyDiceColorFilter(diceColorFilter);

    // Initialize drag and drop
    updateDragAndDropState(game.settings.get("sleek-chat", "enableDragAndDrop"));

    const hideAdvDisadv = game.settings.get("sleek-chat", "hideAdvDisadv");
    if (hideAdvDisadv) {
        $('#advantage-toggle').hide();
        $('#disadvantage-toggle').hide();
        console.log("Advantage/Disadvantage buttons are hidden");
    }

    const hideTotalResult = game.settings.get("sleek-chat", "hideTotalResult");
    if (hideTotalResult) {
        console.log("Total result is hidden");
    }

    // Initialize the RecentMessageDisplay if enabled
    if (game.settings.get("sleek-chat", "showRecentMessage")) {
        console.log("Initializing RecentMessageDisplay.");
        RecentMessageDisplay.init();
    }
});

// Function to apply dice color filter based on settings
export function applyDiceColorFilter(color) {
    let filter;
    switch (color) {
        case "red":
            filter = "brightness(0) saturate(100%) invert(22%) sepia(84%) saturate(2925%) hue-rotate(347deg) brightness(93%) contrast(107%)";
            break;
        case "green":
            filter = "brightness(0) saturate(100%) invert(56%) sepia(99%) saturate(383%) hue-rotate(78deg) brightness(99%) contrast(102%)";
            break;
        case "cyan":
            filter = "brightness(0) saturate(100%) invert(90%) sepia(61%) saturate(5882%) hue-rotate(133deg) brightness(108%) contrast(101%)";
            break;
        case "blue":
            filter = "brightness(0) saturate(100%) invert(57%) sepia(50%) saturate(4091%) hue-rotate(189deg) brightness(99%) contrast(102%)";
            break;
        case "pink":
            filter = "brightness(0) saturate(100%) invert(38%) sepia(98%) saturate(1593%) hue-rotate(275deg) brightness(91%) contrast(95%)";
            break;
        case "yellow":
            filter = "brightness(0) saturate(100%) invert(88%) sepia(98%) saturate(2235%) hue-rotate(325deg) brightness(101%) contrast(100%)";
            break;
        case "white":
        default:
            filter = "none"; // No filter for white
    }
    document.documentElement.style.setProperty('--dice-filter', filter);
    console.log(`Dice color filter applied: ${color}`);
}
