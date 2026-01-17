"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore, ChatMessage } from "@/store/use-chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Send, Sparkles, Trash2, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/chat-api";

export function ChatPanel() {
  const {
    isOpen,
    messages,
    highlightedContent,
    closeChat,
    addMessage,
    setHighlightedContent,
    clearMessages,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus on highlighted content when it changes
  useEffect(() => {
    if (highlightedContent && isOpen) {
      setInput(
        `Can you help me understand: "${highlightedContent.slice(0, 50)}${highlightedContent.length > 50 ? "..." : ""}"`,
      );
    }
  }, [highlightedContent, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Omit<ChatMessage, "id" | "timestamp"> = {
      role: "user",
      content: input,
      context: highlightedContent || undefined,
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      // Call Gemini API
      const result = await sendChatMessage({
        message: input,
        context: highlightedContent || undefined,
        conversationHistory: messages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: msg.content,
        })),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const aiResponse: Omit<ChatMessage, "id" | "timestamp"> = {
        role: "assistant",
        content: result.response,
      };

      addMessage(aiResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setHighlightedContent(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-100 bg-background border-l shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={closeChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
            <p className="text-sm">
              Ask me anything about your courses, or highlight text on the page
              and I'll help you understand it better.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-2",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                {message.context && message.role === "user" && (
                  <Card className="p-2 bg-muted/50 max-w-[90%] border-dashed">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium mb-1">Context:</div>
                        <div className="italic line-clamp-2">
                          {message.context}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                <Card
                  className={cn(
                    "p-3 max-w-[85%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div
                    className={cn(
                      "text-xs mt-2 opacity-70",
                      message.role === "user"
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <Card className="p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Highlighted Content Badge */}
      {highlightedContent && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="shrink-0">
              Context
            </Badge>
            <div className="flex-1 text-xs text-muted-foreground line-clamp-2">
              {highlightedContent}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setHighlightedContent(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
