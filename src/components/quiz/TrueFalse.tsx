"use client";

import * as React from "react";
import { Check, X, ArrowRight, RotateCcw, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import confetti from "canvas-confetti";

interface TrueFalseProps {
  question: string;
  answer: boolean;
  explanation: string;
  onNext: () => void;
  onCorrectAnswer?: () => void;
}

export function TrueFalse({
  question,
  answer,
  explanation,
  onNext,
  onCorrectAnswer,
}: TrueFalseProps) {
  const [userChoice, setUserChoice] = React.useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [showXPBadge, setShowXPBadge] = React.useState(false);
  const [xpAwarded, setXpAwarded] = React.useState(false);

  const handleChoice = (choice: boolean) => {
    if (isSubmitted) return;
    setUserChoice(choice);
  };

  const handleSubmit = async () => {
    if (userChoice === null) return;
    setIsSubmitted(true);

    const correct = userChoice === answer;
    if (correct && !xpAwarded) {
      setXpAwarded(true);
      // Trigger confetti for correct answer!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#22c55e", "#16a34a", "#4ade80", "#86efac"],
      });
      setShowXPBadge(true);
      setTimeout(() => setShowXPBadge(false), 2500);

      // Call the callback if provided
      if (onCorrectAnswer) {
        onCorrectAnswer();
      }
    }
  };

  const isCorrect = userChoice === answer;

  return (
    <Card className="w-full max-w-xl mx-auto border-none shadow-xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* XP Award Badge */}
      {showXPBadge && (
        <div className="absolute top-4 right-4 z-20 animate-in zoom-in-50 fade-in duration-300">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-full shadow-lg">
            <Star className="size-5 fill-white" />
            <span className="font-bold">+15 XP</span>
            <Sparkles className="size-4" />
          </div>
        </div>
      )}

      <CardHeader className="bg-slate-50/50 border-b pb-8 pt-8 text-center">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            True or False
          </span>
        </div>
        <CardTitle className="text-2xl font-bold leading-tight text-slate-900 px-4">
          {question}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-10 pb-10 space-y-6 px-10">
        <div className="flex gap-4">
          {/* TRUE BUTTON */}
          <button
            onClick={() => handleChoice(true)}
            disabled={isSubmitted}
            className={`
              flex-1 flex flex-col items-center justify-center py-10 rounded-3xl border-4 transition-all duration-300
              ${userChoice === true && !isSubmitted ? "border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg" : "border-slate-100 bg-white hover:border-slate-200"}
              ${isSubmitted && answer === true ? "border-green-500 bg-green-50 text-green-700 shadow-md" : ""}
              ${isSubmitted && userChoice === true && answer === false ? "border-red-500 bg-red-50 text-red-700 opacity-80" : ""}
              ${isSubmitted && userChoice !== true && answer !== true ? "opacity-40" : ""}
            `}
          >
            <span className="text-2xl font-black tracking-tighter">TRUE</span>
            {isSubmitted && answer === true && (
              <Check className="mt-2 size-6" />
            )}
            {isSubmitted && userChoice === true && answer === false && (
              <X className="mt-2 size-6" />
            )}
          </button>

          {/* FALSE BUTTON */}
          <button
            onClick={() => handleChoice(false)}
            disabled={isSubmitted}
            className={`
              flex-1 flex flex-col items-center justify-center py-10 rounded-3xl border-4 transition-all duration-300
              ${userChoice === false && !isSubmitted ? "border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg" : "border-slate-100 bg-white hover:border-slate-200"}
              ${isSubmitted && answer === false ? "border-green-500 bg-green-50 text-green-700 shadow-md" : ""}
              ${isSubmitted && userChoice === false && answer === true ? "border-red-500 bg-red-50 text-red-700 opacity-80" : ""}
              ${isSubmitted && userChoice !== false && answer !== false ? "opacity-40" : ""}
            `}
          >
            <span className="text-2xl font-black tracking-tighter">FALSE</span>
            {isSubmitted && answer === false && (
              <Check className="mt-2 size-6" />
            )}
            {isSubmitted && userChoice === false && answer === true && (
              <X className="mt-2 size-6" />
            )}
          </button>
        </div>

        {isSubmitted && (
          <div
            className={`mt-8 p-6 rounded-2xl animate-in zoom-in-95 duration-300 shadow-2xl ${isCorrect ? "bg-green-900 text-green-100" : "bg-slate-900 text-slate-100"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`size-2 rounded-full ${isCorrect ? "bg-green-400" : "bg-red-400"}`}
              />
              <p className="text-xs font-black uppercase tracking-widest opacity-70">
                {isCorrect ? "🎉 Well Done! +15 XP" : "Learning Opportunity"}
              </p>
            </div>
            <p className="text-sm leading-relaxed font-medium">{explanation}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            setUserChoice(null);
            setIsSubmitted(false);
            setXpAwarded(false);
          }}
          disabled={!isSubmitted}
          className="text-slate-500 hover:text-slate-900"
        >
          <RotateCcw className="size-4 mr-2" />
          Reset Question
        </Button>

        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={userChoice === null}
            className="px-10 rounded-full font-bold shadow-lg shadow-primary/20"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-2 px-10 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold shadow-lg shadow-green-200"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
