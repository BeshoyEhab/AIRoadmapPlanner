import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

const SavedPlansTab = ({
  savedTimeplans,
  loadRoadmap,
  deleteRoadmap,
  setActiveTab,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDeleteConfirm,
  toggleFavorite,
  isFavorite,
  addToQueue,
  setObjective,
  setFinalGoal,
  setRoadmap,
  generationQueue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

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
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
      toast.error(`Failed to regenerate roadmap: ${error.message}`);
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

    return (
      <div
        key={timeplan.id}
      className="border border-default rounded-xl shadow-md bg-surface
                 hover:shadow-xl transition-all duration-300 overflow-hidden group
                 cursor-pointer flex flex-col hover:shadow-glow-theme w-full h-full min-h-[300px]"
        onClick={() => {
          loadRoadmap(timeplan.id);
          setActiveTab("view");
        }}
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-theme-primary to-theme-accent p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-main font-semibold line-clamp-2 mb-2">
                {timeplan.title || timeplan.name}
              </h3>
              {timeplan.objective && (
                <p className="text-main text-sm line-clamp-2">
                  {timeplan.objective}
                </p>
              )}
            </div>
            <div className="ml-2 flex items-center gap-1">
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(timeplan.id);
                }}
                className={`p-1 rounded-full hover:bg-white/10 transition-colors ${
                  isFavorite(timeplan.id) ? "text-theme-secondary" : "text-muted"
                }`}
                title={
                  isFavorite(timeplan.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {isFavorite(timeplan.id) ? (
                  <Star className="w-5 h-5 fill-current" />
                ) : (
                  <Star className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Card Content - This will grow to fill available space */}
        <div className="p-4 flex-1 flex flex-col justify-center">
          {" "}
          {/* Added flex-1 and centering */}
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-theme-primary/20 dark:bg-theme-primary/30 rounded-lg mx-auto mb-1">
                <Calendar
                  className="text-theme-primary"
                  size={16}
                />
              </div>
              <p className="text-sm font-semibold text-main">
                {timeplan.phases?.length || 0}
              </p>
              <p className="text-xs text-muted">Phases</p>
            </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-success/20 rounded-lg mx-auto mb-1">
                  <Clock
                    className="text-success"
                    size={16}
                  />
                </div>
              <p className="text-sm font-semibold text-main">
                {timeplan.totalDuration || "N/A"}
              </p>
              <p className="text-xs text-muted">
                Duration
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer - This will stick to the bottom */}
        <div className="px-0 py-0 border-t border-default backdrop-blur-sm mt-auto">
          {" "}
          {/* Added mt-auto */}
          <div className="grid grid-cols-2 divide-x divide-default">
            {/* Regenerate Button */}
            <div className="relative group/regenerate p-2.5 hover:bg-hover transition-colors">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegenerateRoadmap(timeplan);
                }}
                disabled={isCurrentlyRegenerating}
                className={`w-full h-full flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  isCurrentlyRegenerating
                    ? "text-muted cursor-not-allowed"
                    : "text-secondary hover:text-success"
                }`}
              >
                <RefreshCw
                  size={16}
                  className={`transition-transform ${
                    isCurrentlyRegenerating
                      ? "animate-spin"
                      : "group-hover/regenerate:rotate-180"
                  }`}
                />
                <span>
                  {isCurrentlyRegenerating ? "Regenerating..." : "Regenerate"}
                </span>
              </button>
            </div>
            {/* Delete Button */}
            <div className="relative group/delete p-2.5 hover:bg-hover transition-colors">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoadmap(timeplan.id);
                }}
                className="w-full h-full flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:text-error transition-colors"
              >
                <Trash2
                  size={16}
                  className="transition-transform group-hover/delete:scale-110"
                />
                <span>Delete</span>
              </button>
            </div>
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
          <div className="inline-flex items-center justify-center w-20 h-20 border border-default rounded-2xl shadow-md bg-surface mb-6">
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
                     text-white font-semibold py-3 px-8 rounded-lg shadow-lg
                     transition-all duration-300 hover:shadow-xl transform hover:scale-105
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
      <div className="border-b border-default shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-main flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg shadow-md">
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
                className="bg-theme-primary hover:bg-theme-accent text-white font-semibold py-2 px-4
                         rounded-lg shadow-md transition-all duration-300 hover:shadow-lg
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
