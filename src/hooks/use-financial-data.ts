/**
 * @fileoverview Financial Data Hook
 * 
 * Custom hook to access the financial data context and its functionality.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import { useContext } from 'react';
import { FinancialDataContext } from '../contexts/FinancialDataContext';

// Hook to use financial data context
export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}
