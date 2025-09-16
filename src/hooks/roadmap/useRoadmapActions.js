import { useCallback, useState } from "react";

export const useRoadmapActions = ({
  roadmap,
  setRoadmap,
  removeFromQueue,
  addToQueue,
  interruptGeneration,
  // generateRoadmap, // Available for future use
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
  // const [isPaused, setIsPaused] = useState(false); // State tracking, could be used for UI feedback

  const handlePause = useCallback(
    async (roadmap) => {
      if (!roadmap) {
        console.warn('[handlePause] No roadmap provided');
        return { success: false, error: 'No roadmap provided' };
      }

      console.log('[handlePause] Pausing roadmap:', roadmap.id);
      
      try {
        // Enhanced pause with better state management
        const pauseStartTime = new Date().toISOString();
        
        // First interrupt any ongoing generation
        if (typeof interruptGeneration === "function") {
          console.log('[handlePause] Interrupting generation');
          interruptGeneration('pause_request');
        }

        // Remove from queue with multiple ID checks
        if (typeof removeFromQueue === "function") {
          console.log('[handlePause] Removing from queue');
          removeFromQueue(roadmap.id);
          removeFromQueue(roadmap.sanitizedName);
          // Also check for queue items by roadmapId
          if (generationQueue && Array.isArray(generationQueue)) {
            generationQueue.forEach(item => {
              if (item.roadmapId === roadmap.id) {
                removeFromQueue(item.id);
              }
            });
          }
        }

        // Enhanced paused roadmap state
        const pausedRoadmap = {
          ...roadmap,
          generationState: "paused",
          pausedAt: pauseStartTime,
          lastActivity: pauseStartTime,
          pauseReason: 'user_requested',
          pauseContext: {
            completedPhases: roadmap.phases?.filter(p => p.goal !== '...')?.length || 0,
            totalPhases: roadmap.phases?.length || 0,
            lastCompletedPhase: roadmap.phases?.findIndex(p => p.goal === '...') - 1
          }
        };

        if (typeof setRoadmap === "function") {
          setRoadmap(pausedRoadmap);
          // setIsPaused(true); // Could be used for UI feedback
        }

        // Enhanced localStorage save with error handling
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            localStorage.setItem("currentRoadmap", JSON.stringify(pausedRoadmap));
            console.log('[handlePause] Roadmap saved to localStorage');
          } catch (localStorageError) {
            console.warn('[handlePause] Failed to save to localStorage:', localStorageError);
          }
        }

        console.log('[handlePause] Roadmap paused successfully');
        return { success: true, roadmap: pausedRoadmap };
        
      } catch (_error) {
        console.error("[handlePause] Error pausing roadmap generation:", _error);
        return { success: false, error: _error.message };
      }
    },
    [removeFromQueue, setRoadmap, interruptGeneration, generationQueue],
  );

  /**
   * Resumes the roadmap generation
   * @param {Object} roadmap - The roadmap to resume
   */
  const handleResume = useCallback(
    async (roadmap) => {
      if (!roadmap) {
        console.warn('[handleResume] No roadmap provided');
        return { success: false, error: 'No roadmap provided' };
      }

      console.log('[handleResume] Resuming roadmap:', roadmap.id, {
        currentState: roadmap.generationState,
        pausedAt: roadmap.pausedAt,
        completedPhases: roadmap.pauseContext?.completedPhases
      });

      try {
        // Enhanced resume with validation and recovery
        const resumeStartTime = new Date().toISOString();
        
        // Ensure we have the required data from the roadmap
        const roadmapObjective = roadmap.objective || "Continue learning roadmap";
        const roadmapFinalGoal = roadmap.finalGoal || "Complete the learning objectives";
        
        // Validate roadmap state
        if (!roadmap.phases || roadmap.phases.length === 0) {
          throw new Error('Roadmap has no phases to resume');
        }
        
        // Update form state with roadmap data if needed
        if (setObjective && roadmapObjective && (!objective || objective.trim() === '')) {
          setObjective(roadmapObjective);
        }
        if (setFinalGoal && roadmapFinalGoal && (!finalGoal || finalGoal.trim() === '')) {
          setFinalGoal(roadmapFinalGoal);
        }

        // Calculate resume context
        const incompletePhaseIndex = roadmap.phases.findIndex(p => p.goal === '...');
        const completedPhases = incompletePhaseIndex >= 0 ? incompletePhaseIndex : roadmap.phases.length;
        
        // Enhanced resume data with recovery information
        const resumeData = {
          ...roadmap,
          objective: roadmapObjective,
          finalGoal: roadmapFinalGoal,
          generationState: "in-progress",
          lastResumedAt: resumeStartTime,
          resumeContext: {
            resumedAt: resumeStartTime,
            pauseDuration: roadmap.pausedAt ? 
              Math.round((new Date(resumeStartTime) - new Date(roadmap.pausedAt)) / 1000 / 60) + ' minutes' : 
              'unknown',
            resumePoint: {
              phaseIndex: incompletePhaseIndex >= 0 ? incompletePhaseIndex : roadmap.phases.length - 1,
              phaseName: incompletePhaseIndex >= 0 ? roadmap.phases[incompletePhaseIndex].title : 'Complete',
              completedPhases,
              totalPhases: roadmap.phases.length
            }
          }
        };

        // Clear pause-related fields
        delete resumeData.pausedAt;
        delete resumeData.pauseReason;
        delete resumeData.pauseContext;

        // Enhanced queue item for resuming
        const queueItem = {
          id: `resume-${roadmap.id}-${Date.now()}`,
          name: roadmap.title || "Resumed Roadmap",
          objective: roadmapObjective,
          finalGoal: roadmapFinalGoal,
          status: "queued",
          isResume: true,
          roadmapId: roadmap.id,
          initialRoadmap: resumeData,
          priority: 'high', // Give resumed roadmaps higher priority
          resumeInfo: {
            originalPauseTime: roadmap.pausedAt,
            resumeTime: resumeStartTime,
            completedPhases
          }
        };

        // Update the roadmap state first
        if (typeof setRoadmap === "function") {
          setRoadmap(resumeData);
          // setIsPaused(false); // Could be used for UI feedback
        }

        // Clean up any existing queue items for this roadmap before adding new one
        if (typeof removeFromQueue === "function") {
          if (generationQueue && Array.isArray(generationQueue)) {
            generationQueue.forEach(item => {
              if (item.roadmapId === roadmap.id || item.id === roadmap.id) {
                console.log('[handleResume] Removing existing queue item:', item.id);
                removeFromQueue(item.id);
              }
            });
          }
        }

        // Add to queue with priority handling
        if (typeof addToQueue === "function") {
          const success = addToQueue(queueItem);
          if (!success) {
            throw new Error('Failed to add roadmap to generation queue');
          }
          console.log('[handleResume] Added to queue with priority');
        }

        // Enhanced localStorage save
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            localStorage.setItem("currentRoadmap", JSON.stringify(resumeData));
            console.log('[handleResume] Resume data saved to localStorage');
          } catch (localStorageError) {
            console.warn('[handleResume] Failed to save resume data to localStorage:', localStorageError);
          }
        }

        // Switch to view tab to show progress
        if (typeof setActiveTab === "function") {
          setActiveTab("view");
        }

        console.log('[handleResume] Roadmap resume initiated successfully', {
          resumePoint: resumeData.resumeContext.resumePoint,
          queueItemId: queueItem.id
        });
        
        return { 
          success: true, 
          roadmap: resumeData, 
          queueItem, 
          resumeInfo: resumeData.resumeContext 
        };
        
      } catch (_error) {
        console.error("[handleResume] Error resuming roadmap generation:", _error);
        
        // Attempt to restore previous state on error
        if (typeof setRoadmap === "function" && roadmap) {
          setRoadmap(roadmap);
        }
        
        return { success: false, error: _error.message };
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
        } catch (_e) {
          console.error('Error saving to localStorage:', _e);
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
    } catch (_error) {
      console.error('Error in generateNewRoadmap:', _error);
      // Reset loading state on error
      if (typeof setRoadmap === 'function') {
        setRoadmap(prev => ({
          ...prev,
          generationState: 'error',
          error: _error.message || 'Failed to generate roadmap'
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
