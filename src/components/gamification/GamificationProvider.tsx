"use client";

import { useEffect, useState, useCallback } from "react";
import { useGamificationStore } from "@/store/use-gamification-store";
import { getGamificationStats } from "@/app/actions/gamification";
import {
  seedAchievements,
  checkAchievementsSeeded,
} from "@/app/actions/seed-gamification";
import { LevelUpModal } from "./LevelUpModal";
import { AchievementToast, XPGainToast } from "./AchievementToast";
import { getXpForNextLevel } from "@/lib/gamification-utils";

interface GamificationProviderProps {
  children: React.ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const {
    stats,
    setStats,
    setIsLoading,
    showLevelUpModal,
    levelUpData,
    dismissLevelUp,
    pendingXpAnimation,
    clearXpAnimation,
    achievementQueue,
    removeAchievementFromQueue,
    showFreezeUsedNotification,
    dismissFreezeNotification,
  } = useGamificationStore();

  const [showXpToast, setShowXpToast] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<
    (typeof achievementQueue)[0] | null
  >(null);

  // Load initial stats and seed achievements if needed
  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check and seed achievements if needed
      const isSeeded = await checkAchievementsSeeded();
      if (!isSeeded) {
        await seedAchievements();
      }

      const result = await getGamificationStats();
      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error("Failed to load gamification stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle XP animation
  useEffect(() => {
    if (pendingXpAnimation) {
      setShowXpToast(true);
    }
  }, [pendingXpAnimation]);

  // Handle achievement queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      const next = removeAchievementFromQueue();
      if (next) {
        setCurrentAchievement(next);
      }
    }
  }, [achievementQueue, currentAchievement, removeAchievementFromQueue]);

  const handleXpToastComplete = () => {
    setShowXpToast(false);
    clearXpAnimation();
  };

  const handleAchievementClose = () => {
    setCurrentAchievement(null);
  };

  return (
    <>
      {children}

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={dismissLevelUp}
        level={levelUpData?.newLevel ?? 1}
        xpToNext={
          levelUpData
            ? getXpForNextLevel(levelUpData.newLevel) - (stats?.xpTotal ?? 0)
            : 0
        }
      />

      {/* XP Gain Toast */}
      {pendingXpAnimation && (
        <XPGainToast
          amount={pendingXpAnimation.amount + pendingXpAnimation.bonusAmount}
          reason={pendingXpAnimation.reason}
          isVisible={showXpToast}
          onComplete={handleXpToastComplete}
        />
      )}

      {/* Achievement Toast */}
      <AchievementToast
        isOpen={!!currentAchievement}
        onClose={handleAchievementClose}
        achievement={
          currentAchievement
            ? {
                name: currentAchievement.name,
                description: currentAchievement.description,
                icon: currentAchievement.iconName,
                xpReward: currentAchievement.xpReward,
                currencyReward: currentAchievement.sparksReward,
              }
            : null
        }
      />

      {/* Freeze Used Notification */}
      {showFreezeUsedNotification && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-4 py-2 flex items-center gap-2"
          onClick={dismissFreezeNotification}
        >
          <span className="text-cyan-400">
            ❄️ Streak freeze used! Your streak is protected.
          </span>
        </div>
      )}
    </>
  );
}
