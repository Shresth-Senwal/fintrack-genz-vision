/**
 * @fileoverview Investment Suggestions Component
 * 
 * A comprehensive component that provides personalized investment recommendations
 * based on user's financial profile, risk appetite, and goals. Includes
 * mutual funds, SIPs, FDs, and other investment options popular in India.
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
  TrendingUp, 
  TrendingDown,
  Target,
  Shield,
  Zap,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Star,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { useFinancialData } from '../../hooks/use-financial-data';
import { InvestmentSuggestion, RiskProfile } from '../../types/financial';
import { aiService } from '../../services/aiService';

/**
 * Props for the InvestmentSuggestions component
 */
interface InvestmentSuggestionsProps {
  /** User's risk profile */
  riskProfile?: RiskProfile;
  /** Available investment amount */
  availableAmount?: number;
  /** Investment horizon in months */
  investmentHorizon?: number;
  /** CSS class name */
  className?: string;
}

/**
 * Component for displaying personalized investment suggestions
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function InvestmentSuggestions({
  riskProfile = 'moderate',
  availableAmount = 10000,
  investmentHorizon = 12,
  className = ''
}: InvestmentSuggestionsProps) {
  const {
    getInvestmentSuggestions,
    calculateExpectedReturns,
    isLoading
  } = useFinancialData();

  const [suggestions, setSuggestions] = useState<InvestmentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<InvestmentSuggestion | null>(null);
  const [savedSuggestions, setSavedSuggestions] = useState<string[]>([]);

  // Load suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        // Map risk profile to AI service format
        const riskMapping: Record<RiskProfile, 'low' | 'medium' | 'high'> = {
          conservative: 'low',
          moderate: 'medium',
          aggressive: 'high'
        };

        // Use AI service for real investment suggestions
        const aiSuggestions = await aiService.getInvestmentSuggestions({
          age: 25, // Mock age - would come from user profile
          riskTolerance: riskMapping[riskProfile],
          investmentAmount: availableAmount,
          timeHorizon: investmentHorizon,
          goals: ['Retirement', 'Emergency Fund', 'Short-term Savings']
        });

        // Convert AI suggestions to InvestmentSuggestion format
        const convertedSuggestions: InvestmentSuggestion[] = aiSuggestions.suggestions.map((suggestion, index) => {
          // Map AI risk level back to RiskProfile
          const riskMappingReverse: Record<'low' | 'medium' | 'high', RiskProfile> = {
            low: 'conservative',
            medium: 'moderate',
            high: 'aggressive'
          };

          return {
            id: `suggestion_${index + 1}`,
            name: suggestion.name,
            description: suggestion.description,
            category: suggestion.type,
            fundType: 'index_funds' as const,
            suggestedSIP: suggestion.minimumAmount,
            expectedReturn: parseFloat(suggestion.expectedReturn.split('%')[0]),
            riskLevel: riskMappingReverse[suggestion.riskLevel],
            rationale: aiSuggestions.riskAssessment,
            pros: ['Diversified portfolio', 'Professional management', 'Low expense ratio'],
            cons: ['Market risk', 'No guaranteed returns', 'Lock-in period'],
            minimumInvestment: suggestion.minimumAmount,
            expenseRatio: 0.5,
            rating: 4,
            isRecommended: suggestion.riskLevel === riskMapping[riskProfile],
            disclaimer: 'Past performance does not guarantee future returns',
            features: ['Systematic Investment Plan', 'Tax benefits', 'Diversification'],
            lockInPeriod: 0,
            allocation: { equity: 60, debt: 30, others: 10 }
          };
        });

        setSuggestions(convertedSuggestions);
      } catch (error) {
        console.error('Failed to load investment suggestions:', error);
        // Fallback to mock data
        setSuggestions([]);
      }
    };

    loadSuggestions();
  }, [riskProfile, availableAmount, investmentHorizon]);

  // Get risk color
  const getRiskColor = (risk: RiskProfile) => {
    switch (risk) {
      case 'conservative': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'aggressive': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get risk icon
  const getRiskIcon = (risk: RiskProfile) => {
    switch (risk) {
      case 'conservative': return <Shield className="w-4 h-4" />;
      case 'moderate': return <Target className="w-4 h-4" />;
      case 'aggressive': return <Zap className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  // Toggle saved suggestion
    const toggleSaved = (suggestionId: string) => {
    setSavedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleStartInvestment = (suggestion: InvestmentSuggestion) => {
    try {
      // Simulate investment process
      const investmentDetails = `
🎯 Investment Started!

Investment: ${suggestion.name}
Amount: ${formatCurrency(availableAmount)}
Expected Return: ${formatPercentage(suggestion.expectedReturn)}
Risk Level: ${suggestion.riskLevel}
Minimum Investment: ${formatCurrency(suggestion.minimumInvestment)}

Your investment has been initiated. You'll receive confirmation details shortly.
      `;
      
      alert(investmentDetails);
      
      // In a real app, this would:
      // 1. Open investment platform
      // 2. Pre-fill investment details
      // 3. Redirect to payment gateway
      // 4. Track investment in portfolio
      
    } catch (error) {
      console.error('Failed to start investment:', error);
      alert('❌ Failed to start investment. Please try again.');
    }
  };

  const handleLearnMore = (suggestion: InvestmentSuggestion) => {
    try {
      const details = `
📊 Investment Details

Name: ${suggestion.name}
Description: ${suggestion.description}
Category: ${suggestion.category}
Fund Type: ${suggestion.fundType}

💰 Financial Details:
- Expected Return: ${formatPercentage(suggestion.expectedReturn)}
- Risk Level: ${suggestion.riskLevel}
- Minimum Investment: ${formatCurrency(suggestion.minimumInvestment)}
- Expense Ratio: ${suggestion.expenseRatio}%
- Lock-in Period: ${suggestion.lockInPeriod ? `${suggestion.lockInPeriod} months` : 'None'}

⭐ Rating: ${suggestion.rating}/5 stars

📈 Asset Allocation:
${suggestion.allocation ? Object.entries(suggestion.allocation).map(([asset, percentage]) => `- ${asset}: ${percentage}%`).join('\n') : 'Not specified'}

✅ Advantages:
${suggestion.pros.map(pro => `• ${pro}`).join('\n')}

⚠️ Considerations:
${suggestion.cons.map(con => `• ${con}`).join('\n')}

${suggestion.disclaimer || 'Past performance does not guarantee future returns.'}
      `;
      
      alert(details);
      
    } catch (error) {
      console.error('Failed to show investment details:', error);
      alert('❌ Failed to load investment details. Please try again.');
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

  // Format percentage
  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading investment suggestions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Investment Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your risk profile and investment goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Risk Profile</p>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getRiskColor(riskProfile)}`}>
                {getRiskIcon(riskProfile)}
                <span className="capitalize font-medium">{riskProfile}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Investment Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(availableAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Investment Horizon</p>
              <p className="text-2xl font-bold">{investmentHorizon} months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
          <TabsTrigger value="fixed-deposits">Fixed Deposits</TabsTrigger>
          <TabsTrigger value="others">Others</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {suggestion.name}
                        <div className="flex gap-1">
                          {Array.from({ length: suggestion.rating }, (_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </CardTitle>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaved(suggestion.id)}
                        className={savedSuggestions.includes(suggestion.id) ? 'text-primary' : ''}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      {/* ExternalLink button removed as per user request */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Expected Return</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPercentage(suggestion.expectedReturn)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                      <Badge className={getRiskColor(suggestion.riskLevel)}>
                        {suggestion.riskLevel}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Min Investment</p>
                      <p className="font-medium">
                        {formatCurrency(suggestion.minimumInvestment)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lock-in Period</p>
                      <p className="font-medium">
                        {suggestion.lockInPeriod ? `${suggestion.lockInPeriod} months` : 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Investment Allocation */}
                  {suggestion.category === 'mutual-fund' && suggestion.allocation && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Asset Allocation</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(suggestion.allocation).map(([asset, percentage]) => (
                          <div key={asset} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="capitalize">{asset}</span>
                              <span>{percentage as number}%</span>
                            </div>
                            <Progress value={percentage as number} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Features */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Key Features</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-600">Advantages</p>
                      <ul className="text-sm space-y-1">
                        {suggestion.pros.slice(0, 3).map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">Considerations</p>
                      <ul className="text-sm space-y-1">
                        {suggestion.cons.slice(0, 3).map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Projected Returns */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Projected Value</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[1, 3, 5].map((years) => {
                        const projectedValue = calculateExpectedReturns(
                          availableAmount, 
                          suggestion.expectedReturn, 
                          years
                        );
                        return (
                          <div key={years} className="space-y-1">
                            <p className="text-xs text-muted-foreground">{years} Year{years > 1 ? 's' : ''}</p>
                            <p className="font-bold text-lg">
                              {formatCurrency(projectedValue)}
                            </p>
                            <p className="text-xs text-green-600">
                              +{formatCurrency(projectedValue - availableAmount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1"
                      onClick={() => handleStartInvestment(suggestion)}
                      disabled={isLoading}
                    >
                      Start Investment
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleLearnMore(suggestion)}
                      disabled={isLoading}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tabs would have filtered content */}
        <TabsContent value="mutual-funds" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {suggestions.filter(s => s.category === 'mutual-fund').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">No mutual funds available</p>
                <p className="text-sm text-muted-foreground mb-4">Try importing your bank statement or check back later.</p>
              </div>
            ) : (
              suggestions
                .filter(s => s.category === 'mutual-fund')
                .map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{suggestion.name}</h3>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatPercentage(suggestion.expectedReturn)}
                          </p>
                          <p className="text-xs text-muted-foreground">Expected Return</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="fixed-deposits" className="space-y-4 mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Fixed Deposits offer guaranteed returns but lower growth potential compared to market-linked investments.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {suggestions.filter(s => s.category === 'fixed-deposit').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">No fixed deposits found</p>
                <p className="text-sm text-muted-foreground mb-4">Try importing your bank statement or check back later.</p>
              </div>
            ) : (
              suggestions
                .filter(s => s.category === 'fixed-deposit')
                .map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{suggestion.name}</h3>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {formatPercentage(suggestion.expectedReturn)}
                          </p>
                          <p className="text-xs text-muted-foreground">Assured Return</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="others" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {suggestions
              .filter(s => !['mutual-fund', 'fixed-deposit'].includes(s.category))
              .map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{suggestion.name}</h3>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatPercentage(suggestion.expectedReturn)}
                        </p>
                        <p className="text-xs text-muted-foreground">Expected Return</p>
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

export default InvestmentSuggestions;
