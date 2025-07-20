/**
 * TransactionHistory.tsx
 *
 * Enhanced transaction history component with filtering and better UX.
 * - Professional card design with categorized transactions
 * - Search and filter functionality
 * - Visual transaction type indicators
 * - Responsive layout with smooth animations
 * - Real-time updates from localStorage
 *
 * Dependencies:
 * - React hooks for state and effects
 * - UI primitives: Card, Button, Input, Badge
 * - Lucide icons for categories and actions
 *
 * Features:
 * - Live transaction updates
 * - Category-based filtering
 * - Search by description
 * - Visual transaction indicators
 * - Balance impact display
 * - Mobile-optimized layout
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  DollarSign,
  Coffee,
  Car,
  Home,
  ShoppingCart,
  Utensils,
  Briefcase,
  Gift,
  Plus,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  timestamp: string;
  type: 'income' | 'expense';
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Shopping': ShoppingCart,
  'Entertainment': Coffee,
  'Bills & Utilities': Home,
  'Healthcare': Plus,
  'Salary': Briefcase,
  'Freelance': DollarSign,
  'Investment': TrendingUp,
  'Gift': Gift,
  'Other': CreditCard
};

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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

    // Initial load
    updateTransactions();

    // Listen for storage updates
    window.addEventListener('transactionsUpdated', updateTransactions);
    
    return () => {
      window.removeEventListener('transactionsUpdated', updateTransactions);
    };
  }, []);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Get unique categories for filter
  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

  // Calculate totals for filtered transactions
  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || CreditCard;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-2">Track your spending and income</p>
        </div>

        {/* Summary Cards */}
        {filteredTransactions.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="border shadow-sm bg-card">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-muted-foreground">Income</span>
                </div>
                <div className="text-xl font-semibold text-success">
                  +${totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  -${totals.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="flex-1"
              >
                All
              </Button>
              <Button
                variant={filterType === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('income')}
                className={`flex-1 ${filterType === 'income' ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}`}
              >
                <ArrowUpCircle className="w-3 h-3 mr-1" />
                Income
              </Button>
              <Button
                variant={filterType === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('expense')}
                className="flex-1"
              >
                <ArrowDownCircle className="w-3 h-3 mr-1" />
                Expenses
              </Button>
            </div>

            {/* Category Filter */}
            {uniqueCategories.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Categories</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    All Categories
                  </Button>
                  {uniqueCategories.slice(0, 4).map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Transactions
              {filteredTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {filteredTransactions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <div className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' || selectedCategory 
                    ? 'No transactions match your filters'
                    : 'No transactions yet. Add your first transaction!'
                  }
                </div>
                {(searchTerm || filterType !== 'all' || selectedCategory) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setSelectedCategory('');
                    }}
                    className="mt-3"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction, index) => {
                  const Icon = getCategoryIcon(transaction.category);
                  const isIncome = transaction.type === 'income';
                  
                  return (
                    <div key={transaction.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isIncome 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground truncate">
                              {transaction.description}
                            </h3>
                            <div className={`text-lg font-semibold ${
                              isIncome ? 'text-success' : 'text-destructive'
                            }`}>
                              {isIncome ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(transaction.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
