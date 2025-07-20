/**
 * BottomNav.tsx
 *
 * Mobile-first bottom navigation component for Fintrack GenZ Vision.
 * - Tab-based navigation with active state indicators and smooth transitions.
 * - Supports accessibility and keyboard navigation.
 *
 * Dependencies:
 * - Lucide React icons for navigation tabs
 * - UI primitives: none (uses divs and flexbox)
 *
 * Edge Cases & Limitations:
 * - Only five tabs; extend for more features as needed.
 * - Active tab logic assumes unique tab ids.
 *
 * TODO: Add ARIA attributes and accessibility testing.
 */

/**
 * Bottom Navigation Component - Mobile-first navigation
 * 
 * Features:
 * - Tab-based navigation optimized for mobile
 * - Visual indicators for active states
 * - Smooth transitions and hover effects
 * - Accessibility support
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Target, TrendingUp, User, PlusCircle } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * BottomNav
 * Renders mobile navigation bar with tab switching.
 * @param {BottomNavProps} props - Active tab and tab change handler
 * @returns {JSX.Element} Navigation bar UI
 */
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'add', label: 'Add', icon: PlusCircle },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-around px-4 py-3 safe-area-bottom max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAddButton = item.id === 'add';
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] ${
                isAddButton
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md -mt-2 w-12 h-12 rounded-full'
                  : isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-label={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active indicator */}
              {isActive && !isAddButton && (
                <motion.div 
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? 360 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon className={`${
                  isAddButton ? 'w-5 h-5' : 'w-5 h-5'
                } transition-transform duration-150`} />
              </motion.div>
              
              {!isAddButton && (
                <motion.span 
                  className={`text-xs font-medium leading-tight ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  animate={{ 
                    opacity: isActive ? 1 : 0.7,
                    y: isActive ? 0 : 2
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}