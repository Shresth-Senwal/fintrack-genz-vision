# Fintrack GenZ Vision – Project Context

## Architecture Overview
Fintrack GenZ Vision is a modern, modular, full-stack financial tracking application built with React (TypeScript), Vite, and Tailwind CSS. The project follows a feature-based directory structure for scalability and maintainability. Firebase is used for authentication and backend services. The codebase is designed for accessibility, internationalization, and cross-platform compatibility.

### Key Directories
- `src/components/`: Modular UI components, organized by feature (dashboard, goals, chatbot, profile, navigation, financial, gamification, UI primitives).
- `src/contexts/`: React context providers for authentication, goals, theme, gamification, and financial data management.
- `src/data/`: Mock and seed data for development and testing.
- `src/hooks/`: Custom React hooks for device detection, toast notifications, gamification, and financial data.
- `src/lib/`: Utility functions and Firebase integration.
- `src/pages/`: Top-level route components for main app views, including AdvancedFeatures.
- `src/services/`: Service layer for AI and other integrations.
- `src/types/`: TypeScript type definitions for gamification, financial features, and core data models.
- `src/constants/`: Constants and helper functions for gamification and other features.
- `public/`: Static assets and configuration files.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API, custom hooks
- **Authentication**: Firebase Auth
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **UI Components**: Modular component architecture with full TypeScript support
- **Package Manager**: Bun (with lockfile included)
- **Linting**: ESLint with TypeScript rules
- **Build**: Vite with TypeScript, optimized for production
- **Toasts**: Sonner for notifications
- **PDF Processing**: pdfjs-dist for client-side PDF parsing and text extraction
- **Internationalization**: Ready for i18n implementation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Data Models
- **User**: Authentication via Firebase Auth; profile data managed in context and backend.
- **Transaction**: Tracked in `mock-transactions.json` for development; real data to be integrated with backend.
- **Goals**: Managed via GoalsContext; supports add, update, and progress tracking.
- **Gamification**: 
  - **User Progress**: XP points, level, streaks, achievements (managed via GamificationContext)
  - **Challenges**: Daily/weekly challenges with completion tracking and rewards
  - **Achievements**: Badge system with categories, rarity, and unlock conditions
- **Financial Data**:
  - **Bank Statements**: CSV/PDF import with parsing and reconciliation
  - **Investment Profiles**: Risk assessment, portfolio recommendations, performance tracking
  - **Budget Analysis**: Spending patterns, category insights, automated alerts
  - **Recurring Transactions**: Scheduled transactions with automation and reminders

## Features
- **Authentication**: Secure login/signup with Firebase; context-managed session state. Includes email/password, Google, and guest login. Password reset and protected routes implemented. See `AUTHENTICATION_SETUP.md` for details.
- **Dashboard**: Overview of financial status, analytics, and recent transactions. Now includes a GamificationWidget showing progress, challenges, and achievements.
- **Goals**: Set, track, and update savings goals; add money dialogs, progress badges, achievement tracking, templates, and mobile-optimized UI. See `GOALS_IMPLEMENTATION_SUMMARY.md` for full details.
- **Transactions**: Add, view, and manage transaction history.
- **Analytics**: Visual feedback on spending, savings, and financial habits. Analytics page now includes a working "Add Your First Transaction" button with navigation and accessibility improvements. See `ANALYTICS_BUTTON_FIX.md`.
- **AI Chatbot**: Financial assistant for user queries, powered by Gemini Flash 2 (Google). Provides real-time, personalized financial advice, budgeting tips, and interactive chat UI. See `AI_CHATBOT_SETUP.md` for setup and customization.
- **Profile**: User profile management and settings.
- **Dark Mode**: Theme toggle with persistent state, system detection, accessibility, and smooth transitions. See `DARK_MODE_SETUP.md` for implementation details.
- **Mobile Optimization**: Responsive design, touch-friendly UI, dynamic positioning, and mobile-first layouts. Header, chatbot, and analytics components optimized for mobile. See `MOBILE_OPTIMIZATION_SUMMARY.md`.
- **Gamification System**: Complete XP/leveling system, daily/weekly challenges, streak tracking, achievement badges, and progress visualization. Managed via GamificationContext with persistent data and real-time updates.
- **Advanced Financial Features**: 
  - **Bank Statement Import**: Upload and parse CSV/PDF bank statements with error handling and reconciliation
  - **Investment Suggestions**: AI-powered personalized investment recommendations based on risk profile and goals
  - **Smart Budget Analysis**: Intelligent spending pattern analysis, budget health scoring, and automated alerts
  - **Recurring Transactions**: Automated management of regular income/expenses with scheduling and reminders

## Endpoints & Data Contracts
- **Firebase**: Authentication and (planned) data storage.
- **AI Service**: API contract defined in `aiService.ts`.
- **Data Validation**: All user input is validated and sanitized at both UI and service layers.

## Component Architecture
- **Dashboard Integration**: GamificationWidget integrated into Dashboard header, Advanced Features button provides access to new financial tools
- **Context Providers**: Multiple context providers (Auth, Goals, Theme, Gamification, FinancialData) wrapped in App.tsx for global state management
- **Custom Hooks**: Dedicated hooks (use-gamification, use-financial-data) provide clean interfaces to context data and actions
- **Modular Components**: 
  - Gamification components: GamificationWidget with challenge tracking, XP display, achievement notifications
  - Financial components: BankStatementImport, InvestmentSuggestions, SmartBudgetAnalysis, RecurringTransactionsManager
- **Page Structure**: AdvancedFeatures page uses tabbed navigation to organize advanced financial tools
- **Type Safety**: Comprehensive TypeScript types for all gamification and financial features in dedicated type files
- **PDF Processing**: Client-side PDF parsing utility with support for multiple Indian bank statement formats
- **Responsive Design**: Mobile-first approach with horizontal scrolling tabs and proper dark mode support

## Outstanding Issues & Technical Debt
- **Backend Integration**: Real-time database for transactions and goals pending full implementation. Advanced financial features (bank statements, investments, budgets, recurring transactions) currently use mock implementations.
- **Test Coverage**: Unit, integration, and E2E tests are incomplete; coverage gaps tracked here. Gamification and advanced financial features need comprehensive testing.
- **Accessibility**: Ongoing improvements to meet WCAG 2.1 AA+; some UI components require further testing. New advanced features need accessibility auditing.
- **Internationalization**: Initial i18n setup pending; all user-facing strings to be externalized. New gamification and financial feature strings need i18n support.
- **Performance**: Initial profiling done; further optimization and lazy loading needed for large data sets. File upload and processing for bank statements needs optimization.
- **Error Handling**: Centralized error/logging strategy in progress; some components lack robust error boundaries. Advanced features need enhanced error handling and user feedback.
- **Security**: Secrets management and audit logging to be enhanced; review for compliance with privacy regulations. Bank statement processing and financial data require additional security measures.
- **Real API Integration**: Investment suggestions, budget analysis, and bank statement parsing currently use mock data. Integration with real financial APIs and services needed.
- **Data Persistence**: Gamification progress and advanced financial data need persistent storage with Firebase/backend integration.
- **Notification System**: Challenge reminders, achievement notifications, and budget alerts need implementation with proper scheduling.

## Recent Updates (Fixed Issues)
- **✅ Dark Mode Consistency**: Fixed Advanced Features section to properly use theme variables and dark mode classes throughout all components
- **✅ Mobile Tab Navigation**: Implemented responsive tab bar with horizontal scrolling on mobile devices, preventing button overlap
- **✅ PDF Bank Statement Parsing**: Implemented robust PDF parsing using pdfjs-dist library with support for multiple Indian bank formats (HDFC, ICICI, SBI, Axis, Generic)
- **✅ Enhanced Error Handling**: Added comprehensive error handling and user feedback for PDF processing
- **✅ Type Safety**: All new PDF parsing functionality includes proper TypeScript types and interfaces
- **Navigation Consistency**: Consider centralizing navigation logic and reviewing navigation patterns across app (see `ANALYTICS_BUTTON_FIX.md`).

## Dependencies
- React (TypeScript), Vite, Tailwind CSS, Firebase, and supporting libraries.
- All dependencies are LTS, secure, and documented in this file and `README.md`.

## Acceptance Criteria
- All features must be accessible, secure, and performant.
- Code must be modular, well-documented, and fully tested.
- All changes must update this context file and follow project standards.

## Change Log
- 2025-07-21: Context file updated for architecture, features, mobile optimization, goals, authentication, AI chatbot, analytics button fix, and outstanding issues.
