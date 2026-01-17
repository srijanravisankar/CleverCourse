import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  context?: string; // Highlighted content from the page
  timestamp: Date;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  highlightedContent: string | null;

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setHighlightedContent: (content: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  highlightedContent: null,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    })),

  setHighlightedContent: (content) => set({ highlightedContent: content }),

  clearMessages: () => set({ messages: [] }),
}));
