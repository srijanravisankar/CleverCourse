import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(), // bcrypt hashed password
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// COURSES TABLE
// ============================================================================
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

  // Course metadata
  title: text("title").notNull(),
  description: text("description"),
  topic: text("topic").notNull(),
  level: text("level", {
    enum: ["beginner", "intermediate", "advanced", "expert"],
  })
    .notNull()
    .default("beginner"),
  goal: text("goal").notNull(),
  tone: text("tone", { enum: ["professional", "casual", "technical"] })
    .notNull()
    .default("professional"),
  targetAudience: text("target_audience"),
  prerequisites: text("prerequisites"),

  // Course settings
  sectionCount: integer("section_count").notNull().default(5),
  timeCommitment: integer("time_commitment").notNull().default(30), // in minutes
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),

  // Progress tracking
  currentSectionIndex: integer("current_section_index").notNull().default(0),
  completedSections: integer("completed_sections").notNull().default(0),
  isComplete: integer("is_complete", { mode: "boolean" })
    .notNull()
    .default(false),

  // Status
  status: text("status", {
    enum: ["draft", "generating", "active", "completed", "archived"],
  })
    .notNull()
    .default("draft"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// COURSE SECTIONS TABLE
// ============================================================================
export const courseSections = sqliteTable("course_sections", {
  id: text("id").primaryKey(), // UUID
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  // Section metadata
  sectionNumber: integer("section_number").notNull(),
  title: text("title").notNull(),

  // Progress tracking
  isCompleted: integer("is_completed", { mode: "boolean" })
    .notNull()
    .default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),

  // Generation context (for iterative generation)
  previousContext: text("previous_context"), // Summary of previous sections for AI context

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// ARTICLE PAGES TABLE
// ============================================================================
export const articlePages = sqliteTable("article_pages", {
  id: text("id").primaryKey(), // UUID
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  pageNumber: integer("page_number").notNull(),
  pageTitle: text("page_title").notNull(),
  content: text("content").notNull(), // Markdown content

  // Reading progress
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  readAt: integer("read_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// FLASHCARDS TABLE
// ============================================================================
export const flashcards = sqliteTable("flashcards", {
  id: text("id").primaryKey(), // UUID
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  front: text("front").notNull(),
  back: text("back").notNull(),

  // Spaced repetition data
  difficulty: integer("difficulty").notNull().default(0), // 0-5 scale
  nextReviewAt: integer("next_review_at", { mode: "timestamp" }),
  reviewCount: integer("review_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// MIND MAPS TABLE
// ============================================================================
export const mindMaps = sqliteTable("mind_maps", {
  id: text("id").primaryKey(), // UUID
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  // Store the hierarchical structure as JSON
  data: text("data").notNull(), // JSON string of mind map structure

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// MCQ QUESTIONS TABLE
// ============================================================================
export const mcqQuestions = sqliteTable("mcq_questions", {
  id: text("id").primaryKey(), // UUID
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  question: text("question").notNull(),
  options: text("options").notNull(), // JSON array of strings
  answer: text("answer").notNull(),

  // User attempt tracking
  isAttempted: integer("is_attempted", { mode: "boolean" })
    .notNull()
    .default(false),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  userAnswer: text("user_answer"),
  attemptedAt: integer("attempted_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// TRUE/FALSE QUESTIONS TABLE
// ============================================================================
export const trueFalseQuestions = sqliteTable("true_false_questions", {
  id: text("id").primaryKey(), // UUID
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  question: text("question").notNull(),
  answer: integer("answer", { mode: "boolean" }).notNull(),
  explanation: text("explanation").notNull(),

  // User attempt tracking
  isAttempted: integer("is_attempted", { mode: "boolean" })
    .notNull()
    .default(false),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  userAnswer: integer("user_answer", { mode: "boolean" }),
  attemptedAt: integer("attempted_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// FILL-IN-THE-BLANKS QUESTIONS TABLE
// ============================================================================
export const fillUpQuestions = sqliteTable("fill_up_questions", {
  id: text("id").primaryKey(), // UUID
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),

  sentence: text("sentence").notNull(),
  missingWord: text("missing_word").notNull(),

  // User attempt tracking
  isAttempted: integer("is_attempted", { mode: "boolean" })
    .notNull()
    .default(false),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  userAnswer: text("user_answer"),
  attemptedAt: integer("attempted_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// CHAT CONVERSATIONS TABLE
// ============================================================================
export const chatConversations = sqliteTable("chat_conversations", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),

  title: text("title"), // Optional title for the conversation

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// CHAT MESSAGES TABLE
// ============================================================================
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(), // UUID
  conversationId: text("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),

  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  context: text("context"), // Highlighted text context

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// UPLOADED FILES TABLE (for course materials)
// ============================================================================
export const uploadedFiles = sqliteTable("uploaded_files", {
  id: text("id").primaryKey(), // UUID
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  path: text("path").notNull(), // relative path in storage

  // Processing status
  isProcessed: integer("is_processed", { mode: "boolean" })
    .notNull()
    .default(false),
  extractedText: text("extracted_text"), // Text extracted from the file

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// USER PROGRESS TABLE (aggregate progress tracking)
// ============================================================================
export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  // Progress metrics
  articlesRead: integer("articles_read").notNull().default(0),
  flashcardsReviewed: integer("flashcards_reviewed").notNull().default(0),
  quizzesTaken: integer("quizzes_taken").notNull().default(0),
  quizScore: real("quiz_score").notNull().default(0), // Average score 0-100

  // Time tracking
  totalTimeSpent: integer("total_time_spent").notNull().default(0), // in seconds
  lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  chatConversations: many(chatConversations),
  progress: many(userProgress),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
  }),
  sections: many(courseSections),
  uploadedFiles: many(uploadedFiles),
  chatConversations: many(chatConversations),
  userProgress: many(userProgress),
}));

export const courseSectionsRelations = relations(
  courseSections,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseSections.courseId],
      references: [courses.id],
    }),
    articlePages: many(articlePages),
    flashcards: many(flashcards),
    mindMaps: many(mindMaps),
    mcqQuestions: many(mcqQuestions),
    trueFalseQuestions: many(trueFalseQuestions),
    fillUpQuestions: many(fillUpQuestions),
  }),
);

export const articlePagesRelations = relations(articlePages, ({ one }) => ({
  section: one(courseSections, {
    fields: [articlePages.sectionId],
    references: [courseSections.id],
  }),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  section: one(courseSections, {
    fields: [flashcards.sectionId],
    references: [courseSections.id],
  }),
}));

export const mindMapsRelations = relations(mindMaps, ({ one }) => ({
  section: one(courseSections, {
    fields: [mindMaps.sectionId],
    references: [courseSections.id],
  }),
}));

export const mcqQuestionsRelations = relations(mcqQuestions, ({ one }) => ({
  section: one(courseSections, {
    fields: [mcqQuestions.sectionId],
    references: [courseSections.id],
  }),
}));

export const trueFalseQuestionsRelations = relations(
  trueFalseQuestions,
  ({ one }) => ({
    section: one(courseSections, {
      fields: [trueFalseQuestions.sectionId],
      references: [courseSections.id],
    }),
  }),
);

export const fillUpQuestionsRelations = relations(
  fillUpQuestions,
  ({ one }) => ({
    section: one(courseSections, {
      fields: [fillUpQuestions.sectionId],
      references: [courseSections.id],
    }),
  }),
);

export const chatConversationsRelations = relations(
  chatConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [chatConversations.userId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [chatConversations.courseId],
      references: [courses.id],
    }),
    messages: many(chatMessages),
  }),
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

export const uploadedFilesRelations = relations(uploadedFiles, ({ one }) => ({
  course: one(courses, {
    fields: [uploadedFiles.courseId],
    references: [courses.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userProgress.courseId],
    references: [courses.id],
  }),
}));
