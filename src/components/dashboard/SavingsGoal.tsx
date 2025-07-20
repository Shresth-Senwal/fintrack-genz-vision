/**
 * SavingsGoal.tsx
 *
 * Enhanced savings goal management system with multiple goals support.
 * - Create, track, and manage multiple savings goals
 * - Visual progress tracking with milestone markers
 * - Goal adjustment and deadline management
 * - Local data persistence with real-time updates
 * - Mobile-optimized interface with touch-friendly interactions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  PiggyBank, 
  Target, 
  Trophy, 
  Plus, 
  Calendar,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SavingsGoalData {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface SavingsGoalProps {
  current?: number;
  goal?: number;
  percentage?: number;
}

interface NewGoalForm {
  title: string;
  targetAmount: string;
  deadline: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const defaultCategories = [
  'Emergency Fund',
  'Vacation',
  'New Car',
  'House Down Payment',
  'Electronics',
  'Education',
  'Investment',
  'Other'
];

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200'
};

export function SavingsGoal({ current = 0, goal = 5000, percentage = 0 }: SavingsGoalProps) {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'Other',
    priority: 'medium'
  });

  // Get savings goals from localStorage
  const getLocalSavingsGoals = (): SavingsGoalData[] => {
    try {
      return JSON.parse(localStorage.getItem('savingsGoals') || '[]');
    } catch {
      return [];
    }
  };

  // Save savings goals to localStorage
  const saveLocalSavingsGoals = (goals: SavingsGoalData[]) => {
    localStorage.setItem('savingsGoals', JSON.stringify(goals));
    window.dispatchEvent(new Event('savingsGoalsUpdated'));
  };

  // Load savings goals on component mount
  useEffect(() => {
    const loadGoals = () => {
      setSavingsGoals(getLocalSavingsGoals());
    };

    loadGoals();
    window.addEventListener('savingsGoalsUpdated', loadGoals);
    window.addEventListener('transactionsUpdated', loadGoals);

    return () => {
      window.removeEventListener('savingsGoalsUpdated', loadGoals);
      window.removeEventListener('transactionsUpdated', loadGoals);
    };
  }, []);

  // Handle creating a new goal
  const handleCreateGoal = () => {
    if (!newGoal.title.trim() || !newGoal.targetAmount || !newGoal.deadline) {
      return;
    }

    const goalData: SavingsGoalData = {
      id: `goal_${Date.now()}`,
      title: newGoal.title.trim(),
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
      category: newGoal.category,
      priority: newGoal.priority,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...savingsGoals, goalData];
    setSavingsGoals(updatedGoals);
    saveLocalSavingsGoals(updatedGoals);

    // Reset form
    setNewGoal({
      title: '',
      targetAmount: '',
      deadline: '',
      category: 'Other',
      priority: 'medium'
    });
    setIsDialogOpen(false);
  };

  // Handle deleting a goal
  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = savingsGoals.filter(g => g.id !== goalId);
    setSavingsGoals(updatedGoals);
    saveLocalSavingsGoals(updatedGoals);
  };

  // Handle updating goal progress
  const handleAddToGoal = (goalId: string, amount: number) => {
    const updatedGoals = savingsGoals.map(goalData => 
      goalData.id === goalId 
        ? { ...goalData, currentAmount: Math.min(goalData.currentAmount + amount, goalData.targetAmount) }
        : goalData
    );
    setSavingsGoals(updatedGoals);
    saveLocalSavingsGoals(updatedGoals);
  };

  // Get status for a goal
  const getGoalStatus = (goalData: SavingsGoalData) => {
    const progress = (goalData.currentAmount / goalData.targetAmount) * 100;
    const daysLeft = Math.ceil((new Date(goalData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) {
      return { status: 'completed', message: 'Goal achieved!', color: 'text-success', icon: CheckCircle };
    } else if (daysLeft < 0) {
      return { status: 'overdue', message: 'Past deadline', color: 'text-destructive', icon: AlertCircle };
    } else if (daysLeft <= 30) {
      return { status: 'urgent', message: `${daysLeft} days left`, color: 'text-warning', icon: Calendar };
    } else {
      return { status: 'active', message: `${daysLeft} days left`, color: 'text-muted-foreground', icon: Calendar };
    }
  };

  // Quick amount buttons
  const quickAmounts = [10, 25, 50, 100];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div>
          <motion.h2 
            className="text-2xl font-semibold text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Savings Goals
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Track your progress towards financial goals
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Name</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Emergency Fund, Vacation"
                />
              </div>
              <div>
                <Label htmlFor="amount">Target Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {defaultCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </motion.div>
      </motion.div>

      {/* Goals List */}
      {savingsGoals.length > 0 ? (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {savingsGoals
            .sort((a, b) => {
              // Sort by priority then by deadline
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              }
              return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            })
            .map((goalData, index) => {
              const progress = (goalData.currentAmount / goalData.targetAmount) * 100;
              const status = getGoalStatus(goalData);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={goalData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                >
                  <Card className="border shadow-sm bg-card">
                    <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Goal Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{goalData.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className={priorityColors[goalData.priority]} variant="outline">
                                  {goalData.priority}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{goalData.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={status.color}>{status.message}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goalData.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            ${goalData.currentAmount.toFixed(2)} / ${goalData.targetAmount.toFixed(2)}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                      </div>

                      {/* Quick Add Buttons */}
                      {progress < 100 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Quick add:</p>
                          <div className="flex gap-2">
                            {quickAmounts.map(amount => (
                              <Button
                                key={amount}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToGoal(goalData.id, amount)}
                                className="flex-1"
                              >
                                +${amount}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goal Achievement */}
                      {progress >= 100 && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                          <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
                          <div className="font-medium text-success">Goal Achieved!</div>
                          <div className="text-sm text-success/70 mt-1">
                            Congratulations on reaching your savings goal!
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
        </motion.div>
      ) : (
        /* Empty State */
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium text-foreground mb-2">No Savings Goals Yet</div>
            <div className="text-muted-foreground mb-6">
              Create your first savings goal to start tracking your progress
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overall Progress Card (if using legacy props) */}
      {(current > 0 || goal > 0) && savingsGoals.length === 0 && (
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-primary" />
              </div>
              Overall Savings Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                ${current.toFixed(2)} / ${goal.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-primary">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(percentage, 100)} className="h-3" />
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground mb-1">
                ${(goal - current).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">remaining to reach your goal</div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
