import React, { memo } from 'react';
import { Brain, Sun, Moon, Maximize, Settings, Zap, AlertCircle } from 'lucide-react';
import { EnhancedButton } from '../ui/enhanced-button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const EnhancedHeader = memo(({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  fullScreenMode,
  toggleFullScreen,
  onSettingsSave,
  isOffline,
  incompleteCount = 0,
  queueCount = 0,
  className
}) => {
  const tabs = [
    { id: 'create', label: 'Create', icon: Zap, color: 'bg-green-500' },
    { id: 'view', label: 'View', icon: Brain, color: 'bg-blue-500', badge: queueCount > 0 ? queueCount : null },
    { id: 'ongoing', label: 'Ongoing', icon: AlertCircle, color: 'bg-orange-500', badge: incompleteCount > 0 ? incompleteCount : null },
    { id: 'saved', label: 'Saved', icon: Brain, color: 'bg-purple-500' }
  ];

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient-theme-static">AI Roadmap</h1>
                <p className="text-xs text-muted-foreground">Study Planner</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <div key={tab.id} className="relative">
                  <EnhancedButton
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative transition-all duration-200',
                      isActive && 'shadow-md'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className={cn('absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full', tab.color)} />
                    )}
                  </EnhancedButton>
                  
                  {/* Badge for notifications */}
                  {tab.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Badge>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Offline Indicator */}
            {isOffline && (
              <div className="flex items-center space-x-1 text-orange-500">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Offline</span>
              </div>
            )}

            {/* Theme Toggle */}
            <EnhancedButton
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hover:shadow-glow-theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </EnhancedButton>

            {/* Fullscreen Toggle */}
            <EnhancedButton
              variant="ghost"
              size="icon-sm"
              onClick={toggleFullScreen}
              title={fullScreenMode ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="hover:shadow-glow-theme"
            >
              <Maximize className="h-4 w-4" />
            </EnhancedButton>

            {/* Settings */}
            <EnhancedButton
              variant="ghost"
              size="icon-sm"
              onClick={onSettingsSave}
              title="Settings"
              className="hover:shadow-glow-theme"
            >
              <Settings className="h-4 w-4" />
            </EnhancedButton>
          </div>
        </div>
      </div>
    </header>
  );
});

EnhancedHeader.displayName = 'EnhancedHeader';

export default EnhancedHeader;

