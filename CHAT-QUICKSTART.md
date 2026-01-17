# AI Chat Panel - Quick Start Guide

## What You Get

A **VS Code Copilot-style chat panel** that:

- ✅ Slides in from the right side
- ✅ Accepts highlighted text from any page
- ✅ Integrates with Gemini AI
- ✅ Works on every page automatically
- ✅ Supports keyboard shortcuts
- ✅ Shows conversation history
- ✅ Has a floating trigger button

## How to Use

### 3 Ways to Start a Chat

#### 1. Click the Floating Button

- Look for the circular button in the **bottom-right corner**
- Click to open/close the chat panel

#### 2. Highlight Text + Popover

- Select any text on the page (more than 3 characters)
- Click the **"Ask AI"** button that appears above the text
- Chat opens with your selection as context

#### 3. Keyboard Shortcut

- Select text on the page
- Press **`Cmd+Shift+C`** (Mac) or **`Ctrl+Shift+C`** (Windows/Linux)
- Chat opens instantly with context

## Quick Tips

- **Send Message**: Press `Enter`
- **New Line**: Press `Shift+Enter`
- **Clear Chat**: Click the trash icon in the header
- **Close Panel**: Click the X icon or the floating button

## Setup (Required)

Add your Gemini API key to `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
```

Get your key from: https://makersuite.google.com/app/apikey

## Files Added

```
src/
├── components/chat/
│   ├── ChatPanel.tsx          ← Main chat UI
│   ├── ChatTrigger.tsx        ← Floating button
│   └── SelectionPopover.tsx   ← "Ask AI" popup
├── hooks/
│   └── use-text-selection.ts  ← Selection detection
├── store/
│   └── use-chat-store.tsx     ← State management
└── lib/
    └── chat-api.ts            ← Gemini integration
```

## Customization

### Change Panel Width

In `ChatPanel.tsx`:

```typescript
className = "... w-100 ..."; // Change to w-[500px] for 500px width
```

### Change Button Position

In `ChatTrigger.tsx`:

```typescript
className = "... bottom-6 right-6 ..."; // Adjust values
```

### Change Keyboard Shortcut

In `use-text-selection.ts`:

```typescript
if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
  // Change "c" to any other key
```

## Demo Flow

1. **Open the app** → See floating button in bottom-right
2. **Select some text** → "Ask AI" popup appears
3. **Click "Ask AI"** → Chat panel slides in from right
4. **Type a question** → Get AI response
5. **Continue conversation** → Full context maintained
6. **Close when done** → Click X or floating button

## That's It! 🎉

The chat panel is now available on every page in your app. Just highlight text and ask questions!

For more details, see [AI-CHAT-PANEL.md](./AI-CHAT-PANEL.md)
