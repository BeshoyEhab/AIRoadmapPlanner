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
    px-3 sm:px-5 py-2.5 rounded-xl text-sm font-semibold nav-tab-button whitespace-nowrap transition-all duration-300
    ${
      isActive
        ? "bg-gradient-theme text-white shadow-glow-theme transform scale-105 border border-theme-primary"
        : "bg-transparent text-secondary hover:bg-theme-primary/10 hover:text-main hover:shadow-glow-theme-subtle hover:scale-102 border border-transparent hover:border-theme-primary/30"
    }
  `;

  const iconButtonClasses = `
    p-3 rounded-xl text-muted hover:bg-hover hover:text-content
    icon-button hover:shadow-md min-w-[2.75rem] flex items-center justify-center ml-2 transition-all duration-200 hover:scale-105
  `;

  return (
    <header className="shadow-lg border-b border-default z-10 sticky top-0 backdrop-blur-sm">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between relative header-wrapper">
          {/* Left Section - Logo and Text with Gradient Background */}
          <div className="flex shrink-0 items-center">
            <div className="relative flex items-center group">
              {/* Gradient Background */}
              <div className="absolute -inset-2 bg-gradient-to-r from-theme-primary/20 via-theme-accent/10 to-theme-primary/20 rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-all duration-500"></div>
              
              {/* Content */}
              <div className="relative flex items-center">
                <div className="relative p-3 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl shadow-lg logo-container hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Brain size={28} className="text-white logo-brain transition-transform duration-300 group-hover:rotate-12" />
                  <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse opacity-30"></div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-main whitespace-nowrap tracking-tight">
                    AI Roadmap
                  </h1>
                  <p className="text-xs text-secondary font-medium">
                    Study Planner
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="flex justify-center px-4 max-w-[450px] w-full mx-auto">
            <div className="flex space-x-1 sm:space-x-2 p-1.5 rounded-2xl shadow-inner border border-default backdrop-blur-sm">
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
                <Moon size={22} className="text-theme-primary" />
              ) : (
                <Sun size={22} className="text-warning" />
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
                  className="text-theme-primary"
                />
              ) : (
                <Maximize
                  size={22}
                  className="text-theme-primary"
                />
              )}
            </button>

            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <button
                  className={`${iconButtonClasses} relative hover:shadow-glow-theme`}
                  title="Settings"
                >
                  <SettingsIcon
                    size={22}
                    className="text-theme-primary transition-all duration-300 hover:scale-110"
                  />
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-96 border-l border-default">
                <SheetHeader className="pb-4 border-b border-default">
                  <SheetTitle className="text-xl font-bold text-content flex items-center gap-2">
                    <SettingsIcon size={20} className="text-theme-primary" />
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
