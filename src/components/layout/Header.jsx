import React, { useState } from "react";
import {
  Brain,
  Menu,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetOverlay,
} from "@/components/ui/sheet";
import Settings from "@/components/settings/Settings";

const Header = ({
  toggleSidebar,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  fullScreenMode,
  toggleFullScreen,
  onSave,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSave = () => {
    onSave();
    setIsSettingsOpen(false);
  };

  const tabButtonClasses = (isActive) => `
    px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
    ${
      isActive
        ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 shadow-md transform scale-105"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:shadow-sm"
    }
  `;

  const iconButtonClasses = `
    p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700
    transition-all duration-300 hover:shadow-md transform hover:scale-105
  `;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={`${iconButtonClasses} lg:hidden`}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Brain size={24} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                AI Study Planner
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Powered by AI
              </p>
            </div>
            <h1 className="sm:hidden text-lg font-bold text-gray-800 dark:text-white">
              Study Planner
            </h1>
          </div>
        </div>

        {/* Center Navigation - Desktop */}
        <nav className="hidden lg:flex space-x-2 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg shadow-inner">
          <button
            onClick={() => setActiveTab("create")}
            className={tabButtonClasses(activeTab === "create")}
          >
            Create Roadmap
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={tabButtonClasses(activeTab === "view")}
          >
            View Roadmap
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={tabButtonClasses(activeTab === "ongoing")}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={tabButtonClasses(activeTab === "saved")}
          >
            Saved Plans
          </button>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={iconButtonClasses}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon size={20} className="text-blue-600" />
            ) : (
              <Sun size={20} className="text-yellow-500" />
            )}
          </button>

          <button
            onClick={toggleFullScreen}
            className={`${iconButtonClasses} hidden sm:block`}
            title={`${fullScreenMode ? "Exit" : "Enter"} fullscreen`}
          >
            {fullScreenMode ? (
              <Minimize
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            ) : (
              <Maximize
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            )}
          </button>

          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <button
                className={`${iconButtonClasses} relative`}
                title="Settings"
              >
                <SettingsIcon
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              </button>
            </SheetTrigger>
            <SheetOverlay className="bg-black/50 backdrop-blur-sm" />
            <SheetContent className="w-full sm:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
              <SheetHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <SheetTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <SettingsIcon size={20} className="text-blue-500" />
                  Settings
                </SheetTitle>
              </SheetHeader>
              <Settings
                onSave={handleSave}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-4 py-2">
        <nav className="flex justify-center space-x-1">
          <button
            onClick={() => setActiveTab("create")}
            className={`${tabButtonClasses(activeTab === "create")} text-xs px-2 py-2`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`${tabButtonClasses(activeTab === "view")} text-xs px-2 py-2`}
          >
            View
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`${tabButtonClasses(activeTab === "ongoing")} text-xs px-2 py-2`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`${tabButtonClasses(activeTab === "saved")} text-xs px-2 py-2`}
          >
            Saved
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
