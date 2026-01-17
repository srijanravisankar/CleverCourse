"use client"

import * as React from "react"
import { ArticleView } from "@/components/course/ArticleView"
import { Flashcards } from "@/components/studyMaterial/Flashcards"
import { MOCK_COURSE_SECTION } from "@/lib/placeholder"
import { useCourseStore } from "@/store/use-course-store"

// Define the possible views
type ViewType = "article" | "flashcards" | "quiz"

export default function CoursePage() {
  // 1. Initialize the state to show 'article' by default
  const { activeView, setActiveView } = useCourseStore()

  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
      {/* 2. Navigation Tabs (Optional but helpful for testing) */}
      <div className="flex border-b bg-background px-6 py-2 gap-4">
        <button 
          onClick={() => setActiveView("article")}
          className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${activeView === 'article' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          Article
        </button>
        <button 
          onClick={() => setActiveView("flashcards")}
          className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${activeView === 'flashcards' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          Flashcards
        </button>
        <button 
          onClick={() => setActiveView("quiz")}
          className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${activeView === 'quiz' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          Quiz
        </button>
      </div>

      {/* 3. Conditional Rendering Logic */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeView === "article" && (
          <ArticleView pages={MOCK_COURSE_SECTION.article.pages} />
        )}
        
        {activeView === "flashcards" && (
          <div className="max-w-4xl mx-auto py-10">
            <h2 className="text-2xl font-bold mb-8 text-center">Master the Concepts</h2>
            <Flashcards cards={MOCK_COURSE_SECTION.studyMaterial.flashcards} />
          </div>
        )}

        {activeView === "quiz" && (
          <div className="max-w-2xl mx-auto py-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready for the Quiz?</h2>
            <p className="text-muted-foreground">The Quiz component will go here next!</p>
          </div>
        )}
      </div>
    </main>
  )
}