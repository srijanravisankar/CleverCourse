"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Flashcard {
  front: string
  back: string
}

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isFlipped, setIsFlipped] = React.useState(false)

  const handleNext = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 150) // Short delay to allow flip back before changing content
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }, 150)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md mx-auto py-12">
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
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-card border-2 border-primary/20 rounded-2xl shadow-xl [backface-visibility:hidden]">
            <p className="text-xl font-medium text-center">{cards[currentIndex].front}</p>
            <span className="absolute bottom-4 text-xs text-muted-foreground uppercase tracking-widest">Question</span>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-primary text-primary-foreground rounded-2xl shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xl font-medium text-center">{cards[currentIndex].back}</p>
            <span className="absolute bottom-4 text-xs opacity-70 uppercase tracking-widest">Answer</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full">
          <ChevronLeft className="size-5" />
        </Button>
        
        <div className="text-sm font-mono font-medium">
          {currentIndex + 1} / {cards.length}
        </div>

        <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground italic flex items-center gap-1">
        <RotateCcw className="size-3" /> Click card to flip
      </p>
    </div>
  )
}