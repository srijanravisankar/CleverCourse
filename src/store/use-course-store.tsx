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

// Section generation status
export type SectionStatus = "pending" | "generating" | "ready" | "error";

export interface PendingSection {
  sectionNumber: number;
  status: SectionStatus;
  error?: string;
}

interface CourseState {
  // View state
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Course list
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;

  // Current course
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;

  // Sections for current course
  sections: CourseSection[];
  setSections: (sections: CourseSection[]) => void;
  addSection: (section: CourseSection) => void;

  // Pending/generating sections (not yet in DB)
  pendingSections: PendingSection[];
  setPendingSections: (sections: PendingSection[]) => void;
  updatePendingSection: (
    sectionNumber: number,
    updates: Partial<PendingSection>,
  ) => void;
  removePendingSection: (sectionNumber: number) => void;
  clearPendingSections: () => void;

  // Current active section with full content
  currentSection: CourseSectionWithContent | null;
  setCurrentSection: (section: CourseSectionWithContent | null) => void;
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;

  // SECTION CONTENT CACHE - stores full content for sections we've already loaded
  sectionContentCache: Map<string, CourseSectionWithContent>;
  getCachedSectionContent: (sectionId: string) => CourseSectionWithContent | undefined;
  cacheSectionContent: (section: CourseSectionWithContent) => void;
  clearSectionContentCache: () => void;

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
  pendingSections: [] as PendingSection[],
  currentSection: null,
  activeSectionId: null,
  sectionContentCache: new Map<string, CourseSectionWithContent>(),
  isLoadingCourses: false,
  isLoadingSection: false,
  error: null,
};

export const useCourseStore = create<CourseState>((set, get) => ({
  ...initialState,

  setActiveView: (view) => set({ activeView: view }),

  setCourses: (courses) => set({ courses }),
  addCourse: (course) =>
    set((state) => ({
      courses: [course, ...state.courses],
    })),
  updateCourse: (courseId, updates) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === courseId ? { ...c, ...updates } : c,
      ),
      currentCourse:
        state.currentCourse?.id === courseId
          ? { ...state.currentCourse, ...updates }
          : state.currentCourse,
    })),

  setCurrentCourse: (course) =>
    set({
      currentCourse: course,
      // Reset section state when changing course
      currentSection: null,
      activeSectionId: null,
      // Clear cache when switching courses
      sectionContentCache: new Map(),
    }),

  setSections: (sections) => set({ sections }),
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section].sort(
        (a, b) => a.sectionNumber - b.sectionNumber,
      ),
    })),

  // Pending sections management
  setPendingSections: (pendingSections) => set({ pendingSections }),
  updatePendingSection: (sectionNumber, updates) =>
    set((state) => ({
      pendingSections: state.pendingSections.map((s) =>
        s.sectionNumber === sectionNumber ? { ...s, ...updates } : s,
      ),
    })),
  removePendingSection: (sectionNumber) =>
    set((state) => ({
      pendingSections: state.pendingSections.filter(
        (s) => s.sectionNumber !== sectionNumber,
      ),
    })),
  clearPendingSections: () => set({ pendingSections: [] }),

  setCurrentSection: (section) => set({ currentSection: section }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  // Section content cache methods
  getCachedSectionContent: (sectionId: string) => {
    return get().sectionContentCache.get(sectionId);
  },
  cacheSectionContent: (section: CourseSectionWithContent) => {
    set((state) => {
      const newCache = new Map(state.sectionContentCache);
      newCache.set(section.id, section);
      return { sectionContentCache: newCache };
    });
  },
  clearSectionContentCache: () => set({ sectionContentCache: new Map() }),

  setIsLoadingCourses: (loading) => set({ isLoadingCourses: loading }),
  setIsLoadingSection: (loading) => set({ isLoadingSection: loading }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState, sectionContentCache: new Map() }),
}));
