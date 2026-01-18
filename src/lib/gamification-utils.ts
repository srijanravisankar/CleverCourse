/**
 * Gamification Utilities & Constants
 * 
 * This module contains constants and utility functions for the gamification system.
 * These are separated from server actions so they can be imported by client components.
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// XP required for each level (exponential curve for satisfying progression)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
const XP_CURVE_BASE = 100;
const XP_CURVE_MULTIPLIER = 1.5;

// XP rewards for different actions
export const XP_REWARDS = {
  quiz_completed: 25,
  section_completed: 100,
  course_completed: 500,
  flashcard_reviewed: 5,
  streak_bonus: 50, // Per day of streak (multiplied)
  achievement_unlocked: 0, // Defined per achievement
  perfect_quiz: 75, // Bonus for 100% quiz
  daily_login: 10,
  level_up_bonus: 25, // Bonus XP per level gained
} as const;

// Sparks rewards
export const SPARKS_REWARDS = {
  section_completed: 5,
  course_completed: 25,
  achievement_unlocked: 0, // Defined per achievement
  perfect_quiz: 10,
  streak_milestone_7: 20,
  streak_milestone_30: 100,
  level_up: 10,
} as const;

// Streak freeze cost in Sparks
export const FREEZE_COST = 50;

// Variable reward chance (20% chance for bonus XP)
export const BONUS_CHANCE = 0.2;
export const BONUS_MULTIPLIER_MIN = 1.2;
export const BONUS_MULTIPLIER_MAX = 2.0;

// ============================================================================
// LEVEL CALCULATIONS
// ============================================================================

/**
 * Calculate the XP required to reach a specific level
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Exponential curve: 100, 250, 475, 812, 1318...
  let totalXp = 0;
  for (let i = 2; i <= level; i++) {
    totalXp += Math.floor(XP_CURVE_BASE * Math.pow(XP_CURVE_MULTIPLIER, i - 2));
  }
  return totalXp;
}

/**
 * Calculate the XP required for the next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  return getXpForLevel(currentLevel + 1);
}

/**
 * Calculate the level for a given XP amount
 */
export function getLevelForXp(xp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

/**
 * Calculate progress percentage within current level
 */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelForXp(xp);
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  return Math.floor((xpInLevel / xpNeeded) * 100);
}

/**
 * Calculate XP progress within current level (0-100%)
 */
export function getXpProgress(xp: number, currentLevel: number): number {
  const xpForCurrent = getXpForLevel(currentLevel);
  const xpForNext = getXpForLevel(currentLevel + 1);
  const xpInLevel = xp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));
}

/**
 * Calculate variable reward bonus (for dopamine hit)
 */
export function calculateVariableReward(baseXp: number): { xp: number; bonusXp: number; gotBonus: boolean } {
  const gotBonus = Math.random() < BONUS_CHANCE;
  if (!gotBonus) {
    return { xp: baseXp, bonusXp: 0, gotBonus: false };
  }
  
  const multiplier = BONUS_MULTIPLIER_MIN + Math.random() * (BONUS_MULTIPLIER_MAX - BONUS_MULTIPLIER_MIN);
  const bonusXp = Math.floor(baseXp * (multiplier - 1));
  return { xp: baseXp + bonusXp, bonusXp, gotBonus: true };
}
