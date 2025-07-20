/**
 * App.tsx
 *
 * Root application component for Fintrack GenZ Vision.
 * - Integrates global providers (React Query, Tooltip, Toaster, Auth)
 * - Sets up routing for all pages (Auth, Index, NotFound)
 * - Ensures extensibility for future routes and providers
 *
 * Dependencies:
 * - @tanstack/react-query: QueryClientProvider for data fetching
 * - react-router-dom: BrowserRouter for SPA routing
 * - Custom UI components: Toaster, Sonner, TooltipProvider
 * - Firebase Auth: Authentication context and routing
 *
 * NOTE: All new routes must be added above the catch-all "*" route.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GoalsProvider } from "@/contexts/GoalsContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Create a single QueryClient instance for the app
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Main application component
 * Wraps all providers and sets up routing structure
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <GoalsProvider>
          {/* TooltipProvider enables tooltips globally */}
          <TooltipProvider>
            {/* Toaster and Sonner provide notification systems */}
            <Toaster />
            <Sonner />
            {/* BrowserRouter enables SPA navigation */}
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Authentication route */}
                  <Route 
                    path="/auth" 
                    element={
                      <PublicRoute>
                        <Auth />
                      </PublicRoute>
                    } 
                  />
                  {/* Protected home page route */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Catch-all route for 404s; always keep last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </TooltipProvider>
        </GoalsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
