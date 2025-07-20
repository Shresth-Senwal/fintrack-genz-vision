/**
 * Index.tsx
 *
 * Main finance app page for Fintrack GenZ Vision.
 * - Mobile-first, gamified UI for Gen Z users.
 * - Integrates Dashboard, GoalsPage, and BottomNav components.
 * - Handles tab switching and renders active tab content.
 *
 * Dependencies:
 * - UI primitives: Dashboard, GoalsPage, BottomNav
 *
 * Edge Cases & Limitations:
 * - All tab content is currently static; replace with API integration.
 * - Add transaction, insights, and profile features are placeholders.
 *
 * TODO: Add backend integration, error handling, and accessibility improvements.
 */

/**
 * Main Finance App - Gen Z Personal Finance & Investment App
 * 
 * Features:
 * - Mobile-first responsive design
 * - Gamified saving goals and achievements
 * - Real-time spending feedback
 * - Interactive bottom navigation
 * - Vibrant, engaging UI for Gen Z users
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { GoalsPage } from '@/components/goals/GoalsPage';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Analytics } from '@/components/dashboard/Analytics';
import { UserProfile } from '@/components/profile/UserProfile';
import { AddTransaction } from '@/components/dashboard/AddTransaction';
import { FinancialChatbot } from '@/components/chatbot/FinancialChatbot';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface UserData {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  goals: string[];
}

/**
 * Index
 * Renders the main app UI with tab navigation and content switching.
 * @returns {JSX.Element} Main app UI
 */
const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState<UserData | undefined>();

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const savingsGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

        // Calculate financial data
        const thisMonth = new Date();
        thisMonth.setDate(1);
        
        const monthlyTransactions = transactions.filter((t: any) => 
          new Date(t.timestamp) >= thisMonth
        );
        
        const totalIncome = monthlyTransactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const totalExpenses = monthlyTransactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const balance = transactions.reduce((sum: number, t: any) => 
          sum + (t.type === 'income' ? t.amount : -t.amount), 0
        );
        
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
        
        const goals = savingsGoals.map((goal: any) => goal.title);

        setUserData({
          balance: balance || userProfile.balance || 0,
          monthlyIncome: totalIncome,
          monthlyExpenses: totalExpenses,
          savingsRate,
          goals
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
    
    // Listen for data updates
    const handleDataUpdate = () => loadUserData();
    window.addEventListener('transactionsUpdated', handleDataUpdate);
    window.addEventListener('savingsGoalsUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleDataUpdate);
      window.removeEventListener('savingsGoalsUpdated', handleDataUpdate);
    };
  }, []);

  /**
   * renderActiveTab
   * Determines and renders the content for the active tab.
   * @returns {JSX.Element} Content of the active tab
   */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'goals':
        return <GoalsPage />;
      case 'add':
        return <AddTransaction />;
      case 'insights':
        return <Analytics />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40">
        <ThemeToggle variant="icon" size="sm" />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="pb-16 sm:pb-20"
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* AI Financial Chatbot */}
      <FinancialChatbot userData={userData} />
    </div>
  );
};

export default Index;
