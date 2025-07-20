/**
 * AddMoneyDialog.tsx
 * 
 * Dialog component for adding money to existing goals.
 * Provides input validation and user feedback.
 * 
 * Features:
 * - Add money to specific goals
 * - Input validation for amount
 * - Real-time progress calculation
 * - Accessibility support
 * 
 * Dependencies:
 * - UI components: Dialog, Button, Input
 * - Goals context for state management
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useGoals, Goal } from '@/contexts/GoalsContext';
import { DollarSign, Target } from 'lucide-react';

/**
 * Add Money Dialog Props
 */
interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

/**
 * Add Money Dialog Component
 * Modal for adding money to specific goals
 */
export const AddMoneyDialog: React.FC<AddMoneyDialogProps> = ({
  open,
  onOpenChange,
  goal
}) => {
  const { addMoneyToGoal } = useGoals();
  
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setAmount('');
      setError('');
    }
  }, [open]);

  /**
   * Calculate new progress after adding money
   */
  const getNewProgress = (): { current: number; percentage: number; remaining: number } => {
    if (!goal || !amount) {
      return {
        current: goal?.current || 0,
        percentage: goal ? (goal.current / goal.target) * 100 : 0,
        remaining: goal ? goal.target - goal.current : 0
      };
    }

    const amountToAdd = parseFloat(amount);
    if (isNaN(amountToAdd)) {
      return {
        current: goal.current,
        percentage: (goal.current / goal.target) * 100,
        remaining: goal.target - goal.current
      };
    }

    const newCurrent = goal.current + amountToAdd;
    return {
      current: newCurrent,
      percentage: Math.min((newCurrent / goal.target) * 100, 100),
      remaining: Math.max(goal.target - newCurrent, 0)
    };
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!goal) return;

    // Validation
    if (!amount.trim()) {
      setError('Please enter an amount');
      return;
    }

    const amountToAdd = parseFloat(amount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (amountToAdd > 100000) {
      setError('Amount cannot exceed $100,000');
      return;
    }

    setIsSubmitting(true);

    try {
      addMoneyToGoal(goal.id, amountToAdd);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding money to goal:', error);
      setError('Failed to add money. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle amount input change
   */
  const handleAmountChange = (value: string): void => {
    setAmount(value);
    if (error) {
      setError('');
    }
  };

  if (!goal) return null;

  const newProgress = getNewProgress();
  const currentPercentage = (goal.current / goal.target) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="add-money-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Add Money to Goal
          </DialogTitle>
          <DialogDescription id="add-money-dialog-description">
            Add money to your "{goal.title}" goal and watch your progress grow!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Progress */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Progress</span>
              <span className="font-medium">
                ${goal.current.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${goal.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Progress value={currentPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-primary">
                {currentPercentage.toFixed(1)}% complete
              </span>
              <span className="text-muted-foreground">
                ${(goal.target - goal.current).toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? 'amount-error' : undefined}
                autoFocus
              />
              {error && (
                <p id="amount-error" className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Preview New Progress */}
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Target className="w-4 h-4" />
                  New Progress Preview
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">After adding ${parseFloat(amount).toFixed(2)}</span>
                  <span className="font-medium">
                    ${newProgress.current.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${goal.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Progress value={newProgress.percentage} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-primary">
                    {newProgress.percentage.toFixed(1)}% complete
                  </span>
                  {newProgress.remaining > 0 ? (
                    <span className="text-muted-foreground">
                      ${newProgress.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining
                    </span>
                  ) : (
                    <span className="font-medium text-success">
                      Goal Achieved! 🎉
                    </span>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !amount}>
                {isSubmitting ? 'Adding...' : 'Add Money'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
