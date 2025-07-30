import React, { useState, useEffect, useRef } from 'react';
import useRoadmap from './hooks/useRoadmap';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import CreateRoadmapTab from './components/tabs/CreateRoadmapTab';
import ViewRoadmapTab from './components/tabs/ViewRoadmapTab';
import SavedPlansTab from './components/tabs/SavedPlansTab';
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
import './App.css';

const App = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'dark';
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
  const [activeTab, setActiveTab] = useState('create');
  const [apiKeyStatus, setApiKeyStatus] = useState('checking');

  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem('gemini-api-key');
      if (apiKey) {
        setApiKeyStatus('present');
      } else {
        setApiKeyStatus('missing');
      }
    };
    checkApiKey();
  }, []);

  const handleSettingsSave = () => {
    setApiKeyStatus('present');
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
  } = useRoadmap({ setActiveTab });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setFullScreenMode(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setFullScreenMode(false);
      }).catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  const downloadMarkdown = () => {
    if (!roadmap) return;

    let markdown = `# ${roadmap.title}

`;
    markdown += `**Total Duration:** ${roadmap.totalDuration}
`;
    markdown += `**Difficulty Level:** ${roadmap.difficultyLevel || 'Not specified'}
`;
    markdown += `**Total Estimated Hours:** ${roadmap.totalEstimatedHours || 'Not specified'}
`;
    markdown += `**Number of Phases:** ${roadmap.phases?.length}

`;
    markdown += `**Learning Objective:** ${objective}
`;
    markdown += `**Final Goal:** ${finalGoal}

`;
    markdown += `---

`;

    roadmap.phases.forEach((phase) => {
      markdown += `## Phase ${phase.phaseNumber}: ${phase.title}

`;
      markdown += `**Duration:** ${phase.duration}
`;
      markdown += `**Goal:** ${phase.goal}
`;
      
      if (phase.progressPercentage !== undefined) {
        markdown += `**Progress:** ${phase.progressPercentage}%
`;
      }
      markdown += `
`;

      if (phase.miniGoals && phase.miniGoals.length > 0) {
        markdown += `### Mini-Goals

`;
        phase.miniGoals.forEach((miniGoal, mgIndex) => {
          const status = miniGoal.completed ? '✅' : '⬜';
          markdown += `${mgIndex + 1}. ${status} **${miniGoal.title}** (${miniGoal.estimatedTime})
`;
          markdown += `   - ${miniGoal.description}
`;
          if (miniGoal.url) {
            markdown += `   - Link: [${miniGoal.url}](${miniGoal.url})
`;
          }
          if (miniGoal.priority) {
            markdown += `   - Priority: ${miniGoal.priority}
`;
          }
          if (miniGoal.completedDate) {
            markdown += `   - Completed: ${new Date(miniGoal.completedDate).toLocaleDateString()}
`;
          }
          markdown += `
`;
        });
      }

      markdown += `### Resources

`;
      phase.resources.forEach((resource, resIndex) => {
        markdown += `${resIndex + 1}. **${resource.name}**`;
        if (resource.type) markdown += ` (${resource.type})`;
        markdown += `
`;
        if (resource.url) {
          markdown += `   - Link: [${resource.url}](${resource.url})
`;
        }
        markdown += `   - Description: ${resource.description}
`;
        if (resource.difficulty) {
          markdown += `   - Difficulty: ${resource.difficulty}
`;
        }
        if (resource.estimatedTime) {
          markdown += `   - Time: ${resource.estimatedTime}
`;
        }
        markdown += `
`;
      });

      markdown += `### Phase Project

`;
      if (typeof phase.project === 'object') {
        markdown += `**${phase.project.title}**

`;
        markdown += `${phase.project.description}

`;
        
        if (phase.project.deliverables) {
          markdown += `**Deliverables:**
`;
          phase.project.deliverables.forEach(deliverable => {
            markdown += `- ${deliverable}
`;
          });
          markdown += `
`;
        }
        
        if (phase.project.monetizationPotential) {
          markdown += `**Monetization Potential:** ${phase.project.monetizationPotential}

`;
        }
      } else {
        markdown += `${phase.project}

`;
      }

      if (phase.milestone) {
        markdown += `**Milestone:** ${phase.milestone}

`;
      }

      markdown += `### Skills You'll Gain

`;
      phase.skills.forEach(skill => {
        markdown += `- ${skill}
`;
      });
      markdown += `
---

`;
    });

    if (roadmap.motivationMilestones && roadmap.motivationMilestones.length > 0) {
      markdown += `## 🎯 Motivation Milestones

`;
      roadmap.motivationMilestones.forEach(milestone => {
        markdown += `- ${milestone}
`;
      });
      markdown += `
`;
    }

    if (roadmap.careerProgression && roadmap.careerProgression.length > 0) {
      markdown += `## 🚀 Career Progression Path

`;
      roadmap.careerProgression.forEach((step, index) => {
        markdown += `${index + 1}. ${step}
`;
      });
      markdown += `
`;
    }

    if (roadmap.careerOutcomes && roadmap.careerOutcomes.length > 0) {
      markdown += `## 💼 Career Opportunities

`;
      markdown += `| Role | Salary Range |
|---|---|
`;
      roadmap.careerOutcomes.forEach(outcome => {
        markdown += `| ${outcome.role} | ${outcome.salary} |
`; 
      });
      markdown += `
`;
    }

    if (roadmap.tips && roadmap.tips.length > 0) {
      markdown += `## 💡 Pro Tips

`;
      roadmap.tips.forEach(tip => {
        markdown += `- ${tip}
`;
      });
      markdown += `
`;
    }
    
    if (roadmap.marketDemand) {
      markdown += `## 📈 Market Outlook

`;
      markdown += `${roadmap.marketDemand}

`;
    }

    if (roadmap.communityResources && roadmap.communityResources.length > 0) {
      markdown += `## 🤝 Community & Networking Resources

`;
      roadmap.communityResources.forEach(resource => {
        markdown += `- ${resource}
`;
      });
      markdown += `
`;
    }


    markdown += `
---

`;
    markdown += `*Generated by Enhanced AI Study Roadmap Planner*
`;
    markdown += `*Created on: ${new Date().toLocaleDateString()}*`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roadmap.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roadmap.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (roadmap) {
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      messageBox.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
          <p class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Roadmap JSON copied to clipboard!</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onclick="this.parentNode.parentNode.remove()">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);

      navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2))
        .catch(err => {
          console.error('Failed to copy JSON: ', err);
          messageBox.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
              <p class="text-lg font-semibold text-red-600 mb-4">Failed to copy JSON: ${err.message}</p>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onclick="this.parentNode.parentNode.remove()">OK</button>
            </div>
          `;
        });
    }
  };

  const exportToPDF = async () => {
    if (!roadmap) return;
    // PDF export logic remains, but we'll need to pass the roadmapRef to it.
    // This will be handled within the ViewRoadmapTab component.
    console.log("Export to PDF from App.jsx");
  };

  const handlePrint = () => {
    if (!roadmap) return;
    // Print logic remains, but we'll need to pass the roadmapRef to it.
    // This will be handled within the ViewRoadmapTab component.
    console.log("Print from App.jsx");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateRoadmapTab
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
        />;
      case 'view':
        return <ViewRoadmapTab
          roadmap={roadmap}
          setActiveTab={setActiveTab}
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
          loading={loading}
          loadingMessage={loadingMessage}
          interruptGeneration={interruptGeneration}
          generateRoadmap={generateRoadmap}
          error={error}
        />;
      case 'saved':
        return <SavedPlansTab
          savedTimeplans={savedTimeplans}
          loadRoadmap={loadRoadmap}
          deleteRoadmap={deleteRoadmap}
          setActiveTab={setActiveTab}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          handleDeleteConfirm={handleDeleteConfirm}
        />;
      default:
        return <CreateRoadmapTab
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
        />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
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
      <main className={`flex-1 container mx-auto px-4 py-6 transition-opacity duration-300 ${isSidebarOpen && 'lg:opacity-100 lg:pointer-events-auto opacity-50 pointer-events-none'}`}>
        {apiKeyStatus === 'checking' && <div className="text-center p-8">Loading...</div>}
        {apiKeyStatus === 'missing' && (
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Welcome to AI Study Planner</h2>
            <p className="mb-4">To get started, please provide a Gemini API key.</p>
            <p className="text-sm text-muted-foreground">
              Click the gear icon in the top-right corner to open the settings and add your key.
            </p>
          </div>
        )}
        {apiKeyStatus === 'present' && renderTabContent()}
      </main>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
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
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timeplan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;