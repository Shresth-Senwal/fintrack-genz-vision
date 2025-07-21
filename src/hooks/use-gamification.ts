/**
 * @fileoverview Gamification Hook
 * 
 * Custom hook to access the gamification context and its functionality.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import { useContext } from 'react';
import { GamificationContext } from '../contexts/GamificationContext';

// Hook to use gamification context
export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
