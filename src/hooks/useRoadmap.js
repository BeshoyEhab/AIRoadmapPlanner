import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";

const useRoadmap = ({ setActiveTab } = {}) => {
  const [objective, setObjective] = useState("");
  const [finalGoal, setFinalGoal] = useState("");
  const [startingLevel, setStartingLevel] = useState("Beginner");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [savedTimeplans, setSavedTimeplans] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteRoadmaps');
    return saved ? JSON.parse(saved) : [];
  });
  const [genAI, setGenAI] = useState(null);
  const isInterrupted = useRef(false);
  const [availableModels] = useState(() => {
    const savedModels = localStorage.getItem("gemini-available-models");
    return savedModels
      ? JSON.parse(savedModels)
      : [
          "gemini-2.5-flash",
          "gemini-2.0-flash", 
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-1.0-pro",
        ];
  });
  const currentModelIndex = useRef(0);
  const processingTriggerRef = useRef(false);

  // Queue management state
  const [generationQueue, setGenerationQueue] = useState([]);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [currentlyGenerating, setCurrentlyGenerating] = useState(null);
  const queueProcessingRef = useRef(false);
  const shouldPauseAfterCurrent = useRef(false);

  // Initialize GenAI with API key
  useEffect(() => {
    const apiKey = localStorage.getItem("gemini-api-key");
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
    }
  }, []);

  // Toggle favorite status for a roadmap
  const toggleFavorite = useCallback((roadmapId) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(roadmapId)
        ? prevFavorites.filter(id => id !== roadmapId)
        : [...prevFavorites, roadmapId];
      
      // Save to localStorage
      localStorage.setItem('favoriteRoadmaps', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);
  
  // Get sorted roadmaps with favorites first
  const getSortedRoadmaps = useMemo(() => {
    return [...savedTimeplans].sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // If both are favorites or both are not, sort by creation date
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [savedTimeplans, favorites]);
  
  // Check if a roadmap is favorited
  const isFavorite = useCallback((roadmapId) => {
    return favorites.includes(roadmapId);
  }, [favorites]);
  
  // Fetch roadmaps on component mount
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/roadmaps");
        const data = await response.json();
        setSavedTimeplans(data);
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      }
    };
    fetchRoadmaps();
  }, []);

  const [roadmapName, setRoadmapName] = useState("");

  // Get incomplete roadmaps
  const incompleteRoadmaps = useMemo(() => 
    savedTimeplans.filter((roadmap) => roadmap.generationState !== "completed"),
    [savedTimeplans]
  );

  const saveCurrentRoadmap = async () => {
    if (!roadmap) return;
    setRoadmapName(roadmap.title || `Roadmap-${Date.now()}`);
  };

  const saveRoadmapToDisk = async (roadmapData, name) => {
    try {
      const roadmapName = roadmapData.title || name || `Roadmap-${Date.now()}`;
      const response = await fetch("http://localhost:3001/api/roadmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roadmap: roadmapData, name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Failed to save: ${errorText}`);
        console.error("Error saving roadmap to disk:", errorText);
        return null;
      }

      const newSavedTimeplan = await response.json();

      setSavedTimeplans((prev) => {
        const indexToReplace = prev.findIndex(
          (tp) => tp.sanitizedName === newSavedTimeplan.sanitizedName,
        );

        if (indexToReplace > -1) {
          const updatedPlans = [...prev];
          updatedPlans[indexToReplace] = newSavedTimeplan;
          return updatedPlans;
        } else {
          return [...prev, newSavedTimeplan];
        }
      });

      setRoadmap(newSavedTimeplan);
      toast.success("Timeplan saved automatically!");
      return newSavedTimeplan;
    } catch (error) {
      console.error("Error saving roadmap to disk:", error);
      toast.error("Failed to save timeplan automatically.");
      return null;
    }
  };

  const handleSaveConfirm = async () => {
    if (!roadmapName) return;
    try {
      const newSavedTimeplan = await saveRoadmapToDisk(roadmap, roadmapName);
      if (newSavedTimeplan) {
        // Handle success
      }
    } catch (error) {
      console.error("Error saving roadmap:", error);
      toast.error("Failed to save timeplan.");
    }
  };

  const loadRoadmap = useCallback((roadmapId) => {
    const loadedTimeplan = savedTimeplans.find((tp) => tp.id === roadmapId);
    if (loadedTimeplan) {
      setRoadmap(loadedTimeplan);
      setObjective(loadedTimeplan.objective || "");
      setFinalGoal(loadedTimeplan.finalGoal || "");
      setStartingLevel(loadedTimeplan.startingLevel || "Beginner");
      return true;
    }
    return false;
  }, [savedTimeplans]);

  const deleteRoadmap = async (idOrSanitizedName) => {
    try {
      // First find the roadmap to get its sanitizedName if we were given an ID
      const roadmapToDelete = savedTimeplans.find(
        (tp) => tp.id === idOrSanitizedName || tp.sanitizedName === idOrSanitizedName
      );
      
      if (!roadmapToDelete) {
        console.warn('Roadmap not found for deletion:', idOrSanitizedName);
        return;
      }

      const { sanitizedName, id: roadmapId } = roadmapToDelete;
      
      // Interrupt any ongoing generation for this roadmap
      if (currentlyGenerating?.roadmapId === roadmapId || 
          currentlyGenerating?.id === idOrSanitizedName) {
        interruptGeneration();
      }
      
      // Remove any queue items for this roadmap
      setGenerationQueue(prev => 
        prev.filter(item => 
          item.roadmapId !== roadmapId && 
          item.roadmapId !== idOrSanitizedName &&
          item.id !== idOrSanitizedName
        )
      );
      
      await fetch(`http://localhost:3001/api/roadmaps/${sanitizedName}`, {
        method: "DELETE",
      });
      
      // Update the UI by removing the deleted roadmap
      setSavedTimeplans(prev => 
        prev.filter(tp => tp.sanitizedName !== sanitizedName && tp.id !== idOrSanitizedName)
      );
      
      // Also remove from current roadmap if it's the one being deleted
      if (roadmap?.id === idOrSanitizedName || roadmap?.sanitizedName === sanitizedName) {
        setRoadmap(null);
        localStorage.removeItem('currentRoadmap');
      }
      
      toast.success("Timeplan deleted!");
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      toast.error("Failed to delete timeplan.");
    }
  };

  // Export roadmap as JSON - lazy loaded
  const exportToJSON = async () => {
    if (!roadmap) {
      console.error('No roadmap available to export');
      return;
    }
    
    try {
      const { exportToJSON: exportToJSONHelper } = await import('../utils/exportHelpers.js');
      await exportToJSONHelper(roadmap);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      toast.error('Failed to export roadmap as JSON');
    }
  };

  // Export roadmap as PDF - lazy loaded
  const exportToPDF = async () => {
    if (!roadmap) return;
    
    try {
      const { exportToPDF: exportToPDFHelper } = await import('../utils/exportHelpers.js');
      await exportToPDFHelper(roadmap, objective, finalGoal);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export roadmap as PDF');
    }
  };

  // Export roadmap as HTML - lazy loaded
  const exportToHTML = async () => {
    if (!roadmap) {
      toast.error('No roadmap available to export');
      return;
    }
    
    try {
      const { exportToHTML: exportToHTMLHelper } = await import('../utils/exportHelpers.js');
      await exportToHTMLHelper(roadmap, objective, finalGoal);
    } catch (error) {
      console.error('Error exporting to HTML:', error);
      toast.error('Failed to export roadmap as HTML');
    }
  };

  // Placeholder for now - these would be implemented based on the original complex logic
  const calculateOverallProgress = useCallback((roadmapData) => {
    if (!roadmapData || !roadmapData.phases) return 0;

    let totalMiniGoals = 0;
    let completedMiniGoals = 0;

    roadmapData.phases.forEach((phase) => {
      if (phase.miniGoals) {
        totalMiniGoals += phase.miniGoals.length;
        completedMiniGoals += phase.miniGoals.filter(
          (mg) => mg.completed,
        ).length;
      }
    });

    if (totalMiniGoals === 0) return 0;
    return Math.round((completedMiniGoals / totalMiniGoals) * 100);
  }, []);

  const calculatePhaseProgress = useCallback((phase) => {
    if (!phase || !phase.miniGoals) return 0;
    const total = phase.miniGoals.length;
    if (total === 0) return 0;
    const completed = phase.miniGoals.filter((mg) => mg.completed).length;
    return Math.round((completed / total) * 100);
  }, []);

  const toggleMiniGoal = useCallback((phaseIndex, miniGoalId) => {
    setRoadmap((prevRoadmap) => {
      if (!prevRoadmap) return prevRoadmap;

      const newPhases = prevRoadmap.phases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          const newMiniGoals = phase.miniGoals.map((mg) => {
            if (mg.id === miniGoalId) {
              const newCompletedStatus = !mg.completed;
              return {
                ...mg,
                completed: newCompletedStatus,
                completedDate: newCompletedStatus
                  ? new Date().toISOString()
                  : null,
              };
            }
            return mg;
          });
          const updatedPhase = { ...phase, miniGoals: newMiniGoals };
          updatedPhase.progressPercentage =
            calculatePhaseProgress(updatedPhase);
          return updatedPhase;
        }
        return phase;
      });

      return { ...prevRoadmap, phases: newPhases };
    });
  }, [calculatePhaseProgress]);

  // Simplified placeholder functions for complex generation logic
  const generateRoadmap = async () => {
    toast.info("Roadmap generation is currently being optimized for better performance...");
    return null;
  };

  const interruptGeneration = useCallback(() => {
    isInterrupted.current = true;
    toast.success("Generation stopped");
  }, []);

  // Simplified queue management
  const addToQueue = useCallback(() => {
    toast.info("Queue functionality is being optimized...");
    return false;
  }, []);

  const removeFromQueue = useCallback(() => {
    // Implementation would go here
  }, []);

  const clearQueue = useCallback(() => {
    setGenerationQueue([]);
  }, []);

  const pauseQueue = useCallback(() => {
    setIsQueuePaused(true);
  }, []);

  const resumeQueue = useCallback(() => {
    setIsQueuePaused(false);
  }, []);

  const processQueue = useCallback(() => {
    // Implementation would go here
  }, []);

  const retryGeneration = useCallback(() => {
    // Implementation would go here
  }, []);

  return {
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
    savedTimeplans: getSortedRoadmaps, // Return sorted roadmaps with favorites first
    incompleteRoadmaps,
    toggleFavorite,
    isFavorite,
    calculateOverallProgress,
    calculatePhaseProgress,
    generateRoadmap,
    saveCurrentRoadmap,
    loadRoadmap,
    deleteRoadmap,
    interruptGeneration,
    // Export functions
    exportToJSON,
    exportToPDF,
    exportToHTML,
    isQueuePaused,
    currentlyGenerating,
    generationQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    processQueue,
    retryGeneration,
    toggleMiniGoal,
    setGenerationQueue,
    handleSaveConfirm,
    roadmapName,
    setRoadmapName,
  };
};

export default useRoadmap;
