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
  Brain,
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
        className="relative group bg-gradient-to-br from-surface via-surface to-surface
                   border border-default rounded-2xl overflow-hidden
                   hover:border-theme-primary hover:shadow-2xl hover:shadow-theme-primary
                   transition-all duration-500 ease-out cursor-pointer
                   hover:-translate-y-2 hover:scale-[1.02]
                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-theme-primary before:to-theme-accent
                   before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
        onClick={() => {
          loadRoadmap(timeplan.id);
          setActiveTab("view");
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-theme-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Favorite Star - Floating */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(timeplan.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
              isFavorite(timeplan.id)
                ? "bg-theme-secondary/20 border-theme-secondary/30 text-theme-secondary shadow-lg shadow-theme-secondary/25"
                : "bg-surface/80 border-default/50 text-muted hover:border-theme-primary/50 hover:text-theme-primary"
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
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center shadow-lg shadow-theme-primary/25">
                <Brain className="w-6 h-6 text-main" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-main mb-1 line-clamp-2 group-hover:text-theme-primary transition-colors duration-300">
                  {timeplan.title || timeplan.name}
                </h3>
                {timeplan.objective && (
                  <p className="text-sm text-secondary line-clamp-2">
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
                <div className="w-16 h-16 bg-gradient-to-br from-theme-primary/10 to-theme-primary/20 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:shadow-lg group-hover/stat:shadow-theme-primary/20">
                  <Calendar className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/20 to-theme-accent/20 rounded-2xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 blur-xl" />
              </div>
              <div className="relative">
                <p className="text-2xl font-bold text-main mb-1">
                  {timeplan.phases?.length || 0}
                </p>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Phases
                </p>
              </div>
            </div>

            <div className="text-center group/stat">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-success/10 to-success/20 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:shadow-lg group-hover/stat:shadow-success/20">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-theme-accent/20 rounded-2xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 blur-xl" />
              </div>
              <div className="relative">
                <p className="text-2xl font-bold text-main mb-1">
                  {timeplan.totalDuration || "N/A"}
                </p>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Duration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer - Enhanced Action Buttons */}
        <div className="relative border-t border-default/50 bg-gradient-to-r from-surface/50 to-surface backdrop-blur-sm">
          <div className="grid grid-cols-2">
            {/* Regenerate Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerateRoadmap(timeplan);
              }}
              disabled={isCurrentlyRegenerating}
              className="group/regenerate relative p-4 flex items-center justify-center gap-3 transition-all duration-300 hover:bg-success/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative">
                <RefreshCw
                  size={18}
                  className={`transition-all duration-300 ${
                    isCurrentlyRegenerating
                      ? "animate-spin text-theme-primary"
                      : "text-secondary group-hover/regenerate:text-success group-hover/regenerate:rotate-180 group-hover/regenerate:scale-110"
                  }`}
                />
                {!isCurrentlyRegenerating && (
                  <div className="absolute inset-0 bg-success/20 rounded-full opacity-0 group-hover/regenerate:opacity-100 transition-opacity duration-300 blur-md" />
                )}
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isCurrentlyRegenerating
                  ? "text-theme-primary"
                  : "text-secondary group-hover/regenerate:text-success"
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
              className="group/delete relative p-4 flex items-center justify-center gap-3 transition-all duration-300 hover:bg-error/10 border-l border-default/50"
            >
              <div className="relative">
                <Trash2
                  size={18}
                  className="text-secondary group-hover/delete:text-error group-hover/delete:scale-110 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-error/20 rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 blur-md" />
              </div>
              <span className="text-sm font-medium text-secondary group-hover/delete:text-error transition-colors duration-300">
                Delete
              </span>
            </button>
          </div>
          
          {/* Bottom Glow Effect */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-theme-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                className="bg-gradient-theme hover:bg-theme-accent text-white font-semibold py-2 px-4
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
