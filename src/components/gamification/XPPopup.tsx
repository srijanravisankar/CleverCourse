"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Zap, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPPopupProps {
  xp: number;
  bonusXp?: number;
  message?: string;
  isVisible: boolean;
  onComplete?: () => void;
  showConfetti?: boolean;
  position?: "center" | "top-right" | "bottom-center";
}

export function XPPopup({
  xp,
  bonusXp = 0,
  message = "XP Earned!",
  isVisible,
  onComplete,
  showConfetti = false,
  position = "center",
}: XPPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);

      // Fire confetti for bonus XP or when explicitly requested
      if (showConfetti || bonusXp > 0) {
        const colors = ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4"];
        confetti({
          particleCount: bonusXp > 0 ? 80 : 40,
          spread: 60,
          origin: { y: 0.6 },
          colors,
        });
      }

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, bonusXp, showConfetti, onComplete]);

  const positionClasses = {
    center: "fixed inset-0 flex items-center justify-center z-50",
    "top-right": "fixed top-20 right-6 z-50",
    "bottom-center": "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
  };

  return (
    <AnimatePresence>
      {show && (
        <div className={positionClasses[position]}>
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            className={cn(
              "bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500",
              "rounded-2xl shadow-2xl p-6 min-w-[200px]",
              "border-2 border-amber-300/50",
            )}
          >
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: Math.random() * 200,
                    y: Math.random() * 100,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: 1,
                  }}
                >
                  <Star className="w-3 h-3 text-white/70" />
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div className="relative text-center text-white">
              {/* Icon */}
              <motion.div
                className="flex justify-center mb-2"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Zap className="w-8 h-8 fill-white" />
                </div>
              </motion.div>

              {/* XP Amount */}
              <motion.div
                className="text-4xl font-black tracking-tight"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                +{xp + bonusXp}
              </motion.div>

              {/* Message */}
              <p className="text-sm font-semibold opacity-90 mt-1">{message}</p>

              {/* Bonus indicator */}
              {bonusXp > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                >
                  <Sparkles className="w-3 h-3" />+{bonusXp} BONUS!
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mini XP indicator for inline feedback (e.g., after each flashcard)
 */
export function MiniXPBadge({
  xp,
  isVisible,
  onComplete,
}: {
  xp: number;
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: -20 }}
          exit={{ opacity: 0, scale: 0.5, y: -40 }}
          className="inline-flex items-center gap-1 bg-amber-500 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg"
        >
          <Zap className="w-3 h-3 fill-white" />+{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
