"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  freezesAvailable: number;
  isProtected?: boolean;
  size?: "sm" | "md" | "lg";
  showFreezes?: boolean;
  className?: string;
}

export function StreakCounter({
  streak,
  freezesAvailable,
  isProtected = false,
  size = "md",
  showFreezes = true,
  className,
}: StreakCounterProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-lg gap-2",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const flameColors = {
    cold: "text-slate-400",
    warm: "text-orange-400",
    hot: "text-orange-500",
    blazing: "text-red-500",
  };

  const getFlameColor = () => {
    if (streak === 0) return flameColors.cold;
    if (streak < 7) return flameColors.warm;
    if (streak < 30) return flameColors.hot;
    return flameColors.blazing;
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      {/* Streak flame */}
      <motion.div
        className="relative flex items-center"
        animate={
          streak > 0
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Glow effect for active streaks */}
        {streak > 0 && (
          <motion.div
            className="absolute inset-0 blur-md opacity-50"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Flame
              size={iconSizes[size]}
              className={getFlameColor()}
              fill="currentColor"
            />
          </motion.div>
        )}

        <Flame
          size={iconSizes[size]}
          className={cn(getFlameColor(), "relative z-10")}
          fill={streak > 0 ? "currentColor" : "none"}
        />
      </motion.div>

      {/* Streak count */}
      <AnimatePresence mode="wait">
        <motion.span
          key={streak}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "font-bold tabular-nums",
            streak === 0 ? "text-slate-400" : "text-foreground",
          )}
        >
          {streak}
        </motion.span>
      </AnimatePresence>

      {/* Freeze indicator */}
      {showFreezes && freezesAvailable > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-0.5 ml-1"
        >
          <Snowflake
            size={iconSizes[size] - 4}
            className={cn("text-cyan-400", isProtected && "animate-pulse")}
          />
          <span className="text-xs text-cyan-400 font-medium">
            {freezesAvailable}
          </span>
        </motion.div>
      )}

      {/* Protected badge */}
      {isProtected && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-1 px-1.5 py-0.5 bg-cyan-500/20 rounded text-[10px] text-cyan-400 font-medium"
        >
          Protected
        </motion.div>
      )}
    </div>
  );
}

// Compact version for sidebar
export function StreakBadge({
  streak,
  freezesAvailable,
  className,
}: {
  streak: number;
  freezesAvailable: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        streak > 0
          ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
          : "bg-muted/50 border border-border",
        className,
      )}
    >
      <StreakCounter
        streak={streak}
        freezesAvailable={freezesAvailable}
        size="sm"
        showFreezes={true}
      />
      {streak > 0 && (
        <span className="text-xs text-muted-foreground">
          day{streak !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
