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
    px-3 sm:px-5 py-2.5 rounded-xl text-sm font-semibold nav-tab-button whitespace-nowrap transition-all duration-200
    ${
      isActive
        ? "bg-primary text-primary-foreground shadow-lg transform scale-105 ring-2 ring-primary/20"
        : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm hover:scale-102"
    }
  `;

  const iconButtonClasses = `
    p-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground
    icon-button hover:shadow-md min-w-[2.75rem] flex items-center justify-center ml-2 transition-all duration-200 hover:scale-105
  `;

  return (
    <header className="bg-background/95 backdrop-blur-md shadow-lg border-b border-border z-10 sticky top-0 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between relative header-wrapper">
          {/* Left Section - Logo and Text */}
          <div className="flex shrink-0 items-center">
            <div className="flex items-center group">
              <div className="relative p-3 bg-primary rounded-xl shadow-lg logo-container hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Brain size={28} className="text-primary-foreground logo-brain transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse opacity-50"></div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-foreground whitespace-nowrap tracking-tight">
                  AI Roadmap
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Study Planner
                </p>
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="flex justify-center px-4 max-w-[450px] w-full mx-auto">
            <div className="flex space-x-1 sm:space-x-2 bg-muted/50 p-1.5 rounded-2xl shadow-inner backdrop-blur-sm border border-border/50">
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
                <Moon size={22} className="text-primary" />
              ) : (
                <Sun size={22} className="text-yellow-500" />
              )}
            </button>

            <button
              onClick={toggleFullScreen}
              className={`${iconButtonClasses} hidden sm:block`}
              title={`${fullScreenMode ? "Exit" : "Enter"} fullscreen`}
            >
              {fullScreenMode ? (
                <Minimize
                  size={22}
                  className="text-muted-foreground"
                />
              ) : (
                <Maximize
                  size={22}
                  className="text-muted-foreground"
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
                    size={22}
                    className="text-muted-foreground"
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
