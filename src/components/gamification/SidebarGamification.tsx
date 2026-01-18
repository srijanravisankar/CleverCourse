'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Snowflake, ShoppingCart } from 'lucide-react';
import { useGamificationStore } from '@/store/use-gamification-store';
import { XPBar } from './XPBar';
import { StreakBadge } from './StreakCounter';
import { StreakFreezeShop } from './StreakFreezeShop';
import { cn } from '@/lib/utils';
import { getGamificationStats } from '@/app/actions/gamification';

interface SidebarGamificationProps {
  className?: string;
}

export function SidebarGamification({ className }: SidebarGamificationProps) {
  const { stats, isLoading, setStats } = useGamificationStore();
  const [showShop, setShowShop] = useState(false);

  const handlePurchaseSuccess = async () => {
    // Refresh stats after purchase
    const newStats = await getGamificationStats();
    if (newStats) {
      setStats(newStats);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('p-3 border-b', className)}>
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-2 bg-muted rounded w-full" />
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-16" />
            <div className="h-6 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-3 border-b bg-gradient-to-r from-sidebar to-transparent',
          className
        )}
      >
        {/* Level & XP Bar */}
        <XPBar compact showLevel={true} />

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-2.5 gap-2">
          {/* Streak */}
          <StreakBadge
            streak={stats.currentStreak}
            freezesAvailable={stats.freezesAvailable}
          />

          {/* Sparks with shop button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowShop(true)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
              'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
              'border border-yellow-500/20',
              'hover:border-yellow-500/40 transition-colors',
              'group'
            )}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400 tabular-nums">
              {stats.sparks.toLocaleString()}
            </span>
            <AnimatePresence>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileHover={{ width: 'auto', opacity: 1 }}
                className="overflow-hidden"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-yellow-400/70 ml-0.5" />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Freeze indicator if has freezes */}
        {stats.freezesAvailable > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Snowflake className="h-3 w-3 text-cyan-400" />
            <span>
              {stats.freezesAvailable} freeze{stats.freezesAvailable !== 1 ? 's' : ''} ready
            </span>
          </div>
        )}
      </motion.div>

      {/* Streak Freeze Shop Modal */}
      <StreakFreezeShop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        currentSparks={stats.sparks}
        currentFreezes={stats.freezesAvailable}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  );
}
