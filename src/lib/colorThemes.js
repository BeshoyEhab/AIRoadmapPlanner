// Modern comprehensive color palette system for all UI elements
export const colorThemes = {
  slate: {
    id: 'slate',
    name: 'Professional Slate',
    light: {
      primary: '30 41 59',      // slate-800 - Main buttons, primary actions (much darker)
      accent: '51 65 85',       // slate-700 - Secondary buttons, accents
      background: '248 250 252', // slate-50 - Main background
      surface: '255 255 255',   // white - Cards, surfaces
      border: '203 213 225',    // slate-300 - Borders, dividers (darker)
      textPrimary: '15 23 42',  // slate-900 - Main text (very dark)
      textSecondary: '30 41 59', // slate-800 - Secondary text (darker)
      textMuted: '71 85 105',   // slate-600 - Muted text (much darker for readability)
      shadow: '71 85 105',      // slate-600 - Shadows and glows
      ring: '71 85 105',        // slate-600 - Focus rings
    },
    dark: {
      primary: '148 163 184',   // slate-400 - Main buttons, primary actions
      accent: '100 116 139',    // slate-500 - Secondary buttons, accents
      background: '2 6 23',     // slate-950 - Main background
      surface: '15 23 42',      // slate-900 - Cards, surfaces
      border: '51 65 85',       // slate-700 - Borders, dividers
      textPrimary: '248 250 252', // slate-50 - Main text (bright for contrast)
      textSecondary: '226 232 240', // slate-200 - Secondary text (lighter)
      textMuted: '156 163 175',  // slate-400 - Muted text (lighter)
      shadow: '148 163 184',    // slate-400 - Shadows and glows
      ring: '148 163 184',      // slate-400 - Focus rings
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Modern Emerald',
    light: {
      primary: '16 185 129',    // emerald-500 - Main buttons
      accent: '52 211 153',     // emerald-400 - Secondary elements
      background: '236 253 245', // emerald-50 - Main background
      surface: '255 255 255',   // white - Cards
      border: '167 243 208',    // emerald-200 - Borders
      textPrimary: '6 78 59',   // emerald-900 - Main text
      textSecondary: '6 95 70',  // emerald-800 - Secondary text (darker)
      textMuted: '4 120 87',    // emerald-700 - Muted text (much darker)
      shadow: '16 185 129',     // emerald-500 - Shadows
      ring: '16 185 129',       // emerald-500 - Focus rings
    },
    dark: {
      primary: '110 231 183',   // emerald-300 - Main buttons
      accent: '52 211 153',     // emerald-400 - Secondary elements
      background: '2 44 34',    // emerald-950 - Main background
      surface: '6 78 59',       // emerald-900 - Cards
      border: '6 95 70',        // emerald-800 - Borders
      textPrimary: '236 253 245', // emerald-50 - Main text
      textSecondary: '167 243 208', // emerald-200 - Secondary text
      textMuted: '110 231 183',  // emerald-300 - Muted text
      shadow: '110 231 183',    // emerald-300 - Shadows
      ring: '110 231 183',      // emerald-300 - Focus rings
    }
  },
  violet: {
    id: 'violet',
    name: 'Deep Violet',
    light: {
      primary: '139 92 246',   // violet-500 - Main buttons
      accent: '167 139 250',   // violet-400 - Secondary elements
      background: '245 243 255', // violet-50 - Main background
      surface: '255 255 255',  // white - Cards
      border: '221 214 254',   // violet-200 - Borders
      textPrimary: '46 16 101', // violet-900 - Main text
      textSecondary: '68 27 122', // violet-800 - Secondary text (darker)
      textMuted: '91 33 182',   // violet-700 - Muted text (much darker)
      shadow: '139 92 246',    // violet-500 - Shadows
      ring: '139 92 246',      // violet-500 - Focus rings
    },
    dark: {
      primary: '196 181 253',  // violet-300 - Main buttons
      accent: '167 139 250',   // violet-400 - Secondary elements
      background: '24 24 27',  // violet-950 - Main background
      surface: '46 16 101',    // violet-900 - Cards
      border: '68 27 122',     // violet-800 - Borders
      textPrimary: '245 243 255', // violet-50 - Main text
      textSecondary: '221 214 254', // violet-200 - Secondary text
      textMuted: '196 181 253', // violet-300 - Muted text
      shadow: '196 181 253',   // violet-300 - Shadows
      ring: '196 181 253',     // violet-300 - Focus rings
    }
  },
  sky: {
    id: 'sky',
    name: 'Modern Sky',
    light: {
      primary: '14 165 233',    // sky-500 - Main buttons
      accent: '56 189 248',     // sky-400 - Secondary elements
      background: '240 249 255', // sky-50 - Main background
      surface: '255 255 255',   // white - Cards
      border: '186 230 253',    // sky-200 - Borders
      textPrimary: '12 74 110',  // sky-900 - Main text
      textSecondary: '3 105 161', // sky-800 - Secondary text (darker)
      textMuted: '7 89 133',     // sky-700 - Muted text (much darker)
      shadow: '14 165 233',     // sky-500 - Shadows
      ring: '14 165 233',       // sky-500 - Focus rings
    },
    dark: {
      primary: '125 211 252',   // sky-300 - Main buttons
      accent: '56 189 248',     // sky-400 - Secondary elements
      background: '8 47 73',    // sky-950 - Main background
      surface: '12 74 110',     // sky-900 - Cards
      border: '7 89 133',       // sky-700 - Borders
      textPrimary: '240 249 255', // sky-50 - Main text
      textSecondary: '186 230 253', // sky-200 - Secondary text
      textMuted: '125 211 252',  // sky-300 - Muted text
      shadow: '125 211 252',    // sky-300 - Shadows
      ring: '125 211 252',      // sky-300 - Focus rings
    }
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    light: {
      primary: '245 158 11',    // amber-500 - Main buttons
      accent: '251 191 36',     // amber-400 - Secondary elements
      background: '255 251 235', // amber-50 - Main background
      surface: '255 255 255',   // white - Cards
      border: '254 215 170',    // amber-200 - Borders
      textPrimary: '146 64 14',  // amber-900 - Main text
      textSecondary: '146 64 14', // amber-900 - Secondary text (same as primary for readability)
      textMuted: '180 83 9',     // amber-700 - Muted text (much darker)
      shadow: '245 158 11',     // amber-500 - Shadows
      ring: '245 158 11',       // amber-500 - Focus rings
    },
    dark: {
      primary: '252 211 77',    // amber-300 - Main buttons
      accent: '251 191 36',     // amber-400 - Secondary elements
      background: '69 39 5',    // amber-950 - Main background
      surface: '146 64 14',     // amber-900 - Cards
      border: '180 83 9',       // amber-700 - Borders
      textPrimary: '255 251 235', // amber-50 - Main text
      textSecondary: '254 215 170', // amber-200 - Secondary text
      textMuted: '252 211 77',   // amber-300 - Muted text
      shadow: '252 211 77',     // amber-300 - Shadows
      ring: '252 211 77',       // amber-300 - Focus rings
    }
  },
  rose: {
    id: 'rose',
    name: 'Elegant Rose',
    light: {
      primary: '244 63 94',     // rose-500 - Main buttons
      accent: '251 113 133',    // rose-400 - Secondary elements
      background: '255 241 242', // rose-50 - Main background
      surface: '255 255 255',   // white - Cards
      border: '254 205 211',    // rose-200 - Borders
      textPrimary: '136 19 55',  // rose-900 - Main text
      textSecondary: '159 18 57', // rose-700 - Secondary text
      textMuted: '190 24 93',    // rose-800 - Muted text (much darker)
      shadow: '244 63 94',      // rose-500 - Shadows
      ring: '244 63 94',        // rose-500 - Focus rings
    },
    dark: {
      primary: '253 164 175',   // rose-300 - Main buttons
      accent: '251 113 133',    // rose-400 - Secondary elements
      background: '76 5 25',    // rose-950 - Main background
      surface: '136 19 55',     // rose-900 - Cards
      border: '159 18 57',      // rose-700 - Borders
      textPrimary: '255 241 242', // rose-50 - Main text
      textSecondary: '254 205 211', // rose-200 - Secondary text
      textMuted: '253 164 175',  // rose-300 - Muted text
      shadow: '253 164 175',    // rose-300 - Shadows
      ring: '253 164 175',      // rose-300 - Focus rings
    }
  },
  teal: {
    id: 'teal',
    name: 'Ocean Teal',
    light: {
      primary: '20 184 166',     // teal-500 - Main buttons
      accent: '45 212 191',      // teal-400 - Secondary elements
      background: '240 253 250', // teal-50 - Main background
      surface: '255 255 255',    // white - Cards
      border: '153 246 228',     // teal-200 - Borders
      textPrimary: '19 78 74',   // teal-900 - Main text
      textSecondary: '17 94 89', // teal-800 - Secondary text
      textMuted: '94 234 212',   // teal-300 - Muted text
      shadow: '20 184 166',      // teal-500 - Shadows
      ring: '20 184 166',        // teal-500 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(20 184 166), rgb(45 212 191))'
    },
    dark: {
      primary: '94 234 212',     // teal-300 - Main buttons
      accent: '45 212 191',      // teal-400 - Secondary elements
      background: '19 78 74',    // teal-900 - Main background
      surface: '17 94 89',       // teal-800 - Cards
      border: '15 118 110',      // teal-700 - Borders
      textPrimary: '240 253 250', // teal-50 - Main text
      textSecondary: '204 251 241', // teal-100 - Secondary text
      textMuted: '153 246 228',  // teal-200 - Muted text
      shadow: '94 234 212',      // teal-300 - Shadows
      ring: '94 234 212',        // teal-300 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(94 234 212), rgb(45 212 191))'
    }
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    light: {
      primary: '147 51 234',     // purple-600 - Main buttons
      accent: '168 85 247',      // purple-500 - Secondary elements
      background: '250 245 255', // purple-50 - Main background
      surface: '255 255 255',    // white - Cards
      border: '221 214 254',     // purple-200 - Borders
      textPrimary: '59 7 100',   // purple-900 - Main text
      textSecondary: '88 28 135', // purple-800 - Secondary text
      textMuted: '196 181 253',  // purple-300 - Muted text
      shadow: '147 51 234',      // purple-600 - Shadows
      ring: '147 51 234',        // purple-600 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(147 51 234), rgb(168 85 247))'
    },
    dark: {
      primary: '196 181 253',    // purple-300 - Main buttons
      accent: '168 85 247',      // purple-500 - Secondary elements
      background: '59 7 100',    // purple-900 - Main background
      surface: '88 28 135',      // purple-800 - Cards
      border: '107 33 168',      // purple-700 - Borders
      textPrimary: '250 245 255', // purple-50 - Main text
      textSecondary: '233 213 255', // purple-100 - Secondary text
      textMuted: '221 214 254',  // purple-200 - Muted text
      shadow: '196 181 253',     // purple-300 - Shadows
      ring: '196 181 253',       // purple-300 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(196 181 253), rgb(168 85 247))'
    }
  },
  gradient_sunset: {
    id: 'gradient_sunset',
    name: 'Sunset Gradient',
    light: {
      primary: '249 115 22',     // orange-500 - Main buttons
      accent: '244 63 94',       // rose-500 - Secondary elements
      background: '255 247 237', // orange-50 - Main background
      surface: '255 255 255',    // white - Cards
      border: '254 215 170',     // orange-200 - Borders
      textPrimary: '154 52 18',  // orange-900 - Main text
      textSecondary: '194 65 12', // orange-800 - Secondary text
      textMuted: '253 186 116',  // orange-300 - Muted text
      shadow: '249 115 22',      // orange-500 - Shadows
      ring: '249 115 22',        // orange-500 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(249 115 22), rgb(244 63 94), rgb(168 85 247))'
    },
    dark: {
      primary: '253 186 116',    // orange-300 - Main buttons
      accent: '251 113 133',     // rose-400 - Secondary elements
      background: '154 52 18',   // orange-900 - Main background
      surface: '194 65 12',      // orange-800 - Cards
      border: '234 88 12',       // orange-700 - Borders
      textPrimary: '255 247 237', // orange-50 - Main text
      textSecondary: '254 215 170', // orange-200 - Secondary text
      textMuted: '253 186 116',  // orange-300 - Muted text
      shadow: '253 186 116',     // orange-300 - Shadows
      ring: '253 186 116',       // orange-300 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(253 186 116), rgb(251 113 133), rgb(196 181 253))'
    }
  },
  gradient_ocean: {
    id: 'gradient_ocean',
    name: 'Ocean Depths',
    light: {
      primary: '6 182 212',      // cyan-500 - Main buttons
      accent: '59 130 246',      // blue-500 - Secondary elements
      background: '236 254 255', // cyan-50 - Main background
      surface: '255 255 255',    // white - Cards
      border: '165 243 252',     // cyan-200 - Borders
      textPrimary: '22 78 99',   // cyan-900 - Main text
      textSecondary: '14 116 144', // cyan-800 - Secondary text
      textMuted: '103 232 249',  // cyan-300 - Muted text
      shadow: '6 182 212',       // cyan-500 - Shadows
      ring: '6 182 212',         // cyan-500 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(6 182 212), rgb(59 130 246), rgb(16 185 129))'
    },
    dark: {
      primary: '103 232 249',    // cyan-300 - Main buttons
      accent: '125 211 252',     // sky-300 - Secondary elements
      background: '22 78 99',    // cyan-900 - Main background
      surface: '14 116 144',     // cyan-800 - Cards
      border: '21 94 117',       // cyan-700 - Borders
      textPrimary: '236 254 255', // cyan-50 - Main text
      textSecondary: '207 250 254', // cyan-100 - Secondary text
      textMuted: '165 243 252',  // cyan-200 - Muted text
      shadow: '103 232 249',     // cyan-300 - Shadows
      ring: '103 232 249',       // cyan-300 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(103 232 249), rgb(125 211 252), rgb(110 231 183))'
    }
  },
  gradient_forest: {
    id: 'gradient_forest',
    name: 'Forest Canopy',
    light: {
      primary: '34 197 94',      // green-500 - Main buttons
      accent: '101 163 13',      // lime-600 - Secondary elements
      background: '240 253 244', // green-50 - Main background
      surface: '255 255 255',    // white - Cards
      border: '187 247 208',     // green-200 - Borders
      textPrimary: '20 83 45',   // green-900 - Main text
      textSecondary: '22 101 52', // green-800 - Secondary text
      textMuted: '134 239 172',  // green-300 - Muted text
      shadow: '34 197 94',       // green-500 - Shadows
      ring: '34 197 94',         // green-500 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(34 197 94), rgb(101 163 13), rgb(20 184 166))'
    },
    dark: {
      primary: '134 239 172',    // green-300 - Main buttons
      accent: '163 230 53',      // lime-400 - Secondary elements
      background: '20 83 45',    // green-900 - Main background
      surface: '22 101 52',      // green-800 - Cards
      border: '21 128 61',       // green-700 - Borders
      textPrimary: '240 253 244', // green-50 - Main text
      textSecondary: '220 252 231', // green-100 - Secondary text
      textMuted: '187 247 208',  // green-200 - Muted text
      shadow: '134 239 172',     // green-300 - Shadows
      ring: '134 239 172',       // green-300 - Focus rings
      gradient: 'linear-gradient(135deg, rgb(134 239 172), rgb(163 230 53), rgb(94 234 212))'
    }
  }
};

// Function to apply comprehensive color theme to CSS variables
export const applyColorTheme = (themeId, isDarkMode) => {
  const theme = colorThemes[themeId];
  if (!theme) return;

  const colors = isDarkMode ? theme.dark : theme.light;
  const root = document.documentElement;

  // Apply comprehensive CSS custom properties for new system
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  root.style.setProperty('--color-shadow', colors.shadow);
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
  return localStorage.getItem('color-theme') || 'slate';
};

// Function to get theme colors for a specific theme and mode
export const getThemeColors = (themeId, isDarkMode) => {
  const theme = colorThemes[themeId];
  if (!theme) return null;
  
  return isDarkMode ? theme.dark : theme.light;
};
