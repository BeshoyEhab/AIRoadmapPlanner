/**
 * Hook for managing roadmap generation with enhanced features
 */

import { useState, useCallback } from "react";
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

export function useRoadmapGeneration() {
  const { hasValidApiKey } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(0);

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

      try {
        setIsGenerating(true);
        setProgress(0);
        setCurrentStep("Analyzing prerequisites...");

        // Step 1: Generate prerequisites (20% progress)
        const prerequisites = await generatePrerequisites({
          field,
          targetLevel,
        });
        setProgress(20);

        // Step 2: Generate base roadmap content (40% progress)
        setCurrentStep("Generating roadmap content...");
        await generateRoadmapContent({
          field,
          targetLevel,
          prerequisites,
          timeConstraint,
          preferences: userPreferences,
        });
        setProgress(40);

        // Step 3: Generate enhanced roadmap structure (60% progress)
        setCurrentStep("Structuring learning path...");
        const roadmap = await generateRoadmap({
          field,
          targetLevel,
          timeConstraint,
          userPreferences,
          prerequisites,
          existingSkills,
        });
        setProgress(60);

        // Step 4: Generate recommendations (80% progress)
        setCurrentStep("Generating recommendations...");
        const recommendations = await generateRecommendations({
          field,
          targetLevel,
          roadmapContent: roadmap,
        });
        setProgress(80);

        // Step 5: Validate and finalize (100% progress)
        setCurrentStep("Finalizing roadmap...");
        const finalRoadmap = {
          ...roadmap,
          recommendations,
          metadata: {
            ...roadmap.metadata,
            generatedAt: new Date().toISOString(),
            version: "2.0",
          },
        };

        const validation = validateRoadmap(finalRoadmap);
        if (!validation.valid) {
          throw new Error(
            "Roadmap validation failed: " + validation.errors.join(", "),
          );
        }

        setProgress(100);
        toast.success("Roadmap generated successfully!");
        return finalRoadmap;
      } catch (error) {
        console.error("Error generating roadmap:", error);
        toast.error("Failed to generate roadmap: " + error.message);
        return null;
      } finally {
        setIsGenerating(false);
        setCurrentStep(null);
        setProgress(0);
      }
    },
    [hasValidApiKey],
  );

  return {
    generateEnhancedRoadmap,
    isGenerating,
    currentStep,
    progress,
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
