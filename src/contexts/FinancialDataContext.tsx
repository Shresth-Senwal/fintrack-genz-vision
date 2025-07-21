/**
 * @fileoverview Financial Data Context Provider
 * 
 * This context manages advanced financial features including bank statement import,
 * investment suggestions, smart budgeting, and recurring transaction management.
 * It provides centralized state management and actions for financial data operations.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  BankStatement,
  ParsedTransaction,
  ReconciliationResult,
  InvestmentProfile,
  InvestmentRecommendation,
  InvestmentSuggestion,
  BudgetAnalysis,
  BudgetAlert,
  RecurringTransaction,
  ScheduledTransaction,
  DataExport,
  ExportFilters,
  FinancialDataContextType,
  ImportError,
  RiskProfile,
} from '../types/financial';
import { useAuth } from './AuthContext';
import { 
  BANK_PATTERNS, 
  TRANSACTION_CATEGORIES, 
  RISK_PROFILES, 
  RECURRING_PATTERNS 
} from '../constants/gamification';
import { aiService } from '../services/aiService';

// Financial data state interface
interface FinancialDataState {
  bankStatements: BankStatement[];
  investmentProfile: InvestmentProfile | null;
  budgetAlerts: BudgetAlert[];
  recurringTransactions: RecurringTransaction[];
  scheduledTransactions: ScheduledTransaction[];
  exportHistory: DataExport[];
  isLoading: boolean;
  error: string | null;
}

// Action types for the reducer
type FinancialDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_BANK_STATEMENT'; payload: BankStatement }
  | { type: 'UPDATE_BANK_STATEMENT'; payload: { id: string; updates: Partial<BankStatement> } }
  | { type: 'SET_INVESTMENT_PROFILE'; payload: InvestmentProfile }
  | { type: 'ADD_BUDGET_ALERT'; payload: BudgetAlert }
  | { type: 'REMOVE_BUDGET_ALERT'; payload: string }
  | { type: 'ADD_RECURRING_TRANSACTION'; payload: RecurringTransaction }
  | { type: 'UPDATE_RECURRING_TRANSACTION'; payload: { id: string; updates: Partial<RecurringTransaction> } }
  | { type: 'REMOVE_RECURRING_TRANSACTION'; payload: string }
  | { type: 'ADD_SCHEDULED_TRANSACTION'; payload: ScheduledTransaction }
  | { type: 'UPDATE_SCHEDULED_TRANSACTION'; payload: { id: string; updates: Partial<ScheduledTransaction> } }
  | { type: 'ADD_DATA_EXPORT'; payload: DataExport };

// Initial state
const initialState: FinancialDataState = {
  bankStatements: [],
  investmentProfile: null,
  budgetAlerts: [],
  recurringTransactions: [],
  scheduledTransactions: [],
  exportHistory: [],
  isLoading: false,
  error: null,
};

// Reducer function
function financialDataReducer(state: FinancialDataState, action: FinancialDataAction): FinancialDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_BANK_STATEMENT':
      return {
        ...state,
        bankStatements: [...state.bankStatements, action.payload],
      };

    case 'UPDATE_BANK_STATEMENT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        bankStatements: state.bankStatements.map(statement =>
          statement.id === id ? { ...statement, ...updates } : statement
        ),
      };
    }

    case 'SET_INVESTMENT_PROFILE':
      return {
        ...state,
        investmentProfile: action.payload,
      };

    case 'ADD_BUDGET_ALERT':
      return {
        ...state,
        budgetAlerts: [...state.budgetAlerts, action.payload],
      };

    case 'REMOVE_BUDGET_ALERT':
      return {
        ...state,
        budgetAlerts: state.budgetAlerts.filter(alert => alert.id !== action.payload),
      };

    case 'ADD_RECURRING_TRANSACTION':
      return {
        ...state,
        recurringTransactions: [...state.recurringTransactions, action.payload],
      };

    case 'UPDATE_RECURRING_TRANSACTION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map(transaction =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        ),
      };
    }

    case 'REMOVE_RECURRING_TRANSACTION':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.filter(
          transaction => transaction.id !== action.payload
        ),
      };

    case 'ADD_SCHEDULED_TRANSACTION':
      return {
        ...state,
        scheduledTransactions: [...state.scheduledTransactions, action.payload],
      };

    case 'UPDATE_SCHEDULED_TRANSACTION': {
      const { id, updates } = action.payload;
      return {
        ...state,
        scheduledTransactions: state.scheduledTransactions.map(transaction =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        ),
      };
    }

    case 'ADD_DATA_EXPORT':
      return {
        ...state,
        exportHistory: [...state.exportHistory, action.payload],
      };

    default:
      return state;
  }
}

// Helper functions for bank statement parsing
function detectBankFromText(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const [bank, patterns] of Object.entries(BANK_PATTERNS)) {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      return bank;
    }
  }
  
  return undefined;
}

function categorizeParsedTransaction(description: string): string {
  const lowerDescription = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(TRANSACTION_CATEGORIES)) {
    if (keywords.some(keyword => lowerDescription.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  return 'Other';
}

function parseCSVTransaction(row: string[], headers: string[]): ParsedTransaction {
  const getField = (fieldNames: string[]) => {
    for (const name of fieldNames) {
      const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
      if (index !== -1 && row[index]) {
        return row[index].trim();
      }
    }
    return '';
  };

  const date = getField(['date', 'transaction date', 'value date']);
  const description = getField(['description', 'particulars', 'narration', 'details']);
  const debitAmount = getField(['debit', 'withdrawal', 'debit amount']);
  const creditAmount = getField(['credit', 'deposit', 'credit amount']);
  const balance = getField(['balance', 'running balance', 'available balance']);
  const reference = getField(['reference', 'ref no', 'transaction id', 'cheque no']);

  const isCredit = creditAmount && parseFloat(creditAmount) > 0;
  const amount = parseFloat(isCredit ? creditAmount : debitAmount) || 0;
  
  return {
    id: `parsed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date(date).toISOString(),
    description: description || 'Unknown Transaction',
    amount: Math.abs(amount),
    type: isCredit ? 'credit' : 'debit',
    category: categorizeParsedTransaction(description),
    balance: balance ? parseFloat(balance) : undefined,
    reference: reference || undefined,
    isReconciled: false,
    confidence: description && amount > 0 ? 0.9 : 0.5,
  };
}

async function parseCSVFile(file: File): Promise<{ transactions: ParsedTransaction[]; errors: ImportError[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 2) {
          resolve({ 
            transactions: [], 
            errors: [{ message: 'CSV file must contain at least a header and one data row', severity: 'error' }] 
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        const transactions: ParsedTransaction[] = [];
        const errors: ImportError[] = [];

        for (let i = 1; i < lines.length; i++) {
          try {
            const row = lines[i].split(',').map(cell => cell.trim().replace(/['"]/g, ''));
            if (row.length !== headers.length) {
              errors.push({
                row: i + 1,
                message: `Row has ${row.length} columns but expected ${headers.length}`,
                severity: 'warning',
              });
              continue;
            }

            const transaction = parseCSVTransaction(row, headers);
            if (transaction.amount > 0) {
              transactions.push(transaction);
            } else {
              errors.push({
                row: i + 1,
                message: 'Unable to parse transaction amount',
                severity: 'warning',
              });
            }
          } catch (error) {
            errors.push({
              row: i + 1,
              message: `Failed to parse row: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'error',
            });
          }
        }

        resolve({ transactions, errors });
      } catch (error) {
        resolve({ 
          transactions: [], 
          errors: [{ 
            message: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            severity: 'error' 
          }] 
        });
      }
    };

    reader.readAsText(file);
  });
}

// Create context
const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

// Export context for hook usage
export { FinancialDataContext };

// Provider component
export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financialDataReducer, initialState);
  const { user } = useAuth();

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`financial_data_${user.uid}`);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          // Restore state from saved data
          Object.entries(data).forEach(([key, value]) => {
            if (key === 'investmentProfile' && value) {
              dispatch({ type: 'SET_INVESTMENT_PROFILE', payload: value as InvestmentProfile });
            }
            // Add other state restoration logic as needed
          });
        } catch (error) {
          console.error('Failed to load financial data:', error);
        }
      }
    }
  }, [user]);

  // Save user data to localStorage
  useEffect(() => {
    if (user) {
      const dataToSave = {
        investmentProfile: state.investmentProfile,
        recurringTransactions: state.recurringTransactions,
        // Don't save sensitive data like bank statements locally
      };
      localStorage.setItem(`financial_data_${user.uid}`, JSON.stringify(dataToSave));
    }
  }, [user, state.investmentProfile, state.recurringTransactions]);

  // Bank statement import
  const importStatement = useCallback(async (file: File): Promise<BankStatement> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const bankStatement: BankStatement = {
        id: `statement_${Date.now()}`,
        fileName: file.name,
        fileType: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv',
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        statementPeriod: {
          startDate: '',
          endDate: '',
        },
        transactionCount: 0,
        errors: [],
      };

      dispatch({ type: 'ADD_BANK_STATEMENT', payload: bankStatement });

      // Simulate processing delay
      setTimeout(async () => {
        try {
          if (bankStatement.fileType === 'csv') {
            const { transactions, errors } = await parseCSVFile(file);
            
            // Detect bank from file content or name
            const bankName = detectBankFromText(file.name);

            dispatch({
              type: 'UPDATE_BANK_STATEMENT',
              payload: {
                id: bankStatement.id,
                updates: {
                  status: 'completed',
                  processedAt: new Date().toISOString(),
                  bankName,
                  transactionCount: transactions.length,
                  errors,
                  statementPeriod: {
                    startDate: transactions.length > 0 ? transactions[transactions.length - 1].date : '',
                    endDate: transactions.length > 0 ? transactions[0].date : '',
                  },
                },
              },
            });
          } else {
            // PDF parsing implementation
            const { parsePDFBankStatement, detectBankType } = await import('../lib/pdfParser');
            
            try {
              // First read a sample to detect bank type
              const sampleText = await file.text().catch(() => '');
              const bankType = detectBankType(sampleText);
              
              console.log(`🏦 Detected bank type: ${bankType}`);
              
              // Parse PDF with detected bank type
              const { transactions, errors: parseErrors } = await parsePDFBankStatement(file, {
                bankType: bankType as 'hdfc' | 'icici' | 'sbi' | 'axis' | 'generic',
                maxPages: 10,
                confidenceThreshold: 0.7
              });
              
              console.log(`📊 Parsed ${transactions.length} transactions from PDF`);
              
              dispatch({
                type: 'UPDATE_BANK_STATEMENT',
                payload: {
                  id: bankStatement.id,
                  updates: {
                    status: transactions.length > 0 ? 'completed' : 'failed',
                    processedAt: new Date().toISOString(),
                    bankName: bankType.toUpperCase(),
                    transactionCount: transactions.length,
                    errors: parseErrors,
                    statementPeriod: {
                      startDate: transactions.length > 0 ? transactions[transactions.length - 1].date : '',
                      endDate: transactions.length > 0 ? transactions[0].date : '',
                    },
                  },
                },
              });
              
              // If successful, add transactions to financial data (for now, just log them)
              if (transactions.length > 0) {
                console.log(`✅ Successfully imported ${transactions.length} transactions from PDF`);
                // TODO: Integrate with actual transaction storage when backend is ready
              }
              
            } catch (pdfError) {
              console.error('❌ PDF parsing error:', pdfError);
              
              dispatch({
                type: 'UPDATE_BANK_STATEMENT',
                payload: {
                  id: bankStatement.id,
                  updates: {
                    status: 'failed',
                    errors: [{ 
                      message: pdfError instanceof Error ? pdfError.message : 'PDF parsing failed', 
                      severity: 'error' 
                    }],
                  },
                },
              });
            }
          }
        } catch (error) {
          dispatch({
            type: 'UPDATE_BANK_STATEMENT',
            payload: {
              id: bankStatement.id,
              updates: {
                status: 'failed',
                errors: [{ 
                  message: error instanceof Error ? error.message : 'Unknown processing error', 
                  severity: 'error' 
                }],
              },
            },
          });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }, 2000);

      return bankStatement;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Import failed' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  // Get import history
  const getImportHistory = useCallback(() => {
    return state.bankStatements;
  }, [state.bankStatements]);

  // Reconcile transactions (placeholder implementation)
  const reconcileTransactions = useCallback(async (statementId: string): Promise<ReconciliationResult> => {
    // This would integrate with the existing transaction system
    // For now, return a mock result
    return {
      newTransactions: [],
      duplicates: [],
      conflicts: [],
      summary: {
        totalImported: 0,
        newCount: 0,
        duplicateCount: 0,
        conflictCount: 0,
      },
    };
  }, []);

  // Update investment profile
  const updateInvestmentProfile = useCallback((profile: Partial<InvestmentProfile>) => {
    const updatedProfile: InvestmentProfile = {
      ...state.investmentProfile,
      ...profile,
    } as InvestmentProfile;
    
    dispatch({ type: 'SET_INVESTMENT_PROFILE', payload: updatedProfile });
  }, [state.investmentProfile]);

  // Get investment suggestions (mock implementation)
  const getInvestmentSuggestions = useCallback(async (
    riskProfile: RiskProfile = 'moderate', 
    amount: number = 10000, 
    horizon: number = 12
  ): Promise<InvestmentSuggestion[]> => {
    // Mock investment suggestions based on parameters
    const profileData = RISK_PROFILES[riskProfile];
    
    return [
      {
        id: 'suggestion_1',
        name: 'SBI BlueChip Fund',
        description: 'Large-cap equity mutual fund with consistent performance',
        category: 'mutual-fund',
        fundType: 'equity_mutual_funds',
        expectedReturn: profileData.expectedReturn,
        riskLevel: riskProfile,
        pros: ['Professional management', 'Diversification', 'Growth potential'],
        cons: ['Market risk', 'Management fees', 'No guaranteed returns'],
        minimumInvestment: 500,
        rating: 4,
        features: ['SIP Available', 'Tax Saving', 'Lock-in 3 years'],
        lockInPeriod: horizon < 36 ? 0 : 36,
        allocation: {
          equity: 70,
          debt: 20,
          cash: 10
        }
      },
      {
        id: 'suggestion_2',
        name: 'HDFC Balanced Advantage Fund',
        description: 'Dynamic asset allocation fund balancing equity and debt',
        category: 'mutual-fund',
        fundType: 'hybrid_funds',
        expectedReturn: profileData.expectedReturn - 2,
        riskLevel: riskProfile,
        pros: ['Balanced approach', 'Professional management', 'Lower volatility'],
        cons: ['Moderate returns', 'Complexity', 'Fund manager dependency'],
        minimumInvestment: 1000,
        rating: 4,
        features: ['Dynamic allocation', 'SIP Available', 'No lock-in'],
        allocation: {
          equity: 50,
          debt: 45,
          cash: 5
        }
      },
      {
        id: 'suggestion_3',
        name: 'SBI Fixed Deposit',
        description: 'Risk-free investment with guaranteed returns',
        category: 'fixed-deposit',
        fundType: 'fixed_deposits',
        expectedReturn: 6.5,
        riskLevel: 'conservative',
        pros: ['Guaranteed returns', 'No market risk', 'DICGC insured'],
        cons: ['Lower returns', 'Inflation risk', 'Liquidity constraints'],
        minimumInvestment: 1000,
        rating: 3,
        features: ['Guaranteed returns', 'DICGC insured', 'Flexible tenure'],
        lockInPeriod: horizon
      }
    ];
  }, []);

  const calculateExpectedReturns = useCallback((principal: number, rate: number, years: number): number => {
    // Compound interest calculation
    return principal * Math.pow((1 + rate / 100), years);
  }, []);

  // Analyze budget (mock implementation)
  const analyzeBudget = useCallback(async (): Promise<BudgetAnalysis> => {
    try {
      // Get all transactions from bank statements (mock data for now)
      const allTransactions: Array<{
        type: 'credit' | 'debit';
        amount: number;
        category: string;
        date: string;
      }> = [];
      
      // For now, use mock transaction data since BankStatement doesn't include transactions
      // In a real implementation, transactions would be stored separately
      const mockTransactions = [
        { type: 'credit' as const, amount: 50000, category: 'income', date: '2024-01-15' },
        { type: 'debit' as const, amount: 12000, category: 'food', date: '2024-01-16' },
        { type: 'debit' as const, amount: 8000, category: 'transport', date: '2024-01-17' },
        { type: 'debit' as const, amount: 6000, category: 'entertainment', date: '2024-01-18' },
        { type: 'debit' as const, amount: 5000, category: 'shopping', date: '2024-01-19' },
        { type: 'debit' as const, amount: 4000, category: 'utilities', date: '2024-01-20' },
      ];
      
      allTransactions.push(...mockTransactions);

      // Calculate basic metrics
      const totalIncome = allTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = allTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate category breakdown
      const categoryBreakdown: Record<string, { amount: number; count: number }> = {};
      allTransactions
        .filter(t => t.type === 'debit')
        .forEach(t => {
          if (!categoryBreakdown[t.category]) {
            categoryBreakdown[t.category] = { amount: 0, count: 0 };
          }
          categoryBreakdown[t.category].amount += t.amount;
          categoryBreakdown[t.category].count += 1;
        });

      // Use AI service for advanced analysis
      const budgetData = Object.fromEntries(
        Object.entries(categoryBreakdown).map(([category, data]) => [category, data.amount])
      );
      const aiAnalysis = await aiService.analyzeBudget(allTransactions, budgetData);

      // Generate insights and recommendations
      const insights = aiAnalysis.insights.map(insight => ({
        type: 'opportunity' as const,
        category: 'general',
        message: insight,
        impact: 'medium' as const,
        actionable: true,
        suggestedActions: []
      }));

      const recommendations = aiAnalysis.recommendations.map((rec, index) => ({
        id: `rec_${index + 1}`,
        title: rec,
        description: rec,
        category: 'general',
        currentBudget: 0,
        suggestedBudget: 0,
        reasoning: rec,
        confidence: 0.7,
        potentialSavings: 0,
        difficulty: 'easy' as const,
        priority: 'medium' as const,
        impact: rec,
        steps: [],
        actions: []
      }));

      // Convert AI alerts to budget alerts
      aiAnalysis.alerts.forEach(alert => {
        dispatch({
          type: 'ADD_BUDGET_ALERT',
          payload: {
            id: `alert_${Date.now()}_${Math.random()}`,
            title: alert.message,
            type: 'exceeded_limit',
            category: alert.category,
            severity: alert.type === 'success' ? 'info' : alert.type,
            message: alert.message,
            currentAmount: 0,
            budgetLimit: 0,
            percentage: 0,
            suggestedAction: alert.message,
            dismissible: true,
            createdAt: new Date().toISOString()
          }
        });
      });

      return {
        userId: user?.uid || 'anonymous',
        analysisDate: new Date().toISOString(),
        period: 'monthly',
        totalIncome,
        totalExpenses,
        incomeChange: 0, // Would calculate from historical data
        expenseChange: 0, // Would calculate from historical data
        healthScore: totalIncome > 0 ? Math.min(100, Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100)) : 0,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          amount: data.amount,
          change: 0 // Would calculate from historical data
        })),
        trends: insights.slice(0, 2).map(insight => ({
          description: insight.message,
          direction: 'improving' as const,
          impact: 'medium' as const
        })),
        spendingPatterns: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          averageAmount: data.amount / data.count,
          trend: 'stable' as const,
          variability: 'low' as const,
          seasonality: false,
          peakDays: [],
          percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
        })),
        recommendations,
        insights,
        confidence: 0.8,
      };
    } catch (error) {
      console.error('Budget analysis failed:', error);
      // Return fallback analysis
      return {
        userId: user?.uid || 'anonymous',
        analysisDate: new Date().toISOString(),
        period: 'monthly',
        totalIncome: 0,
        totalExpenses: 0,
        incomeChange: 0,
        expenseChange: 0,
        healthScore: 0,
        categoryBreakdown: [],
        trends: [],
        spendingPatterns: [],
        recommendations: [],
        insights: [],
        confidence: 0,
      };
    }
  }, [state.bankStatements, user]);

  // Apply budget recommendation
  const applyBudgetRecommendation = useCallback((recommendation) => {
    // Implementation would integrate with budget system
    console.log('Applying budget recommendation:', recommendation);
  }, []);

  // Get budget alerts
  const getBudgetAlerts = useCallback(() => {
    // Return mock alerts for demonstration
    return [
      {
        id: 'alert_1',
        title: 'Entertainment Budget Exceeded',
        type: 'exceeded_limit' as const,
        category: 'entertainment',
        severity: 'warning' as const,
        message: 'You have exceeded your entertainment budget by 25% this month',
        currentAmount: 6000,
        budgetLimit: 4800,
        percentage: 125,
        suggestedAction: 'Consider reducing entertainment expenses for the rest of the month',
        dismissible: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'alert_2', 
        title: 'Unusual Spending Detected',
        type: 'unusual_spending' as const,
        category: 'shopping',
        severity: 'info' as const,
        message: 'Your shopping expenses are 40% higher than usual this week',
        currentAmount: 2000,
        budgetLimit: 1500,
        percentage: 133,
        suggestedAction: 'Review recent purchases and avoid impulse buying',
        dismissible: true,
        createdAt: new Date().toISOString()
      }
    ];
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    dispatch({ type: 'REMOVE_BUDGET_ALERT', payload: alertId });
  }, []);

  // Create recurring transaction
  const createRecurringTransaction = useCallback((transaction: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: RecurringTransaction = {
      ...transaction,
      id: `recurring_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_RECURRING_TRANSACTION', payload: newTransaction });
  }, []);

  // Update recurring transaction
  const updateRecurringTransaction = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    dispatch({
      type: 'UPDATE_RECURRING_TRANSACTION',
      payload: {
        id,
        updates: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }, []);

  // Delete recurring transaction
  const deleteRecurringTransaction = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_RECURRING_TRANSACTION', payload: id });
  }, []);

  // Get recurring transactions
  const getRecurringTransactions = useCallback(() => {
    return state.recurringTransactions;
  }, [state.recurringTransactions]);

  // Get scheduled transactions
  const getScheduledTransactions = useCallback((days = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return state.scheduledTransactions.filter(
      transaction => new Date(transaction.scheduledDate) <= futureDate
    );
  }, [state.scheduledTransactions]);

  // Execute scheduled transaction
  const executeScheduledTransaction = useCallback((id: string, actualAmount?: number) => {
    dispatch({
      type: 'UPDATE_SCHEDULED_TRANSACTION',
      payload: {
        id,
        updates: {
          status: 'executed',
          executedAt: new Date().toISOString(),
          actualAmount,
        },
      },
    });
  }, []);

  // Export data (mock implementation)
  const exportData = useCallback(async (type: DataExport['type'], format: DataExport['format'], filters?: ExportFilters): Promise<DataExport> => {
    const exportRequest: DataExport = {
      id: `export_${Date.now()}`,
      type,
      format,
      requestedAt: new Date().toISOString(),
      status: 'requested',
      filters,
    };
    
    dispatch({ type: 'ADD_DATA_EXPORT', payload: exportRequest });
    
    // Mock processing
    setTimeout(() => {
      // Update the export record (not a bank statement)
      const updatedExport = {
        ...exportRequest,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        downloadUrl: `https://example.com/exports/${exportRequest.id}.${format}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fileSize: 1024,
        recordCount: 100,
      };
      
      dispatch({ type: 'ADD_DATA_EXPORT', payload: updatedExport });
    }, 3000);
    
    return exportRequest;
  }, []);

  // Get export history
  const getExportHistory = useCallback(() => {
    return state.exportHistory;
  }, [state.exportHistory]);

  const contextValue: FinancialDataContextType = {
    // Bank Statement Import
    importStatement,
    getImportHistory,
    reconcileTransactions,
    
    // Investment Suggestions
    updateInvestmentProfile,
    getInvestmentSuggestions,
    calculateExpectedReturns,
    investmentProfile: state.investmentProfile,
    
    // Smart Budgeting
    analyzeBudget,
    applyBudgetRecommendation,
    getBudgetAlerts,
    dismissAlert,
    
    // Recurring Transactions
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    getRecurringTransactions,
    getScheduledTransactions,
    executeScheduledTransaction,
    
    // Data Export
    exportData,
    getExportHistory,
    
    isLoading: state.isLoading,
    error: state.error,
  };

  return (
    <FinancialDataContext.Provider value={contextValue}>
      {children}
    </FinancialDataContext.Provider>
  );
}
