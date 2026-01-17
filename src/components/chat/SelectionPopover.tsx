"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/store/use-chat-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useTextSelection } from "@/hooks/use-text-selection";

export function SelectionPopover() {
  useTextSelection();
  const { setHighlightedContent, openChat } = useChatStore();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 3) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setSelectedText(text);
        }
      } else {
        setPosition(null);
        setSelectedText("");
      }
    };

    const handleClickOutside = () => {
      setPosition(null);
      setSelectedText("");
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAskAI = () => {
    setHighlightedContent(selectedText);
    openChat();
    setPosition(null);
  };

  if (!position) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      }}
    >
      <Card className="p-1 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <Button
          onClick={handleAskAI}
          size="sm"
          variant="ghost"
          className="gap-2 hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Button>
      </Card>
    </div>
  );
}
