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
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
}

export const aiService = new AIService();
export type { ChatMessage }; 