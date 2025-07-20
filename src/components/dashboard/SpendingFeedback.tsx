/**
 * SpendingFeedback.tsx
 *
 * Real-time spending feedback component for Fintrack GenZ Vision dashboard.
 * - Provides color-coded status, progress bar, and motivational messaging.
 * - Calculates budget remaining and spending percentage.
 *
 * Dependencies:
 * - Lucide React icons for status indication
 * - UI primitives: Card, Progress, Badge
 *
 * Edge Cases & Limitations:
 * - Spending percentage capped at 100%; negative values not allowed.
 * - Status logic assumes fixed thresholds.
 *
 * TODO: Add backend integration, error handling, and accessibility improvements.
 */

/**
 * Spending Feedback Component - Real-time visual spending indicators
 * 
 * Provides immediate feedback on spending habits with:
 * - Color-coded spending status
 * - Dynamic progress bars with glow effects
 * - Motivational messaging
 * - Budget remaining calculations
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface SpendingFeedbackProps {
  spent: number;
  budget: number;
  remaining: number;
}

/**
 * SpendingFeedback
 * Renders spending status and feedback based on budget and spent amount.
 * @param {SpendingFeedbackProps} props - Spent, budget, remaining
 * @returns {JSX.Element} Spending feedback UI
 */
export function SpendingFeedback({ spent, budget, remaining }: SpendingFeedbackProps) {
  const spendingPercentage = (spent / budget) * 100;
  
  // Determine spending status with softer messaging
  const getSpendingStatus = () => {
    if (spendingPercentage <= 60) {
      return {
        status: 'good',
        icon: CheckCircle,
        message: "Great progress",
        description: "You're staying within budget",
        className: 'spending-good'
      };
    } else if (spendingPercentage <= 85) {
      return {
        status: 'warning',
        icon: Zap,
        message: "Budget alert",
        description: "Consider monitoring your spending",
        className: 'spending-warning'
      };
    } else {
      return {
        status: 'danger',
        icon: AlertTriangle,
        message: "Over budget",
        description: "You've exceeded your monthly limit",
        className: 'spending-danger'
      };
    }
  };

  const statusInfo = getSpendingStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="border shadow-sm bg-card">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              statusInfo.status === 'good' ? 'bg-success/10' :
              statusInfo.status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
            }`}>
              <StatusIcon className={`w-5 h-5 ${
                statusInfo.status === 'good' ? 'text-success' :
                statusInfo.status === 'warning' ? 'text-warning' : 'text-destructive'
              }`} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Monthly Budget</span>
          </div>
          <Badge className={`${statusInfo.className} border text-xs font-medium`}>
            {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">
                ${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-sm text-muted-foreground">
                of ${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })} budget
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${
                remaining >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                {remaining >= 0 ? 'remaining' : 'over budget'}
              </p>
            </div>
          </div>

          {/* Professional Progress Bar */}
          <div className="relative">
            <Progress 
              value={Math.min(spendingPercentage, 100)} 
              className={`h-2 ${
                statusInfo.status === 'good' ? 'bg-success/10' :
                statusInfo.status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
              }`}
            />
          </div>

          {/* Status Message - Professional styling */}
          <div className={`p-4 rounded-lg border ${statusInfo.className}`}>
            <p className="font-medium text-sm">{statusInfo.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{statusInfo.description}</p>
          </div>

          {/* Daily Spending Rate */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Daily average</span>
            <span className="font-medium text-foreground">
              ${(spent / new Date().getDate()).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}