"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Star, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  xpToNext: number;
}

export function LevelUpModal({
  isOpen,
  onClose,
  level,
  xpToNext,
}: LevelUpModalProps) {
  const hasConfettiRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasConfettiRef.current) {
      hasConfettiRef.current = true;

      // Multi-burst confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = [
        "#FFD700",
        "#FFA500",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
      ];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Initial big burst
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });

      // Continuous side bursts
      frame();
    }

    if (!isOpen) {
      hasConfettiRef.current = false;
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateX: 15 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="relative bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10" />

            {/* Animated particles background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  initial={{
                    x: Math.random() * 400 - 50,
                    y: 400,
                    opacity: 0,
                  }}
                  animate={{
                    y: -50,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear",
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Level badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="relative mx-auto w-24 h-24 mb-4"
              >
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Inner circle */}
                <div className="absolute inset-1 rounded-full bg-card flex items-center justify-center">
                  <div className="text-center">
                    <Star
                      className="h-6 w-6 text-yellow-400 mx-auto mb-0.5"
                      fill="currentColor"
                    />
                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {level}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                Level Up!
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6"
              >
                You've reached{" "}
                <span className="text-yellow-400 font-semibold">
                  Level {level}
                </span>
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-muted/50 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-muted-foreground">
                    Next level in{" "}
                    <span className="text-foreground font-medium">
                      {xpToNext} XP
                    </span>
                  </span>
                </div>
              </motion.div>

              {/* Continue button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  Keep Learning!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
