/**
 * FinancialChatbot.tsx
 *
 * AI-powered financial advisor chatbot component
 * - Real-time chat interface with Gemini Flash 2
 * - Animated message bubbles and typing indicators
 * - Quick action buttons for common financial questions
 * - Mobile-responsive design
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  TrendingUp,
  PiggyBank,
  Target,
  CreditCard,
  DollarSign,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { aiService, ChatMessage } from '@/services/aiService';
import { useViewportSize } from '@/hooks/use-mobile';

interface FinancialChatbotProps {
  userData?: {
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    goals: string[];
  };
}

const quickActions = [
  {
    icon: TrendingUp,
    label: 'Budgeting Tips',
    message: 'Give me some budgeting tips for beginners'
  },
  {
    icon: PiggyBank,
    label: 'Saving Advice',
    message: 'How can I save more money effectively?'
  },
  {
    icon: Target,
    label: 'Goal Setting',
    message: 'Help me set realistic financial goals'
  },
  {
    icon: CreditCard,
    label: 'Debt Management',
    message: 'What\'s the best way to manage debt?'
  },
  {
    icon: DollarSign,
    label: 'Investment Basics',
    message: 'Teach me the basics of investing'
  },
  {
    icon: Sparkles,
    label: 'Personalized Advice',
    message: 'Give me personalized financial advice'
  }
];

export function FinancialChatbot({ userData }: FinancialChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true); // Default to minimized
  const [showQuickActions, setShowQuickActions] = useState(false); // Don't show quick actions by default
  const [hasInteracted, setHasInteracted] = useState(false); // Track if user has interacted
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile, width: viewportWidth } = useViewportSize();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Send welcome message only after user interaction
  useEffect(() => {
    if (hasInteracted && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: "Hey there! 👋 I'm your AI financial advisor. I'm here to help you with budgeting, saving, investing, and any money questions you have. What would you like to know? 💰",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [hasInteracted, messages.length]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Mark that user has interacted
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await aiService.sendMessage(content, messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again. 🔌",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (message: string) => {
    // Mark that user has interacted
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    sendMessage(message);
  };

  const handlePersonalizedAdvice = async () => {
    if (!userData) {
      sendMessage("I'd love to give you personalized advice! Could you tell me about your current financial situation?");
      return;
    }

    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const advice = await aiService.getPersonalizedAdvice(userData);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: advice,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't generate personalized advice right now. Please try again later! 🔄",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  if (isMinimized) {
    // Calculate safe positioning to avoid overlaps
    const bottomNavHeight = 80; // Approximate bottom nav height
    const safeBottom = bottomNavHeight + 16; // 16px margin
    
    return (
      <motion.div
        className="fixed z-50"
        style={{
          bottom: `${safeBottom}px`,
          right: '1rem'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => {
            setIsMinimized(false);
            setShowQuickActions(true);
            if (!hasInteracted) {
              setHasInteracted(true);
            }
          }}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 min-h-[44px] min-w-[44px]"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </motion.div>
    );
  }

      // Calculate safe positioning to avoid overlaps
    const bottomNavHeight = 80; // Approximate bottom nav height
    const safeBottom = bottomNavHeight + 16; // 16px margin
    
    return (
      <motion.div
        className="fixed z-50 bg-background border border-border rounded-xl shadow-2xl flex flex-col"
        style={{
          bottom: `${safeBottom}px`,
          right: '1rem',
          width: isMobile ? `calc(${viewportWidth}px - 2rem)` : '384px',
          maxWidth: '384px',
          height: '500px'
        }}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-muted/30 rounded-t-xl">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base truncate">Financial AI Advisor</h3>
            <p className="text-xs text-muted-foreground truncate">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 p-0 hover:bg-muted min-h-[44px] min-w-[44px]"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                    {message.role === 'user' && (
                      <User className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {showQuickActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border bg-muted/20"
        >
          <p className="text-xs text-muted-foreground mb-3 font-medium">Quick actions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.slice(0, 2).map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.message)}
                  className="w-full h-10 text-xs font-medium min-h-[44px]"
                  disabled={isLoading}
                >
                  <action.icon className="w-3 h-3 mr-2" />
                  <span className="truncate">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
          {userData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePersonalizedAdvice}
              className="w-full mt-3 h-10 text-xs font-medium"
              disabled={isLoading}
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Get Personalized Advice
            </Button>
          )}
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border bg-background rounded-b-xl">
        <div className="flex gap-2 sm:gap-3">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about money..."
            className="flex-1 text-sm h-11 min-h-[44px]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputMessage.trim() || isLoading}
            className="px-3 sm:px-4 h-11 min-h-[44px] min-w-[44px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 