/**
 * @fileoverview Gamification Context Provider
 * 
 * This context manages all gamification features including challenges, streaks,
 * leveling system, achievements, and milestone celebrations. It provides
 * centralized state management and actions for gamification features.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  Challenge, 
  UserProgress, 
  Achievement, 
  GamificationContextType, 
  Streak, 
  GoalMilestone,
  UserChallengeProgress,
  ProgressEvent,
} from '../types/gamification';
import { useAuth } from './AuthContext';
import { 
  LEVEL_THRESHOLDS, 
  XP_ACTIONS, 
  ACHIEVEMENTS, 
  CHALLENGE_TEMPLATES,
  calculateLevel,
  calculateXPToNextLevel,
  calculateStreakMultiplier 
} from '../constants/gamification';

// Gamification state interface
interface GamificationState {
  userProgress: UserProgress;
  activeChallenges: Challenge[];
  progressEvents: ProgressEvent[];
  isLoading: boolean;
  error: string | null;
}

// Action types for the reducer
type GamificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_PROGRESS'; payload: UserProgress }
  | { type: 'AWARD_XP'; payload: { amount: number; action: string; context?: string } }
  | { type: 'LEVEL_UP'; payload: { newLevel: number; xpAwarded: number } }
  | { type: 'UPDATE_STREAK'; payload: { type: string; action: 'continue' | 'break' } }
  | { type: 'COMPLETE_CHALLENGE'; payload: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_PROGRESS_EVENT'; payload: ProgressEvent }
  | { type: 'CELEBRATE_MILESTONE'; payload: GoalMilestone };

// Initial state
const initialState: GamificationState = {
  userProgress: {
    level: {
      currentLevel: 1,
      currentXP: 0,
      totalXP: 0,
      xpToNextLevel: 100,
      title: 'Beginner',
      perks: [],
      unlockedFeatures: [],
    },
    streaks: {},
    challenges: [],
    achievements: [],
    totalXP: 0,
    weeklyXP: 0,
    monthlyXP: 0,
    lastUpdated: new Date().toISOString(),
  },
  activeChallenges: [],
  progressEvents: [],
  isLoading: false,
  error: null,
};

// Reducer function
function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_USER_PROGRESS':
      return { ...state, userProgress: action.payload };

    case 'AWARD_XP': {
      const { amount, action: actionName, context } = action.payload;
      const newTotalXP = state.userProgress.totalXP + amount;
      const currentLevel = calculateLevel(newTotalXP);
      const levelThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
      
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          totalXP: newTotalXP,
          weeklyXP: state.userProgress.weeklyXP + amount,
          monthlyXP: state.userProgress.monthlyXP + amount,
          level: {
            ...state.userProgress.level,
            currentLevel,
            currentXP: newTotalXP - (levelThreshold?.requiredXP || 0),
            totalXP: newTotalXP,
            xpToNextLevel: calculateXPToNextLevel(newTotalXP),
            title: levelThreshold?.title || 'Unknown',
            perks: levelThreshold?.perks || [],
            unlockedFeatures: levelThreshold?.unlockedFeatures || [],
          },
          lastUpdated: new Date().toISOString(),
        },
        progressEvents: [
          ...state.progressEvents,
          {
            type: 'xp_gained',
            timestamp: new Date().toISOString(),
            data: { amount, action: actionName, context },
            xpGained: amount,
            context,
          },
        ],
      };
    }

    case 'UPDATE_STREAK': {
      const { type, action: streakAction } = action.payload;
      const currentStreak = state.userProgress.streaks[type] || {
        type: type as 'saving' | 'budget' | 'transaction' | 'goal',
        currentCount: 0,
        longestCount: 0,
        lastActionDate: '',
        isActive: false,
        multiplier: 1,
      };

      const updatedStreak: Streak = {
        ...currentStreak,
        currentCount: streakAction === 'continue' ? currentStreak.currentCount + 1 : 0,
        longestCount: streakAction === 'continue' 
          ? Math.max(currentStreak.longestCount, currentStreak.currentCount + 1)
          : currentStreak.longestCount,
        lastActionDate: new Date().toISOString(),
        isActive: streakAction === 'continue',
        multiplier: calculateStreakMultiplier(streakAction === 'continue' ? currentStreak.currentCount + 1 : 0),
      };

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          streaks: {
            ...state.userProgress.streaks,
            [type]: updatedStreak,
          },
          lastUpdated: new Date().toISOString(),
        },
        progressEvents: [
          ...state.progressEvents,
          {
            type: streakAction === 'continue' ? 'streak_continued' : 'streak_broken',
            timestamp: new Date().toISOString(),
            data: { type, newCount: updatedStreak.currentCount, previousCount: currentStreak.currentCount },
          },
        ],
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const achievementId = action.payload;
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      
      if (!achievement) return state;

      const userAchievement = {
        achievementId,
        unlockedAt: new Date().toISOString(),
        progress: 100,
      };

      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          achievements: [...state.userProgress.achievements, userAchievement],
          totalXP: state.userProgress.totalXP + achievement.reward.xp,
          lastUpdated: new Date().toISOString(),
        },
        progressEvents: [
          ...state.progressEvents,
          {
            type: 'achievement_unlocked',
            timestamp: new Date().toISOString(),
            data: { achievementId, xpGained: achievement.reward.xp },
            xpGained: achievement.reward.xp,
          },
        ],
      };
    }

    default:
      return state;
  }
}

// Create context
const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Export context for hook usage
export { GamificationContext };

// Provider component
export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  const { user } = useAuth();

  // Load user progress from localStorage
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`gamification_${user.uid}`);
      if (savedProgress) {
        try {
          const progress: UserProgress = JSON.parse(savedProgress);
          dispatch({ type: 'SET_USER_PROGRESS', payload: progress });
        } catch (error) {
          console.error('Failed to load gamification progress:', error);
        }
      }
    }
  }, [user]);

  // Save user progress to localStorage
  useEffect(() => {
    if (user && state.userProgress.totalXP > 0) {
      localStorage.setItem(`gamification_${user.uid}`, JSON.stringify(state.userProgress));
    }
  }, [user, state.userProgress]);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    const isAlreadyUnlocked = state.userProgress.achievements.some(a => a.achievementId === achievementId);
    if (!isAlreadyUnlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });
    }
  }, [state.userProgress.achievements]);

  // Check for achievement unlocks
  const checkAchievements = useCallback((action: string, totalXP: number) => {
    // This would be expanded with more sophisticated achievement checking logic
    // For now, simple transaction count checking
    if (action === 'transaction_added') {
      // Check first transaction achievement
      unlockAchievement('first_transaction');
    }
  }, [unlockAchievement]);

  // Award XP for actions
  const awardXP = useCallback((action: string, customAmount?: number, context?: string) => {
    const xpAction = XP_ACTIONS[action];
    if (!xpAction) {
      console.warn(`Unknown XP action: ${action}`);
      return;
    }

    let amount = customAmount || xpAction.baseXP;

    // Apply streak multipliers
    if (action.includes('streak') || action.includes('daily')) {
      const streakType = action.includes('saving') ? 'saving' : 'transaction';
      const streak = state.userProgress.streaks[streakType];
      if (streak?.isActive) {
        amount *= streak.multiplier;
      }
    }

    dispatch({ type: 'AWARD_XP', payload: { amount: Math.round(amount), action, context } });

    // Check for level up
    const newTotalXP = state.userProgress.totalXP + amount;
    const newLevel = calculateLevel(newTotalXP);
    if (newLevel > state.userProgress.level.currentLevel) {
      dispatch({ type: 'LEVEL_UP', payload: { newLevel, xpAwarded: amount } });
    }

    // Check for achievement unlocks
    checkAchievements(action, newTotalXP);
  }, [state.userProgress, checkAchievements]);

  // Update streak status
  const updateStreak = useCallback((type: string, action: 'continue' | 'break') => {
    dispatch({ type: 'UPDATE_STREAK', payload: { type, action } });

    if (action === 'continue') {
      awardXP('streak_maintained', undefined, type);
    }
  }, [awardXP]);

  // Complete challenge
  const completeChallenge = useCallback((challengeId: string) => {
    const challenge = state.activeChallenges.find(c => c.id === challengeId);
    if (challenge) {
      awardXP('challenge_completed', challenge.reward.xp, challenge.title);
      dispatch({ type: 'COMPLETE_CHALLENGE', payload: challengeId });
    }
  }, [state.activeChallenges, awardXP]);

  // Celebrate milestone
  const celebrateMilestone = useCallback((milestone: GoalMilestone) => {
    // Award XP based on milestone percentage
    const xpAmount = milestone.percentage === 100 ? 200 : milestone.percentage;
    awardXP(`goal_milestone_${milestone.percentage}`, xpAmount, milestone.goalId);
    
    dispatch({ type: 'CELEBRATE_MILESTONE', payload: milestone });
  }, [awardXP]);

  // Helper functions
  const getActiveStreaks = useCallback(() => {
    return Object.values(state.userProgress.streaks).filter(streak => streak.isActive);
  }, [state.userProgress.streaks]);

  const getRecentAchievements = useCallback((days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return state.userProgress.achievements.filter(achievement => 
      new Date(achievement.unlockedAt) >= cutoffDate
    );
  }, [state.userProgress.achievements]);

  const getXPToNextLevel = useCallback(() => {
    return calculateXPToNextLevel(state.userProgress.totalXP);
  }, [state.userProgress.totalXP]);

  const getLevelProgress = useCallback(() => {
    const xpToNext = getXPToNextLevel();
    const currentLevelThreshold = LEVEL_THRESHOLDS[state.userProgress.level.currentLevel - 1];
    const nextLevelThreshold = LEVEL_THRESHOLDS[state.userProgress.level.currentLevel];
    
    if (!nextLevelThreshold) return 100; // Max level
    
    const levelRange = nextLevelThreshold.requiredXP - currentLevelThreshold.requiredXP;
    const progress = ((levelRange - xpToNext) / levelRange) * 100;
    
    return Math.max(0, Math.min(100, progress));
  }, [state.userProgress.level.currentLevel, getXPToNextLevel]);

  const contextValue: GamificationContextType = {
    userProgress: state.userProgress,
    activeChallenges: state.activeChallenges,
    availableAchievements: ACHIEVEMENTS,
    awardXP,
    updateStreak,
    completeChallenge,
    unlockAchievement,
    celebrateMilestone,
    getActiveStreaks,
    getRecentAchievements,
    getXPToNextLevel,
    getLevelProgress,
    isLoading: state.isLoading,
    error: state.error,
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}
