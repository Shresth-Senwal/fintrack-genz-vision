/**
 * AI Service for Gemini Flash 2 Integration
 * Handles financial advice and chatbot interactions
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }
  }

  /**
   * Send a message to Gemini AI and get a response
   */
  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Build context from conversation history
      const context = this.buildContext(conversationHistory);
      const fullMessage = context + message;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullMessage
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from AI');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Build context for financial advice
   */
  private buildContext(conversationHistory: ChatMessage[]): string {
    const financialContext = `You are a helpful financial advisor AI assistant for a Gen Z personal finance app called FinTrack. 

Your role is to provide:
- Simple, easy-to-understand financial advice
- Budgeting tips and strategies
- Saving and investment guidance
- Debt management advice
- Financial goal planning
- Basic financial education

Guidelines:
- Keep responses concise and engaging
- Use emojis occasionally to make it fun for Gen Z users
- Provide actionable, practical advice
- Avoid complex financial jargon
- Be encouraging and supportive
- Focus on building healthy financial habits
- Always remind users that you're an AI and they should consult professionals for complex financial decisions

Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User's question: `;

    return financialContext;
  }

  /**
   * Get quick financial tips
   */
  async getQuickTip(): Promise<string> {
    const tips = [
      "💡 Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings!",
      "🎯 Set up automatic transfers to make saving effortless",
      "📱 Use apps like FinTrack to track every penny - knowledge is power!",
      "🚫 Try a no-spend day once a week to boost your savings",
      "🎉 Celebrate small wins - every dollar saved is progress!",
      "📊 Review your spending monthly to spot patterns and cut unnecessary expenses",
      "💪 Build an emergency fund - aim for 3-6 months of expenses",
      "🎓 Invest in yourself - education and skills are your best assets",
      "🔄 Pay yourself first - transfer money to savings before spending",
      "📈 Start investing early, even if it's just $10 a month"
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Get personalized financial advice based on user data
   */
  async getPersonalizedAdvice(userData: {
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    goals: string[];
  }): Promise<string> {
    const message = `Based on my current financial situation:
- Current balance: $${userData.balance.toFixed(2)}
- Monthly income: $${userData.monthlyIncome.toFixed(2)}
- Monthly expenses: $${userData.monthlyExpenses.toFixed(2)}
- Savings rate: ${userData.savingsRate.toFixed(1)}%
- Financial goals: ${userData.goals.join(', ')}

What specific advice would you give me to improve my financial health and reach my goals?`;

    return this.sendMessage(message);
  }

  /**
   * Analyze budget and provide insights
   */
  async analyzeBudget(transactions: Array<{
    type: 'credit' | 'debit';
    amount: number;
    category: string;
  }>, budget: Record<string, number>): Promise<{
    insights: string[];
    recommendations: string[];
    alerts: Array<{
      type: 'warning' | 'success' | 'info';
      message: string;
      category: string;
    }>;
  }> {
    try {
      // Calculate budget metrics
      const totalIncome = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      // Generate insights
      const insights: string[] = [];
      const recommendations: string[] = [];
      const alerts: Array<{
        type: 'warning' | 'success' | 'info';
        message: string;
        category: string;
      }> = [];

      // Savings rate analysis
      if (savingsRate < 10) {
        insights.push('Your savings rate is below the recommended 20%');
        recommendations.push('Consider reducing non-essential expenses');
        alerts.push({
          type: 'warning',
          message: 'Low savings rate detected',
          category: 'savings'
        });
      } else if (savingsRate >= 20) {
        insights.push('Great job! You\'re saving at a healthy rate');
        recommendations.push('Consider investing your savings for better returns');
        alerts.push({
          type: 'success',
          message: 'Excellent savings rate maintained',
          category: 'savings'
        });
      }

      // Expense category analysis
      const categoryTotals: Record<string, number> = {};
      transactions
        .filter(t => t.type === 'debit')
        .forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

      const highestCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0];

      if (highestCategory) {
        insights.push(`Your highest expense category is ${highestCategory[0]} (${((highestCategory[1] / totalExpenses) * 100).toFixed(1)}%)`);
        
        if (highestCategory[0] === 'entertainment' && (highestCategory[1] / totalExpenses) > 0.3) {
          recommendations.push('Consider reducing entertainment expenses');
          alerts.push({
            type: 'warning',
            message: 'Entertainment expenses are high',
            category: 'entertainment'
          });
        }
      }

      // Income vs expenses analysis
      if (totalExpenses > totalIncome) {
        insights.push('Your expenses exceed your income');
        recommendations.push('Focus on increasing income or reducing expenses');
        alerts.push({
          type: 'warning',
          message: 'Expenses exceed income',
          category: 'budget'
        });
      }

      return { insights, recommendations, alerts };
    } catch (error) {
      console.error('Budget analysis failed:', error);
      return {
        insights: ['Unable to analyze budget at this time'],
        recommendations: ['Please try again later'],
        alerts: []
      };
    }
  }

  /**
   * Get investment suggestions based on user profile
   */
  async getInvestmentSuggestions(userProfile: {
    age: number;
    riskTolerance: 'low' | 'medium' | 'high';
    investmentAmount: number;
    timeHorizon: number;
    goals: string[];
  }): Promise<{
    suggestions: Array<{
      type: string;
      name: string;
      description: string;
      riskLevel: 'low' | 'medium' | 'high';
      expectedReturn: string;
      minimumAmount: number;
    }>;
    riskAssessment: string;
    generalAdvice: string;
  }> {
    const suggestions = [];

    // Low risk options
    if (userProfile.riskTolerance === 'low' || userProfile.investmentAmount < 1000) {
      suggestions.push({
        type: 'Savings Account',
        name: 'High-Yield Savings',
        description: 'Safe, liquid savings with competitive interest rates',
        riskLevel: 'low',
        expectedReturn: '2-4% annually',
        minimumAmount: 100
      });
      
      suggestions.push({
        type: 'Fixed Deposit',
        name: 'Bank Fixed Deposits',
        description: 'Guaranteed returns with fixed interest rates',
        riskLevel: 'low',
        expectedReturn: '5-7% annually',
        minimumAmount: 1000
      });
    }

    // Medium risk options
    if (userProfile.riskTolerance === 'medium' || userProfile.investmentAmount >= 1000) {
      suggestions.push({
        type: 'Mutual Fund',
        name: 'Index Funds',
        description: 'Diversified portfolio tracking market indices',
        riskLevel: 'medium',
        expectedReturn: '8-12% annually',
        minimumAmount: 500
      });
      
      suggestions.push({
        type: 'Government Bonds',
        name: 'Sovereign Gold Bonds',
        description: 'Government-backed bonds with gold backing',
        riskLevel: 'medium',
        expectedReturn: '6-8% annually',
        minimumAmount: 1000
      });
    }

    // High risk options
    if (userProfile.riskTolerance === 'high' && userProfile.investmentAmount >= 5000) {
      suggestions.push({
        type: 'Equity',
        name: 'Direct Stock Investment',
        description: 'Direct investment in individual company stocks',
        riskLevel: 'high',
        expectedReturn: '12-20% annually',
        minimumAmount: 5000
      });
      
      suggestions.push({
        type: 'Crypto',
        name: 'Cryptocurrency',
        description: 'Digital currency investment (highly volatile)',
        riskLevel: 'high',
        expectedReturn: 'Variable (high risk)',
        minimumAmount: 1000
      });
    }

    const riskAssessment = `Based on your profile (Age: ${userProfile.age}, Risk: ${userProfile.riskTolerance}), you can consider ${userProfile.riskTolerance === 'low' ? 'conservative' : userProfile.riskTolerance === 'medium' ? 'balanced' : 'aggressive'} investment strategies.`;

    const generalAdvice = `Start with small amounts and gradually increase as you become more comfortable. Always diversify your investments and never invest more than you can afford to lose.`;

    return { suggestions, riskAssessment, generalAdvice };
  }
}

export const aiService = new AIService();
export type { ChatMessage }; 