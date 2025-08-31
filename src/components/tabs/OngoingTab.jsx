import React from "react";
import {
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  GripVertical,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ id, objective, removeFromQueue }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <button {...listeners} className="cursor-grab p-1 text-gray-400">
          <GripVertical size={18} />
        </button>
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {objective || "Untitled Roadmap"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            <Clock size={12} />
            Queued
        </span>
        <button onClick={() => removeFromQueue(id)} className="p-1 text-gray-500 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const OngoingTab = ({
  generationQueue,
  setGenerationQueue, // New prop to update the queue order
  incompleteRoadmaps,
  isQueuePaused,
  currentlyGenerating,
  pauseQueue,
  resumeQueue,
  removeFromQueue,
  loadRoadmap,
  deleteRoadmap,
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
    if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) return 0;
    const totalPhases = roadmap.phases.length;
    const completedPhases = roadmap.phases.filter(
      (phase) =>
        phase.goal && phase.goal !== "..." && phase.miniGoals && phase.miniGoals.length > 0,
    ).length;
    return Math.round((completedPhases / totalPhases) * 100);
  };

  const queuedItems = generationQueue.filter(item => item.id !== currentlyGenerating?.id);
  const generatingRoadmapData = currentlyGenerating ? incompleteRoadmaps.find(r => r.id === currentlyGenerating.roadmapId) : null;
  const progress = generatingRoadmapData ? getProgressBar(generatingRoadmapData) : (currentlyGenerating ? 1 : 0);

  const filteredIncomplete = incompleteRoadmaps.filter(
    (roadmap) =>
      roadmap.id !== currentlyGenerating?.roadmapId &&
      !generationQueue.some((item) => item.roadmapId === roadmap.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setGenerationQueue((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ongoing Roadmaps</h2>
        <p className="text-gray-600 dark:text-gray-300">Manage your roadmap generation queue and incomplete roadmaps</p>
      </div>

      {currentlyGenerating && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-blue-500 dark:border-blue-400 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Play className="text-blue-500 animate-pulse" size={24} />
            Currently Generating
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex-grow mr-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{currentlyGenerating.objective || "Untitled Roadmap"}</span>
                {getStatusBadge("generating")}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{loadingMessage}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={pauseQueue} disabled={!loading} className="p-2 text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors disabled:opacity-50" title="Pause generation">
                <Pause size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="text-blue-500" size={24} /> In Queue
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{queuedItems.length} items</span>
            {isQueuePaused && generationQueue.length > 0 && (
              <button onClick={resumeQueue} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-green disabled:transform-none">
                <Play size={16} /> Resume All
              </button>
            )}
            <button onClick={clearQueue} disabled={generationQueue.length === 0} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-red disabled:transform-none">
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        </div>
        <ScrollArea className="h-60 pr-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={queuedItems} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {queuedItems.map(item => (
                            <SortableItem key={item.id} id={item.id} objective={item.objective} removeFromQueue={removeFromQueue} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            {queuedItems.length === 0 && (
                <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">Queue is empty.</p></div>
            )}
        </ScrollArea>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-500" size={24} /> Incomplete
        </h3>
        {filteredIncomplete.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncomplete.map(roadmap => (
              <div key={roadmap.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{roadmap.name || "Untitled Roadmap"}</span>
                    {getStatusBadge("incomplete")}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{roadmap.objective}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${getProgressBar(roadmap)}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      loadRoadmap(roadmap.sanitizedName);
                      if (!generationQueue.some(item => item.roadmapId === roadmap.id)) {
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
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-blue flex-grow"
                  >
                    <Eye size={16} /> Resume
                  </button>
                  <button onClick={() => deleteRoadmap(roadmap.sanitizedName)} disabled={loading} className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 hover:shadow-glow-red disabled:transform-none" title="Delete roadmap">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">No incomplete roadmaps.</p></div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
          <CheckCircle size={18} />
          Queue Management Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• The queue processes roadmaps automatically in order.</li>
          <li>• You can pause/resume the queue at any time.</li>
          <li>• Creating a new roadmap will pause the queue temporarily.</li>
          <li>• Incomplete roadmaps can be resumed by adding them to the queue.</li>
        </ul>
      </div>
    </div>
  );
};

export default OngoingTab;
