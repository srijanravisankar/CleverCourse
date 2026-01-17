"use client"

import * as React from "react"
import { Check, X, ArrowRight, RotateCcw, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface FillInTheBlanksProps {
  sentence: string
  missingWord: string
  onNext: () => void
}

export function FillInTheBlanks({ 
  sentence, 
  missingWord, 
  onNext 
}: FillInTheBlanksProps) {
  const [userInput, setUserInput] = React.useState("")
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // Split sentence into parts around the placeholder "______"
  const parts = sentence.split("______")

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (userInput.trim()) setIsSubmitted(true)
  }

  const isCorrect = userInput.trim().toLowerCase() === missingWord.toLowerCase()

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-xl bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
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
          <div className={`mt-10 p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 ${isCorrect ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
            <div className={`p-2 rounded-lg ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
              {isCorrect ? <Check className="size-5" /> : <X className="size-5" />}
            </div>
            <div>
              <p className={`font-bold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                {isCorrect ? "Spot on!" : "Not quite right."}
              </p>
              <p className={`text-sm ${isCorrect ? "text-green-700" : "text-red-700 opacity-80"}`}>
                The missing word was <span className="font-bold">"{missingWord}"</span>.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-between">
        <Button 
          variant="ghost" 
          onClick={() => {
            setUserInput("")
            setIsSubmitted(false)
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
          <Button onClick={onNext} className="gap-2 px-10 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all hover:translate-x-1">
            Next Challenge
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}