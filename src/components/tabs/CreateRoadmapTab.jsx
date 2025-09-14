import React from "react";
import {
  Brain,
  Sparkles,
  Loader,
  AlertCircle,
  Play,
  Target,
  Lightbulb,
  Rocket,
  Plus,
  Clock,
  AlertTriangle,
  X,
  Check,
  GraduationCap,
  BookOpen,
  Star,
} from "lucide-react";
import { useRoadmapActions } from "../../hooks/roadmap/useRoadmapActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CreateRoadmapTab = ({
  objective,
  setObjective,
  finalGoal,
  setFinalGoal,
  startingLevel,
  setStartingLevel,
  generateRoadmap,
  loading,
  loadingMessage,
  error,
  roadmap,
  addToQueue,
  removeFromQueue,
  setActiveTab,
  generationQueue = [], // Provide default value
  setRoadmap,
  interruptGeneration
}) => {
  const isResumable = roadmap && roadmap.generationState === "in-progress";

  const {
    handleGenerateNew,
    handleResume,
    duplicateRoadmapInfo,
    handleConfirmReplace,
    handleCancelReplace,
  } = useRoadmapActions({
    roadmap,
    addToQueue,
    generateRoadmap,
    setObjective,
    setFinalGoal,
    setActiveTab,
    generationQueue,
    setRoadmap,
    removeFromQueue,
    interruptGeneration
  });

  // Enhanced handleGenerate function - supports objective OR finalGoal
  const handleGenerate = async () => {
    console.log('handleGenerate called');
    
    // Check if we have at least one of objective or finalGoal
    const hasObjective = objective.trim();
    const hasFinalGoal = finalGoal.trim();
    
    if (!hasObjective && !hasFinalGoal) {
      console.log('Missing both objective and final goal');
      toast.error("Please provide either a learning objective or a final goal");
      return;
    }

    try {
      console.log('Clearing previous roadmap');
      // Clear any previous roadmap
      setRoadmap(null);
      
      // Create a unique ID for the new roadmap
      const roadmapId = `roadmap-${Date.now()}`;
      console.log('Created roadmap ID:', roadmapId);
      
      // Create initial roadmap structure - this will be passed to the queue
      const roadmapTitle = hasObjective 
        ? `Roadmap for ${objective}` 
        : `Achieve ${finalGoal}`;
        
      const initialRoadmap = {
        id: roadmapId,
        title: roadmapTitle,
        objective: hasObjective ? objective : `Learn towards: ${finalGoal}`,
        finalGoal: hasFinalGoal ? finalGoal : `Master: ${objective}`,
        startingLevel: startingLevel || "Beginner",
        generationState: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: [], // Empty initially - will be populated by AI
        totalDuration: "Calculating...",
        difficultyLevel: "To be determined"
      };
      
      // Set the initial roadmap in the UI immediately
      console.log('Setting initial roadmap:', initialRoadmap);
      setRoadmap(initialRoadmap);
      
      // Create queue item with the initialRoadmap
      const queueItem = {
        id: roadmapId,
        name: roadmapTitle,
        objective: initialRoadmap.objective,
        finalGoal: initialRoadmap.finalGoal,
        startingLevel: initialRoadmap.startingLevel,
        status: "queued",
        roadmapId: roadmapId,
        createdAt: new Date().toISOString(),
        initialRoadmap: initialRoadmap // Pass the initial roadmap to the queue
      };
      
      console.log('Adding to queue:', queueItem);
      
      // Add to queue
      const result = addToQueue(queueItem);
      console.log('addToQueue result:', result);
      
      if (result) {
        // Switch to the ongoing tab to show progress
        console.log('Switching to ongoing tab');
        setActiveTab("ongoing");
        
        console.log('Showing success toast');
        toast.success("Roadmap generation started! Check the 'Ongoing' tab for progress.");
      } else {
        // If adding to queue failed, reset the roadmap
        setRoadmap(null);
        toast.error("Failed to add roadmap to generation queue");
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setRoadmap(null);
      toast.error(`Failed to start roadmap generation: ${error.message}`);
    }
  };

  // Render the duplicate confirmation dialog
  const renderDuplicateDialog = () => {
    if (!duplicateRoadmapInfo.show) return null;

    const { existingRoadmap, objective, finalGoal } = duplicateRoadmapInfo;
    const isCurrent = existingRoadmap?.isCurrent;

    return (
      <Dialog open={duplicateRoadmapInfo.show} onOpenChange={handleCancelReplace}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Similar Roadmap Found</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {isCurrent 
                ? "You already have a roadmap with the same objective and goal. "
                : "A similar roadmap is already in the generation queue. "
              }
              Would you like to replace it with a new one?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                {existingRoadmap?.objective}
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {existingRoadmap?.finalGoal}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelReplace}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Keep Existing
            </Button>
            <Button
              onClick={handleConfirmReplace}
              className="gap-2 bg-yellow-600 hover:bg-yellow-700"
            >
              <Check className="h-4 w-4" />
              Generate New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-border mb-6">
            <Brain className="text-foreground" size={32} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            AI Study Roadmap Planner
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your learning journey with AI-powered personalized
            roadmaps. Define your goals and let our intelligent system create a
            comprehensive study plan tailored just for you.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={24} />
              <h2 className="text-xl font-semibold">
                Create Your Learning Path
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Provide your learning objective OR final goal (or both) to generate a
              detailed, actionable roadmap tailored to your starting level
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Learning Objective Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-border">
                  <Target
                    className="text-foreground"
                    size={18}
                  />
                </div>
                <div>
                  <label
                    htmlFor="objective"
                    className="block text-lg font-semibold text-foreground"
                  >
                    Your Learning Objective
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional if you have a final goal)</span>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    What do you want to learn or master?
                  </p>
                </div>
              </div>

              <textarea
                id="objective"
                className="w-full px-4 py-3 border border-border rounded-lg
                         focus:ring-2 focus:ring-primary focus:border-primary
                         bg-transparent text-foreground
                         placeholder-muted-foreground
                         transition-all duration-200 resize-none"
                rows="4"
                placeholder="Example: Master Data Science fundamentals to analyze complex datasets and build predictive models"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lightbulb size={14} />
                <span>Be specific about what you want to learn and why</span>
              </div>
            </div>

            {/* Final Goal Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-border">
                  <Rocket
                    className="text-foreground"
                    size={18}
                  />
                </div>
                <div>
                  <label
                    htmlFor="finalGoal"
                    className="block text-lg font-semibold text-foreground"
                  >
                    Your Concrete Final Goal
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional if you have an objective)</span>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    What specific project or outcome do you want to achieve?
                  </p>
                </div>
              </div>

              <textarea
                id="finalGoal"
                className="w-full px-4 py-3 border border-border rounded-lg
                         focus:ring-2 focus:ring-primary focus:border-primary
                         bg-transparent text-foreground
                         placeholder-muted-foreground
                         transition-all duration-200 resize-none"
                rows="4"
                placeholder="Example: Develop an end-to-end machine learning project for predicting stock prices with 85% accuracy"
                value={finalGoal}
                onChange={(e) => setFinalGoal(e.target.value)}
              />

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lightbulb size={14} />
                <span>Include measurable outcomes and deliverables</span>
              </div>
            </div>

            {/* Starting Level Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-border">
                  <GraduationCap
                    className="text-foreground"
                    size={18}
                  />
                </div>
                <div>
                  <label
                    htmlFor="startingLevel"
                    className="block text-lg font-semibold text-foreground"
                  >
                    Your Starting Level & Prerequisites
                  </label>
                  <p className="text-sm text-muted-foreground">
                    What's your current knowledge level and what do you already know?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { value: 'Absolute Beginner', label: 'Complete Beginner', icon: BookOpen, desc: 'Starting from scratch' },
                  { value: 'Beginner', label: 'Some Basics', icon: Star, desc: 'Know fundamental concepts' },
                  { value: 'Intermediate', label: 'Intermediate', icon: Target, desc: 'Have some experience' },
                ].map((level) => {
                  const Icon = level.icon;
                  const isSelected = startingLevel === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setStartingLevel(level.value)}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 text-left relative group overflow-hidden ${
                        isSelected
                          ? 'border-primary text-primary transform scale-105'
                          : 'border-border hover:border-primary/50 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-3 rounded-lg transition-all duration-300 ${
                            isSelected ? 'border border-primary/50' : 'border border-border'
                          }`}>
                            <Icon size={20} className={`transition-all duration-300 ${
                              isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <span className={`font-semibold text-base block transition-all duration-300 ${
                              isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                            }`}>{level.label}</span>
                            <p className={`text-sm mt-1 transition-all duration-300 ${
                              isSelected ? 'text-primary/80' : 'text-muted-foreground group-hover:text-primary/80'
                            }`}>{level.desc}</p>
                          </div>
                        </div>
                      </div>
                      
                    </button>
                  );
                })}
              </div>

              <textarea
                id="startingLevel"
                className="w-full px-4 py-3 border border-border rounded-lg
                         focus:ring-2 focus:ring-primary focus:border-primary
                         bg-transparent text-foreground
                         placeholder-muted-foreground
                         transition-all duration-200 resize-none"
                rows="3"
                placeholder="Describe what you already know, previous experience, tools you're familiar with, or any specific areas you want to focus on..."
                value={startingLevel}
                onChange={(e) => setStartingLevel(e.target.value)}
              />

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lightbulb size={14} />
                <span>This helps AI create a roadmap perfectly suited to your current skill level</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              {isResumable && !loading && (
                <div className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-foreground mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">
                      Incomplete Roadmap Detected
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You have a partially generated roadmap. You can resume
                    generation or start fresh.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {isResumable && !loading && (
                    <button
                      onClick={handleResume}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6
                               rounded-lg transition-all duration-300
                               flex items-center justify-center gap-2"
                    >
                      <Play size={20} />
                      Resume Generation
                    </button>
                  )}

                  <button
                    onClick={handleGenerate}
                    className={`${isResumable && !loading ? "flex-1" : "w-full"} bg-primary hover:bg-primary/90
                             text-primary-foreground font-semibold py-3 px-6 rounded-lg
                             transition-all duration-300
                             flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={!objective.trim() && !finalGoal.trim()}
                  >
                    {loading ? (
                      <>
                        <Plus size={20} />
                        Add to Queue
                      </>
                    ) : (
                      <>
                        <Brain size={20} />
                        {isResumable ? "Start Fresh" : "Generate Roadmap"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              {loading && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 border border-border rounded-full flex items-center justify-center">
                        <Loader
                          className="animate-spin text-foreground"
                          size={18}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {loadingMessage ||
                          "Generating your personalized roadmap..."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generation in progress. Click "Generate Roadmap" again
                        to add more to queue.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full animate-pulse"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 border border-border rounded-full flex items-center justify-center">
                        <AlertCircle
                          className="text-foreground"
                          size={18}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        Generation Failed
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border text-center">
            <div className="w-8 h-8 border border-border rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles
                className="text-foreground"
                size={16}
              />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              AI Powered
            </h3>
            <p className="text-xs text-muted-foreground">
              Personalized learning paths designed for you
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border text-center">
            <div className="w-8 h-8 border border-border rounded-lg flex items-center justify-center mx-auto mb-2">
              <Brain className="text-foreground" size={16} />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Instant Generation
            </h3>
            <p className="text-xs text-muted-foreground">
              Generate immediately and pause other work
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border text-center">
            <div className="w-8 h-8 border border-border rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="text-foreground" size={16} />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Smart Queue
            </h3>
            <p className="text-xs text-muted-foreground">
              Auto-queues when busy, generates immediately when free
            </p>
          </div>
        </div>

        {/* Render the duplicate dialog */}
        {renderDuplicateDialog()}
      </div>
    </div>
  );
};

export default CreateRoadmapTab;
