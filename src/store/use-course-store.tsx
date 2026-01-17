import { create } from "zustand";

// Update the ViewType union
export type ViewType = 
  | "article" 
  | "flashcards" 
  | "mindmap" 
  | "network" 
  | "mcq"   
  | "tf"     
  | "fill"   
  | "quiz";    

interface CourseState {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  activeView: "article",
  setActiveView: (view) => set({ activeView: view }),
}));
