import { useCallback, useState } from "react";

export const useRoadmapActions = ({
  roadmap,
  setRoadmap,
  removeFromQueue,
  addToQueue,
  interruptGeneration,
  generateRoadmap,
  objective,
  finalGoal,
  setObjective,
  setFinalGoal,
  setActiveTab,
  generationQueue = [],
}) => {
  /**
   * Pauses the roadmap generation
   * @param {Object} roadmap - The roadmap to pause
   */
  const [isPaused, setIsPaused] = useState(false);

  const handlePause = useCallback(
    async (roadmap) => {
      if (!roadmap) return;

      try {
        // First interrupt any ongoing generation
        if (typeof interruptGeneration === "function") {
          interruptGeneration();
        }

        // Then remove from queue
        if (typeof removeFromQueue === "function") {
          removeFromQueue(roadmap.id);
        }

        // Mark as paused and update state
        const pausedRoadmap = {
          ...roadmap,
          generationState: "paused",
          pausedAt: new Date().toISOString(),
        };

        if (typeof setRoadmap === "function") {
          setRoadmap(pausedRoadmap);
          setIsPaused(true);
        }

        // Save to localStorage
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("currentRoadmap", JSON.stringify(pausedRoadmap));
        }
      } catch (error) {
        console.error("Error pausing roadmap generation:", error);
      }
    },
    [removeFromQueue, setRoadmap, interruptGeneration],
  );

  /**
   * Resumes the roadmap generation
   * @param {Object} roadmap - The roadmap to resume
   */
  const handleResume = useCallback(
    (roadmap) => {
      if (!roadmap) return;

      // Ensure we have the required data from the roadmap
      const roadmapObjective = roadmap.objective || "Continue learning roadmap";
      const roadmapFinalGoal = roadmap.finalGoal || "Complete the learning objectives";
      
      // Update form state with roadmap data if needed
      if (setObjective && roadmapObjective && (!objective || objective.trim() === '')) {
        setObjective(roadmapObjective);
      }
      if (setFinalGoal && roadmapFinalGoal && (!finalGoal || finalGoal.trim() === '')) {
        setFinalGoal(roadmapFinalGoal);
      }

      // Calculate pause duration if available
      const resumeData = {
        ...roadmap,
        objective: roadmapObjective,
        finalGoal: roadmapFinalGoal,
        generationState: "in-progress",
        lastResumedAt: new Date().toISOString(),
      };

      // Clear pause-related fields
      delete resumeData.pausedAt;

      // Create queue item for resuming
      const queueItem = {
        id: roadmap.id || Date.now(),
        name: roadmap.title || "Resumed Roadmap",
        objective: roadmapObjective,
        finalGoal: roadmapFinalGoal,
        status: "queued",
        isResume: true,
        roadmapId: roadmap.id,
        resumeData,
      };

      try {
        // Update the roadmap state first
        if (typeof setRoadmap === "function") {
          setRoadmap(resumeData);
          setIsPaused(false);
        }

        // Add to queue
        if (typeof addToQueue === "function") {
          // If the roadmap is already in the queue, remove it first
          if (generationQueue.some(item => item.roadmapId === roadmap.id)) {
            removeFromQueue(roadmap.id);
          }
          addToQueue(queueItem);
        }

        // Save to localStorage
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("currentRoadmap", JSON.stringify(resumeData));
        }

        // Switch to view tab
        if (typeof setActiveTab === "function") {
          setActiveTab("view");
        }
      } catch (error) {
        console.error("Error resuming roadmap generation:", error);
      }

      // Update state to reflect resuming
      if (typeof setRoadmap === "function") {
        setRoadmap({
          ...roadmap,
          generationState: "in-progress",
        });
      }

      // Update localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(
          "currentRoadmap",
          JSON.stringify({
            ...roadmap,
            generationState: "in-progress",
          }),
        );
      }

      // Switch to view tab
      if (typeof setActiveTab === "function") {
        setActiveTab("view");
      }
    },
    [addToQueue, setRoadmap, setActiveTab, setObjective, setFinalGoal, objective, finalGoal, removeFromQueue, generationQueue],
  );

  /**
   * Checks if a similar roadmap exists
   * @param {string} objective - The learning objective
   * @param {string} finalGoal - The final goal
   * @returns {Object|null} The existing roadmap if found, null otherwise
   */
  const findSimilarRoadmap = useCallback((objective, finalGoal) => {
    if (!objective || !finalGoal) return null;

    // Normalize text for comparison
    const normalizedObjective = objective.trim().toLowerCase();
    const normalizedFinalGoal = finalGoal.trim().toLowerCase();

    // Check in the current roadmap
    if (roadmap?.objective && roadmap?.finalGoal) {
      const currentObjective = roadmap.objective.trim().toLowerCase();
      const currentGoal = roadmap.finalGoal.trim().toLowerCase();
      
      if (currentObjective === normalizedObjective && 
          currentGoal === normalizedFinalGoal) {
        return { ...roadmap, isCurrent: true };
      }
    }

    // Check in the generation queue
    const existingInQueue = generationQueue?.find((item) => {
      if (!item.objective || !item.finalGoal) return false;
      
      const itemObjective = item.objective.trim().toLowerCase();
      const itemGoal = item.finalGoal.trim().toLowerCase();
      
      return (
        itemObjective === normalizedObjective &&
        itemGoal === normalizedFinalGoal
      );
    });

    return existingInQueue || null;
  }, [generationQueue, roadmap]);

  /**
   * Creates a new roadmap and adds it to the queue without starting generation
   * @param {string} objective - The learning objective
   * @param {string} finalGoal - The final goal
   * @returns {boolean} True if successful, false otherwise
   */
  const generateNewRoadmap = useCallback(async (objective, finalGoal) => {
    try {
      if (!objective || !finalGoal) {
        console.error('Objective and final goal are required');
        return false;
      }

      // Generate a unique ID
      const uniqueId = `roadmap-${Date.now()}`;
      
      // Create initial roadmap structure
      const initialRoadmap = {
        id: uniqueId,
        title: `Roadmap for ${objective}`,
        objective,
        finalGoal,
        generationState: 'queued',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: [],
        totalDuration: "Calculating...",
        difficultyLevel: "To be determined"
      };

      // Create queue item
      const queueItem = {
        id: uniqueId,
        name: `Roadmap for ${objective}`,
        objective,
        finalGoal,
        status: "queued",
        roadmapId: uniqueId,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage first
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('currentRoadmap', JSON.stringify(initialRoadmap));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }
      }

      // Set the roadmap state
      if (typeof setRoadmap === 'function') {
        setRoadmap(initialRoadmap);
      }
      
      // Add to queue
      if (typeof addToQueue === 'function') {
        const added = addToQueue(queueItem);
        if (!added) {
          console.error('Failed to add to queue');
          // Update state to reflect the error
          if (typeof setRoadmap === 'function') {
            setRoadmap({
              ...initialRoadmap,
              generationState: 'error',
              error: 'Failed to add to generation queue'
            });
          }
          return false;
        }
      }

      // Switch to view tab after a short delay to allow state to update
      if (typeof setActiveTab === 'function') {
        setTimeout(() => {
          setActiveTab('view');
        }, 100);
      }

      return true;
    } catch (error) {
      console.error('Error in generateNewRoadmap:', error);
      // Reset loading state on error
      if (typeof setRoadmap === 'function') {
        setRoadmap(prev => ({
          ...prev,
          generationState: 'error',
          error: error.message || 'Failed to generate roadmap'
        }));
      }
      return false;
    }
  }, [addToQueue, setRoadmap, setActiveTab]);

  /**
   * Generates a new roadmap with duplicate checking
   * @param {string} objective - The learning objective
   * @param {string} finalGoal - The final goal
   * @param {boolean} force - Whether to force generation even if duplicate exists
   */
  const [duplicateRoadmapInfo, setDuplicateRoadmapInfo] = useState({
    show: false,
    objective: '',
    finalGoal: '',
    existingRoadmap: null
  });

  const handleGenerateNew = useCallback(
    async (objective, finalGoal, force = false) => {
      if (!objective || !finalGoal) return;

      // Check for similar roadmaps
      const similarRoadmap = findSimilarRoadmap(objective, finalGoal);
      
      if (similarRoadmap && !force) {
        // Store the duplicate info to show in the dialog
        setDuplicateRoadmapInfo({
          show: true,
          objective,
          finalGoal,
          existingRoadmap: similarRoadmap
        });
        return;
      }

      // If we get here, either no duplicate or force is true
      return generateNewRoadmap(objective, finalGoal);
    },
    [findSimilarRoadmap, generateNewRoadmap]
  );

  // Handle confirmation to replace existing roadmap
  const handleConfirmReplace = useCallback(() => {
    const { objective, finalGoal } = duplicateRoadmapInfo;
    setDuplicateRoadmapInfo({
      show: false,
      objective: '',
      finalGoal: '',
      existingRoadmap: null
    });
    
    // Force generation of new roadmap
    handleGenerateNew(objective, finalGoal, true);
  }, [duplicateRoadmapInfo, handleGenerateNew]);

  // Handle canceling the replace dialog
  const handleCancelReplace = useCallback(() => {
    setDuplicateRoadmapInfo({
      show: false,
      objective: '',
      finalGoal: '',
      existingRoadmap: null
    });
  }, []);

  return {
    handlePause,
    handleResume,
    handleGenerateNew,
    duplicateRoadmapInfo,
    handleConfirmReplace,
    handleCancelReplace
  };
};
