export class RecentMessageDisplay {
    static init() {
        console.log("RecentMessageDisplay: Initializing...");
        
        // Locate existing elements in the HTML structure
        this.recentMessageContainer = document.querySelector('.recent-message-container');
        this.messageDisplay = this.recentMessageContainer.querySelector('.message-display');
        this.prevButton = document.querySelector('.nav-buttons-container .prev-button');
        this.nextButton = document.querySelector('.nav-buttons-container .next-button');

        this.messageIds = [];
        this.currentMessageIndex = -1;

        this.populateMessageIds(); // Fill the message IDs
        this.setupNavigationButtons();
        this.setupDeleteFunctionality(); // Initialize delete functionality

        // Display the last message at startup
        if (this.messageIds.length > 0) {
            console.log("RecentMessageDisplay: Displaying the last message on initialization.");
            this.updateRecentMessage(this.messageIds[this.currentMessageIndex]);
        }

        this.hookChatLog();
        RecentMessageDisplay.applyFadeOutEffect(this.recentMessageContainer); // Apply the fade-out effect at startup
    }

    static populateMessageIds() {
        const messageElements = document.querySelectorAll('#chat-log li[data-message-id]');
        this.messageIds = Array.from(messageElements).map(el => el.getAttribute('data-message-id'));
        this.currentMessageIndex = this.messageIds.length - 1; // Start at the last item
        console.log("RecentMessageDisplay: Message IDs populated:", this.messageIds);
    }

    static hookChatLog() {
        Hooks.on('createChatMessage', (message, options, userId) => {
            console.log("RecentMessageDisplay: New chat message detected:", message.id);
            this.addMessageToHistory(message.id);
            this.updateRecentMessage(message.id); // Update the display immediately with the new message
        });
    }

    static setupNavigationButtons() {
        console.log("RecentMessageDisplay: Setting up navigation buttons.");
        this.prevButton.addEventListener('click', () => this.navigateMessages(-1));
        this.nextButton.addEventListener('click', () => this.navigateMessages(1));
    }

    static async updateRecentMessage(messageId) {
        console.log("RecentMessageDisplay: Updating recent message with ID:", messageId);
        if (!this.messageDisplay) {
            console.warn("RecentMessageDisplay: messageDisplay is not defined.");
            return;
        }
    
        // Clear the current content of the message-display
        this.messageDisplay.innerHTML = '';
        console.log("RecentMessageDisplay: Cleared messageDisplay content.");
    
        // Wait a short interval before attempting to locate the new message in the DOM
        setTimeout(async () => {
            const chatLog = document.querySelector('#chat-log');
            console.log("RecentMessageDisplay: Current chat log content:", chatLog.innerHTML);
    
            // Locate the corresponding li element in the chat-log
            const messageElement = document.querySelector(`#chat-log li[data-message-id="${messageId}"]`);
    
            if (messageElement) {
                console.log("RecentMessageDisplay: Found message element:", messageElement);
    
                // Ensure that the associated roll is fully evaluated
                const message = game.messages.get(messageId);
                if (message && message.rolls && message.rolls.length > 0) {
                    const roll = message.rolls[0];
                    if (!roll._evaluated) {
                        console.log("RecentMessageDisplay: Roll not yet evaluated, awaiting evaluation.");
                        await roll.evaluate({async: true});
                        console.log("RecentMessageDisplay: Roll evaluation complete.");
                    }
                }
    
                // At this point, ensure the roll is done, then make the message visible
                messageElement.classList.remove('dsn-hide');
    
                // Copy the HTML of the message
                const messageHTML = messageElement.outerHTML;
    
                console.log("RecentMessageDisplay: HTML to insert into messageDisplay:", messageHTML);
    
                // Insert the HTML into the message-display
                this.messageDisplay.innerHTML = messageHTML;
    
                // Add class to animate the entrance
                this.messageDisplay.classList.add('animate-slide-in');
    
                // Set up the fade-out to start only after the animation and display time
                const animationDuration = 2000; // Animation duration (2s)
                setTimeout(() => {
                    this.messageDisplay.classList.remove('animate-slide-in');
                    RecentMessageDisplay.startFadeOutTimer(); // Start the fade-out timer after animation and display time
                }, animationDuration);
    
                console.log("RecentMessageDisplay: Inserted HTML into messageDisplay.");
    
                this.setupHoverEffect(); // Set up the hover effect
    
            } else {
                console.warn("RecentMessageDisplay: Could not find message element in chat log for ID:", messageId);
            }
    
            this.updateButtonStates();
        }, 5); // 5ms delay to ensure the DOM is updated
    }
    

    static navigateMessages(direction) {
        console.log("RecentMessageDisplay: Navigating messages with direction:", direction);
        this.currentMessageIndex += direction;
        if (this.currentMessageIndex < 0) {
            this.currentMessageIndex = 0;
        } else if (this.currentMessageIndex >= this.messageIds.length) {
            this.currentMessageIndex = this.messageIds.length - 1;
        }

        const messageId = this.messageIds[this.currentMessageIndex];
        if (messageId) {
            this.updateRecentMessage(messageId);
        } else {
            console.warn("RecentMessageDisplay: No message ID found for current index:", this.currentMessageIndex);
        }
    }

    static updateButtonStates() {
        console.log("RecentMessageDisplay: Updating button states.");
        this.prevButton.disabled = this.currentMessageIndex === 0;
        this.nextButton.disabled = this.currentMessageIndex === this.messageIds.length - 1;
    }

    static addMessageToHistory(messageId) {
        console.log("RecentMessageDisplay: Adding message to history with ID:", messageId);
        this.messageIds.push(messageId);
        if (this.messageIds.length > 50) { // Keep the last 50 messages
            this.messageIds.shift();
        }
        this.currentMessageIndex = this.messageIds.length - 1;
        console.log("RecentMessageDisplay: Updated message history:", this.messageIds);
    }

    static applyRollBackground(element, message) {
        const rollBackgroundColor = message.roll?.options?.backgroundColor || 'rgba(255, 255, 255, 1)';
        element.style.backgroundColor = rollBackgroundColor;
        console.log("RecentMessageDisplay: Applied roll background color:", rollBackgroundColor);
    }

    static startFadeOutTimer() {
        const fadeOutTime = game.settings.get("sleek-chat", "messageFadeOutTime") * 1000; // Convert to milliseconds
        const fadeOutOpacity = game.settings.get("sleek-chat", "messageFadeOutOpacity");
    
        const container = this.recentMessageContainer; // Target the container instead of message-display

        // Start the fade-out after the specified delay (after the animation has finished)
        setTimeout(() => {
            console.log("RecentMessageDisplay: Starting fade out after specified delay.");
            $(container).fadeTo(1000, fadeOutOpacity); // 1 second fade-out
        }, fadeOutTime);
    }

    static setupHoverEffect() {
        const fadeOutTime = game.settings.get("sleek-chat", "messageFadeOutTime") * 1000;
        const fadeOutOpacity = game.settings.get("sleek-chat", "messageFadeOutOpacity");

        const container = this.recentMessageContainer; // The container we want to animate

        // Mouse enter: instantly set opacity to 1.0 and stop any ongoing fade
        container.addEventListener('mouseover', () => {
            $(container).stop(true, true).css('opacity', 1.0);
            console.log("RecentMessageDisplay: Mouse over - container opacity set to 1.0.");
        });

        // Mouse leave: start the fade-out after the specified delay
        container.addEventListener('mouseleave', () => {
            setTimeout(() => {
                $(container).fadeTo(1000, fadeOutOpacity); // Fade-out over 1 second
                console.log("RecentMessageDisplay: Mouse leave - reapplied fade effect to container.");
            }, fadeOutTime); // Delay before starting the fade
        });
    }
    
    static setupDeleteFunctionality() {
        const container = this.recentMessageContainer;
        
        // Event delegation: listen for clicks on delete buttons within the container
        container.addEventListener('click', async (event) => {
            if (event.target.closest('.message-delete')) {
                const messageElement = event.target.closest('li[data-message-id]');
                if (messageElement) {
                    const messageId = messageElement.getAttribute('data-message-id');
                    try {
                        // Use Foundry VTT API to delete the message
                        let chatMessage = game.messages.get(messageId);
                        if (chatMessage) {
                            await chatMessage.delete();
                            console.log(`Message with ID ${messageId} deleted.`);
                            
                            // Update the display after deletion
                            this.removeMessageFromDisplay(messageId);
                        }
                    } catch (error) {
                        console.error("Error deleting message: ", error);
                    }
                }
            }
        });
    }

    static removeMessageFromDisplay(deletedMessageId) {
        // Remove the message ID from the list
        this.messageIds = this.messageIds.filter(id => id !== deletedMessageId);
        
        // Check if there are any messages left
        if (this.messageIds.length > 0) {
            // Set the current index to the last message
            this.currentMessageIndex = Math.min(this.currentMessageIndex, this.messageIds.length - 1);
            // Update the display with the next available message
            this.updateRecentMessage(this.messageIds[this.currentMessageIndex]);
        } else {
            // If no messages are left, clear the message display
            this.messageDisplay.innerHTML = '';
            console.log("RecentMessageDisplay: No messages left to display.");
        }

        // Update the state of navigation buttons
        this.updateButtonStates();
    }

    static applyFadeOutEffect(element) {
        const fadeOutTime = game.settings.get("sleek-chat", "messageFadeOutTime") * 1000; // Convert to milliseconds
        const fadeOutOpacity = game.settings.get("sleek-chat", "messageFadeOutOpacity");

        // Start the fade-out effect after the specified delay
        setTimeout(() => {
            console.log("RecentMessageDisplay: Starting fade out after specified delay.");
            $(element).fadeTo(1000, fadeOutOpacity); // 1 second fade-out
        }, fadeOutTime);
    }

    static applyMessageFadeOutSettings() {
        console.log("RecentMessageDisplay: Applying message fade out settings.");
        const messageElements = document.querySelectorAll('.recent-message');
        messageElements.forEach(element => {
            // Reapply the fade-out effect with updated settings
            RecentMessageDisplay.applyFadeOutEffect(element);
        });
    }
}

// Export the function correctly
export function applyMessageFadeOutSettings() {
    RecentMessageDisplay.applyMessageFadeOutSettings();
}
