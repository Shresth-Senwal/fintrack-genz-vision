/**
 * @fileoverview Type definitions for gamification system
 * 
 * This file contains all TypeScript interfaces and types for the gamification
 * features including challenges, streaks, leveling, achievements, and user progress.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'spending' | 'saving' | 'transaction' | 'goal';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'transactions', 'days', 'amount'
  reward: {
    xp: number;
    badges?: string[];
    streakBonus?: boolean;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed' | 'upcoming';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  color: string;
}

export interface UserChallengeProgress {
  challengeId: string;
  progress: number; // 0-100 percentage
  startedAt: string;
  completedAt?: string;
  milestones: ChallengeMilestone[];
}

export interface ChallengeMilestone {
  percentage: number;
  achievedAt?: string;
  xpAwarded: number;
}

// Streak Types
export interface Streak {
  type: 'saving' | 'budget' | 'transaction' | 'goal';
  currentCount: number;
  longestCount: number;
  lastActionDate: string;
  isActive: boolean;
  multiplier: number; // XP multiplier for maintaining streaks
}

export interface StreakEvent {
  type: string;
  date: string;
  action: 'continue' | 'break' | 'start';
  previousCount: number;
  newCount: number;
}

// Leveling System Types
export interface UserLevel {
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  title: string;
  perks: string[];
  unlockedFeatures: string[];
}

export interface XPAction {
  action: string;
  baseXP: number;
  category: string;
  multipliers?: {
    streak?: number;
    level?: number;
    challenge?: number;
  };
}

export interface LevelThreshold {
  level: number;
  requiredXP: number;
  title: string;
  description: string;
  perks: string[];
  unlockedFeatures: string[];
  badge?: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'milestone' | 'streak' | 'challenge' | 'special' | 'goal';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: string;
    value: number | string;
    operator: '=' | '>' | '<' | '>=' | '<=' | 'contains';
  };
  reward: {
    xp: number;
    title?: string;
    badge?: string;
  };
  isSecret: boolean; // Hidden until unlocked
  unlockedAt?: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number; // For progressive achievements
}

// Progress and Analytics Types
export interface UserProgress {
  level: UserLevel;
  streaks: Record<string, Streak>;
  challenges: UserChallengeProgress[];
  achievements: UserAchievement[];
  totalXP: number;
  weeklyXP: number;
  monthlyXP: number;
  lastUpdated: string;
}

export interface ProgressEvent {
  type: 'xp_gained' | 'level_up' | 'streak_continued' | 'streak_broken' | 'challenge_completed' | 'achievement_unlocked';
  timestamp: string;
  data: Record<string, unknown>;
  xpGained?: number;
  context?: string;
}

// Milestone and Celebration Types
export interface GoalMilestone {
  goalId: string;
  percentage: number; // 25, 50, 75, 100
  achievedAt: string;
  celebrated: boolean;
  xpAwarded: number;
  badgeAwarded?: string;
}

export interface CelebrationConfig {
  type: 'confetti' | 'popup' | 'toast' | 'modal';
  duration: number;
  sound?: boolean;
  animation: string;
  message: string;
}

// Gamification Context Types
export interface GamificationContextType {
  userProgress: UserProgress;
  activeChallenges: Challenge[];
  availableAchievements: Achievement[];
  
  // Actions
  awardXP: (action: string, amount: number, context?: string) => void;
  updateStreak: (type: string, action: 'continue' | 'break') => void;
  completeChallenge: (challengeId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  celebrateMilestone: (milestone: GoalMilestone) => void;
  
  // Queries
  getActiveStreaks: () => Streak[];
  getRecentAchievements: (days?: number) => UserAchievement[];
  getXPToNextLevel: () => number;
  getLevelProgress: () => number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Utility Types
export type GamificationEventType = 
  | 'transaction_added'
  | 'goal_created'
  | 'goal_milestone_reached'
  | 'budget_adhered'
  | 'challenge_completed'
  | 'streak_maintained'
  | 'first_login'
  | 'profile_completed';

export interface GamificationEvent {
  type: GamificationEventType;
  userId: string;
  data: Record<string, unknown>;
  timestamp: string;
}
