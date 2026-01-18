"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SparksBadgeProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function SparksBadge({
  amount,
  size = "md",
  showLabel = false,
  className,
}: SparksBadgeProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-3 py-1",
    lg: "text-lg px-4 py-1.5",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        "bg-gradient-to-r from-yellow-500/10 to-amber-500/10",
        "border border-yellow-500/20",
        sizeClasses[size],
        className,
      )}
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        <Sparkles
          size={iconSizes[size]}
          className="text-yellow-400"
          fill="currentColor"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.span
          key={amount}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="font-bold tabular-nums text-yellow-400"
        >
          {amount.toLocaleString()}
        </motion.span>
      </AnimatePresence>

      {showLabel && (
        <span className="text-muted-foreground text-sm">Sparks</span>
      )}
    </div>
  );
}
