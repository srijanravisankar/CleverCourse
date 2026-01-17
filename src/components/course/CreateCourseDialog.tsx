"use client"

import * as React from "react"
import { X, BookOpen, Target, Users, Sparkles, Hash, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateCourseDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateCourseDialog({ open, onClose }: CreateCourseDialogProps) {
  const [formData, setFormData] = React.useState({
    topic: "",
    level: "beginner",
    goal: "",
    tone: "professional",
    sectionCount: "5",
    targetAudience: "",
    prerequisites: "",
  })

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle course creation with AI
    console.log("Creating course with:", formData)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-background border rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b p-6 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-6 text-purple-600" />
                  Create New Course
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about your course and we'll generate personalized content with AI
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-black/10"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="size-4 text-green-600" />
                  Course Topic
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., React Fundamentals, Python for Data Science, Digital Marketing..."
                  value={formData.topic}
                  onChange={(e) => handleChange("topic", e.target.value)}
                  className="h-12 text-base"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  What is the main subject or topic of your course?
                </p>
              </div>

              {/* Learning Level */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="size-4 text-blue-600" />
                  Learning Level
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: "beginner", label: "Beginner", emoji: "🌱" },
                    { value: "intermediate", label: "Intermediate", emoji: "🚀" },
                    { value: "advanced", label: "Advanced", emoji: "⚡" },
                    { value: "expert", label: "Expert", emoji: "🎯" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleChange("level", level.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                        formData.level === level.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-border hover:border-purple-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{level.emoji}</div>
                      <div className="text-sm font-medium">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-base font-semibold flex items-center gap-2">
                  <Target className="size-4 text-orange-600" />
                  Learning Goal
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="goal"
                  placeholder="e.g., Build a portfolio website, Pass certification exam, Career switch..."
                  value={formData.goal}
                  onChange={(e) => handleChange("goal", e.target.value)}
                  className="h-12 text-base"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  What do you want to achieve after completing this course?
                </p>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-base font-semibold flex items-center gap-2">
                  <Users className="size-4 text-pink-600" />
                  Target Audience
                </Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., College students, Working professionals, Career changers..."
                  value={formData.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Who is this course designed for? (Optional)
                </p>
              </div>

              {/* Prerequisites */}
              <div className="space-y-2">
                <Label htmlFor="prerequisites" className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="size-4 text-indigo-600" />
                  Prerequisites
                </Label>
                <Input
                  id="prerequisites"
                  placeholder="e.g., Basic HTML/CSS, No prior experience needed..."
                  value={formData.prerequisites}
                  onChange={(e) => handleChange("prerequisites", e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  What knowledge should learners have before starting? (Optional)
                </p>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="size-4 text-teal-600" />
                  Teaching Tone
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "professional", label: "Professional", desc: "Formal & structured" },
                    { value: "casual", label: "Casual", desc: "Friendly & relaxed" },
                    { value: "technical", label: "Technical", desc: "Detailed & precise" },
                  ].map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => handleChange("tone", tone.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                        formData.tone === tone.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-border hover:border-purple-300"
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{tone.label}</div>
                      <div className="text-xs text-muted-foreground">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Sections */}
              <div className="space-y-2">
                <Label htmlFor="sectionCount" className="text-base font-semibold flex items-center gap-2">
                  <Hash className="size-4 text-yellow-600" />
                  Number of Sections
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="sectionCount"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.sectionCount}
                    onChange={(e) => handleChange("sectionCount", e.target.value)}
                    className="h-12 text-base w-32"
                    required
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.sectionCount}
                      onChange={(e) => handleChange("sectionCount", e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 section</span>
                      <span>20 sections</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  How many sections/chapters should this course have?
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="size-4 mr-2" />
                    Generate Course
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
