import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Palette } from 'lucide-react';
import { colorThemes } from '@/lib/colorThemes';

const ColorPicker = ({ currentTheme, onThemeChange, isDarkMode }) => {
  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
  };

  const getColorPreview = (theme, isDark) => {
    // Safe check for theme existence
    if (!theme || !theme.light || !theme.dark) {
      console.warn('Theme data missing:', theme);
      return {
        background: 'linear-gradient(135deg, rgb(71, 85, 105), rgb(100, 116, 139))',
        border: '2px solid rgb(71, 85, 105)',
      };
    }
    
    const colors = isDark ? theme.dark : theme.light;
    const primaryColor = `rgb(${colors.primary})`;
    const accentColor = `rgb(${colors.accent})`;
    
    if (colors.gradient) {
      return {
        background: colors.gradient,
        border: `2px solid ${primaryColor}`,
      };
    }
    
    return {
      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
      border: `2px solid ${primaryColor}`,
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Palette className="h-4 w-4" />
          Color Theme
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a color scheme that works with both light and dark modes
        </p>
      </div>

      {/* Color Theme Grid - Clean layout without names */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.keys(colorThemes).map((themeId) => {
          const theme = colorThemes[themeId];
          const isSelected = currentTheme === themeId;
          
          // Skip invalid themes
          if (!theme || !theme.light || !theme.dark) {
            console.warn(`Skipping invalid theme: ${themeId}`, theme);
            return null;
          }
          
          return (
            <Button
              key={themeId}
              variant="outline"
              className={`h-auto p-2 flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-theme-primary ring-offset-2 border-theme-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleThemeSelect(themeId)}
              title={theme?.name || themeId} // Show name as tooltip
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg shadow-sm transition-transform duration-200"
                  style={getColorPreview(theme, isDarkMode)}
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Check className="h-3 w-3 text-gray-900" />
                    </div>
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Current Theme Info - Only shown as a small indicator */}
      {currentTheme && colorThemes[currentTheme] && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-lg shadow-sm"
              style={getColorPreview(colorThemes[currentTheme], isDarkMode)}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {colorThemes[currentTheme]?.name || 'Unknown Theme'}
              </p>
              <p className="text-xs text-muted-foreground">
                Active theme for {isDarkMode ? 'dark' : 'light'} mode
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
