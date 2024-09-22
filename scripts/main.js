import { debugLog } from './sleek-chat-debug.js';
import './settings.js';
import { RecentMessageDisplay } from './recent-message-display.js';
import { updateDragAndDropState } from './drag-drop.js';

function parseDiceRanges() {
    const ranges = {};

    function parseRange(setting) {
        const rangeStr = game.settings.get("sleek-chat", setting);
        return rangeStr.split(';').map(range => {
            const [low, high] = range.split('-').map(Number);
            return {
                min: isNaN(high) ? low : Math.min(low, high),
                max: isNaN(high) ? low : Math.max(low, high)
            };
        });
    }

    ranges.d4 = parseRange("d4ResultRanges");
    ranges.d6 = parseRange("d6ResultRanges");
    ranges.d8 = parseRange("d8ResultRanges");
    ranges.d10 = parseRange("d10ResultRanges");
    ranges.d12 = parseRange("d12ResultRanges");
    ranges.d20 = parseRange("d20ResultRanges");
    ranges.d100 = parseRange("d100ResultRanges");
    // Add similar entries for other dice types (d10, d12, d20, etc.)

    return ranges;
}

function getResultClass(result, ranges) {
    if (result >= ranges[0].min && result <= ranges[0].max) {
        return 'fumble';
    } else if (result >= ranges[1].min && result <= ranges[1].max) {
        return 'normal';
    } else if (result >= ranges[2].min && result <= ranges[2].max) {
        return 'critical';
    }
    return '';
}

export function applySeeOnlyChat(seeOnlyChat) {
    const diceRollSections = document.querySelectorAll('.dice-buttons, .custom-dice-controls, .roll-result'); 
    const sleekChatContainer = document.querySelector('.sleek-chat-container');

    diceRollSections.forEach(section => {
        if (seeOnlyChat) {
            section.style.display = 'none';  // Hide all dice-related sections
        } else {
            section.style.display = '';  // Show them again
        }
    });

    if (sleekChatContainer) {
        sleekChatContainer.classList.toggle('chat-only-mode', seeOnlyChat);
    }
}


// Apply setting on load
Hooks.once("ready", () => {
    const seeOnlyChat = game.settings.get("sleek-chat", "seeOnlyChat");
    applySeeOnlyChat(seeOnlyChat);
});

// Function to apply navigation button hiding based on settings
export function applyNavButtonHiding() {
    const hideAll = game.settings.get("sleek-chat", "hideNavButtonsAll");
    const hideForPlayersOnly = game.settings.get("sleek-chat", "hideNavButtonsForPlayers");

    function updateButtonVisibility() {
        const isGM = game.user.isGM;
        const isCollapsed = document.getElementById('sidebar').classList.contains('collapsed');

        debugLog(`"Apply only to Players" is set to: ${hideForPlayersOnly}`);
        debugLog(`Current user is GM: ${isGM}`);
        debugLog(`"Hide Always" is set to: ${hideAll}`);
        debugLog(`Sidebar is collapsed: ${isCollapsed}`);

        // Skip hiding logic if the user is a GM and "Apply only to Players" is true
        if (isGM && hideForPlayersOnly) {
            debugLog("Hiding is skipped because 'Apply only to Players' is true and the current user is a GM.");
            return;
        }

        // Get all sidebar navigation buttons
        const buttons = document.querySelectorAll('#sidebar-tabs > .item');

        buttons.forEach(button => {
            const tabName = button.dataset.tab;
            const hideSetting = game.settings.get("sleek-chat", `hide${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);

            debugLog(`Checkbox for "${tabName}" is set to: ${hideSetting}`);

            if (hideAll && hideSetting) {
                // Hide if "Hide Always" is enabled and the setting for the menu is true
                button.style.display = "none";
                debugLog(`Menu "${tabName}" is hidden due to "Hide Always" setting.`);
            } else if (!hideAll && isCollapsed && hideSetting) {
                // Hide if sidebar is collapsed and the individual setting is true
                button.style.display = "none";
                debugLog(`Menu "${tabName}" is hidden because the sidebar is collapsed and the setting is enabled.`);
            } else {
                // Show the menu in other cases
                button.style.display = "";
                debugLog(`Menu "${tabName}" is shown based on sidebar state or "Hide Always" being disabled.`);
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

// Function to create settings for new sidebar tabs
export function createDynamicSidebarSettings() {
    const buttons = document.querySelectorAll('#sidebar-tabs > .item');
    
    buttons.forEach(button => {
        const tabName = button.dataset.tab;
        const settingKey = `hide${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        
        if (!game.settings.settings.get(`sleek-chat.${settingKey}`)) {
            game.settings.register("sleek-chat", settingKey, {
                name: `Hide ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`,
                hint: `Hide the ${tabName} tab in the sidebar`,
                scope: "world",
                config: true,
                type: Boolean,
                default: false,
                onChange: () => applyNavButtonHiding()
            });
        }
    });
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

// Function to play the ping sound
function playPingSound() {
    const enablePingSound = game.settings.get("sleek-chat", "enablePingSound");
    if (!enablePingSound) return;

    const pingSoundPath = game.settings.get("sleek-chat", "pingSoundPath") || "modules/sleek-chat/ui/chat-ping.ogg";
    const audio = new Audio(pingSoundPath);
    audio.volume = 0.5; // You can adjust this or make it configurable
    audio.play().catch(e => console.error("Error playing ping sound:", e));
}

// Modify the existing hook for new chat messages
Hooks.on('createChatMessage', (message, options, userId) => {
    debugLog("New chat message detected:", message.id);
    RecentMessageDisplay.addMessageToHistory(message.id);
    RecentMessageDisplay.updateRecentMessage(message.id);
    playPingSound(); // Add this line to play the ping sound
});

// Hook to render the custom Sleek Chat UI on Chat Log render
Hooks.on("renderChatLog", async (app, html, data) => {
    debugLog("renderChatLog: Starting to render Sleek Chat UI for all users.");

    const templatePath = "modules/sleek-chat/templates/dice-toolbar.html";
    const users = game.users.filter(user => user.active && user.id !== game.user.id);
    const toolbarHTML = await renderTemplate(templatePath, { users });

    debugLog("Toolbar HTML generated. Appending to body.");
    $('body').append(toolbarHTML);

    // Add the event listener for Enter key press in the chat input
    const chatInput = document.getElementById('custom-chat-input');

    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();  // Prevents newline in the textarea
            sendMessage();
        }
    });

    function sendMessage() {
        const messageContent = chatInput.value.trim();
        if (messageContent.length === 0) return;  // Don't send empty messages

        // Get the selected whisper recipient
        const whisperRecipient = document.getElementById('whisper-recipient').value;
        let whisper = null;

        // If a whisper recipient is selected, set the whisper array
        if (whisperRecipient) {
            whisper = [whisperRecipient];
        }

        // Create the chat message, including the whisper if applicable
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_STYLES.IC,
            whisper: whisper // Add the whisper array if it's set
        });

        // Clear the input field
        chatInput.value = '';
    }

    let selectedDiceCounts = {};
    let advantage = false;
    let disadvantage = false;

    const hideAdvDisadv = game.settings.get("sleek-chat", "hideAdvDisadv");
    const hideTotalResult = game.settings.get("sleek-chat", "hideTotalResult");

    if (hideAdvDisadv) {
        $('#advantage-toggle').hide();
        $('#disadvantage-toggle').hide();
        debugLog("Advantage/Disadvantage buttons are hidden");
    }

    const updateVisibility = () => {
        const sidebar = document.getElementById('sidebar');
        const isCollapsed = sidebar.classList.contains('collapsed');
        const toolbar = document.querySelector('.sleek-chat');
        const recentMessageContainer = document.querySelector('.recent-message-container');
        const navButtonsContainer = document.querySelector('.nav-buttons-container');
        const sleekChatContainer = document.querySelector('.sleek-chat-container');

        debugLog("Sidebar is collapsed:", isCollapsed);

        if (toolbar) {
            toolbar.style.display = isCollapsed ? 'flex' : 'none';
            debugLog("Toolbar visibility set to:", isCollapsed ? 'flex' : 'none');
        }
        if (recentMessageContainer) {
            recentMessageContainer.style.display = isCollapsed ? 'block' : 'none';
            debugLog("Recent message container visibility set to:", isCollapsed ? 'block' : 'none');
        }
        if (navButtonsContainer) {
            navButtonsContainer.style.display = isCollapsed ? 'flex' : 'none';
            debugLog("Nav buttons container visibility set to:", isCollapsed ? 'flex' : 'none');
        }
        if (sleekChatContainer) {
            sleekChatContainer.style.display = isCollapsed ? 'block' : 'none';
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
        // Build roll formula based on user input
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
        // Prepare the roll formula
        const modifier = parseInt($('#modifier').val()) || 0;
        let rollFormula = rolls.join(" + ") + (modifier !== 0 ? ` + ${modifier}` : "");
        const roll = new Roll(rollFormula);
        debugLog("Roll formula created:", rollFormula);
    
        // Evaluate the roll
        await roll.evaluate({async: true});
    
        // Use Dice So Nice for visualization if available
        if (game.dice3d) {
            await game.dice3d.showForRoll(roll, game.user, true);
            debugLog("Dice So Nice roll complete.");
        }
    
        // Fetch the dice ranges
        const diceRanges = parseDiceRanges();
    
        // Prepare data for Handlebars template
        const diceTerms = roll.terms.filter(term => term instanceof Die);
        const templateData = {
            roll: {
                formula: rollFormula,
                terms: diceTerms.map(term => {
                    const diceType = `d${term.faces}`;
                    const ranges = diceRanges[diceType] || [];
                    return {
                        faces: term.faces,
                        results: term.results.map(result => {
                            const resultClass = ranges.length > 0 ? getResultClass(result.result, ranges) : '';
                            return {
                                value: result.result,
                                class: resultClass
                            };
                        })
                    };
                }),
                total: hideTotalResult ? null : roll.total
            }
        };
        debugLog("Template data prepared:", templateData);
    
        // Render and send the chat message
        const content = await renderTemplate("modules/sleek-chat/templates/common-roll.hbs", templateData);
        debugLog("Creating chat message with content:", content);
    
        // Create the chat message
        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            content: content,
            roll: roll,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        });
        debugLog("Chat message created successfully.");
    
        // Reset dice selection and UI
        selectedDiceCounts = {};
        $('.dice-count').text("0").hide();
        $('#modifier').val(0);
        advantage = false;
        disadvantage = false;
        $('#advantage-toggle').removeClass("active");
        $('#disadvantage-toggle').removeClass("active");
    });
      
    function getResultClass(result, ranges) {
        if (result >= ranges[0].min && result <= ranges[0].max) {
            return 'fumble';
        } else if (result >= ranges[1].min && result <= ranges[1].max) {
            return 'normal';
        } else if (result >= ranges[2].min && result <= ranges[2].max) {
            return 'critical';
        }
        return '';
    }  
    
    function updateDiceCount(dice, count) {
        const countElement = $(`.dice-count[data-dice="${dice}"]`);
        if (count > 0) {
            countElement.text(count).css('display', 'flex');
        } else {
            countElement.text("0").css('display', 'none');
        }
    }

    const seeOnlyChat = game.settings.get("sleek-chat", "seeOnlyChat");
    applySeeOnlyChat(seeOnlyChat);
});

// Hook to run when Foundry VTT is fully ready
Hooks.on('ready', () => {
    debugLog("Foundry VTT is ready.");
    createDynamicSidebarSettings();
    applyNavButtonHiding();

    // Apply Sleek Chat Opacity
    const sleekChatOpacity = game.settings.get("sleek-chat", "sleekChatOpacity");
    $('.sleek-chat').css('opacity', sleekChatOpacity);
    debugLog("Sleek Chat Opacity set to:", sleekChatOpacity);

    // Apply the dice color filter on startup
    const diceColorFilter = game.settings.get("sleek-chat", "diceColorFilter");
    applyDiceColorFilter(diceColorFilter);

    // Initialize drag and drop
    updateDragAndDropState(game.settings.get("sleek-chat", "enableDragAndDrop"));

    const hideAdvDisadv = game.settings.get("sleek-chat", "hideAdvDisadv");
    if (hideAdvDisadv) {
        $('#advantage-toggle').hide();
        $('#disadvantage-toggle').hide();
        debugLog("Advantage/Disadvantage buttons are hidden");
    }

    const hideTotalResult = game.settings.get("sleek-chat", "hideTotalResult");
    if (hideTotalResult) {
        debugLog("Total result is hidden");
    }

    // Initialize the RecentMessageDisplay if enabled
    console.log("Initializing RecentMessageDisplay.");
    RecentMessageDisplay.init();
    
    // Initialize ping sound
    const pingSoundPath = game.settings.get("sleek-chat", "pingSoundPath");
    if (pingSoundPath) {
        const audio = new Audio(pingSoundPath);
        audio.load(); // Preload the audio file
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
    debugLog(`Dice color filter applied: ${color}`);
}
