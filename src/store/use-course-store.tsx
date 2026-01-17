import { create } from "zustand";
import type {
  Course,
  CourseSection,
  CourseSectionWithContent,
} from "@/db/types";

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
  // View state
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Course list
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;

  // Current course
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;

  // Sections for current course
  sections: CourseSection[];
  setSections: (sections: CourseSection[]) => void;

  // Current active section with full content
  currentSection: CourseSectionWithContent | null;
  setCurrentSection: (section: CourseSectionWithContent | null) => void;
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;

  // Loading states
  isLoadingCourses: boolean;
  setIsLoadingCourses: (loading: boolean) => void;
  isLoadingSection: boolean;
  setIsLoadingSection: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  activeView: "article" as ViewType,
  courses: [],
  currentCourse: null,
  sections: [],
  currentSection: null,
  activeSectionId: null,
  isLoadingCourses: false,
  isLoadingSection: false,
  error: null,
};

export const useCourseStore = create<CourseState>((set) => ({
  ...initialState,

  setActiveView: (view) => set({ activeView: view }),

  setCourses: (courses) => set({ courses }),
  addCourse: (course) =>
    set((state) => ({
      courses: [course, ...state.courses],
    })),

  setCurrentCourse: (course) =>
    set({
      currentCourse: course,
      // Reset section state when changing course
      currentSection: null,
      activeSectionId: null,
    }),

  setSections: (sections) => set({ sections }),

  setCurrentSection: (section) => set({ currentSection: section }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  setIsLoadingCourses: (loading) => set({ isLoadingCourses: loading }),
  setIsLoadingSection: (loading) => set({ isLoadingSection: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
