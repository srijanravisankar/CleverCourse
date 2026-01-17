"use server";

/**
 * Progress Server Actions
 *
 * These server actions provide the interface between the frontend
 * and the database for user progress tracking.
 */

import { progressRepository } from "@/db/repositories";
import type { UserProgress } from "@/db/types";

// For now, we use a placeholder user ID until auth is implemented
const PLACEHOLDER_USER_ID = "anonymous";

// ============================================================================
// PROGRESS ACTIONS
// ============================================================================

/**
 * Get or create progress for a course
 */
export async function getCourseProgress(
  courseId: string,
): Promise<UserProgress | null> {
  const progress = await progressRepository.findByUserAndCourse(
    PLACEHOLDER_USER_ID,
    courseId,
  );

  if (!progress) {
    // Create initial progress record
    return progressRepository.create({
      userId: PLACEHOLDER_USER_ID,
      courseId,
    });
  }

  return progress;
}

/**
 * Get all progress records for the current user
 */
export async function getAllProgress(): Promise<UserProgress[]> {
  return progressRepository.findByUserId(PLACEHOLDER_USER_ID);
}

/**
 * Increment articles read count
 */
export async function incrementArticlesRead(
  courseId: string,
): Promise<UserProgress> {
  return progressRepository.incrementArticlesRead(
    PLACEHOLDER_USER_ID,
    courseId,
  );
}

/**
 * Increment flashcards reviewed count
 */
export async function incrementFlashcardsReviewed(
  courseId: string,
): Promise<UserProgress> {
  return progressRepository.incrementFlashcardsReviewed(
    PLACEHOLDER_USER_ID,
    courseId,
  );
}

/**
 * Record time spent on a course
 */
export async function addTimeSpent(
  courseId: string,
  seconds: number,
): Promise<UserProgress> {
  return progressRepository.addTimeSpent(
    PLACEHOLDER_USER_ID,
    courseId,
    seconds,
  );
}

/**
 * Update quiz score
 */
export async function updateQuizScore(
  courseId: string,
  score: number,
): Promise<UserProgress> {
  const existing = await progressRepository.findByUserAndCourse(
    PLACEHOLDER_USER_ID,
    courseId,
  );

  const currentQuizzes = existing?.quizzesTaken ?? 0;
  const currentScore = existing?.quizScore ?? 0;

  // Calculate new average score
  const newAverage =
    (currentScore * currentQuizzes + score) / (currentQuizzes + 1);

  return progressRepository.upsert(PLACEHOLDER_USER_ID, courseId, {
    quizzesTaken: currentQuizzes + 1,
    quizScore: newAverage,
  });
}

/**
 * Update last accessed time
 */
export async function updateLastAccessed(
  courseId: string,
): Promise<UserProgress> {
  return progressRepository.upsert(PLACEHOLDER_USER_ID, courseId, {
    lastAccessedAt: new Date(),
  });
}
