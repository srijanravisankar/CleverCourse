import { eq, desc, and, asc } from "drizzle-orm";
import { db } from "./index";
import {
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
import type {
  User,
  NewUser,
  Course,
  NewCourse,
  CourseSection,
  NewCourseSection,
  ArticlePage,
  NewArticlePage,
  Flashcard,
  NewFlashcard,
  MindMap,
  NewMindMap,
  McqQuestion,
  NewMcqQuestion,
  TrueFalseQuestion,
  NewTrueFalseQuestion,
  FillUpQuestion,
  NewFillUpQuestion,
  ChatConversation,
  NewChatConversation,
  ChatMessage,
  NewChatMessage,
  UploadedFile,
  NewUploadedFile,
  UserProgress,
  NewUserProgress,
  CourseWithSections,
  CourseSectionWithContent,
  FullCourse,
  ConversationWithMessages,
} from "./types";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// USER REPOSITORY
// ============================================================================

export const userRepository = {
  async create(data: Omit<NewUser, "id">): Promise<User> {
    const id = generateId();
    const [user] = await db
      .insert(users)
      .values({ ...data, id })
      .returning();
    return user;
  },

  async findById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async findByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  },
};

// ============================================================================
// COURSE REPOSITORY
// ============================================================================

export const courseRepository = {
  async create(data: Omit<NewCourse, "id">): Promise<Course> {
    const id = generateId();
    const [course] = await db
      .insert(courses)
      .values({ ...data, id })
      .returning();
    return course;
  },

  async findById(id: string): Promise<Course | undefined> {
    return db.query.courses.findFirst({
      where: eq(courses.id, id),
    });
  },

  async findByIdWithSections(id: string): Promise<CourseWithSections | undefined> {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        sections: {
          orderBy: [asc(courseSections.sectionNumber)],
        },
      },
    });
    return course as CourseWithSections | undefined;
  },

  async findByIdFull(id: string): Promise<FullCourse | undefined> {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        sections: {
          orderBy: [asc(courseSections.sectionNumber)],
          with: {
            articlePages: {
              orderBy: [asc(articlePages.pageNumber)],
            },
            flashcards: true,
            mindMaps: true,
            mcqQuestions: true,
            trueFalseQuestions: true,
            fillUpQuestions: true,
          },
        },
        uploadedFiles: true,
      },
    });
    return course as FullCourse | undefined;
  },

  async findByUserId(userId: string): Promise<Course[]> {
    return db.query.courses.findMany({
      where: eq(courses.userId, userId),
      orderBy: [desc(courses.createdAt)],
    });
  },

  async findAll(): Promise<Course[]> {
    return db.query.courses.findMany({
      orderBy: [desc(courses.createdAt)],
    });
  },

  async update(id: string, data: Partial<NewCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  },

  async updateStatus(id: string, status: Course["status"]): Promise<Course | undefined> {
    return this.update(id, { status });
  },

  async incrementCompletedSections(id: string): Promise<Course | undefined> {
    const course = await this.findById(id);
    if (!course) return undefined;
    
    return this.update(id, {
      completedSections: course.completedSections + 1,
      isComplete: course.completedSections + 1 >= course.sectionCount,
    });
  },

  async delete(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  },
};

// ============================================================================
// COURSE SECTION REPOSITORY
// ============================================================================

export const sectionRepository = {
  async create(data: Omit<NewCourseSection, "id">): Promise<CourseSection> {
    const id = generateId();
    const [section] = await db
      .insert(courseSections)
      .values({ ...data, id })
      .returning();
    return section;
  },

  async findById(id: string): Promise<CourseSection | undefined> {
    return db.query.courseSections.findFirst({
      where: eq(courseSections.id, id),
    });
  },

  async findByIdWithContent(id: string): Promise<CourseSectionWithContent | undefined> {
    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, id),
      with: {
        articlePages: {
          orderBy: [asc(articlePages.pageNumber)],
        },
        flashcards: true,
        mindMaps: true,
        mcqQuestions: true,
        trueFalseQuestions: true,
        fillUpQuestions: true,
      },
    });
    return section as CourseSectionWithContent | undefined;
  },

  async findByCourseId(courseId: string): Promise<CourseSection[]> {
    return db.query.courseSections.findMany({
      where: eq(courseSections.courseId, courseId),
      orderBy: [asc(courseSections.sectionNumber)],
    });
  },

  async update(id: string, data: Partial<NewCourseSection>): Promise<CourseSection | undefined> {
    const [section] = await db
      .update(courseSections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courseSections.id, id))
      .returning();
    return section;
  },

  async markComplete(id: string): Promise<CourseSection | undefined> {
    return this.update(id, {
      isCompleted: true,
      completedAt: new Date(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.delete(courseSections).where(eq(courseSections.id, id));
  },
};

// ============================================================================
// ARTICLE PAGE REPOSITORY
// ============================================================================

export const articleRepository = {
  async create(data: Omit<NewArticlePage, "id">): Promise<ArticlePage> {
    const id = generateId();
    const [article] = await db
      .insert(articlePages)
      .values({ ...data, id })
      .returning();
    return article;
  },

  async createMany(data: Omit<NewArticlePage, "id">[]): Promise<ArticlePage[]> {
    const articlesWithIds = data.map((article) => ({
      ...article,
      id: generateId(),
    }));
    return db.insert(articlePages).values(articlesWithIds).returning();
  },

  async findById(id: string): Promise<ArticlePage | undefined> {
    return db.query.articlePages.findFirst({
      where: eq(articlePages.id, id),
    });
  },

  async findBySectionId(sectionId: string): Promise<ArticlePage[]> {
    return db.query.articlePages.findMany({
      where: eq(articlePages.sectionId, sectionId),
      orderBy: [asc(articlePages.pageNumber)],
    });
  },

  async markAsRead(id: string): Promise<ArticlePage | undefined> {
    const [article] = await db
      .update(articlePages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(articlePages.id, id))
      .returning();
    return article;
  },

  async delete(id: string): Promise<void> {
    await db.delete(articlePages).where(eq(articlePages.id, id));
  },
};

// ============================================================================
// FLASHCARD REPOSITORY
// ============================================================================

export const flashcardRepository = {
  async create(data: Omit<NewFlashcard, "id">): Promise<Flashcard> {
    const id = generateId();
    const [flashcard] = await db
      .insert(flashcards)
      .values({ ...data, id })
      .returning();
    return flashcard;
  },

  async createMany(data: Omit<NewFlashcard, "id">[]): Promise<Flashcard[]> {
    const cardsWithIds = data.map((card) => ({
      ...card,
      id: generateId(),
    }));
    return db.insert(flashcards).values(cardsWithIds).returning();
  },

  async findById(id: string): Promise<Flashcard | undefined> {
    return db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
    });
  },

  async findBySectionId(sectionId: string): Promise<Flashcard[]> {
    return db.query.flashcards.findMany({
      where: eq(flashcards.sectionId, sectionId),
    });
  },

  async updateReview(
    id: string,
    isCorrect: boolean
  ): Promise<Flashcard | undefined> {
    const card = await this.findById(id);
    if (!card) return undefined;

    // Simple spaced repetition: adjust difficulty based on answer
    const newDifficulty = isCorrect
      ? Math.max(0, card.difficulty - 1)
      : Math.min(5, card.difficulty + 1);

    // Calculate next review time based on difficulty
    const daysUntilReview = Math.pow(2, 5 - newDifficulty); // 1-32 days
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysUntilReview);

    const [updated] = await db
      .update(flashcards)
      .set({
        difficulty: newDifficulty,
        nextReviewAt: nextReview,
        reviewCount: card.reviewCount + 1,
        correctCount: isCorrect ? card.correctCount + 1 : card.correctCount,
      })
      .where(eq(flashcards.id, id))
      .returning();
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.delete(flashcards).where(eq(flashcards.id, id));
  },
};

// ============================================================================
// MIND MAP REPOSITORY
// ============================================================================

export const mindMapRepository = {
  async create(data: Omit<NewMindMap, "id">): Promise<MindMap> {
    const id = generateId();
    const [mindMap] = await db
      .insert(mindMaps)
      .values({ ...data, id })
      .returning();
    return mindMap;
  },

  async findById(id: string): Promise<MindMap | undefined> {
    return db.query.mindMaps.findFirst({
      where: eq(mindMaps.id, id),
    });
  },

  async findBySectionId(sectionId: string): Promise<MindMap | undefined> {
    return db.query.mindMaps.findFirst({
      where: eq(mindMaps.sectionId, sectionId),
    });
  },

  async update(id: string, data: string): Promise<MindMap | undefined> {
    const [mindMap] = await db
      .update(mindMaps)
      .set({ data })
      .where(eq(mindMaps.id, id))
      .returning();
    return mindMap;
  },

  async delete(id: string): Promise<void> {
    await db.delete(mindMaps).where(eq(mindMaps.id, id));
  },
};

// ============================================================================
// MCQ REPOSITORY
// ============================================================================

export const mcqRepository = {
  async create(data: Omit<NewMcqQuestion, "id">): Promise<McqQuestion> {
    const id = generateId();
    const [mcq] = await db
      .insert(mcqQuestions)
      .values({ ...data, id })
      .returning();
    return mcq;
  },

  async createMany(data: Omit<NewMcqQuestion, "id">[]): Promise<McqQuestion[]> {
    const mcqsWithIds = data.map((mcq) => ({
      ...mcq,
      id: generateId(),
    }));
    return db.insert(mcqQuestions).values(mcqsWithIds).returning();
  },

  async findById(id: string): Promise<McqQuestion | undefined> {
    return db.query.mcqQuestions.findFirst({
      where: eq(mcqQuestions.id, id),
    });
  },

  async findBySectionId(sectionId: string): Promise<McqQuestion[]> {
    return db.query.mcqQuestions.findMany({
      where: eq(mcqQuestions.sectionId, sectionId),
    });
  },

  async submitAnswer(
    id: string,
    userAnswer: string
  ): Promise<McqQuestion | undefined> {
    const mcq = await this.findById(id);
    if (!mcq) return undefined;

    const [updated] = await db
      .update(mcqQuestions)
      .set({
        isAttempted: true,
        userAnswer,
        isCorrect: mcq.answer === userAnswer,
        attemptedAt: new Date(),
      })
      .where(eq(mcqQuestions.id, id))
      .returning();
    return updated;
  },

  async resetAttempt(id: string): Promise<McqQuestion | undefined> {
    const [mcq] = await db
      .update(mcqQuestions)
      .set({
        isAttempted: false,
        userAnswer: null,
        isCorrect: null,
        attemptedAt: null,
      })
      .where(eq(mcqQuestions.id, id))
      .returning();
    return mcq;
  },

  async delete(id: string): Promise<void> {
    await db.delete(mcqQuestions).where(eq(mcqQuestions.id, id));
  },
};

// ============================================================================
// TRUE/FALSE REPOSITORY
// ============================================================================

export const trueFalseRepository = {
  async create(data: Omit<NewTrueFalseQuestion, "id">): Promise<TrueFalseQuestion> {
    const id = generateId();
    const [tf] = await db
      .insert(trueFalseQuestions)
      .values({ ...data, id })
      .returning();
    return tf;
  },

  async createMany(
    data: Omit<NewTrueFalseQuestion, "id">[]
  ): Promise<TrueFalseQuestion[]> {
    const tfsWithIds = data.map((tf) => ({
      ...tf,
      id: generateId(),
    }));
    return db.insert(trueFalseQuestions).values(tfsWithIds).returning();
  },

  async findById(id: string): Promise<TrueFalseQuestion | undefined> {
    return db.query.trueFalseQuestions.findFirst({
      where: eq(trueFalseQuestions.id, id),
    });
  },

  async findBySectionId(sectionId: string): Promise<TrueFalseQuestion[]> {
    return db.query.trueFalseQuestions.findMany({
      where: eq(trueFalseQuestions.sectionId, sectionId),
    });
  },

  async submitAnswer(
    id: string,
    userAnswer: boolean
  ): Promise<TrueFalseQuestion | undefined> {
    const tf = await this.findById(id);
    if (!tf) return undefined;

    const [updated] = await db
      .update(trueFalseQuestions)
      .set({
        isAttempted: true,
        userAnswer,
        isCorrect: tf.answer === userAnswer,
        attemptedAt: new Date(),
      })
      .where(eq(trueFalseQuestions.id, id))
      .returning();
    return updated;
  },

  async resetAttempt(id: string): Promise<TrueFalseQuestion | undefined> {
    const [tf] = await db
      .update(trueFalseQuestions)
      .set({
        isAttempted: false,
        userAnswer: null,
        isCorrect: null,
        attemptedAt: null,
      })
      .where(eq(trueFalseQuestions.id, id))
      .returning();
    return tf;
  },

  async delete(id: string): Promise<void> {
    await db.delete(trueFalseQuestions).where(eq(trueFalseQuestions.id, id));
  },
};

// ============================================================================
// FILL-UP REPOSITORY
// ============================================================================

export const fillUpRepository = {
  async create(data: Omit<NewFillUpQuestion, "id">): Promise<FillUpQuestion> {
    const id = generateId();
    const [fillUp] = await db
      .insert(fillUpQuestions)
      .values({ ...data, id })
      .returning();
    return fillUp;
  },

  async createMany(
    data: Omit<NewFillUpQuestion, "id">[]
  ): Promise<FillUpQuestion[]> {
    const fillUpsWithIds = data.map((fillUp) => ({
      ...fillUp,
      id: generateId(),
    }));
    return db.insert(fillUpQuestions).values(fillUpsWithIds).returning();
  },

  async findById(id: string): Promise<FillUpQuestion | undefined> {
    return db.query.fillUpQuestions.findFirst({
      where: eq(fillUpQuestions.id, id),
    });
  },

  async findBySectionId(sectionId: string): Promise<FillUpQuestion[]> {
    return db.query.fillUpQuestions.findMany({
      where: eq(fillUpQuestions.sectionId, sectionId),
    });
  },

  async submitAnswer(
    id: string,
    userAnswer: string
  ): Promise<FillUpQuestion | undefined> {
    const fillUp = await this.findById(id);
    if (!fillUp) return undefined;

    // Case-insensitive comparison
    const isCorrect =
      fillUp.missingWord.toLowerCase() === userAnswer.toLowerCase();

    const [updated] = await db
      .update(fillUpQuestions)
      .set({
        isAttempted: true,
        userAnswer,
        isCorrect,
        attemptedAt: new Date(),
      })
      .where(eq(fillUpQuestions.id, id))
      .returning();
    return updated;
  },

  async resetAttempt(id: string): Promise<FillUpQuestion | undefined> {
    const [fillUp] = await db
      .update(fillUpQuestions)
      .set({
        isAttempted: false,
        userAnswer: null,
        isCorrect: null,
        attemptedAt: null,
      })
      .where(eq(fillUpQuestions.id, id))
      .returning();
    return fillUp;
  },

  async delete(id: string): Promise<void> {
    await db.delete(fillUpQuestions).where(eq(fillUpQuestions.id, id));
  },
};

// ============================================================================
// CHAT CONVERSATION REPOSITORY
// ============================================================================

export const conversationRepository = {
  async create(data: Omit<NewChatConversation, "id">): Promise<ChatConversation> {
    const id = generateId();
    const [conversation] = await db
      .insert(chatConversations)
      .values({ ...data, id })
      .returning();
    return conversation;
  },

  async findById(id: string): Promise<ChatConversation | undefined> {
    return db.query.chatConversations.findFirst({
      where: eq(chatConversations.id, id),
    });
  },

  async findByIdWithMessages(id: string): Promise<ConversationWithMessages | undefined> {
    const conversation = await db.query.chatConversations.findFirst({
      where: eq(chatConversations.id, id),
      with: {
        messages: {
          orderBy: [asc(chatMessages.createdAt)],
        },
      },
    });
    return conversation as ConversationWithMessages | undefined;
  },

  async findByUserId(userId: string): Promise<ChatConversation[]> {
    return db.query.chatConversations.findMany({
      where: eq(chatConversations.userId, userId),
      orderBy: [desc(chatConversations.updatedAt)],
    });
  },

  async findByCourseId(courseId: string): Promise<ChatConversation[]> {
    return db.query.chatConversations.findMany({
      where: eq(chatConversations.courseId, courseId),
      orderBy: [desc(chatConversations.updatedAt)],
    });
  },

  async findLatestByUserId(userId: string): Promise<ChatConversation | undefined> {
    return db.query.chatConversations.findFirst({
      where: eq(chatConversations.userId, userId),
      orderBy: [desc(chatConversations.updatedAt)],
    });
  },

  async update(
    id: string,
    data: Partial<NewChatConversation>
  ): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation;
  },

  async delete(id: string): Promise<void> {
    await db.delete(chatConversations).where(eq(chatConversations.id, id));
  },
};

// ============================================================================
// CHAT MESSAGE REPOSITORY
// ============================================================================

export const messageRepository = {
  async create(data: Omit<NewChatMessage, "id">): Promise<ChatMessage> {
    const id = generateId();
    const [message] = await db
      .insert(chatMessages)
      .values({ ...data, id })
      .returning();

    // Update conversation's updatedAt
    await db
      .update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, data.conversationId));

    return message;
  },

  async findById(id: string): Promise<ChatMessage | undefined> {
    return db.query.chatMessages.findFirst({
      where: eq(chatMessages.id, id),
    });
  },

  async findByConversationId(conversationId: string): Promise<ChatMessage[]> {
    return db.query.chatMessages.findMany({
      where: eq(chatMessages.conversationId, conversationId),
      orderBy: [asc(chatMessages.createdAt)],
    });
  },

  async delete(id: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  },

  async deleteByConversationId(conversationId: string): Promise<void> {
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId));
  },
};

// ============================================================================
// UPLOADED FILE REPOSITORY
// ============================================================================

export const fileRepository = {
  async create(data: Omit<NewUploadedFile, "id">): Promise<UploadedFile> {
    const id = generateId();
    const [file] = await db
      .insert(uploadedFiles)
      .values({ ...data, id })
      .returning();
    return file;
  },

  async createMany(data: Omit<NewUploadedFile, "id">[]): Promise<UploadedFile[]> {
    const filesWithIds = data.map((file) => ({
      ...file,
      id: generateId(),
    }));
    return db.insert(uploadedFiles).values(filesWithIds).returning();
  },

  async findById(id: string): Promise<UploadedFile | undefined> {
    return db.query.uploadedFiles.findFirst({
      where: eq(uploadedFiles.id, id),
    });
  },

  async findByCourseId(courseId: string): Promise<UploadedFile[]> {
    return db.query.uploadedFiles.findMany({
      where: eq(uploadedFiles.courseId, courseId),
    });
  },

  async markAsProcessed(
    id: string,
    extractedText: string
  ): Promise<UploadedFile | undefined> {
    const [file] = await db
      .update(uploadedFiles)
      .set({ isProcessed: true, extractedText })
      .where(eq(uploadedFiles.id, id))
      .returning();
    return file;
  },

  async delete(id: string): Promise<void> {
    await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
  },
};

// ============================================================================
// USER PROGRESS REPOSITORY
// ============================================================================

export const progressRepository = {
  async create(data: Omit<NewUserProgress, "id">): Promise<UserProgress> {
    const id = generateId();
    const [progress] = await db
      .insert(userProgress)
      .values({ ...data, id })
      .returning();
    return progress;
  },

  async findById(id: string): Promise<UserProgress | undefined> {
    return db.query.userProgress.findFirst({
      where: eq(userProgress.id, id),
    });
  },

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<UserProgress | undefined> {
    return db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, userId),
        eq(userProgress.courseId, courseId)
      ),
    });
  },

  async findByUserId(userId: string): Promise<UserProgress[]> {
    return db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      orderBy: [desc(userProgress.lastAccessedAt)],
    });
  },

  async upsert(
    userId: string,
    courseId: string,
    data: Partial<Omit<NewUserProgress, "id" | "userId" | "courseId">>
  ): Promise<UserProgress> {
    const existing = await this.findByUserAndCourse(userId, courseId);

    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...data,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    }

    return this.create({
      userId,
      courseId,
      ...data,
      lastAccessedAt: new Date(),
    });
  },

  async incrementArticlesRead(
    userId: string,
    courseId: string
  ): Promise<UserProgress> {
    const existing = await this.findByUserAndCourse(userId, courseId);
    const currentCount = existing?.articlesRead ?? 0;

    return this.upsert(userId, courseId, {
      articlesRead: currentCount + 1,
    });
  },

  async incrementFlashcardsReviewed(
    userId: string,
    courseId: string
  ): Promise<UserProgress> {
    const existing = await this.findByUserAndCourse(userId, courseId);
    const currentCount = existing?.flashcardsReviewed ?? 0;

    return this.upsert(userId, courseId, {
      flashcardsReviewed: currentCount + 1,
    });
  },

  async addTimeSpent(
    userId: string,
    courseId: string,
    seconds: number
  ): Promise<UserProgress> {
    const existing = await this.findByUserAndCourse(userId, courseId);
    const currentTime = existing?.totalTimeSpent ?? 0;

    return this.upsert(userId, courseId, {
      totalTimeSpent: currentTime + seconds,
    });
  },

  async delete(id: string): Promise<void> {
    await db.delete(userProgress).where(eq(userProgress.id, id));
  },
};
