import React, { useState, memo } from "react";
import "./Header.css";
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
    px-2 sm:px-4 py-2 rounded-lg text-sm font-semibold nav-tab-button whitespace-nowrap
    ${
      isActive
        ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 shadow-md transform scale-105"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:shadow-sm"
    }
  `;

  const iconButtonClasses = `
    p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700
    icon-button hover:shadow-glow-white min-w-[2.5rem] flex items-center justify-center ml-2
  `;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between relative header-wrapper">
          {/* Left Section - Logo and Text */}
          <div className="flex shrink-0 items-center">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md logo-container">
                <Brain size={24} className="text-white logo-brain" />
              </div>
              <h1 className="ml-2 text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap">
                AISRP
              </h1>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="flex justify-center px-4 max-w-[400px] w-full mx-auto">
            <div className="flex space-x-1 sm:space-x-2 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg shadow-inner">
              <button
                onClick={() => setActiveTab("create")}
                className={tabButtonClasses(activeTab === "create")}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={tabButtonClasses(activeTab === "view")}
              >
                View
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
                Saved
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex shrink-0 items-center">
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
      </div>
    </header>
  );
};

export default memo(Header);
