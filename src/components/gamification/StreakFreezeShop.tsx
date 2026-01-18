'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Sparkles, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { purchaseStreakFreeze } from '@/app/actions/gamification';

interface StreakFreezeShopProps {
  isOpen: boolean;
  onClose: () => void;
  currentSparks: number;
  currentFreezes: number;
  onPurchaseSuccess?: () => void;
}

const FREEZE_COST = 100; // Sparks per freeze
const MAX_FREEZES = 5;

export function StreakFreezeShop({
  isOpen,
  onClose,
  currentSparks,
  currentFreezes,
  onPurchaseSuccess,
}: StreakFreezeShopProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const canAfford = currentSparks >= FREEZE_COST;
  const hasMaxFreezes = currentFreezes >= MAX_FREEZES;
  const canPurchase = canAfford && !hasMaxFreezes;

  const handlePurchase = async () => {
    if (!canPurchase) return;
    
    setIsPurchasing(true);
    setPurchaseResult(null);

    try {
      const result = await purchaseStreakFreeze();
      setPurchaseResult({
        success: result.success,
        message: result.success
          ? `You now have ${result.newFreezeCount} streak freeze${result.newFreezeCount !== 1 ? 's' : ''}!`
          : result.error || 'Purchase failed',
      });
      
      if (result.success) {
        onPurchaseSuccess?.();
      }
    } catch {
      setPurchaseResult({
        success: false,
        message: 'Something went wrong',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="relative bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
              >
                <Snowflake className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold mb-1">Streak Freeze</h2>
              <p className="text-muted-foreground text-sm">
                Protect your streak when you miss a day
              </p>
            </div>

            {/* Current status */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Sparks</span>
                <span className="flex items-center gap-1 font-medium">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  {currentSparks.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Freezes Owned</span>
                <span className="flex items-center gap-1 font-medium">
                  <Snowflake className="h-4 w-4 text-cyan-400" />
                  {currentFreezes} / {MAX_FREEZES}
                </span>
              </div>
            </div>

            {/* Purchase section */}
            <div className="border border-border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">1 Streak Freeze</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Sparkles className="h-4 w-4" />
                  {FREEZE_COST}
                </div>
              </div>

              {purchaseResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'mb-3 p-2 rounded-lg flex items-center gap-2 text-sm',
                    purchaseResult.success
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  )}
                >
                  {purchaseResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {purchaseResult.message}
                </motion.div>
              )}

              <Button
                onClick={handlePurchase}
                disabled={!canPurchase || isPurchasing}
                className={cn(
                  'w-full',
                  canPurchase &&
                    'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                )}
              >
                {isPurchasing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Snowflake className="h-4 w-4" />
                  </motion.div>
                ) : hasMaxFreezes ? (
                  'Max Freezes Owned'
                ) : !canAfford ? (
                  `Need ${FREEZE_COST - currentSparks} more Sparks`
                ) : (
                  'Purchase Freeze'
                )}
              </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center">
              Freezes are automatically used when you miss a day to protect your streak.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
