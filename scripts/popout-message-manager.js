import { debugLog } from './sleek-chat-debug.js';
import { PopoutChatManager } from './popout-chat.js';

export class PopoutMessageManager {
    static messageIds = [];
    static currentMessageIndex = -1;
    static popoutEl = null;
    static popoutApp = null;

    static SLIDE_ANIMATION_DURATION = 300;

    static initialize(element, app) {
        console.log("PopoutMessageManager: Initializing");
        this.popoutEl = element;
        this.popoutApp = app;
        this.populateMessageIds();
        this.setupNavigationButtons();
        this.showLastMessage();
        debugLog(`PopoutMessageManager: Initialized with ${this.messageIds.length} messages`);
    }

    static populateMessageIds() {
        const messages = this.popoutEl.querySelectorAll('.chat-log li[data-message-id]');
        this.messageIds = Array.from(messages).map(el => el.dataset.messageId);
        this.currentMessageIndex = this.messageIds.length - 1;
        debugLog(`PopoutMessageManager: Populated ${this.messageIds.length} message IDs`);
    }

    static showLastMessage() {
        if (this.messageIds.length === 0) {
            debugLog("PopoutMessageManager: No messages to display");
            this.popoutEl.querySelector('.chat-log')?.classList.add('sleek-chat-popout-mode');
            return;
        }
        this.showMessage(this.currentMessageIndex, false, false);
    }

    static showMessage(index, adjustPosition = true, animate = false) {
        console.log(`[SLEEK] showMessage called - index: ${index}, adjustPosition: ${adjustPosition}, animate: ${animate}`);

        const oldHeight = Math.round(this.popoutEl.offsetHeight);
        const oldTop = Math.round(parseFloat(this.popoutEl.style.top) || 0);

        console.log(`[SLEEK] BEFORE - oldTop: ${oldTop}px, oldHeight: ${oldHeight}px`);

        this.popoutEl.querySelector('.chat-log')?.classList.add('sleek-chat-popout-mode');
        this.popoutEl.querySelectorAll('.chat-log li.chat-message').forEach(el => {
            el.classList.remove('sleek-visible', 'sleek-animate');
        });

        const messageId = this.messageIds[index];
        const messageElement = this.popoutEl.querySelector(`li[data-message-id="${messageId}"]`);

        if (messageElement) {
            messageElement.classList.add('sleek-visible');
            if (animate) messageElement.classList.add('sleek-animate');
            console.log(`[SLEEK] Message ${messageId} now visible (animate: ${animate})`);

            if (PopoutChatManager.initialPositionSet && adjustPosition) {
                void this.popoutEl.offsetHeight; // Force reflow
                const newHeight = Math.round(this.popoutEl.offsetHeight);
                const heightDiff = newHeight - oldHeight;

                console.log(`[SLEEK] AFTER - newHeight: ${newHeight}px, heightDiff: ${heightDiff}px`);

                if (heightDiff !== 0) {
                    const newTop = oldTop - heightDiff;
                    console.log(`[SLEEK] ADJUSTING - Setting top from ${oldTop}px to ${newTop}px`);

                    this.popoutEl.style.top = `${newTop}px`;

                    if (this.popoutApp?.position) {
                        this.popoutApp.position.top = newTop;
                    }

                    PopoutChatManager.ensureOnScreen?.();

                    game.settings.set('sleek-chat', 'popoutPosition', {
                        top: newTop,
                        left: Math.round(parseFloat(this.popoutEl.style.left) || 0)
                    });
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

        this.messageIds = this.messageIds.filter(id =>
            this.popoutEl.querySelector(`li[data-message-id="${id}"]`) !== null
        );

        if (this.messageIds.length !== originalLength) {
            debugLog(`PopoutMessageManager: Validated messages - removed ${originalLength - this.messageIds.length} deleted messages`);
        }

        if (this.currentMessageIndex >= this.messageIds.length) {
            this.currentMessageIndex = this.messageIds.length - 1;
        }

        if (this.currentMessageIndex < 0 && this.messageIds.length > 0) {
            this.currentMessageIndex = 0;
        }

        this.updateButtonStates();
    }

    static updateButtonStates() {
        const prevBtn = this.popoutEl.querySelector('.sleek-nav-prev');
        const nextBtn = this.popoutEl.querySelector('.sleek-nav-next');

        if (!prevBtn || !nextBtn) {
            debugLog("PopoutMessageManager: Navigation buttons not found");
            return;
        }

        prevBtn.disabled = this.currentMessageIndex <= 0;
        nextBtn.disabled = this.currentMessageIndex >= this.messageIds.length - 1;

        debugLog(`PopoutMessageManager: Button states - Prev: ${prevBtn.disabled ? 'disabled' : 'enabled'}, Next: ${nextBtn.disabled ? 'disabled' : 'enabled'}`);
    }

    static setupNavigationButtons() {
        this.popoutEl.querySelector('.sleek-nav-prev')?.addEventListener('click', () => {
            this.navigateMessages(-1);
        });

        this.popoutEl.querySelector('.sleek-nav-next')?.addEventListener('click', () => {
            this.navigateMessages(1);
        });

        this.popoutEl.querySelector('.sleek-nav-bottom')?.addEventListener('click', () => {
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

        if (this.messageIds.length > 50) {
            const removed = this.messageIds.shift();
            debugLog(`PopoutMessageManager: Removed oldest message ${removed} (50 message limit)`);
        }

        this.currentMessageIndex = this.messageIds.length - 1;

        setTimeout(() => {
            this.showMessage(this.currentMessageIndex, false, true);
        }, 100);
    }

    static handleDeletedMessage(messageId) {
        debugLog(`PopoutMessageManager: Handling deleted message ${messageId}`);

        const index = this.messageIds.indexOf(messageId);
        if (index > -1) {
            this.messageIds.splice(index, 1);

            if (this.currentMessageIndex >= this.messageIds.length) {
                this.currentMessageIndex = this.messageIds.length - 1;
            }

            if (this.messageIds.length > 0) {
                this.showMessage(this.currentMessageIndex, false, false);
            } else {
                debugLog("PopoutMessageManager: No messages remaining after deletion");
                this.popoutEl.querySelector('.chat-log')?.classList.add('sleek-chat-popout-mode');
                this.popoutEl.querySelectorAll('.chat-log li.chat-message').forEach(el => {
                    el.classList.remove('sleek-visible');
                });
            }
        }
    }

    static cleanup() {
        debugLog("PopoutMessageManager: Cleaning up");
        this.messageIds = [];
        this.currentMessageIndex = -1;
        this.popoutEl = null;
        this.popoutApp = null;
    }
}
