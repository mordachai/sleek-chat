// recent-message-display.js

export class RecentMessageDisplay {
    static init() {
        this.recentMessageContainer = null;
        this.messageIds = [];
        this.currentMessageIndex = -1;
        this.createRecentMessageContainer();
        this.hookChatLog();
    }

    static createRecentMessageContainer() {
        const sleekChat = document.querySelector('.sleek-chat');
        if (sleekChat) {
            this.recentMessageContainer = document.createElement('div');
            this.recentMessageContainer.classList.add('recent-message-container');
            
            // Create message display area
            const messageDisplay = document.createElement('div');
            messageDisplay.classList.add('message-display');
            this.recentMessageContainer.appendChild(messageDisplay);

            // Create navigation buttons container
            const navButtonsContainer = document.createElement('div');
            navButtonsContainer.classList.add('nav-buttons-container');

            // Create navigation buttons
            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&#9668;'; // Left arrow
            prevButton.classList.add('nav-button', 'prev-button');
            prevButton.addEventListener('click', () => this.navigateMessages(-1));

            const nextButton = document.createElement('button');
            nextButton.innerHTML = '&#9658;'; // Right arrow
            nextButton.classList.add('nav-button', 'next-button');
            nextButton.addEventListener('click', () => this.navigateMessages(1));

            // Append buttons to container
            navButtonsContainer.appendChild(prevButton);
            navButtonsContainer.appendChild(nextButton);

            // Append elements
            this.recentMessageContainer.appendChild(navButtonsContainer);

            sleekChat.insertBefore(this.recentMessageContainer, sleekChat.firstChild);
        }
    }

    static hookChatLog() {
        Hooks.on('createChatMessage', (message, options, userId) => {
            this.addMessageToHistory(message.id);
            this.updateRecentMessage(message.id);
        });
    }

    static removeContainer() {
        if (this.recentMessageContainer) {
            this.recentMessageContainer.remove();
            this.recentMessageContainer = null;
        }
    }

    static addMessageToHistory(messageId) {
        this.messageIds.push(messageId);
        if (this.messageIds.length > 50) { // Keep last 50 messages
            this.messageIds.shift();
        }
        this.currentMessageIndex = this.messageIds.length - 1;
    }

    static async updateRecentMessage(messageId) {
        if (!this.recentMessageContainer) return;

        const messageDisplay = this.recentMessageContainer.querySelector('.message-display');
        messageDisplay.innerHTML = '';

        const message = game.messages.get(messageId);
        if (message) {
            const messageElement = await this.createMessageElement(message);
            messageDisplay.appendChild(messageElement);
        }

        this.updateButtonStates();
    }

    static async createMessageElement(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('recent-message');

        // Add speaker name
        const speakerName = message.speaker.alias || game.users.get(message.user)?.name || "Unknown";
        messageElement.innerHTML = `<strong>${speakerName}:</strong> `;

        // Handle different message types
        switch (message.type) {
            case CONST.CHAT_MESSAGE_TYPES.OOC:
                messageElement.innerHTML += message.content;
                break;
            case CONST.CHAT_MESSAGE_TYPES.IC:
                messageElement.innerHTML += `<i>${message.content}</i>`;
                break;
            case CONST.CHAT_MESSAGE_TYPES.EMOTE:
                messageElement.innerHTML += `<em>${message.content}</em>`;
                break;
            case CONST.CHAT_MESSAGE_TYPES.ROLL:
                await this.handleRollMessage(message, messageElement);
                break;
            default:
                messageElement.innerHTML += message.content;
        }

        return messageElement;
    }

    static async handleRollMessage(message, messageElement) {
        const roll = message.roll;
        if (roll) {
            await roll.evaluate({async: true});
            messageElement.innerHTML += `<strong>Roll:</strong> ${roll.total} <small>(${roll.formula})</small>`;
        } else {
            messageElement.innerHTML += message.content;
        }
    }

    static async navigateMessages(direction) {
        this.currentMessageIndex += direction;
        if (this.currentMessageIndex < 0) {
            this.currentMessageIndex = 0;
        } else if (this.currentMessageIndex >= this.messageIds.length) {
            this.currentMessageIndex = this.messageIds.length - 1;
        }

        const messageId = this.messageIds[this.currentMessageIndex];
        if (messageId) {
            await this.updateRecentMessage(messageId);
        }

        this.updateButtonStates();
    }

    static updateButtonStates() {
        const prevButton = this.recentMessageContainer.querySelector('.prev-button');
        const nextButton = this.recentMessageContainer.querySelector('.next-button');
        prevButton.disabled = this.currentMessageIndex === 0;
        nextButton.disabled = this.currentMessageIndex === this.messageIds.length - 1;
    }
}