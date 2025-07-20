/**
 * AchievementBadge.tsx
 *
 * Gamified achievement badge component for Fintrack GenZ Vision dashboard.
 * - Displays achievement icon, title, description, and progress bar.
 * - Supports multiple achievement types and rarities.
 * - Handles unlocked/locked state and progress calculation.
 *
 * Dependencies:
 * - Lucide React icons for visual representation
 * - UI primitives: Badge, Progress
 *
 * Edge Cases & Limitations:
 * - Icon fallback to Trophy if type is unknown
 * - Progress bar capped at 100%
 *
 * TODO: Add unlock animations and accessibility improvements.
 */

/**
 * Achievement Badge Component - Gamified achievement system
 * 
 * Features:
 * - Visual achievement representation with icons
 * - Progress tracking for ongoing achievements
 * - Unlock animations and visual feedback
 * - Different achievement types and rarities
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Shield, 
  Zap,
  Crown,
  Medal,
  Award
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

/**
 * AchievementBadge
 * Renders a single achievement badge with icon and progress.
 * @param {AchievementBadgeProps} props - Achievement data
 * @returns {JSX.Element} Achievement badge UI
 */
export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const { title, description, icon, unlocked, progress, maxProgress } = achievement;
  const progressPercentage = (progress / maxProgress) * 100;
  
  // Map icon strings to components
  const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    trophy: Trophy,
    star: Star,
    flame: Flame,
    target: Target,
    shield: Shield,
    zap: Zap,
    crown: Crown,
    medal: Medal,
    award: Award
  };

  const IconComponent = iconMap[icon] || Trophy;

  // Get achievement rarity and styling
  const getAchievementStyling = () => {
    if (unlocked) {
      // Determine rarity based on achievement type or other factors
      const isRare = ['Emergency Fund', 'Budget Master'].includes(title);
      const isLegendary = title.includes('Streak') && progress >= 30;
      
      if (isLegendary) {
        return {
          containerClass: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
          iconClass: 'text-amber-600',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      } else if (isRare) {
        return {
          containerClass: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
          iconClass: 'text-purple-600',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      } else {
        return {
          containerClass: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
          iconClass: 'text-green-600',
          badgeClass: 'bg-green-100 text-green-800 border-green-200',
        };
      }
    } else {
      return {
        containerClass: 'bg-muted/30 border-border',
        iconClass: 'text-muted-foreground',
        badgeClass: 'bg-muted text-muted-foreground border-border',
      };
    }
  };

  const styling = getAchievementStyling();

  return (
    <motion.div 
      className={`relative p-4 rounded-lg border transition-all duration-200 ${
        styling.containerClass
      } ${unlocked ? 'hover:shadow-md' : ''}`}
      whileHover={{ scale: 1.01, y: -1, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
    >
      
      <div className="relative flex items-center gap-3">
        {/* Achievement Icon */}
        <motion.div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            unlocked 
              ? 'bg-white/60 backdrop-blur-sm shadow-sm' 
              : 'bg-muted/50'
          }`}
          animate={unlocked ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={unlocked ? {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 5
          } : {}}
        >
          <IconComponent className={`w-5 h-5 ${styling.iconClass}`} />
        </motion.div>

        {/* Achievement Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium text-sm ${
              unlocked ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {title}
            </h4>
            {unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <Badge variant="secondary" className={`text-xs px-2 py-0 ${styling.badgeClass}`}>
                  ✓ Unlocked
                </Badge>
              </motion.div>
            )}
          </div>
          
          <p className={`text-xs leading-relaxed ${
            unlocked ? 'text-muted-foreground' : 'text-muted-foreground'
          }`}>
            {description}
          </p>

          {/* Progress Bar for Incomplete Achievements */}
          {!unlocked && (
            <motion.div 
              className="mt-3 space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {progress}/{maxProgress}
                </span>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Progress 
                  value={progressPercentage} 
                  className="h-1.5 bg-muted/50"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Achievement Completed Indicator */}
          {unlocked && progress > maxProgress && (
            <motion.div 
              className="mt-2 flex items-center gap-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Star className="w-3 h-3 text-amber-500" />
              </motion.div>
              <span className="text-xs text-amber-600 font-medium">
                Exceeded goal! ({progress}/{maxProgress})
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}