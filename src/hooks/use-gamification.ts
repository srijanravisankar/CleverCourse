import { useCallback } from "react";
import { useGamificationStore } from "@/store/use-gamification-store";
import { getGamificationStats } from "@/app/actions/gamification";
import type { AwardXpResult } from "@/db/types";

/**
 * Hook to handle gamification results from server actions
 *
 * Usage:
 * const { handleGamificationResult, refreshStats } = useGamification();
 *
 * // After an action that returns gamification data
 * const result = await markSectionComplete(sectionId);
 * if (result.gamification) {
 *   handleGamificationResult(result.gamification);
 * }
 */
export function useGamification() {
  const {
    setStats,
    processXpResult,
    triggerLevelUp,
    triggerXpAnimation,
    addAchievementToQueue,
  } = useGamificationStore();

  /**
   * Process a gamification result from a server action
   * This will trigger all appropriate animations and notifications
   */
  const handleGamificationResult = useCallback(
    (result: AwardXpResult) => {
      processXpResult(result);
    },
    [processXpResult],
  );

  /**
   * Refresh gamification stats from the server
   */
  const refreshStats = useCallback(async () => {
    try {
      const stats = await getGamificationStats();
      if (stats) {
        setStats(stats);
      }
    } catch (error) {
      console.error("Failed to refresh gamification stats:", error);
    }
  }, [setStats]);

  /**
   * Manually trigger an XP animation (for custom rewards)
   */
  const showXpGain = useCallback(
    (amount: number, reason: string, bonus: number = 0) => {
      triggerXpAnimation(amount, bonus, reason);
    },
    [triggerXpAnimation],
  );

  /**
   * Manually trigger a level up celebration
   */
  const showLevelUp = useCallback(
    (previousLevel: number, newLevel: number) => {
      triggerLevelUp(previousLevel, newLevel);
    },
    [triggerLevelUp],
  );

  return {
    handleGamificationResult,
    refreshStats,
    showXpGain,
    showLevelUp,
  };
}
