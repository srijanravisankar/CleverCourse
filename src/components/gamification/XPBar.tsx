"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamificationStore } from "@/store/use-gamification-store";

interface XPBarProps {
  className?: string;
  showLevel?: boolean;
  compact?: boolean;
}

export function XPBar({ className, showLevel = true, compact = false }: XPBarProps) {
  const { stats, pendingXpAnimation, clearXpAnimation } = useGamificationStore();
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [displayProgress, setDisplayProgress] = React.useState(0);

  // Animate progress on mount and when stats change
  React.useEffect(() => {
    if (stats) {
      // Delay for smooth animation
      const timer = setTimeout(() => {
        setDisplayProgress(stats.xpProgress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stats]);

  // Handle XP animation
  React.useEffect(() => {
    if (pendingXpAnimation) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        clearXpAnimation();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingXpAnimation, clearXpAnimation]);

  if (!stats) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-2 bg-muted rounded-full" />
      </div>
    );
  }

  const xpInLevel = stats.xpTotal - stats.xpForCurrentLevel;
  const xpNeeded = stats.xpForNextLevel - stats.xpForCurrentLevel;

  return (
    <div className={cn("relative", className)}>
      {/* Level badge and XP info */}
      {showLevel && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <motion.div
              className={cn(
                "flex items-center justify-center rounded-md font-bold text-xs",
                compact ? "w-6 h-6" : "w-8 h-8",
                "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm"
              )}
              animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {stats.currentLevel}
            </motion.div>
            <span className="text-xs text-muted-foreground">
              Level {stats.currentLevel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{xpInLevel.toLocaleString()}</span>
            <span>/</span>
            <span>{xpNeeded.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className={cn(
        "relative w-full bg-muted rounded-full overflow-hidden",
        compact ? "h-1.5" : "h-2.5"
      )}>
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Shimmer effect when animating */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: 2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* XP popup animation */}
      <AnimatePresence>
        {pendingXpAnimation && (
          <motion.div
            className="absolute -top-6 right-0 flex items-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-bold text-amber-500">
              +{pendingXpAnimation.amount}
            </span>
            {pendingXpAnimation.bonusAmount > 0 && (
              <motion.span
                className="text-xs font-bold text-green-500"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                +{pendingXpAnimation.bonusAmount} BONUS!
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
