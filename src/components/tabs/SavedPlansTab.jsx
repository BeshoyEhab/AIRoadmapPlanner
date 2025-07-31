import React from 'react';
import { BookOpen, Calendar, Clock, Trash2, Eye, Search, FolderOpen, Plus, Brain } from 'lucide-react';

const SavedPlansTab = ({ 
  savedTimeplans, 
  loadRoadmap, 
  deleteRoadmap, 
  setActiveTab, 
  isDeleteDialogOpen, 
  setIsDeleteDialogOpen, 
  handleDeleteConfirm 
}) => {
  if (savedTimeplans.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Empty State Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl shadow-lg mb-6">
            <FolderOpen size={40} className="text-gray-400 dark:text-gray-500" />
          </div>
          
          {/* Empty State Content */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            No Saved Plans Yet
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            You haven't saved any learning roadmaps yet. Create and save your first personalized study plan to build your learning library!
          </p>
          
          {/* Action Button */}
          <button
            onClick={() => setActiveTab('create')}
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
              💡 <strong>Tip:</strong> Save your roadmaps to track progress, resume generation, and organize multiple learning paths.
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
                  {savedTimeplans.length} {savedTimeplans.length === 1 ? 'Plan' : 'Plans'} Saved
                </span>
              </div>
              
              <button
                onClick={() => setActiveTab('create')}
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {savedTimeplans.map((timeplan) => (
            <div
              key={timeplan.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 
                       hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                      {timeplan.name}
                    </h3>
                    {timeplan.objective && (
                      <p className="text-blue-100 text-sm line-clamp-2">
                        {timeplan.objective}
                      </p>
                    )}
                  </div>
                  <div className="ml-2">
                    <Brain size={20} className="text-blue-200" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-1">
                      <Calendar className="text-blue-600 dark:text-blue-400" size={16} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {timeplan.phases?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phases</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-1">
                      <Clock className="text-green-600 dark:text-green-400" size={16} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {timeplan.totalDuration || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  </div>
                </div>

                {/* Progress Bar (if available) */}
                {timeplan.phases && timeplan.phases.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {Math.round((timeplan.phases.filter(p => p.progressPercentage === 100).length / timeplan.phases.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round((timeplan.phases.filter(p => p.progressPercentage === 100).length / timeplan.phases.length) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {timeplan.difficultyLevel && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 
                                   text-xs font-medium rounded-full">
                      {timeplan.difficultyLevel}
                    </span>
                  )}
                  {timeplan.phases && timeplan.phases.length > 0 && timeplan.phases.some(p => p.progressPercentage < 100) && timeplan.generationState !== 'completed' && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 
                                   text-xs font-medium rounded-full">
                      Incomplete
                    </span>
                  )}
                  {timeplan.phases && timeplan.phases.length > 0 && timeplan.phases.every(p => p.progressPercentage === 100) && timeplan.generationState === 'completed' && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 
                                   text-xs font-medium rounded-full">
                      Complete
                    </span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => {
                    if (loadRoadmap(timeplan.id)) {
                      setActiveTab('view');
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  <span className="text-sm">View</span>
                </button>
                
                <button
                  onClick={() => deleteRoadmap(timeplan.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 
                           rounded-lg shadow-md transition-all duration-300 hover:shadow-lg 
                           transform hover:scale-105 flex items-center justify-center"
                  title="Delete roadmap"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Search size={20} className="text-blue-500" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('create')}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                       border border-blue-200 dark:border-blue-800 rounded-lg 
                       hover:shadow-md transition-all duration-300 transform hover:scale-105 text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <Plus className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">Create New</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate a fresh learning roadmap
              </p>
            </button>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 
                          border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-gray-600 dark:text-gray-400" size={16} />
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">Total Plans</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {savedTimeplans.length} roadmaps saved
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50-to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                          border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <Calendar className="text-green-600 dark:text-green-400" size={16} />
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">Completed</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {savedTimeplans.filter(tp => tp.generationState === 'completed').length} finished plans
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPlansTab;
