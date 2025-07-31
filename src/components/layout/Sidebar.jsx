import React from 'react';
import { X, Sun, Moon, Maximize, Minimize, Plus, BookOpen, Eye, Trash2, Calendar, Brain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  fullScreenMode, 
  toggleFullScreen, 
  savedTimeplans, 
  loadRoadmap, 
  deleteRoadmap, 
  sidebarRef 
}) => (
  <div 
    ref={sidebarRef} 
    className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 z-30 
                transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                transition-transform duration-300 ease-in-out lg:hidden 
                shadow-2xl border-r border-gray-200 dark:border-gray-700 flex flex-col`}
  >
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Study Planner</h2>
          <p className="text-blue-100 text-xs">Navigation Menu</p>
        </div>
      </div>
      <button 
        onClick={toggleSidebar} 
        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
      >
        <X size={20} />
      </button>
    </div>

    <ScrollArea className="flex-1 h-full overflow-y-auto">
      <div className="p-4">
        {/* Navigation */}
        <nav className="space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Main Navigation
            </h3>
            
            <button
              onClick={() => { setActiveTab('create'); toggleSidebar(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 shadow-md transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === 'create' 
                  ? 'bg-blue-200 dark:bg-blue-700' 
                  : 'bg-gray-100 dark:bg-gray-600'
              }`}>
                <Plus size={16} className={activeTab === 'create' ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'} />
              </div>
              <div>
                <span className="block">Create Roadmap</span>
                <span className="text-xs opacity-75">Generate new learning plan</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('view'); toggleSidebar(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-300 ${
                activeTab === 'view'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 shadow-md transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === 'view' 
                  ? 'bg-blue-200 dark:bg-blue-700' 
                  : 'bg-gray-100 dark:bg-gray-600'
              }`}>
                <Eye size={16} className={activeTab === 'view' ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'} />
              </div>
              <div>
                <span className="block">View Roadmap</span>
                <span className="text-xs opacity-75">Review current plan</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('saved'); toggleSidebar(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-300 ${
                activeTab === 'saved'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 shadow-md transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === 'saved' 
                  ? 'bg-blue-200 dark:bg-blue-700' 
                  : 'bg-gray-100 dark:bg-gray-600'
              }`}>
                <BookOpen size={16} className={activeTab === 'saved' ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="block">Saved Plans</span>
                  {savedTimeplans.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {savedTimeplans.length}
                    </span>
                  )}
                </div>
                <span className="text-xs opacity-75">Manage your roadmaps</span>
              </div>
            </button>
          </div>

          {/* Settings */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Settings
            </h3>
            
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium 
                       text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 
                       transition-all duration-300 hover:shadow-sm"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                {theme === 'light' ? (
                  <Moon size={16} className="text-indigo-600" />
                ) : (
                  <Sun size={16} className="text-yellow-500" />
                )}
              </div>
              <div>
                <span className="block">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span className="text-xs opacity-75">Toggle theme</span>
              </div>
            </button>

            <button
              onClick={toggleFullScreen}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium 
                       text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 
                       transition-all duration-300 hover:shadow-sm"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                {fullScreenMode ? (
                  <Minimize size={16} className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <Maximize size={16} className="text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div>
                <span className="block">
                  {fullScreenMode ? 'Exit Fullscreen' : 'Fullscreen'}
                </span>
                <span className="text-xs opacity-75">Toggle fullscreen mode</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Saved Timeplans Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recent Plans
            </h3>
            {savedTimeplans.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {savedTimeplans.length} total
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {savedTimeplans.length > 0 ? (
              savedTimeplans.slice(0, 5).map(timeplan => (
                <div 
                  key={timeplan.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 
                           hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-2 flex-1">
                      {timeplan.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{timeplan.phases?.length || 0} phases</span>
                    </div>
                    {timeplan.generationState && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        timeplan.generationState === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {timeplan.generationState === 'completed' ? 'Complete' : 'In Progress'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        if (loadRoadmap(timeplan.id)) {
                          setActiveTab('view');
                          toggleSidebar();
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium 
                               py-2 px-3 rounded-md transition-all duration-300 hover:shadow-md 
                               transform hover:scale-105 flex items-center justify-center gap-1"
                    >
                      <Eye size={12} />
                      View
                    </button>
                    
                    <button
                      onClick={() => deleteRoadmap(timeplan.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium 
                               py-2 px-2 rounded-md transition-all duration-300 hover:shadow-md 
                               transform hover:scale-105 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No saved plans yet</p>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    toggleSidebar();
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                           font-medium transition-colors duration-200"
                >
                  Create your first roadmap
                </button>
              </div>
            )}
            
            {savedTimeplans.length > 5 && (
              <button
                onClick={() => {
                  setActiveTab('saved');
                  toggleSidebar();
                }}
                className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                         font-medium py-2 text-center transition-colors duration-200"
              >
                View all {savedTimeplans.length} plans →
              </button>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>

    {/* Footer */}
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex-shrink-0">
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          AI Study Planner
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Powered by Gemini AI
        </p>
      </div>
    </div>
  </div>
);

export default Sidebar;
