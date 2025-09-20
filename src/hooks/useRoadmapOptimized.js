import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as browserStorage from '@/lib/storage/browserStorage';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Memoized storage operations
const memoizedStorageOperations = {
  getFavorites: () => {
    try {
      const saved = localStorage.getItem('favoriteRoadmaps');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },
  
  saveFavorites: debounce((favorites) => {
    try {
      localStorage.setItem('favoriteRoadmaps', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, 300),
  
  getModels: () => {
    try {
      // First try the new models configuration
      const modelsConfig = localStorage.getItem("ai-models-config");
      if (modelsConfig) {
        const parsedModels = JSON.parse(modelsConfig);
        const modelNames = parsedModels
          .filter(model => model.provider === 'gemini')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(model => model.modelName);
        
        if (modelNames.length > 0) {
          return modelNames;
        }
      }
      
      // Fallback to legacy configuration
      const savedModels = localStorage.getItem("gemini-available-models");
      return savedModels
        ? JSON.parse(savedModels)
        : [
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash-thinking-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
          ];
    } catch (error) {
      console.error('Error loading models:', error);
      return ["gemini-1.5-flash"]; // Safe fallback
    }
  }
};

const useRoadmapOptimized = ({ setActiveTab: _setActiveTab } = {}) => {
  // Core state - grouped for better performance
  const [coreState, setCoreState] = useState({
    objective: "",
    finalGoal: "",
    startingLevel: "Beginner",
    roadmap: null,
    loading: false,
    error: null,
    loadingMessage: "",
    roadmapName: ""
  });

  // Separate state for collections to avoid unnecessary re-renders
  const [savedTimeplans, setSavedTimeplans] = useState([]);
  const [favorites, setFavorites] = useState(() => memoizedStorageOperations.getFavorites());
  const [availableModels, setAvailableModels] = useState(() => memoizedStorageOperations.getModels());
  
  // Queue management state
  const [queueState, setQueueState] = useState({
    generationQueue: [],
    isQueuePaused: false,
    currentlyGenerating: null
  });

  // Refs for performance
  const genAI = useRef(null);
  const _isInterrupted = useRef(false);
  const _currentModelIndex = useRef(0);
  const _queueProcessingRef = useRef(false);
  const cleanupFunctions = useRef([]);

  // Memoized API key
  const apiKey = useMemo(() => localStorage.getItem("gemini-api-key"), []);

  // Initialize GenAI - only once
  useEffect(() => {
    if (apiKey && !genAI.current) {
      genAI.current = new GoogleGenerativeAI(apiKey);
    }
  }, [apiKey]);

  // Optimized storage change handler with cleanup
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "gemini-api-key" && e.newValue) {
        genAI.current = new GoogleGenerativeAI(e.newValue);
      } else if (e.key === "ai-models-config") {
        setAvailableModels(memoizedStorageOperations.getModels());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    cleanupFunctions.current.push(() => window.removeEventListener('storage', handleStorageChange));
    
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  // Optimized toggle favorite with debounced save
  const toggleFavorite = useCallback((roadmapId) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(roadmapId)
        ? prevFavorites.filter(id => id !== roadmapId)
        : [...prevFavorites, roadmapId];
      
      // Debounced save to localStorage
      memoizedStorageOperations.saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);
  
  // Memoized sorted roadmaps
  const getSortedRoadmaps = useMemo(() => {
    return [...savedTimeplans].sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [savedTimeplans, favorites]);
  
  // Optimized favorite check
  const isFavorite = useCallback((roadmapId) => {
    return favorites.includes(roadmapId);
  }, [favorites]);
  
  // Load roadmaps only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadRoadmaps = async () => {
      try {
        const data = await browserStorage.getAllRoadmaps();
        if (isMounted) {
          setSavedTimeplans(data);
        }
      } catch (error) {
        console.error("Error loading roadmaps:", error);
        if (isMounted) {
          toast.error("Failed to load your roadmaps");
        }
      }
    };
    
    loadRoadmaps();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized incomplete roadmaps
  const incompleteRoadmaps = useMemo(() => 
    savedTimeplans.filter((roadmap) => roadmap.generationState !== "completed"),
    [savedTimeplans]
  );

  // Optimized core state updaters
  const updateCoreState = useCallback((updates) => {
    setCoreState(prev => ({ ...prev, ...updates }));
  }, []);

  const setObjective = useCallback((value) => updateCoreState({ objective: value }), [updateCoreState]);
  const setFinalGoal = useCallback((value) => updateCoreState({ finalGoal: value }), [updateCoreState]);
  const setStartingLevel = useCallback((value) => updateCoreState({ startingLevel: value }), [updateCoreState]);
  const setRoadmap = useCallback((value) => updateCoreState({ roadmap: value }), [updateCoreState]);
  const setLoading = useCallback((value) => updateCoreState({ loading: value }), [updateCoreState]);
  const setError = useCallback((value) => updateCoreState({ error: value }), [updateCoreState]);
  const setLoadingMessage = useCallback((value) => updateCoreState({ loadingMessage: value }), [updateCoreState]);
  const setRoadmapName = useCallback((value) => updateCoreState({ roadmapName: value }), [updateCoreState]);

  // Optimized queue state updaters
  const updateQueueState = useCallback((updates) => {
    setQueueState(prev => ({ ...prev, ...updates }));
  }, []);

  const setGenerationQueue = useCallback((value) => updateQueueState({ generationQueue: value }), [updateQueueState]);
  const _setIsQueuePaused = useCallback((value) => updateQueueState({ isQueuePaused: value }), [updateQueueState]);
  const _setCurrentlyGenerating = useCallback((value) => updateQueueState({ currentlyGenerating: value }), [updateQueueState]);

  // Placeholder functions for the remaining functionality
  const toggleMiniGoal = useCallback(() => {}, []);
  const calculateOverallProgress = useCallback(() => 0, []);
  const calculatePhaseProgress = useCallback(() => 0, []);
  const generateRoadmap = useCallback(() => {}, []);
  const saveCurrentRoadmap = useCallback(() => {}, []);
  const loadRoadmap = useCallback(() => {}, []);
  const deleteRoadmap = useCallback(() => {}, []);
  const interruptGeneration = useCallback(() => {}, []);
  const exportToPDF = useCallback(() => {}, []);
  const exportToHTML = useCallback(() => {}, []);
  const exportToJSON = useCallback(() => {}, []);
  const handleSaveConfirm = useCallback(() => {}, []);
  const addToQueue = useCallback(() => {}, []);
  const removeFromQueue = useCallback(() => {}, []);
  const clearQueue = useCallback(() => {}, []);
  const pauseQueue = useCallback(() => {}, []);
  const resumeQueue = useCallback(() => {}, []);
  const retryGeneration = useCallback(() => {}, []);

  return {
    // Core state
    ...coreState,
    
    // Collections
    savedTimeplans,
    getSortedRoadmaps,
    incompleteRoadmaps,
    availableModels,
    
    // Queue state
    ...queueState,
    
    // State setters
    setObjective,
    setFinalGoal,
    setStartingLevel,
    setRoadmap,
    setLoading,
    setError,
    setLoadingMessage,
    setRoadmapName,
    setGenerationQueue,
    
    // Functions
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
    handleSaveConfirm,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    retryGeneration,
    
    // Dialog state (if needed)
    isSaveDialogOpen: false,
    setIsSaveDialogOpen: () => {}
  };
};

export default useRoadmapOptimized;

