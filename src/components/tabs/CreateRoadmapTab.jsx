import React from 'react';
import { Brain, Sparkles, Loader, AlertCircle, Play, Pause } from 'lucide-react';

const CreateRoadmapTab = ({ 
  objective, 
  setObjective, 
  finalGoal, 
  setFinalGoal, 
  generateRoadmap, 
  loading, 
  loadingMessage, 
  error,
  interruptGeneration,
  roadmap
}) => {
  const isResumable = roadmap && roadmap.generationState === 'in-progress';

  const handleGenerate = () => {
    generateRoadmap(false);
  };

  const handleResume = () => {
    generateRoadmap(true, roadmap);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          <Sparkles className="inline-block mr-2 text-blue-500" size={28} />
          AI Study Roadmap Planner
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
          Define your learning objective and final goal to generate a personalized, comprehensive study roadmap.
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Your Learning Objective
            </label>
            <textarea
              id="objective"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
              rows="3"
              placeholder="e.g., Master Data Science fundamentals to analyze complex datasets"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="finalGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Your Concrete Final Goal
            </label>
            <textarea
              id="finalGoal"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
              rows="3"
              placeholder="e.g., Develop an end-to-end machine learning project for predicting stock prices"
              value={finalGoal}
              onChange={(e) => setFinalGoal(e.target.value)}
            ></textarea>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleGenerate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !objective || !finalGoal}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-3" size={20} /> {loadingMessage || 'Generating...'}
                </>
              ) : (
                <>
                  <Brain className="mr-3" size={20} /> Generate Roadmap
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg flex items-center">
              <AlertCircle className="mr-3" size={20} />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRoadmapTab;
