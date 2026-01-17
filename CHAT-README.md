# 🤖 AI Chat Assistant - README

## What is this?

An **AI-powered chat side panel** that works just like **VS Code's GitHub Copilot chat**. It slides in from the right, accepts highlighted content from your page, and lets you ask questions about anything in your course.

## ✨ Key Features

- 💬 **Chat with AI**: Ask questions and get instant Gemini-powered responses
- 🖱️ **Select & Ask**: Highlight text anywhere, click "Ask AI", and get context-aware answers
- ⌨️ **Keyboard Shortcut**: `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows/Linux)
- 🎯 **Always Available**: Floating button on every page
- 📝 **Context Aware**: AI remembers your conversation and the text you highlighted
- 🎨 **Beautiful UI**: Modern, smooth animations, dark mode support

## 🚀 Quick Start

### 1. Setup

Add your Gemini API key to `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
```

Get your key from: https://makersuite.google.com/app/apikey

### 2. Start the App

```bash
pnpm dev
```

### 3. Try It Out!

1. Look for the **blue circular button** in the bottom-right corner
2. **Select some text** on the page
3. Click **"Ask AI"** in the popup that appears
4. Type a question and press **Enter**
5. Get an AI-powered response! 🎉

## 📖 How to Use

### Method 1: Floating Button

- Click the button in the bottom-right corner
- Chat panel slides in from the right
- Type your question and press Enter

### Method 2: Text Selection + Popup

1. Highlight any text on the page
2. "Ask AI" popup appears above the text
3. Click it → chat opens with your selection as context
4. Ask questions about the highlighted text

### Method 3: Keyboard Shortcut

1. Highlight text on the page
2. Press `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows/Linux)
3. Chat opens instantly with context
4. Type your question

## 🎮 Controls

| Action              | How                          |
| ------------------- | ---------------------------- |
| Open chat           | Click floating button        |
| Close chat          | Click X icon or button again |
| Send message        | Press `Enter`                |
| New line            | Press `Shift + Enter`        |
| Clear history       | Click trash icon 🗑️          |
| Ask about selection | `Cmd/Ctrl + Shift + C`       |

## 📁 What Was Added

### New Components

```
src/components/chat/
├── ChatPanel.tsx          # Main chat interface
├── ChatTrigger.tsx        # Floating button
└── SelectionPopover.tsx   # "Ask AI" popup
```

### New Hooks

```
src/hooks/
└── use-text-selection.ts  # Detects text selection
```

### New Store

```
src/store/
└── use-chat-store.tsx     # Chat state management
```

### New API

```
src/lib/
└── chat-api.ts            # Gemini AI integration
```

### Documentation

```
AI-CHAT-PANEL.md         # Complete technical docs
CHAT-QUICKSTART.md       # Quick start guide
IMPLEMENTATION-SUMMARY.md # Implementation details
VISUAL-GUIDE.md          # Visual diagrams
```

## 🎨 Customization

### Change Panel Width

In `ChatPanel.tsx`:

```typescript
className = "w-100"; // Change to w-[500px] for 500px width
```

### Change Button Position

In `ChatTrigger.tsx`:

```typescript
className = "bottom-6 right-6"; // Adjust bottom and right values
```

### Change Keyboard Shortcut

In `use-text-selection.ts`:

```typescript
if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
  // Change "c" to any other key
}
```

## 🔧 Technical Details

- **Framework**: Next.js 14+ (App Router)
- **State Management**: Zustand
- **AI Provider**: Google Gemini Pro
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide Icons

## 🎯 Use Cases

1. **Understanding Course Content**
   - Highlight confusing text
   - Ask "Can you explain this in simpler terms?"

2. **Quick Definitions**
   - Select a term
   - Ask "What does this mean?"

3. **Course Questions**
   - Ask "What should I study next?"
   - Ask "How is this topic related to...?"

4. **Study Help**
   - Ask "Can you create a quiz on this topic?"
   - Ask "What are the key points?"

## 🐛 Troubleshooting

### Chat button not visible

- Check that the app is running (`pnpm dev`)
- Look in the bottom-right corner
- Check browser console for errors

### "Ask AI" popup not appearing

- Select more than 3 characters
- Wait a moment after selection
- Check that JavaScript is enabled

### No AI responses

- Verify `GEMINI_API_KEY` is set in `.env.local`
- Check your API key is valid
- Look for errors in the terminal/console
- Ensure you have internet connection

### Selection not captured

- Try selecting text again
- Use `Cmd/Ctrl+Shift+C` shortcut
- Click the floating button manually

## 📚 Documentation

- **Full Documentation**: [AI-CHAT-PANEL.md](./AI-CHAT-PANEL.md)
- **Quick Start**: [CHAT-QUICKSTART.md](./CHAT-QUICKSTART.md)
- **Implementation**: [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)
- **Visual Guide**: [VISUAL-GUIDE.md](./VISUAL-GUIDE.md)

## 🚀 Future Improvements

- [ ] Streaming responses (real-time)
- [ ] Message persistence (save across sessions)
- [ ] Code syntax highlighting
- [ ] Voice input
- [ ] File attachments
- [ ] Conversation export (PDF/Markdown)
- [ ] Custom prompt templates
- [ ] Multi-language support

## 💡 Tips

1. **Be specific**: Ask clear, focused questions for better responses
2. **Use context**: Highlight relevant text before asking
3. **Follow up**: Continue the conversation for deeper understanding
4. **Clear when done**: Use the trash icon to start fresh
5. **Keyboard shortcuts**: Faster than clicking!

## 🎉 Success!

You now have a **fully functional AI chat assistant** integrated into your app! It works just like VS Code's Copilot chat:

- ✅ Slides in from the right
- ✅ Accepts highlighted content
- ✅ AI-powered responses
- ✅ Available on every page
- ✅ Beautiful, modern UI

**Try it now!** Select this text and press `Cmd/Ctrl+Shift+C`! 🚀

---

Need help? Check the [full documentation](./AI-CHAT-PANEL.md) or review the [visual guide](./VISUAL-GUIDE.md).
