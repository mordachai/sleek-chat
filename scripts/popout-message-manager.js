import { debugLog } from './sleek-chat-debug.js';
import { PopoutChatManager } from './popout-chat.js';

export class PopoutMessageManager {
    static messageIds = [];
    static currentMessageIndex = -1;
    static popoutHtml = null;

    static initialize(html) {
        console.log("PopoutMessageManager: Initializing");
        // Ensure jQuery wrapped
        this.popoutHtml = html instanceof jQuery ? html : $(html);
        this.populateMessageIds();
        this.setupNavigationButtons();
        this.showLastMessage();
        debugLog(`PopoutMessageManager: Initialized with ${this.messageIds.length} messages`);
    }

    static populateMessageIds() {
        const messages = this.popoutHtml.find('.chat-log li[data-message-id]');
        this.messageIds = messages.map((i, el) => el.dataset.messageId).get();
        this.currentMessageIndex = this.messageIds.length - 1;
        debugLog(`PopoutMessageManager: Populated ${this.messageIds.length} message IDs`);
    }

    static showLastMessage() {
        if (this.messageIds.length === 0) {
            debugLog("PopoutMessageManager: No messages to display");
            this.popoutHtml.find('.chat-log').addClass('sleek-chat-popout-mode');
            return;
        }
        this.showMessage(this.currentMessageIndex);
    }

    static showMessage(index) {
        debugLog(`PopoutMessageManager: Showing message at index ${index}`);

        // Get popout container and current height before change
        const popoutContainer = this.popoutHtml.closest('#chat-popout');
        const oldHeight = popoutContainer.outerHeight();

        // Add mode class and hide all messages
        this.popoutHtml.find('.chat-log').addClass('sleek-chat-popout-mode');
        this.popoutHtml.find('.chat-log li.chat-message').removeClass('sleek-visible');

        // Show selected message
        const messageId = this.messageIds[index];
        const messageElement = this.popoutHtml.find(`li[data-message-id="${messageId}"]`);

        if (messageElement.length > 0) {
            messageElement.addClass('sleek-visible');
            debugLog(`PopoutMessageManager: Showing message ${messageId}`);

            // Anchor from bottom: adjust top position to compensate for height change
            // Only do this after initial position has been set
            if (PopoutChatManager.initialPositionSet) {
                requestAnimationFrame(() => {
                    const newHeight = popoutContainer.outerHeight();
                    const heightDiff = newHeight - oldHeight;

                    if (heightDiff !== 0) {
                        const currentTop = parseInt(popoutContainer.css('top')) || 0;
                        const newTop = currentTop - heightDiff;
                        popoutContainer.css('top', `${newTop}px`);

                        // Save the adjusted position
                        const position = {
                            top: newTop,
                            left: parseInt(popoutContainer.css('left')) || 0
                        };
                        game.settings.set('sleek-chat', 'popoutPosition', position);

                        debugLog(`PopoutMessageManager: Adjusted top by ${-heightDiff}px (height changed by ${heightDiff}px)`);
                    }
                });
            }
        } else {
            debugLog(`PopoutMessageManager: Warning - Message ${messageId} not found in DOM`);
        }

        this.updateButtonStates();
    }

    static navigateMessages(direction) {
        debugLog(`PopoutMessageManager: Navigating ${direction > 0 ? 'next' : 'previous'}`);

        this.validateMessageIds();

        this.currentMessageIndex += direction;
        this.currentMessageIndex = Math.max(0, Math.min(this.messageIds.length - 1, this.currentMessageIndex));

        if (this.messageIds.length > 0) {
            this.showMessage(this.currentMessageIndex);
        }
    }

    static validateMessageIds() {
        const originalLength = this.messageIds.length;

        // Filter out messages that no longer exist in the DOM
        this.messageIds = this.messageIds.filter(id =>
            this.popoutHtml.find(`li[data-message-id="${id}"]`).length > 0
        );

        if (this.messageIds.length !== originalLength) {
            debugLog(`PopoutMessageManager: Validated messages - removed ${originalLength - this.messageIds.length} deleted messages`);
        }

        // Adjust current index if it's out of bounds
        if (this.currentMessageIndex >= this.messageIds.length) {
            this.currentMessageIndex = this.messageIds.length - 1;
        }

        if (this.currentMessageIndex < 0 && this.messageIds.length > 0) {
            this.currentMessageIndex = 0;
        }

        this.updateButtonStates();
    }

    static updateButtonStates() {
        const prevBtn = this.popoutHtml.find('.sleek-nav-prev');
        const nextBtn = this.popoutHtml.find('.sleek-nav-next');

        if (prevBtn.length === 0 || nextBtn.length === 0) {
            debugLog("PopoutMessageManager: Navigation buttons not found");
            return;
        }

        const atStart = this.currentMessageIndex <= 0;
        const atEnd = this.currentMessageIndex >= this.messageIds.length - 1;

        prevBtn.prop('disabled', atStart);
        nextBtn.prop('disabled', atEnd);

        debugLog(`PopoutMessageManager: Button states - Prev: ${atStart ? 'disabled' : 'enabled'}, Next: ${atEnd ? 'disabled' : 'enabled'}`);
    }

    static setupNavigationButtons() {
        this.popoutHtml.find('.sleek-nav-prev').on('click', () => {
            this.navigateMessages(-1);
        });

        this.popoutHtml.find('.sleek-nav-next').on('click', () => {
            this.navigateMessages(1);
        });

        debugLog("PopoutMessageManager: Navigation buttons set up");
    }

    static handleNewMessage(messageId) {
        debugLog(`PopoutMessageManager: Handling new message ${messageId}`);

        this.messageIds.push(messageId);

        // Maintain 50 message limit
        if (this.messageIds.length > 50) {
            const removed = this.messageIds.shift();
            debugLog(`PopoutMessageManager: Removed oldest message ${removed} (50 message limit)`);
        }

        // Navigate to the newest message
        this.currentMessageIndex = this.messageIds.length - 1;

        // Wait a brief moment for DOM to update
        setTimeout(() => {
            this.showMessage(this.currentMessageIndex);
        }, 100);
    }

    static handleDeletedMessage(messageId) {
        debugLog(`PopoutMessageManager: Handling deleted message ${messageId}`);

        const index = this.messageIds.indexOf(messageId);
        if (index > -1) {
            this.messageIds.splice(index, 1);

            // If we were viewing the deleted message, adjust the index
            if (this.currentMessageIndex >= this.messageIds.length) {
                this.currentMessageIndex = this.messageIds.length - 1;
            }

            // Show the adjusted message or handle empty state
            if (this.messageIds.length > 0) {
                this.showMessage(this.currentMessageIndex);
            } else {
                debugLog("PopoutMessageManager: No messages remaining after deletion");
                this.popoutHtml.find('.chat-log').addClass('sleek-chat-popout-mode');
                this.popoutHtml.find('.chat-log li.chat-message').removeClass('sleek-visible');
            }
        }
    }

    static cleanup() {
        debugLog("PopoutMessageManager: Cleaning up");
        this.messageIds = [];
        this.currentMessageIndex = -1;
        this.popoutHtml = null;
    }
}
