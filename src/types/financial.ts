/**
 * @fileoverview Type definitions for financial data import and investment features
 * 
 * This file contains TypeScript interfaces for bank statement import, investment
 * suggestions, smart budgeting, and recurring transaction management features.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

// Bank Statement Import Types
export interface BankStatement {
  id: string;
  fileName: string;
  fileType: 'csv' | 'pdf';
  uploadedAt: string;
  processedAt?: string;
  status: 'processing' | 'completed' | 'failed';
  bankName?: string;
  accountNumber?: string; // Last 4 digits only for security
  statementPeriod: {
    startDate: string;
    endDate: string;
  };
  transactionCount: number;
  errors: ImportError[];
}

export interface ImportError {
  row?: number;
  field?: string;
  message: string;
  severity: 'warning' | 'error';
  suggestion?: string;
}

export interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  subcategory?: string;
  balance?: number;
  reference?: string;
  isReconciled: boolean;
  confidence: number; // 0-1 for parsing confidence
  duplicateOf?: string; // ID of existing transaction if duplicate
}

export interface ReconciliationResult {
  newTransactions: ParsedTransaction[];
  duplicates: ParsedTransaction[];
  conflicts: TransactionConflict[];
  summary: {
    totalImported: number;
    newCount: number;
    duplicateCount: number;
    conflictCount: number;
  };
}

export interface TransactionConflict {
  importedTransaction: ParsedTransaction;
  existingTransaction: {
    id: string;
    amount: number;
    description: string;
    category: string;
    timestamp: string;
    type: 'income' | 'expense';
  };
  conflictType: 'amount_mismatch' | 'date_mismatch' | 'description_mismatch';
  suggestion: 'use_imported' | 'use_existing' | 'merge' | 'create_new';
}

// Investment Suggestion Types

/**
 * Risk profile for investments
 */
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface InvestmentProfile {
  riskTolerance: RiskProfile;
  investmentHorizon: 'short' | 'medium' | 'long'; // <2 years, 2-5 years, >5 years
  monthlyInvestmentCapacity: number;
  preferredInstruments: InvestmentInstrument[];
  goals: InvestmentGoal[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  age: number;
  employmentStatus: 'employed' | 'self_employed' | 'student' | 'retired';
}

export type InvestmentInstrument = 
  | 'equity_mutual_funds'
  | 'debt_mutual_funds'
  | 'hybrid_funds'
  | 'index_funds'
  | 'etf'
  | 'stocks'
  | 'bonds'
  | 'fixed_deposits'
  | 'ppf'
  | 'nps'
  | 'gold';

export interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  timeHorizon: number; // months
  priority: 'high' | 'medium' | 'low';
  currentAmount: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface InvestmentSuggestion {
  id: string;
  goalId?: string;
  name: string; // Updated from fundName
  description: string; // Added description
  category: string; // Added category for filtering
  fundType: InvestmentInstrument;
  suggestedSIP?: number;
  expectedReturn: number; // Annual percentage
  riskLevel: RiskProfile; // Updated to use RiskProfile
  rationale?: string;
  pros: string[];
  cons: string[];
  minimumInvestment: number;
  expenseRatio?: number;
  rating: number; // 1-5 stars
  isRecommended?: boolean;
  disclaimer?: string;
  features: string[]; // Added features array
  lockInPeriod?: number; // Added lock-in period
  allocation?: Record<string, number>; // Added asset allocation
}

export interface InvestmentRecommendation {
  profileId: string;
  goalId: string;
  suggestions: InvestmentSuggestion[];
  portfolioAllocation: PortfolioAllocation[];
  monthlySIPBreakdown: SIPBreakdown[];
  projectedReturns: ProjectedReturns;
  risks: string[];
  generatedAt: string;
  validUntil: string;
}

export interface PortfolioAllocation {
  instrument: InvestmentInstrument;
  percentage: number;
  amount: number;
  rationale: string;
}

export interface SIPBreakdown {
  fundName: string;
  monthlyAmount: number;
  percentage: number;
  expectedReturn: number;
}

export interface ProjectedReturns {
  conservative: number;
  moderate: number;
  optimistic: number;
  timeHorizon: number;
  assumptions: string[];
}

// Smart Budget Recommendations Types
export interface BudgetAnalysis {
  userId: string;
  analysisDate: string;
  period: 'weekly' | 'monthly' | 'quarterly';
  spendingPatterns: SpendingPattern[];
  recommendations: BudgetRecommendation[];
  insights: BudgetInsight[];
  confidence: number; // 0-1
  // Additional properties for smart analysis
  totalIncome: number;
  totalExpenses: number;
  incomeChange: number; // % change from previous period
  expenseChange: number; // % change from previous period
  healthScore: number; // 0-100 budget health score
  categoryBreakdown: CategoryBreakdown[];
  trends: BudgetTrend[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  change?: number; // % change from previous period
}

export interface BudgetTrend {
  category?: string;
  description: string;
  direction: 'improving' | 'worsening' | 'stable';
  impact: 'low' | 'medium' | 'high';
}

export interface SpendingPattern {
  category: string;
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  variability: 'low' | 'medium' | 'high';
  seasonality: boolean;
  peakDays: string[]; // Days of week or month
  percentage: number; // Of total spending
}

export interface BudgetRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  currentBudget: number;
  suggestedBudget: number;
  reasoning: string;
  confidence: number;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  impact: string;
  steps: string[];
  actions: string[];
}

export interface BudgetInsight {
  type: 'overspending' | 'underspending' | 'trend' | 'opportunity' | 'warning';
  category?: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions?: string[];
}

export interface BudgetAlert {
  id: string;
  title: string;
  type: 'approaching_limit' | 'exceeded_limit' | 'unusual_spending' | 'budget_opportunity';
  category: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  currentAmount: number;
  budgetLimit: number;
  percentage: number;
  suggestedAction: string;
  dismissible: boolean;
  createdAt: string;
}

// Recurring Transaction Types
export interface RecurringTransaction {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  recurrenceRule: RecurrenceRule;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastExecuted?: string;
  nextDue: string;
  reminderSettings: ReminderSettings;
  autoExecute: boolean; // Whether to automatically create transactions
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval: number; // Every N days/weeks/months
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  weekOfMonth?: number; // 1-4 for monthly (e.g., first Monday)
  monthOfYear?: number; // 1-12 for yearly
  customRule?: string; // For complex patterns
  timezone: string;
}

export interface ReminderSettings {
  enabled: boolean;
  advanceDays: number; // How many days before to remind
  reminderTime: string; // HH:MM format
  methods: ('push' | 'email' | 'sms')[];
  customMessage?: string;
}

export interface ScheduledTransaction {
  id: string;
  recurringTransactionId: string;
  scheduledDate: string;
  amount: number;
  scheduledAmount: number; // Amount originally scheduled
  category: string; // Category from recurring transaction
  status: 'pending' | 'executed' | 'skipped' | 'failed';
  executedAt?: string;
  actualAmount?: number;
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  createdAt: string; // When this scheduled instance was created
}

export interface RecurringTransactionSummary {
  totalRecurring: number;
  activeCount: number;
  inactiveCount: number;
  upcomingThisMonth: ScheduledTransaction[];
  overdueTransactions: ScheduledTransaction[];
  monthlyProjection: {
    income: number;
    expenses: number;
    netCashFlow: number;
  };
  categoryBreakdown: {
    category: string;
    amount: number;
    count: number;
  }[];
}

// Data Import/Export Types
export interface DataExport {
  id: string;
  type: 'transactions' | 'goals' | 'budgets' | 'full_data';
  format: 'csv' | 'json' | 'pdf' | 'excel';
  requestedAt: string;
  completedAt?: string;
  status: 'requested' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  filters?: ExportFilters;
  fileSize?: number;
  recordCount?: number;
}

export interface ExportFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  transactionTypes?: ('income' | 'expense')[];
  amountRange?: {
    min: number;
    max: number;
  };
  includeDeleted?: boolean;
}

// Context Types for New Features
export interface FinancialDataContextType {
  // Bank Statement Import
  importStatement: (file: File) => Promise<BankStatement>;
  getImportHistory: () => BankStatement[];
  reconcileTransactions: (statementId: string) => Promise<ReconciliationResult>;
  
  // Investment Suggestions
  updateInvestmentProfile: (profile: Partial<InvestmentProfile>) => void;
  getInvestmentSuggestions: (riskProfile?: RiskProfile, amount?: number, horizon?: number) => Promise<InvestmentSuggestion[]>;
  calculateExpectedReturns: (principal: number, rate: number, years: number) => number;
  investmentProfile: InvestmentProfile | null;
  
  // Smart Budgeting
  analyzeBudget: () => Promise<BudgetAnalysis>;
  applyBudgetRecommendation: (recommendation: BudgetRecommendation) => void;
  getBudgetAlerts: () => BudgetAlert[];
  dismissAlert: (alertId: string) => void;
  
  // Recurring Transactions
  createRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  getRecurringTransactions: () => RecurringTransaction[];
  getScheduledTransactions: (days?: number) => ScheduledTransaction[];
  executeScheduledTransaction: (id: string, actualAmount?: number) => void;
  
  // Data Export
  exportData: (type: DataExport['type'], format: DataExport['format'], filters?: ExportFilters) => Promise<DataExport>;
  getExportHistory: () => DataExport[];
  
  isLoading: boolean;
  error: string | null;
}
