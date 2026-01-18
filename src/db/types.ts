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
  userGamification,
  achievements,
  userAchievements,
  xpTransactions,
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
export type UserGamification = InferSelectModel<typeof userGamification>;
export type Achievement = InferSelectModel<typeof achievements>;
export type UserAchievement = InferSelectModel<typeof userAchievements>;
export type XpTransaction = InferSelectModel<typeof xpTransactions>;

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
export type NewUserGamification = InferInsertModel<typeof userGamification>;
export type NewAchievement = InferInsertModel<typeof achievements>;
export type NewUserAchievement = InferInsertModel<typeof userAchievements>;
export type NewXpTransaction = InferInsertModel<typeof xpTransactions>;

// ============================================================================
// ENUM TYPES
// ============================================================================

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type CourseTone = "professional" | "casual" | "technical";
export type CourseStatus =
  | "draft"
  | "generating"
  | "active"
  | "completed"
  | "archived";
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

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type AchievementCategory =
  | "learning"
  | "streak"
  | "mastery"
  | "social"
  | "special";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type AchievementConditionType =
  | "sections_completed"
  | "courses_completed"
  | "streak_days"
  | "quizzes_passed"
  | "perfect_quizzes"
  | "flashcards_reviewed"
  | "xp_earned"
  | "level_reached"
  | "special";

export type XpReason =
  | "quiz_completed"
  | "section_completed"
  | "course_completed"
  | "flashcard_reviewed"
  | "streak_bonus"
  | "achievement_unlocked"
  | "perfect_quiz"
  | "daily_login"
  | "level_up_bonus"
  | "article_completed"
  | "mindmap_reviewed"
  | "quiz_answer_correct";

/**
 * Result of awarding XP to a user
 */
export interface AwardXpResult {
  success: boolean;
  xpAwarded: number;
  bonusXp: number;
  newTotal: number;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  unlockedAchievements: Achievement[];
  streakUpdated: boolean;
  currentStreak: number;
}

/**
 * User's complete gamification stats for display
 */
export interface GamificationStats {
  xpTotal: number;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-100 percentage
  currentStreak: number;
  longestStreak: number;
  sparks: number;
  freezesAvailable: number;
  freezeUsedToday: boolean;
  totalSectionsCompleted: number;
  totalQuizzesPassed: number;
  totalCoursesCompleted: number;
  perfectQuizzes: number;
}

/**
 * Achievement with unlock status for display
 */
export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt: Date | null;
  progress: number; // 0-100 percentage towards unlock
  currentValue: number; // Current progress value
}
