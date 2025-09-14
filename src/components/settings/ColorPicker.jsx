import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, Sparkles } from 'lucide-react';
import { colorThemes } from '@/lib/colorThemes';

const ColorPicker = ({ currentTheme, onThemeChange, isDarkMode }) => {
  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
  };

  const getColorPreview = (theme, isDark) => {
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

  const themeCategories = [
    {
      title: 'Solid Colors',
      themes: ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'teal', 'indigo']
    },
    {
      title: 'Gradient Colors',
      themes: ['blueGreen', 'purplePink', 'redOrange']
    }
  ];

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

      {themeCategories.map((category) => (
        <div key={category.title} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">{category.title}</h4>
            {category.title === 'Gradient Colors' && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.themes.map((themeId) => {
              const theme = colorThemes[themeId];
              const isSelected = currentTheme === themeId;
              
              return (
                <Button
                  key={themeId}
                  variant="outline"
                  className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 ${
                    isSelected 
                      ? 'ring-2 ring-theme ring-offset-2 border-theme-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleThemeSelect(themeId)}
                >
                  {/* Color Preview */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm transition-transform duration-200"
                      style={getColorPreview(theme, isDarkMode)}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4 text-gray-900" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Theme Name */}
                  <div className="text-center">
                    <span className={`text-sm font-medium transition-colors ${
                      isSelected ? 'text-theme-primary' : 'text-foreground'
                    }`}>
                      {theme.name}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Current Theme Info */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg shadow-sm"
            style={getColorPreview(colorThemes[currentTheme], isDarkMode)}
          />
          <div>
            <p className="font-medium text-foreground">
              {colorThemes[currentTheme]?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Currently active theme - adapts to {isDarkMode ? 'dark' : 'light'} mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
