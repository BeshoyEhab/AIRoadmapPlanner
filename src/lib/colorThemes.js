// Color theme definitions that work with both light and dark modes
export const colorThemes = {
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    light: {
      primary: '59 130 246', // blue-500
      primaryForeground: '255 255 255', // white
      accent: '147 197 253', // blue-300
      accentForeground: '30 58 138', // blue-900
      border: '219 234 254', // blue-100
      ring: '59 130 246', // blue-500
    },
    dark: {
      primary: '147 197 253', // blue-300
      primaryForeground: '30 58 138', // blue-900
      accent: '59 130 246', // blue-500
      accentForeground: '219 234 254', // blue-100
      border: '59 130 246', // blue-500
      ring: '147 197 253', // blue-300
    }
  },
  red: {
    id: 'red',
    name: 'Ruby Red',
    light: {
      primary: '239 68 68', // red-500
      primaryForeground: '255 255 255', // white
      accent: '252 165 165', // red-300
      accentForeground: '127 29 29', // red-900
      border: '254 226 226', // red-100
      ring: '239 68 68', // red-500
    },
    dark: {
      primary: '252 165 165', // red-300
      primaryForeground: '127 29 29', // red-900
      accent: '239 68 68', // red-500
      accentForeground: '254 226 226', // red-100
      border: '239 68 68', // red-500
      ring: '252 165 165', // red-300
    }
  },
  green: {
    id: 'green',
    name: 'Forest Green',
    light: {
      primary: '34 197 94', // green-500
      primaryForeground: '255 255 255', // white
      accent: '134 239 172', // green-300
      accentForeground: '20 83 45', // green-900
      border: '220 252 231', // green-100
      ring: '34 197 94', // green-500
    },
    dark: {
      primary: '134 239 172', // green-300
      primaryForeground: '20 83 45', // green-900
      accent: '34 197 94', // green-500
      accentForeground: '220 252 231', // green-100
      border: '34 197 94', // green-500
      ring: '134 239 172', // green-300
    }
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    light: {
      primary: '168 85 247', // purple-500
      primaryForeground: '255 255 255', // white
      accent: '196 181 253', // purple-300
      accentForeground: '88 28 135', // purple-900
      border: '243 232 255', // purple-100
      ring: '168 85 247', // purple-500
    },
    dark: {
      primary: '196 181 253', // purple-300
      primaryForeground: '88 28 135', // purple-900
      accent: '168 85 247', // purple-500
      accentForeground: '243 232 255', // purple-100
      border: '168 85 247', // purple-500
      ring: '196 181 253', // purple-300
    }
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    light: {
      primary: '249 115 22', // orange-500
      primaryForeground: '255 255 255', // white
      accent: '251 146 60', // orange-400
      accentForeground: '154 52 18', // orange-900
      border: '255 237 213', // orange-100
      ring: '249 115 22', // orange-500
    },
    dark: {
      primary: '251 146 60', // orange-400
      primaryForeground: '154 52 18', // orange-900
      accent: '249 115 22', // orange-500
      accentForeground: '255 237 213', // orange-100
      border: '249 115 22', // orange-500
      ring: '251 146 60', // orange-400
    }
  },
  pink: {
    id: 'pink',
    name: 'Cherry Pink',
    light: {
      primary: '236 72 153', // pink-500
      primaryForeground: '255 255 255', // white
      accent: '244 114 182', // pink-400
      accentForeground: '131 24 67', // pink-900
      border: '252 231 243', // pink-100
      ring: '236 72 153', // pink-500
    },
    dark: {
      primary: '244 114 182', // pink-400
      primaryForeground: '131 24 67', // pink-900
      accent: '236 72 153', // pink-500
      accentForeground: '252 231 243', // pink-100
      border: '236 72 153', // pink-500
      ring: '244 114 182', // pink-400
    }
  },
  teal: {
    id: 'teal',
    name: 'Ocean Teal',
    light: {
      primary: '20 184 166', // teal-500
      primaryForeground: '255 255 255', // white
      accent: '94 234 212', // teal-300
      accentForeground: '19 78 74', // teal-900
      border: '204 251 241', // teal-100
      ring: '20 184 166', // teal-500
    },
    dark: {
      primary: '94 234 212', // teal-300
      primaryForeground: '19 78 74', // teal-900
      accent: '20 184 166', // teal-500
      accentForeground: '204 251 241', // teal-100
      border: '20 184 166', // teal-500
      ring: '94 234 212', // teal-300
    }
  },
  indigo: {
    id: 'indigo',
    name: 'Deep Indigo',
    light: {
      primary: '99 102 241', // indigo-500
      primaryForeground: '255 255 255', // white
      accent: '165 180 252', // indigo-300
      accentForeground: '49 46 129', // indigo-900
      border: '224 231 255', // indigo-100
      ring: '99 102 241', // indigo-500
    },
    dark: {
      primary: '165 180 252', // indigo-300
      primaryForeground: '49 46 129', // indigo-900
      accent: '99 102 241', // indigo-500
      accentForeground: '224 231 255', // indigo-100
      border: '99 102 241', // indigo-500
      ring: '165 180 252', // indigo-300
    }
  },
  // Gradient themes
  blueGreen: {
    id: 'blueGreen',
    name: 'Blue-Green Gradient',
    light: {
      primary: '59 130 246', // blue-500 base
      primaryForeground: '255 255 255',
      accent: '20 184 166', // teal-500
      accentForeground: '30 58 138',
      border: '219 234 254',
      ring: '59 130 246',
      gradient: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(20, 184, 166))'
    },
    dark: {
      primary: '147 197 253', // blue-300
      primaryForeground: '30 58 138',
      accent: '94 234 212', // teal-300
      accentForeground: '219 234 254',
      border: '59 130 246',
      ring: '147 197 253',
      gradient: 'linear-gradient(135deg, rgb(147, 197, 253), rgb(94, 234, 212))'
    }
  },
  purplePink: {
    id: 'purplePink',
    name: 'Purple-Pink Gradient',
    light: {
      primary: '168 85 247', // purple-500
      primaryForeground: '255 255 255',
      accent: '236 72 153', // pink-500
      accentForeground: '88 28 135',
      border: '243 232 255',
      ring: '168 85 247',
      gradient: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(236, 72, 153))'
    },
    dark: {
      primary: '196 181 253', // purple-300
      primaryForeground: '88 28 135',
      accent: '244 114 182', // pink-400
      accentForeground: '243 232 255',
      border: '168 85 247',
      ring: '196 181 253',
      gradient: 'linear-gradient(135deg, rgb(196, 181, 253), rgb(244, 114, 182))'
    }
  },
  redOrange: {
    id: 'redOrange',
    name: 'Red-Orange Gradient',
    light: {
      primary: '239 68 68', // red-500
      primaryForeground: '255 255 255',
      accent: '249 115 22', // orange-500
      accentForeground: '127 29 29',
      border: '254 226 226',
      ring: '239 68 68',
      gradient: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(249, 115, 22))'
    },
    dark: {
      primary: '252 165 165', // red-300
      primaryForeground: '127 29 29',
      accent: '251 146 60', // orange-400
      accentForeground: '254 226 226',
      border: '239 68 68',
      ring: '252 165 165',
      gradient: 'linear-gradient(135deg, rgb(252, 165, 165), rgb(251, 146, 60))'
    }
  }
};

// Function to apply color theme to CSS variables
export const applyColorTheme = (themeId, isDarkMode) => {
  const theme = colorThemes[themeId];
  if (!theme) return;

  const colors = isDarkMode ? theme.dark : theme.light;
  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-foreground', colors.accentForeground);
  root.style.setProperty('--color-border-accent', colors.border);
  root.style.setProperty('--color-ring', colors.ring);

  // Apply gradient if available
  if (colors.gradient) {
    root.style.setProperty('--color-gradient', colors.gradient);
  }

  // Store the theme preference
  localStorage.setItem('color-theme', themeId);
};

// Function to get current color theme
export const getCurrentColorTheme = () => {
  return localStorage.getItem('color-theme') || 'blue';
};

// Function to get theme colors for a specific theme and mode
export const getThemeColors = (themeId, isDarkMode) => {
  const theme = colorThemes[themeId];
  if (!theme) return null;
  
  return isDarkMode ? theme.dark : theme.light;
};
