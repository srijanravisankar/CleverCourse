'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Flame, Target, BookOpen, Award, Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface AchievementToastProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    name: string;
    description: string;
    icon: string;
    xpReward?: number;
    currencyReward?: number;
  } | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  flame: Flame,
  target: Target,
  book: BookOpen,
  award: Award,
  crown: Crown,
};

const getIcon = (iconName: string) => {
  const normalizedName = iconName.toLowerCase().replace(/[^a-z]/g, '');
  return iconMap[normalizedName] || Trophy;
};

export function AchievementToast({
  isOpen,
  onClose,
  achievement,
}: AchievementToastProps) {
  useEffect(() => {
    if (isOpen && achievement) {
      // Quick burst of confetti for achievement
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.3, x: 0.9 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B'],
      });
    }
  }, [isOpen, achievement]);

  if (!achievement) return null;

  const IconComponent = getIcon(achievement.icon);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          className="fixed top-4 right-4 z-50 w-80"
        >
          <div className="relative bg-card border border-yellow-500/30 rounded-xl p-4 shadow-2xl overflow-hidden">
            {/* Background shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent"
              animate={{
                x: [-200, 400],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 z-10"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>

            <div className="relative z-10 flex gap-3">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
              >
                <IconComponent className="h-6 w-6 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs font-medium text-yellow-500 mb-0.5"
                >
                  Achievement Unlocked!
                </motion.p>
                
                <motion.h3
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-bold text-sm truncate"
                >
                  {achievement.name}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xs text-muted-foreground line-clamp-2"
                >
                  {achievement.description}
                </motion.p>

                {/* Rewards */}
                {(achievement.xpReward || achievement.currencyReward) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-2 mt-2"
                  >
                    {achievement.xpReward && achievement.xpReward > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                        <Zap className="h-3 w-3" />
                        +{achievement.xpReward} XP
                      </span>
                    )}
                    {achievement.currencyReward && achievement.currencyReward > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3" />
                        +{achievement.currencyReward} Sparks
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Progress bar animation */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              onAnimationComplete={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// XP Gain floating notification
interface XPGainToastProps {
  amount: number;
  reason: string;
  isVisible: boolean;
  onComplete: () => void;
}

export function XPGainToast({
  amount,
  reason,
  isVisible,
  onComplete,
}: XPGainToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 2000);
          }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-card border border-blue-500/30 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="h-5 w-5 text-blue-400" fill="currentColor" />
            </motion.div>
            <div>
              <span className="font-bold text-blue-400">+{amount} XP</span>
              <span className="text-muted-foreground text-sm ml-1">{reason}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
