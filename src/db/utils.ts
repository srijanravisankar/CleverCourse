/**
 * Database Utilities
 * 
 * Helper functions for working with the database.
 */

import type {
  MindMapData,
  ParsedMindMap,
  ParsedMcqQuestion,
  MindMap,
  McqQuestion,
} from "./types";

// ============================================================================
// JSON PARSING UTILITIES
// ============================================================================

/**
 * Parse a mind map's data from JSON string to object
 */
export function parseMindMap(mindMap: MindMap): ParsedMindMap {
  return {
    ...mindMap,
    data: JSON.parse(mindMap.data) as MindMapData,
  };
}

/**
 * Parse an MCQ's options from JSON string to array
 */
export function parseMcqQuestion(mcq: McqQuestion): ParsedMcqQuestion {
  return {
    ...mcq,
    options: JSON.parse(mcq.options) as string[],
  };
}

/**
 * Safely parse JSON, returning null if invalid
 */
export function safeParseJson<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format a date for display
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format time spent (in seconds) to a human-readable string
 */
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// ============================================================================
// PROGRESS UTILITIES
// ============================================================================

/**
 * Calculate completion percentage
 */
export function calculateCompletion(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get a progress color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 50) return "text-yellow-500";
  if (percentage >= 20) return "text-orange-500";
  return "text-red-500";
}

// ============================================================================
// QUIZ UTILITIES
// ============================================================================

/**
 * Calculate quiz score from attempted questions
 */
export function calculateQuizScore(
  questions: Array<{ isAttempted: boolean; isCorrect: boolean | null }>
): { score: number; attempted: number; total: number } {
  const attempted = questions.filter((q) => q.isAttempted).length;
  const correct = questions.filter((q) => q.isCorrect === true).length;
  const score = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return {
    score,
    attempted,
    total: questions.length,
  };
}

/**
 * Shuffle an array (for randomizing quiz questions/options)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
