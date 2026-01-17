import { create } from 'zustand'

export type ViewType = "article" | "flashcards" | "quiz" | "mindmap"

interface CourseState {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  activeView: 'article',
  setActiveView: (view) => set({ activeView: view }),
}))