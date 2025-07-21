/**
 * Dashboard.tsx
 *
 * Main dashboard container with improved navigation and layout.
 * - Tabbed interface for different sections (Overview, Transactions, Analytics, Goals)
 * - Real-time financial summary with quick actions
 * - Mobile-optimized responsive design with touch-friendly interfaces
 * - Comprehensive financial tracking and insights
 * - Local data persistence with event-driven updates
 *
 * Dependencies:
 * - React hooks for state management
 * - UI primitives: Card, Tabs, Button, Badge
 * - Lucide icons for navigation and visual elements
 * - Dashboard components: AddTransaction, TransactionHistory, Analytics, SavingsGoal
 *
 * Features:
 * - Quick financial overview
 * - Transaction management
 * - Analytics and insights
 * - Savings goals tracking
 * - Achievement system
 * - Real-time data synchronization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  CreditCard,
  PiggyBank,
  Calendar,
  Award,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Zap
} from 'lucide-react';

import { AddTransaction } from './AddTransaction';
import { TransactionHistory } from './TransactionHistory';
import { Analytics } from './Analytics';
import { SavingsGoal } from './SavingsGoal';
import { AchievementBadge } from './AchievementBadge';
import { SpendingFeedback } from './SpendingFeedback';
import { GamificationWidget } from '../gamification/GamificationWidget';

interface Transaction {
  id: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  timestamp: string;
  description: string;
}

interface SavingsGoalData {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Get data from localStorage
  const getLocalData = () => {
    try {
      const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const storedGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
      setTransactions(storedTransactions);
      setSavingsGoals(storedGoals);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Update data when storage changes
  useEffect(() => {
    getLocalData();
    
    const updateData = () => getLocalData();
    window.addEventListener('transactionsUpdated', updateData);
    window.addEventListener('savingsGoalsUpdated', updateData);
    
    return () => {
      window.removeEventListener('transactionsUpdated', updateData);
      window.removeEventListener('savingsGoalsUpdated', updateData);
    };
  }, []);

  // Calculate financial summary and achievements
  const calculateSummary = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const monthlyTransactions = transactions.filter(t => 
      new Date(t.timestamp) >= thisMonth
    );
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const balance = transactions.reduce((sum, t) => 
      sum + (t.type === 'income' ? t.amount : -t.amount), 0
    );
    
    // Calculate streak (consecutive days with transactions)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasTransaction = transactions.some(t => {
        const txDate = new Date(t.timestamp);
        return txDate >= dayStart && txDate <= dayEnd;
      });
      
      if (hasTransaction) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    // Calculate level based on transactions
    const level = Math.max(1, Math.floor(transactions.length / 10));
    
    // Calculate achievements
    const totalSavings = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const achievements: Achievement[] = [
      {
        id: '1',
        title: 'Saving Streak',
        description: 'Track expenses for 7 days straight',
        icon: 'flame',
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7
      },
      {
        id: '2',
        title: 'Transaction Master',
        description: 'Record 50 transactions',
        icon: 'trophy',
        unlocked: transactions.length >= 50,
        progress: Math.min(transactions.length, 50),
        maxProgress: 50
      },
      {
        id: '3',
        title: 'Emergency Fund',
        description: 'Save $1,000',
        icon: 'star',
        unlocked: balance >= 1000,
        progress: Math.min(balance, 1000),
        maxProgress: 1000
      }
    ];
    
    // Recent transactions (last 5)
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    // Active savings goals
    const activeGoals = savingsGoals.filter(goal => goal.currentAmount < goal.targetAmount);
    
    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      balance,
      streak,
      level,
      achievements,
      recentTransactions,
      activeGoals,
      totalTransactions: transactions.length,
      monthlyBudget: 3500 // Default budget
    };
  };

  const summary = calculateSummary();

  const getSavingsRateColor = (rate: number) => {
    if (rate >= 20) return 'text-success';
    if (rate >= 10) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto p-3 sm:p-4 pb-20 sm:pb-24 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex-1 min-w-0">
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Financial Dashboard
            </motion.h1>
            <motion.p 
              className="text-sm sm:text-base text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Track your income, expenses, and savings goals
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="bg-primary/10 text-primary px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border border-primary/20 min-h-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Level {summary.level}
            </motion.div>
            <motion.div 
              className="flex items-center gap-1 sm:gap-2 bg-success/10 text-success px-2 sm:px-3 py-2 rounded-lg border border-success/20 min-h-[44px] justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{summary.streak}</span>
            </motion.div>
            <Link to="/advanced">
              <motion.div 
                className="flex items-center gap-1 sm:gap-2 bg-purple-100 text-purple-600 px-2 sm:px-3 py-2 rounded-lg border border-purple-200 min-h-[44px] justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Advanced</span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto min-h-[44px]">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm min-h-[44px]">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm min-h-[44px]">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm min-h-[44px]">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm min-h-[44px]">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="mb-6"
            >
              <Card className="border shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Total Balance</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-foreground">
                      ${summary.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">
                        {summary.savingsRate.toFixed(1)}% savings rate
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[
                {
                  icon: ArrowUpRight,
                  label: 'Income',
                  value: `$${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  color: 'text-success',
                  delay: 0.6
                },
                {
                  icon: ArrowDownRight,
                  label: 'Expenses',
                  value: `$${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  color: 'text-destructive',
                  delay: 0.7
                },
                {
                  icon: DollarSign,
                  label: 'Net',
                  value: `${summary.netIncome >= 0 ? '+' : ''}$${summary.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  color: summary.netIncome >= 0 ? 'text-success' : 'text-destructive',
                  delay: 0.8
                },
                {
                  icon: PiggyBank,
                  label: 'Savings',
                  value: `${summary.savingsRate.toFixed(1)}%`,
                  color: getSavingsRateColor(summary.savingsRate),
                  delay: 0.9
                }
              ].map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: card.delay }}
                  whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="border shadow-sm bg-card">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                        <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                      </div>
                      <div className={`text-xl font-semibold ${card.color}`}>
                        {card.value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {card.label === 'Savings' ? 'Rate' : 'This month'}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Gamification Widget */}
            <div className="mb-8">
              <GamificationWidget />
            </div>

            {/* Spending Feedback Component */}
            <div className="mb-8">
              <SpendingFeedback 
                spent={summary.totalExpenses}
                budget={summary.monthlyBudget}
                remaining={summary.monthlyBudget - summary.totalExpenses}
              />
            </div>

            {/* Savings Goal Component */}
            <div className="mb-8">
              <SavingsGoal 
                current={summary.balance}
                goal={5000}
                percentage={(summary.balance / 5000) * 100}
              />
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="mb-8"
            >
              <Card className="border shadow-sm bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={() => setActiveTab('transactions')}
                        className="h-auto p-4 flex flex-col items-center gap-2 w-full"
                      >
                        <CreditCard className="w-6 h-6" />
                        <span>Add Transaction</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('goals')}
                        className="h-auto p-4 flex flex-col items-center gap-2 w-full"
                      >
                        <Target className="w-6 h-6" />
                        <span>Set Goal</span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            {summary.recentTransactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="mb-8"
              >
                <Card className="border shadow-sm bg-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Recent Transactions
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('transactions')}
                        >
                          View All
                        </Button>
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {summary.recentTransactions.map((transaction, index) => (
                      <motion.div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                        whileHover={{ x: 5, backgroundColor: 'rgba(var(--muted), 0.5)' }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.category} • {new Date(transaction.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="mb-8"
            >
              <Card className="border shadow-sm bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summary.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1.4 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <AchievementBadge 
                        achievement={achievement}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Empty State */}
            {summary.totalTransactions === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                whileHover={{ scale: 1.01 }}
                className="mb-8"
              >
                <Card className="border shadow-sm bg-card">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    </motion.div>
                    <motion.div 
                      className="text-lg font-medium text-foreground mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.7 }}
                    >
                      Welcome to FinTrack!
                    </motion.div>
                    <motion.div 
                      className="text-muted-foreground mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.8 }}
                    >
                      Start by adding your first transaction to begin tracking your finances
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button onClick={() => setActiveTab('transactions')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AddTransaction />
                <TransactionHistory />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnimatePresence mode="wait">
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Analytics />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <AnimatePresence mode="wait">
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SavingsGoal 
                  current={summary.balance}
                  goal={5000}
                  percentage={(summary.balance / 5000) * 100}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}