/**
 * GoalsPage.tsx
 *
 * Gamified savings goals management page for Fintrack GenZ Vision.
 * - Displays multiple goals with progress, templates, achievements, and social sharing.
 * - Integrates with GoalsContext for CRUD operations and persistence.
 * - Provides functional goal creation, editing, deletion, and money addition.
 *
 * Dependencies:
 * - Lucide React icons for goal categories
 * - UI primitives: Card, Button, Progress, Badge
 * - GoalsContext for state management
 * - Dialog components for goal operations
 *
 * Features:
 * - Functional goal creation and editing
 * - Add money to goals with progress tracking
 * - Delete goals with confirmation
 * - Achievement tracking and milestones
 * - Goal templates for quick setup
 * - Responsive design for mobile and desktop
 *
 * Accessibility:
 * - ARIA labels and descriptions
 * - Keyboard navigation support
 * - Screen reader friendly
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Target, 
  Plus, 
  Car, 
  Home, 
  Plane, 
  GraduationCap,
  Heart,
  Gift,
  Trophy,
  Calendar,
  Edit2,
  Trash2,
  DollarSign
} from 'lucide-react';
import { useGoals, Goal } from '@/contexts/GoalsContext';
import { GoalDialog } from './GoalDialog';
import { AddMoneyDialog } from './AddMoneyDialog';
/**
 * Goal templates for quick goal creation
 */
const goalTemplates = [
  { icon: Car, title: 'Car Fund', target: 10000, color: 'primary', category: 'transport' },
  { icon: Home, title: 'House Down Payment', target: 50000, color: 'success', category: 'housing' },
  { icon: Plane, title: 'Travel Fund', target: 3000, color: 'secondary', category: 'travel' },
  { icon: GraduationCap, title: 'Education', target: 15000, color: 'accent', category: 'education' },
  { icon: Heart, title: 'Wedding', target: 25000, color: 'warning', category: 'wedding' },
  { icon: Gift, title: 'Gift Fund', target: 500, color: 'gold', category: 'gifts' }
];

/**
 * GoalsPage Component
 * Main goals management interface with full CRUD functionality
 */
export function GoalsPage() {
  const { 
    goals, 
    deleteGoal, 
    getTotalSaved, 
    getActiveGoalsCount, 
    loading, 
    error 
  } = useGoals();
  
  // Dialog states
  const [goalDialog, setGoalDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    goal: Goal | null;
  }>({
    open: false,
    mode: 'create',
    goal: null
  });
  
  const [addMoneyDialog, setAddMoneyDialog] = useState<{
    open: boolean;
    goal: Goal | null;
  }>({
    open: false,
    goal: null
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    goal: Goal | null;
  }>({
    open: false,
    goal: null
  });

  /**
   * Calculate progress percentage for a goal
   */
  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  /**
   * Calculate days remaining until deadline
   */
  const getDaysRemaining = (deadline: Date): number => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /**
   * Handle creating a new goal
   */
  const handleCreateGoal = (): void => {
    setGoalDialog({
      open: true,
      mode: 'create',
      goal: null
    });
  };

  /**
   * Handle editing an existing goal
   */
  const handleEditGoal = (goal: Goal): void => {
    setGoalDialog({
      open: true,
      mode: 'edit',
      goal
    });
  };

  /**
   * Handle opening add money dialog
   */
  const handleAddMoney = (goal: Goal): void => {
    setAddMoneyDialog({
      open: true,
      goal
    });
  };

  /**
   * Handle opening delete confirmation
   */
  const handleDeleteGoal = (goal: Goal): void => {
    setDeleteDialog({
      open: true,
      goal
    });
  };

  /**
   * Confirm goal deletion
   */
  const confirmDeleteGoal = (): void => {
    if (deleteDialog.goal) {
      deleteGoal(deleteDialog.goal.id);
      setDeleteDialog({ open: false, goal: null });
    }
  };

  /**
   * Handle creating goal from template
   */
  const handleCreateFromTemplate = (template: typeof goalTemplates[0]): void => {
    setGoalDialog({
      open: true,
      mode: 'create',
      goal: {
        id: '',
        title: template.title,
        description: `Save for ${template.title.toLowerCase()}`,
        target: template.target,
        current: 0,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        category: template.category,
        icon: template.category,
        color: template.color,
        isAchieved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  };

  /**
   * Get icon component for goal
   */
  const getGoalIcon = (iconName: string): React.ComponentType<{ className?: string }> => {
    switch (iconName) {
      case 'plane': return Plane;
      case 'car': return Car;
      case 'transport': return Car;
      case 'housing': return Home;
      case 'travel': return Plane;
      case 'education': return GraduationCap;
      case 'wedding': return Heart;
      case 'gifts': return Gift;
      default: return Target;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your goals...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center pb-24">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter(goal => !goal.isAchieved);
  const achievedGoals = goals.filter(goal => goal.isAchieved);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Your Goals
          </h1>
          <p className="text-muted-foreground">Turn dreams into reality</p>
        </div>
        <Button 
          onClick={handleCreateGoal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label="Create new savings goal"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-primary">
              {getActiveGoalsCount()}
            </div>
            <div className="text-sm text-muted-foreground">Active Goals</div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-success">
              ${getTotalSaved().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">Total Saved</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Active Goals</h2>
          {activeGoals.map((goal) => {
            const percentage = getProgressPercentage(goal.current, goal.target);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining < 0;
            const GoalIcon = getGoalIcon(goal.icon);
            
            return (
              <Card key={goal.id} className="border shadow-sm bg-card">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GoalIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        ${goal.current.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${goal.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-primary/10"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-primary">
                        {percentage.toFixed(1)}% complete
                      </span>
                      <span className="text-muted-foreground">
                        ${(goal.target - goal.current).toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining
                      </span>
                    </div>
                  </div>

                  {/* Achievement milestones */}
                  {percentage >= 25 && (
                    <div className="flex flex-wrap gap-2">
                      {percentage >= 25 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
                          <Trophy className="w-3 h-3 mr-1" />
                          Quarter Way
                        </Badge>
                      )}
                      {percentage >= 50 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
                          <Trophy className="w-3 h-3 mr-1" />
                          Halfway Hero
                        </Badge>
                      )}
                      {percentage >= 75 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
                          <Trophy className="w-3 h-3 mr-1" />
                          Almost There
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-9"
                      onClick={() => handleEditGoal(goal)}
                      aria-label={`Edit ${goal.title} goal`}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleAddMoney(goal)}
                      aria-label={`Add money to ${goal.title} goal`}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Add Money
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3"
                      onClick={() => handleDeleteGoal(goal)}
                      aria-label={`Delete ${goal.title} goal`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Achieved Goals 🎉</h2>
          {achievedGoals.map((goal) => {
            const GoalIcon = getGoalIcon(goal.icon);
            
            return (
              <Card key={goal.id} className="border shadow-sm bg-card opacity-75">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <GoalIcon className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                          {goal.title}
                          <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                            Achieved
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-success">
                        ${goal.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-muted-foreground">Goal reached!</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Templates */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Popular Goals</h2>
        <div className="grid grid-cols-2 gap-3">
          {goalTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <Card 
                key={index} 
                className="border shadow-sm bg-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCreateFromTemplate(template)}
                role="button"
                tabIndex={0}
                aria-label={`Create ${template.title} goal with target of $${template.target.toLocaleString()}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCreateFromTemplate(template);
                  }
                }}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{template.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      ${template.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-4">Start your savings journey by creating your first goal!</p>
          <Button onClick={handleCreateGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <GoalDialog
        open={goalDialog.open}
        onOpenChange={(open) => setGoalDialog(prev => ({ ...prev, open }))}
        goal={goalDialog.goal}
        mode={goalDialog.mode}
      />

      <AddMoneyDialog
        open={addMoneyDialog.open}
        onOpenChange={(open) => setAddMoneyDialog(prev => ({ ...prev, open }))}
        goal={addMoneyDialog.goal}
      />

      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.goal?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGoal} className="bg-destructive hover:bg-destructive/90">
              Delete Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}