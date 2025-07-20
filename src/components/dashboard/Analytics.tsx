/**
 * Analytics.tsx
 *
 * Advanced financial analytics dashboard with visual insights.
 * - Comprehensive spending breakdown with visual progress bars
 * - Monthly trends and patterns analysis
 * - Savings rate calculation and goal tracking
 * - Category-wise spending insights with icons
 * - Real-time data updates from localStorage
 * - Mobile-optimized responsive design
 *
 * Dependencies:
 * - React hooks for state management
 * - UI primitives: Card, Progress, Badge
 * - Lucide icons for categories and visual elements
 *
 * Features:
 * - Interactive spending breakdown
 * - Monthly comparison charts
 * - Savings rate visualization
 * - Spending pattern insights
 * - Category recommendations
 * - Financial health indicators
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Coffee,
  Car,
  Home,
  ShoppingCart,
  Utensils,
  Briefcase,
  Gift,
  Plus,
  CreditCard,
  ArrowUp,
  ArrowDown,
  BarChart3
} from 'lucide-react';

interface Transaction {
  id: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  timestamp: string;
  description: string;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  transactions: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}

const categoryIcons: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  'Food & Dining': { icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  'Transportation': { icon: Car, color: 'bg-blue-100 text-blue-700' },
  'Shopping': { icon: ShoppingCart, color: 'bg-purple-100 text-purple-700' },
  'Entertainment': { icon: Coffee, color: 'bg-pink-100 text-pink-700' },
  'Bills & Utilities': { icon: Home, color: 'bg-gray-100 text-gray-700' },
  'Healthcare': { icon: Plus, color: 'bg-red-100 text-red-700' },
  'Salary': { icon: Briefcase, color: 'bg-green-100 text-green-700' },
  'Freelance': { icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
  'Investment': { icon: TrendingUp, color: 'bg-teal-100 text-teal-700' },
  'Gift': { icon: Gift, color: 'bg-yellow-100 text-yellow-700' },
  'Other': { icon: CreditCard, color: 'bg-indigo-100 text-indigo-700' }
};

/**
 * Analytics Component Props
 */
interface AnalyticsProps {
  onNavigateToAddTransaction?: () => void;
}

export function Analytics({ onNavigateToAddTransaction }: AnalyticsProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Get transactions from localStorage
  const getLocalTransactions = (): Transaction[] => {
    try {
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    } catch {
      return [];
    }
  };

  // Update transactions when storage changes
  useEffect(() => {
    const updateTransactions = () => {
      setTransactions(getLocalTransactions());
    };

    updateTransactions();
    window.addEventListener('transactionsUpdated', updateTransactions);
    
    return () => {
      window.removeEventListener('transactionsUpdated', updateTransactions);
    };
  }, []);

  // Filter transactions by selected period
  const getFilteredTransactions = (): Transaction[] => {
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    return transactions.filter(t => new Date(t.timestamp) >= startDate);
  };

  // Calculate analytics data
  const calculateAnalytics = () => {
    const filteredTransactions = getFilteredTransactions();
    
    // Category breakdown for expenses
    const categoryMap: Record<string, { amount: number; count: number }> = {};
    let totalIncome = 0;
    let totalExpense = 0;
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = { amount: 0, count: 0 };
        }
        categoryMap[transaction.category].amount += transaction.amount;
        categoryMap[transaction.category].count += 1;
        totalExpense += transaction.amount;
      } else {
        totalIncome += transaction.amount;
      }
    });

    // Convert to array and calculate percentages
    const categoryData: CategoryData[] = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
        transactions: data.count,
        icon: categoryIcons[category]?.icon || CreditCard,
        color: categoryIcons[category]?.color || 'bg-gray-100 text-gray-700'
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trends
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const monthKey = new Date(transaction.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyMap[monthKey].income += transaction.amount;
      } else {
        monthlyMap[monthKey].expense += transaction.amount;
      }
    });

    const monthlyData: MonthlyData[] = Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        savings: data.income - data.expense,
        savingsRate: data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const netWorth = totalIncome - totalExpense;

    return {
      categoryData,
      monthlyData,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        savings: netWorth,
        savingsRate
      }
    };
  };

  const analytics = calculateAnalytics();

  const getSavingsRateColor = (rate: number) => {
    if (rate >= 20) return 'text-success';
    if (rate >= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getSavingsRateStatus = (rate: number) => {
    if (rate >= 20) return { icon: CheckCircle, message: 'Excellent savings rate!', color: 'text-success' };
    if (rate >= 10) return { icon: Target, message: 'Good progress, aim higher!', color: 'text-warning' };
    return { icon: AlertTriangle, message: 'Consider saving more', color: 'text-destructive' };
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Financial Analytics</h1>
          <p className="text-muted-foreground mt-2">Insights into your spending patterns</p>
        </div>

        {/* Period Selection - Mobile Optimized */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 sm:justify-center">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Time Period:</span>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {(['week', 'month', 'quarter'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className="capitalize text-xs sm:text-sm flex-1 sm:flex-none min-w-[80px] px-2 sm:px-3"
                  >
                    {period === 'week' ? 'Last 7 Days' : 
                     period === 'month' ? 'Last Month' : 'Last 3 Months'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-muted-foreground">Income</span>
              </div>
              <div className="text-xl font-semibold text-success">
                ${analytics.totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground">Expenses</span>
              </div>
              <div className="text-xl font-semibold text-destructive">
                ${analytics.totals.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Net</span>
              </div>
              <div className={`text-xl font-semibold ${
                analytics.totals.savings >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {analytics.totals.savings >= 0 ? '+' : ''}${analytics.totals.savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Savings Rate</span>
              </div>
              <div className={`text-xl font-semibold ${getSavingsRateColor(analytics.totals.savingsRate)}`}>
                {analytics.totals.savingsRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Rate Status */}
        {analytics.totals.income > 0 && (
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const status = getSavingsRateStatus(analytics.totals.savingsRate);
                  const StatusIcon = status.icon;
                  return (
                    <>
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                      <div>
                        <div className="font-medium text-foreground">Savings Rate: {analytics.totals.savingsRate.toFixed(1)}%</div>
                        <div className={`text-sm ${status.color}`}>{status.message}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spending by Category */}
        {analytics.categoryData.length > 0 && (
          <Card className="border shadow-sm bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.categoryData.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{category.category}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.transactions} transaction{category.transactions !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Monthly Trends */}
        {analytics.monthlyData.length > 0 && (
          <Card className="border shadow-sm bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.monthlyData.map((month) => (
                <div key={month.month} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-foreground">{month.month}</div>
                    <Badge variant={month.savings >= 0 ? 'secondary' : 'destructive'} className="text-xs">
                      {month.savings >= 0 ? '+' : ''}${month.savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Income:</span>
                      <span className="font-medium text-success">
                        +${month.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Expenses:</span>
                      <span className="font-medium text-destructive">
                        -${month.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  {month.income > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Savings Rate:</span>
                        <span className={`font-medium ${getSavingsRateColor(month.savingsRate)}`}>
                          {month.savingsRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Math.max(0, month.savingsRate)} className="h-1.5" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {analytics.categoryData.length === 0 && analytics.monthlyData.length === 0 && (
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium text-foreground mb-2">No Data Available</div>
              <div className="text-muted-foreground mb-4">
                Start adding transactions to see your financial analytics
              </div>
              <Button 
                variant="outline"
                onClick={onNavigateToAddTransaction || (() => console.warn('Navigation function not provided'))}
                className="hover:bg-primary hover:text-primary-foreground transition-colors border-primary/30 hover:border-primary"
                aria-label="Navigate to add new transaction"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Transaction
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
