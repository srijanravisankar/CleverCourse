import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  courses,
  courseSections,
  articlePages,
  flashcards,
  mindMaps,
  mcqQuestions,
  trueFalseQuestions,
  fillUpQuestions,
  chatConversations,
  chatMessages,
  uploadedFiles,
  userProgress,
} from "./schema";

// ============================================================================
// SELECT TYPES (for reading from database)
// ============================================================================

export type User = InferSelectModel<typeof users>;
export type Course = InferSelectModel<typeof courses>;
export type CourseSection = InferSelectModel<typeof courseSections>;
export type ArticlePage = InferSelectModel<typeof articlePages>;
export type Flashcard = InferSelectModel<typeof flashcards>;
export type MindMap = InferSelectModel<typeof mindMaps>;
export type McqQuestion = InferSelectModel<typeof mcqQuestions>;
export type TrueFalseQuestion = InferSelectModel<typeof trueFalseQuestions>;
export type FillUpQuestion = InferSelectModel<typeof fillUpQuestions>;
export type ChatConversation = InferSelectModel<typeof chatConversations>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type UploadedFile = InferSelectModel<typeof uploadedFiles>;
export type UserProgress = InferSelectModel<typeof userProgress>;

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type NewUser = InferInsertModel<typeof users>;
export type NewCourse = InferInsertModel<typeof courses>;
export type NewCourseSection = InferInsertModel<typeof courseSections>;
export type NewArticlePage = InferInsertModel<typeof articlePages>;
export type NewFlashcard = InferInsertModel<typeof flashcards>;
export type NewMindMap = InferInsertModel<typeof mindMaps>;
export type NewMcqQuestion = InferInsertModel<typeof mcqQuestions>;
export type NewTrueFalseQuestion = InferInsertModel<typeof trueFalseQuestions>;
export type NewFillUpQuestion = InferInsertModel<typeof fillUpQuestions>;
export type NewChatConversation = InferInsertModel<typeof chatConversations>;
export type NewChatMessage = InferInsertModel<typeof chatMessages>;
export type NewUploadedFile = InferInsertModel<typeof uploadedFiles>;
export type NewUserProgress = InferInsertModel<typeof userProgress>;

// ============================================================================
// ENUM TYPES
// ============================================================================

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type CourseTone = "professional" | "casual" | "technical";
export type CourseStatus = "draft" | "generating" | "active" | "completed" | "archived";
export type ChatRole = "user" | "assistant";

// ============================================================================
// COMPOSITE TYPES (for complex queries with relations)
// ============================================================================

/**
 * Course with all related sections
 */
export type CourseWithSections = Course & {
  sections: CourseSection[];
};

/**
 * Course section with all content
 */
export type CourseSectionWithContent = CourseSection & {
  articlePages: ArticlePage[];
  flashcards: Flashcard[];
  mindMaps: MindMap[];
  mcqQuestions: McqQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  fillUpQuestions: FillUpQuestion[];
};

/**
 * Full course with all nested content
 */
export type FullCourse = Course & {
  sections: CourseSectionWithContent[];
  uploadedFiles: UploadedFile[];
};

/**
 * Chat conversation with all messages
 */
export type ConversationWithMessages = ChatConversation & {
  messages: ChatMessage[];
};

/**
 * Mind map data structure (parsed from JSON)
 */
export interface MindMapData {
  label: string;
  children?: MindMapNode[];
}

export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

/**
 * Parsed mind map with data
 */
export type ParsedMindMap = Omit<MindMap, "data"> & {
  data: MindMapData;
};

/**
 * MCQ with parsed options
 */
export type ParsedMcqQuestion = Omit<McqQuestion, "options"> & {
  options: string[];
};

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Course creation input
 */
export interface CreateCourseInput {
  topic: string;
  level: CourseLevel;
  goal: string;
  tone: CourseTone;
  targetAudience?: string;
  prerequisites?: string;
  sectionCount: number;
  timeCommitment: number;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Generated section content from AI
 */
export interface GeneratedSectionContent {
  sectionTitle: string;
  article: {
    pages: Array<{
      pageTitle: string;
      content: string;
    }>;
  };
  studyMaterial: {
    mindMap: MindMapData;
    flashcards: Array<{
      front: string;
      back: string;
    }>;
  };
  quiz: {
    mcqs: Array<{
      question: string;
      options: string[];
      answer: string;
    }>;
    trueFalse: Array<{
      question: string;
      answer: boolean;
      explanation: string;
    }>;
    fillUps: Array<{
      sentence: string;
      missingWord: string;
    }>;
  };
}

/**
 * Quiz attempt input
 */
export interface QuizAttempt {
  questionId: string;
  userAnswer: string | boolean;
}

/**
 * Progress update input
 */
export interface ProgressUpdate {
  courseId: string;
  articlesRead?: number;
  flashcardsReviewed?: number;
  quizzesTaken?: number;
  quizScore?: number;
  timeSpent?: number;
}
