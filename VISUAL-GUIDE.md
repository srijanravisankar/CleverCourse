# 🎨 AI Chat Panel - Visual Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Your App                             │
│                                                             │
│  ┌────────────────────────┐                                │
│  │  Main Content Area     │         ┌─────────────────┐   │
│  │                        │         │  AI Assistant   │   │
│  │  - Courses             │         │  ┌───────────┐  │   │
│  │  - Articles            │         │  │  Header   │  │   │
│  │  - Study Materials     │         │  │  • Clear  │  │   │
│  │                        │         │  │  • Close  │  │   │
│  │  Select this text! ───────────►  │  └───────────┘  │   │
│  │  [Ask AI popup appears]│         │                 │   │
│  │                        │         │  ┌───────────┐  │   │
│  │                        │         │  │ Messages  │  │   │
│  │                        │         │  │ (scroll)  │  │   │
│  └────────────────────────┘         │  └───────────┘  │   │
│                                     │                 │   │
│                                     │  [Context]      │   │
│                           ┌──┐     │  ┌───────────┐  │   │
│                           │🤖│◄────│  │ Input     │  │   │
│                           └──┘     │  │ [Send]    │  │   │
│                       Floating     │  └───────────┘  │   │
│                        Button      └─────────────────┘   │
│                                         400px wide       │
└─────────────────────────────────────────────────────────────┘
```

## Components Breakdown

### 1. Chat Panel (Right Side)

```
┌─────────────────────┐
│ ✨ AI Assistant  🗑️❌│  ← Header
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │ User Message    │ │  ← User bubble
│ │ 2:30 PM         │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ AI Response     │ │  ← Assistant bubble
│ │ 2:30 PM         │ │
│ └─────────────────┘ │
│                     │
│   [Auto-scrolls]    │
│                     │
├─────────────────────┤
│ [Context Badge]  ❌ │  ← Context display
├─────────────────────┤
│ [Type here...] [📤] │  ← Input area
│ Press Enter to send │
└─────────────────────┘
```

### 2. Floating Button

```
         ┌──────┐
         │      │
         │  💬  │  ← Click to open
         │  3   │  ← Unread badge
         └──────┘
    Bottom-right corner
```

### 3. Selection Popover

```
    Select some text here
    ─────────────────────
           ↓
      ┌─────────┐
      │ ✨ Ask AI│  ← Popup appears
      └─────────┘
```

## User Flow Diagram

```
Start
  │
  ├─► Method 1: Click Floating Button
  │   └─► Chat Panel Opens (empty)
  │       └─► Type question → Get response
  │
  ├─► Method 2: Select Text + Popover
  │   └─► Highlight text
  │       └─► Click "Ask AI"
  │           └─► Chat opens with context
  │               └─► Type question → Get response
  │
  └─► Method 3: Keyboard Shortcut
      └─► Highlight text
          └─► Press Cmd+Shift+C
              └─► Chat opens with context
                  └─► Type question → Get response

Continue conversation...
  │
  ├─► Add more messages
  │   └─► Context maintained
  │
  ├─► Clear chat (trash icon)
  │   └─► Start fresh
  │
  └─► Close (X or button)
      └─► Chat closes (state saved)
```

## Message Types

### User Message (Right-aligned, Primary Color)

```
                    ┌────────────────┐
        [Context]   │ Can you help   │
        ────────    │ me understand  │
                    │ this?          │
                    │ 2:30 PM        │
                    └────────────────┘
```

### Assistant Message (Left-aligned, Muted)

```
┌────────────────────┐
│ Sure! Let me       │
│ explain...         │
│                    │
│ 2:30 PM            │
└────────────────────┘
```

### Loading State

```
┌─────────────┐
│ • • •       │
│ Thinking... │
└─────────────┘
```

## States & Interactions

### Panel States

1. **Closed** (Default)
   - Only floating button visible
   - Badge shows unread count

2. **Opening** (Animation)
   - Slides in from right
   - Smooth transition

3. **Open - Empty**
   - Welcome message
   - Instructions displayed
   - Input ready

4. **Open - Active**
   - Messages displayed
   - Scrollable area
   - Input active

5. **Loading**
   - Animated dots
   - "Thinking..." message
   - Input disabled

### Button States

1. **Default** (Blue button, no badge)
2. **Has Messages** (Badge with count)
3. **Hover** (Scale up animation)
4. **Hidden** (When panel is open)

### Popover States

1. **Hidden** (Default, no selection)
2. **Visible** (Text selected > 3 chars)
3. **Hover** (Highlighted "Ask AI")

## Keyboard Shortcuts

```
┌─────────────────────┬──────────────────────┐
│ Action              │ Shortcut             │
├─────────────────────┼──────────────────────┤
│ Send message        │ Enter                │
│ New line            │ Shift + Enter        │
│ Ask about selection │ Cmd/Ctrl + Shift + C │
│ (Potential) Close   │ Esc                  │
└─────────────────────┴──────────────────────┘
```

## Color Scheme

### User Message

- Background: `bg-primary`
- Text: `text-primary-foreground`
- Timestamp: `opacity-70`

### Assistant Message

- Background: `bg-muted`
- Text: `text-foreground`
- Timestamp: `text-muted-foreground`

### Context Badge

- Background: `bg-muted/50`
- Border: `border-dashed`
- Icon: `text-muted-foreground`

### Floating Button

- Background: `bg-primary`
- Shadow: `shadow-lg`
- Badge: `bg-destructive`

## Responsive Behavior

### Desktop (>768px)

```
┌────────────────────────────┐
│ Content      │   Chat      │
│              │   Panel     │
│   Wide       │   400px     │
└────────────────────────────┘
```

### Mobile (<768px)

```
┌──────────────┐
│   Content    │  ← Full screen
│              │
│  [Button]    │
└──────────────┘

When opened:
┌──────────────┐
│   Chat       │  ← Overlay
│   Full       │
│   Width      │
└──────────────┘
```

## Animation Timings

- **Panel Slide-in**: `300ms ease-out`
- **Button Hover**: `200ms`
- **Button Scale**: `scale-110`
- **Popover Fade**: `150ms`
- **Loading Dots**: `bounce` animation
- **Auto-scroll**: `smooth` behavior

## Accessibility Features

### Keyboard Navigation

- Tab through all interactive elements
- Enter to send, Escape to close
- Focus visible on all buttons

### Screen Readers

- Semantic HTML elements
- ARIA labels on icons
- Role attributes for chat messages
- Alt text for all images/icons

### Color Contrast

- WCAG AA compliant
- Dark mode support
- High contrast mode compatible

## Integration Points

```
layout.tsx (Root)
    │
    ├─► ChatPanel (Main UI)
    │   ├─► useChatStore (State)
    │   └─► sendChatMessage (API)
    │
    ├─► ChatTrigger (Button)
    │   └─► useChatStore (State)
    │
    └─► SelectionPopover (Popup)
        ├─► useTextSelection (Hook)
        └─► useChatStore (State)

All Pages Automatically Include:
✓ Chat functionality
✓ Text selection
✓ Floating button
```

## Data Flow

```
User Action
    ↓
┌──────────────┐
│ UI Component │
└──────┬───────┘
       ↓
┌──────────────┐
│ Chat Store   │ (Zustand)
└──────┬───────┘
       ↓
┌──────────────┐
│ Chat API     │ (Server Action)
└──────┬───────┘
       ↓
┌──────────────┐
│ Gemini AI    │
└──────┬───────┘
       ↓
┌──────────────┐
│ Response     │
└──────┬───────┘
       ↓
┌──────────────┐
│ Chat Store   │
└──────┬───────┘
       ↓
┌──────────────┐
│ UI Update    │
└──────────────┘
```

## Quick Reference Card

```
╔═══════════════════════════════════════════════╗
║        AI Chat Panel - Quick Reference        ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  🎯 Opening Chat:                            ║
║    • Click floating button (bottom-right)    ║
║    • Select text → Click "Ask AI"            ║
║    • Cmd/Ctrl+Shift+C with selected text    ║
║                                               ║
║  💬 Sending Messages:                        ║
║    • Type in input field                     ║
║    • Press Enter to send                     ║
║    • Shift+Enter for new line                ║
║                                               ║
║  🔍 Using Context:                           ║
║    • Highlight any text on page              ║
║    • Opens chat with context badge           ║
║    • Ask questions about the text            ║
║                                               ║
║  🗑️  Managing Chat:                          ║
║    • Trash icon: Clear all messages          ║
║    • X icon: Close panel                     ║
║    • Click button again: Toggle              ║
║                                               ║
║  ⚙️  Setup Required:                         ║
║    • Add GEMINI_API_KEY to .env.local        ║
║    • Get key from: ai.google.dev             ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

**Ready to use!** Just start the dev server and try it out! 🚀
