import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
  memo
} from "react";
import useRoadmapOptimized from "../hooks/useRoadmapOptimized";
import { useColorTheme } from "../hooks/useColorTheme";
import Header from "../components/layout/Header";
import ErrorBoundary from "../components/ErrorBoundary";
import { 
  AlertTriangle, 
  WifiOff, 
  Brain,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import "./App.css";

// Memoized loading fallback component
const LoadingFallback = memo(({ message = "Loading component..." }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px] space-y-4" role="status" aria-live="polite">
    <div className="relative">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-ping" />
    </div>
    <p className="text-sm text-muted-foreground font-medium">{message}</p>
    <span className="sr-only">Loading content, please wait...</span>
  </div>
));

// Lazy loaded components with better error handling and memoization
const CreateRoadmapTab = React.lazy(
  () => import("../components/tabs/CreateRoadmapTab").catch(() => ({ 
    default: memo(() => <div>Error loading Create tab</div>)
  })),
);
const ViewRoadmapTab = React.lazy(
  () => import("../components/tabs/ViewRoadmapTab").catch(() => ({ 
    default: memo(() => <div>Error loading View tab</div>)
  })),
);
const SavedPlansTab = React.lazy(
  () => import("../components/tabs/SavedPlansTab").catch(() => ({ 
    default: memo(() => <div>Error loading Saved tab</div>)
  })),
);
const OngoingTab = React.lazy(
  () => import("../components/tabs/OngoingTab").catch(() => ({ 
    default: memo(() => <div>Error loading Ongoing tab</div>)
  })),
);

// AI providers configuration - moved to constants
const AI_PROVIDERS = [
  { keyName: 'gemini-api-key', name: 'Google Gemini' },
  { keyName: 'openai-api-key', name: 'OpenAI' },
  { keyName: 'claude-api-key', name: 'Anthropic Claude' },
  { keyName: 'grok-api-key', name: 'Grok' },
  { keyName: 'local-api-endpoint', name: 'Ollama' },
  { keyName: 'custom-api-key', name: 'Custom Provider' }
];

// Memoized theme utilities
const themeUtils = {
  applyTheme: (theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0a" : "#ffffff",
      );
    }
  },
  
  getStoredTheme: () => localStorage.getItem("theme") || "dark",
  setStoredTheme: (theme) => localStorage.setItem("theme", theme)
};

const OptimizedApp = memo(() => {
  // Optimized state management
  const [appState, setAppState] = useState(() => ({
    theme: themeUtils.getStoredTheme(),
    activeTab: localStorage.getItem("activeTab") || "create",
    fullScreenMode: false,
    apiKeyStatus: "checking",
    isOffline: !navigator.onLine,
    isTransitioning: false,
    appError: null
  }));

  // Dialog state
  const [dialogState, setDialogState] = useState({
    isDeleteDialogOpen: false,
    roadmapToDelete: null
  });

  // Initialize color theme management
  const isDarkMode = appState.theme === 'dark';
  const _colorTheme = useColorTheme(isDarkMode);
  
  // Apply theme immediately
  useEffect(() => {
    themeUtils.applyTheme(appState.theme);
  }, [appState.theme]);

  // Optimized state updater
  const updateAppState = useCallback((updates) => {
    setAppState(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoized provider check
  const checkProvidersConfigured = useMemo(() => {
    return AI_PROVIDERS.some(provider => {
      const key = localStorage.getItem(provider.keyName);
      return key && key.trim() !== '';
    });
  }, []);

  // Optimized API key checking
  useEffect(() => {
    const timer = setTimeout(() => {
      updateAppState({ 
        apiKeyStatus: checkProvidersConfigured ? "present" : "missing" 
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [checkProvidersConfigured, updateAppState]);

  // Optimized event listeners with cleanup
  useEffect(() => {
    const cleanupFunctions = [];
    
    // Storage changes
    const handleStorageChange = (e) => {
      if (AI_PROVIDERS.some(provider => provider.keyName === e.key)) {
        const isConfigured = AI_PROVIDERS.some(provider => {
          const key = localStorage.getItem(provider.keyName);
          return key && key.trim() !== '';
        });
        
        updateAppState({ apiKeyStatus: isConfigured ? "present" : "missing" });
        
        if (isConfigured) {
          toast.success('AI provider configured! App ready to use.');
        }
      }
    };
    
    // Network status
    const handleOnline = () => {
      updateAppState({ isOffline: false });
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      updateAppState({ isOffline: true });
      toast.error('No internet connection');
    };

    // Custom provider updates
    const handleCustomStorageChange = () => {
      const isConfigured = AI_PROVIDERS.some(provider => {
        const key = localStorage.getItem(provider.keyName);
        return key && key.trim() !== '';
      });
      
      updateAppState({ apiKeyStatus: isConfigured ? "present" : "missing" });
      
      if (isConfigured) {
        toast.success('AI provider configured! App ready to use.');
      }
    };

    // Add listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('providersUpdated', handleCustomStorageChange);
    
    // Store cleanup functions
    cleanupFunctions.push(
      () => window.removeEventListener('storage', handleStorageChange),
      () => window.removeEventListener('online', handleOnline),
      () => window.removeEventListener('offline', handleOffline),
      () => window.removeEventListener('providersUpdated', handleCustomStorageChange)
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [updateAppState]);

  // Persist active tab with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('activeTab', appState.activeTab);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [appState.activeTab]);

  // Optimized settings save handler
  const handleSettingsSave = useCallback(() => {
    const isConfigured = AI_PROVIDERS.some(provider => {
      const key = localStorage.getItem(provider.keyName);
      return key && key.trim() !== '';
    });
    
    updateAppState({ apiKeyStatus: isConfigured ? "present" : "missing" });
    
    if (isConfigured) {
      toast.success('Settings saved successfully');
      window.dispatchEvent(new CustomEvent('providersUpdated'));
    }
  }, [updateAppState]);

  // Optimized theme toggle
  const toggleTheme = useCallback(() => {
    updateAppState(prev => {
      const newTheme = prev.theme === "light" ? "dark" : "light";
      themeUtils.setStoredTheme(newTheme);
      
      // Apply theme with transition
      const root = document.documentElement;
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      
      setTimeout(() => {
        root.style.transition = '';
      }, 300);
      
      return { 
        ...prev, 
        theme: newTheme, 
        isTransitioning: true 
      };
    });
    
    // Reset transition state
    setTimeout(() => {
      updateAppState(prev => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, [updateAppState]);

  // Optimized fullscreen toggle
  const toggleFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        updateAppState({ fullScreenMode: true });
        toast.success('Entered fullscreen mode');
      } else {
        await document.exitFullscreen();
        updateAppState({ fullScreenMode: false });
        toast.success('Exited fullscreen mode');
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error(`Fullscreen ${!document.fullscreenElement ? 'entry' : 'exit'} failed`);
    }
  }, [updateAppState]);

  // Use the optimized roadmap hook
  const roadmapHook = useRoadmapOptimized({ 
    setActiveTab: useCallback((tab) => updateAppState({ activeTab: tab }), [updateAppState])
  });

  // Memoized delete handler
  const _handleDeleteConfirm = useCallback(async () => {
    if (!dialogState.roadmapToDelete) return;
    
    try {
      await roadmapHook.deleteRoadmap(dialogState.roadmapToDelete);
      setDialogState({ isDeleteDialogOpen: false, roadmapToDelete: null });
    } catch (error) {
      console.error("Error in handleDeleteConfirm:", error);
    }
  }, [dialogState.roadmapToDelete, roadmapHook]);

  // Memoized tab content renderer
  const renderTabContent = useMemo(() => {
    const commonProps = {
      ...roadmapHook,
      theme: appState.theme,
      toggleTheme,
      toggleFullScreen,
      handleSettingsSave,
      onDeleteRoadmap: (roadmap) => setDialogState({
        isDeleteDialogOpen: true,
        roadmapToDelete: roadmap
      })
    };

    switch (appState.activeTab) {
      case "create":
        return (
          <Suspense fallback={<LoadingFallback message="Loading Create tab..." />}>
            <CreateRoadmapTab {...commonProps} />
          </Suspense>
        );
      case "view":
        return (
          <Suspense fallback={<LoadingFallback message="Loading View tab..." />}>
            <ViewRoadmapTab {...commonProps} />
          </Suspense>
        );
      case "ongoing":
        return (
          <Suspense fallback={<LoadingFallback message="Loading Ongoing tab..." />}>
            <OngoingTab {...commonProps} />
          </Suspense>
        );
      case "saved":
        return (
          <Suspense fallback={<LoadingFallback message="Loading Saved tab..." />}>
            <SavedPlansTab {...commonProps} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingFallback message="Loading Create tab..." />}>
            <CreateRoadmapTab {...commonProps} />
          </Suspense>
        );
    }
  }, [appState.activeTab, appState.theme, roadmapHook, toggleTheme, toggleFullScreen, handleSettingsSave]);

  // Show API key configuration screen if needed
  if (appState.apiKeyStatus === "missing") {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Header
          activeTab={appState.activeTab}
          setActiveTab={(tab) => updateAppState({ activeTab: tab })}
          theme={appState.theme}
          toggleTheme={toggleTheme}
          fullScreenMode={appState.fullScreenMode}
          toggleFullScreen={toggleFullScreen}
          onSettingsSave={handleSettingsSave}
          isOffline={appState.isOffline}
          incompleteCount={roadmapHook.incompleteRoadmaps?.length || 0}
          queueCount={roadmapHook.generationQueue?.length || 0}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <Brain className="w-16 h-16 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Welcome to AI Study Planner</h1>
              <p className="text-lg text-muted-foreground">
                Generate personalized study roadmaps with AI assistance.
              </p>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">AI Provider Required</span>
              </div>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-2">
                To get started, please configure at least one AI provider in the settings.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Click the gear icon ⚙ in the top-right corner to configure your AI providers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (appState.apiKeyStatus === "checking") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <LoadingFallback message="Initializing AI Study Planner..." />
      </div>
    );
  }

  // Show offline warning
  if (appState.isOffline) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header
          activeTab={appState.activeTab}
          setActiveTab={(tab) => updateAppState({ activeTab: tab })}
          theme={appState.theme}
          toggleTheme={toggleTheme}
          fullScreenMode={appState.fullScreenMode}
          toggleFullScreen={toggleFullScreen}
          onSettingsSave={handleSettingsSave}
          isOffline={appState.isOffline}
          incompleteCount={roadmapHook.incompleteRoadmaps?.length || 0}
          queueCount={roadmapHook.generationQueue?.length || 0}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <WifiOff className="w-16 h-16 text-red-500" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">No Internet Connection</h1>
              <p className="text-lg text-muted-foreground">
                Please check your internet connection and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-background text-foreground transition-colors duration-300 ${
        appState.isTransitioning ? 'transition-all' : ''
      }`}>
        <Header
          activeTab={appState.activeTab}
          setActiveTab={(tab) => updateAppState({ activeTab: tab })}
          theme={appState.theme}
          toggleTheme={toggleTheme}
          fullScreenMode={appState.fullScreenMode}
          toggleFullScreen={toggleFullScreen}
          onSettingsSave={handleSettingsSave}
          isOffline={appState.isOffline}
          incompleteCount={roadmapHook.incompleteRoadmaps?.length || 0}
          queueCount={roadmapHook.generationQueue?.length || 0}
        />
        
        <main className="container mx-auto px-4 py-6">
          {renderTabContent}
        </main>
        
        {/* Delete confirmation dialog would go here */}
      </div>
    </ErrorBoundary>
  );
});

OptimizedApp.displayName = 'OptimizedApp';

export default OptimizedApp;

