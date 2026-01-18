"use server";

/**
 * Course Progress Server Actions
 *
 * This module handles tracking user progress through courses:
 * - Mark content as completed
 * - Get completion status for content items
 * - Get course-level progress stats
 * - Reset course progress
 */

import { db } from "@/db";
import { userContentCompletions, userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUserId } from "./auth";
import { v4 as uuidv4 } from "uuid";

// Content types that can be completed
export type ContentType =
  | "article"
  | "flashcard"
  | "mindmap"
  | "mcq"
  | "truefalse"
  | "fillup";

// XP rewards per content type
const XP_PER_TYPE: Record<ContentType, number> = {
  article: 10,
  flashcard: 5,
  mindmap: 20,
  mcq: 15,
  truefalse: 15,
  fillup: 15,
};

// ============================================================================
// MARK CONTENT AS COMPLETED
// ============================================================================

export interface MarkCompleteResult {
  success: boolean;
  alreadyCompleted: boolean;
  xpAwarded: number;
  error?: string;
}

/**
 * Mark a specific content item as completed for the current user
 */
export async function markContentCompleted(
  courseId: string,
  sectionId: string,
  contentType: ContentType,
  contentId: string,
  isCorrect?: boolean,
): Promise<MarkCompleteResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        alreadyCompleted: false,
        xpAwarded: 0,
        error: "Not authenticated",
      };
    }

    // Check if already completed
    const existing = await db
      .select()
      .from(userContentCompletions)
      .where(
        and(
          eq(userContentCompletions.userId, userId),
          eq(userContentCompletions.contentId, contentId),
          eq(userContentCompletions.contentType, contentType),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyCompleted: true, xpAwarded: 0 };
    }

    // Calculate XP
    const xpAwarded = XP_PER_TYPE[contentType];

    // Insert completion record
    await db.insert(userContentCompletions).values({
      id: uuidv4(),
      userId,
      courseId,
      sectionId,
      contentType,
      contentId,
      isCorrect: isCorrect ?? null,
      xpAwarded,
      completedAt: new Date(),
    });

    // Update user progress aggregate
    await updateUserProgress(userId, courseId, contentType);

    return { success: true, alreadyCompleted: false, xpAwarded };
  } catch (error) {
    console.error("Error marking content complete:", error);
    return {
      success: false,
      alreadyCompleted: false,
      xpAwarded: 0,
      error: "Failed to mark complete",
    };
  }
}

/**
 * Update the aggregate user progress for a course
 */
async function updateUserProgress(
  userId: string,
  courseId: string,
  contentType: ContentType,
): Promise<void> {
  // Check if user progress record exists
  const existing = await db
    .select()
    .from(userProgress)
    .where(
      and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId)),
    )
    .limit(1);

  if (existing.length === 0) {
    // Create new progress record
    await db.insert(userProgress).values({
      id: uuidv4(),
      userId,
      courseId,
      articlesRead: contentType === "article" ? 1 : 0,
      flashcardsReviewed: contentType === "flashcard" ? 1 : 0,
      quizzesTaken: ["mcq", "truefalse", "fillup"].includes(contentType)
        ? 1
        : 0,
      lastAccessedAt: new Date(),
    });
  } else {
    // Update existing record
    const updateData: Record<string, unknown> = {
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    };

    if (contentType === "article") {
      updateData.articlesRead = existing[0].articlesRead + 1;
    } else if (contentType === "flashcard") {
      updateData.flashcardsReviewed = existing[0].flashcardsReviewed + 1;
    } else if (["mcq", "truefalse", "fillup"].includes(contentType)) {
      updateData.quizzesTaken = existing[0].quizzesTaken + 1;
    }

    await db
      .update(userProgress)
      .set(updateData)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.courseId, courseId),
        ),
      );
  }
}

// ============================================================================
// CHECK IF CONTENT IS COMPLETED
// ============================================================================

/**
 * Check if a specific content item is completed for the current user
 */
export async function isContentCompleted(
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const existing = await db
      .select()
      .from(userContentCompletions)
      .where(
        and(
          eq(userContentCompletions.userId, userId),
          eq(userContentCompletions.contentId, contentId),
          eq(userContentCompletions.contentType, contentType),
        ),
      )
      .limit(1);

    return existing.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get all completed content IDs for a course by type
 */
export async function getCompletedContentIds(
  courseId: string,
  contentType?: ContentType,
): Promise<string[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    let query = db
      .select({ contentId: userContentCompletions.contentId })
      .from(userContentCompletions)
      .where(
        and(
          eq(userContentCompletions.userId, userId),
          eq(userContentCompletions.courseId, courseId),
        ),
      );

    if (contentType) {
      query = db
        .select({ contentId: userContentCompletions.contentId })
        .from(userContentCompletions)
        .where(
          and(
            eq(userContentCompletions.userId, userId),
            eq(userContentCompletions.courseId, courseId),
            eq(userContentCompletions.contentType, contentType),
          ),
        );
    }

    const completions = await query;
    return completions.map((c) => c.contentId);
  } catch {
    return [];
  }
}

// ============================================================================
// GET COURSE PROGRESS STATS
// ============================================================================

export interface CourseProgressStats {
  totalXpEarned: number;
  articlesCompleted: number;
  flashcardsCompleted: number;
  mindmapsCompleted: number;
  mcqCompleted: number;
  trueFalseCompleted: number;
  fillUpCompleted: number;
  totalQuizCorrect: number;
  totalQuizAttempted: number;
  completedContentIds: string[];
}

/**
 * Get comprehensive progress stats for a course
 */
export async function getCourseProgressStats(
  courseId: string,
): Promise<CourseProgressStats> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        totalXpEarned: 0,
        articlesCompleted: 0,
        flashcardsCompleted: 0,
        mindmapsCompleted: 0,
        mcqCompleted: 0,
        trueFalseCompleted: 0,
        fillUpCompleted: 0,
        totalQuizCorrect: 0,
        totalQuizAttempted: 0,
        completedContentIds: [],
      };
    }

    // Get all completions for this course
    const completions = await db
      .select()
      .from(userContentCompletions)
      .where(
        and(
          eq(userContentCompletions.userId, userId),
          eq(userContentCompletions.courseId, courseId),
        ),
      );

    // Calculate stats
    const stats: CourseProgressStats = {
      totalXpEarned: 0,
      articlesCompleted: 0,
      flashcardsCompleted: 0,
      mindmapsCompleted: 0,
      mcqCompleted: 0,
      trueFalseCompleted: 0,
      fillUpCompleted: 0,
      totalQuizCorrect: 0,
      totalQuizAttempted: 0,
      completedContentIds: [],
    };

    for (const completion of completions) {
      stats.totalXpEarned += completion.xpAwarded;
      stats.completedContentIds.push(completion.contentId);

      switch (completion.contentType) {
        case "article":
          stats.articlesCompleted++;
          break;
        case "flashcard":
          stats.flashcardsCompleted++;
          break;
        case "mindmap":
          stats.mindmapsCompleted++;
          break;
        case "mcq":
          stats.mcqCompleted++;
          stats.totalQuizAttempted++;
          if (completion.isCorrect) stats.totalQuizCorrect++;
          break;
        case "truefalse":
          stats.trueFalseCompleted++;
          stats.totalQuizAttempted++;
          if (completion.isCorrect) stats.totalQuizCorrect++;
          break;
        case "fillup":
          stats.fillUpCompleted++;
          stats.totalQuizAttempted++;
          if (completion.isCorrect) stats.totalQuizCorrect++;
          break;
      }
    }

    return stats;
  } catch (error) {
    console.error("Error getting course progress:", error);
    return {
      totalXpEarned: 0,
      articlesCompleted: 0,
      flashcardsCompleted: 0,
      mindmapsCompleted: 0,
      mcqCompleted: 0,
      trueFalseCompleted: 0,
      fillUpCompleted: 0,
      totalQuizCorrect: 0,
      totalQuizAttempted: 0,
      completedContentIds: [],
    };
  }
}

// ============================================================================
// RESET COURSE PROGRESS
// ============================================================================

export interface ResetProgressResult {
  success: boolean;
  itemsReset: number;
  error?: string;
}

/**
 * Reset all progress for a specific course
 */
export async function resetCourseProgress(
  courseId: string,
): Promise<ResetProgressResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, itemsReset: 0, error: "Not authenticated" };
    }

    // Count items to reset
    const completions = await db
      .select({ id: userContentCompletions.id })
      .from(userContentCompletions)
      .where(
        and(
          eq(userContentCompletions.userId, userId),
          eq(userContentCompletions.courseId, courseId),
        ),
      );

    const itemsReset = completions.length;

    // Delete all completions for this course
    await db
      .delete(userContentCompletions)
      .where(
        and(
          eq(userContentCompletions.userId, userId),
          eq(userContentCompletions.courseId, courseId),
        ),
      );

    // Reset user progress aggregate
    await db
      .delete(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.courseId, courseId),
        ),
      );

    return { success: true, itemsReset };
  } catch (error) {
    console.error("Error resetting course progress:", error);
    return { success: false, itemsReset: 0, error: "Failed to reset progress" };
  }
}
