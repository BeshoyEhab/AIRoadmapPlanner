import { useState, useEffect } from 'react';
import { colorThemes } from '@/lib/colorThemes';

const STORAGE_KEY = 'ai-roadmap-color-theme';

export const useColorTheme = (isDarkMode) => {
  // Load custom themes synchronously during initialization
  const getCustomThemes = () => {
    try {
      const stored = localStorage.getItem('custom-color-themes');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading custom themes:', error);
      return {};
    }
  };

  const [customThemes, setCustomThemes] = useState(getCustomThemes);
  
  // Refresh custom themes from localStorage
  const refreshCustomThemes = () => {
    const updated = getCustomThemes();
    setCustomThemes(updated);
  };
  
  // Initialize theme from localStorage or default to 'slate'
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const loadedCustomThemes = getCustomThemes();
      const allThemes = { ...colorThemes, ...loadedCustomThemes };
      const themeId = stored && allThemes[stored] ? stored : 'slate';
      
      // Apply theme immediately on initialization
      const theme = allThemes[themeId];
      if (theme) {
        const colors = isDarkMode ? theme.dark : theme.light;
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
          if (key === 'primary') {
            root.style.setProperty(`--color-primary`, value);
          } else if (key === 'accent') {
            root.style.setProperty(`--color-accent`, value);
            root.style.setProperty(`--color-secondary`, value);
          }
          root.style.setProperty(`--color-${key}`, value);
        });
      }
      
      return themeId;
    } catch (error) {
      console.error('Error loading color theme from localStorage:', error);
      return 'slate';
    }
  });

  // Apply theme colors to CSS custom properties
  const applyTheme = (themeId, darkMode = isDarkMode) => {
    const allThemes = { ...colorThemes, ...customThemes };
    const theme = allThemes[themeId];
    if (!theme) {
      console.warn(`Theme '${themeId}' not found, falling back to 'slate'`);
      themeId = 'slate';
    }

    const root = document.documentElement;
    const colors = darkMode ? allThemes[themeId].dark : allThemes[themeId].light;

    // Apply comprehensive color system
    root.style.setProperty(`--color-primary`, colors.primary);
    root.style.setProperty(`--color-secondary`, colors.accent || colors.primary);
    root.style.setProperty(`--color-accent`, colors.accent || colors.primary);
    root.style.setProperty(`--color-background`, colors.background || '248 250 252');
    root.style.setProperty(`--color-surface`, colors.surface || '255 255 255');
    root.style.setProperty(`--color-border`, colors.border || '226 232 240');
    root.style.setProperty(`--color-text-primary`, colors.textPrimary || '15 23 42');
    root.style.setProperty(`--color-text-secondary`, colors.textSecondary || '71 85 105');
    root.style.setProperty(`--color-text-muted`, colors.textMuted || '148 163 184');
    root.style.setProperty(`--color-shadow`, colors.shadow || colors.primary);
    root.style.setProperty(`--color-ring`, colors.ring || colors.primary);
    
    // Legacy support
    root.style.setProperty(`--color-border-accent`, colors.border || colors.primary);
    
    // Generate lighter variations for the unified system
    if (colors.primaryLight) {
      root.style.setProperty(`--color-primary-light`, colors.primaryLight);
    }
    if (colors.primaryLighter) {
      root.style.setProperty(`--color-primary-lighter`, colors.primaryLighter);
    }
    if (colors.secondaryLight || colors.accentLight) {
      root.style.setProperty(`--color-secondary-light`, colors.secondaryLight || colors.accentLight);
    }
    if (colors.secondaryLighter || colors.accentLighter) {
      root.style.setProperty(`--color-secondary-lighter`, colors.secondaryLighter || colors.accentLighter);
    }
    
    // Create mixed backgrounds: varying percentages for different elements
    const [r, g, b] = colors.primary.split(' ').map(Number);
    
    if (darkMode) {
      // Dark mode: black base + strong theme color mix (like settings)
      const appMixedR = Math.round(0 * 0.80 + r * 0.20); // 20% theme color
      const appMixedG = Math.round(0 * 0.80 + g * 0.20);
      const appMixedB = Math.round(0 * 0.80 + b * 0.20);
      root.style.setProperty(`--app-bg-mixed`, `${appMixedR} ${appMixedG} ${appMixedB}`);
      
      const pageMixedR = Math.round(0 * 0.75 + r * 0.25); // 25% theme color
      const pageMixedG = Math.round(0 * 0.75 + g * 0.25);
      const pageMixedB = Math.round(0 * 0.75 + b * 0.25);
      root.style.setProperty(`--page-bg-mixed`, `${pageMixedR} ${pageMixedG} ${pageMixedB}`);
      
      const cardMixedR = Math.round(0 * 0.70 + r * 0.30); // 30% theme color
      const cardMixedG = Math.round(0 * 0.70 + g * 0.30);
      const cardMixedB = Math.round(0 * 0.70 + b * 0.30);
      root.style.setProperty(`--card-bg-mixed`, `${cardMixedR} ${cardMixedG} ${cardMixedB}`);
      
      const headerMixedR = Math.round(0 * 0.78 + r * 0.22); // 22% theme color
      const headerMixedG = Math.round(0 * 0.78 + g * 0.22);
      const headerMixedB = Math.round(0 * 0.78 + b * 0.22);
      root.style.setProperty(`--header-bg-mixed`, `${headerMixedR} ${headerMixedG} ${headerMixedB}`);
      
      const settingsMixedR = Math.round(0 * 0.65 + r * 0.35); // 35% theme color
      const settingsMixedG = Math.round(0 * 0.65 + g * 0.35);
      const settingsMixedB = Math.round(0 * 0.65 + b * 0.35);
      root.style.setProperty(`--settings-bg-mixed`, `${settingsMixedR} ${settingsMixedG} ${settingsMixedB}`);
    } else {
      // Light mode: white base + strong theme color mix (like settings)
      const appMixedR = Math.round(255 * 0.88 + r * 0.12); // 12% theme color
      const appMixedG = Math.round(255 * 0.88 + g * 0.12);
      const appMixedB = Math.round(255 * 0.88 + b * 0.12);
      root.style.setProperty(`--app-bg-mixed`, `${appMixedR} ${appMixedG} ${appMixedB}`);
      
      const pageMixedR = Math.round(255 * 0.85 + r * 0.15); // 15% theme color
      const pageMixedG = Math.round(255 * 0.85 + g * 0.15);
      const pageMixedB = Math.round(255 * 0.85 + b * 0.15);
      root.style.setProperty(`--page-bg-mixed`, `${pageMixedR} ${pageMixedG} ${pageMixedB}`);
      
      const cardMixedR = Math.round(255 * 0.82 + r * 0.18); // 18% theme color
      const cardMixedG = Math.round(255 * 0.82 + g * 0.18);
      const cardMixedB = Math.round(255 * 0.82 + b * 0.18);
      root.style.setProperty(`--card-bg-mixed`, `${cardMixedR} ${cardMixedG} ${cardMixedB}`);
      
      const headerMixedR = Math.round(255 * 0.86 + r * 0.14); // 14% theme color
      const headerMixedG = Math.round(255 * 0.86 + g * 0.14);
      const headerMixedB = Math.round(255 * 0.86 + b * 0.14);
      root.style.setProperty(`--header-bg-mixed`, `${headerMixedR} ${headerMixedG} ${headerMixedB}`);
      
      const settingsMixedR = Math.round(255 * 0.78 + r * 0.22); // 22% theme color
      const settingsMixedG = Math.round(255 * 0.78 + g * 0.22);
      const settingsMixedB = Math.round(255 * 0.78 + b * 0.22);
      root.style.setProperty(`--settings-bg-mixed`, `${settingsMixedR} ${settingsMixedG} ${settingsMixedB}`);
    }

    // Apply other color properties
    Object.entries(colors).forEach(([key, value]) => {
      if (['primary', 'secondary', 'accent', 'primaryLight', 'primaryLighter', 'secondaryLight', 'secondaryLighter', 'accentLight', 'accentLighter'].includes(key)) {
        return; // Already handled above
      }
      
      if (key === 'gradient') {
        root.style.setProperty(`--color-gradient`, value);
        return;
      }
      
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set theme name as a data attribute for debugging
    root.setAttribute('data-theme', themeId);
  };

  // Change theme and persist to localStorage
  const changeTheme = (newThemeId) => {
    const allThemes = { ...colorThemes, ...customThemes };
    if (!allThemes[newThemeId]) {
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

  // Listen for custom theme changes from other tabs/components
  useEffect(() => {
    const handleCustomThemesChanged = () => {
      refreshCustomThemes();
    };

    window.addEventListener('customThemesChanged', handleCustomThemesChanged);
    return () => {
      window.removeEventListener('customThemesChanged', handleCustomThemesChanged);
    };
  }, []);

  // Dispatch custom event for global theme access
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('colorThemeChanged', {
      detail: { themeId: currentTheme, isDarkMode }
    }));
  }, [currentTheme, isDarkMode]);

  // Make theme globally accessible
  useEffect(() => {
    window.currentColorTheme = {
      themeId: currentTheme,
      isDarkMode,
      colors: getThemeColors(currentTheme, isDarkMode),
      applyTheme: (themeId, darkMode) => applyTheme(themeId, darkMode)
    };
  }, [currentTheme, isDarkMode]);

  // Get current theme object
  const getThemeColors = (themeId = currentTheme, darkMode = isDarkMode) => {
    const allThemes = { ...colorThemes, ...customThemes };
    const theme = allThemes[themeId];
    if (!theme) return colorThemes.slate[darkMode ? 'dark' : 'light'];
    
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
    availableThemes: Object.keys({ ...colorThemes, ...customThemes }),
    customThemes,
    refreshCustomThemes,
    applyTheme, // Expose for manual theme application if needed
  };
};

// Listen for storage changes to sync custom themes across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'custom-color-themes') {
      window.dispatchEvent(new CustomEvent('customThemesChanged'));
    }
  });
}
