// recent-message-display.js

export class RecentMessageDisplay {
    static init() {
        this.recentMessageContainer = null;
        this.createRecentMessageContainer();
        this.hookChatLog();
    }

    static createRecentMessageContainer() {
        const sleekChat = document.querySelector('.sleek-chat');
        if (sleekChat) {
            this.recentMessageContainer = document.createElement('div');
            this.recentMessageContainer.classList.add('recent-message-container');
            sleekChat.insertBefore(this.recentMessageContainer, sleekChat.firstChild);
        }
    }

    static hookChatLog() {
        Hooks.on('createChatMessage', (message, options, userId) => {
            this.updateRecentMessage(message);
        });
    }

    static removeContainer() {
        if (this.recentMessageContainer) {
            this.recentMessageContainer.remove();
            this.recentMessageContainer = null;
        }
    }

    static async updateRecentMessage(message) {
        if (!this.recentMessageContainer) return;

        // Clear previous content
        this.recentMessageContainer.innerHTML = '';

        // Create a simplified message display
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

        // Add the simplified message to the container
        this.recentMessageContainer.appendChild(messageElement);
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
}