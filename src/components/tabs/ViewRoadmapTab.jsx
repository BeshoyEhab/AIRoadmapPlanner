import React from 'react';
import { Search, Brain } from 'lucide-react';
import RoadmapContent from '../RoadmapContent';

import { Play, Pause, Loader } from 'lucide-react';

const ViewRoadmapTab = ({ roadmap, setActiveTab, objective, finalGoal, saveCurrentRoadmap, downloadMarkdown, exportToPDF, handleCopyCode, handlePrint, toggleMiniGoal, calculateOverallProgress, setRoadmap, loading, loadingMessage, interruptGeneration, generateRoadmap, error }) => (
  <div className="p-4 sm:p-6 lg:p-8">
    {roadmap ? (
      <>
        <div className="flex justify-center space-x-4 mb-4">
          {roadmap && roadmap.generationState === 'in-progress' && !loading && (
            <button
              onClick={() => generateRoadmap(true, roadmap)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center"
            >
              <Play className="mr-2" size={18} /> Resume Generation
            </button>
          )}
          {loading && (
            <button
              onClick={interruptGeneration}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center"
            >
              <Pause className="mr-2" size={18} /> Interrupt Generation
            </button>
          )}
          {loading && (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <Loader className="animate-spin mr-2" size={18} /> {loadingMessage}
            </div>
          )}
        </div>
        <RoadmapContent
          roadmap={roadmap}
          objective={objective}
          finalGoal={finalGoal}
          saveCurrentRoadmap={saveCurrentRoadmap}
          downloadMarkdown={downloadMarkdown}
          exportToPDF={exportToPDF}
          handleCopyCode={handleCopyCode}
          handlePrint={handlePrint}
          toggleMiniGoal={toggleMiniGoal}
          calculateOverallProgress={calculateOverallProgress}
          setRoadmap={setRoadmap}
        />
      </>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-gray-600 dark:text-gray-300">
        <Search size={48} className="mb-4 text-gray-400 dark:text-gray-500" />
        <p className="text-lg">No roadmap generated yet. Go to the "Create Roadmap" tab to get started!</p>
        <button
          onClick={() => setActiveTab('create')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-colors duration-300 flex items-center"
        >
          <Brain className="mr-2" size={18} /> Generate New Roadmap
        </button>
      </div>
    )}
  </div>
);

export default ViewRoadmapTab;
