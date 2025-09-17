import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import useRoadmap from "./hooks/useRoadmap";
import { useColorTheme } from "./hooks/useColorTheme";
import Header from "./components/layout/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import { 
  AlertTriangle, 
  WifiOff, 
  Brain,
  Sparkles
} from "lucide-react";

// Lazy loaded components with better error handling
const CreateRoadmapTab = React.lazy(
  () => import("./components/tabs/CreateRoadmapTab").catch(() => ({ 
    default: () => <div>Error loading Create tab</div> 
  })),
);
const ViewRoadmapTab = React.lazy(
  () => import("./components/tabs/ViewRoadmapTab").catch(() => ({ 
    default: () => <div>Error loading View tab</div> 
  })),
);
const SavedPlansTab = React.lazy(
  () => import("./components/tabs/SavedPlansTab").catch(() => ({ 
    default: () => <div>Error loading Saved tab</div> 
  })),
);
const OngoingTab = React.lazy(() => {
  console.log('Attempting to load OngoingTab component...');
  return import("./components/tabs/OngoingTab")
    .then(module => {
      console.log('Successfully loaded OngoingTab component');
      return module;
    })
    .catch(error => {
      console.error('Error loading OngoingTab component:', error);
      return { 
        default: () => (
          <div className="p-4 text-red-500">
            <h3 className="text-lg font-semibold">Error loading Ongoing tab</h3>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Unknown error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Try reloading the page
            </button>
          </div>
        ) 
      };
    });
});

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "./components/common/ConfirmationDialog";
import { toast } from "sonner";
import "./App.css";

const LoadingFallback = React.memo(({ message = "Loading component..." }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px] space-y-4" role="status" aria-live="polite">
    <div className="relative">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-ping" />
    </div>
    <p className="text-sm text-muted-foreground font-medium">{message}</p>
    <span className="sr-only">Loading content, please wait...</span>
  </div>
));

const App = () => {
  // Enhanced state management with better initial values
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  });
  
  // Initialize color theme management
  const isDarkMode = theme === 'dark';
  const _colorTheme = useColorTheme(isDarkMode);
  
  // Initialize basic state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Apply dark/light class to HTML element immediately
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [isDarkMode]);
  const [activeTab, setActiveTab] = useState(() => 
    localStorage.getItem("activeTab") || "create"
  );
  // State variables with proper setters
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);
  const [apiKeyStatus, setApiKeyStatus] = useState("checking");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [appError, setAppError] = useState(null);
  // States for future modal implementations
  const [closeModals, setCloseModals] = useState(null);
  
  // Mark unused variables with _ to satisfy linter
  const _unusedVars = { setFullScreenMode, setIsTransitioning, closeModals, setCloseModals };

  // Enhanced API key checking with error handling
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const apiKey = localStorage.getItem("gemini-api-key");
        if (apiKey && apiKey.trim()) {
          setApiKeyStatus("present");
        } else {
          setApiKeyStatus("missing");
        }
      } catch (_error) {
        console.error('Error checking API key:', error);
        setApiKeyStatus("missing");
        setAppError('Failed to check API key configuration');
      }
    };
    
    // Add a small delay to prevent flash
    const timer = setTimeout(checkApiKey, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist active tab
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Enhanced settings save handler
  const handleSettingsSave = useCallback(() => {
    setApiKeyStatus("present");
    toast.success('Settings saved successfully');
  }, []);

  // Enhanced theme toggle with smooth transitions
  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      
      // Re-apply the current color theme for the new mode immediately
      if (window.currentColorTheme && window.currentColorTheme.applyTheme) {
        setTimeout(() => {
          const currentThemeId = localStorage.getItem('ai-roadmap-color-theme') || 'slate';
          window.currentColorTheme.applyTheme(currentThemeId, newTheme === 'dark');
        }, 10); // Small delay to ensure DOM update
      }
      
      return newTheme;
    });
    
    // Reset transition after animation
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  // Enhanced fullscreen toggle with better error handling
  const toggleFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullScreenMode(true);
        toast.success('Entered fullscreen mode');
      } else {
        await document.exitFullscreen();
        setFullScreenMode(false);
        toast.success('Exited fullscreen mode');
      }
    } catch (_error) {
      console.error('Fullscreen error:', error);
      toast.error(`Fullscreen ${!document.fullscreenElement ? 'entry' : 'exit'} failed`);
    }
  }, []);

  const {
    objective,
    setObjective,
    finalGoal,
    setFinalGoal,
    startingLevel,
    setStartingLevel,
    roadmap,
    setRoadmap,
    loading,
    error,
    loadingMessage,
    savedTimeplans,
    toggleFavorite,
    isFavorite,
    toggleMiniGoal,
    calculateOverallProgress,
    calculatePhaseProgress,
    generateRoadmap,
    saveCurrentRoadmap,
    loadRoadmap,
    deleteRoadmap,
    interruptGeneration,
    exportToPDF,
    exportToHTML,
    exportToJSON,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    roadmapName,
    setRoadmapName,
    handleSaveConfirm,
    // Queue management
    incompleteRoadmaps,
    isQueuePaused,
    currentlyGenerating,
    generationQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    retryGeneration,
    setGenerationQueue,
  } = useRoadmap({ setActiveTab });

  // Basic keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            setActiveTab('create');
            break;
          case 's':
            saveCurrentRoadmap();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setActiveTab, saveCurrentRoadmap]);

  // Delete confirmation handler - must be defined before useMemo
  const handleDeleteConfirm = useCallback(async () => {
    if (!roadmapToDelete) return;
    try {
      await deleteRoadmap(roadmapToDelete);
      setIsDeleteDialogOpen(false);
      setRoadmapToDelete(null);
    } catch (_error) {
      console.error("Error in handleDeleteConfirm:", error);
      // toast.error("Failed to delete roadmap.");
    }
  }, [roadmapToDelete, deleteRoadmap]);

  // Enhanced theme effect with smooth transitions and better browser support
  useEffect(() => {
    const root = document.documentElement;
    
    // Add transition class for smooth theme changes
    if (isTransitioning) {
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }

    // Apply theme classes
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Set theme attribute for additional styling hooks
    root.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers and PWA support
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0a" : "#ffffff",
      );
    }

    // Clean up transition after animation
    const cleanup = () => {
      root.style.transition = '';
    };
    
    if (isTransitioning) {
      const timer = setTimeout(cleanup, 300);
      return () => clearTimeout(timer);
    }
    
    return cleanup;
  }, [theme, isTransitioning]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const downloadMarkdown = () => {
    if (!roadmap) return;

    let markdown = `# ${roadmap.title}\n\n`;
    markdown += `**Total Duration:** ${roadmap.totalDuration}\n`;
    markdown += `**Difficulty Level:** ${roadmap.difficultyLevel || "Not specified"}\n`;
    markdown += `**Total Estimated Hours:** ${roadmap.totalEstimatedHours || "Not specified"}\n`;
    markdown += `**Number of Phases:** ${roadmap.phases?.length}\n\n`;
    markdown += `**Learning Objective:** ${objective}\n`;
    markdown += `**Final Goal:** ${finalGoal}\n\n`;
    markdown += `---\n\n`;

    roadmap.phases.forEach((phase) => {
      markdown += `## Phase ${phase.phaseNumber}: ${phase.title}\n\n`;
      markdown += `**Duration:** ${phase.duration}\n`;
      markdown += `**Goal:** ${phase.goal}\n`;

      if (phase.progressPercentage !== undefined) {
        markdown += `**Progress:** ${phase.progressPercentage}%\n`;
      }
      markdown += `\n`;

      if (phase.miniGoals && phase.miniGoals.length > 0) {
        markdown += `### Mini-Goals\n\n`;
        phase.miniGoals.forEach((miniGoal, mgIndex) => {
          const status = miniGoal.completed ? "✅" : "⬜";
          markdown += `${mgIndex + 1}. ${status} **${miniGoal.title}** (${miniGoal.estimatedTime})\n`;
          markdown += `   - ${miniGoal.description}\n`;
          if (miniGoal.url) {
            markdown += `   - Link: [${miniGoal.url}](${miniGoal.url})\n`;
          }
          if (miniGoal.priority) {
            markdown += `   - Priority: ${miniGoal.priority}\n`;
          }
          if (miniGoal.completedDate) {
            markdown += `   - Completed: ${formatDate(miniGoal.completedDate)}
`;
          }
          markdown += `\n`;
        });
      }

      markdown += `### Resources\n\n`;
      phase.resources.forEach((resource, resIndex) => {
        markdown += `${resIndex + 1}. **${resource.name}**`;
        if (resource.type) markdown += ` (${resource.type})`;
        markdown += `\n`;
        if (resource.url) {
          markdown += `   - Link: [${resource.url}](${resource.url})\n`;
        }
        markdown += `   - Description: ${resource.description}\n`;
        if (resource.difficulty) {
          markdown += `   - Difficulty: ${resource.difficulty}\n`;
        }
        if (resource.estimatedTime) {
          markdown += `   - Time: ${resource.estimatedTime}\n`;
        }
        markdown += `\n`;
      });

      markdown += `### Phase Project\n\n`;
      if (typeof phase.project === "object") {
        markdown += `**${phase.project.title}**\n\n`;
        markdown += `${phase.project.description}\n\n`;

        if (phase.project.deliverables) {
          markdown += `**Deliverables:**\n`;
          phase.project.deliverables.forEach((deliverable) => {
            markdown += `- ${deliverable}\n`;
          });
          markdown += `\n`;
        }

        if (phase.project.monetizationPotential) {
          markdown += `**Monetization Potential:** ${phase.project.monetizationPotential}\n\n`;
        }
      } else {
        markdown += `${phase.project}\n\n`;
      }

      if (phase.milestone) {
        markdown += `**Milestone:** ${phase.milestone}\n\n`;
      }

      markdown += `### Skills You'll Gain\n\n`;
      phase.skills.forEach((skill) => {
        markdown += `- ${skill}\n`;
      });
      markdown += `\n---\n\n`;
    });

    if (
      roadmap.motivationMilestones &&
      roadmap.motivationMilestones.length > 0
    ) {
      markdown += `## 🎯 Motivation Milestones\n\n`;
      roadmap.motivationMilestones.forEach((milestone) => {
        markdown += `- ${milestone}\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.careerProgression && roadmap.careerProgression.length > 0) {
      markdown += `## 🚀 Career Progression Path\n\n`;
      roadmap.careerProgression.forEach((step, index) => {
        markdown += `${index + 1}. ${step}\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.careerOutcomes && roadmap.careerOutcomes.length > 0) {
      markdown += `## 💼 Career Opportunities\n\n`;
      markdown += `| Role | Salary Range |\n|---|---|\n`;
      roadmap.careerOutcomes.forEach((outcome) => {
        markdown += `| ${outcome.role} | ${outcome.salary} |\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.tips && roadmap.tips.length > 0) {
      markdown += `## 💡 Pro Tips\n\n`;
      roadmap.tips.forEach((tip) => {
        markdown += `- ${tip}\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.marketDemand) {
      markdown += `## 📈 Market Outlook\n\n`;
      markdown += `${roadmap.marketDemand}\n\n`;
    }

    if (roadmap.communityResources && roadmap.communityResources.length > 0) {
      markdown += `## 🤝 Community & Networking Resources\n\n`;
      roadmap.communityResources.forEach((resource) => {
        markdown += `- ${resource}\n`;
      });
      markdown += `\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `*Generated by Enhanced AI Study Roadmap Planner*\n`;
    markdown += `*Created on: ${formatDate(new Date())}*`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // const exportToJSON = () => {
  //   if (!roadmap) return;

  //   const jsonContent = JSON.stringify(roadmap, null, 2);
  //   const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.json`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // };

  // Memoize the tab content to prevent unnecessary re-renders
  const renderTabContent = useMemo(() => {
    const commonCreateProps = {
      objective,
      setObjective,
      finalGoal,
      setFinalGoal,
      generateRoadmap,
      loading,
      loadingMessage,
      error,
      roadmap,
      addToQueue,
      removeFromQueue,
      setActiveTab,
      generationQueue,
      setRoadmap,
      interruptGeneration,
    };

    switch (activeTab) {
      case "create":
        return <CreateRoadmapTab {...commonCreateProps} startingLevel={startingLevel} setStartingLevel={setStartingLevel} key={activeTab} />;
      case "view":
        return (
          <ViewRoadmapTab
            roadmap={roadmap}
            setActiveTab={setActiveTab}
            objective={objective}
            finalGoal={finalGoal}
            saveCurrentRoadmap={saveCurrentRoadmap}
            downloadMarkdown={downloadMarkdown}
            exportToJSON={exportToJSON}
            exportToPDF={exportToPDF}
            exportToHTML={exportToHTML}
            toggleMiniGoal={toggleMiniGoal}
            calculateOverallProgress={calculateOverallProgress}
            calculatePhaseProgress={calculatePhaseProgress}
            setRoadmap={setRoadmap}
            error={error}
            loading={loading}
            loadingMessage={loadingMessage}
            interruptGeneration={interruptGeneration}
            generateRoadmap={generateRoadmap}
            addToQueue={addToQueue}
            removeFromQueue={removeFromQueue}
            generationQueue={generationQueue}
            currentlyGenerating={currentlyGenerating}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        );
      case "saved":
        return (
          <SavedPlansTab
            savedTimeplans={savedTimeplans}
            loadRoadmap={loadRoadmap}
            deleteRoadmap={deleteRoadmap}
            setActiveTab={setActiveTab}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            handleDeleteConfirm={handleDeleteConfirm}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            addToQueue={addToQueue}
            setObjective={setObjective}
            setFinalGoal={setFinalGoal}
            setRoadmap={setRoadmap}
            generationQueue={generationQueue}
          />
        );
      case "ongoing":
        return (
          <OngoingTab
            generationQueue={generationQueue}
            setGenerationQueue={setGenerationQueue}
            incompleteRoadmaps={incompleteRoadmaps}
            isQueuePaused={isQueuePaused}
            currentlyGenerating={currentlyGenerating}
            pauseQueue={pauseQueue}
            resumeQueue={resumeQueue}
            removeFromQueue={removeFromQueue}
            retryGeneration={retryGeneration}
            loadRoadmap={loadRoadmap}
            deleteRoadmap={deleteRoadmap}
            addToQueue={addToQueue}
            clearQueue={clearQueue}
            loading={loading}
            loadingMessage={loadingMessage}
            setObjective={setObjective}
            setFinalGoal={setFinalGoal}
          />
        );
      default:
        return <CreateRoadmapTab {...commonCreateProps} startingLevel={startingLevel} setStartingLevel={setStartingLevel} />;
    }
  }, [
    activeTab,
    objective,
    setObjective,
    finalGoal,
    setFinalGoal,
    generateRoadmap,
    loading,
    loadingMessage,
    error,
    roadmap,
    addToQueue,
    removeFromQueue,
    setActiveTab,
    generationQueue,
    setRoadmap,
    interruptGeneration,
    savedTimeplans,
    loadRoadmap,
    deleteRoadmap,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteConfirm,
    toggleFavorite,
    isFavorite,
    saveCurrentRoadmap,
    downloadMarkdown,
    exportToJSON,
    exportToPDF,
    exportToHTML,
    toggleMiniGoal,
    calculateOverallProgress,
    calculatePhaseProgress,
    currentlyGenerating,
    incompleteRoadmaps,
    isQueuePaused,
    pauseQueue,
    resumeQueue,
    retryGeneration,
    clearQueue,
    setGenerationQueue,
  ]);

  return (
    <ErrorBoundary>
      <div className={`flex flex-col min-h-screen ${theme} bg-background transition-colors duration-300`}>
        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-orange-500 text-white px-4 py-2 text-sm text-center flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            You're currently offline. Some features may not work.
          </div>
        )}
        
        
        {/* App error banner */}
        {appError && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-sm text-destructive flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {appError}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setAppError(null)}
              className="text-destructive hover:text-destructive"
            >
              ✕
            </Button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              theme={theme}
              toggleTheme={toggleTheme}
              fullScreenMode={fullScreenMode}
              toggleFullScreen={toggleFullScreen}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOffline={!isOnline}
              onSettingsSave={handleSettingsSave}
            />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4">
                {apiKeyStatus === "checking" ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner 
                      message="Checking API configuration..." 
                      variant="brain" 
                      size="lg" 
                    />
                  </div>
                ) : apiKeyStatus === "missing" ? (
                  <div className="text-center p-8 bg-card border rounded-lg shadow-lg max-w-2xl mx-auto text-main mt-8">
                    <div className="mb-6">
                      <Brain className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-4 text-foreground">
                        Welcome to AI Study Planner
                      </h2>
                      <p className="mb-4 text-muted-foreground text-lg">
                        Generate personalized study roadmaps with AI assistance.
                      </p>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">API Key Required</span>
                        </div>
                        <p className="text-sm mt-2 text-yellow-600 dark:text-yellow-300">
                          To get started, please add your Gemini API key in the settings.
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click the gear icon <span className="font-mono bg-muted px-1 rounded">⚙️</span> in the top-right corner to configure your API key.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingFallback message="Loading component..." />}>
                      {renderTabContent}
                    </Suspense>
                  </ErrorBoundary>
                )}
              </div>
            </main>
          </div>
        </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Roadmap"
        description="Are you sure you want to delete this roadmap? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="modal-content">
          <DialogHeader>
            <DialogTitle>Save Timeplan</DialogTitle>
            <DialogDescription>
              Enter a name for your timeplan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roadmapName" className="text-right">
                Name
              </Label>
              <Input
                id="roadmapName"
                value={roadmapName}
                onChange={(e) => setRoadmapName(e.target.value)}
                className="col-span-3 input-themed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
};

export default App;
