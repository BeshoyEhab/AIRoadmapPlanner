import React, { useState, useEffect } from 'react';
import { Search, Brain, Play, Pause, Loader, Download, Save, Copy, Printer, AlertCircle } from 'lucide-react';
import RoadmapContent from '../RoadmapContent';

const ViewRoadmapTab = ({ 
  roadmap, 
  setActiveTab, 
  objective, 
  finalGoal, 
  saveCurrentRoadmap, 
  downloadMarkdown, 
  exportToPDF, 
  exportToHTML, 
  handleCopyCode, 
  handlePrint, 
  toggleMiniGoal, 
  calculateOverallProgress, 
  setRoadmap, 
  loading, 
  loadingMessage, 
  interruptGeneration, 
  generateRoadmap, 
  error 
}) => {
  const [exportFormat, setExportFormat] = useState('markdown');

  useEffect(() => {
    const savedExportFormat = localStorage.getItem('export-format');
    if (savedExportFormat) {
      setExportFormat(savedExportFormat);
    }
  }, []);

  const handleExport = () => {
    switch (exportFormat) {
      case 'markdown':
        downloadMarkdown();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'html':
        exportToHTML();
        break;
      default:
        downloadMarkdown();
    }
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
            You haven't generated a roadmap yet. Create your first AI-powered learning plan to get started on your journey!
          </p>
          
          {/* Action Button */}
          <button
            onClick={() => setActiveTab('create')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                     text-white font-semibold py-3 px-8 rounded-lg shadow-lg 
                     transition-all duration-300 hover:shadow-xl transform hover:scale-105 
                     flex items-center justify-center gap-3 mx-auto"
          >
            <Brain size={20} />
            Generate New Roadmap
          </button>
          
          {/* Additional Help */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Be specific about your learning objectives and final goals to get the most personalized roadmap.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Generation Controls */}
            <div className="flex items-center gap-3">
              {roadmap && roadmap.generationState === 'in-progress' && !loading && roadmap.phases.some(p => p.progressPercentage < 100) && (
                <button
                  onClick={() => generateRoadmap(true, roadmap)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center gap-2"
                >
                  <Play size={18} />
                  Resume Generation
                </button>
              )}
              
              {loading && (
                <button
                  onClick={interruptGeneration}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center gap-2"
                >
                  <Pause size={18} />
                  Interrupt Generation
                </button>
              )}
            </div>

            {/* Loading Status */}
            {loading && (
              <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                <Loader className="animate-spin text-blue-600 dark:text-blue-400" size={18} />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {loadingMessage}
                </span>
              </div>
            )}

            {/* Export Actions */}
            {!loading && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={saveCurrentRoadmap}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center gap-2 text-sm"
                  title="Save Roadmap"
                >
                  <Save size={16} />
                  <span className="hidden sm:inline">Save</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center gap-2 text-sm"
                  title={`Download as ${exportFormat.toUpperCase()}`}
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export as {exportFormat.toUpperCase()}</span>
                </button>
                
                <button
                  onClick={handleCopyCode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center gap-2 text-sm"
                  title="Copy JSON"
                >
                  <Copy size={16} />
                  <span className="hidden sm:inline">Copy</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-600 dark:text-red-400" size={18} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Generation Error
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

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      </div>
    </div>
  );
};

export default ViewRoadmapTab;
