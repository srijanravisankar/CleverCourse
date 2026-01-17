"use client"

import * as React from "react"
import { Check, X, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface MultipleChoiceProps {
  question: string
  options: string[]
  answer: string // Changed from correctAnswer to match your mock data
  onNext: () => void
}

export function MultipleChoice({ 
  question, 
  options, 
  answer, 
  onNext 
}: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSelect = (option: string) => {
    if (isSubmitted) return
    setSelectedOption(option)
  }

  const isCorrect = selectedOption === answer

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b pb-6">
        <CardTitle className="text-xl font-bold leading-tight text-slate-900">
          {question}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-8 space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === option
          const showSuccess = isSubmitted && option === answer
          const showError = isSubmitted && isSelected && option !== answer

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={isSubmitted}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected && !isSubmitted ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 bg-white hover:border-slate-300"}
                ${showSuccess ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : ""}
                ${showError ? "border-red-500 bg-red-50 text-red-700 shadow-sm" : ""}
                ${isSubmitted && !showSuccess && !showError ? "opacity-50" : ""}
              `}
            >
              <span className="font-medium">{option}</span>
              <div className="flex items-center justify-center size-6 rounded-full border">
                {showSuccess && <Check className="size-4" />}
                {showError && <X className="size-4" />}
                {!isSubmitted && isSelected && <div className="size-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          )
        })}
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedOption(null)
            setIsSubmitted(false)
          }}
          disabled={!isSubmitted}
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Retry
        </Button>

        {!isSubmitted ? (
          <Button 
            onClick={() => setIsSubmitted(true)} 
            disabled={!selectedOption}
            className="px-8"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-2 px-8 bg-green-600 hover:bg-green-700 text-white">
            Next Question
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}