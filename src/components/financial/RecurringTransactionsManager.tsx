/**
 * @fileoverview Recurring Transactions Management Component
 * 
 * A comprehensive component for managing recurring transactions including
 * subscriptions, salary, rent, and other regular income/expenses with
 * automation, reminders, and scheduling features.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  RefreshCw,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Bell,
  TrendingUp,
  TrendingDown,
  Repeat
} from 'lucide-react';
import { useFinancialData } from '../../hooks/use-financial-data';
import { RecurringTransaction, ScheduledTransaction } from '../../types/financial';

/**
 * Props for the RecurringTransactionsManager component
 */
interface RecurringTransactionsManagerProps {
  /** CSS class name */
  className?: string;
}

/**
 * Component for managing recurring transactions
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function RecurringTransactionsManager({ className = '' }: RecurringTransactionsManagerProps) {
  const {
    getRecurringTransactions,
    getScheduledTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    executeScheduledTransaction,
    isLoading
  } = useFinancialData();

  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const recurring = getRecurringTransactions();
        const scheduled = getScheduledTransactions(30); // Next 30 days
        setRecurringTransactions(recurring);
        setScheduledTransactions(scheduled);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    loadData();
  }, [getRecurringTransactions, getScheduledTransactions]);

  // Toggle transaction active status
  const toggleTransactionStatus = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive });
    setRecurringTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, isActive } : t)
    );
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      deleteRecurringTransaction(id);
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Execute scheduled transaction
  const handleExecuteTransaction = (id: string) => {
    executeScheduledTransaction(id);
    // Refresh scheduled transactions
    const updated = getScheduledTransactions(30);
    setScheduledTransactions(updated);
  };

  // Add new recurring transaction
  const handleAddRecurringTransaction = () => {
    try {
      // Create a sample recurring transaction
      const newTransaction: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Sample Salary',
        description: 'Monthly salary payment',
        amount: 50000,
        type: 'income',
        category: 'salary',
        recurrenceRule: {
          frequency: 'monthly',
          interval: 1,
          timezone: 'Asia/Kolkata'
        },
        startDate: new Date().toISOString(),
        isActive: true,
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        reminderSettings: {
          enabled: true,
          advanceDays: 3,
          reminderTime: '09:00',
          methods: ['push', 'email']
        },
        autoExecute: true,
        tags: ['salary', 'income']
      };

      // Add the transaction
      createRecurringTransaction(newTransaction);
      
      // Show success message
      alert(`✅ Recurring transaction "${newTransaction.name}" has been added!\n\nAmount: ${formatCurrency(newTransaction.amount)}\nType: ${newTransaction.type}\nFrequency: ${newTransaction.recurrenceRule.frequency}`);
      
      // Refresh the list
      const updatedTransactions = getRecurringTransactions();
      setRecurringTransactions(updatedTransactions);
      
    } catch (error) {
      console.error('Failed to add recurring transaction:', error);
      alert('❌ Failed to add recurring transaction. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get recurrence display text
  const getRecurrenceText = (rule: RecurringTransaction['recurrenceRule']) => {
    const { frequency, interval } = rule;
    if (interval === 1) {
      return frequency.toLowerCase();
    }
    return `Every ${interval} ${frequency.toLowerCase()}s`;
  };

  // Get status color
  const getStatusColor = (status: ScheduledTransaction['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'executed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'skipped': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get transaction type color
  const getTypeColor = (type: 'income' | 'expense') => {
    return type === 'income' 
      ? 'text-green-600 bg-green-50' 
      : 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - Updated with mobile-responsive layout */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Recurring Transactions
              </CardTitle>
              <CardDescription>
                Manage your recurring income and expenses with automation
              </CardDescription>
            </div>
            <Button 
              className="w-full sm:w-auto"
              onClick={handleAddRecurringTransaction}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Transactions</p>
              <p className="text-2xl font-bold">
                {recurringTransactions.filter(t => t.isActive).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(
                  recurringTransactions
                    .filter(t => t.type === 'income' && t.isActive)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(
                  recurringTransactions
                    .filter(t => t.type === 'expense' && t.isActive)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending This Week</p>
              <p className="text-2xl font-bold text-primary">
                {scheduledTransactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="recurring" className="w-full">
        <TabsList className="bg-muted rounded-lg shadow-sm p-1 flex gap-2 mb-8">
          <div className="flex sm:contents gap-1 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="recurring" className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Recurring Transactions</TabsTrigger>
            <TabsTrigger value="scheduled" className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Scheduled Transactions</TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="recurring" className="space-y-4 mt-6">
          {recurringTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No recurring transactions</p>
                <p className="text-sm text-muted-foreground">
                  Add your salary, rent, subscriptions, and other regular transactions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recurringTransactions.map((transaction) => (
                <Card key={transaction.id} className={`${!transaction.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {transaction.name}
                          <Badge className={getTypeColor(transaction.type)}>
                            {transaction.type === 'income' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {transaction.type}
                          </Badge>
                        </CardTitle>
                        {transaction.description && (
                          <CardDescription>{transaction.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTransactionStatus(transaction.id, !transaction.isActive)}
                        >
                          {transaction.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className={`font-bold text-lg ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="font-medium capitalize">
                          {getRecurrenceText(transaction.recurrenceRule)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Next Due</p>
                        <p className="font-medium">
                          {formatDate(transaction.nextDue)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Category</p>
                        <Badge variant="outline" className="capitalize">
                          {transaction.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Tags */}
                    {transaction.tags.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {transaction.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reminder Settings */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {transaction.reminderSettings.enabled 
                            ? `Reminder ${transaction.reminderSettings.advanceDays} days before`
                            : 'No reminders'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {transaction.autoExecute && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Auto-execute
                          </Badge>
                        )}
                        <Badge variant={transaction.isActive ? 'secondary' : 'outline'}>
                          {transaction.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          {scheduledTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No scheduled transactions</p>
                <p className="text-sm text-muted-foreground">
                  Transactions will appear here when they're due for execution
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Pending Transactions Alert */}
              {scheduledTransactions.some(t => t.status === 'pending') && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have {scheduledTransactions.filter(t => t.status === 'pending').length} pending transactions 
                    that require your attention.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                {scheduledTransactions.map((scheduled) => (
                  <Card key={scheduled.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{scheduled.recurringTransactionId}</h4>
                            <Badge className={getStatusColor(scheduled.status)}>
                              {scheduled.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>{' '}
                              <span className="font-medium">
                                {formatCurrency(scheduled.scheduledAmount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Due Date:</span>{' '}
                              <span className="font-medium">
                                {formatDate(scheduled.scheduledDate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span>{' '}
                              <span className="font-medium capitalize">{scheduled.category}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created:</span>{' '}
                              <span className="font-medium">
                                {formatDate(scheduled.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {scheduled.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm"
                              onClick={() => handleExecuteTransaction(scheduled.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Execute
                            </Button>
                            <Button variant="outline" size="sm">
                              <Clock className="w-4 h-4 mr-1" />
                              Postpone
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {scheduled.executedAt && (
                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          Executed on {formatDate(scheduled.executedAt)}
                          {scheduled.actualAmount && scheduled.actualAmount !== scheduled.scheduledAmount && (
                            <span className="ml-2">
                              (Actual: {formatCurrency(scheduled.actualAmount)})
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RecurringTransactionsManager;
