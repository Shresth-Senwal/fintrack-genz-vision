import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'icon' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
}) => {
  const { theme, setTheme, resolvedTheme, isLoading } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8 min-h-[44px] min-w-[44px]',
    md: 'h-10 w-10 min-h-[44px] min-w-[44px]',
    lg: 'h-12 w-12 min-h-[44px] min-w-[44px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleToggle = () => {
    if (isLoading) return;
    
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    if (isLoading) return;
    setTheme(selectedTheme);
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className={`${sizeClasses[size]} p-0 ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {resolvedTheme === 'light' ? (
              <Moon className={iconSizes[size]} />
            ) : (
              <Sun className={iconSizes[size]} />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className={`${className} gap-2`}
          aria-label="Theme options"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={resolvedTheme}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {resolvedTheme === 'light' ? (
                <Sun className={iconSizes[size]} />
              ) : (
                <Moon className={iconSizes[size]} />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="hidden sm:inline">Theme</span>
        </Button>
        
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleThemeSelect('light')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                theme === 'light' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              onClick={() => handleThemeSelect('dark')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
            <button
              onClick={() => handleThemeSelect('system')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                theme === 'system' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Monitor className="w-4 h-4" />
              System
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={`${className} gap-2 transition-all duration-300`}
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedTheme}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {resolvedTheme === 'light' ? (
            <Moon className={iconSizes[size]} />
          ) : (
            <Sun className={iconSizes[size]} />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="hidden sm:inline">
        {resolvedTheme === 'light' ? 'Dark' : 'Light'} Mode
      </span>
    </Button>
  );
}; 