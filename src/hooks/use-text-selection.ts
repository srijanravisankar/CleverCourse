"use client";

import { useEffect, useCallback } from "react";
import { useChatStore } from "@/store/use-chat-store";

export function useTextSelection() {
  const { setHighlightedContent, openChat } = useChatStore();

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      // Only set if text is substantial (more than 3 characters)
      if (selectedText.length > 3) {
        setHighlightedContent(selectedText);
      }
    }
  }, [setHighlightedContent]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Cmd+Shift+C (Mac) or Ctrl+Shift+C (Windows/Linux) to ask AI about selection
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
        e.preventDefault();
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 3) {
          setHighlightedContent(selectedText);
          openChat();
        }
      }
    },
    [setHighlightedContent, openChat],
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSelection, handleKeyDown]);
}
