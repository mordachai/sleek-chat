# Sleek Chat

## Description

**Sleek Chat** is a minimalist chat popout enhancement for Foundry VTT v13+ that lets you focus on one message at a time. Perfect for keeping your screen clean while still staying connected to the conversation.

<img width="1914" height="1004" alt="image" src="https://github.com/user-attachments/assets/9a271ad5-d67d-4d86-83bc-291e5ba7c59c" />

## Installation

In Foundry VTT, go to the Add-on Modules tab and click Install Module. Then:

1. Search in the top bar for "sleek chat" and click on the Install button
2. Enable the module in your Game Settings under Manage Modules

OR

1. Paste the following manifest URL into the bottom Manifest URL field:
   ```
   https://github.com/mordachai/sleek-chat/releases/latest/download/module.json
   ```
2. Enable the module in your Game Settings under Manage Modules

## How to Use

**Right-click the Chat button** in the right sidebar and select "Pop Out to Window". Sleek Chat takes over from there!

The popout window shows one message at a time with:
- **Previous / Next buttons** - Navigate through your chat history
- **Jump to Bottom button** (▼) - Skip to the latest message
- **Auto-fade** - Chat fades out when you're not using it, comes back at full opacity when you hover or type

## Settings

All settings are found in Module Settings:

- **Faded Opacity** - How transparent the chat gets when idle (default: 50%)
- **Fade Out Time** - How long to wait before fading (default: 2000ms)
- **Enable Debug Mode** - Shows detailed console logs for troubleshooting


## Known Issues

Some game systems with custom chat buttons may have interaction quirks. If you run into any issues, let me know here: https://github.com/mordachai/sleek-chat/issues

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
