import React, { useState, useEffect, useRef } from "react";
import useRoadmap from "./hooks/useRoadmap";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import CreateRoadmapTab from "./components/tabs/CreateRoadmapTab";
import ViewRoadmapTab from "./components/tabs/ViewRoadmapTab";
import SavedPlansTab from "./components/tabs/SavedPlansTab";
import OngoingTab from "./components/tabs/OngoingTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./App.css";

const App = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme : "dark";
  });
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  const [activeTab, setActiveTab] = useState("create");
  const [apiKeyStatus, setApiKeyStatus] = useState("checking");

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem("gemini-api-key");
      if (apiKey) {
        setApiKeyStatus("present");
      } else {
        setApiKeyStatus("missing");
      }
    };
    checkApiKey();
  }, []);

  const handleSettingsSave = () => {
    setApiKeyStatus("present");
  };

  const {
    objective,
    setObjective,
    finalGoal,
    setFinalGoal,
    roadmap,
    setRoadmap,
    loading,
    error,
    loadingMessage,
    savedTimeplans,
    saveCurrentRoadmap,
    loadRoadmap,
    deleteRoadmap,
    generateRoadmap,
    toggleMiniGoal,
    calculateOverallProgress,
    interruptGeneration,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    roadmapName,
    setRoadmapName,
    handleSaveConfirm,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteConfirm,
    // Queue management
    generationQueue,
    incompleteRoadmaps,
    isQueuePaused,
    currentlyGenerating,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    retryGeneration,
  } = useRoadmap({ setActiveTab });

  // Enhanced theme effect with proper document class management
  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Apply theme to document root
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Set theme attribute for additional styling hooks
    root.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#1a1a1a" : "#ffffff",
      );
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setFullScreenMode(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
          );
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setFullScreenMode(false);
        })
        .catch((err) => {
          console.error(
            `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
          );
        });
    }
  };

  const downloadMarkdown = () => {
    if (!roadmap) return;

    let markdown = `# ${roadmap.title}\n\n`;
    markdown += `**Total Duration:** ${roadmap.totalDuration}\n`;
    markdown += `**Difficulty Level:** ${roadmap.difficultyLevel || "Not specified"}\n`;
    markdown += `**Total Estimated Hours:** ${roadmap.totalEstimatedHours || "Not specified"}\n`;
    markdown += `**Number of Phases:** ${roadmap.phases?.length}\n\n`;
    markdown += `**Learning Objective:** ${objective}\n`;
    markdown += `**Final Goal:** ${finalGoal}\n\n`;
    markdown += `---\n\n`;

    roadmap.phases.forEach((phase) => {
      markdown += `## Phase ${phase.phaseNumber}: ${phase.title}\n\n`;
      markdown += `**Duration:** ${phase.duration}\n`;
      markdown += `**Goal:** ${phase.goal}\n`;

      if (phase.progressPercentage !== undefined) {
        markdown += `**Progress:** ${phase.progressPercentage}%\n`;
      }
      markdown += `\n`;

      if (phase.miniGoals && phase.miniGoals.length > 0) {
        markdown += `### Mini-Goals\n\n`;
        phase.miniGoals.forEach((miniGoal, mgIndex) => {
          const status = miniGoal.completed ? "✅" : "⬜";
          markdown += `${mgIndex + 1}. ${status} **${miniGoal.title}** (${miniGoal.estimatedTime})\n`;
          markdown += `   - ${miniGoal.description}\n`;
          if (miniGoal.url) {
            markdown += `   - Link: [${miniGoal.url}](${miniGoal.url})\n`;
          }
          if (miniGoal.priority) {
            markdown += `   - Priority: ${miniGoal.priority}\n`;
          }
          if (miniGoal.completedDate) {
            markdown += `   - Completed: ${new Date(miniGoal.completedDate).toLocaleDateString()}\n`;
          }
          markdown += `\n`;
        });
      }

      markdown += `### Resources\n\n`;
      phase.resources.forEach((resource, resIndex) => {
        markdown += `${resIndex + 1}. **${resource.name}**`;
        if (resource.type) markdown += ` (${resource.type})`;
        markdown += `\n`;
        if (resource.url) {
          markdown += `   - Link: [${resource.url}](${resource.url})\n`;
        }
        markdown += `   - Description: ${resource.description}\n`;
        if (resource.difficulty) {
          markdown += `   - Difficulty: ${resource.difficulty}\n`;
        }
        if (resource.estimatedTime) {
          markdown += `   - Time: ${resource.estimatedTime}\n`;
        }
        markdown += `\n`;
      });

      markdown += `### Phase Project\n\n`;
      if (typeof phase.project === "object") {
        markdown += `**${phase.project.title}**\n\n`;
        markdown += `${phase.project.description}\n\n`;

        if (phase.project.deliverables) {
          markdown += `**Deliverables:**\n`;
          phase.project.deliverables.forEach((deliverable) => {
            markdown += `- ${deliverable}\n`;
          });
          markdown += `\n`;
        }

        if (phase.project.monetizationPotential) {
          markdown += `**Monetization Potential:** ${phase.project.monetizationPotential}\n\n`;
        }
      } else {
        markdown += `${phase.project}\n\n`;
      }

      if (phase.milestone) {
        markdown += `**Milestone:** ${phase.milestone}\n\n`;
      }

      markdown += `### Skills You'll Gain\n\n`;
      phase.skills.forEach((skill) => {
        markdown += `- ${skill}\n`;
      });
      markdown += `\n---\n\n`;
    });

    if (
      roadmap.motivationMilestones &&
      roadmap.motivationMilestones.length > 0
    ) {
      markdown += `## 🎯 Motivation Milestones\n\n`;
      roadmap.motivationMilestones.forEach((milestone) => {
        markdown += `- ${milestone}\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.careerProgression && roadmap.careerProgression.length > 0) {
      markdown += `## 🚀 Career Progression Path\n\n`;
      roadmap.careerProgression.forEach((step, index) => {
        markdown += `${index + 1}. ${step}\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.careerOutcomes && roadmap.careerOutcomes.length > 0) {
      markdown += `## 💼 Career Opportunities\n\n`;
      markdown += `| Role | Salary Range |\n|---|---|\n`;
      roadmap.careerOutcomes.forEach((outcome) => {
        markdown += `| ${outcome.role} | ${outcome.salary} |\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.tips && roadmap.tips.length > 0) {
      markdown += `## 💡 Pro Tips\n\n`;
      roadmap.tips.forEach((tip) => {
        markdown += `- ${tip}\n`;
      });
      markdown += `\n`;
    }

    if (roadmap.marketDemand) {
      markdown += `## 📈 Market Outlook\n\n`;
      markdown += `${roadmap.marketDemand}\n\n`;
    }

    if (roadmap.communityResources && roadmap.communityResources.length > 0) {
      markdown += `## 🤝 Community & Networking Resources\n\n`;
      roadmap.communityResources.forEach((resource) => {
        markdown += `- ${resource}\n`;
      });
      markdown += `\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `*Generated by Enhanced AI Study Roadmap Planner*\n`;
    markdown += `*Created on: ${new Date().toLocaleDateString()}*`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "create":
        return (
          <CreateRoadmapTab
            objective={objective}
            setObjective={setObjective}
            finalGoal={finalGoal}
            setFinalGoal={setFinalGoal}
            generateRoadmap={generateRoadmap}
            loading={loading}
            loadingMessage={loadingMessage}
            error={error}
            interruptGeneration={interruptGeneration}
            roadmap={roadmap}
            addToQueue={addToQueue}
          />
        );
      case "view":
        return (
          <ViewRoadmapTab
            roadmap={roadmap}
            setActiveTab={setActiveTab}
            objective={objective}
            finalGoal={finalGoal}
            saveCurrentRoadmap={saveCurrentRoadmap}
            downloadMarkdown={downloadMarkdown}
            toggleMiniGoal={toggleMiniGoal}
            calculateOverallProgress={calculateOverallProgress}
            setRoadmap={setRoadmap}
            error={error}
          />
        );
      case "saved":
        return (
          <SavedPlansTab
            savedTimeplans={savedTimeplans}
            loadRoadmap={loadRoadmap}
            deleteRoadmap={deleteRoadmap}
            setActiveTab={setActiveTab}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            handleDeleteConfirm={handleDeleteConfirm}
          />
        );
      case "ongoing":
        return (
          <OngoingTab
            generationQueue={generationQueue}
            incompleteRoadmaps={incompleteRoadmaps}
            isQueuePaused={isQueuePaused}
            currentlyGenerating={currentlyGenerating}
            pauseQueue={pauseQueue}
            resumeQueue={resumeQueue}
            removeFromQueue={removeFromQueue}
            retryGeneration={retryGeneration}
            loadRoadmap={loadRoadmap}
            deleteRoadmap={deleteRoadmap}
            setActiveTab={setActiveTab}
            addToQueue={addToQueue}
            clearQueue={clearQueue}
            loading={loading}
            loadingMessage={loadingMessage}
          />
        );
      default:
        return (
          <CreateRoadmapTab
            objective={objective}
            setObjective={setObjective}
            finalGoal={finalGoal}
            setFinalGoal={setFinalGoal}
            generateRoadmap={generateRoadmap}
            loading={loading}
            loadingMessage={loadingMessage}
            error={error}
            interruptGeneration={interruptGeneration}
            roadmap={roadmap}
            addToQueue={addToQueue}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col themed-container transition-theme`}
    >
      <Header
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        fullScreenMode={fullScreenMode}
        toggleFullScreen={toggleFullScreen}
        onSave={handleSettingsSave}
      />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        fullScreenMode={fullScreenMode}
        toggleFullScreen={toggleFullScreen}
        savedTimeplans={savedTimeplans}
        loadRoadmap={loadRoadmap}
        deleteRoadmap={deleteRoadmap}
        sidebarRef={sidebarRef}
      />
      <main
        className={`flex-1 container mx-auto px-4 py-6 transition-theme ${isSidebarOpen && "lg:opacity-100 lg:pointer-events-auto opacity-50 pointer-events-none"}`}
      >
        {apiKeyStatus === "checking" && (
          <div className="text-center p-8">
            <div className="loading-spinner animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}
        {apiKeyStatus === "missing" && (
          <div className="text-center p-8 bg-theme-surface border-theme rounded-lg border shadow-theme">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Welcome to AI Study Planner
            </h2>
            <p className="mb-4 text-muted-foreground">
              To get started, please provide a Gemini API key.
            </p>
            <p className="text-sm text-muted-foreground">
              Click the gear icon in the top-right corner to open the settings
              and add your key.
            </p>
          </div>
        )}
        {apiKeyStatus === "present" && renderTabContent()}
      </main>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="modal-content">
          <DialogHeader>
            <DialogTitle>Save Timeplan</DialogTitle>
            <DialogDescription>
              Enter a name for your timeplan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roadmapName" className="text-right">
                Name
              </Label>
              <Input
                id="roadmapName"
                value={roadmapName}
                onChange={(e) => setRoadmapName(e.target.value)}
                className="col-span-3 input-themed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="modal-content">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timeplan? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;
