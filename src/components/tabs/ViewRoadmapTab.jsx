import React, { useState, useEffect } from "react";
import { Search, Brain, Download, Save, Copy, AlertCircle } from "lucide-react";
import RoadmapContent from "../RoadmapContent";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";

const ViewRoadmapTab = ({
  roadmap,
  setActiveTab,
  objective,
  finalGoal,
  saveCurrentRoadmap,
  downloadMarkdown,
  exportToJSON,
  exportToPDF,
  exportToHTML,
  toggleMiniGoal,
  calculateOverallProgress,
  calculatePhaseProgress,
  setRoadmap,
  error,
  loading,
  loadingMessage,
  interruptGeneration,
  generateRoadmap,
  addToQueue,
  removeFromQueue,
  generationQueue,
  currentlyGenerating,
  toggleFavorite,
  isFavorite,
}) => {
  const [exportFormat, setExportFormat] = useState("markdown");

  useEffect(() => {
    const savedExportFormat = localStorage.getItem("export-format");
    if (savedExportFormat) {
      setExportFormat(savedExportFormat);
    }
  }, []);

  // Export functions are now provided by the useRoadmap hook

  // Add handleCopyCode to copy roadmap JSON to clipboard
  const handleCopyCode = () => {
    if (!roadmap) return;
    navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2));
  };

  // Add handlePrint to print the roadmap
  const handlePrint = () => {
    window.print();
  };

  if (!roadmap) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Empty State Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl shadow-lg mb-6">
            <Search size={40} className="text-gray-400 dark:text-gray-500" />
          </div>

          {/* Empty State Content */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            No Roadmap Found
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            You haven't generated a roadmap yet. Create your first AI-powered
            learning plan to get started on your journey!
          </p>

          {/* Action Button */}
          <button
            onClick={() => setActiveTab("create")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                     text-white font-semibold py-3 px-8 rounded-lg shadow-lg
                     transition-all duration-300 hover:shadow-glow-blue
                     flex items-center justify-center gap-3 mx-auto"
          >
            <Brain size={20} />
            Generate New Roadmap
          </button>

          {/* Additional Help */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Be specific about your learning
              objectives and final goals to get the most personalized roadmap.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
                Generation Error
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RoadmapContent
          roadmap={roadmap}
          objective={objective}
          finalGoal={finalGoal}
          toggleMiniGoal={toggleMiniGoal}
          calculateOverallProgress={calculateOverallProgress}
          calculatePhaseProgress={calculatePhaseProgress}
          setRoadmap={setRoadmap}
          saveCurrentRoadmap={saveCurrentRoadmap}
          downloadMarkdown={downloadMarkdown}
          exportToJSON={exportToJSON}
          exportToPDF={exportToPDF}
          exportToHTML={exportToHTML}
          handleCopyCode={handleCopyCode}
          handlePrint={handlePrint}
          loading={loading}
          loadingMessage={loadingMessage}
          interruptGeneration={interruptGeneration}
          generateRoadmap={generateRoadmap}
          error={error}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          showActionButtons={true}
          addToQueue={addToQueue}
          removeFromQueue={removeFromQueue}
          generationQueue={generationQueue}
          currentlyGenerating={currentlyGenerating}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
        />
      </div>
    </div>
  );
};

export default ViewRoadmapTab;
