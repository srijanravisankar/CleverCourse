"use server";

/**
 * Gamification Engine - Server Actions
 *
 * This module provides the core gamification logic for CleverCourse:
 * - XP awarding with variable rewards (dopamine hit for ADHD users)
 * - Level progression with smooth curves
 * - Streak maintenance with freeze protection
 * - Achievement unlocking
 * - Sparks currency system
 */

import {
  gamificationRepository,
  achievementRepository,
  userAchievementRepository,
  xpTransactionRepository,
} from "@/db/repositories";
import type {
  Achievement,
  AwardXpResult,
  GamificationStats,
  AchievementWithStatus,
  XpReason,
} from "@/db/types";
import { getCurrentUserId } from "./auth";
import {
  XP_REWARDS,
  SPARKS_REWARDS,
  FREEZE_COST,
  BONUS_CHANCE,
  BONUS_MULTIPLIER_MIN,
  BONUS_MULTIPLIER_MAX,
  getXpForLevel,
  getXpForNextLevel,
  getLevelForXp,
  getXpProgress,
} from "@/lib/gamification-utils";

// ============================================================================
// VARIABLE REWARDS (ADHD Dopamine Optimization)
// ============================================================================

/**
 * Calculate bonus XP with variable reward chance
 * 20% chance for 1.2x-2.0x bonus (keeps it exciting!)
 */
function calculateBonusXp(baseXp: number): number {
  if (Math.random() < BONUS_CHANCE) {
    const multiplier =
      BONUS_MULTIPLIER_MIN +
      Math.random() * (BONUS_MULTIPLIER_MAX - BONUS_MULTIPLIER_MIN);
    return Math.floor(baseXp * multiplier) - baseXp;
  }
  return 0;
}

// ============================================================================
// STREAK LOGIC
// ============================================================================

/**
 * Check if a streak is still valid (within 24-48 hours of last activity)
 */
function isStreakValid(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;

  const now = new Date();
  const lastActivity = new Date(lastActivityDate);

  // Get dates without time for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate(),
  );

  const diffDays = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Streak is valid if activity was today or yesterday
  return diffDays <= 1;
}

/**
 * Check if user has already been active today (for streak counting)
 */
function wasActiveToday(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;

  const now = new Date();
  const lastActivity = new Date(lastActivityDate);

  return (
    now.getFullYear() === lastActivity.getFullYear() &&
    now.getMonth() === lastActivity.getMonth() &&
    now.getDate() === lastActivity.getDate()
  );
}

// ============================================================================
// MAIN XP AWARD FUNCTION
// ============================================================================

/**
 * Award XP to a user with full gamification processing
 *
 * This is the main function that handles:
 * - XP awarding with variable bonus chance
 * - Level up detection
 * - Streak maintenance
 * - Achievement checking
 * - Sparks rewards
 */
export async function awardXp(
  reason: XpReason,
  referenceId?: string,
  referenceType?: string,
): Promise<AwardXpResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Get or create gamification record
  const gamification = await gamificationRepository.getOrCreate(userId);
  const previousLevel = gamification.currentLevel;

  // Calculate base XP
  const baseXp = XP_REWARDS[reason] || 0;
  const bonusXp = calculateBonusXp(baseXp);
  const totalXp = baseXp + bonusXp;

  // Update XP total
  const newTotal = gamification.xpTotal + totalXp;
  const newLevel = getLevelForXp(newTotal);
  const leveledUp = newLevel > previousLevel;

  // Update streak
  let currentStreak = gamification.currentStreak;
  let streakUpdated = false;

  if (!wasActiveToday(gamification.lastActivityDate)) {
    // First activity of the day
    if (isStreakValid(gamification.lastActivityDate)) {
      // Continue streak
      currentStreak += 1;
      streakUpdated = true;
    } else if (
      gamification.freezesAvailable > 0 &&
      gamification.currentStreak > 0
    ) {
      // Use freeze to save streak
      await gamificationRepository.useFreeze(userId);
      streakUpdated = true;
      // Streak stays the same but freeze is consumed
    } else {
      // Streak broken, reset
      currentStreak = 1;
      streakUpdated = true;
    }
  }

  // Update gamification record
  await gamificationRepository.update(userId, {
    xpTotal: newTotal,
    currentLevel: newLevel,
    currentStreak,
    longestStreak: Math.max(gamification.longestStreak, currentStreak),
    lastActivityDate: new Date(),
  });

  // Record the transaction
  await xpTransactionRepository.create({
    userId,
    amount: baseXp,
    bonusAmount: bonusXp,
    reason,
    referenceId,
    referenceType,
  });

  // Award level-up bonus XP and Sparks
  if (leveledUp) {
    const levelUpBonus = XP_REWARDS.level_up_bonus * (newLevel - previousLevel);
    await gamificationRepository.addXp(userId, levelUpBonus);
    await gamificationRepository.addSparks(
      userId,
      SPARKS_REWARDS.level_up * (newLevel - previousLevel),
    );

    await xpTransactionRepository.create({
      userId,
      amount: levelUpBonus,
      bonusAmount: 0,
      reason: "level_up_bonus",
    });
  }

  // Award sparks based on reason
  const sparksReward = getSparksForReason(reason);
  if (sparksReward > 0) {
    await gamificationRepository.addSparks(userId, sparksReward);
  }

  // Check for streak milestones
  if (currentStreak === 7) {
    await gamificationRepository.addSparks(
      userId,
      SPARKS_REWARDS.streak_milestone_7,
    );
  } else if (currentStreak === 30) {
    await gamificationRepository.addSparks(
      userId,
      SPARKS_REWARDS.streak_milestone_30,
    );
  }

  // Check and unlock achievements
  const unlockedAchievements = await checkAndUnlockAchievements(userId);

  // Get updated gamification for response
  const updated = await gamificationRepository.getOrCreate(userId);

  return {
    success: true,
    xpAwarded: baseXp,
    bonusXp,
    newTotal: updated.xpTotal,
    leveledUp,
    newLevel,
    previousLevel,
    xpForCurrentLevel: getXpForLevel(newLevel),
    xpForNextLevel: getXpForLevel(newLevel + 1),
    unlockedAchievements,
    streakUpdated,
    currentStreak: updated.currentStreak,
  };
}

function getSparksForReason(reason: XpReason): number {
  switch (reason) {
    case "section_completed":
      return SPARKS_REWARDS.section_completed;
    case "course_completed":
      return SPARKS_REWARDS.course_completed;
    case "perfect_quiz":
      return SPARKS_REWARDS.perfect_quiz;
    default:
      return 0;
  }
}

// ============================================================================
// STREAK MANAGEMENT
// ============================================================================

/**
 * Maintain streak - call this on daily login or activity
 * Handles freeze logic automatically
 */
export async function maintainStreak(): Promise<{
  success: boolean;
  currentStreak: number;
  freezeUsed: boolean;
  streakBroken: boolean;
}> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const gamification = await gamificationRepository.getOrCreate(userId);

  // Already active today
  if (wasActiveToday(gamification.lastActivityDate)) {
    return {
      success: true,
      currentStreak: gamification.currentStreak,
      freezeUsed: false,
      streakBroken: false,
    };
  }

  // Check if streak is still valid
  if (isStreakValid(gamification.lastActivityDate)) {
    // Continue streak
    await gamificationRepository.updateStreak(
      userId,
      gamification.currentStreak + 1,
    );
    return {
      success: true,
      currentStreak: gamification.currentStreak + 1,
      freezeUsed: false,
      streakBroken: false,
    };
  }

  // Streak would be broken - check for freeze
  if (gamification.freezesAvailable > 0 && gamification.currentStreak > 0) {
    await gamificationRepository.useFreeze(userId);
    await gamificationRepository.update(userId, {
      lastActivityDate: new Date(),
    });
    return {
      success: true,
      currentStreak: gamification.currentStreak,
      freezeUsed: true,
      streakBroken: false,
    };
  }

  // Streak is broken
  await gamificationRepository.updateStreak(userId, 1);
  return {
    success: true,
    currentStreak: 1,
    freezeUsed: false,
    streakBroken: gamification.currentStreak > 0,
  };
}

// ============================================================================
// PURCHASES
// ============================================================================

/**
 * Purchase a streak freeze with Sparks
 */
export async function purchaseStreakFreeze(): Promise<{
  success: boolean;
  error?: string;
  newFreezeCount?: number;
  newSparksBalance?: number;
}> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const result = await gamificationRepository.purchaseFreeze(
    userId,
    FREEZE_COST,
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const updated = await gamificationRepository.getOrCreate(userId);
  return {
    success: true,
    newFreezeCount: updated.freezesAvailable,
    newSparksBalance: updated.sparks,
  };
}

// ============================================================================
// ACHIEVEMENT CHECKING
// ============================================================================

/**
 * Check all achievements and unlock any that are newly earned
 */
async function checkAndUnlockAchievements(
  userId: string,
): Promise<Achievement[]> {
  const gamification = await gamificationRepository.getOrCreate(userId);
  const allAchievements = await achievementRepository.findAll();
  const unlockedIds = new Set(
    (await userAchievementRepository.findByUserId(userId)).map(
      (ua) => ua.achievementId,
    ),
  );

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.conditionType) {
      case "sections_completed":
        shouldUnlock =
          gamification.totalSectionsCompleted >= achievement.conditionValue;
        break;
      case "courses_completed":
        shouldUnlock =
          gamification.totalCoursesCompleted >= achievement.conditionValue;
        break;
      case "streak_days":
        shouldUnlock = gamification.currentStreak >= achievement.conditionValue;
        break;
      case "quizzes_passed":
        shouldUnlock =
          gamification.totalQuizzesPassed >= achievement.conditionValue;
        break;
      case "perfect_quizzes":
        shouldUnlock =
          gamification.perfectQuizzes >= achievement.conditionValue;
        break;
      case "flashcards_reviewed":
        shouldUnlock =
          gamification.totalFlashcardsReviewed >= achievement.conditionValue;
        break;
      case "xp_earned":
        shouldUnlock = gamification.xpTotal >= achievement.conditionValue;
        break;
      case "level_reached":
        shouldUnlock = gamification.currentLevel >= achievement.conditionValue;
        break;
    }

    if (shouldUnlock) {
      await userAchievementRepository.create(userId, achievement.id);

      // Award achievement rewards
      if (achievement.xpReward > 0) {
        await gamificationRepository.addXp(userId, achievement.xpReward);
      }
      if (achievement.sparksReward > 0) {
        await gamificationRepository.addSparks(
          userId,
          achievement.sparksReward,
        );
      }

      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// ============================================================================
// STAT INCREMENT FUNCTIONS
// ============================================================================

/**
 * Increment section completed count and award XP
 */
export async function onSectionCompleted(
  sectionId: string,
): Promise<AwardXpResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await gamificationRepository.incrementStat(userId, "totalSectionsCompleted");
  return awardXp("section_completed", sectionId, "section");
}

/**
 * Increment quiz passed count and award XP
 */
export async function onQuizCompleted(
  quizId: string,
  isPerfect: boolean,
): Promise<AwardXpResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await gamificationRepository.incrementStat(userId, "totalQuizzesPassed");

  if (isPerfect) {
    await gamificationRepository.incrementStat(userId, "perfectQuizzes");
    return awardXp("perfect_quiz", quizId, "quiz");
  }

  return awardXp("quiz_completed", quizId, "quiz");
}

/**
 * Increment course completed count and award XP
 */
export async function onCourseCompleted(
  courseId: string,
): Promise<AwardXpResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await gamificationRepository.incrementStat(userId, "totalCoursesCompleted");
  return awardXp("course_completed", courseId, "course");
}

/**
 * Increment flashcard reviewed count and award XP
 */
export async function onFlashcardReviewed(
  flashcardId: string,
): Promise<AwardXpResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await gamificationRepository.incrementStat(userId, "totalFlashcardsReviewed");
  return awardXp("flashcard_reviewed", flashcardId, "flashcard");
}

// ============================================================================
// DATA RETRIEVAL
// ============================================================================

/**
 * Get the user's gamification stats
 */
export async function getGamificationStats(): Promise<GamificationStats | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const gamification = await gamificationRepository.getOrCreate(userId);

  return {
    xpTotal: gamification.xpTotal,
    currentLevel: gamification.currentLevel,
    xpForCurrentLevel: getXpForLevel(gamification.currentLevel),
    xpForNextLevel: getXpForLevel(gamification.currentLevel + 1),
    xpProgress: getXpProgress(gamification.xpTotal, gamification.currentLevel),
    currentStreak: gamification.currentStreak,
    longestStreak: gamification.longestStreak,
    sparks: gamification.sparks,
    freezesAvailable: gamification.freezesAvailable,
    freezeUsedToday: gamification.freezeUsedToday,
    totalSectionsCompleted: gamification.totalSectionsCompleted,
    totalQuizzesPassed: gamification.totalQuizzesPassed,
    totalCoursesCompleted: gamification.totalCoursesCompleted,
    perfectQuizzes: gamification.perfectQuizzes,
  };
}

/**
 * Get all achievements with unlock status for the current user
 */
export async function getAchievementsWithStatus(): Promise<
  AchievementWithStatus[]
> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const gamification = await gamificationRepository.getOrCreate(userId);
  const allAchievements = await achievementRepository.findAll();
  const userAchievementsList =
    await userAchievementRepository.findByUserId(userId);
  const unlockedMap = new Map(
    userAchievementsList.map((ua) => [ua.achievementId, ua.unlockedAt]),
  );

  return allAchievements.map((achievement) => {
    const unlockedAt = unlockedMap.get(achievement.id) as Date | undefined;
    const isUnlocked = !!unlockedAt;

    // Calculate progress towards achievement
    let currentValue = 0;
    switch (achievement.conditionType) {
      case "sections_completed":
        currentValue = gamification.totalSectionsCompleted;
        break;
      case "courses_completed":
        currentValue = gamification.totalCoursesCompleted;
        break;
      case "streak_days":
        currentValue = gamification.currentStreak;
        break;
      case "quizzes_passed":
        currentValue = gamification.totalQuizzesPassed;
        break;
      case "perfect_quizzes":
        currentValue = gamification.perfectQuizzes;
        break;
      case "flashcards_reviewed":
        currentValue = gamification.totalFlashcardsReviewed;
        break;
      case "xp_earned":
        currentValue = gamification.xpTotal;
        break;
      case "level_reached":
        currentValue = gamification.currentLevel;
        break;
    }

    const progress = isUnlocked
      ? 100
      : Math.min(
          100,
          Math.floor((currentValue / achievement.conditionValue) * 100),
        );

    return {
      ...achievement,
      isUnlocked,
      unlockedAt: unlockedAt ? new Date(unlockedAt) : null,
      progress,
      currentValue,
    };
  });
}

/**
 * Get unseen achievements (for notification display)
 */
export async function getUnseenAchievements(): Promise<Achievement[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const unseen = await userAchievementRepository.getUnseenAchievements(userId);
  return unseen.map((ua) => ua.achievement);
}

/**
 * Mark an achievement as seen
 */
export async function markAchievementSeen(
  achievementId: string,
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  await userAchievementRepository.markAsSeen(userId, achievementId);
}

/**
 * Get recent XP transactions
 */
export async function getXpHistory(limit = 20): Promise<
  {
    amount: number;
    bonusAmount: number;
    reason: string;
    createdAt: Date;
  }[]
> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const transactions = await xpTransactionRepository.findByUserId(
    userId,
    limit,
  );
  return transactions.map((t) => ({
    amount: t.amount,
    bonusAmount: t.bonusAmount,
    reason: t.reason,
    createdAt: t.createdAt,
  }));
}
