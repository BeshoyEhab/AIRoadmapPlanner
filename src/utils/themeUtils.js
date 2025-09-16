// src/utils/themeUtils.js
export const getThemeClasses = () => {
  const baseClasses = 'transition-colors duration-300';
  
  return {
    // Main container classes
    container: `${baseClasses} bg-background text-foreground`,
    
    // Card classes
    card: `${baseClasses} bg-card text-card-foreground border-border`,
    cardElevated: `${baseClasses} bg-popover text-popover-foreground border-border shadow-theme`,
    
    // Button classes
    buttonPrimary: `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`,
    buttonSecondary: `${baseClasses} bg-secondary text-secondary-foreground hover:bg-secondary/80`,
    buttonGhost: `${baseClasses} hover:bg-accent hover:text-accent-foreground`,
    buttonDestructive: `${baseClasses} bg-destructive text-destructive-foreground hover:bg-destructive/90`,
    
    // Input classes
    input: `${baseClasses} bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring`,
    
    // Text classes
    textPrimary: 'text-foreground',
    textSecondary: 'text-muted-foreground',
    textAccent: 'text-primary',
    
    // Surface classes
    surface: `${baseClasses} bg-card border-border`,
    surfaceElevated: `${baseClasses} bg-popover border-border shadow-theme-lg`,
    
    // Navigation classes
    navItem: `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent/50`,
    navItemActive: `${baseClasses} text-foreground bg-accent`,
    
    // Progress bar classes
    progressBar: 'bg-secondary',
    progressFill: 'bg-primary',
    
    // Badge classes
    badge: `${baseClasses} bg-secondary text-secondary-foreground`,
    badgePrimary: `${baseClasses} bg-primary text-primary-foreground`,
    badgeSuccess: `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`,
    badgeWarning: `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`,
    badgeError: `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`,
    
    // Loading classes
    loading: 'text-primary animate-spin',
    loadingContainer: `${baseClasses} bg-card/50 backdrop-blur-sm`,
    
    // Modal/Dialog classes
    modalOverlay: 'bg-black/50 backdrop-blur-sm',
    modalContent: `${baseClasses} bg-card text-card-foreground border-border shadow-theme-lg`,
    
    // Sidebar classes
    sidebar: `${baseClasses} bg-sidebar text-sidebar-foreground border-sidebar-border`,
    sidebarItem: `${baseClasses} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`,
    sidebarItemActive: `${baseClasses} bg-sidebar-primary text-sidebar-primary-foreground`,
  };
};

// Theme-aware component wrapper
export const withTheme = () => {
  return (props) => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const themeClasses = getThemeClasses(theme);
    
    return <Component {...props} theme={theme} themeClasses={themeClasses} />;
  };
};

// CSS class utilities
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Theme-aware styling hook
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const themeClasses = getThemeClasses(theme);

  return {
    theme,
    themeClasses,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};

// Predefined theme color schemes
export const themeColors = {
  light: {
    primary: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.97 0 0)',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    muted: 'oklch(0.97 0 0)',
    mutedForeground: 'oklch(0.556 0 0)',
    accent: 'oklch(0.97 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.922 0 0)',
  },
  dark: {
    primary: 'oklch(0.922 0 0)',
    secondary: 'oklch(0.269 0 0)',
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
  }
};

// Theme validation utility
export const validateTheme = (theme) => {
  return ['light', 'dark'].includes(theme) ? theme : 'dark';
};

// Local storage theme persistence
export const saveThemePreference = (theme) => {
  const validTheme = validateTheme(theme);
  localStorage.setItem('theme', validTheme);
  return validTheme;
};

export const loadThemePreference = () => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = localStorage.getItem('theme');
  return validateTheme(savedTheme) || 'dark';
};

// System theme detection
export const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply theme to document
export const applyTheme = (theme) => {
  const validTheme = validateTheme(theme);
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(validTheme);
  
  // Set data attribute for additional hooks
  root.setAttribute('data-theme', validTheme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', validTheme === 'dark' ? '#1a1a1a' : '#ffffff');
  }
  
  // Save preference
  saveThemePreference(validTheme);
  
  return validTheme;
};
