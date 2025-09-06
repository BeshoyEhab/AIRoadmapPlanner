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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
                 hover:shadow-xl transition-all duration-300 overflow-hidden group
                 cursor-pointer flex flex-col hover:shadow-glow-blue w-full h-full min-h-[300px]"
        onClick={() => {
          loadRoadmap(timeplan.id);
          setActiveTab("view");
        }}
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                {timeplan.title || timeplan.name}
              </h3>
              {timeplan.objective && (
                <p className="text-blue-100 text-sm line-clamp-2">
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
                  isFavorite(timeplan.id) ? "text-yellow-400" : "text-gray-300"
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
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-1">
                <Calendar
                  className="text-blue-600 dark:text-blue-400"
                  size={16}
                />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {timeplan.phases?.length || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phases</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-1">
                <Clock
                  className="text-green-600 dark:text-green-400"
                  size={16}
                />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {timeplan.totalDuration || "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Duration
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer - This will stick to the bottom */}
        <div className="px-0 py-0 bg-gray-50/80 dark:bg-gray-700/80 border-t border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm mt-auto">
          {" "}
          {/* Added mt-auto */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-600">
            {/* Regenerate Button */}
            <div className="relative group/regenerate p-2.5 hover:bg-gray-100/50 dark:hover:bg-gray-600/30 transition-colors">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegenerateRoadmap(timeplan);
                }}
                disabled={isCurrentlyRegenerating}
                className={`w-full h-full flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  isCurrentlyRegenerating
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
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
            <div className="relative group/delete p-2.5 hover:bg-gray-100/50 dark:hover:bg-gray-600/30 transition-colors">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoadmap(timeplan.id);
                }}
                className="w-full h-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
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
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Empty State Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl shadow-lg mb-6">
            <FolderOpen
              size={40}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>

          {/* Empty State Content */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            No Saved Plans Yet
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            You haven't saved any learning roadmaps yet. Create and save your
            first personalized study plan to build your learning library!
          </p>

          {/* Action Button */}
          <button
            onClick={() => setActiveTab("create")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                     text-white font-semibold py-3 px-8 rounded-lg shadow-lg
                     transition-all duration-300 hover:shadow-xl transform hover:scale-105
                     flex items-center justify-center gap-3 mx-auto"
          >
            <Plus size={20} />
            Create Your First Roadmap
          </button>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Save your roadmaps to track progress,
              resume generation, and organize multiple learning paths.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <BookOpen size={24} className="text-white" />
                </div>
                Saved Learning Plans
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage and continue your personalized study roadmaps
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {savedTimeplans.length}{" "}
                  {savedTimeplans.length === 1 ? "Plan" : "Plans"} Saved
                </span>
              </div>

              <button
                onClick={() => setActiveTab("create")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4
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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                All Roadmaps
              </h2>
              <div className="grid grid-cols-2 gap-6 w-full">
                {savedTimeplans
                  .filter((timeplan) => !isFavorite(timeplan.id))
                  .map(renderRoadmapCard)}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Create New Roadmap
              </button>
              <button
                onClick={() => {
                  const searchInput =
                    document.getElementById("search-roadmaps");
                  if (searchInput) searchInput.focus();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                <Search size={16} />
                Search Roadmaps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPlansTab;
