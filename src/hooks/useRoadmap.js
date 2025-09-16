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
  const [availableModels, setAvailableModels] = useState(() => {
    // First try the new models configuration
    const modelsConfig = localStorage.getItem("ai-models-config");
    if (modelsConfig) {
      try {
        const parsedModels = JSON.parse(modelsConfig);
        // Extract model names from the models configuration, sorted by order
        const modelNames = parsedModels
          .filter(model => model.provider === 'gemini') // For now, only Gemini is supported
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(model => model.modelName);
        
        if (modelNames.length > 0) {
          return modelNames;
        }
      } catch (_error) {
        console.warn('Failed to parse new models config, falling back to legacy:', error);
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
  });
  
  // Function to refresh models from settings
  const refreshModels = useCallback(() => {
    const modelsConfig = localStorage.getItem("ai-models-config");
    if (modelsConfig) {
      try {
        const parsedModels = JSON.parse(modelsConfig);
        // Extract model names from the models configuration, sorted by order
        const modelNames = parsedModels
          .filter(model => model.provider === 'gemini') // For now, only Gemini is supported
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(model => model.modelName);
        
        if (modelNames.length > 0) {
          setAvailableModels(modelNames);
          currentModelIndex.current = 0; // Reset to first model
          console.log('Models refreshed from settings:', modelNames);
          return modelNames;
        }
      } catch (_error) {
        console.warn('Failed to parse models config during refresh:', error);
      }
    }
    
    // Fallback to legacy if no new config
    const savedModels = localStorage.getItem("gemini-available-models");
    const fallbackModels = savedModels
      ? JSON.parse(savedModels)
      : [
          "gemini-2.0-flash-exp",
          "gemini-2.0-flash-thinking-exp",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-1.0-pro",
        ];
    
    setAvailableModels(fallbackModels);
    currentModelIndex.current = 0;
    console.log('Models refreshed with fallback:', fallbackModels);
    return fallbackModels;
  }, []);
  const currentModelIndex = useRef(0);
  // Queue management state
  const [generationQueue, setGenerationQueue] = useState([]);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [currentlyGenerating, setCurrentlyGenerating] = useState(null);
  const queueProcessingRef = useRef(false);

  // API Key state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini-api-key"));
  
  // Initialize GenAI with API key
  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini-api-key");
    setApiKey(storedApiKey);
    if (storedApiKey) {
      setGenAI(new GoogleGenerativeAI(storedApiKey));
    }
  }, []);
  
  // Listen for API key changes and model configuration changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "gemini-api-key") {
        const newApiKey = e.newValue;
        setApiKey(newApiKey);
        if (newApiKey) {
          setGenAI(new GoogleGenerativeAI(newApiKey));
        }
      } else if (e.key === "ai-models-config") {
        // Refresh models when configuration changes
        refreshModels();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshModels]);

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
      } catch (_error) {
        console.error("Error fetching roadmaps:", error);
      }
    };
    fetchRoadmaps();
  }, []);

  const [roadmapName, setRoadmapName] = useState(""); // Used for UI display

  // Get incomplete roadmaps
  const incompleteRoadmaps = useMemo(() => 
    savedTimeplans.filter((roadmap) => roadmap.generationState !== "completed"),
    [savedTimeplans]
  );

  const saveCurrentRoadmap = async () => {
    if (!roadmap) return;
    const ROADMAP_TITLE = roadmap.title || `Roadmap-${Date.now()}`;
    setRoadmapName(ROADMAP_TITLE);
    console.log('Roadmap name set to:', ROADMAP_TITLE); // Using the variable
  };

  const saveRoadmapToDisk = async (roadmapData, name) => {
    try {
      const _roadmapTitle = roadmapData.title || name || `Roadmap-${Date.now()}`;
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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export roadmap as PDF');
    }
  };

  // Export roadmap as HTML - lazy loaded interactive to-do list
  const exportToHTML = async () => {
    if (!roadmap) {
      toast.error('No roadmap available to export');
      return;
    }
    
    try {
      const { exportToHTMLTodoList } = await import('../lib/export/htmlTodoExporter.js');
      exportToHTMLTodoList(roadmap);
      toast.success('Interactive roadmap to-do list exported! 📋');
    } catch (_error) {
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

  // AI Generation Helper Functions
  const parseJsonResponse = (text) => {
    let jsonString = text.trim();
    let extractedJson = "";

    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(jsonBlockRegex);

    if (match && match[1]) {
      extractedJson = match[1];
    } else {
      const firstBrace = jsonString.indexOf("{");
      const lastBrace = jsonString.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        extractedJson = jsonString.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error(
          "Could not find a valid JSON structure in the AI response.",
        );
      }
    }

    try {
      return JSON.parse(extractedJson);
    } catch (jsonParseError) {
      console.error(
        "Failed to parse JSON:",
        jsonParseError,
        "Attempted JSON string:",
        extractedJson,
      );
      throw new Error(
        `The AI model provided an invalid JSON response. Raw parsing error: ${jsonParseError.message}`,
      );
    }
  };

  const initializePhaseDetails = (phase, pIdx) => {
    const phaseWithProgress = {
      ...phase,
      miniGoals: phase.miniGoals
        ? phase.miniGoals.map((mg, mgIdx) => ({
            id: mg.id || `mini-goal-${pIdx + 1}-${mgIdx + 1}`,
            completed: mg.completed || false,
            completedDate: mg.completedDate || null,
            ...mg,
          }))
        : [],
    };
    phaseWithProgress.progressPercentage =
      calculatePhaseProgress(phaseWithProgress);
    return phaseWithProgress;
  };

  const createInitialPrompt = useCallback(
    () => {
      // Get phase settings from localStorage
      const minPhases = parseInt(localStorage.getItem('min-phases')) || 15;
      const maxPhases = parseInt(localStorage.getItem('max-phases')) || 50;
      const adaptiveDifficulty = localStorage.getItem('adaptive-difficulty') !== 'false';
      
      // Calculate phase range based on difficulty if adaptive is enabled
      let phaseRange = `${minPhases} to ${maxPhases}`;
      
      if (adaptiveDifficulty) {
        // Determine difficulty level based on objective complexity
        const objectiveLower = objective.toLowerCase();
        const finalGoalLower = finalGoal.toLowerCase();
        
        // Keywords that suggest different difficulty levels
        const easyKeywords = ['basic', 'beginner', 'introduction', 'fundamentals', 'getting started', 'simple'];
        const mediumKeywords = ['intermediate', 'practical', 'hands-on', 'project', 'application'];
        const hardKeywords = ['advanced', 'complex', 'professional', 'enterprise', 'architecture', 'system'];
        const expertKeywords = ['expert', 'mastery', 'research', 'cutting-edge', 'innovation', 'leadership'];
        
        let difficultyLevel = 'medium'; // default
        
        if (easyKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'easy';
        } else if (expertKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'expert';
        } else if (hardKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'hard';
        } else if (mediumKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'medium';
        }
        
        // Calculate phase range based on difficulty
        const range = maxPhases - minPhases;
        switch (difficultyLevel) {
          case 'easy': {
            const easyMin = minPhases;
            const easyMax = Math.ceil(minPhases + range * 0.3);
            phaseRange = `${easyMin} to ${easyMax}`;
            break;
          }
          case 'medium': {
            const mediumMin = Math.ceil(minPhases + range * 0.3);
            const mediumMax = Math.ceil(minPhases + range * 0.6);
            phaseRange = `${mediumMin} to ${mediumMax}`;
            break;
          }
          case 'hard': {
            const hardMin = Math.ceil(minPhases + range * 0.6);
            const hardMax = Math.ceil(minPhases + range * 0.8);
            phaseRange = `${hardMin} to ${hardMax}`;
            break;
          }
          case 'expert': {
            const expertMin = Math.ceil(minPhases + range * 0.8);
            const expertMax = maxPhases;
            phaseRange = `${expertMin} to ${expertMax}`;
            break;
          }
        }
      }
      
      return `
Create a high-level study roadmap structure for: "${objective}"
Final Goal: "${finalGoal}"
Starting Level: "${startingLevel}"

Provide the overall roadmap details and a list of phase titles.
The roadmap should have ${phaseRange} DISTINCT, PROGRESSIVELY CHALLENGING PHASES.

ADAPT THE DIFFICULTY AND PHASE COUNT BASED ON THE COMPLEXITY OF THE SUBJECT:
- For BEGINNER/EASY topics: Use fewer phases (${Math.ceil(minPhases)} - ${Math.ceil(minPhases + (maxPhases - minPhases) * 0.3)}) with foundational concepts
- For INTERMEDIATE topics: Use moderate phases (${Math.ceil(minPhases + (maxPhases - minPhases) * 0.3)} - ${Math.ceil(minPhases + (maxPhases - minPhases) * 0.6)}) with practical applications
- For ADVANCED topics: Use more phases (${Math.ceil(minPhases + (maxPhases - minPhases) * 0.6)} - ${Math.ceil(minPhases + (maxPhases - minPhases) * 0.8)}) with complex concepts
- For EXPERT/MASTERY topics: Use maximum phases (${Math.ceil(minPhases + (maxPhases - minPhases) * 0.8)} - ${maxPhases}) with comprehensive coverage

Format as JSON with this EXACT structure:
{
  "title": "Comprehensive Study Roadmap Title",
  "totalDuration": "Be completely realistic - multiple years if needed for mastery and only tell the time without any other details like ('2 Years', '6 Months', '3 - 5 Years') not ('2 Years of part-time study', '6 - 10 Months to become proficient')",
  "difficultyLevel": "Beginner/Intermediate/Advanced/Expert",
  "totalEstimatedHours": "Realistic total hour commitment",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Descriptive Phase Title"
    }
  ],
  "motivationMilestones": [
    "Specific achievements that maintain long-term motivation"
  ],
  "careerProgression": [
    "Clear career advancement steps and opportunities with this knowledge"
  ],
  "tips": [
    "Expert-level strategic advice for maximizing success and avoiding common pitfalls"
  ],
  "prerequisites": ["Essential knowledge learner should have before starting"],
  "careerOutcomes": [
    { "role": "Software Engineer", "salary": "$100k - $150k" }
  ],
  "marketDemand": "Current market demand and future outlook for these skills",
  "communityResources": ["Professional communities, forums, and networking opportunities"]
}

CRITICAL: Your entire response MUST be valid JSON only. No markdown formatting, no explanations, no additional text - just pure, valid JSON.
`;
    },
    [objective, finalGoal, startingLevel],
  );

  const createPhaseDetailPrompt = useCallback(
    (phaseTitle) => `
You are generating one phase of a larger study roadmap for: "${objective}" with the final goal: "${finalGoal}".
Starting Level: "${startingLevel}"
The current phase is: "${phaseTitle}".

Generate the detailed content for this single phase.

**CRITICAL INSTRUCTION: Provide a detailed and realistic breakdown for this phase.**

**MINI-GOAL REQUIREMENT:**
Generate 7-12 actionable, highly detailed mini-goals for this phase.

**RESOURCES & PROJECT:**
Provide multiple, high-quality resources and a monetizable project for this phase.

Format as JSON with this EXACT structure for the phase object:
{
  "duration": "Realistic timeframe based on actual complexity",
  "goal": "Specific, measurable goal with clear success criteria",
  "miniGoals": [
    {
      "id": "mini-goal-1-1",
      "title": "Specific actionable mini-goal title",
      "description": "Detailed description with expected outcomes and deliverables",
      "estimatedTime": "Realistic time estimate (days/weeks)",
      "priority": "high/medium/low",
      "completed": false,
      "completedDate": null,
      "dependencies": [],
      "successCriteria": "Measurable criteria for completion",
      "url": "https://optional-direct-link-for-this-mini-goal.com"
    }
  ],
  "resources": [
    {
      "name": "Specific Resource Name",
      "url": "https://actual-working-url.com",
      "type": "documentation/course/book/paper/project/tool",
      "description": "Why this specific resource is exceptional and valuable",
      "difficulty": "beginner/intermediate/advanced/expert",
      "estimatedTime": "Time to complete this resource",
      "priority": "essential/recommended/optional"
    }
  ],
  "project": {
    "title": "Practical Project Title",
    "description": "Comprehensive project description with clear objectives",
    "deliverables": ["List of specific, measurable deliverables"],
    "monetizationPotential": "Detailed explanation of how this could generate income",
    "skillsApplied": ["Specific technical skills being practiced"],
    "estimatedDuration": "Realistic project completion time",
    "difficultyLevel": "Current complexity level",
    "portfolioValue": "Why this adds value to a professional portfolio"
  },
  "skills": ["Specific technical and soft skills gained"],
  "milestone": "Clear, measurable achievement marking phase completion",
  "prerequisiteKnowledge": ["What should be mastered before starting this phase"],
  "flexibleTimeAllocation": true,
  "actualDuration": null,
  "progressPercentage": 0
}

CRITICAL: Your entire response MUST be valid JSON only. No markdown formatting, no explanations, no additional text - just pure, valid JSON.
`,
    [objective, finalGoal, startingLevel],
  );

  // Enhanced AI-powered roadmap generation function with better error handling
  const generateRoadmap = async (isContinuation = false, roadmapToContinue = null, __wasQueuePaused = false, initialRoadmap = null) => {
    console.log('[generateRoadmap] Starting enhanced generation', { 
      isContinuation, 
      roadmapId: roadmapToContinue?.id, 
      hasInitialRoadmap: !!initialRoadmap,
      queueLength: generationQueue?.length || 0
    });
    
    // Enhanced validation
    if (!apiKey || !genAI) {
      const errorMsg = "Please set your Gemini API key in the settings.";
      console.error('[generateRoadmap] Error:', errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      setError(errorMsg);
      return null;
    }

    // Validate required inputs for new generations
    if (!isContinuation && !initialRoadmap && (!objective?.trim() || !finalGoal?.trim())) {
      const errorMsg = "Please provide both an objective and final goal.";
      console.error('[generateRoadmap] Error:', errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      setError(errorMsg);
      return null;
    }

    console.log('[generateRoadmap] Resetting interruption flag and setting loading state');
    isInterrupted.current = false;
    setLoading(true);
    setError(null);
    setLoadingMessage("Initializing generation...");

    if (!isContinuation && !initialRoadmap) {
      localStorage.removeItem("currentRoadmap");
      setRoadmap(null);
    }

    const generateWithRetry = async (prompt, phase = 'unknown') => {
      const startingModelIndex = currentModelIndex.current;
      let attempts = 0;
      const maxAttempts = availableModels.length;

      console.log(`[generateWithRetry] Starting ${phase} generation with ${maxAttempts} available models`);

      while (attempts < maxAttempts) {
        if (isInterrupted.current) {
          console.log('[generateWithRetry] Generation interrupted by user');
          throw new Error("Generation interrupted by user.");
        }

        const modelName = availableModels[currentModelIndex.current];
        attempts++;
        
        try {
          console.log(`[generateWithRetry] Attempt ${attempts}/${maxAttempts} for ${phase} with model: ${modelName}`);
          setLoadingMessage(`Generating ${phase} with ${modelName}... (${attempts}/${maxAttempts})`);
          
          // Enhanced model configuration
          const generativeModel = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          });
          
          // Add timeout wrapper
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000)
          );
          
          const generationPromise = generativeModel.generateContent(prompt);
          const result = await Promise.race([generationPromise, timeoutPromise]);
          const response = await result.response;
          
          if (!response?.text) {
            throw new Error('Empty response received from model');
          }
          
          const parsedResult = parseJsonResponse(response.text());
          console.log(`[generateWithRetry] Success with model: ${modelName} for ${phase}`);
          return parsedResult;
          
        } catch (_err) {
          if (isInterrupted.current) {
            console.log('[generateWithRetry] Generation interrupted during processing');
            throw _err;
          }

          console.error(`[generateWithRetry] Error with model ${modelName} for ${phase}:`, _err.message);
          
          // Enhanced error categorization
          const isQuotaError = _err.message.includes('429') || 
                              _err.message.includes('quota') || 
                              _err.message.includes('rate limit') ||
                              _err.message.includes('RATE_LIMIT_EXCEEDED');
          
          const isModelNotFound = _err.message.includes('404') || 
                                 _err.message.includes('not found') ||
                                 _err.message.includes('MODEL_NOT_FOUND');
          
          const isServerError = _err.message.includes('500') || 
                               _err.message.includes('502') || 
                               _err.message.includes('503') ||
                               _err.message.includes('INTERNAL');
          
          const isTimeoutError = _err.message.includes('timeout') ||
                                _err.message.includes('TIMEOUT');
          
          const isContentError = _err.message.includes('SAFETY') ||
                                _err.message.includes('content') ||
                                _err.message.includes('policy');
          
          // Determine if we should retry with another model
          const shouldRetryWithDifferentModel = isQuotaError || isModelNotFound || isServerError || isTimeoutError;
          
          if (shouldRetryWithDifferentModel) {
            console.log(`[generateWithRetry] ${modelName} failed with recoverable error (${_err.message}), switching to next model`);
            
            currentModelIndex.current = (currentModelIndex.current + 1) % availableModels.length;
            
            if (currentModelIndex.current === startingModelIndex) {
              const errorMessage = `All models failed for ${phase}. Last error: ${_err.message}`;
              console.error(`[generateWithRetry] ${errorMessage}`);
              setLoadingMessage("All models failed. Please check your API key and model availability.");
              throw new Error(errorMessage);
            }
            
            const nextModel = availableModels[currentModelIndex.current];
            console.log(`[generateWithRetry] Switching to model: ${nextModel}`);
            setLoadingMessage(`Switching to ${nextModel} for ${phase}... (${attempts + 1}/${maxAttempts})`);
            
            // Progressive backoff delay
            const delay = Math.min(1000 * attempts, 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else if (isContentError) {
            console.warn(`[generateWithRetry] Content policy violation with ${modelName}, trying next model`);
            // Try next model for content policy violations
            currentModelIndex.current = (currentModelIndex.current + 1) % availableModels.length;
            if (currentModelIndex.current !== startingModelIndex) {
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
          }
          
          // Non-recoverable error or all models exhausted
          console.error(`[generateWithRetry] Non-recoverable error with ${modelName} for ${phase}:`, _err);
          throw _err;
        }
      }
      
      throw new Error("Maximum retry attempts exceeded");
    };

    try {
      let currentRoadmap = null;

      if (isContinuation && roadmapToContinue) {
        console.log('[generateRoadmap] Continuing existing roadmap:', roadmapToContinue.id);
        currentRoadmap = roadmapToContinue;
        setRoadmap(currentRoadmap);
      } else if (initialRoadmap) {
        // FIXED: Check if initialRoadmap needs structure generation
        if (!initialRoadmap.phases || initialRoadmap.phases.length === 0) {
          console.log('[generateRoadmap] Initial roadmap needs structure generation');
          
          // Generate the basic structure first
          if (!objective || !finalGoal) {
            // Use the roadmap's stored objective and finalGoal
            setObjective(initialRoadmap.objective || "");
            setFinalGoal(initialRoadmap.finalGoal || "");
            setStartingLevel(initialRoadmap.startingLevel || "Beginner");
          }
          
          if (!initialRoadmap.objective || !initialRoadmap.finalGoal) {
            throw new Error("Initial roadmap missing objective or final goal");
          }
          
          setLoadingMessage("Generating high-level plan structure...");
          const initialPrompt = createInitialPrompt();
          const initialJson = await generateWithRetry(initialPrompt);

          if (!initialJson || !Array.isArray(initialJson.phases) || initialJson.phases.length === 0) {
            throw new Error("The AI did not return a valid initial roadmap structure.");
          }

          // Update the initial roadmap with the generated structure
          currentRoadmap = {
            ...initialRoadmap,
            ...initialJson, // This includes title, totalDuration, etc.
            id: initialRoadmap.id, // Keep the original ID
            objective: initialRoadmap.objective, // Keep original objective
            finalGoal: initialRoadmap.finalGoal, // Keep original finalGoal
            startingLevel: initialRoadmap.startingLevel, // Keep original starting level
            generationState: "in-progress",
            updatedAt: new Date().toISOString(),
            phases: initialJson.phases.map((p, pIdx) => ({
              phaseNumber: p.phaseNumber || pIdx + 1,
              title: p.title,
              duration: "...",
              goal: "...",
              miniGoals: [],
              resources: [],
              project: {},
              skills: [],
              milestone: "...",
              prerequisiteKnowledge: [],
              progressPercentage: 0,
            })),
          };
          
          console.log('[generateRoadmap] Generated structure for initial roadmap:', currentRoadmap);
        } else {
          console.log('[generateRoadmap] Using provided initial roadmap with existing structure:', initialRoadmap.id);
          currentRoadmap = initialRoadmap;
        }
        
        setRoadmap(currentRoadmap);
        
        // Save the updated roadmap
        const savedRoadmap = await saveRoadmapToDisk(
          currentRoadmap,
          currentRoadmap.title || `Roadmap-${Date.now()}`,
        );
        
        if (!savedRoadmap) {
          throw new Error("Failed to save roadmap with structure");
        }
        
        currentRoadmap = savedRoadmap;
        setRoadmap(savedRoadmap);
      } else {
        // Generate completely new roadmap
        if (!objective || !finalGoal) {
          throw new Error("Please provide both an objective and a final goal.");
        }
        
        console.log('[generateRoadmap] Generating new roadmap structure');
        setLoadingMessage("Generating high-level plan...");
        const initialPrompt = createInitialPrompt();
        const initialJson = await generateWithRetry(initialPrompt);

        if (!initialJson || !Array.isArray(initialJson.phases) || initialJson.phases.length === 0) {
          throw new Error("The AI did not return a valid initial roadmap structure.");
        }

        const newRoadmap = {
          ...initialJson,
          id: `roadmap-${Date.now()}`,
          objective: objective,
          finalGoal: finalGoal,
          startingLevel: startingLevel,
          generationState: "in-progress",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phases: initialJson.phases.map((p, pIdx) => ({
            phaseNumber: p.phaseNumber || pIdx + 1,
            title: p.title,
            duration: "...",
            goal: "...",
            miniGoals: [],
            resources: [],
            project: {},
            skills: [],
            milestone: "...",
            prerequisiteKnowledge: [],
            progressPercentage: 0,
          })),
        };

        // Save the initial roadmap
        const savedRoadmap = await saveRoadmapToDisk(
          newRoadmap,
          newRoadmap.title || `Roadmap-${Date.now()}`,
        );
        
        if (!savedRoadmap) {
          throw new Error("Failed to save initial roadmap");
        }
        
        currentRoadmap = savedRoadmap;
        setRoadmap(savedRoadmap);
      }

      // Generate phase details
      const startIndex = currentRoadmap.phases.findIndex(p => p.goal === "...");
      if (startIndex === -1) {
        console.log('[generateRoadmap] Roadmap already complete');
        currentRoadmap.generationState = "completed";
        await saveRoadmapToDisk(currentRoadmap, currentRoadmap.title);
        setLoading(false);
        return currentRoadmap;
      }

      let accumulatingRoadmap = { ...currentRoadmap };

      for (let i = startIndex; i < accumulatingRoadmap.phases.length; i++) {
        if (isInterrupted.current) {
          console.log("Generation interrupted by user.");
          accumulatingRoadmap = {
            ...accumulatingRoadmap,
            generationState: "in-progress",
          };
          await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
          break;
        }

        const phase = accumulatingRoadmap.phases[i];
        setLoadingMessage(
          `Generating details for phase ${i + 1}/${accumulatingRoadmap.phases.length}: ${phase.title}`,
        );
        
        const phaseJson = await generateWithRetry(createPhaseDetailPrompt(phase.title));

        if (isInterrupted.current) {
          console.log("Generation interrupted by user after fetch.");
          accumulatingRoadmap = {
            ...accumulatingRoadmap,
            generationState: "in-progress",
          };
          await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
          break;
        }

        // Update phase
        const newPhases = [...accumulatingRoadmap.phases];
        newPhases[i] = initializePhaseDetails(
          { ...newPhases[i], ...phaseJson },
          i,
        );
        accumulatingRoadmap = { ...accumulatingRoadmap, phases: newPhases };

        // Save progress
        const savedStep = await saveRoadmapToDisk(
          accumulatingRoadmap,
          accumulatingRoadmap.title,
        );
        if (!savedStep) {
          throw new Error("Failed to save roadmap progress during loop.");
        }
        accumulatingRoadmap = savedStep;
        setRoadmap(savedStep); // Update the global state to reflect progress
      }

      if (!isInterrupted.current) {
        accumulatingRoadmap.generationState = "completed";
        await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
        console.log('[generateRoadmap] Roadmap generation completed');
      }

      if (!isInterrupted.current) {
        if (setActiveTab) {
          setActiveTab("view");
        }
        return accumulatingRoadmap; // Return the completed roadmap
      }

      // If interrupted, do not return the incomplete roadmap
      return null;
    } catch (_err) {
      if (_err.message.includes("interrupted by user")) {
        console.log("Caught user interruption. Halting generation.");
        setError(null);
      } else {
        console.error("Error generating roadmap:", _err);
        setError("Failed to generate roadmap: " + _err.message);
        toast.error("Failed to generate roadmap: " + _err.message);
      }
      return null;
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  /**
   * Interrupts the current AI generation.
   * Note: GoogleGenerativeAI API does NOT support aborting in-flight requests.
   * This will only set a flag to ignore results after the current request completes.
   * The network/API request will still run to completion in the background.
   * UI should reflect that interruption takes effect after the current phase/request.
   */
  const interruptGeneration = useCallback((source = 'unknown') => {
    console.log(`[interruptGeneration] Interrupting current generation from: ${source}`, {
      isInterrupted: isInterrupted.current,
      isQueuePaused,
      queueProcessing: queueProcessingRef.current,
      currentlyGenerating
    });
    if (currentlyGenerating || queueProcessingRef.current || loading) {
      isInterrupted.current = true;
      console.log(`[interruptGeneration] Set isInterrupted to true`);
    } else {
      console.log(`[interruptGeneration] No active generation, not setting interrupted flag`);
    }
    // Also pause the queue to prevent new items from being processed
    pauseQueue();
    // Clear any currently generating item
    setCurrentlyGenerating(null);
  }, [isQueuePaused, currentlyGenerating, loading]);

  // Forward declaration for processQueue
  const processQueueRef = useRef();
  
  // Working queue management
  const addToQueue = useCallback((queueItem) => {
    console.log('[addToQueue] Adding item to queue:', queueItem);
    
    if (!queueItem) {
      console.error('[addToQueue] No queue item provided');
      return false;
    }
    
    try {
      setGenerationQueue(prevQueue => {
        const newQueue = [...prevQueue, {
          ...queueItem,
          id: queueItem.id || `queue-${Date.now()}`,
          status: 'queued',
          createdAt: queueItem.createdAt || new Date().toISOString()
        }];
        console.log('[addToQueue] Updated queue:', newQueue);
        return newQueue;
      });
      
      // Auto-start processing if queue isn't paused
      setTimeout(() => {
        if (!isQueuePaused && processQueueRef.current) {
          processQueueRef.current();
        }
      }, 100);
      
      return true;
    } catch (_error) {
      console.error('[addToQueue] Error adding to queue:', error);
      return false;
    }
  }, [isQueuePaused]);

  const removeFromQueue = useCallback((itemId) => {
    setGenerationQueue(prevQueue => 
      prevQueue.filter(item => item.id !== itemId)
    );
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

  // Simple queue processor
  const processQueue = useCallback(async () => {
    if (queueProcessingRef.current || isQueuePaused) {
      console.log('[processQueue] Already processing or paused');
      return;
    }
    
    queueProcessingRef.current = true;
    console.log('[processQueue] Starting queue processing');
    
    try {
      // Get current queue state synchronously
      let currentQueue = [];
      setGenerationQueue(queue => {
        currentQueue = [...queue];
        return queue;
      });
      
      while (currentQueue.length > 0 && !isQueuePaused && !isInterrupted.current) {
        const nextItem = currentQueue[0];
        console.log('[processQueue] Processing item:', nextItem);
        
        setCurrentlyGenerating(nextItem);
        
        try {
          // Use the pre-created roadmap from the queue instead of generating a new one
          const result = await generateRoadmap(false, null, false, nextItem.initialRoadmap);
          
          if (result) {
            // Remove completed item from queue
            setGenerationQueue(prev => {
              currentQueue = prev.slice(1);
              return currentQueue;
            });
            toast.success(`Roadmap "${nextItem.name}" generated successfully!`);
          } else {
            // Mark item as failed but keep it in queue for retry
            setGenerationQueue(prev => {
              const updatedQueue = prev.map((item, index) => 
                index === 0 ? { ...item, status: 'failed' } : item
              );
              currentQueue = [...updatedQueue];
              return updatedQueue;
            });
            break; // Stop processing if failed
          }
        } catch (_error) {
          console.error('[processQueue] Error processing queue item:', error);
          // Mark item as failed
          setGenerationQueue(prev => {
            const updatedQueue = prev.map((item, index) => 
              index === 0 ? { ...item, status: 'failed', error: error.message } : item
            );
            currentQueue = [...updatedQueue];
            return updatedQueue;
          });
          break; // Stop processing if failed
        }
        
        setCurrentlyGenerating(null);
      }
    } catch (_error) {
      console.error('[processQueue] Error in queue processing:', error);
    } finally {
      queueProcessingRef.current = false;
      setCurrentlyGenerating(null);
      console.log('[processQueue] Queue processing finished');
    }
  }, [isQueuePaused, generateRoadmap]);
  
  // Assign processQueue to the ref
  processQueueRef.current = processQueue;

  const retryGeneration = useCallback((itemId) => {
    setGenerationQueue(prevQueue => 
      prevQueue.map(item => 
        item.id === itemId 
          ? { ...item, status: 'queued', error: null }
          : item
      )
    );
    
    // Try to process the queue again
    setTimeout(() => {
      if (processQueueRef.current) {
        processQueueRef.current();
      }
    }, 100);
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
    // Models management
    availableModels,
    refreshModels,
  };
};

export default useRoadmap;
