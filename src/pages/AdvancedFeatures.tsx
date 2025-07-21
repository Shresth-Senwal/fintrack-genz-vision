/**
 * @fileoverview Advanced Financial Features Page
 * 
 * A comprehensive page that showcases advanced financial management features
 * including bank statement import, investment suggestions, smart budgeting,
 * and recurring transaction management.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Database,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Lightbulb,
  Shield,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BankStatementImport } from '@/components/financial/BankStatementImport';
import { InvestmentSuggestions } from '@/components/financial/InvestmentSuggestions';
import { SmartBudgetAnalysis } from '@/components/financial/SmartBudgetAnalysis';
import { RecurringTransactionsManager } from '@/components/financial/RecurringTransactionsManager';

/**
 * Advanced Financial Features page component
 * 
 * @returns JSX element
 */
export default function AdvancedFeatures() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-2 md:px-0">
      <Card className="w-full max-w-5xl bg-background border rounded-xl shadow-lg p-0 md:p-0">
        <div className="p-6 md:p-8">
          {/* Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Advanced Features</h1>
                  <p className="text-muted-foreground mt-1">
                    Unlock powerful financial management tools powered by AI
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white dark:from-blue-600 dark:to-purple-600">
                <Award className="w-4 h-4 mr-1" />
                Premium Features
              </Badge>
            </motion.div>

            {/* Feature Overview Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: Database,
                  title: 'Bank Statement Import',
                  description: 'Import CSV/PDF statements automatically',
                  color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50'
                },
                {
                  icon: TrendingUp,
                  title: 'Investment Suggestions',
                  description: 'AI-powered investment recommendations',
                  color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50'
                },
                {
                  icon: Brain,
                  title: 'Smart Budgeting',
                  description: 'Intelligent budget analysis & alerts',
                  color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50'
                },
                {
                  icon: RefreshCw,
                  title: 'Recurring Transactions',
                  description: 'Automate regular income & expenses',
                  color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50'
                }
              ].map((feature, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300 dark:border-border dark:hover:shadow-xl">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mx-auto mb-3`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="mt-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Mobile-responsive tab navigation - horizontal scroll on small screens, grid on larger screens */}
                <div className="mb-8">
                  <TabsList className="bg-muted rounded-lg shadow-sm p-1 flex gap-2 mb-8">
                    <div className="flex sm:contents gap-1 overflow-x-auto scrollbar-hide">
                      <TabsTrigger 
                        value="overview" 
                        className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="import" 
                        className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Bank Import
                      </TabsTrigger>
                      <TabsTrigger 
                        value="investments" 
                        className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Investments
                      </TabsTrigger>
                      <TabsTrigger 
                        value="budget" 
                        className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Smart Budget
                      </TabsTrigger>
                      <TabsTrigger 
                        value="recurring" 
                        className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Recurring
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Welcome to Advanced Features
                      </CardTitle>
                      <CardDescription>
                        Take your financial management to the next level with AI-powered tools
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="font-semibold text-foreground">Secure & Private</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your financial data is encrypted and processed locally. We never store sensitive information.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-semibold text-foreground">Personalized Insights</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Get recommendations tailored to your spending patterns, goals, and risk tolerance.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-foreground">Automation Ready</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Set up automated tracking, alerts, and recurring transactions to save time.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2 text-foreground">Getting Started</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                          <li>Import your bank statements to get comprehensive transaction history</li>
                          <li>Set up your investment profile to receive personalized recommendations</li>
                          <li>Enable smart budgeting for automated spending insights and alerts</li>
                          <li>Configure recurring transactions for salary, bills, and subscriptions</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="import" className="space-y-6">
                  <BankStatementImport />
                </TabsContent>

                <TabsContent value="investments" className="space-y-6">
                  <InvestmentSuggestions />
                </TabsContent>

                <TabsContent value="budget" className="space-y-6">
                  <SmartBudgetAnalysis />
                </TabsContent>

                <TabsContent value="recurring" className="space-y-6">
                  <RecurringTransactionsManager />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Footer - Help section with improved dark mode support */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm opacity-90 mb-4">
              Our AI assistant can help you navigate these features and answer any questions.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => {
                // Trigger the chatbot to open
                const chatbotButton = document.querySelector('[data-chatbot-trigger]') as HTMLButtonElement;
                if (chatbotButton) {
                  chatbotButton.click();
                } else {
                  // Fallback: show a message or navigate to main page
                  alert('AI Assistant is available on the main dashboard. Please navigate to the home page to access it.');
                }
              }}
            >
              <Brain className="w-4 h-4 mr-2" />
              Chat with AI Assistant
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
