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

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [roadmapName, setRoadmapName] = useState("");

  // Get incomplete roadmaps
  const incompleteRoadmaps = savedTimeplans.filter(
    (roadmap) => roadmap.generationState !== "completed",
  );

  const saveCurrentRoadmap = async () => {
    if (!roadmap) return;
    setRoadmapName(roadmap.title || `Roadmap-${Date.now()}`);
    setIsSaveDialogOpen(true);
  };

  const saveRoadmapToDisk = async (roadmapData, name) => {
    try {
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
        setIsSaveDialogOpen(false);
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);

  const confirmDelete = (idOrSanitizedName) => {
    setRoadmapToDelete(idOrSanitizedName);
    setIsDeleteDialogOpen(true);
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

  const handleDeleteConfirm = async () => {
    if (!roadmapToDelete) return;
    try {
      await deleteRoadmap(roadmapToDelete);
      setIsDeleteDialogOpen(false);
      setRoadmapToDelete(null);
    } catch (error) {
      console.error("Error in handleDeleteConfirm:", error);
      toast.error("Failed to delete roadmap.");
    }
  };

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

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem("currentRoadmap", JSON.stringify(roadmap));
    }
  }, [roadmap]);

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
          case 'easy':
            const easyMin = minPhases;
            const easyMax = Math.ceil(minPhases + range * 0.3);
            phaseRange = `${easyMin} to ${easyMax}`;
            break;
          case 'medium':
            const mediumMin = Math.ceil(minPhases + range * 0.3);
            const mediumMax = Math.ceil(minPhases + range * 0.6);
            phaseRange = `${mediumMin} to ${mediumMax}`;
            break;
          case 'hard':
            const hardMin = Math.ceil(minPhases + range * 0.6);
            const hardMax = Math.ceil(minPhases + range * 0.8);
            phaseRange = `${hardMin} to ${hardMax}`;
            break;
          case 'expert':
            const expertMin = Math.ceil(minPhases + range * 0.8);
            const expertMax = maxPhases;
            phaseRange = `${expertMin} to ${expertMax}`;
            break;
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
  "totalDuration": "Be completely realistic - multiple years if needed for mastery",
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
  const interruptGeneration = () => {
    isInterrupted.current = true;
    // Also pause the queue to prevent new items from being processed
    pauseQueue();
    // Clear any currently generating item
    setCurrentlyGenerating(null);
  };

  // Queue Management Functions
  const addToQueue = (queueItem) => {
    // Check if similar roadmap already exists in queue
    const existingInQueue = generationQueue.some(
      (item) =>
        item.objective?.trim().toLowerCase() ===
          queueItem.objective?.trim().toLowerCase() &&
        item.finalGoal?.trim().toLowerCase() ===
          queueItem.finalGoal?.trim().toLowerCase(),
    );

    if (!existingInQueue) {
      setGenerationQueue((prev) => [
        ...prev,
        { ...queueItem, status: "queued" },
      ]);
      if (!queueProcessingRef.current && !isQueuePaused) {
        processQueue();
      }
    }
  };

  const removeFromQueue = (itemId) => {
    // If this is the currently generating item, mark it for interruption
    if (
      currentlyGenerating &&
      (currentlyGenerating.id === itemId ||
        currentlyGenerating.roadmapId === itemId)
    ) {
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
    setIsQueuePaused(true);
    shouldPauseAfterCurrent.current = true;
  };

  const resumeQueue = () => {
    setIsQueuePaused(false);
    shouldPauseAfterCurrent.current = false;
    if (!queueProcessingRef.current && generationQueue.length > 0) {
      processQueue();
    }
  };

  const retryGeneration = async (roadmap) => {
    setCurrentlyGenerating({ name: roadmap.name, id: roadmap.id });
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

  // Process the generation queue
  const processQueue = useCallback(async () => {
    if (queueProcessingRef.current) {
      return; // Already processing
    }

    queueProcessingRef.current = true;

    while (generationQueue.length > 0 && !isInterrupted.current) {
      // Check if we should pause after current or if queue is paused
      if (isQueuePaused || shouldPauseAfterCurrent.current) {
        if (shouldPauseAfterCurrent.current) {
          setIsQueuePaused(true);
          shouldPauseAfterCurrent.current = false;
        }
        break;
      }
      const currentItem = generationQueue[0];

      // Check if the roadmap still exists before processing
      if (currentItem.roadmapId) {
        const roadmapExists = savedTimeplans.find(
          (r) => r.id === currentItem.roadmapId || r.sanitizedName === currentItem.roadmapId
        );
        if (!roadmapExists) {
          console.log(`Roadmap ${currentItem.roadmapId} no longer exists, removing from queue`);
          setGenerationQueue((prev) => prev.slice(1));
          continue;
        }
      }

      try {
        // Update item status to generating
        setGenerationQueue((prev) =>
          prev.map((item, index) =>
            index === 0 ? { ...item, status: "generating" } : item,
          ),
        );
        setCurrentlyGenerating({
          name: currentItem.name,
          id: currentItem.id,
          roadmapId: currentItem.roadmapId,
        });

        if (currentItem.isResume) {
          // Resume existing roadmap
          const roadmapToResume = savedTimeplans.find(
            (r) => r.id === currentItem.roadmapId,
          );
          if (roadmapToResume) {
            await generateRoadmap(true, roadmapToResume);
          } else {
            console.log(`Roadmap to resume ${currentItem.roadmapId} not found`);
          }
        } else {
          // Generate new roadmap
          await generateRoadmapForQueue(currentItem);
        }

        // Remove completed item from queue
        setGenerationQueue((prev) => prev.slice(1));
      } catch (error) {
        console.error("Queue generation error:", error);
        // Mark item as error and remove from queue
        setGenerationQueue((prev) => prev.slice(1));
        toast.error(`Failed to generate roadmap: ${currentItem.name}`);
      }

      // Check if we should pause or stop after this item
      if (isQueuePaused || shouldPauseAfterCurrent.current) {
        if (shouldPauseAfterCurrent.current) {
          setIsQueuePaused(true);
          shouldPauseAfterCurrent.current = false;
        }
        break;
      }

      // Yield to the event loop to allow UI updates and prevent freezing
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setCurrentlyGenerating(null);
    queueProcessingRef.current = false;
  }, [generationQueue, isQueuePaused, savedTimeplans]);

  // Generate roadmap specifically for queue items
  const generateRoadmapForQueue = async (queueItem) => {
    const originalObjective = objective;
    const originalFinalGoal = finalGoal;

    // Temporarily set objectives for generation
    setObjective(queueItem.objective);
    setFinalGoal(queueItem.finalGoal);

    try {
      await generateRoadmap(false, null);
    } finally {
      // Restore original objectives
      setObjective(originalObjective);
      setFinalGoal(originalFinalGoal);
    }
  };

  // Process queue when items exist and not paused
  useEffect(() => {
    if (generationQueue.length > 0 && !isQueuePaused) {
      processQueue();
    }
  }, [generationQueue, isQueuePaused, processQueue]);

  // Process queue when resuming from pause
  useEffect(() => {
    if (!isQueuePaused && generationQueue.length > 0) {
      processQueue();
    }
  }, [isQueuePaused, generationQueue, processQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isInterrupted.current = true;
      queueProcessingRef.current = false;
    };
  }, []);

  // --- MODIFIED FUNCTION ---
  // This function now correctly passes the roadmap ID between saves and handles queue pausing.
  // It also prevents duplicate roadmap generation
  const generateRoadmap = async (
    isContinuation = false,
    roadmapToContinue = null,
  ) => {
    if (!genAI) {
      alert("Please set your Gemini API key in the settings.");
      return;
    }

    // When creating a new roadmap, pause the queue, generate the initial roadmap, then add it to the queue and resume queue processing.
    if (!isContinuation) {
      pauseQueue();
      isInterrupted.current = false;
      setLoading(true);
      setError(null);
      localStorage.removeItem("currentRoadmap");
      setRoadmap(null); // Clear current roadmap state

      try {
        // Generate initial roadmap structure only (high-level plan)
        setLoadingMessage("Generating high-level plan...");
        const initialPrompt = createInitialPrompt();
        const initialJson = await (async (prompt) => {
          while (true) {
            if (isInterrupted.current)
              throw new Error("Generation interrupted by user.");

            const modelName = availableModels[currentModelIndex.current];
            try {
              setLoadingMessage(`Generating with ${modelName}...`);
              const generativeModel = genAI.getGenerativeModel({
                model: modelName,
              });
              const result = await generativeModel.generateContent(prompt);
              const response = await result.response;
              return parseJsonResponse(response.text());
            } catch (err) {
              if (isInterrupted.current) throw err;

              console.error(`Error with model ${modelName}:`, err);

              currentModelIndex.current =
                (currentModelIndex.current + 1) % availableModels.length;

              if (currentModelIndex.current === 0) {
                // Cycled through all models
                setLoadingMessage(
                  "All models failed. Please check your API key and model settings.",
                );
                throw new Error("All models failed");
              } else {
                setLoadingMessage(
                  `Switching to model ${availableModels[currentModelIndex.current]}...`,
                );
                continue;
              }
            }
          }
        })(initialPrompt);

        if (
          !initialJson ||
          !Array.isArray(initialJson.phases) ||
          initialJson.phases.length === 0
        ) {
          throw new Error(
            "The AI did not return a valid initial roadmap structure.",
          );
        }

        const newRoadmap = {
          ...initialJson,
          objective: objective,
          finalGoal: finalGoal,
          generationState: "in-progress",
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
        if (!savedRoadmap) throw new Error("Initial roadmap save failed.");
        setRoadmap(savedRoadmap);

        // Add to queue for detailed generation
        const queueItem = {
          id: savedRoadmap.id || Date.now(),
          roadmapId: savedRoadmap.id,
          name:
            savedRoadmap.title ||
            `${objective.slice(0, 50)}${objective.length > 50 ? "..." : ""}`,
          objective: savedRoadmap.objective,
          finalGoal: savedRoadmap.finalGoal,
          status: "queued",
          isResume: false,
          id: `${objective.trim().toLowerCase()}-${finalGoal.trim().toLowerCase()}`.replace(
            /[^a-z0-9]/g,
            "-",
          ),
        };
        addToQueue(queueItem);

        setLoading(false);
        setError(null);
        setLoadingMessage("");
        // Resume queue after initial roadmap creation
        setTimeout(() => resumeQueue(), 500);
        return;
      } catch (err) {
        setLoading(false);
        setError("Failed to generate roadmap: " + err.message);
        setLoadingMessage("");
        return;
      }
    }

    isInterrupted.current = false;
    setLoading(true);
    setError(null);
    if (!isContinuation) {
      localStorage.removeItem("currentRoadmap");
      setRoadmap(null); // Clear current roadmap state
    }

    const generateWithRetry = async (prompt) => {
      // ... (this inner function is unchanged)

      while (true) {
        if (isInterrupted.current)
          throw new Error("Generation interrupted by user.");

        const modelName = availableModels[currentModelIndex.current];
        try {
          setLoadingMessage(`Generating with ${modelName}...`);
          const generativeModel = genAI.getGenerativeModel({
            model: modelName,
          });
          const result = await generativeModel.generateContent(prompt);
          const response = await result.response;
          return parseJsonResponse(response.text());
        } catch (err) {
          if (isInterrupted.current) throw err;

          console.error(`Error with model ${modelName}:`, err);

          currentModelIndex.current =
            (currentModelIndex.current + 1) % availableModels.length;

          if (currentModelIndex.current === 0) {
            // Cycled through all models
            setLoadingMessage(
              "All models failed. Please check your API key and model settings.",
            );
            throw new Error("All models failed");
          } else {
            setLoadingMessage(
              `Switching to model ${availableModels[currentModelIndex.current]}...`,
            );
            continue;
          }
        }
      }
    };

    try {
      let currentRoadmap = null;

      if (isContinuation && roadmapToContinue) {
        currentRoadmap = roadmapToContinue;
      } else {
        if (!objective || !finalGoal) {
          throw new Error("Please provide both an objective and a final goal.");
        }
        setLoadingMessage("Generating high-level plan...");
        const initialPrompt = createInitialPrompt();
        const initialJson = await generateWithRetry(initialPrompt);

        if (
          !initialJson ||
          !Array.isArray(initialJson.phases) ||
          initialJson.phases.length === 0
        ) {
          throw new Error(
            "The AI did not return a valid initial roadmap structure.",
          );
        }

        const newRoadmap = {
          ...initialJson,
          objective: objective,
          finalGoal: finalGoal,
          generationState: "in-progress",
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
        // Capture the returned roadmap (with ID) and pass its ID on the next save.
        const savedRoadmap = await saveRoadmapToDisk(
          newRoadmap,
          newRoadmap.title || `Roadmap-${Date.now()}`,
        );
        if (!savedRoadmap) throw new Error("Initial roadmap save failed.");
        currentRoadmap = savedRoadmap;

        // Resume queue after initial roadmap creation if it wasn't paused originally
        if (!isContinuation && !queueProcessingRef.current && !wasQueuePaused) {
          setTimeout(() => resumeQueue(), 1000);
        }
      }

      const startIndex = currentRoadmap.phases.findIndex(
        (p) => p.goal === "...",
      );
      if (startIndex === -1) {
        currentRoadmap.generationState = "completed";
        await saveRoadmapToDisk(currentRoadmap, currentRoadmap.title);
        setLoading(false);
        return;
      }

      let accumulatingRoadmap = { ...currentRoadmap };

      for (let i = startIndex; i < accumulatingRoadmap.phases.length; i++) {
        if (isInterrupted.current) {
          console.log("Generation interrupted by user.");
          accumulatingRoadmap = {
            ...accumulatingRoadmap,
            generationState: "in-progress",
          };
          await saveRoadmapToDisk(
            accumulatingRoadmap,
            accumulatingRoadmap.title,
          );
          break;
        }

        // Check if roadmap still exists before continuing generation
        const roadmapStillExists = savedTimeplans.find(
          (r) => r.id === accumulatingRoadmap.id || r.sanitizedName === accumulatingRoadmap.sanitizedName
        );
        if (!roadmapStillExists) {
          console.log("Roadmap was deleted during generation, stopping.");
          setError("Roadmap was deleted during generation.");
          break;
        }

        const phase = accumulatingRoadmap.phases[i];
        setLoadingMessage(
          `Generating details for phase ${i + 1}/${accumulatingRoadmap.phases.length}: ${phase.title}`,
        );
        const phaseJson = await generateWithRetry(
          createPhaseDetailPrompt(phase.title),
        );

        if (isInterrupted.current) {
          console.log("Generation interrupted by user after fetch.");
          // NOTE: The AI request cannot be truly aborted, only ignored after completion.
          // The UI should inform the user that interruption will take effect after the current phase/request.
          accumulatingRoadmap = {
            ...accumulatingRoadmap,
            generationState: "in-progress",
          };
          await saveRoadmapToDisk(
            accumulatingRoadmap,
            accumulatingRoadmap.title,
          );
          break;
        }

        // Double-check roadmap existence after API call
        const roadmapStillExistsAfterCall = savedTimeplans.find(
          (r) => r.id === accumulatingRoadmap.id || r.sanitizedName === accumulatingRoadmap.sanitizedName
        );
        if (!roadmapStillExistsAfterCall) {
          console.log("Roadmap was deleted during API call, stopping.");
          setError("Roadmap was deleted during generation.");
          break;
        }

        const newPhases = [...accumulatingRoadmap.phases];
        newPhases[i] = initializePhaseDetails(
          { ...newPhases[i], ...phaseJson },
          i,
        );
        accumulatingRoadmap = { ...accumulatingRoadmap, phases: newPhases };

        // This is the crucial part: save the updated roadmap and get back the
        // latest version from the server, which is then used in the next iteration.
        const savedStep = await saveRoadmapToDisk(
          accumulatingRoadmap,
          accumulatingRoadmap.title,
        );
        if (!savedStep)
          throw new Error("Failed to save roadmap progress during loop.");
        accumulatingRoadmap = savedStep;
      }

      if (!isInterrupted.current) {
        accumulatingRoadmap.generationState = "completed";
        await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
      }

      if (setActiveTab && !isInterrupted.current) {
        setActiveTab("view");
      }
    } catch (err) {
      if (err.message.includes("interrupted by user")) {
        console.log("Caught user interruption. Halting generation.");
        setError(null);
      } else {
        console.error("Error generating roadmap:", err);
        setError("Failed to generate roadmap: " + err.message);
      }
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

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
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    retryGeneration,
  };
};

export default useRoadmap;
