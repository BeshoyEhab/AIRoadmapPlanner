import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Palette, Plus, Trash2, Edit3 } from 'lucide-react';
import { colorThemes } from '@/lib/colorThemes';
import { useColorTheme } from '@/hooks/useColorTheme';
import { toast } from 'sonner';

const ColorPicker = ({ currentTheme, onThemeChange, isDarkMode }) => {
  const { customThemes, refreshCustomThemes } = useColorTheme(isDarkMode);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0); // Force re-render counter
  const [customForm, setCustomForm] = useState({
    name: '',
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    backgroundLight: '#f8fafc',
    backgroundDark: '#0f172a',
    borderColor: '#e2e8f0',
    borderColorDark: '#475569',
    surfaceColor: '#ffffff',
    surfaceColorDark: '#1e293b',
    textPrimaryColor: '#0f172a',
    textPrimaryColorDark: '#f8fafc',
    textSecondaryColor: '#475569',
    textSecondaryColorDark: '#cbd5e1'
  });

  // Listen for custom theme changes and force refresh
  useEffect(() => {
    const handleThemeUpdate = () => {
      refreshCustomThemes();
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('customThemesChanged', handleThemeUpdate);
    return () => window.removeEventListener('customThemesChanged', handleThemeUpdate);
  }, [refreshCustomThemes]);

  // Save custom themes to localStorage and trigger global refresh
  const saveCustomThemes = (themes) => {
    try {
      localStorage.setItem('custom-color-themes', JSON.stringify(themes));
      // Refresh custom themes in the hook immediately
      refreshCustomThemes();
      // Dispatch global event for cross-component synchronization
      window.dispatchEvent(new CustomEvent('customThemesChanged'));
    } catch (error) {
      console.error('Error saving custom themes:', error);
      toast.error('Failed to save custom theme');
    }
  };

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
  };

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Create custom theme object
  const createCustomTheme = () => {
    const primary = hexToRgb(customForm.primaryColor);
    const accent = hexToRgb(customForm.accentColor);
    const bgLight = hexToRgb(customForm.backgroundLight);
    const bgDark = hexToRgb(customForm.backgroundDark);
    const borderLight = hexToRgb(customForm.borderColor);
    const borderDark = hexToRgb(customForm.borderColorDark);
    const surfaceLight = hexToRgb(customForm.surfaceColor);
    const surfaceDark = hexToRgb(customForm.surfaceColorDark);
    const textPrimLight = hexToRgb(customForm.textPrimaryColor);
    const textPrimDark = hexToRgb(customForm.textPrimaryColorDark);
    const textSecLight = hexToRgb(customForm.textSecondaryColor);
    const textSecDark = hexToRgb(customForm.textSecondaryColorDark);

    if (!primary || !accent || !bgLight || !bgDark || !borderLight || !borderDark || !surfaceLight || !surfaceDark || !textPrimLight || !textPrimDark || !textSecLight || !textSecDark) {
      toast.error('Invalid color values');
      return;
    }

    const themeId = editingTheme || `custom-${Date.now()}`;
    const newTheme = {
      id: themeId,
      name: customForm.name || 'Custom Theme',
      isCustom: true,
      light: {
        primary: `${primary.r} ${primary.g} ${primary.b}`,
        accent: `${accent.r} ${accent.g} ${accent.b}`,
        background: `${bgLight.r} ${bgLight.g} ${bgLight.b}`,
        surface: `${surfaceLight.r} ${surfaceLight.g} ${surfaceLight.b}`,
        border: `${borderLight.r} ${borderLight.g} ${borderLight.b}`,
        textPrimary: `${textPrimLight.r} ${textPrimLight.g} ${textPrimLight.b}`,
        textSecondary: `${textSecLight.r} ${textSecLight.g} ${textSecLight.b}`,
        textMuted: `${Math.floor((textSecLight.r + 100) / 2)} ${Math.floor((textSecLight.g + 100) / 2)} ${Math.floor((textSecLight.b + 100) / 2)}`,
        shadow: `${primary.r} ${primary.g} ${primary.b}`,
        ring: `${primary.r} ${primary.g} ${primary.b}`,
      },
      dark: {
        primary: `${primary.r} ${primary.g} ${primary.b}`,
        accent: `${accent.r} ${accent.g} ${accent.b}`,
        background: `${bgDark.r} ${bgDark.g} ${bgDark.b}`,
        surface: `${surfaceDark.r} ${surfaceDark.g} ${surfaceDark.b}`,
        border: `${borderDark.r} ${borderDark.g} ${borderDark.b}`,
        textPrimary: `${textPrimDark.r} ${textPrimDark.g} ${textPrimDark.b}`,
        textSecondary: `${textSecDark.r} ${textSecDark.g} ${textSecDark.b}`,
        textMuted: `${Math.floor((textSecDark.r + textPrimDark.r) / 2)} ${Math.floor((textSecDark.g + textPrimDark.g) / 2)} ${Math.floor((textSecDark.b + textPrimDark.b) / 2)}`,
        shadow: `${primary.r} ${primary.g} ${primary.b}`,
        ring: `${primary.r} ${primary.g} ${primary.b}`,
      }
    };

    const updatedThemes = { ...customThemes, [themeId]: newTheme };
    
    // Save themes and trigger immediate refresh
    console.log('Creating custom theme:', themeId, 'with themes count before:', Object.keys(customThemes).length);
    saveCustomThemes(updatedThemes);
    
    // Force immediate state update
    setRefreshCounter(prev => prev + 1);
    console.log('Updated refresh counter after theme creation');
    
    // Multiple refresh attempts to ensure availability
    setTimeout(() => {
      refreshCustomThemes();
      setRefreshCounter(prev => prev + 1);
      console.log('First refresh attempt completed');
      
      // Apply the theme after ensuring it's available
      setTimeout(() => {
        console.log('Attempting to apply newly created theme:', themeId);
        onThemeChange(themeId);
        // Final refresh to update UI
        refreshCustomThemes();
        setRefreshCounter(prev => prev + 1);
        console.log('Theme creation and application completed');
      }, 50);
    }, 50);
    
    // Reset form
    setCustomForm({
      name: '',
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      backgroundLight: '#f8fafc',
      backgroundDark: '#0f172a',
      borderColor: '#e2e8f0',
      borderColorDark: '#475569',
      surfaceColor: '#ffffff',
      surfaceColorDark: '#1e293b',
      textPrimaryColor: '#0f172a',
      textPrimaryColorDark: '#f8fafc',
      textSecondaryColor: '#475569',
      textSecondaryColorDark: '#cbd5e1'
    });
    setShowCustomForm(false);
    setEditingTheme(null);
    
    toast.success(editingTheme ? 'Theme updated and applied!' : 'Custom theme created and applied!');
  };

  // Delete custom theme
  const deleteCustomTheme = (themeId) => {
    const updatedThemes = { ...customThemes };
    delete updatedThemes[themeId];
    saveCustomThemes(updatedThemes);
    
    // Switch to default theme if deleting current theme
    if (currentTheme === themeId) {
      onThemeChange('slate');
    }
    
    toast.success('Custom theme deleted');
  };

  // Edit custom theme
  const editCustomTheme = (themeId) => {
    const theme = customThemes[themeId];
    if (!theme) return;
    
    const primaryRgb = theme.light.primary.split(' ');
    const accentRgb = theme.light.accent.split(' ');
    const bgLightRgb = theme.light.background.split(' ');
    const bgDarkRgb = theme.dark.background.split(' ');
    
    setCustomForm({
      name: theme.name,
      primaryColor: `#${parseInt(primaryRgb[0]).toString(16).padStart(2, '0')}${parseInt(primaryRgb[1]).toString(16).padStart(2, '0')}${parseInt(primaryRgb[2]).toString(16).padStart(2, '0')}`,
      accentColor: `#${parseInt(accentRgb[0]).toString(16).padStart(2, '0')}${parseInt(accentRgb[1]).toString(16).padStart(2, '0')}${parseInt(accentRgb[2]).toString(16).padStart(2, '0')}`,
      backgroundLight: `#${parseInt(bgLightRgb[0]).toString(16).padStart(2, '0')}${parseInt(bgLightRgb[1]).toString(16).padStart(2, '0')}${parseInt(bgLightRgb[2]).toString(16).padStart(2, '0')}`,
      backgroundDark: `#${parseInt(bgDarkRgb[0]).toString(16).padStart(2, '0')}${parseInt(bgDarkRgb[1]).toString(16).padStart(2, '0')}${parseInt(bgDarkRgb[2]).toString(16).padStart(2, '0')}`
    });
    setEditingTheme(themeId);
    setShowCustomForm(true);
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

  // Get all themes (built-in + custom)
  const _allThemes = { ...colorThemes, ...customThemes };

  return (
    <div className="space-y-6">
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold text-main mb-3">
          <Palette className="h-4 w-4 text-theme-primary" />
          Color Theme
        </Label>
        <p className="text-sm text-secondary mb-4">
          Choose a color scheme or create your own custom theme
        </p>
      </div>

      {/* Built-in Themes */}
      <div>
        <h4 className="text-sm font-medium text-main mb-3">Built-in Themes</h4>
        <div className="grid grid-cols-4 gap-3 mb-6">
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
                className={`h-auto p-2 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-theme-primary ring-offset-2 border-theme-primary shadow-xl' 
                    : 'hover:shadow-md border-default/50'
                }`}
                onClick={() => handleThemeSelect(themeId)}
                title={theme?.name || themeId}
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl shadow-lg transition-transform duration-200"
                    style={getColorPreview(theme, isDarkMode)}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-4 w-4 text-theme-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Themes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-main">Custom Themes</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-2 text-theme-primary border-theme-primary/50 hover:bg-theme-primary/10"
          >
            <Plus className="h-4 w-4" />
            Add Custom
          </Button>
        </div>
        
        {Object.keys(customThemes).length > 0 ? (
          <div className="grid grid-cols-4 gap-3" key={`custom-themes-${refreshCounter}`}>
            {Object.keys(customThemes).map((themeId) => {
              const theme = customThemes[themeId];
              const isSelected = currentTheme === themeId;
              
              return (
                <div key={`${themeId}-${refreshCounter}`} className="relative group">
                  <Button
                    variant="outline"
                    className={`h-auto p-2 w-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-theme-primary ring-offset-2 border-theme-primary shadow-xl' 
                        : 'hover:shadow-md border-default/50'
                    }`}
                    onClick={() => handleThemeSelect(themeId)}
                    title={theme?.name || themeId}
                  >
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl shadow-lg transition-transform duration-200"
                        style={getColorPreview(theme, isDarkMode)}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Check className="h-4 w-4 text-theme-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                  
                  {/* Custom theme controls */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 bg-theme-primary/90 border-theme-primary text-white hover:bg-theme-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        editCustomTheme(themeId);
                      }}
                      title="Edit theme"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 bg-error/90 border-error text-white hover:bg-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this custom theme?')) {
                          deleteCustomTheme(themeId);
                        }
                      }}
                      title="Delete theme"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-default/50 rounded-lg">
            <Palette className="h-8 w-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No custom themes yet</p>
            <p className="text-xs text-muted mt-1">Click "Add Custom" to create your own theme</p>
          </div>
        )}
      </div>

      {/* Custom Theme Form */}
      {showCustomForm && (
        <div className="border border-default rounded-xl p-6 bg-surface shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-main">
              {editingTheme ? 'Edit Custom Theme' : 'Create Custom Theme'}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCustomForm(false);
                setEditingTheme(null);
                setCustomForm({
                  name: '',
                  primaryColor: '#6366f1',
                  accentColor: '#8b5cf6',
                  backgroundLight: '#f8fafc',
                  backgroundDark: '#0f172a'
                });
              }}
            >
              Cancel
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme-name" className="text-sm font-medium text-main">Theme Name</Label>
              <Input
                id="theme-name"
                value={customForm.name}
                onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                placeholder="My Custom Theme"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color" className="text-sm font-medium text-main">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="primary-color"
                    type="color"
                    value={customForm.primaryColor}
                    onChange={(e) => setCustomForm({...customForm, primaryColor: e.target.value})}
                    className="w-16 h-10 p-1 border-default"
                  />
                  <Input
                    value={customForm.primaryColor}
                    onChange={(e) => setCustomForm({...customForm, primaryColor: e.target.value})}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accent-color" className="text-sm font-medium text-main">Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="accent-color"
                    type="color"
                    value={customForm.accentColor}
                    onChange={(e) => setCustomForm({...customForm, accentColor: e.target.value})}
                    className="w-16 h-10 p-1 border-default"
                  />
                  <Input
                    value={customForm.accentColor}
                    onChange={(e) => setCustomForm({...customForm, accentColor: e.target.value})}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bg-light" className="text-sm font-medium text-main">Light Background</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="bg-light"
                    type="color"
                    value={customForm.backgroundLight}
                    onChange={(e) => setCustomForm({...customForm, backgroundLight: e.target.value})}
                    className="w-16 h-10 p-1 border-default"
                  />
                  <Input
                    value={customForm.backgroundLight}
                    onChange={(e) => setCustomForm({...customForm, backgroundLight: e.target.value})}
                    placeholder="#f8fafc"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bg-dark" className="text-sm font-medium text-main">Dark Background</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="bg-dark"
                    type="color"
                    value={customForm.backgroundDark}
                    onChange={(e) => setCustomForm({...customForm, backgroundDark: e.target.value})}
                    className="w-16 h-10 p-1 border-default"
                  />
                  <Input
                    value={customForm.backgroundDark}
                    onChange={(e) => setCustomForm({...customForm, backgroundDark: e.target.value})}
                    placeholder="#0f172a"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Customization */}
            <details className="border border-border rounded-lg p-3">
              <summary className="cursor-pointer text-sm font-medium text-main mb-3">Advanced Customization</summary>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="surface-light" className="text-sm font-medium text-main">Light Surface</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="surface-light"
                      type="color"
                      value={customForm.surfaceColor}
                      onChange={(e) => setCustomForm({...customForm, surfaceColor: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.surfaceColor}
                      onChange={(e) => setCustomForm({...customForm, surfaceColor: e.target.value})}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="surface-dark" className="text-sm font-medium text-main">Dark Surface</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="surface-dark"
                      type="color"
                      value={customForm.surfaceColorDark}
                      onChange={(e) => setCustomForm({...customForm, surfaceColorDark: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.surfaceColorDark}
                      onChange={(e) => setCustomForm({...customForm, surfaceColorDark: e.target.value})}
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="border-light" className="text-sm font-medium text-main">Light Borders</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="border-light"
                      type="color"
                      value={customForm.borderColor}
                      onChange={(e) => setCustomForm({...customForm, borderColor: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.borderColor}
                      onChange={(e) => setCustomForm({...customForm, borderColor: e.target.value})}
                      placeholder="#e2e8f0"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="border-dark" className="text-sm font-medium text-main">Dark Borders</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="border-dark"
                      type="color"
                      value={customForm.borderColorDark}
                      onChange={(e) => setCustomForm({...customForm, borderColorDark: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.borderColorDark}
                      onChange={(e) => setCustomForm({...customForm, borderColorDark: e.target.value})}
                      placeholder="#475569"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="text-primary-light" className="text-sm font-medium text-main">Light Text (Primary)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="text-primary-light"
                      type="color"
                      value={customForm.textPrimaryColor}
                      onChange={(e) => setCustomForm({...customForm, textPrimaryColor: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.textPrimaryColor}
                      onChange={(e) => setCustomForm({...customForm, textPrimaryColor: e.target.value})}
                      placeholder="#0f172a"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="text-primary-dark" className="text-sm font-medium text-main">Dark Text (Primary)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="text-primary-dark"
                      type="color"
                      value={customForm.textPrimaryColorDark}
                      onChange={(e) => setCustomForm({...customForm, textPrimaryColorDark: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.textPrimaryColorDark}
                      onChange={(e) => setCustomForm({...customForm, textPrimaryColorDark: e.target.value})}
                      placeholder="#f8fafc"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="text-secondary-light" className="text-sm font-medium text-main">Light Text (Secondary)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="text-secondary-light"
                      type="color"
                      value={customForm.textSecondaryColor}
                      onChange={(e) => setCustomForm({...customForm, textSecondaryColor: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.textSecondaryColor}
                      onChange={(e) => setCustomForm({...customForm, textSecondaryColor: e.target.value})}
                      placeholder="#475569"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="text-secondary-dark" className="text-sm font-medium text-main">Dark Text (Secondary)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="text-secondary-dark"
                      type="color"
                      value={customForm.textSecondaryColorDark}
                      onChange={(e) => setCustomForm({...customForm, textSecondaryColorDark: e.target.value})}
                      className="w-16 h-10 p-1 border-default"
                    />
                    <Input
                      value={customForm.textSecondaryColorDark}
                      onChange={(e) => setCustomForm({...customForm, textSecondaryColorDark: e.target.value})}
                      placeholder="#cbd5e1"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </details>
            
            {/* Preview */}
            <div>
              <Label className="text-sm font-medium text-main mb-2 block">Preview</Label>
              <div className="flex gap-3">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${customForm.primaryColor}, ${customForm.accentColor})`,
                      border: `2px solid ${customForm.primaryColor}`
                    }}
                  />
                  <p className="text-xs text-muted">Theme</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg mb-2 border-2"
                    style={{
                      backgroundColor: customForm.backgroundLight,
                      borderColor: customForm.primaryColor
                    }}
                  />
                  <p className="text-xs text-muted">Light Mode</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg mb-2 border-2"
                    style={{
                      backgroundColor: customForm.backgroundDark,
                      borderColor: customForm.primaryColor
                    }}
                  />
                  <p className="text-xs text-muted">Dark Mode</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={createCustomTheme}
              className="w-full bg-theme-primary hover:bg-theme-accent text-white"
              disabled={!customForm.name.trim()}
            >
              {editingTheme ? 'Update Theme' : 'Create Theme'}
            </Button>
          </div>
        </div>
      )}

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
