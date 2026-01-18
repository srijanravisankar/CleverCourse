import { create } from "zustand";
import type { GamificationStats, Achievement, AwardXpResult } from "@/db/types";

interface GamificationState {
  // Stats
  stats: GamificationStats | null;
  setStats: (stats: GamificationStats | null) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Level up modal
  showLevelUpModal: boolean;
  levelUpData: { previousLevel: number; newLevel: number } | null;
  triggerLevelUp: (previousLevel: number, newLevel: number) => void;
  dismissLevelUp: () => void;

  // XP animation
  pendingXpAnimation: {
    amount: number;
    bonusAmount: number;
    reason: string;
  } | null;
  triggerXpAnimation: (
    amount: number,
    bonusAmount: number,
    reason: string,
  ) => void;
  clearXpAnimation: () => void;

  // Achievement notifications queue
  achievementQueue: Achievement[];
  addAchievementToQueue: (achievement: Achievement) => void;
  removeAchievementFromQueue: () => Achievement | undefined;
  clearAchievementQueue: () => void;

  // Streak freeze notification
  showFreezeUsedNotification: boolean;
  triggerFreezeNotification: () => void;
  dismissFreezeNotification: () => void;

  // Process XP result (handles all animations and notifications)
  processXpResult: (result: AwardXpResult) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  stats: null,
  isLoading: true,
  showLevelUpModal: false,
  levelUpData: null,
  pendingXpAnimation: null,
  achievementQueue: [] as Achievement[],
  showFreezeUsedNotification: false,
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  ...initialState,

  setStats: (stats) => set({ stats }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Level up modal
  triggerLevelUp: (previousLevel, newLevel) =>
    set({
      showLevelUpModal: true,
      levelUpData: { previousLevel, newLevel },
    }),
  dismissLevelUp: () => set({ showLevelUpModal: false, levelUpData: null }),

  // XP animation
  triggerXpAnimation: (amount, bonusAmount, reason) =>
    set({ pendingXpAnimation: { amount, bonusAmount, reason } }),
  clearXpAnimation: () => set({ pendingXpAnimation: null }),

  // Achievement queue
  addAchievementToQueue: (achievement) =>
    set((state) => ({
      achievementQueue: [...state.achievementQueue, achievement],
    })),
  removeAchievementFromQueue: () => {
    const queue = get().achievementQueue;
    if (queue.length === 0) return undefined;
    const [first, ...rest] = queue;
    set({ achievementQueue: rest });
    return first;
  },
  clearAchievementQueue: () => set({ achievementQueue: [] }),

  // Freeze notification
  triggerFreezeNotification: () => set({ showFreezeUsedNotification: true }),
  dismissFreezeNotification: () => set({ showFreezeUsedNotification: false }),

  // Process a full XP result
  processXpResult: (result: AwardXpResult) => {
    const {
      triggerXpAnimation,
      triggerLevelUp,
      addAchievementToQueue,
      setStats,
      stats,
    } = get();

    // Trigger XP animation
    if (result.xpAwarded > 0) {
      triggerXpAnimation(result.xpAwarded, result.bonusXp, "XP earned!");
    }

    // Trigger level up modal
    if (result.leveledUp) {
      triggerLevelUp(result.previousLevel, result.newLevel);
    }

    // Queue achievements
    for (const achievement of result.unlockedAchievements) {
      addAchievementToQueue(achievement);
    }

    // Update stats
    if (stats) {
      setStats({
        ...stats,
        xpTotal: result.newTotal,
        currentLevel: result.newLevel,
        xpForCurrentLevel: result.xpForCurrentLevel,
        xpForNextLevel: result.xpForNextLevel,
        xpProgress: Math.min(
          100,
          Math.floor(
            ((result.newTotal - result.xpForCurrentLevel) /
              (result.xpForNextLevel - result.xpForCurrentLevel)) *
              100,
          ),
        ),
        currentStreak: result.currentStreak,
      });
    }
  },

  reset: () => set(initialState),
}));
