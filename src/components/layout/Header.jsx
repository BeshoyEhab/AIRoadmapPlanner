import React, { useState } from 'react';
import { Brain, Menu, Sun, Moon, Maximize, Minimize, Settings as SettingsIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetOverlay } from '@/components/ui/sheet';
import Settings from '@/components/settings/Settings';

const Header = ({ toggleSidebar, activeTab, setActiveTab, theme, toggleTheme, fullScreenMode, toggleFullScreen, onSave }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSave = () => {
    onSave();
    setIsSettingsOpen(false);
  };

  return (
  <header className="bg-white dark:bg-gray-800 shadow-sm z-10 sticky top-0">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-gray-600 dark:text-gray-300 lg:hidden">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Brain size={24} className="text-blue-500" />
          AI Study Planner
        </h1>
      </div>
      <nav className="hidden lg:flex space-x-4">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Create Roadmap
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'view'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          View Roadmap
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Saved Plans
        </button>
      </nav>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button
          onClick={toggleFullScreen}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hidden sm:block"
          title="Toggle Fullscreen"
        >
          {fullScreenMode ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </SheetTrigger>
          <SheetOverlay className="bg-black/50" />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <Settings onSave={handleSave} theme={theme} toggleTheme={toggleTheme} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
  );
};

export default Header;
