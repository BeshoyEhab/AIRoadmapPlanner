/**
 * Hook for managing roadmap generation with enhanced performance features
 * Includes caching, batching, and optimized AI requests
 */

import { useState, useCallback, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import {
  generateRoadmap,
  validateRoadmap,
} from "@/lib/roadmap/generation/roadmapGenerator";
import {
  generateRoadmapContent,
  generatePrerequisites,
  generateRecommendations,
} from "@/lib/api/openai";
import { toast } from "sonner";

// Performance optimization: Cache frequently used data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const generationCache = new Map();
const prerequisitesCache = new Map();

// Generate cache key for requests
const getCacheKey = (data) => {
  return JSON.stringify(data, Object.keys(data).sort());
};

// Get cached data if available and not expired
const getCachedData = (cacheMap, key) => {
  const cached = cacheMap.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  if (cached) {
    cacheMap.delete(key); // Remove expired cache
  }
  return null;
};

// Cache data with timestamp
const setCachedData = (cacheMap, key, data) => {
  cacheMap.set(key, {
    data,
    timestamp: Date.now()
  });
};

export function useRoadmapGeneration() {
  const { hasValidApiKey } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(0);

  const abortControllerRef = useRef(null);

  const generateEnhancedRoadmap = useCallback(
    async ({
      field,
      targetLevel,
      timeConstraint,
      userPreferences = {},
      existingSkills = {},
    }) => {
      if (!hasValidApiKey) {
        toast.error("Please add your OpenAI API key in settings first");
        return null;
      }

      // Create abort controller for this generation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setIsGenerating(true);
        setProgress(0);
        setCurrentStep("Analyzing prerequisites...");

        // Generate cache keys for optimization
        const prerequisitesKey = getCacheKey({ field, targetLevel });
        const roadmapKey = getCacheKey({ field, targetLevel, timeConstraint, userPreferences });

        // Step 1: Get prerequisites (with caching) - 20% progress
        let prerequisites = getCachedData(prerequisitesCache, prerequisitesKey);
        if (!prerequisites) {
          if (signal.aborted) return null;
          prerequisites = await generatePrerequisites({
            field,
            targetLevel,
          });
          setCachedData(prerequisitesCache, prerequisitesKey, prerequisites);
        }
        setProgress(20);

        if (signal.aborted) return null;

        // Step 2 & 3: Generate roadmap content and structure in parallel (60% progress)
        setCurrentStep("Generating roadmap structure...");
        
        // Parallel generation for better performance
        const [roadmapContent, roadmapStructure] = await Promise.all([
          generateRoadmapContent({
            field,
            targetLevel,
            prerequisites,
            timeConstraint,
            preferences: userPreferences,
          }),
          generateRoadmap({
            field,
            targetLevel,
            timeConstraint,
            userPreferences,
            prerequisites,
            existingSkills,
          })
        ]);
        setProgress(60);

        if (signal.aborted) return null;

        // Step 4: Generate recommendations (optimized) - 80% progress
        setCurrentStep("Generating recommendations...");
        const recommendations = await generateRecommendations({
          field,
          targetLevel,
          roadmapContent: roadmapStructure,
        });
        setProgress(80);

        if (signal.aborted) return null;

        // Step 5: Validate and finalize (100% progress)
        setCurrentStep("Finalizing roadmap...");
        const finalRoadmap = {
          ...roadmapStructure,
          content: roadmapContent,
          recommendations,
          metadata: {
            ...roadmapStructure.metadata,
            generatedAt: new Date().toISOString(),
            version: "2.1",
            performanceOptimized: true,
            cacheUsed: !!getCachedData(prerequisitesCache, prerequisitesKey)
          },
        };

        const validation = validateRoadmap(finalRoadmap);
        if (!validation.valid) {
          throw new Error(
            "Roadmap validation failed: " + validation.errors.join(", "),
          );
        }

        // Cache the complete roadmap for potential reuse
        setCachedData(generationCache, roadmapKey, finalRoadmap);

        setProgress(100);
        toast.success("Roadmap generated successfully! ⚡", {
          description: "Performance optimized with caching"
        });
        return finalRoadmap;
      } catch (_error) {
        if (_error.name === 'AbortError' || signal.aborted) {
          toast.info("Roadmap generation cancelled");
          return null;
        }
        console.error("Error generating roadmap:", _error);
        toast.error("Failed to generate roadmap: " + _error.message);
        return null;
      } finally {
        setIsGenerating(false);
        setCurrentStep(null);
        setProgress(0);
        abortControllerRef.current = null;
      }
    },
    [hasValidApiKey],
  );

  // Add function to cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Add function to clear cache for memory management
  const clearCache = useCallback(() => {
    generationCache.clear();
    prerequisitesCache.clear();
    toast.success("Generation cache cleared");
  }, []);

  return {
    generateEnhancedRoadmap,
    cancelGeneration,
    clearCache,
    isGenerating,
    currentStep,
    progress,
    cacheSize: generationCache.size + prerequisitesCache.size,
  };
}

/**
 * Progress step descriptions for different progress percentages
 */
export const PROGRESS_STEPS = {
  0: "Preparing to generate roadmap...",
  20: "Analyzing prerequisites...",
  40: "Generating roadmap content...",
  60: "Structuring learning path...",
  80: "Generating recommendations...",
  100: "Finalizing roadmap...",
};
