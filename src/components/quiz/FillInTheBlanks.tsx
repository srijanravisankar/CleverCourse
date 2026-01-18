"use client";

import * as React from "react";
import {
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

interface FillInTheBlanksProps {
  sentence: string;
  missingWord: string;
  onNext: () => void;
  onCorrectAnswer?: () => void;
}

export function FillInTheBlanks({
  sentence,
  missingWord,
  onNext,
  onCorrectAnswer,
}: FillInTheBlanksProps) {
  const [userInput, setUserInput] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [showXPBadge, setShowXPBadge] = React.useState(false);
  const [xpAwarded, setXpAwarded] = React.useState(false);

  // Split sentence into parts around the placeholder "______"
  const parts = sentence.split("______");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim()) return;
    setIsSubmitted(true);

    const correct =
      userInput.trim().toLowerCase() === missingWord.toLowerCase();
    if (correct && !xpAwarded) {
      setXpAwarded(true);
      // Trigger confetti for correct answer!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#8b5cf6", "#d946ef", "#f0abfc"],
      });
      setShowXPBadge(true);
      setTimeout(() => setShowXPBadge(false), 2500);

      // Call the callback if provided
      if (onCorrectAnswer) {
        onCorrectAnswer();
      }
    }
  };

  const isCorrect =
    userInput.trim().toLowerCase() === missingWord.toLowerCase();

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-xl bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      {/* XP Award Badge */}
      {showXPBadge && (
        <div className="absolute top-4 right-4 z-20 animate-in zoom-in-50 fade-in duration-300">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
            <Zap className="size-5 fill-white" />
            <span className="font-bold">+15 XP</span>
            <Sparkles className="size-4" />
          </div>
        </div>
      )}

      <CardHeader className="bg-slate-50/50 border-b pb-6 pt-8 text-center">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            Fill in the Blanks
          </span>
        </div>
        <CardTitle className="text-xl font-medium text-slate-500 italic">
          Complete the following statement:
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-12 pb-12 px-10">
        <form onSubmit={handleSubmit} className="relative">
          <div className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-800 flex flex-wrap items-center gap-x-2 gap-y-4 justify-center">
            <span>{parts[0]}</span>

            <div className="relative inline-block group">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isSubmitted}
                placeholder="type here..."
                className={`
                  h-12 text-center text-xl font-bold rounded-xl border-b-4 border-t-0 border-x-0 transition-all duration-300 min-w-[180px] w-fit
                  ${!isSubmitted ? "bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-0" : ""}
                  ${isSubmitted && isCorrect ? "bg-green-50 border-green-500 text-green-700 disabled:opacity-100" : ""}
                  ${isSubmitted && !isCorrect ? "bg-red-50 border-red-500 text-red-700 disabled:opacity-100" : ""}
                `}
                autoFocus
              />
              {isSubmitted && !isCorrect && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-green-600 animate-bounce">
                  Correct: {missingWord}
                </span>
              )}
            </div>

            <span>{parts[1]}</span>
          </div>
        </form>

        {isSubmitted && (
          <div
            className={`mt-10 p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 ${isCorrect ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200" : "bg-red-50 border border-red-100"}`}
          >
            <div
              className={`p-2 rounded-lg ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
            >
              {isCorrect ? (
                <Check className="size-5" />
              ) : (
                <X className="size-5" />
              )}
            </div>
            <div>
              <p
                className={`font-bold flex items-center gap-2 ${isCorrect ? "text-green-800" : "text-red-800"}`}
              >
                {isCorrect ? (
                  <>
                    <span>Spot on!</span>
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-normal text-green-600">
                      +15 XP
                    </span>
                  </>
                ) : (
                  "Not quite right."
                )}
              </p>
              <p
                className={`text-sm ${isCorrect ? "text-green-700" : "text-red-700 opacity-80"}`}
              >
                The missing word was{" "}
                <span className="font-bold">"{missingWord}"</span>.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            setUserInput("");
            setIsSubmitted(false);
            setXpAwarded(false);
          }}
          disabled={!isSubmitted}
          className="text-slate-400 hover:text-slate-600"
        >
          <RotateCcw className="size-4 mr-2" />
          Clear
        </Button>

        {!isSubmitted ? (
          <Button
            onClick={() => handleSubmit()}
            disabled={!userInput.trim()}
            className="px-10 rounded-xl font-bold shadow-lg"
          >
            Check Word
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-2 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all hover:translate-x-1"
          >
            Next Challenge
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
