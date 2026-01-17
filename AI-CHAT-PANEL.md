# AI Chat Side Panel Feature

## Overview

A fully integrated AI-powered chat assistant that slides in from the right side of the screen, similar to VS Code's Copilot chat. The chat panel can accept highlighted content from any page and allows users to ask questions about their courses and content.

## Features Implemented

### 1. **Chat Panel (`ChatPanel.tsx`)**

- **Location**: Fixed right side panel (400px wide)
- **UI Components**:
  - Header with AI Assistant title and controls (clear chat, close)
  - Scrollable message area with user/assistant messages
  - Context badges showing highlighted content
  - Input field with send button
  - Loading indicator with animated dots
  - Empty state with helpful instructions
- **Functionality**:
  - Send/receive messages with Gemini AI
  - Display conversation history
  - Show context from highlighted text
  - Auto-scroll to latest message
  - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
  - Clear conversation history

### 2. **Floating Chat Trigger (`ChatTrigger.tsx`)**

- **Location**: Fixed bottom-right corner
- **UI Components**:
  - Circular floating action button
  - Message icon with unread count badge
  - Tooltip on hover
  - Pulse animation when messages are present
- **Functionality**:
  - Toggle chat panel open/closed
  - Show notification badge for new assistant messages
  - Hover tooltip: "Ask AI Assistant"
  - Scale animation on hover

### 3. **Text Selection Popover (`SelectionPopover.tsx`)**

- **Location**: Appears above selected text
- **UI Components**:
  - Small card with "Ask AI" button
  - Sparkles icon for AI indication
  - Backdrop blur effect
- **Functionality**:
  - Appears when user selects text (>3 characters)
  - Click to send selection to chat
  - Auto-opens chat panel with context
  - Dismisses on click outside

### 4. **Text Selection Hook (`use-text-selection.ts`)**

- **Functionality**:
  - Detects text selection on page
  - Keyboard shortcut: `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows/Linux)
  - Automatically captures highlighted content
  - Opens chat panel with context

### 5. **Chat Store (`use-chat-store.tsx`)**

- **State Management** (Zustand):
  - `isOpen`: Chat panel visibility
  - `messages`: Conversation history with IDs, roles, content, context, timestamps
  - `highlightedContent`: Currently selected text
- **Actions**:
  - `toggleChat()`: Toggle panel visibility
  - `openChat()`: Open panel
  - `closeChat()`: Close panel
  - `addMessage()`: Add message to history
  - `setHighlightedContent()`: Set selected text
  - `clearMessages()`: Clear conversation

### 6. **Chat API (`chat-api.ts`)**

- **Server Actions**:
  - `sendChatMessage()`: Send message to Gemini AI
  - `streamChatMessage()`: Stream responses (for future use)
- **Features**:
  - Context-aware responses
  - Conversation history support
  - Error handling
  - Type-safe interfaces

## User Interactions

### Opening the Chat Panel

1. **Floating Button**: Click the circular button in bottom-right corner
2. **Keyboard Shortcut**: Press `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows/Linux) after selecting text
3. **Selection Popover**: Highlight text, then click "Ask AI" button

### Sending Messages

1. Type message in input field
2. Press Enter to send (Shift+Enter for new line)
3. Or click the send button

### Using Context from Page

1. **Method 1 - Popover**:
   - Select text on the page
   - Click "Ask AI" button in popover
   - Chat opens with context pre-filled

2. **Method 2 - Keyboard Shortcut**:
   - Select text on the page
   - Press `Cmd+Shift+C` or `Ctrl+Shift+C`
   - Chat opens with context captured

3. **Method 3 - Manual Selection**:
   - Select text on the page (auto-captured)
   - Open chat manually
   - Context appears as badge at bottom
   - Type question and send

### Managing Conversation

- **Clear Chat**: Click trash icon in header
- **Close Panel**: Click X icon in header or click floating button again
- **Scroll Messages**: Scroll in message area (auto-scrolls to latest)

## Technical Implementation

### File Structure

```
src/
├── components/
│   └── chat/
│       ├── ChatPanel.tsx          # Main chat interface
│       ├── ChatTrigger.tsx        # Floating action button
│       └── SelectionPopover.tsx   # Text selection popup
├── hooks/
│   └── use-text-selection.ts      # Selection detection hook
├── store/
│   └── use-chat-store.tsx         # Zustand state management
├── lib/
│   └── chat-api.ts                # Gemini API integration
└── app/
    └── layout.tsx                 # Global integration
```

### State Management

**Zustand Store** (`use-chat-store.tsx`):

- Global state accessible from any component
- Persists conversation during session
- Type-safe with TypeScript interfaces

### API Integration

**Gemini AI** (`chat-api.ts`):

- Server-side API calls for security
- Context-aware prompts
- Conversation history support
- Error handling and fallbacks

### Styling

- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Consistent component design
- **Animations**: Smooth transitions and loading states
- **Responsive**: Adapts to different screen sizes
- **Dark Mode**: Full theme support

## Component Props & APIs

### ChatPanel

```typescript
// No props - uses global store
// State from: useChatStore()
```

### ChatTrigger

```typescript
// No props - uses global store
// State from: useChatStore()
```

### SelectionPopover

```typescript
// No props - manages internal state
// Uses: useTextSelection() hook
```

### useChatStore

```typescript
interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  highlightedContent: string | null;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setHighlightedContent: (content: string | null) => void;
  clearMessages: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  context?: string;
  timestamp: Date;
}
```

### sendChatMessage

```typescript
interface ChatRequest {
  message: string;
  context?: string;
  conversationHistory?: Array<{ role: "user" | "model"; parts: string }>;
}

interface ChatResponse {
  response: string;
  error?: string;
}

async function sendChatMessage(request: ChatRequest): Promise<ChatResponse>;
```

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Customization

**Panel Width** (ChatPanel.tsx):

```typescript
className = "... w-100 ..."; // Change w-100 to desired width
```

**Position** (ChatTrigger.tsx):

```typescript
className = "... bottom-6 right-6 ..."; // Adjust position
```

**Selection Threshold** (use-text-selection.ts):

```typescript
if (selectedText.length > 3) { // Change minimum characters
```

**Keyboard Shortcut** (use-text-selection.ts):

```typescript
if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
  // Change key combination
```

## Future Enhancements

### Potential Features

1. **Streaming Responses**: Use `streamChatMessage()` for real-time responses
2. **Message Reactions**: Like/dislike responses for feedback
3. **Message Editing**: Edit previous messages
4. **Code Syntax Highlighting**: Better display for code in messages
5. **File Attachments**: Upload files for context
6. **Voice Input**: Speech-to-text for messages
7. **Conversation Export**: Save conversations as PDF/Markdown
8. **Custom Prompts**: Pre-defined question templates
9. **Multi-language Support**: Internationalization
10. **Conversation Persistence**: Save to database for cross-session

### Streaming Implementation Example

```typescript
// In ChatPanel.tsx
const handleStreamingMessage = async () => {
  const stream = streamChatMessage({ message: input, context });
  let fullResponse = "";

  for await (const chunk of stream) {
    fullResponse += chunk;
    // Update message in real-time
  }
};
```

## Troubleshooting

### Chat panel not appearing

- Check that components are imported in `layout.tsx`
- Verify Zustand store is properly initialized
- Check browser console for errors

### Selection not working

- Ensure `useTextSelection()` hook is called
- Check that minimum character threshold is met (>3 chars)
- Verify event listeners are attached

### Gemini API errors

- Confirm `GEMINI_API_KEY` is set in `.env.local`
- Check API key validity at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Review error messages in server console
- Verify network connectivity

### Styling issues

- Ensure Tailwind CSS is properly configured
- Check that shadcn/ui components are installed
- Verify dark mode theme provider is set up

## Keyboard Shortcuts

| Shortcut               | Action                          |
| ---------------------- | ------------------------------- |
| `Enter`                | Send message                    |
| `Shift + Enter`        | New line in message             |
| `Cmd/Ctrl + Shift + C` | Ask AI about selected text      |
| `Esc`                  | Close chat panel (can be added) |

## Performance Considerations

- **Debouncing**: Text selection uses debouncing to avoid excessive updates
- **Lazy Loading**: Components only render when needed
- **Message Batching**: Messages are batched for efficient rendering
- **Auto-scroll Optimization**: Uses `scrollIntoView` with smooth behavior
- **Memory Management**: Old messages can be cleared to free memory

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Management**: Proper focus trapping in panel
- **Color Contrast**: WCAG AA compliant colors
- **Touch Targets**: Minimum 44x44px touch areas

## Testing Recommendations

### Manual Testing

1. Open/close chat panel
2. Send messages with and without context
3. Select text and use popover
4. Test keyboard shortcuts
5. Clear conversation history
6. Test on mobile/tablet
7. Test in light/dark mode

### Unit Testing

```typescript
// Example test for useChatStore
import { renderHook, act } from "@testing-library/react";
import { useChatStore } from "@/store/use-chat-store";

test("should toggle chat panel", () => {
  const { result } = renderHook(() => useChatStore());

  act(() => {
    result.current.toggleChat();
  });

  expect(result.current.isOpen).toBe(true);
});
```

## Integration Examples

### Programmatic Chat Opening

```typescript
import { useChatStore } from "@/store/use-chat-store";

function MyComponent() {
  const { openChat, setHighlightedContent } = useChatStore();

  const handleAskQuestion = () => {
    setHighlightedContent("Custom context here");
    openChat();
  };

  return <button onClick={handleAskQuestion}>Ask AI</button>;
}
```

### Custom Message Formatting

````typescript
// In ChatPanel.tsx, modify message rendering
{message.content.includes("```") ? (
  <CodeBlock code={extractCode(message.content)} />
) : (
  <div className="text-sm whitespace-pre-wrap">
    {message.content}
  </div>
)}
````

## Credits

- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)
- **AI Provider**: [Google Gemini](https://ai.google.dev)
- **Icons**: [Lucide Icons](https://lucide.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

## License

This feature is part of CleverCourse and follows the project's license.
