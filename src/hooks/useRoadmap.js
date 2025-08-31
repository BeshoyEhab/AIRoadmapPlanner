import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";
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
import { toast } from "sonner";

const useRoadmap = ({ setActiveTab } = {}) => {
  const [objective, setObjective] = useState("");
  const [finalGoal, setFinalGoal] = useState("");
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
  const getSortedRoadmaps = useCallback(() => {
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

  // const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [roadmapName, setRoadmapName] = useState("");

  // Get incomplete roadmaps
  const incompleteRoadmaps = savedTimeplans.filter(
    (roadmap) => roadmap.generationState !== "completed",
  );

  const saveCurrentRoadmap = async () => {
    if (!roadmap) return;
    setRoadmapName(roadmap.title || `Roadmap-${Date.now()}`);
    // setIsSaveDialogOpen(true);
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
        // setIsSaveDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving roadmap:", error);
      toast.error("Failed to save timeplan.");
    }
  };

  const loadRoadmap = (roadmapId) => {
    const loadedTimeplan = savedTimeplans.find((tp) => tp.id === roadmapId);
    if (loadedTimeplan) {
      setRoadmap(loadedTimeplan);
      setObjective(loadedTimeplan.objective || "");
      setFinalGoal(loadedTimeplan.finalGoal || "");
      return true;
    }
    return false;
  };

  const confirmDelete = (idOrSanitizedName) => {
    // setRoadmapToDelete(idOrSanitizedName);
    // setIsDeleteDialogOpen(true);
  };

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

  // const handleDeleteConfirm = async () => {
  //   if (!roadmapToDelete) return;
  //   try {
  //     await deleteRoadmap(roadmapToDelete);
  //     setIsDeleteDialogOpen(false);
  //     setRoadmapToDelete(null);
  //   } catch (error) {
  //     console.error("Error in handleDeleteConfirm:", error);
  //     toast.error("Failed to delete roadmap.");
  //   }
  // };

  const exportToPDF = () => {
    if (!roadmap) return;

    const doc = new jsPDF();
    doc.text(roadmap.title, 20, 20);
    // ... more PDF generation logic here
    doc.save(`${roadmap.sanitizedName}.pdf`);
  };

  const exportToHTML = () => {
    if (!roadmap) return;

    const htmlContent = `
      <html>
        <head>
          <title>${roadmap.title}</title>
        </head>
        <body>
          <h1>${roadmap.title}</h1>
          </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    saveAs(blob, `${roadmap.sanitizedName}.html`);
  };

  // Function to create a sanitized version of the roadmap for storage
  const getSanitizedRoadmap = useCallback((roadmap) => {
    if (!roadmap) return null;
    
    // Create a new object with only the properties we want to save
    const sanitized = {
      id: roadmap.id,
      title: roadmap.title,
      objective: roadmap.objective,
      finalGoal: roadmap.finalGoal,
      sanitizedName: roadmap.sanitizedName,
      generationState: roadmap.generationState,
      phases: roadmap.phases ? roadmap.phases.map(phase => ({
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        duration: phase.duration,
        goal: phase.goal,
        miniGoals: phase.miniGoals,
        resources: phase.resources,
        project: phase.project,
        skills: phase.skills,
        milestone: phase.milestone,
        prerequisiteKnowledge: phase.prerequisiteKnowledge,
        progressPercentage: phase.progressPercentage
      })) : [],
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
      // Add any other necessary primitive properties
    };
    
    return sanitized;
  }, []);

  // Save roadmap to localStorage when it changes
  useEffect(() => {
    if (roadmap) {
      const sanitized = getSanitizedRoadmap(roadmap);
      if (sanitized) {
        try {
          localStorage.setItem("currentRoadmap", JSON.stringify(sanitized));
        } catch (error) {
          console.error("Error saving roadmap to localStorage:", error);
        }
      }
    }
  }, [roadmap, getSanitizedRoadmap]);

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
    [objective, finalGoal],
  );

  const createPhaseDetailPrompt = useCallback(
    (phaseTitle) => `
You are generating one phase of a larger study roadmap for: "${objective}" with the final goal: "${finalGoal}".
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
    [objective, finalGoal],
  );

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
  }, [isQueuePaused, currentlyGenerating]);

  const handleInterrupt = useCallback(() => {
    console.log('[handleInterrupt] Manual interrupt triggered');
    interruptGeneration('manual_interrupt');
    setLoading(false);
    setLoadingMessage("");
    toast.success("Generation stopped");
  }, [interruptGeneration]);

  const generateRoadmap = async (isContinuation = false, roadmapToContinue = null, wasQueuePaused = false, initialRoadmap = null) => {
    console.log('[generateRoadmap] Starting generation', { 
      isContinuation, 
      roadmapId: roadmapToContinue?.id, 
      hasInitialRoadmap: !!initialRoadmap 
    });
    
    if (!genAI) {
      const errorMsg = "Please set your Gemini API key in the settings.";
      console.error('[generateRoadmap] Error:', errorMsg);
      alert(errorMsg);
      return null;
    }

    console.log('[generateRoadmap] Resetting interruption flag and setting loading state');
    isInterrupted.current = false;
    setLoading(true);
    setError(null);

    if (!isContinuation && !initialRoadmap) {
      localStorage.removeItem("currentRoadmap");
      setRoadmap(null);
    }

    const generateWithRetry = async (prompt) => {
      const startingModelIndex = currentModelIndex.current;
      let attempts = 0;
      const maxAttempts = availableModels.length;

      while (attempts < maxAttempts) {
        if (isInterrupted.current) {
          throw new Error("Generation interrupted by user.");
        }

        const modelName = availableModels[currentModelIndex.current];
        attempts++;
        
        try {
          console.log(`[generateWithRetry] Attempt ${attempts}/${maxAttempts} with model: ${modelName}`);
          setLoadingMessage(`Generating with ${modelName}... (attempt ${attempts}/${maxAttempts})`);
          
          const generativeModel = genAI.getGenerativeModel({
            model: modelName,
          });
          
          const result = await generativeModel.generateContent(prompt);
          const response = await result.response;
          
          console.log(`[generateWithRetry] Success with model: ${modelName}`);
          return parseJsonResponse(response.text());
          
        } catch (err) {
          if (isInterrupted.current) {
            throw err;
          }

          console.error(`[generateWithRetry] Error with model ${modelName}:`, err.message);
          
          const isQuotaError = err.message.includes('429') || err.message.includes('quota') || err.message.includes('rate limit');
          const isModelNotFound = err.message.includes('404') || err.message.includes('not found');
          const isServerError = err.message.includes('500') || err.message.includes('502') || err.message.includes('503');
          
          if (isQuotaError || isModelNotFound || isServerError) {
            console.log(`[generateWithRetry] ${modelName} failed with recoverable error, switching to next model`);
            
            currentModelIndex.current = (currentModelIndex.current + 1) % availableModels.length;
            
            if (currentModelIndex.current === startingModelIndex) {
              console.error(`[generateWithRetry] All models failed after ${attempts} attempts`);
              setLoadingMessage("All models failed. Please check your API key and model availability.");
              throw new Error(`All available models failed. Last error: ${err.message}`);
            }
            
            const nextModel = availableModels[currentModelIndex.current];
            console.log(`[generateWithRetry] Switching to model: ${nextModel}`);
            setLoadingMessage(`Switching to model ${nextModel}... (attempt ${attempts + 1}/${maxAttempts})`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            console.error(`[generateWithRetry] Non-recoverable error with ${modelName}:`, err);
            throw err;
          }
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

      // Generate phase details (this part remains the same)
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
    } catch (err) {
      if (err.message.includes("interrupted by user")) {
        console.log("Caught user interruption. Halting generation.");
        setError(null);
      } else {
        console.error("Error generating roadmap:", err);
        setError("Failed to generate roadmap: " + err.message);
      }
      return null;
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Generate roadmap specifically for queue items
  const generateRoadmapForQueue = async (queueItem) => {
    const originalObjective = objective;
    const originalFinalGoal = finalGoal;
    const wasQueuePaused = isQueuePaused;

    try {
      // Find the roadmap to continue if it exists
      let roadmapToContinue = null;
      if (queueItem.roadmapId) {
        roadmapToContinue = savedTimeplans.find(r => r.id === queueItem.roadmapId);
      }
      
      // Temporarily set objectives for generation
      setObjective(queueItem.objective);
      setFinalGoal(queueItem.finalGoal);
      
      // Generate the roadmap - pass initial roadmap if available
      const isContinuation = !!roadmapToContinue;
      const initialRoadmap = queueItem.initialRoadmap || null;
      const result = await generateRoadmap(
        isContinuation, 
        roadmapToContinue, 
        wasQueuePaused,
        initialRoadmap
      );
      
      // If we have a result, update the queue item with the new roadmap ID
      if (result && result.id) {
        return result;
      }
    } catch (error) {
      console.error('Error in generateRoadmapForQueue:', error);
      throw error; // Re-throw to be caught by the queue processor
    } finally {
      // Restore original objectives
      setObjective(originalObjective);
      setFinalGoal(originalFinalGoal);
    }
  };

  // SIMPLIFIED useEffect - only respond to pause state changes
  useEffect(() => {
    // Only auto-resume when unpausing, not on every queue change
    if (!isQueuePaused && !queueProcessingRef.current && generationQueue.length > 0) {
      console.log("Auto-resuming queue processing");
      const timer = setTimeout(() => {
        processQueue();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isQueuePaused]); // Only depend on pause state, not queue contents
  
  // Fixed processQueue function
  const processQueue = useCallback(async () => {
    // Prevent multiple simultaneous processing
    if (queueProcessingRef.current) {
      console.log('[processQueue] Queue already processing, returning');
      return;
    }

    queueProcessingRef.current = true;
    console.log('[processQueue] Queue processing started');

    try {
      while (true) {
        // Get current queue state synchronously
        let currentQueue = null;
        let nextItem = null;
        
        await new Promise((resolve) => {
          setGenerationQueue(queue => {
            currentQueue = [...queue]; // Create a copy to avoid mutations
            console.log('[processQueue] Current queue state:', {
              isInterrupted: isInterrupted.current,
              isQueuePaused,
              queueLength: currentQueue.length,
              processing: queueProcessingRef.current
            });

            // Check exit conditions
            if (isInterrupted.current || isQueuePaused || shouldPauseAfterCurrent.current || currentQueue.length === 0) {
              console.log('[processQueue] Cannot process: interrupted/paused/empty');
              resolve();
              return queue; // Return unchanged queue
            }

            nextItem = currentQueue[0];
            console.log("Processing queue item:", nextItem);
            resolve();
            return queue; // Don't modify queue here
          });
        });

        // Exit if no item to process
        if (!nextItem) {
          console.log('[processQueue] No more items to process');
          break;
        }

        setCurrentlyGenerating(nextItem);

        let generatedRoadmap = null;
        try {
          if (nextItem.isResume) {
            console.log("Resuming roadmap:", nextItem.roadmapId);
            const roadmapToResume = savedTimeplans.find(r => r.id === nextItem.roadmapId);
            if (roadmapToResume) {
              generatedRoadmap = await generateRoadmap(true, roadmapToResume);
            } else {
              console.error("Roadmap to resume not found:", nextItem.roadmapId);
              toast.error("Failed to find roadmap to resume");
            }
          } else {
            console.log("Generating new roadmap from queue");
            generatedRoadmap = await generateRoadmapForQueue(nextItem);
          }
        } catch (error) {
          console.error("Queue generation error:", error);
          toast.error(`Failed to generate roadmap: ${nextItem.objective || 'Unknown'}`);
        }

        // If roadmap generation was successful and returned a completed roadmap, remove it from the queue.
        if (generatedRoadmap) {
          const finalRoadmapState = await new Promise(resolve => {
            setRoadmap(current => {
              resolve(current);
              return current;
            });
          });

          // Only remove from queue if the entire roadmap generation is complete
          if (finalRoadmapState && finalRoadmapState.generationState === 'completed') {
            setGenerationQueue(prevQueue => prevQueue.filter(item => item.id !== nextItem.id));
            setCurrentlyGenerating(null); // Clear the currently generating item
          }
        }

        // Reset interruption flag after each item
        isInterrupted.current = false;
        
        // Check for pause conditions
        if (shouldPauseAfterCurrent.current) {
          console.log("[processQueue] Pausing after current item");
          setIsQueuePaused(true);
          shouldPauseAfterCurrent.current = false;
          break;
        }

        // Small delay between items
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log("Queue processing completed");
      
    } catch (error) {
      console.error("Error in processQueue:", error);
    } finally {
      console.log("Queue processing stopped/completed");
      queueProcessingRef.current = false;
      setCurrentlyGenerating(null);
    }
  }, [isQueuePaused, savedTimeplans, generateRoadmap, generateRoadmapForQueue]);

  // FIXED addToQueue function with debouncing
  const addToQueue = useCallback((queueItem) => {
    console.log("Adding to queue:", queueItem);
    
    isInterrupted.current = false; // Reset interruption flag for new queue item

    // Check for duplicates synchronously before updating state
    const isExactDuplicate = generationQueue.some(item => item.id === queueItem.id);
    if (isExactDuplicate) {
      console.log("Exact duplicate item found in queue, not adding");
      return false;
    }

    const isSimilarDuplicate = generationQueue.some(
      item => 
        item.objective?.trim().toLowerCase() === queueItem.objective?.trim().toLowerCase() &&
        item.finalGoal?.trim().toLowerCase() === queueItem.finalGoal?.trim().toLowerCase()
    );
    if (isSimilarDuplicate) {
      console.log("Similar item found in queue, not adding");
      return false;
    }

    // Check against currently generating item
    if (currentlyGenerating && 
        currentlyGenerating.objective?.trim().toLowerCase() === queueItem.objective?.trim().toLowerCase() &&
        currentlyGenerating.finalGoal?.trim().toLowerCase() === queueItem.finalGoal?.trim().toLowerCase()) {
      console.log("Similar item is currently being generated, not adding");
      return false;
    }

    const newQueueItem = { 
      ...queueItem, 
      status: "queued",
      addedAt: new Date().toISOString()
    };
    
    console.log("Adding new item to queue:", newQueueItem);
    
    // Update queue state
    setGenerationQueue(prevQueue => {
      const newQueue = [...prevQueue, newQueueItem];
      
      // Debounced processing trigger
      if (!queueProcessingRef.current && !isQueuePaused && !processingTriggerRef.current) {
        console.log("Triggering queue processing");
        processingTriggerRef.current = true;
        
        setTimeout(() => {
          processingTriggerRef.current = false;
          processQueue();
        }, 100);
      }
      
      return newQueue;
    });
    
    return true;
  }, [isQueuePaused, currentlyGenerating, generationQueue, processQueue]);

  const removeFromQueue = (itemId) => {
    // If this is the currently generating item, mark it for interruption
    if (currentlyGenerating && 
        (currentlyGenerating.id === itemId || currentlyGenerating.roadmapId === itemId)) {
      isInterrupted.current = true;
    }

    // Remove from queue using either id or roadmapId
    setGenerationQueue((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === itemId ||
            (item.roadmapId && item.roadmapId === itemId)
          ),
      ),
    );
  };

  const clearQueue = () => {
    if (queueProcessingRef.current) {
      shouldPauseAfterCurrent.current = true;
    }
    setGenerationQueue([]);
  };

  const pauseQueue = () => {
    if (isQueuePaused) return; // Prevent multiple pause actions

    setIsQueuePaused(true);
    shouldPauseAfterCurrent.current = true;
    isInterrupted.current = true; // Signal to interrupt the current generation

    // If there is a currently generating item, put it back at the front of the queue
    if (currentlyGenerating) {
      setGenerationQueue(prevQueue => {
        // Avoid re-adding if it's already there
        if (prevQueue.some(item => item.id === currentlyGenerating.id)) {
          return prevQueue;
        }
        return [currentlyGenerating, ...prevQueue];
      });
    }
  };

  // FIXED resumeQueue function
  const resumeQueue = () => {
    console.log("Resuming queue manually");
    setIsQueuePaused(false);
    shouldPauseAfterCurrent.current = false;
    
    // Start processing after state update
    setTimeout(() => {
      if (!queueProcessingRef.current && generationQueue.length > 0) {
        processQueue();
      }
    }, 50);
  };

  const retryGeneration = async (roadmap) => {
    setCurrentlyGenerating({ name: roadmap.name, roadmapId: roadmap.id });
    await generateRoadmap(true, roadmap);
    setCurrentlyGenerating(null);
  };

  // Clean up queue items for non-existent roadmaps
  const cleanupQueue = useCallback(() => {
    setGenerationQueue(prev => 
      prev.filter(item => {
        if (!item.roadmapId) return true; // Keep items without roadmapId (new roadmaps)
        
        const roadmapExists = savedTimeplans.find(
          (r) => r.id === item.roadmapId || r.sanitizedName === item.roadmapId
        );
        
        if (!roadmapExists) {
          console.log(`Removing queue item for deleted roadmap: ${item.roadmapId}`);
          return false;
        }
        return true;
      })
    );
  }, [savedTimeplans]);

  // Auto-cleanup queue when savedTimeplans changes
  useEffect(() => {
    cleanupQueue();
  }, [savedTimeplans, cleanupQueue]);

  useEffect(() => {
    // Only auto-resume when unpausing, not on every queue change
    if (!isQueuePaused && !queueProcessingRef.current && generationQueue.length > 0) {
      console.log("Auto-resuming queue processing");
      const timer = setTimeout(() => {
        processQueue();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isQueuePaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isInterrupted.current = true;
      queueProcessingRef.current = false;
    };
  }, []);

  const toggleMiniGoal = (phaseIndex, miniGoalId) => {
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
  };

  return {
    objective,
    setObjective,
    finalGoal,
    setFinalGoal,
    roadmap,
    setRoadmap,
    loading,
    error,
    loadingMessage,
    savedTimeplans: getSortedRoadmaps(), // Return sorted roadmaps with favorites first
    incompleteRoadmaps, // Add incompleteRoadmaps to the return object
    toggleFavorite,
    isFavorite,
    calculateOverallProgress,
    calculatePhaseProgress,
    generateRoadmap,
    saveCurrentRoadmap,
    loadRoadmap,
    deleteRoadmap,
    interruptGeneration,
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
    setGenerationQueue, // Expose setGenerationQueue function
  };
};

export default useRoadmap;
