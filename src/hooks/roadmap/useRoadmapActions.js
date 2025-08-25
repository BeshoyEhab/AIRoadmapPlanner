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

      // Calculate pause duration if available
      const resumeData = {
        ...roadmap,
        generationState: "in-progress",
        lastResumedAt: new Date().toISOString(),
      };

      // Clear pause-related fields
      delete resumeData.pausedAt;

      // Create queue item for resuming
      const queueItem = {
        id: roadmap.id || Date.now(),
        name: roadmap.title || "Resumed Roadmap",
        objective: roadmap.objective || "Resumed Roadmap",
        finalGoal: roadmap.finalGoal || "",
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
    [addToQueue, setRoadmap, setActiveTab],
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
   * Handles the actual roadmap generation
   */
  const generateNewRoadmap = useCallback(async (objective, finalGoal) => {
    try {
      // Generate a unique ID based on content
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a new roadmap object
      const newRoadmap = {
        id: uniqueId,
        objective,
        finalGoal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        generationState: 'queued',
      };

      // Add to queue
      if (typeof addToQueue === 'function') {
        addToQueue(newRoadmap);
      }

      // Clear form
      if (typeof setObjective === 'function') setObjective('');
      if (typeof setFinalGoal === 'function') setFinalGoal('');
      
      // Switch to view tab
      if (typeof setActiveTab === 'function') {
        setActiveTab('view');
      }

      return true;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return false;
    }
  }, [addToQueue, setObjective, setFinalGoal, setActiveTab]);

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
