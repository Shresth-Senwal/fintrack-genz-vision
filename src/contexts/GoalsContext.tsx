/**
 * GoalsContext.tsx
 * 
 * Context provider for managing savings goals state and operations.
 * Provides CRUD operations for goals and persistence to localStorage.
 * 
 * Features:
 * - Add, edit, delete, and mark goals as achieved
 * - Real-time progress tracking
 * - Local storage persistence
 * - Type-safe interfaces
 * 
 * Dependencies:
 * - React hooks for state management
 * - Custom hooks for localStorage integration
 * 
 * TODO: Replace localStorage with Firebase/backend integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Interface for a savings goal
 */
export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: Date;
  category: string;
  icon: string;
  color: string;
  isAchieved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for goal creation (without generated fields)
 */
export interface CreateGoalData {
  title: string;
  description: string;
  target: number;
  deadline: Date;
  category: string;
  icon: string;
  color: string;
}

/**
 * Interface for goal updates
 */
export interface UpdateGoalData extends Partial<CreateGoalData> {
  current?: number;
  isAchieved?: boolean;
}

/**
 * Goals context interface
 */
interface GoalsContextType {
  goals: Goal[];
  addGoal: (goalData: CreateGoalData) => void;
  updateGoal: (id: string, updates: UpdateGoalData) => void;
  deleteGoal: (id: string) => void;
  addMoneyToGoal: (id: string, amount: number) => void;
  markGoalAchieved: (id: string) => void;
  getTotalSaved: () => number;
  getActiveGoalsCount: () => number;
  loading: boolean;
  error: string | null;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

/**
 * Custom hook to use Goals context
 * @returns Goals context or throws error if used outside provider
 */
export const useGoals = (): GoalsContextType => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

/**
 * Goals Provider Component Props
 */
interface GoalsProviderProps {
  children: ReactNode;
}

/**
 * Goals Provider Component
 * Manages goals state and provides CRUD operations
 */
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem('fintrack-goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals).map((goal: Partial<Goal>) => ({
          ...goal,
          deadline: new Date(goal.deadline || new Date()),
          createdAt: new Date(goal.createdAt || new Date()),
          updatedAt: new Date(goal.updatedAt || new Date()),
        })) as Goal[];
        setGoals(parsedGoals);
      } else {
        // Initialize with default goals
        const defaultGoals: Goal[] = [
          {
            id: '1',
            title: 'Emergency Fund',
            description: '6 months of expenses saved',
            target: 12000,
            current: 4500,
            deadline: new Date('2024-12-31'),
            category: 'safety',
            icon: 'shield',
            color: 'success',
            isAchieved: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            title: 'Dream Vacation',
            description: 'Trip to Japan in summer',
            target: 3500,
            current: 1200,
            deadline: new Date('2024-07-01'),
            category: 'travel',
            icon: 'plane',
            color: 'secondary',
            isAchieved: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            title: 'New Car',
            description: 'Down payment for car',
            target: 8000,
            current: 2100,
            deadline: new Date('2024-10-15'),
            category: 'transport',
            icon: 'car',
            color: 'primary',
            isAchieved: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        setGoals(defaultGoals);
        localStorage.setItem('fintrack-goals', JSON.stringify(defaultGoals));
      }
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    if (!loading && goals.length > 0) {
      try {
        localStorage.setItem('fintrack-goals', JSON.stringify(goals));
      } catch (err) {
        setError('Failed to save goals');
        console.error('Error saving goals:', err);
      }
    }
  }, [goals, loading]);

  /**
   * Add a new goal
   * @param goalData - Goal data without generated fields
   */
  const addGoal = (goalData: CreateGoalData): void => {
    try {
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        current: 0,
        isAchieved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setGoals(prevGoals => [...prevGoals, newGoal]);
      setError(null);
    } catch (err) {
      setError('Failed to add goal');
      console.error('Error adding goal:', err);
    }
  };

  /**
   * Update an existing goal
   * @param id - Goal ID
   * @param updates - Partial goal data to update
   */
  const updateGoal = (id: string, updates: UpdateGoalData): void => {
    try {
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === id
            ? { ...goal, ...updates, updatedAt: new Date() }
            : goal
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to update goal');
      console.error('Error updating goal:', err);
    }
  };

  /**
   * Delete a goal
   * @param id - Goal ID to delete
   */
  const deleteGoal = (id: string): void => {
    try {
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  /**
   * Add money to a specific goal
   * @param id - Goal ID
   * @param amount - Amount to add
   */
  const addMoneyToGoal = (id: string, amount: number): void => {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setGoals(prevGoals =>
        prevGoals.map(goal => {
          if (goal.id === id) {
            const newCurrent = goal.current + amount;
            const isAchieved = newCurrent >= goal.target;
            return {
              ...goal,
              current: newCurrent,
              isAchieved,
              updatedAt: new Date()
            };
          }
          return goal;
        })
      );
      setError(null);
    } catch (err) {
      setError('Failed to add money to goal');
      console.error('Error adding money to goal:', err);
    }
  };

  /**
   * Mark a goal as achieved
   * @param id - Goal ID
   */
  const markGoalAchieved = (id: string): void => {
    try {
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === id
            ? { ...goal, isAchieved: true, updatedAt: new Date() }
            : goal
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to mark goal as achieved');
      console.error('Error marking goal as achieved:', err);
    }
  };

  /**
   * Get total amount saved across all goals
   * @returns Total saved amount
   */
  const getTotalSaved = (): number => {
    return goals.reduce((total, goal) => total + goal.current, 0);
  };

  /**
   * Get count of active (not achieved) goals
   * @returns Number of active goals
   */
  const getActiveGoalsCount = (): number => {
    return goals.filter(goal => !goal.isAchieved).length;
  };

  const value: GoalsContextType = {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addMoneyToGoal,
    markGoalAchieved,
    getTotalSaved,
    getActiveGoalsCount,
    loading,
    error
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};
