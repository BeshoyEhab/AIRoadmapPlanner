import { useState, useEffect } from 'react';
import { colorThemes } from '@/lib/colorThemes';

const STORAGE_KEY = 'ai-roadmap-color-theme';

export const useColorTheme = (isDarkMode) => {
  // Initialize theme from localStorage or default to 'blue'
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && colorThemes[stored] ? stored : 'blue';
    } catch (error) {
      console.error('Error loading color theme from localStorage:', error);
      return 'blue';
    }
  });

  // Apply theme colors to CSS custom properties
  const applyTheme = (themeId, darkMode = isDarkMode) => {
    const theme = colorThemes[themeId];
    if (!theme) return;

    const root = document.documentElement;
    const colors = darkMode ? theme.dark : theme.light;

    // Apply all color properties to CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      if (key === 'gradient') return; // Skip gradient as it's handled separately
      
      root.style.setProperty(`--color-theme-${key}`, value);
    });

    // Set theme name as a data attribute for debugging
    root.setAttribute('data-theme', themeId);
  };

  // Change theme and persist to localStorage
  const changeTheme = (newThemeId) => {
    if (!colorThemes[newThemeId]) {
      console.error(`Theme '${newThemeId}' not found`);
      return;
    }

    setCurrentTheme(newThemeId);
    applyTheme(newThemeId);

    try {
      localStorage.setItem(STORAGE_KEY, newThemeId);
    } catch (error) {
      console.error('Error saving color theme to localStorage:', error);
    }
  };

  // Apply theme on mount and when dark mode changes
  useEffect(() => {
    applyTheme(currentTheme, isDarkMode);
  }, [currentTheme, isDarkMode]);

  // Get current theme object
  const getThemeColors = (themeId = currentTheme, darkMode = isDarkMode) => {
    const theme = colorThemes[themeId];
    if (!theme) return colorThemes.blue[darkMode ? 'dark' : 'light'];
    
    return theme[darkMode ? 'dark' : 'light'];
  };

  // Get theme color as CSS value
  const getThemeColor = (colorName, themeId = currentTheme, darkMode = isDarkMode) => {
    const colors = getThemeColors(themeId, darkMode);
    const colorValue = colors[colorName];
    
    if (!colorValue) return null;
    
    // Return RGB string for CSS usage
    return `rgb(${colorValue})`;
  };

  // Check if theme has gradients
  const hasGradient = (themeId = currentTheme, darkMode = isDarkMode) => {
    const colors = getThemeColors(themeId, darkMode);
    return Boolean(colors.gradient);
  };

  // Get gradient CSS value
  const getGradient = (themeId = currentTheme, darkMode = isDarkMode) => {
    const colors = getThemeColors(themeId, darkMode);
    return colors.gradient || null;
  };

  return {
    currentTheme,
    changeTheme,
    getThemeColors,
    getThemeColor,
    hasGradient,
    getGradient,
    availableThemes: Object.keys(colorThemes),
    applyTheme, // Expose for manual theme application if needed
  };
};
