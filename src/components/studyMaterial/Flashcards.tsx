"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Zap,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Flashcard {
  id?: string;
  front: string;
  back: string;
}

interface FlashcardsProps {
  cards: Flashcard[];
  onFlashcardReviewed?: (cardId: string) => void;
  onAllCardsCompleted?: () => void;
}

export function Flashcards({
  cards,
  onFlashcardReviewed,
  onAllCardsCompleted,
}: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [reviewedCards, setReviewedCards] = React.useState<Set<number>>(
    new Set(),
  );
  const [showXpBadge, setShowXpBadge] = React.useState(false);
  const [allCompleted, setAllCompleted] = React.useState(false);

  const isCurrentReviewed = reviewedCards.has(currentIndex);
  const reviewedCount = reviewedCards.size;
  const totalCards = cards.length;
  const progressPercentage = (reviewedCount / totalCards) * 100;

  // Check if all cards are completed
  React.useEffect(() => {
    if (reviewedCount === totalCards && totalCards > 0 && !allCompleted) {
      setAllCompleted(true);
      // Fire confetti for completing all flashcards!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#4ECDC4", "#45B7D1"],
      });
      onAllCardsCompleted?.();
    }
  }, [reviewedCount, totalCards, allCompleted, onAllCardsCompleted]);

  const handleMarkReviewed = () => {
    if (!isCurrentReviewed) {
      setReviewedCards((prev) => new Set([...prev, currentIndex]));
      setShowXpBadge(true);
      setTimeout(() => setShowXpBadge(false), 1500);

      // Call callback with card ID or index
      const cardId = cards[currentIndex].id || String(currentIndex);
      onFlashcardReviewed?.(cardId);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  if (allCompleted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="p-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full"
        >
          <Trophy className="size-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-center">
          All Flashcards Reviewed! 🎉
        </h2>
        <p className="text-muted-foreground text-center">
          You've mastered all {totalCards} cards in this section.
        </p>
        <Button
          onClick={() => {
            setReviewedCards(new Set());
            setAllCompleted(false);
            setCurrentIndex(0);
          }}
          variant="outline"
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Review Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto py-12">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            {reviewedCount} of {totalCards} reviewed
          </span>
          <span className="flex items-center gap-1">
            <Zap className="size-3 text-amber-500" />
            {reviewedCount * 5} XP earned
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* The Flashcard Container */}
      <div
        className="relative w-full h-80 cursor-pointer [perspective:1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front Side */}
          <div
            className={`absolute inset-0 flex items-center justify-center p-8 bg-card border-2 rounded-2xl shadow-xl [backface-visibility:hidden] ${
              isCurrentReviewed ? "border-green-500/50" : "border-primary/20"
            }`}
          >
            <p className="text-xl font-medium text-center">
              {cards[currentIndex].front}
            </p>
            <span className="absolute bottom-4 text-xs text-muted-foreground uppercase tracking-widest">
              Question
            </span>
            {isCurrentReviewed && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="size-5 text-green-500" />
              </div>
            )}
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-primary text-primary-foreground rounded-2xl shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xl font-medium text-center">
              {cards[currentIndex].back}
            </p>
            <span className="absolute bottom-4 text-xs opacity-70 uppercase tracking-widest">
              Answer
            </span>
          </div>
        </div>
      </div>

      {/* "Got It" Button with XP feedback */}
      <div className="relative">
        <AnimatePresence>
          {showXpBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -40 }}
              exit={{ opacity: 0, scale: 0.5, y: -60 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg z-10"
            >
              <Zap className="w-4 h-4 fill-white" />
              +5 XP
            </motion.div>
          )}
        </AnimatePresence>

        {!isCurrentReviewed ? (
          <Button
            onClick={handleMarkReviewed}
            className="gap-2 bg-green-600 hover:bg-green-700 px-6"
          >
            <CheckCircle className="size-4" />
            Got It!
          </Button>
        ) : (
          <Button variant="outline" disabled className="gap-2 text-green-600">
            <CheckCircle className="size-4" />
            Reviewed ✓
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="rounded-full"
        >
          <ChevronLeft className="size-5" />
        </Button>

        <div className="text-sm font-mono font-medium">
          {currentIndex + 1} / {cards.length}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground italic flex items-center gap-1">
        <RotateCcw className="size-3" /> Click card to flip
      </p>
    </div>
  );
}
