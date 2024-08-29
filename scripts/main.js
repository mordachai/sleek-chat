import './settings.js';

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



function hideAllNavButtons() {
    const buttons = document.querySelectorAll('[data-tab]');
    buttons.forEach(button => {
        button.style.display = "none";
    });
    console.log("All navigation buttons are hidden for players due to 'Apply only to Players' setting.");
}

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

Hooks.on("renderChatLog", async (app, html, data) => {
    if (!game.user.isGM) return;

    const templatePath = "modules/sleek-chat/templates/dice-toolbar.html";
    const toolbarHTML = await renderTemplate(templatePath, {});
    $('body').append(toolbarHTML);

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
        if (toolbar) {
            toolbar.style.display = isCollapsed ? 'flex' : 'none';
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
        const roll = new Roll(rollFormula);

        await roll.evaluate({async: true});

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

        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content,
            rolls: [roll],
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        });

        selectedDiceCounts = {};
        $('.dice-count').text("0").hide();
        $('#modifier').val(0);
        advantage = false;
        disadvantage = false;
        $('#advantage-toggle').removeClass("active");
        $('#disadvantage-toggle').removeClass("active");
    });

    $('#custom-chat-input').keypress(async (e) => {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            const message = $('#custom-chat-input').val();
            if (message.trim()) {
                const templateData = {
                    title: "Custom Message",
                    author: game.user.name,
                    message: message
                };

                const content = await renderTemplate("modules/sleek-chat/templates/custom-chat-card.hbs", templateData);

                ChatMessage.create({
                    content: content,
                    speaker: ChatMessage.getSpeaker()
                });

                $('#custom-chat-input').val('');
            }
        }
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

Hooks.on('ready', () => {
    applyNavButtonHiding();

    const hideAdvDisadv = game.settings.get("sleek-chat", "hideAdvDisadv");
    if (hideAdvDisadv) {
        $('#advantage-toggle').hide();
        $('#disadvantage-toggle').hide();
        console.log("Advantage/Disadvantage buttons are hidden");
    }

    const hideTotalResult = game.settings.get("sleek-chat", "hideTotalResult");
    if (hideTotalResult) {
        console.log("Total result is hidden");
        // Additional logic for hiding the total result if needed
    }
});
