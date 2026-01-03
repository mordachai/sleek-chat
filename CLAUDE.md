# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sleek Chat** is a Foundry VTT module (v12+) that provides a minimalist dice rolling toolbar and chat interface. It appears only when the sidebar is collapsed, reducing UI clutter for story-focused games.

**Critical**: This module has NO build process. There is no package.json, webpack, or any bundler. All JavaScript is native ES6 modules, CSS is plain CSS (no preprocessing), and templates are Handlebars files loaded at runtime.

## Development Workflow

### Making Changes
1. Edit files directly in the module folder
2. Refresh Foundry VTT in browser to see changes
3. No compilation, build, or preprocessing step needed
4. CSS is automatically loaded - do NOT try to compile or build it

### Testing
- Enable "Debug Mode" in module settings for console logging
- Use the `debugLog()` function from `scripts/sleek-chat-debug.js` for conditional logging
- Test with sidebar collapsed and expanded states
- Test with both GM and player accounts for permission-based features

### File Editing
- ALWAYS use `foundry.applications.handlebars.loadTemplates()` (namespaced), NOT the deprecated global `loadTemplates()`
- Preserve exact indentation when editing (mix of tabs/spaces exists)
- Templates use Handlebars syntax (.hbs files)

## Architecture

### Module Loading Order (from module.json)
1. **scripts/settings.js** - Registers all game settings in `Hooks.once('init')`
2. **scripts/sleek-chat-debug.js** - Debug utility (`debugLog()` function)
3. **scripts/main.js** - Main UI logic, dice rolling, visibility control
4. **scripts/recent-message-display.js** - Message history and navigation

### Key Design Patterns

#### Hook-Based Architecture
The module uses Foundry's Hook system extensively:
- `Hooks.once('init')` - Register settings before game loads
- `Hooks.on('ready')` - Initialize UI after everything loads
- `Hooks.on('renderChatLog')` - Inject custom toolbar into chat
- `Hooks.on('createChatMessage')` - React to new messages
- `Hooks.on('updateSetting')` - Respond to setting changes

#### Settings System
Two types of settings:
- **Client-side** (`scope: "client"`): Personal preferences (opacity, colors, debug mode)
- **World-level** (`scope: "world"`): GM-controlled (hide buttons, dice ranges)

Settings use `onChange` callbacks for immediate UI updates. Some require reload dialogs for complex changes.

#### Static Class Pattern
`RecentMessageDisplay` is a static class with methods:
- `init()` - Initialize message display system
- `addMessageToHistory(messageId)` - Track new messages
- `updateRecentMessage(messageId)` - Display specific message
- `navigateMessages(direction)` - Navigate through last 50 messages
- `validateMessageIds()` - Clean up deleted message IDs

### Core Features Implementation

#### Conditional UI Display
Uses MutationObserver to watch sidebar collapse state:
```javascript
const observer = new MutationObserver(() => updateVisibility());
observer.observe(document.getElementById('sidebar'), {
    attributes: true,
    attributeFilter: ['class']
});
```

#### Dice Rolling
- Click to add dice, right-click to remove
- Builds roll formula (e.g., "2d20kh + 3" for advantage)
- Creates `new Roll(formula).evaluate()`
- Integrates with Dice So Nice if available
- Results color-coded based on configurable ranges per die type

#### Message Display
- Shows most recent chat message in compact view
- Fade-out effects with configurable timing/opacity
- Hover restores full opacity
- Navigation through message history
- Message validation handles deleted messages

#### Navigation Button Hiding
- Dynamically hide sidebar tabs based on settings
- "Apply only to Players" option for GM
- "Hide Always" hides even when sidebar expanded
- Creates dynamic settings for new tabs from other modules

### Data Flow Examples

**Settings Change Flow:**
```
game.settings.set()
  → onChange callback
  → Immediate UI update OR reload dialog
```

**Dice Roll Flow:**
```
User clicks "Roll!"
  → Build formula from selected dice/modifiers
  → new Roll(formula).evaluate()
  → Dice So Nice animation (if available)
  → Render templates/common-roll.hbs
  → ChatMessage.create() with roll data
```

**Message Creation Flow:**
```
ChatMessage.create()
  → Hook: 'createChatMessage'
  → RecentMessageDisplay.addMessageToHistory()
  → RecentMessageDisplay.updateRecentMessage()
  → DOM updated + fade timer started
  → playPingSound() if enabled
```

## File Structure

```
sleek-chat/
├── scripts/
│   ├── main.js                    # Main logic: dice rolling, UI visibility, nav hiding
│   ├── settings.js                # All game.settings.register() calls
│   ├── recent-message-display.js  # Message history management
│   └── sleek-chat-debug.js        # debugLog() utility
├── styles/
│   └── styles.css                 # All styles (no preprocessing!)
├── templates/
│   ├── dice-toolbar.hbs           # Main UI toolbar
│   ├── common-roll.hbs            # Dice roll result display
│   └── custom-chat-card.hbs       # Custom chat card
├── ui/                             # SVG dice icons and sound file
├── module.json                     # Foundry module manifest
└── sleek-chat.zip                  # Distribution package
```

## Key Functions and Exports

### scripts/main.js
- `applyChatBaseContainerOpacity()` - Set container opacity with hover effects
- `applySeeOnlyChat(seeOnlyChat)` - Toggle chat-only mode (hide dice)
- `applyNavButtonHiding()` - Show/hide navigation buttons
- `applyDiceColorFilter(colorName)` - Apply CSS filter for dice colors
- `parseDiceRanges()` - Parse fumble/normal/critical ranges from settings

### scripts/recent-message-display.js
- `RecentMessageDisplay.init()` - Initialize on ready
- `RecentMessageDisplay.addMessageToHistory(messageId)` - Track new message
- `RecentMessageDisplay.updateRecentMessage(messageId)` - Display message
- `RecentMessageDisplay.navigateMessages(direction)` - Navigate history
- `RecentMessageDisplay.validateMessageIds()` - Clean deleted messages
- `applyMessageFadeOutSettings()` - Apply fade settings

### scripts/sleek-chat-debug.js
- `debugLog(...args)` - Conditional console.log based on debug mode setting

## Important Implementation Notes

### Templates
- Use `renderTemplate('modules/sleek-chat/templates/file.hbs', data)`
- Template data objects must match Handlebars variable names
- Templates are loaded via `foundry.applications.handlebars.loadTemplates()` in ready hook

### CSS
- Single file: `styles/styles.css`
- Uses CSS custom properties: `--dice-filter` for color changes
- Applied via module.json, no manual loading needed
- Auto-loaded by Foundry, no build step

### DOM Manipulation
- Heavy use of jQuery for animations: `$().fadeTo()`, `$().addClass()`
- Direct DOM queries: `document.querySelector()`, `document.querySelectorAll()`
- Event delegation for dynamic content

### Foundry API Integration
- `game.settings.get/set()` - All configuration
- `game.user.isGM` - Permission checks
- `game.messages` - Message history access
- `ChatMessage.create()` - Create chat messages
- `Roll` - Dice rolling engine
- `ui.sidebar` - Sidebar state

### Version Management
- Current version: 1.4.1
- Update version in module.json when releasing
- Update CHANGELOG.md with changes
- Recreate sleek-chat.zip with updated files
- Commit and push to GitHub main branch

## Common Patterns

### Adding a New Setting
1. Register in `scripts/settings.js` within `Hooks.once('init')`
2. Use appropriate scope: `"client"` or `"world"`
3. Add `onChange` callback for immediate updates if needed
4. Import and call update functions from main.js if needed

### Adding a New Die Type
1. Add SVG icons to `ui/` folder (normal and filled versions)
2. Update `templates/dice-toolbar.hbs` with new die button
3. Add setting in `scripts/settings.js` for result ranges
4. Update `parseDiceRanges()` in `scripts/main.js`

### Modifying UI Templates
1. Edit the .hbs file in `templates/`
2. Ensure data object passed to `renderTemplate()` has matching properties
3. Refresh Foundry to see changes
4. No compilation needed

## Integration Points

### With Foundry Core
- Settings API for all configuration persistence
- Hook system for event-driven architecture
- ChatMessage API for message creation
- Roll API for dice mechanics
- Sidebar API for UI state

### With Other Modules
- **Dice So Nice**: Optional 3D dice visualization integration
- **Dynamic sidebar modules**: Auto-creates hide settings for new navigation tabs
- Extensible for system-specific chat buttons

## Debugging

- Enable "Debug Mode" in module settings
- All debug output uses `debugLog()` function
- Check browser console for log messages
- Debug messages indicate: settings changes, opacity adjustments, message navigation, button visibility logic

## Known Limitations

- Some game systems with custom chat buttons may have interaction issues
- Users should report issues at: https://github.com/mordachai/sleek-chat/issues
