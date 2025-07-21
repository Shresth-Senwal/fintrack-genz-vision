/**
 * @fileoverview Smart Budget Analysis Component
 * 
 * An intelligent budgeting component that analyzes spending patterns,
 * provides personalized budget recommendations, and sends alerts for
 * overspending or unusual spending behavior.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  PieChart,
  BarChart3,
  DollarSign,
  Lightbulb,
  Bell,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useFinancialData } from '../../hooks/use-financial-data';
import { BudgetAlert, BudgetAnalysis, BudgetRecommendation } from '../../types/financial';

/**
 * Props for the SmartBudgetAnalysis component
 */
interface SmartBudgetAnalysisProps {
  /** CSS class name */
  className?: string;
}

/**
 * Component for smart budget analysis and recommendations
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function SmartBudgetAnalysis({ className = '' }: SmartBudgetAnalysisProps) {
  const {
    analyzeBudget,
    applyBudgetRecommendation,
    getBudgetAlerts,
    dismissAlert,
    isLoading
  } = useFinancialData();

  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<BudgetRecommendation | null>(null);

  // Load budget analysis
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const analysis = await analyzeBudget();
        setBudgetAnalysis(analysis);
        
        const currentAlerts = getBudgetAlerts();
        setAlerts(currentAlerts);
      } catch (error) {
        console.error('Failed to load budget analysis:', error);
      }
    };

    loadAnalysis();
  }, [analyzeBudget, getBudgetAlerts]);

  // Handle alert dismissal
  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Apply recommendation
  const handleApplyRecommendation = (recommendation: BudgetRecommendation) => {
    try {
      // Apply the recommendation logic
      applyBudgetRecommendation(recommendation);
      
      // Show success feedback
      alert(`✅ Recommendation applied: ${recommendation.title}\n\nThis will help you save ${formatCurrency(recommendation.potentialSavings)} per month.`);
      
      setSelectedRecommendation(null);
      
      // Refresh analysis
      analyzeBudget().then(setBudgetAnalysis);
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      alert('❌ Failed to apply recommendation. Please try again.');
    }
  };

  // View recommendation details
  const handleViewDetails = (recommendation: BudgetRecommendation) => {
    setSelectedRecommendation(recommendation);
    
    // Show detailed information in a modal or expand the card
    const details = `
📊 Recommendation Details

Title: ${recommendation.title}
Description: ${recommendation.description}
Category: ${recommendation.category}
Priority: ${recommendation.priority}
Difficulty: ${recommendation.difficulty}

💰 Financial Impact:
- Current Budget: ${formatCurrency(recommendation.currentBudget)}
- Suggested Budget: ${formatCurrency(recommendation.suggestedBudget)}
- Potential Savings: ${formatCurrency(recommendation.potentialSavings)}

🎯 Implementation Steps:
${recommendation.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

💡 Reasoning: ${recommendation.reasoning}
    `;
    
    alert(details);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  // Get alert color - Updated to use theme-aware colors
  const getAlertColor = (severity: BudgetAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'info': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Get alert icon
  const getAlertIcon = (severity: BudgetAlert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Bell className="w-4 h-4" />;
      case 'info': return <Lightbulb className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Analyzing your budget...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetAnalysis) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No budget analysis available</p>
            <p className="text-sm text-muted-foreground">
              Add some transactions to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alerts Section - Updated with theme-aware styling */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Budget Alerts ({alerts.length})
          </h3>
          {alerts.map((alert) => (
            <Alert key={alert.id} className={`${getAlertColor(alert.severity)} border`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.severity)}
                  <div>
                    <AlertDescription className="font-medium">
                      {alert.title}
                    </AlertDescription>
                    <AlertDescription className="text-sm mt-1">
                      {alert.message}
                    </AlertDescription>
                    {alert.category && (
                      <Badge variant="secondary" className="mt-2">
                        {alert.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismissAlert(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Budget Analysis
          </CardTitle>
          <CardDescription>
            AI-powered insights into your spending patterns and budget health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(budgetAnalysis.totalIncome)}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {budgetAnalysis.incomeChange > 0 ? (
                  <ArrowUp className="w-3 h-3 text-success" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-destructive" />
                )}
                <span className={budgetAnalysis.incomeChange > 0 ? 'text-success' : 'text-destructive'}>
                  {Math.abs(budgetAnalysis.incomeChange)}% vs last month
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(budgetAnalysis.totalExpenses)}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {budgetAnalysis.expenseChange > 0 ? (
                  <ArrowUp className="w-3 h-3 text-destructive" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-success" />
                )}
                <span className={budgetAnalysis.expenseChange > 0 ? 'text-destructive' : 'text-success'}>
                  {Math.abs(budgetAnalysis.expenseChange)}% vs last month
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercentage(budgetAnalysis.totalIncome - budgetAnalysis.totalExpenses, budgetAnalysis.totalIncome)}%
              </p>
              <div className="flex items-center gap-1 text-sm">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Target: 20%</span>
              </div>
            </div>
          </div>

          {/* Budget Health Score */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Budget Health Score</h4>
              <Badge variant={budgetAnalysis.healthScore >= 80 ? 'secondary' : budgetAnalysis.healthScore >= 60 ? 'default' : 'destructive'}>
                {budgetAnalysis.healthScore}/100
              </Badge>
            </div>
            <Progress value={budgetAnalysis.healthScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {budgetAnalysis.healthScore >= 80 
                ? 'Excellent! Your budget is very healthy.' 
                : budgetAnalysis.healthScore >= 60 
                ? 'Good budget management with room for improvement.' 
                : 'Your budget needs attention. Consider the recommendations below.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAnalysis.categoryBreakdown.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{category.category}</span>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(category.amount)}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatPercentage(category.amount, budgetAnalysis.totalExpenses)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={parseFloat(formatPercentage(category.amount, budgetAnalysis.totalExpenses))} 
                        className="flex-1 h-2" 
                      />
                      {category.change !== undefined && (
                        <Badge variant={category.change > 0 ? 'destructive' : 'secondary'} className="text-xs">
                          {category.change > 0 ? '+' : ''}{category.change}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Spending Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">Positive Trends</h4>
                    <ul className="space-y-2">
                      {budgetAnalysis.trends.filter(t => t.direction === 'improving').map((trend, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingDown className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{trend.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600">Areas of Concern</h4>
                    <ul className="space-y-2">
                      {budgetAnalysis.trends.filter(t => t.direction === 'worsening').map((trend, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-red-600 mt-0.5" />
                          <span className="text-sm">{trend.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {budgetAnalysis.recommendations.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        recommendation.priority === 'high' ? 'destructive' :
                        recommendation.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {recommendation.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-green-600">
                        Save {formatCurrency(recommendation.potentialSavings)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Impact</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.impact}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Steps to Implement</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {recommendation.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApplyRecommendation(recommendation)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply Recommendation
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleViewDetails(recommendation)}
                        disabled={isLoading}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SmartBudgetAnalysis;
