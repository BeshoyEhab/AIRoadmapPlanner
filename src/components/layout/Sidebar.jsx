import React from 'react';
import { X, Sun, Moon, Maximize, Minimize } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar, activeTab, setActiveTab, theme, toggleTheme, fullScreenMode, toggleFullScreen, savedTimeplans, loadRoadmap, deleteRoadmap }) => (
  <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden shadow-lg`}>
    <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
      <button onClick={toggleSidebar} className="text-gray-600 dark:text-gray-300">
        <X size={24} />
      </button>
    </div>
    <nav className="flex flex-col p-4 space-y-2">
      <button
        onClick={() => { setActiveTab('create'); toggleSidebar(); }}
        className={`px-4 py-2 rounded-lg text-left text-base font-medium transition-colors ${
          activeTab === 'create'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Create Roadmap
      </button>
      <button
        onClick={() => { setActiveTab('view'); toggleSidebar(); }}
        className={`px-4 py-2 rounded-lg text-left text-base font-medium transition-colors ${
          activeTab === 'view'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        View Roadmap
      </button>
      <button
        onClick={() => { setActiveTab('saved'); toggleSidebar(); }}
        className={`px-4 py-2 rounded-lg text-left text-base font-medium transition-colors ${
          activeTab === 'saved'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Saved Plans
      </button>
      <button
        onClick={toggleTheme}
        className="flex items-center px-4 py-2 rounded-lg text-left text-base font-medium transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        {theme === 'light' ? <Moon size={20} className="mr-2" /> : <Sun size={20} className="mr-2" />}
        Toggle Theme
      </button>
      <button
        onClick={toggleFullScreen}
        className="flex items-center px-4 py-2 rounded-lg text-left text-base font-medium transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        {fullScreenMode ? <Minimize size={20} className="mr-2" /> : <Maximize size={20} className="mr-2" />}
        Toggle Fullscreen
      </button>
    </nav>
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Saved Timeplans</h3>
      <div className="space-y-2">
        {savedTimeplans.map(tp => (
          <div key={tp.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <button onClick={() => {
              if (loadRoadmap(tp.id)) {
                setActiveTab('view');
                toggleSidebar();
              }
            }} className="text-left flex-1">
              <span className="font-medium text-gray-800 dark:text-gray-200">{tp.name}</span>
            </button>
            <button onClick={() => deleteRoadmap(tp.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              <X size={18} />
            </button>
          </div>
        ))}
        {savedTimeplans.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No saved timeplans yet.</p>
        )}
      </div>
    </div>
  </div>
);

export default Sidebar;
