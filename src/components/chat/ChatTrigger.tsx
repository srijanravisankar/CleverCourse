"use client";

import { useChatStore } from "@/store/use-chat-store";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChatTrigger() {
  const { isOpen, toggleChat, messages } = useChatStore();
  const unreadCount = messages.filter((m) => m.role === "assistant").length;

  if (isOpen) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleChat}
            size="lg"
            className={cn(
              "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40",
              "hover:scale-110 transition-transform duration-200",
              unreadCount > 0 && "animate-pulse",
            )}
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Ask AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
