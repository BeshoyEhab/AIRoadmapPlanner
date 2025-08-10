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
} from "lucide-react";

const CreateRoadmapTab = ({
  objective,
  setObjective,
  finalGoal,
  setFinalGoal,
  generateRoadmap,
  loading,
  loadingMessage,
  error,
  roadmap,
  addToQueue,
}) => {
  const isResumable = roadmap && roadmap.generationState === "in-progress";

  const handleGenerate = () => {
    if (loading) {
      // If already generating, add to queue instead
      const queueItem = {
        id: Date.now(),
        name: `${objective.slice(0, 50)}${objective.length > 50 ? "..." : ""}`,
        objective: objective.trim(),
        finalGoal: finalGoal.trim(),
        status: "queued",
        isResume: false,
      };
      addToQueue(queueItem);

      // Clear form after adding to queue
      setObjective("");
      setFinalGoal("");
    } else {
      // Normal generation
      generateRoadmap(false);
    }
  };

  const handleResume = () => {
    generateRoadmap(true, roadmap);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <Brain className="text-white" size={32} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Study Roadmap Planner
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your learning journey with AI-powered personalized
            roadmaps. Define your goals and let our intelligent system create a
            comprehensive study plan tailored just for you.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={24} />
              <h2 className="text-xl font-semibold">
                Create Your Learning Path
              </h2>
            </div>
            <p className="text-blue-100 text-sm">
              Provide your learning objective and final goal to generate a
              detailed, actionable roadmap
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Learning Objective Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target
                    className="text-blue-600 dark:text-blue-400"
                    size={18}
                  />
                </div>
                <div>
                  <label
                    htmlFor="objective"
                    className="block text-lg font-semibold text-gray-800 dark:text-white"
                  >
                    Your Learning Objective
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    What do you want to learn or master?
                  </p>
                </div>
              </div>

              <textarea
                id="objective"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         transition-all duration-200 resize-none"
                rows="4"
                placeholder="Example: Master Data Science fundamentals to analyze complex datasets and build predictive models"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lightbulb size={14} />
                <span>Be specific about what you want to learn and why</span>
              </div>
            </div>

            {/* Final Goal Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Rocket
                    className="text-green-600 dark:text-green-400"
                    size={18}
                  />
                </div>
                <div>
                  <label
                    htmlFor="finalGoal"
                    className="block text-lg font-semibold text-gray-800 dark:text-white"
                  >
                    Your Concrete Final Goal
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    What specific project or outcome do you want to achieve?
                  </p>
                </div>
              </div>

              <textarea
                id="finalGoal"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         transition-all duration-200 resize-none"
                rows="4"
                placeholder="Example: Develop an end-to-end machine learning project for predicting stock prices with 85% accuracy"
                value={finalGoal}
                onChange={(e) => setFinalGoal(e.target.value)}
              />

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lightbulb size={14} />
                <span>Include measurable outcomes and deliverables</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              {isResumable && !loading && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">
                      Incomplete Roadmap Detected
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
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
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6
                               rounded-lg shadow-md transition-all duration-300 hover:shadow-lg
                               transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Play size={20} />
                      Resume Generation
                    </button>
                  )}

                  <button
                    onClick={handleGenerate}
                    className={`${isResumable && !loading ? "flex-1" : "w-full"} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                             text-white font-semibold py-3 px-6 rounded-lg shadow-md
                             transition-all duration-300 hover:shadow-lg transform hover:scale-105
                             flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md`}
                    disabled={!objective.trim() || !finalGoal.trim()}
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
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <Loader
                          className="animate-spin text-blue-600 dark:text-blue-400"
                          size={18}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {loadingMessage ||
                          "Generating your personalized roadmap..."}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Generation in progress. Click "Generate Roadmap" again
                        to add more to queue.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 bg-blue-200 dark:bg-blue-800 rounded-full h-1">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-1 rounded-full animate-pulse"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                        <AlertCircle
                          className="text-red-600 dark:text-red-400"
                          size={18}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Generation Failed
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles
                className="text-purple-600 dark:text-purple-400"
                size={16}
              />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
              AI Powered
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Personalized learning paths designed for you
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Brain className="text-blue-600 dark:text-blue-400" size={16} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
              Instant Generation
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Generate immediately and pause other work
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="text-green-600 dark:text-green-400" size={16} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
              Smart Queue
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Auto-queues when busy, generates immediately when free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoadmapTab;
