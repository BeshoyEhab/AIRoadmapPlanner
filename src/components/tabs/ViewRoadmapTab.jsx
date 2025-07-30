import React from 'react';
import { Search, Brain } from 'lucide-react';
import RoadmapContent from '../RoadmapContent';

const ViewRoadmapTab = ({ roadmap, setActiveTab, objective, finalGoal, saveCurrentRoadmap, downloadMarkdown, exportToPDF, handleCopyCode, handlePrint, toggleMiniGoal, calculateOverallProgress, setRoadmap }) => (
  <div className="p-4 sm:p-6 lg:p-8">
    {roadmap ? (
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
