# Releases changelog

## 2.0.0

### Major Refactoring

- Complete rewrite focusing on chat popout enhancements
- Removed dice rolling toolbar functionality (simplified module scope)
- Added single message view with navigation controls (Previous/Next buttons)
- Improved opacity controls with real-time slider adjustment
- Enhanced popout window management with cleaner UI

### Breaking Changes

- Dice rolling features removed - module now focuses exclusively on chat popout improvements
- All dice-related settings removed
- Templates and UI assets for dice removed

### Improvements

- Streamlined codebase with modular architecture (PopoutChatManager, PopoutMessageManager, PopoutOpacityManager)
- Better message history management (maintains last 50 messages)
- Automatic message validation and cleanup
- Cleaner popout interface with hidden header
- More intuitive navigation through chat history

## 1.3.1

### Improvements

- Better handling of chat drawing using handlebar files instead of html
- Drag the chat around is more stable and register last position

### Bug fixes

- Issue with bottom sticking to canvas base
- Issue with saving some settings like See only chat requiring page refresh to take effect

## 1.3.0

### New display option in settings

- Added option to show only roll card and chatbox, hiding the dice tray

### Bug fixes

- Vertical size is now limited, a scrollbar will appear if needed
- Default position of the chat moved a bit to the left to not cover the sidebar menu with tall roll cards

## 1.2.0

### New Features

- Added optional sound notifications for new chat messages
  - Can be configured on a per-player basis
  - Allows users to choose their own notification sounds

### Improvements

- Enhanced compatibility with sidebar-modifying modules
    - Now works seamlessly with modules that add new menus to the sidebar (e.g., Notebook module)

## 1.1.0

### Improvements in roll display

- Added dice background image to rolls
- Settings to change colors in dice rolls ranges: fumble, normal and critical

### Bug fixes

- Roll results now await for the dice animation to end
- User list correctly updating to display only connected players

## 1.0.0

- main module functionalities