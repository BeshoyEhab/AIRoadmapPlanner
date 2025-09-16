import React from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Trash2,
  Search,
  FolderOpen,
  Plus,
  Star,
  RefreshCw,
  Brain,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const SavedPlansTab = ({
  savedTimeplans,
  loadRoadmap,
  deleteRoadmap,
  setActiveTab,
  toggleFavorite,
  isFavorite,
  addToQueue,
  setObjective,
  setFinalGoal,
  setRoadmap,
  generationQueue,
}) => {

  const handleRegenerateRoadmap = async (timeplan) => {
    try {
      // Set the form values
      setObjective(timeplan.objective || "");
      setFinalGoal(timeplan.finalGoal || "");

      // Clear current roadmap
      setRoadmap(null);

      // Create a new roadmap ID
      const newRoadmapId = `roadmap-${Date.now()}`;

      // Create initial roadmap structure
      const initialRoadmap = {
        id: newRoadmapId,
        objective: timeplan.objective,
        finalGoal: timeplan.finalGoal,
        generationState: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: [], // Empty - will be populated by AI
        totalDuration: "Calculating...",
        difficultyLevel: "To be determined",
      };

      // Set the initial roadmap in UI
      setRoadmap(initialRoadmap);

      // Create queue item
      const queueItem = {
        id: newRoadmapId,
        name: `Regenerating: ${timeplan.name}`,
        objective: timeplan.objective,
        finalGoal: timeplan.finalGoal,
        status: "queued",
        roadmapId: newRoadmapId,
        createdAt: new Date().toISOString(),
        initialRoadmap: initialRoadmap,
        isRegeneration: true,
        originalRoadmapId: timeplan.id, // Track the original for reference
      };

      // Add to queue
      const result = addToQueue(queueItem);

      if (result) {
        // Switch to ongoing tab to show progress
        setActiveTab("ongoing");
        toast.success(
          `Regenerating "${timeplan.name}"! Check the 'Ongoing' tab for progress.`,
        );
      } else {
        setRoadmap(null);
        toast.error("Failed to start roadmap regeneration");
      }
    } catch (_error) {
      console.error("Error regenerating roadmap:", _error);
      toast.error(`Failed to regenerate roadmap: ${_error.message}`);
    }
  };

  // Check if a roadmap is currently being regenerated
  const isRegenerating = (timeplanId) => {
    return generationQueue.some(
      (item) => item.isRegeneration && item.originalRoadmapId === timeplanId,
    );
  };

  const renderRoadmapCard = (timeplan) => {
    const isCurrentlyRegenerating = isRegenerating(timeplan.id);
    const isCompleted = timeplan.generationState === "completed";
    const isInProgress = timeplan.generationState === "in-progress" || timeplan.generationState === "queued";

    return (
      <div
        key={timeplan.id}
        className="relative group backdrop-blur-xl bg-card/80 border border-border/50 rounded-xl overflow-hidden
                   hover:border-primary/50 hover:bg-card/90
                   transition-all duration-300 ease-out cursor-pointer
                   hover:scale-[1.02]
                   before:absolute before:inset-0 before:bg-gradient-to-br 
                   before:from-white/10 before:via-transparent before:to-black/5
                   before:pointer-events-none before:rounded-xl"
        onClick={() => {
          loadRoadmap(timeplan.id);
          setActiveTab("view");
        }}
      >
        {/* Completion Flag */}
        {isCompleted && (
          <div className="absolute bottom-15 left-2 z-20">
            <div className="bg-success text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <Check className="w-3 h-3" />
              Complete
            </div>
          </div>
        )}
        
        {/* In Progress Flag */}
        {isInProgress && (
          <div className="absolute bottom-15 left-2 z-20">
            <div className="bg-info text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3 h-3" />
              In Progress
            </div>
          </div>
        )}
        
        {/* Favorite Star - Floating */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(timeplan.id);
            }}
            className={`p-2 rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
              isFavorite(timeplan.id)
                ? "bg-amber-500 border-amber-400 text-amber-600"
                : "bg-background border-border text-muted-foreground hover:border-primary hover:text-theme-primary hover:bg-primary"
            }`}
            title={isFavorite(timeplan.id) ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite(timeplan.id) ? (
              <Star className="w-4 h-4 fill-current" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Card Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-primary/30 transition-all duration-300">
                <Brain className="w-7 h-7 text-theme-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-main foreground group-hover:text-theme-primary transition-colors duration-200">
                    {timeplan.title || timeplan.name}
                  </h3>
                </div>
                {timeplan.objective && (
                  <p className="text-sm text-theme-secondary line-clamp-2 leading-relaxed">
                    {timeplan.objective}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center group/stat">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-primary/15 backdrop-blur-sm border border-primary/20 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 group-hover/stat:scale-105 group-hover:bg-primary/25">
                  <Calendar className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
              <div className="relative">
                <p className="text-2xl font-bold text-card-foreground mb-1">
                  {timeplan.phases?.length || 0}
                </p>
                <p className="text-xs font-medium text-main uppercase tracking-wider">
                  Phases
                </p>
              </div>
            </div>

            <div className="text-center group/stat">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-success/15 backdrop-blur-sm border border-success/20 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 group-hover/stat:scale-105 group-hover:bg-success/25">
                  <Clock className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="relative">
                <p className="text-xl font-bold text-card-foreground mb-1">
                  {timeplan.totalDuration || "N/A"}
                </p>
                <p className="text-xs font-medium text-main uppercase tracking-wider">
                  Duration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer - Action Buttons */}
        <div className="border-t border-border/50 bg-muted/20 backdrop-blur-sm">
          <div className="grid grid-cols-2">
            {/* Regenerate Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerateRoadmap(timeplan);
              }}
              disabled={isCurrentlyRegenerating}
              className="group/regenerate relative p-4 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-success/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={16}
                className={`transition-all duration-200 ${
                  isCurrentlyRegenerating
                    ? "animate-spin text-theme-primary"
                    : "text-theme-secondary group-hover/regenerate:text-success"
                }`}
              />
              <span className={`text-sm font-medium transition-colors duration-200 ${
                isCurrentlyRegenerating
                  ? "text-theme-primary"
                  : "text-main group-hover/regenerate:text-success"
              }`}>
                {isCurrentlyRegenerating ? "Regenerating..." : "Regenerate"}
              </span>
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteRoadmap(timeplan.id);
              }}
              className="group/delete relative p-4 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-destructive/10 border-l border-border"
            >
              <Trash2
                size={16}
                className="text-red-400 group-hover/delete:text-red-600 transition-colors duration-200"
              />
              <span className="text-sm font-medium text-red-400 group-hover/delete:text-red-600 transition-colors duration-200">
                Delete
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (savedTimeplans.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Empty State Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 border border-default rounded-2xl bg-surface mb-6">
            <FolderOpen
              size={40}
              className="text-muted"
            />
          </div>

          {/* Empty State Content */}
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-4">
            No Saved Plans Yet
          </h2>

          <p className="text-lg text-secondary mb-8 leading-relaxed">
            You haven't saved any learning roadmaps yet. Create and save your
            first personalized study plan to build your learning library!
          </p>

          {/* Action Button */}
          <button
            onClick={() => setActiveTab("create")}
            className="bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-accent hover:to-theme-primary
                     text-white font-semibold py-3 px-8 rounded-lg
                     transition-all duration-300 transform hover:scale-105
                     flex items-center justify-center gap-3 mx-auto"
          >
            <Plus size={20} />
            Create Your First Roadmap
          </button>

          {/* Tips */}
          <div className="mt-8 p-4 bg-theme-primary/10 dark:bg-theme-primary/20 rounded-lg border border-theme-primary/30">
            <p className="text-sm text-theme-primary">
              💡 <strong>Tip:</strong> Save your roadmaps to track progress,
              resume generation, and organize multiple learning paths.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Header Section */}
      <div className="border-b border-default">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-main flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg">
                  <BookOpen size={24} className="text-main" />
                </div>
                Saved Learning Plans
              </h1>
              <p className="text-secondary mt-2">
                Manage and continue your personalized study roadmaps
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-theme-primary/10 dark:bg-theme-primary/20 px-3 py-2 rounded-lg border border-theme-primary/30">
                <span className="text-sm font-medium text-theme-primary">
                  {savedTimeplans.length}{" "}
                  {savedTimeplans.length === 1 ? "Plan" : "Plans"} Saved
                </span>
              </div>

              <button
                onClick={() => setActiveTab("create")}
                className="bg-gradient-theme hover:bg-theme-accent text-white font-semibold py-2 px-4
                         rounded-lg transition-all duration-300
                         transform hover:scale-105 flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="p-6">
        <div className="space-y-8 w-full">
          {/* Favorites Section */}
          {savedTimeplans.some((tp) => isFavorite(tp.id)) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-theme-secondary fill-current" />
                Favorite Roadmaps
              </h2>
              <div className="grid grid-cols-2 gap-6 w-full">
                {savedTimeplans
                  .filter((timeplan) => isFavorite(timeplan.id))
                  .map(renderRoadmapCard)}
              </div>
            </div>
          )}

          {/* All Roadmaps Section */}
          {savedTimeplans.some((tp) => !isFavorite(tp.id)) && (
            <div>
              <h2 className="text-lg font-semibold text-main mb-4">
                All Roadmaps
              </h2>
              <div className="grid grid-cols-2 gap-6 w-full">
                {savedTimeplans
                  .filter((timeplan) => !isFavorite(timeplan.id))
                  .map(renderRoadmapCard)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPlansTab;
