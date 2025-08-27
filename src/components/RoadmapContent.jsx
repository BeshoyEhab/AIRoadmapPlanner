import React, { useState, useRef, useCallback } from "react";
import {
  Download,
  FileText,
  SquareCode,
  Printer,
  Clock,
  Layers,
  BarChart3,
  Target,
  BookOpen,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  ExternalLink,
  Loader,
  Pause,
  Play,
} from "lucide-react";
import { useRoadmapActions } from "../hooks/roadmap/useRoadmapActions";
import { Heart, HeartOff } from "lucide-react";

const RoadmapContent = ({
  setActiveTab,
  roadmap,
  objective,
  finalGoal,
  saveCurrentRoadmap,
  downloadMarkdown,
  exportToPDF,
  handleCopyCode,
  handlePrint,
  toggleMiniGoal,
  calculateOverallProgress,
  toggleFavorite,
  isFavorite,
  interruptGeneration,
  generateRoadmap,
  exportFormat,
  setExportFormat,
  showActionButtons = false,
  removeFromQueue,
  addToQueue,
  generationQueue,
  currentlyGenerating,
  setRoadmap,
}) => {
  if (!roadmap || !roadmap.phases) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No roadmap data available</div>
          <button 
            onClick={() => setActiveTab('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Create New Roadmap
          </button>
        </div>
      </div>
    );
  }
  const [expandedPhases, setExpandedPhases] = useState({});

  const { handlePause, handleResume } = useRoadmapActions({
    roadmap,
    setRoadmap,
    removeFromQueue,
    addToQueue,
    interruptGeneration,
    setActiveTab,
    generationQueue,
    generateRoadmap,
    objective,
    finalGoal,
    setObjective: () => {},
    setFinalGoal: () => {}
  });
  const roadmapRef = useRef(null);

  const togglePhase = (index) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const calculatePhaseProgress = useCallback((phase) => {
    if (!phase || !phase.miniGoals) return 0;
    const total = phase.miniGoals.length;
    if (total === 0) return 0;
    const completed = phase.miniGoals.filter((mg) => mg.completed).length;
    return Math.round((completed / total) * 100);
  }, []);

  return (
    <div className="space-y-6" ref={roadmapRef}>
      {showActionButtons && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 dark:from-blue-900 dark:to-indigo-900 dark:border-blue-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {roadmap.title}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  Duration: {roadmap.totalDuration}
                </div>
                <div className="flex items-center gap-1">
                  <Layers size={16} />
                  {roadmap.phases?.length || 0} Phases
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 size={16} />
                  Level: {roadmap.difficultyLevel || "Advanced"}
                </div>
                {roadmap.totalEstimatedHours && (
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="chart">
                      📊
                    </span>
                    Total Estimated Hours: {roadmap.totalEstimatedHours}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="text-green-600 font-medium">
                    Progress: {calculateOverallProgress(roadmap)}%
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(roadmap.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title={isFavorite(roadmap.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(roadmap.id) ? (
                      <Heart className="w-5 h-5 fill-current" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                onClick={saveCurrentRoadmap}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center gap-2 text-sm"
                title="Save Roadmap"
              >
                <Download size={16} />
                <span>Save</span>
              </button>
              {/* Single Export Button based on exportFormat */}
              <button
                onClick={() => {
                  if (exportFormat === "markdown") {
                    downloadMarkdown();
                  } else if (exportFormat === "pdf") {
                    exportToPDF();
                  } else if (
                    exportFormat === "html" &&
                    typeof window !== "undefined"
                  ) {
                    // fallback: export HTML
                    if (typeof window.exportToHTML === "function") {
                      window.exportToHTML();
                    }
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center gap-2 text-sm"
                title={`Export as ${exportFormat.toUpperCase()}`}
              >
                <Download size={16} />
                <span>
                  Export {exportFormat ? exportFormat.toUpperCase() : ""}
                </span>
              </button>
              {/* Enhanced Pause/Resume Controls */}
              {(() => {
                const inQueue =
                  generationQueue &&
                  generationQueue.some(
                    (q) =>
                      q.id === roadmap.id ||
                      (q.roadmapId && q.roadmapId === roadmap.id),
                  );
                const isGenerating =
                  typeof currentlyGenerating === "object" &&
                  currentlyGenerating !== null &&
                  (currentlyGenerating.id === roadmap.id ||
                    currentlyGenerating.roadmapId === roadmap.id);
                
                 const queuePosition = generationQueue ? 
                   (generationQueue.findIndex(
                     (q) => q.id === roadmap.id || (q.roadmapId && q.roadmapId === roadmap.id)
                   ) + 1) : 0;    

                // Show Pause if in queue (whether generating or just queued)
                if (inQueue) {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-sm relative overflow-hidden group"
                        onClick={() => handlePause(roadmap)}
                        title={isGenerating ? "Pause Current Generation" : "Remove from Queue"}
                      >
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        
                        <span className="flex items-center relative z-10">
                          {isGenerating ? (
                            <>
                              <div className="relative mr-3">
                                <Loader className="animate-spin h-5 w-5" />
                                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"></div>
                              </div>
                              <span className="font-medium">Pause Generation</span>
                            </>
                          ) : (
                            <>
                              <Pause className="mr-3 h-5 w-5" />
                              <span className="font-medium">Remove from Queue</span>
                            </>
                          )}
                        </span>
                        
                        {/* Status indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white"></div>
                      </button>
                      
                      {/* Status text */}
                      <div className="text-xs text-center">
                        {isGenerating ? (
                          <span className="text-orange-600 font-semibold flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            Currently Generating
                          </span>
                        ) : (
                          <span className="text-blue-600 font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Queue Position: #{queuePosition}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // Show Resume if paused (regardless of queue status)
                if (roadmap.generationState === "paused") {
                  const alreadyGenerating =
                    typeof currentlyGenerating === "object" &&
                    currentlyGenerating !== null &&
                    (currentlyGenerating.id === roadmap.id ||
                      currentlyGenerating.roadmapId === roadmap.id);
                  
                  const pausedDate = roadmap.pausedAt ? new Date(roadmap.pausedAt) : null;
                  const pausedDuration = pausedDate ? 
                    Math.floor((Date.now() - pausedDate.getTime()) / (1000 * 60)) : null;
                  
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 flex items-center gap-3 text-sm relative overflow-hidden group ${
                          alreadyGenerating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !alreadyGenerating && handleResume(roadmap)}
                        disabled={alreadyGenerating}
                        title={alreadyGenerating ? "Already generating another roadmap" : "Resume Generation"}
                      >
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        
                        <span className="flex items-center relative z-10">
                          {alreadyGenerating ? (
                            <>
                              <Loader className="animate-spin mr-3 h-5 w-5" />
                              <span className="font-medium">Processing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="mr-3 h-5 w-5" />
                              <span className="font-medium">Resume Generation</span>
                            </>
                          )}
                        </span>
                        
                        {/* Ready indicator */}
                        {!alreadyGenerating && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce border-2 border-white"></div>
                        )}
                      </button>
                      
                      {/* Paused status */}
                      <div className="text-xs text-center">
                        <span className="text-amber-600 font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          Paused {pausedDuration ? `${pausedDuration}m ago` : ''}
                        </span>
                        {roadmap.generationState === 'paused' && (
                          <div className="text-gray-500 text-xs mt-1">
                            Progress will continue from where it left off
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // Show completion status for completed roadmaps
                if (roadmap.generationState === "completed") {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 font-semibold py-3 px-6 rounded-xl shadow-md flex items-center gap-3 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Generation Complete</span>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-xs text-center text-green-600 font-medium">
                        ✨ Ready to start your learning journey!
                      </div>
                    </div>
                  );
                }
                
                // Disabled state for in-progress but not in queue (edge case)
                if (roadmap.generationState === "in-progress" && !inQueue) {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        className="bg-gray-400 text-white font-medium py-3 px-6 rounded-xl shadow-md opacity-75 cursor-not-allowed flex items-center gap-3 text-sm"
                        disabled
                        title="Generation in progress (not in queue)"
                      >
                        <Loader className="animate-spin mr-3 h-5 w-5" />
                        <span>Processing...</span>
                      </button>
                      <div className="text-xs text-center text-gray-500">
                        Generation in progress
                      </div>
                    </div>
                  );
                }
                
                // Default state - show generate button if no state
                return (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 border border-gray-200 text-gray-600 font-medium py-3 px-6 rounded-xl shadow-sm flex items-center gap-3 text-sm">
                      <Circle className="h-5 w-5" />
                      <span>Ready to Generate</span>
                    </div>
                    <div className="text-xs text-center text-gray-500">
                      Use the Create tab to generate details
                    </div>
                  </div>
                );
              })()}
              {/* Export Format Selector */}
              <select
                value={exportFormat}
                onChange={(e) => {
                  setExportFormat(e.target.value);
                  localStorage.setItem("export-format", e.target.value);
                }}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {roadmap.phases.map((phase, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700"
          >
            <div
              className="bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => togglePhase(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Phase {phase.phaseNumber}: {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {phase.duration} • {phase.goal}
                  </p>
                  {phase.miniGoals && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-32 bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculatePhaseProgress(phase)}%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {phase.miniGoals.filter((mg) => mg.completed).length}/
                          {phase.miniGoals.length} mini-goals
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {expandedPhases[index] ? (
                  <ChevronUp className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronDown className="text-gray-600 dark:text-gray-300" />
                )}
              </div>
            </div>

            {expandedPhases[index] && (
              <div className="p-6 bg-white dark:bg-gray-800">
                {phase.goal === "..." ? (
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Loader className="animate-spin mr-3" size={20} />
                    <span>Details for this phase are being generated...</span>
                  </div>
                ) : (
                  <>
                    {phase.miniGoals && phase.miniGoals.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <Target size={18} className="text-green-600" />
                          Mini-Goals
                        </h4>
                        <div className="space-y-3">
                          {phase.miniGoals.map((miniGoal) => (
                            <div
                              key={miniGoal.id}
                              className="border border-gray-200 rounded-lg p-3 dark:border-gray-700"
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() =>
                                    toggleMiniGoal(index, miniGoal.id)
                                  }
                                  className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                  {miniGoal.completed ? (
                                    <CheckCircle
                                      size={20}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <Circle size={20} />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h5
                                      className={`font-medium ${miniGoal.completed ? "text-gray-500 line-through" : "text-gray-800 dark:text-white"}`}
                                    >
                                      {miniGoal.url ? (
                                        <a
                                          href={miniGoal.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                          {miniGoal.title}{" "}
                                          <ExternalLink size={14} />
                                        </a>
                                      ) : (
                                        miniGoal.title
                                      )}
                                    </h5>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span
                                        className={`px-2 py-1 rounded-full ${
                                          miniGoal.priority === "high"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            : miniGoal.priority === "medium"
                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        }`}
                                      >
                                        {miniGoal.priority}
                                      </span>
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {miniGoal.estimatedTime}
                                      </span>
                                    </div>
                                  </div>
                                  <p
                                    className={`text-sm mt-1 ${miniGoal.completed ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
                                  >
                                    {miniGoal.description}
                                  </p>
                                  {miniGoal.successCriteria && (
                                    <p className="text-xs text-blue-600 mt-1 dark:text-blue-400">
                                      ✓ Success: {miniGoal.successCriteria}
                                    </p>
                                  )}
                                  {miniGoal.completedDate && (
                                    <p className="text-xs text-green-600 mt-1 dark:text-green-400">
                                      Completed:{" "}
                                      {new Date(
                                        miniGoal.completedDate,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <BookOpen size={18} className="text-blue-600" />
                          Premium Resources
                        </h4>
                        <div className="space-y-3">
                          {phase.resources.map((resource, resIndex) => (
                            <div
                              key={resIndex}
                              className="border border-gray-200 rounded-lg p-3 dark:border-gray-700"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-800 dark:text-white">
                                    {resource.name}
                                  </h5>
                                  <div className="flex gap-2 mt-1">
                                    {resource.type && (
                                      <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                                          resource.type === "documentation"
                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                            : resource.type === "course"
                                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                              : resource.type === "book"
                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                : resource.type === "paper"
                                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                                  : resource.type === "project"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                                        }`}
                                      >
                                        {resource.type}
                                      </span>
                                    )}
                                    {resource.priority && (
                                      <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                                          resource.priority === "essential"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            : resource.priority ===
                                                "recommended"
                                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                              : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                                        }`}
                                      >
                                        {resource.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 ml-2 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {resource.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {resource.difficulty && (
                                  <span
                                    className={`px-2 py-1 rounded-full ${
                                      resource.difficulty === "beginner"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                        : resource.difficulty === "intermediate"
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                    }`}
                                  >
                                    {resource.difficulty}
                                  </span>
                                )}
                                {resource.estimatedTime && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    ⏱️ {resource.estimatedTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <Lightbulb size={18} className="text-yellow-600" />
                          Monetizable Project
                        </h4>
                        <div className="border border-gray-200 rounded-lg p-4 mb-4 dark:border-gray-700">
                          {typeof phase.project === "object" ? (
                            <>
                              <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
                                {phase.project.title ?? "Untitled Project"}
                              </h5>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {phase.project.description}
                              </p>

                              {phase.project.deliverables && (
                                <div className="mb-3">
                                  <strong className="text-sm text-gray-700 dark:text-gray-200">
                                    Deliverables:
                                  </strong>
                                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {phase.project.deliverables.map(
                                      (deliverable, idx) => (
                                        <li key={idx}>{deliverable}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {phase.project.monetizationPotential && (
                                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 dark:bg-green-900 dark:border-green-700">
                                  <p className="text-sm text-green-800 dark:text-green-200">
                                    <strong>💰 Income Potential:</strong>{" "}
                                    {phase.project.monetizationPotential}
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {phase.project.estimatedDuration && (
                                  <span>
                                    ⏱️ {phase.project.estimatedDuration}
                                  </span>
                                )}
                                {phase.project.difficultyLevel && (
                                  <span
                                    className={`px-2 py-1 rounded-full ${
                                      phase.project.difficultyLevel ===
                                      "beginner"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                        : phase.project.difficultyLevel ===
                                            "intermediate"
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                    }`}
                                  >
                                    {phase.project.difficultyLevel}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {phase.project}
                            </p>
                          )}

                          {phase.milestone && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-3 dark:bg-blue-900 dark:border-blue-700">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>🎯 Milestone:</strong> {phase.milestone}
                              </p>
                            </div>
                          )}
                        </div>

                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                          Skills You'll Master
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {roadmap.motivationMilestones?.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 dark:bg-purple-900 dark:border-purple-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            🎯 Motivation Milestones
          </h4>
          <div className="grid gap-2">
            {roadmap.motivationMilestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-purple-800 dark:text-purple-200"
              >
                <div className="w-2 h-2 bg-purple-400 rounded-full dark:bg-purple-600"></div>
                {milestone}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.careerProgression && roadmap.careerProgression.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 dark:bg-indigo-900 dark:border-indigo-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            🚀 Career Progression Path
          </h4>
          <div className="grid gap-2">
            {roadmap.careerProgression.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-200"
              >
                <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:bg-indigo-700 dark:text-indigo-300">
                  {index + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.careerOutcomes && roadmap.careerOutcomes.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 dark:bg-emerald-900 dark:border-emerald-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            💼 Career Opportunities
          </h4>
          <div className="grid gap-1">
            {roadmap.careerOutcomes.map((outcome, index) => (
              <div
                key={index}
                className="text-sm text-emerald-800 dark:text-emerald-200"
              >
                • {outcome.role} ({outcome.salary})
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.tips && roadmap.tips.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900 dark:border-yellow-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <Lightbulb size={18} className="text-yellow-600" />
            Expert Pro Tips
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {roadmap.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {roadmap.marketDemand && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 dark:bg-teal-900 dark:border-teal-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            📈 Market Outlook
          </h4>
          <p className="text-sm text-teal-800 dark:text-teal-200">
            {roadmap.marketDemand}
          </p>
        </div>
      )}

      {roadmap.communityResources && roadmap.communityResources.length > 0 && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 dark:bg-cyan-900 dark:border-cyan-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            🤝 Community & Networking Resources
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {roadmap.communityResources.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoadmapContent;
