/**
 * GoalDialog.tsx
 * 
 * Modal dialog for creating and editing savings goals.
 * Provides form validation, accessibility features, and error handling.
 * 
 * Features:
 * - Create new goals with validation
 * - Edit existing goals
 * - Category selection with icons
 * - Date picker for deadlines
 * - Input validation and error messages
 * - Accessibility support (ARIA, keyboard navigation)
 * 
 * Dependencies:
 * - React Hook Form for form handling
 * - UI components: Dialog, Button, Input, Select
 * - Goals context for state management
 */

import React, { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGoals, Goal, CreateGoalData } from '@/contexts/GoalsContext';
import {
  Car,
  Home,
  Plane,
  GraduationCap,
  Heart,
  Gift,
  Target,
  Smartphone,
  Gamepad2,
  Coffee
} from 'lucide-react';

/**
 * Goal category options with icons
 */
const goalCategories = [
  { value: 'transport', label: 'Transportation', icon: Car, color: 'primary' },
  { value: 'housing', label: 'Housing', icon: Home, color: 'success' },
  { value: 'travel', label: 'Travel', icon: Plane, color: 'secondary' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: 'accent' },
  { value: 'wedding', label: 'Wedding', icon: Heart, color: 'warning' },
  { value: 'gifts', label: 'Gifts', icon: Gift, color: 'gold' },
  { value: 'emergency', label: 'Emergency', icon: Target, color: 'destructive' },
  { value: 'technology', label: 'Technology', icon: Smartphone, color: 'blue' },
  { value: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'purple' },
  { value: 'other', label: 'Other', icon: Coffee, color: 'gray' }
];

/**
 * Form data interface
 */
interface GoalFormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  category: string;
}

/**
 * Goal Dialog Props
 */
interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  mode: 'create' | 'edit';
}

/**
 * Goal Dialog Component
 * Modal for creating and editing goals with validation
 */
/**
 * Goal Dialog Component
 * Modal for creating and editing goals with validation
 */
export const GoalDialog: React.FC<GoalDialogProps> = ({
  open,
  onOpenChange,
  goal,
  mode
}) => {
  const { addGoal, updateGoal } = useGoals();
  
  // Form state
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    target: '',
    deadline: '',
    category: ''
  });
  
  const [errors, setErrors] = useState<Partial<GoalFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or goal changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && goal) {
        // Pre-populate form for editing
        setFormData({
          title: goal.title,
          description: goal.description,
          target: goal.target.toString(),
          deadline: goal.deadline.toISOString().split('T')[0],
          category: goal.category
        });
      } else {
        // Reset form for creating new goal
        setFormData({
          title: '',
          description: '',
          target: '',
          deadline: '',
          category: ''
        });
      }
      setErrors({});
    }
  }, [open, mode, goal]);

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof GoalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<GoalFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 50) {
      newErrors.title = 'Title must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (!formData.target) {
      newErrors.target = 'Target amount is required';
    } else {
      const target = parseFloat(formData.target);
      if (isNaN(target) || target <= 0) {
        newErrors.target = 'Target must be a valid number greater than 0';
      } else if (target > 1000000) {
        newErrors.target = 'Target must be less than $1,000,000';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Target date is required';
    } else {
      const deadline = new Date(formData.deadline);
      if (deadline <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const target = parseFloat(formData.target);
      const deadline = new Date(formData.deadline);
      
      const categoryData = goalCategories.find(cat => cat.value === formData.category);
      if (!categoryData) {
        setErrors(prev => ({ ...prev, category: 'Please select a valid category' }));
        return;
      }

      const goalData: CreateGoalData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target,
        deadline,
        category: formData.category,
        icon: categoryData.value,
        color: categoryData.color
      };

      if (mode === 'create') {
        addGoal(goalData);
      } else if (mode === 'edit' && goal) {
        updateGoal(goal.id, goalData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting goal:', error);
      setErrors(prev => ({ ...prev, title: 'Failed to save goal. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get minimum date for deadline input (tomorrow)
   */
  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const selectedCategoryData = goalCategories.find(cat => cat.value === formData.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="goal-dialog-description">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Goal' : 'Edit Goal'}
          </DialogTitle>
          <DialogDescription id="goal-dialog-description">
            {mode === 'create' 
              ? 'Set up a new savings goal to track your progress towards your dreams.'
              : 'Update your goal details and target amount.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Emergency Fund, Dream Vacation"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal and why it's important to you"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Amount ($)</Label>
            <Input
              id="target"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={formData.target}
              onChange={(e) => handleInputChange('target', e.target.value)}
              aria-invalid={!!errors.target}
              aria-describedby={errors.target ? 'target-error' : undefined}
            />
            {errors.target && (
              <p id="target-error" className="text-sm text-destructive" role="alert">
                {errors.target}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => handleInputChange('category', value)}
              value={formData.category}
            >
              <SelectTrigger
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {goalCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.category && (
              <p id="category-error" className="text-sm text-destructive" role="alert">
                {errors.category}
              </p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Target Date</Label>
            <Input
              id="deadline"
              type="date"
              min={getMinDate()}
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              aria-invalid={!!errors.deadline}
              aria-describedby={errors.deadline ? 'deadline-error' : undefined}
            />
            {errors.deadline && (
              <p id="deadline-error" className="text-sm text-destructive" role="alert">
                {errors.deadline}
              </p>
            )}
          </div>

          {/* Category Preview */}
          {selectedCategoryData && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <selectedCategoryData.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedCategoryData.label} goal
              </span>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Saving...')
                : (mode === 'create' ? 'Create Goal' : 'Save Changes')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
