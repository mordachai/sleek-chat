# Sleek Chat

## Description:

**Sleek Chat** is a minimalist chat, roll and message interface for Foundry VTT that enhances immersion by reducing UI clutter. Maximize their virtual tabletop space it's the ideal companion for story-focused and visually immersive games.

![image](https://github.com/user-attachments/assets/c39f24ce-467d-4593-bcde-156685089401)

Check the video on YouTube: https://www.youtube.com/watch?v=c95AF7TEV7E

## Installation

In Foundry VTT, go to the Add-on Modules tab and click Install Module. Then:

1. Search in the top bar for "sleek chat" and click on the Install button of the module
2. Enable the module in your Game Settings under Manage Modules

OR

1. Paste the following manifest URL into the bottom Manifest URL field:
https://github.com/mordachai/sleek-chat/raw/main/module.json
2. Enable the module in your Game Settings under Manage Modules

## Usage and Settings

### The Sleek Chat will appear only when you collapse the Foundry sidebar.

- **Enable Drag and Drop:** Allow the Sleek Chat interface to be repositioned on the screen.
- **Sleek Chat Opacity:** Adjust the overall opacity of the Sleek Chat interface (0.1 to 1.0).
- **Hide Navigation Menus:** You can occult the selected navigation buttons in the sidebar to help lessen the cluttering, keeping only the ones your players need.
- **Hide Always:** Keep the selected menus hidden even when the sidebar is expanded.
- **Apply only to Players:** Hide navigation buttons only for non-GM users, while you keep seeing everything.
- **Show only chat:** Hide dice roll controls, display only chatbox and the last rolled card.
- **Dice Color:** Choose from various color options for the dice icons (white, red, green, cyan, blue, pink, yellow).
- **dx Result Ranges:** Enter the fumble, normal, and critical ranges for the die roll on the chat. Example:
    - _**FitD systems:**_ set the D6s to "1-3; 4-5; 6" to represent the fail, partial success, and success results.
    - _**Call of Cthulhu:**_ set the D100 to "96-100; 2-95;1" to correctly represent the system results.
    - If you don't want colors you can set the die as "0; range-total; 0", e.g. for the D8: "0;1-8;0". This way all D8s rolls will have a white color.

 
| ![image](https://github.com/user-attachments/assets/8abb381e-806e-44ef-86bb-a85098434cb6) |
|:--:|
| *D6s dice roll set for Forged in the Dark systems* |

### Message Display

- **Message Fade Out Time:** Set the duration (in seconds) before messages start to fade out.
- **Message Fade Out Opacity:** Define the final opacity level for faded messages (0.1 to 1.0).
- **Hide Total Result in Rolls:** Useful for systems where you want to show dice rolls without revealing the total, like some dice pool systems.
- **Hide Adv./Disadv. Buttons:** Remove advantage/disadvantage options if not needed in your game system.
- **Enable Debug Mode:** Display debug information on console.

### Usage Tips

After changing settings, you may need to refresh your browser for all changes to take effect.
Experiment with opacity and fade settings to find the right balance for your game's visual style.

Remember, some settings are client-side (affecting only your view), while others are world-level (affecting all users). Coordinate with your GM or players to ensure a consistent experience across the game.

### Known bugs:
Some system that uses buttons in the chat rolls can present issues when trying to interact with them. You can test it out and open an issue to let me know here: https://github.com/mordachai/sleek-chat/issues 
