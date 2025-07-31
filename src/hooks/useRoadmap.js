import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
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
import { toast } from 'sonner';

const useRoadmap = ({ setActiveTab } = {}) => {
  const [objective, setObjective] = useState('');
  const [finalGoal, setFinalGoal] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [savedTimeplans, setSavedTimeplans] = useState([]);
  const [genAI, setGenAI] = useState(null);
  const isInterrupted = useRef(false);
  const [availableModels, setAvailableModels] = useState(() => {
    const savedModels = localStorage.getItem('gemini-available-models');
    return savedModels ? JSON.parse(savedModels) : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
  });
  const models = useRef(availableModels);
  const currentModelIndex = useRef(0);

  useEffect(() => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
    }
  }, []);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/roadmaps');
        const data = await response.json();
        setSavedTimeplans(data);
      } catch (error) {
        console.error('Error fetching roadmaps:', error);
      }
    };
    fetchRoadmaps();
  }, []);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [roadmapName, setRoadmapName] = useState("");

  const saveCurrentRoadmap = async () => {
    if (!roadmap) return;
    setRoadmapName(roadmap.title || `Roadmap-${Date.now()}`);
    setIsSaveDialogOpen(true);
  };

  const saveRoadmapToDisk = async (roadmapData, name) => {
    try {
      const response = await fetch('http://localhost:3001/api/roadmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roadmap: roadmapData, name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Failed to save: ${errorText}`);
        console.error('Error saving roadmap to disk:', errorText);
        return null;
      }

      const newSavedTimeplan = await response.json();

      setSavedTimeplans((prev) => {
        const indexToReplace = prev.findIndex(tp => tp.sanitizedName === newSavedTimeplan.sanitizedName);

        if (indexToReplace > -1) {
          const updatedPlans = [...prev];
          updatedPlans[indexToReplace] = newSavedTimeplan;
          return updatedPlans;
        } else {
          return [...prev, newSavedTimeplan];
        }
      });

      setRoadmap(newSavedTimeplan);
      toast.success('Timeplan saved automatically!');
      return newSavedTimeplan;
    } catch (error) {
      console.error('Error saving roadmap to disk:', error);
      toast.error('Failed to save timeplan automatically.');
      return null;
    }
  };

  const handleSaveConfirm = async () => {
    if (!roadmapName) return;
    try {
      const newSavedTimeplan = await saveRoadmapToDisk(roadmap, roadmapName);
      if (newSavedTimeplan) {
        setIsSaveDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast.error('Failed to save timeplan.');
    }
  };

  const loadRoadmap = (roadmapId) => {
    const loadedTimeplan = savedTimeplans.find((tp) => tp.id === roadmapId);
    if (loadedTimeplan) {
      setRoadmap(loadedTimeplan);
      setObjective(loadedTimeplan.objective || '');
      setFinalGoal(loadedTimeplan.finalGoal || '');
      return true;
    }
    return false;
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState(null);

  const deleteRoadmap = async (sanitizedName) => {
    try {
      await fetch(`http://localhost:3001/api/roadmaps/${sanitizedName}`, {
        method: 'DELETE',
      });
      setSavedTimeplans((prev) => prev.filter((tp) => tp.sanitizedName !== sanitizedName));
      toast.success('Timeplan deleted!');
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete timeplan.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roadmapToDelete) return;
    try {
      await deleteRoadmap(roadmapToDelete);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete timeplan.');
    }
  };

  const exportToPDF = () => {
    if (!roadmap) return;

    const doc = new jsPDF();
    doc.text(roadmap.title, 20, 20);
    // ... more PDF generation logic here
    doc.save(`${roadmap.sanitizedName}.pdf`);
  };

  const exportToHTML = () => {
    if (!roadmap) return;

    const htmlContent = `
      <html>
        <head>
          <title>${roadmap.title}</title>
        </head>
        <body>
          <h1>${roadmap.title}</h1>
          </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${roadmap.sanitizedName}.html`);
  };

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem('currentRoadmap', JSON.stringify(roadmap));
    }
  }, [roadmap]);

  const calculateOverallProgress = useCallback((roadmapData) => {
    if (!roadmapData || !roadmapData.phases) return 0;

    let totalMiniGoals = 0;
    let completedMiniGoals = 0;

    roadmapData.phases.forEach(phase => {
      if (phase.miniGoals) {
        totalMiniGoals += phase.miniGoals.length;
        completedMiniGoals += phase.miniGoals.filter(mg => mg.completed).length;
      }
    });

    if (totalMiniGoals === 0) return 0;
    return Math.round((completedMiniGoals / totalMiniGoals) * 100);
  }, []);

  const calculatePhaseProgress = useCallback((phase) => {
    if (!phase || !phase.miniGoals) return 0;
    const total = phase.miniGoals.length;
    if (total === 0) return 0;
    const completed = phase.miniGoals.filter(mg => mg.completed).length;
    return Math.round((completed / total) * 100);
  }, []);

  const parseJsonResponse = (text) => {
    let jsonString = text.trim();
    let extractedJson = '';

    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(jsonBlockRegex);

    if (match && match[1]) {
        extractedJson = match[1];
    } else {
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            extractedJson = jsonString.substring(firstBrace, lastBrace + 1);
        } else {
            throw new Error("Could not find a valid JSON structure in the AI response.");
        }
    }

    try {
        return JSON.parse(extractedJson);
    } catch (jsonParseError) {
        console.error("Failed to parse JSON:", jsonParseError, "Attempted JSON string:", extractedJson);
        throw new Error(
            `The AI model provided an invalid JSON response. Raw parsing error: ${jsonParseError.message}`
        );
    }
  };

  const initializePhaseDetails = (phase, pIdx) => {
    const phaseWithProgress = {
        ...phase,
        miniGoals: phase.miniGoals ? phase.miniGoals.map((mg, mgIdx) => ({
            id: mg.id || `mini-goal-${pIdx + 1}-${mgIdx + 1}`,
            completed: mg.completed || false,
            completedDate: mg.completedDate || null,
            ...mg,
        })) : [],
    };
    phaseWithProgress.progressPercentage = calculatePhaseProgress(phaseWithProgress);
    return phaseWithProgress;
  };

  const createInitialPrompt = useCallback(() => `
Create a high-level study roadmap structure for: "${objective}"
Final Goal: "${finalGoal}"

Provide the overall roadmap details and a list of phase titles.
The roadmap should have a MINIMUM of 25 to 40 DISTINCT, PROGRESSIVELY CHALLENGING PHASES.

Format as JSON with this EXACT structure:
{
  "title": "Comprehensive Study Roadmap Title",
  "totalDuration": "Be completely realistic - multiple years if needed for mastery",
  "difficultyLevel": "Beginner/Intermediate/Advanced/Expert",
  "totalEstimatedHours": "Realistic total hour commitment",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Descriptive Phase Title"
    }
  ],
  "motivationMilestones": [
    "Specific achievements that maintain long-term motivation"
  ],
  "careerProgression": [
    "Clear career advancement steps and opportunities with this knowledge"
  ],
  "tips": [
    "Expert-level strategic advice for maximizing success and avoiding common pitfalls"
  ],
  "prerequisites": ["Essential knowledge learner should have before starting"],
  "careerOutcomes": [
    { "role": "Software Engineer", "salary": "$100k - $150k" }
  ],
  "marketDemand": "Current market demand and future outlook for these skills",
  "communityResources": ["Professional communities, forums, and networking opportunities"]
}

CRITICAL: Your entire response MUST be valid JSON only. No markdown formatting, no explanations, no additional text - just pure, valid JSON.
`, [objective, finalGoal]);

  const createPhaseDetailPrompt = useCallback((phaseTitle) => `
You are generating one phase of a larger study roadmap for: "${objective}" with the final goal: "${finalGoal}".
The current phase is: "${phaseTitle}".

Generate the detailed content for this single phase.

**CRITICAL INSTRUCTION: Provide a detailed and realistic breakdown for this phase.**

**MINI-GOAL REQUIREMENT:**
Generate 7-12 actionable, highly detailed mini-goals for this phase.

**RESOURCES & PROJECT:**
Provide multiple, high-quality resources and a monetizable project for this phase.

Format as JSON with this EXACT structure for the phase object:
{
  "duration": "Realistic timeframe based on actual complexity",
  "goal": "Specific, measurable goal with clear success criteria",
  "miniGoals": [
    {
      "id": "mini-goal-1-1",
      "title": "Specific actionable mini-goal title",
      "description": "Detailed description with expected outcomes and deliverables",
      "estimatedTime": "Realistic time estimate (days/weeks)",
      "priority": "high/medium/low",
      "completed": false,
      "completedDate": null,
      "dependencies": [],
      "successCriteria": "Measurable criteria for completion",
      "url": "https://optional-direct-link-for-this-mini-goal.com"
    }
  ],
  "resources": [
    {
      "name": "Specific Resource Name",
      "url": "https://actual-working-url.com",
      "type": "documentation/course/book/paper/project/tool",
      "description": "Why this specific resource is exceptional and valuable",
      "difficulty": "beginner/intermediate/advanced/expert",
      "estimatedTime": "Time to complete this resource",
      "priority": "essential/recommended/optional"
    }
  ],
  "project": {
    "title": "Practical Project Title",
    "description": "Comprehensive project description with clear objectives",
    "deliverables": ["List of specific, measurable deliverables"],
    "monetizationPotential": "Detailed explanation of how this could generate income",
    "skillsApplied": ["Specific technical skills being practiced"],
    "estimatedDuration": "Realistic project completion time",
    "difficultyLevel": "Current complexity level",
    "portfolioValue": "Why this adds value to a professional portfolio"
  },
  "skills": ["Specific technical and soft skills gained"],
  "milestone": "Clear, measurable achievement marking phase completion",
  "prerequisiteKnowledge": ["What should be mastered before starting this phase"],
  "flexibleTimeAllocation": true,
  "actualDuration": null,
  "progressPercentage": 0
}

CRITICAL: Your entire response MUST be valid JSON only. No markdown formatting, no explanations, no additional text - just pure, valid JSON.
`, [objective, finalGoal]);

  const interruptGeneration = () => {
    isInterrupted.current = true;
  };

  // --- MODIFIED FUNCTION ---
  // This function now correctly passes the roadmap ID between saves.
  const generateRoadmap = async (isContinuation = false, roadmapToContinue = null) => {
    if (!genAI) {
      alert('Please set your Gemini API key in the settings.');
      return;
    }

    isInterrupted.current = false;
    setLoading(true);
    setError(null);
    if (!isContinuation) {
        localStorage.removeItem('currentRoadmap');
        setRoadmap(null); // Clear current roadmap state
    }

    const generateWithRetry = async (prompt) => {
        // ... (this inner function is unchanged)
        let lastError = null;

        while (true) {
            if (isInterrupted.current) throw new Error("Generation interrupted by user.");

            const modelName = availableModels[currentModelIndex.current];
            try {
                setLoadingMessage(`Generating with ${modelName}...`);
                const generativeModel = genAI.getGenerativeModel({ model: modelName });
                const result = await generativeModel.generateContent(prompt);
                const response = await result.response;
                return parseJsonResponse(response.text());
            } catch (err) {
                if (isInterrupted.current) throw err;

                lastError = err;
                console.error(`Error with model ${modelName}:`, err);

                currentModelIndex.current = (currentModelIndex.current + 1) % availableModels.length;

                if (currentModelIndex.current === 0) { // Cycled through all models
                    setLoadingMessage("All models failed. Please check your API key and model settings.");
                    throw new Error("All models failed");
                } else {
                    setLoadingMessage(`Switching to model ${availableModels[currentModelIndex.current]}...`);
                    continue;
                }
            }
        }
    };

    try {
        let currentRoadmap = null;

        if (isContinuation && roadmapToContinue) {
            currentRoadmap = roadmapToContinue;
        } else {
            if (!objective || !finalGoal) {
                throw new Error("Please provide both an objective and a final goal.");
            }
            setLoadingMessage('Generating high-level plan...');
            const initialPrompt = createInitialPrompt();
            const initialJson = await generateWithRetry(initialPrompt);

            if (!initialJson || !Array.isArray(initialJson.phases) || initialJson.phases.length === 0) {
                throw new Error("The AI did not return a valid initial roadmap structure.");
            }

            const newRoadmap = {
                ...initialJson,
                objective: objective,
                finalGoal: finalGoal,
                generationState: 'in-progress',
                phases: initialJson.phases.map((p, pIdx) => ({
                    phaseNumber: p.phaseNumber || pIdx + 1,
                    title: p.title,
                    duration: "...",
                    goal: "...",
                    miniGoals: [],
                    resources: [],
                    project: {},
                    skills: [],
                    milestone: "...",
                    prerequisiteKnowledge: [],
                    progressPercentage: 0,
                }))
            };
            // Capture the returned roadmap (with ID) and pass its ID on the next save.
            const savedRoadmap = await saveRoadmapToDisk(newRoadmap, newRoadmap.title || `Roadmap-${Date.now()}`);
            if (!savedRoadmap) throw new Error("Initial roadmap save failed.");
            currentRoadmap = savedRoadmap;
        }

        const startIndex = currentRoadmap.phases.findIndex(p => p.goal === "...");
        if (startIndex === -1) {
            currentRoadmap.generationState = 'completed';
            await saveRoadmapToDisk(currentRoadmap, currentRoadmap.title);
            setLoading(false);
            return;
        }

        let accumulatingRoadmap = { ...currentRoadmap };

        for (let i = startIndex; i < accumulatingRoadmap.phases.length; i++) {
            if (isInterrupted.current) {
                console.log("Generation interrupted by user.");
                accumulatingRoadmap = { ...accumulatingRoadmap, generationState: 'in-progress' };
                await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
                break;
            }

            const phase = accumulatingRoadmap.phases[i];
            setLoadingMessage(`Generating details for phase ${i + 1}/${accumulatingRoadmap.phases.length}: ${phase.title}`);
            const phaseJson = await generateWithRetry(createPhaseDetailPrompt(phase.title));

            if (isInterrupted.current) {
              console.log("Generation interrupted by user after fetch.");
              accumulatingRoadmap = { ...accumulatingRoadmap, generationState: 'in-progress' };
              await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
              break;
            }

            const newPhases = [...accumulatingRoadmap.phases];
            newPhases[i] = initializePhaseDetails({ ...newPhases[i], ...phaseJson }, i);
            accumulatingRoadmap = { ...accumulatingRoadmap, phases: newPhases };
            
            // This is the crucial part: save the updated roadmap and get back the
            // latest version from the server, which is then used in the next iteration.
            const savedStep = await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
            if (!savedStep) throw new Error("Failed to save roadmap progress during loop.");
            accumulatingRoadmap = savedStep;
        }

        if (!isInterrupted.current) {
            accumulatingRoadmap.generationState = 'completed';
            await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
        }

        if (setActiveTab && !isInterrupted.current) {
            setActiveTab('view');
        }

    } catch (err) {
        if (err.message.includes("interrupted by user")) {
            console.log("Caught user interruption. Halting generation.");
            setError(null);
        } else {
            console.error("Error generating roadmap:", err);
            setError("Failed to generate roadmap: " + err.message);
        }
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  };

  const toggleMiniGoal = (phaseIndex, miniGoalId) => {
    setRoadmap(prevRoadmap => {
      if (!prevRoadmap) return prevRoadmap;

      const newPhases = prevRoadmap.phases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          const newMiniGoals = phase.miniGoals.map(mg => {
            if (mg.id === miniGoalId) {
              const newCompletedStatus = !mg.completed;
              return {
                ...mg,
                completed: newCompletedStatus,
                completedDate: newCompletedStatus ? new Date().toISOString() : null
              };
            }
            return mg;
          });
          const updatedPhase = { ...phase, miniGoals: newMiniGoals };
          updatedPhase.progressPercentage = calculatePhaseProgress(updatedPhase);
          return updatedPhase;
        }
        return phase;
      });

      return { ...prevRoadmap, phases: newPhases };
    });
  };

  return {
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
    exportToPDF,
    exportToHTML,
  };
};

export default useRoadmap;
