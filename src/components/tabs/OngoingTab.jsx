import React from "react";
import {
  Play,
  Pause,
  Trash2,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const OngoingTab = ({
  generationQueue,
  incompleteRoadmaps,
  isQueuePaused,
  currentlyGenerating,
  pauseQueue,
  resumeQueue,
  removeFromQueue,
  retryGeneration,
  loadRoadmap,
  deleteRoadmap,
  setActiveTab,
  addToQueue,
  clearQueue,
  loading,
  loadingMessage,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "queued":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            <Clock size={12} />
            Queued
          </span>
        );
      case "generating":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 animate-pulse">
            <Play size={12} />
            Generating
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            <Pause size={12} />
            Paused
          </span>
        );
      case "incomplete":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
            <AlertCircle size={12} />
            Incomplete
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
            <AlertCircle size={12} />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressBar = (roadmap) => {
    if (!roadmap.phases) return 0;
    const totalPhases = roadmap.phases.length;
    const completedPhases = roadmap.phases.filter(
      (phase) =>
        phase.goal !== "..." && phase.miniGoals && phase.miniGoals.length > 0,
    ).length;
    return Math.round((completedPhases / totalPhases) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ongoing Roadmaps
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your roadmap generation queue and incomplete roadmaps
        </p>
      </div>

      {/* Queue Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="text-blue-500" size={24} />
            Generation Queue
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {generationQueue.length} in queue
            </span>
            {isQueuePaused ? (
              <button
                onClick={resumeQueue}
                disabled={loading || generationQueue.length === 0}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                         text-white font-medium py-2 px-4 rounded-lg transition-all duration-300
                         hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                <Play size={16} />
                Resume Queue
              </button>
            ) : (
              <button
                onClick={pauseQueue}
                disabled={!loading && generationQueue.length === 0}
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400
                         text-white font-medium py-2 px-4 rounded-lg transition-all duration-300
                         hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                <Pause size={16} />
                Pause Queue
              </button>
            )}
            {generationQueue.length > 0 && (
              <button
                onClick={clearQueue}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400
                         text-white font-medium py-2 px-4 rounded-lg transition-all duration-300
                         hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                <Trash2 size={16} />
                Clear Queue
              </button>
            )}
          </div>
        </div>

        {/* Current Generation Status */}
        {loading && currentlyGenerating && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="font-medium text-blue-900 dark:text-blue-200">
                Currently Generating: {currentlyGenerating.name}
              </span>
            </div>
            {loadingMessage && (
              <p className="text-sm text-blue-700 dark:text-blue-300 ml-8">
                {loadingMessage}
              </p>
            )}
          </div>
        )}

        {/* Queue List */}
        {generationQueue.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {generationQueue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700
                           border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-800
                                   text-blue-800 dark:text-blue-200 rounded-full text-sm font-bold"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.objective}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      disabled={loading && index === 0}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30
                               rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from queue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No roadmaps in queue
            </p>
            <button
              onClick={() => setActiveTab("create")}
              className="mt-3 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400
                       hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            ></button>
          </div>
        )}
      </div>

      {/* Incomplete Roadmaps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="text-orange-500" size={24} />
            Incomplete Roadmaps
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {incompleteRoadmaps.length} incomplete
          </span>
        </div>

        {incompleteRoadmaps.length > 0 ? (
          <div className="space-y-4">
            {incompleteRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg
                         bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {roadmap.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {roadmap.objective}
                    </p>
                    {getStatusBadge(roadmap.generationState || "incomplete")}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Progress
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getProgressBar(roadmap)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressBar(roadmap)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Roadmap Info */}
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <span>{roadmap.phases?.length || 0} phases</span>
                  <span>{roadmap.totalDuration || "Duration TBD"}</span>
                  <span>{roadmap.difficultyLevel || "Difficulty TBD"}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Add to queue if not already in queue, then load and switch to view
                      if (
                        !generationQueue ||
                        !generationQueue.some(
                          (item) =>
                            item.roadmapId === roadmap.id ||
                            item.id === roadmap.id,
                        )
                      ) {
                        addToQueue({
                          id: Date.now(),
                          roadmapId: roadmap.id,
                          name: roadmap.name,
                          objective: roadmap.objective,
                          finalGoal: roadmap.finalGoal,
                          status: "queued",
                          isResume: true,
                        });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                             text-white font-medium py-2 px-4 rounded-lg transition-all duration-300
                             hover:shadow-lg transform hover:scale-105 flex-grow"
                  >
                    <Eye size={16} />
                    Resume
                  </button>

                  <button
                    onClick={() => retryGeneration(roadmap)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700
                             disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded-lg transition-all
                             duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                    title="Retry generation immediately"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    onClick={() => deleteRoadmap(roadmap.sanitizedName)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700
                             disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded-lg transition-all
                             duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                    title="Delete roadmap"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400">
              All roadmaps are complete!
            </p>
            <button
              onClick={() => setActiveTab("create")}
              className="mt-3 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400
                       hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Create New Roadmap
            </button>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
          <CheckCircle size={18} />
          Queue Management Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• The queue processes roadmaps automatically in order</li>
          <li>• You can pause/resume the queue at any time</li>
          <li>• Creating a new roadmap will pause the queue temporarily</li>
          <li>
            • Incomplete roadmaps can be resumed individually or added to queue
          </li>
          <li>
            • Use "Resume" to manually continue generation with full control
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OngoingTab;
