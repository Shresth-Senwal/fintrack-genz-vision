/**
 * @fileoverview Gamification Constants and Configurations
 * 
 * This file contains all constants, templates, and configuration data
 * for the gamification system including achievements, challenges, levels, and XP actions.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import { Achievement, Challenge, LevelThreshold, XPAction } from '../types/gamification';

// Default level thresholds - exponential growth pattern
export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, requiredXP: 0, title: 'Beginner', description: 'Just getting started!', perks: [], unlockedFeatures: [] },
  { level: 2, requiredXP: 100, title: 'Learner', description: 'Learning the ropes', perks: ['Basic insights'], unlockedFeatures: ['budget_alerts'] },
  { level: 3, requiredXP: 250, title: 'Tracker', description: 'Consistent tracking', perks: ['Weekly summaries'], unlockedFeatures: ['advanced_charts'] },
  { level: 4, requiredXP: 500, title: 'Saver', description: 'Building good habits', perks: ['Goal recommendations'], unlockedFeatures: ['investment_suggestions'] },
  { level: 5, requiredXP: 1000, title: 'Budgeter', description: 'Budget master', perks: ['Smart budget tips'], unlockedFeatures: ['auto_budgeting'] },
  { level: 6, requiredXP: 2000, title: 'Investor', description: 'Growing wealth', perks: ['Investment insights'], unlockedFeatures: ['portfolio_analysis'] },
  { level: 7, requiredXP: 4000, title: 'Expert', description: 'Financial expert', perks: ['Premium features'], unlockedFeatures: ['advanced_analytics'] },
  { level: 8, requiredXP: 8000, title: 'Master', description: 'Finance master', perks: ['All features'], unlockedFeatures: ['premium_support'] },
];

// XP reward system for different actions
export const XP_ACTIONS: Record<string, XPAction> = {
  'transaction_added': { action: 'Add Transaction', baseXP: 5, category: 'basic' },
  'goal_created': { action: 'Create Goal', baseXP: 25, category: 'planning' },
  'goal_milestone_25': { action: 'Goal 25% Complete', baseXP: 50, category: 'achievement' },
  'goal_milestone_50': { action: 'Goal 50% Complete', baseXP: 75, category: 'achievement' },
  'goal_milestone_75': { action: 'Goal 75% Complete', baseXP: 100, category: 'achievement' },
  'goal_completed': { action: 'Goal Completed', baseXP: 200, category: 'achievement' },
  'budget_adhered': { action: 'Stay Under Budget', baseXP: 15, category: 'discipline' },
  'challenge_completed': { action: 'Complete Challenge', baseXP: 100, category: 'challenge' },
  'streak_maintained': { action: 'Maintain Streak', baseXP: 10, category: 'consistency' },
  'profile_completed': { action: 'Complete Profile', baseXP: 50, category: 'setup' },
  'first_login': { action: 'First Login', baseXP: 25, category: 'onboarding' },
};

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_transaction',
    title: 'First Step',
    description: 'Add your first transaction',
    category: 'milestone',
    icon: '🎯',
    rarity: 'common',
    criteria: { type: 'transaction_count', value: 1, operator: '>=' },
    reward: { xp: 25, badge: 'starter' },
    isSecret: false,
  },
  {
    id: 'transaction_master',
    title: 'Transaction Master',
    description: 'Add 100 transactions',
    category: 'milestone',
    icon: '📊',
    rarity: 'rare',
    criteria: { type: 'transaction_count', value: 100, operator: '>=' },
    reward: { xp: 200, badge: 'master_tracker' },
    isSecret: false,
  },
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Create your first savings goal',
    category: 'milestone',
    icon: '🎯',
    rarity: 'common',
    criteria: { type: 'goal_count', value: 1, operator: '>=' },
    reward: { xp: 50, badge: 'planner' },
    isSecret: false,
  },
  {
    id: 'goal_achiever',
    title: 'Goal Achiever',
    description: 'Complete your first goal',
    category: 'goal',
    icon: '🏆',
    rarity: 'rare',
    criteria: { type: 'goals_completed', value: 1, operator: '>=' },
    reward: { xp: 150, badge: 'achiever' },
    isSecret: false,
  },
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Maintain a 7-day saving streak',
    category: 'streak',
    icon: '🔥',
    rarity: 'common',
    criteria: { type: 'max_streak', value: 7, operator: '>=' },
    reward: { xp: 75, badge: 'consistent' },
    isSecret: false,
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 30-day saving streak',
    category: 'streak',
    icon: '🔥',
    rarity: 'epic',
    criteria: { type: 'max_streak', value: 30, operator: '>=' },
    reward: { xp: 300, badge: 'dedicated' },
    isSecret: false,
  },
  {
    id: 'budget_guru',
    title: 'Budget Guru',
    description: 'Stay under budget for 4 weeks in a row',
    category: 'special',
    icon: '💰',
    rarity: 'rare',
    criteria: { type: 'budget_weeks', value: 4, operator: '>=' },
    reward: { xp: 250, badge: 'budget_master' },
    isSecret: false,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Add transaction before 8 AM',
    category: 'special',
    icon: '🌅',
    rarity: 'common',
    criteria: { type: 'early_transaction', value: 1, operator: '>=' },
    reward: { xp: 15, badge: 'early_bird' },
    isSecret: true,
  },
];

// Sample challenges that can be generated
export const CHALLENGE_TEMPLATES: Omit<Challenge, 'id' | 'startDate' | 'endDate' | 'status' | 'currentValue'>[] = [
  {
    title: 'Transaction Tracker',
    description: 'Log all your expenses for 7 days',
    type: 'weekly',
    category: 'transaction',
    targetValue: 7,
    unit: 'days',
    reward: { xp: 100, streakBonus: true },
    difficulty: 'easy',
    icon: '📝',
    color: '#3B82F6',
  },
  {
    title: 'Budget Master',
    description: 'Stay under your weekly budget',
    type: 'weekly',
    category: 'spending',
    targetValue: 1,
    unit: 'week',
    reward: { xp: 150, badges: ['budget_keeper'] },
    difficulty: 'medium',
    icon: '💰',
    color: '#10B981',
  },
  {
    title: 'Savings Sprint',
    description: 'Add money to any goal 3 times this week',
    type: 'weekly',
    category: 'saving',
    targetValue: 3,
    unit: 'contributions',
    reward: { xp: 120, streakBonus: true },
    difficulty: 'medium',
    icon: '🎯',
    color: '#8B5CF6',
  },
  {
    title: 'Daily Diligence',
    description: 'Add at least one transaction every day',
    type: 'daily',
    category: 'transaction',
    targetValue: 1,
    unit: 'transactions',
    reward: { xp: 25 },
    difficulty: 'easy',
    icon: '⏰',
    color: '#F59E0B',
  },
];

// Helper functions for gamification calculations
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].requiredXP) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

export function calculateXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel + 1);
  
  if (!nextLevelThreshold) return 0; // Max level reached
  
  return nextLevelThreshold.requiredXP - totalXP;
}

export function calculateStreakMultiplier(count: number): number {
  if (count >= 30) return 3;
  if (count >= 14) return 2;
  if (count >= 7) return 1.5;
  return 1;
}

// Bank name patterns for statement parsing
export const BANK_PATTERNS = {
  SBI: ['state bank', 'sbi', 'state bank of india'],
  HDFC: ['hdfc', 'hdfc bank'],
  ICICI: ['icici', 'icici bank'],
  AXIS: ['axis', 'axis bank'],
  KOTAK: ['kotak', 'kotak mahindra'],
  PNB: ['pnb', 'punjab national bank'],
  BOI: ['bank of india', 'boi'],
  CANARA: ['canara', 'canara bank'],
  UNION: ['union bank', 'union bank of india'],
  BOB: ['bank of baroda', 'bob'],
};

// Common transaction categories for auto-categorization
export const TRANSACTION_CATEGORIES = {
  food: ['restaurant', 'food', 'cafe', 'zomato', 'swiggy', 'dominos', 'pizza', 'mcdonald'],
  transport: ['uber', 'ola', 'metro', 'bus', 'taxi', 'petrol', 'fuel', 'parking'],
  shopping: ['amazon', 'flipkart', 'mall', 'store', 'shop', 'clothing', 'electronics'],
  utilities: ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone', 'broadband'],
  entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'theatre', 'concert'],
  healthcare: ['hospital', 'clinic', 'pharmacy', 'medical', 'doctor', 'medicine'],
  education: ['school', 'college', 'university', 'course', 'books', 'fees'],
  groceries: ['grocery', 'supermarket', 'vegetables', 'milk', 'bread', 'provisions'],
};

// Investment risk profiles
export const RISK_PROFILES = {
  conservative: {
    equity: 20,
    debt: 70,
    gold: 10,
    expectedReturn: 8,
    description: 'Low risk, stable returns',
  },
  moderate: {
    equity: 50,
    debt: 40,
    gold: 10,
    expectedReturn: 12,
    description: 'Balanced risk and return',
  },
  aggressive: {
    equity: 80,
    debt: 15,
    gold: 5,
    expectedReturn: 15,
    description: 'High risk, high potential returns',
  },
};

// Common recurring transaction patterns
export const RECURRING_PATTERNS = {
  salary: {
    frequency: 'monthly' as const,
    dayOfMonth: 1,
    type: 'income' as const,
    category: 'Salary',
  },
  rent: {
    frequency: 'monthly' as const,
    dayOfMonth: 1,
    type: 'expense' as const,
    category: 'Housing',
  },
  utilities: {
    frequency: 'monthly' as const,
    dayOfMonth: 5,
    type: 'expense' as const,
    category: 'Utilities',
  },
  subscriptions: {
    frequency: 'monthly' as const,
    dayOfMonth: 15,
    type: 'expense' as const,
    category: 'Entertainment',
  },
};
