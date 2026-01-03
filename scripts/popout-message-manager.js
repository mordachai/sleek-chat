import { debugLog } from './sleek-chat-debug.js';
import { PopoutChatManager } from './popout-chat.js';

export class PopoutMessageManager {
    static messageIds = [];
    static currentMessageIndex = -1;
    static popoutHtml = null;
    static popoutApp = null;

    // Animation duration - must match CSS animation (styles.css)
    static SLIDE_ANIMATION_DURATION = 300; // milliseconds

    static initialize(html, app) {
        console.log("PopoutMessageManager: Initializing");
        // Ensure jQuery wrapped
        this.popoutHtml = html instanceof jQuery ? html : $(html);
        this.popoutApp = app;
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
        this.showMessage(this.currentMessageIndex, false, false); // Don't adjust position, no animation
    }

    static showMessage(index, adjustPosition = true, animate = false) {
        console.log(`[SLEEK] showMessage called - index: ${index}, adjustPosition: ${adjustPosition}, animate: ${animate}`);

        // Get popout container and current height before change
        const popoutContainer = this.popoutHtml.closest('#chat-popout');
        const oldHeight = Math.round(popoutContainer.outerHeight());
        const oldTop = Math.round(parseFloat(popoutContainer.css('top')) || 0);

        console.log(`[SLEEK] BEFORE - oldTop: ${oldTop}px, oldHeight: ${oldHeight}px`);

        // Add mode class and hide all messages (remove animation class)
        this.popoutHtml.find('.chat-log').addClass('sleek-chat-popout-mode');
        this.popoutHtml.find('.chat-log li.chat-message').removeClass('sleek-visible sleek-animate');

        // Show selected message
        const messageId = this.messageIds[index];
        const messageElement = this.popoutHtml.find(`li[data-message-id="${messageId}"]`);

        if (messageElement.length > 0) {
            // Add visible class, optionally add animate class
            if (animate) {
                messageElement.addClass('sleek-visible sleek-animate');
            } else {
                messageElement.addClass('sleek-visible');
            }
            console.log(`[SLEEK] Message ${messageId} now visible (animate: ${animate})`);

            // Anchor from bottom: calculate and adjust position
            // Only adjust position when navigating, NOT when new messages arrive
            if (PopoutChatManager.initialPositionSet && adjustPosition) {
                // Force layout calculation - measure actual rendered height
                popoutContainer[0].offsetHeight; // Force reflow
                const newHeight = Math.round(popoutContainer.outerHeight());
                const heightDiff = newHeight - oldHeight;

                console.log(`[SLEEK] AFTER - newHeight: ${newHeight}px, heightDiff: ${heightDiff}px`);

                if (heightDiff !== 0) {
                    const newTop = oldTop - heightDiff;
                    console.log(`[SLEEK] ADJUSTING - Setting top from ${oldTop}px to ${newTop}px`);

                    // Log app position before change
                    if (this.popoutApp && this.popoutApp.position) {
                        console.log(`[SLEEK] App position BEFORE - top: ${this.popoutApp.position.top}px, left: ${this.popoutApp.position.left}px`);
                    }

                    // Directly set CSS without Foundry's setPosition (avoid constraints)
                    popoutContainer.css('top', `${newTop}px`);

                    // Update Foundry's internal position state
                    if (this.popoutApp && this.popoutApp.position) {
                        this.popoutApp.position.top = newTop;
                        console.log(`[SLEEK] App position AFTER - top: ${this.popoutApp.position.top}px, left: ${this.popoutApp.position.left}px`);
                    }

                    // Ensure window stays on screen (tall messages could push header off-screen)
                    if (PopoutChatManager.ensureOnScreen) {
                        PopoutChatManager.ensureOnScreen();
                    }

                    // Verify CSS actually updated
                    const actualTop = Math.round(parseFloat(popoutContainer.css('top')) || 0);
                    console.log(`[SLEEK] CSS top verified: ${actualTop}px`);

                    // Save the adjusted position
                    const position = {
                        top: newTop,
                        left: Math.round(parseFloat(popoutContainer.css('left')) || 0)
                    };
                    game.settings.set('sleek-chat', 'popoutPosition', position);
                } else {
                    console.log(`[SLEEK] NO ADJUSTMENT - heights are the same`);
                }
            } else if (!adjustPosition) {
                console.log(`[SLEEK] SKIPPED - adjustPosition is false`);
            }
        } else {
            console.log(`[SLEEK] WARNING - Message ${messageId} not found in DOM`);
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

        this.popoutHtml.find('.sleek-nav-bottom').on('click', () => {
            this.jumpToBottom();
        });

        debugLog("PopoutMessageManager: Navigation buttons set up");
    }

    static jumpToBottom() {
        debugLog("PopoutMessageManager: Jumping to bottom (last message)");

        this.validateMessageIds();

        if (this.messageIds.length > 0) {
            this.currentMessageIndex = this.messageIds.length - 1;
            this.showMessage(this.currentMessageIndex);
        }
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
            this.showMessage(this.currentMessageIndex, false, true); // Don't adjust position, but animate new messages
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
                this.showMessage(this.currentMessageIndex, false, false); // Don't adjust position on deletion, no animation
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
        this.popoutApp = null;
    }
}
