import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";
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
import { toast } from "sonner";

const useRoadmap = ({ setActiveTab } = {}) => {
  const [objective, setObjective] = useState("");
  const [finalGoal, setFinalGoal] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [savedTimeplans, setSavedTimeplans] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteRoadmaps');
    return saved ? JSON.parse(saved) : [];
  });
  const [genAI, setGenAI] = useState(null);
  const isInterrupted = useRef(false);
  const [availableModels] = useState(() => {
    const savedModels = localStorage.getItem("gemini-available-models");
    return savedModels
      ? JSON.parse(savedModels)
      : [
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-1.0-pro",
        ];
  });
  const currentModelIndex = useRef(0);
  const processingTriggerRef = useRef(false);

  // Queue management state
  const [generationQueue, setGenerationQueue] = useState([]);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [currentlyGenerating, setCurrentlyGenerating] = useState(null);
  const queueProcessingRef = useRef(false);
  const shouldPauseAfterCurrent = useRef(false);

  // Initialize GenAI with API key
  useEffect(() => {
    const apiKey = localStorage.getItem("gemini-api-key");
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
    }
  }, []);

  // Toggle favorite status for a roadmap
  const toggleFavorite = useCallback((roadmapId) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(roadmapId)
        ? prevFavorites.filter(id => id !== roadmapId)
        : [...prevFavorites, roadmapId];
      
      // Save to localStorage
      localStorage.setItem('favoriteRoadmaps', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);
  
  // Get sorted roadmaps with favorites first
  const getSortedRoadmaps = useCallback(() => {
    return [...savedTimeplans].sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // If both are favorites or both are not, sort by creation date
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [savedTimeplans, favorites]);
  
  // Check if a roadmap is favorited
  const isFavorite = useCallback((roadmapId) => {
    return favorites.includes(roadmapId);
  }, [favorites]);
  
  // Fetch roadmaps on component mount
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/roadmaps");
        const data = await response.json();
        setSavedTimeplans(data);
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      }
    };
    fetchRoadmaps();
  }, []);

  // const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [roadmapName, setRoadmapName] = useState("");

  // Get incomplete roadmaps
  const incompleteRoadmaps = savedTimeplans.filter(
    (roadmap) => roadmap.generationState !== "completed",
  );

  const saveCurrentRoadmap = async () => {
    if (!roadmap) return;
    setRoadmapName(roadmap.title || `Roadmap-${Date.now()}`);
    // setIsSaveDialogOpen(true);
  };

  const saveRoadmapToDisk = async (roadmapData, name) => {
    try {
      const roadmapName = roadmapData.title || name || `Roadmap-${Date.now()}`;
      const response = await fetch("http://localhost:3001/api/roadmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roadmap: roadmapData, name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(`Failed to save: ${errorText}`);
        console.error("Error saving roadmap to disk:", errorText);
        return null;
      }

      const newSavedTimeplan = await response.json();

      setSavedTimeplans((prev) => {
        const indexToReplace = prev.findIndex(
          (tp) => tp.sanitizedName === newSavedTimeplan.sanitizedName,
        );

        if (indexToReplace > -1) {
          const updatedPlans = [...prev];
          updatedPlans[indexToReplace] = newSavedTimeplan;
          return updatedPlans;
        } else {
          return [...prev, newSavedTimeplan];
        }
      });

      setRoadmap(newSavedTimeplan);
      toast.success("Timeplan saved automatically!");
      return newSavedTimeplan;
    } catch (error) {
      console.error("Error saving roadmap to disk:", error);
      toast.error("Failed to save timeplan automatically.");
      return null;
    }
  };

  const handleSaveConfirm = async () => {
    if (!roadmapName) return;
    try {
      const newSavedTimeplan = await saveRoadmapToDisk(roadmap, roadmapName);
      if (newSavedTimeplan) {
        // setIsSaveDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving roadmap:", error);
      toast.error("Failed to save timeplan.");
    }
  };

  const loadRoadmap = (roadmapId) => {
    const loadedTimeplan = savedTimeplans.find((tp) => tp.id === roadmapId);
    if (loadedTimeplan) {
      setRoadmap(loadedTimeplan);
      setObjective(loadedTimeplan.objective || "");
      setFinalGoal(loadedTimeplan.finalGoal || "");
      return true;
    }
    return false;
  };

  const confirmDelete = (idOrSanitizedName) => {
    // setRoadmapToDelete(idOrSanitizedName);
    // setIsDeleteDialogOpen(true);
  };

  const deleteRoadmap = async (idOrSanitizedName) => {
    try {
      // First find the roadmap to get its sanitizedName if we were given an ID
      const roadmapToDelete = savedTimeplans.find(
        (tp) => tp.id === idOrSanitizedName || tp.sanitizedName === idOrSanitizedName
      );
      
      if (!roadmapToDelete) {
        console.warn('Roadmap not found for deletion:', idOrSanitizedName);
        return;
      }

      const { sanitizedName, id: roadmapId } = roadmapToDelete;
      
      // Interrupt any ongoing generation for this roadmap
      if (currentlyGenerating?.roadmapId === roadmapId || 
          currentlyGenerating?.id === idOrSanitizedName) {
        interruptGeneration();
      }
      
      // Remove any queue items for this roadmap
      setGenerationQueue(prev => 
        prev.filter(item => 
          item.roadmapId !== roadmapId && 
          item.roadmapId !== idOrSanitizedName &&
          item.id !== idOrSanitizedName
        )
      );
      
      await fetch(`http://localhost:3001/api/roadmaps/${sanitizedName}`, {
        method: "DELETE",
      });
      
      // Update the UI by removing the deleted roadmap
      setSavedTimeplans(prev => 
        prev.filter(tp => tp.sanitizedName !== sanitizedName && tp.id !== idOrSanitizedName)
      );
      
      // Also remove from current roadmap if it's the one being deleted
      if (roadmap?.id === idOrSanitizedName || roadmap?.sanitizedName === sanitizedName) {
        setRoadmap(null);
        localStorage.removeItem('currentRoadmap');
      }
      
      toast.success("Timeplan deleted!");
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      toast.error("Failed to delete timeplan.");
    }
  };

  // const handleDeleteConfirm = async () => {
  //   if (!roadmapToDelete) return;
  //   try {
  //     await deleteRoadmap(roadmapToDelete);
  //     setIsDeleteDialogOpen(false);
  //     setRoadmapToDelete(null);
  //   } catch (error) {
  //     console.error("Error in handleDeleteConfirm:", error);
  //     toast.error("Failed to delete roadmap.");
  //   }
  // };

  // Export roadmap as JSON
  const exportToJSON = () => {
    if (!roadmap) {
      console.error('No roadmap available to export');
      return;
    }
    
    try {
      // Create a sanitized version of the roadmap for export
      const exportData = {
        ...getSanitizedRoadmap(roadmap),
        // Add any additional metadata
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const filename = `${roadmap.title ? roadmap.title.replace(/[^\w\d\s-]/g, '').replace(/\s+/g, '-').toLowerCase() : 'roadmap'}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export roadmap as JSON');
    }
  };

  // Export roadmap as PDF
  const exportToPDF = () => {
    if (!roadmap) return;

    const doc = new jsPDF();
    let yPos = 20;
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text(roadmap.title || 'Roadmap', 20, yPos);
    yPos += 15;
    
    // Add metadata
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color
    
    // Add creation date
    const creationDate = roadmap.createdAt ? new Date(roadmap.createdAt) : new Date();
    doc.text(`Generated on: ${creationDate.toLocaleDateString()}`, 20, yPos);
    yPos += 10;
    
    // Add roadmap details
    if (roadmap.totalDuration) {
      doc.text(`Total Duration: ${roadmap.totalDuration}`, 20, yPos);
      yPos += 8;
    }
    
    if (roadmap.difficultyLevel) {
      doc.text(`Difficulty: ${roadmap.difficultyLevel}`, 20, yPos);
      yPos += 8;
    }
    
    if (roadmap.totalEstimatedHours) {
      doc.text(`Estimated Hours: ${roadmap.totalEstimatedHours}`, 20, yPos);
      yPos += 12;
    }
    
    // Add objective and final goal if available
    if (objective || finalGoal) {
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // Dark blue-gray
      doc.text('Learning Objectives', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      if (objective) {
        const splitObjective = doc.splitTextToSize(objective, 170);
        doc.text(splitObjective, 20, yPos);
        yPos += splitObjective.length * 6 + 5;
      }
      
      if (finalGoal) {
        const splitGoal = doc.splitTextToSize(`Final Goal: ${finalGoal}`, 170);
        doc.text(splitGoal, 20, yPos);
        yPos += splitGoal.length * 6 + 10;
      }
    }
    
    // Add phases
    if (roadmap.phases && roadmap.phases.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(29, 78, 216); // Darker blue
      doc.text('Learning Path', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      roadmap.phases.forEach((phase, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Phase header
        doc.setFont(undefined, 'bold');
        doc.text(`${phase.phaseNumber || index + 1}. ${phase.title || `Phase ${index + 1}`}`, 20, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 8;
        
        // Phase duration if available
        if (phase.duration) {
          doc.text(`Duration: ${phase.duration}`, 25, yPos);
          yPos += 6;
        }
        
        // Phase description if available
        if (phase.description) {
          const splitDesc = doc.splitTextToSize(phase.description, 170);
          doc.text(splitDesc, 25, yPos);
          yPos += splitDesc.length * 6 + 4;
        }
        
        // Tasks if available
        if (phase.tasks && phase.tasks.length > 0) {
          doc.text('Tasks:', 25, yPos);
          yPos += 6;
          
          phase.tasks.forEach(task => {
            const taskText = `• ${task.title || task.task || 'Untitled Task'}`;
            const splitTask = doc.splitTextToSize(taskText, 160);
            doc.text(splitTask, 30, yPos);
            yPos += splitTask.length * 6 + 2;
            
            if (task.duration) {
              doc.text(`  (${task.duration})`, 35, yPos - 2);
              yPos += 4;
            }
          });
          yPos += 4;
        }
        
        // Resources if available
        if (phase.resources && phase.resources.length > 0) {
          doc.text('Resources:', 25, yPos);
          yPos += 6;
          
          phase.resources.forEach(resource => {
            const resourceText = `• ${resource.title || resource.url || 'Untitled Resource'}`;
            const splitResource = doc.splitTextToSize(resourceText, 160);
            doc.text(splitResource, 30, yPos);
            yPos += splitResource.length * 6 + 2;
          });
          yPos += 4;
        }
        
        yPos += 8; // Extra space between phases
      });
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    doc.save(`${roadmap.title ? roadmap.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'roadmap'}.pdf`);
  };

  const exportToHTML = () => {
    if (!roadmap) {
      alert('No roadmap available to export.');
      return;
    }
    
    // Helper function to format dates
    const formatDate = (dateStr) => {
      try {
        if (!dateStr) return 'Not started';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date not available';
      }
    };
    
    // Helper to calculate phase progress
    const calculatePhaseProgress = (phase) => {
      if (!phase.miniGoals || !phase.miniGoals.length) return 0;
      const completed = phase.miniGoals.filter(g => g.completed).length;
      return Math.round((completed / phase.miniGoals.length) * 100);
    };

    const getProgressBar = (progress, size = 'medium') => {
      if (progress === undefined || progress === null) return '';
      const roundedProgress = Math.max(0, Math.min(100, Math.round(progress)));
      const height = size === 'large' ? '1.25rem' : '0.75rem';
      const textSize = size === 'large' ? '1rem' : '0.875rem';
      const textMargin = size === 'large' ? '0.5rem 0' : '0.25rem 0';
      
      return `
        <div class="progress-container" style="margin: ${textMargin};">
          <div class="progress-bar" style="width: ${roundedProgress}%; height: ${height};"></div>
          <span class="progress-text" style="font-size: ${textSize};">${roundedProgress}% Complete</span>
        </div>
      `;
    };
    
    // Helper to get priority badge
    const getPriorityBadge = (priority) => {
      if (!priority) return '';
      const priorityMap = {
        'high': { class: 'priority-high', label: 'High' },
        'medium': { class: 'priority-medium', label: 'Medium' },
        'low': { class: 'priority-low', label: 'Low' }
      };
      const p = priority.toLowerCase();
      const badge = priorityMap[p] || { class: 'priority-default', label: priority };
      return `<span class="priority-badge ${badge.class}">${badge.label}</span>`;
    };

    const renderMiniGoals = (miniGoals) => {
      if (!miniGoals || !miniGoals.length) return '';
      
      return `
        <div class="mini-goals">
          <h3 class="section-title">Mini Goals</h3>
          <div class="mini-goals-grid">
            ${miniGoals.map(goal => {
              const title = escapeHtml(goal.title || 'Untitled Goal');
              const titleElement = goal.url ? 
                `<a href="${escapeHtml(goal.url)}" target="_blank" rel="noopener noreferrer" class="mini-goal-link">${title} <span class="link-icon">↗</span></a>` : 
                title;
              const description = goal.description ? 
                `<div class="mini-goal-description">${escapeHtml(goal.description)}</div>` : '';
              const duration = goal.estimatedTime ? 
                `<div class="mini-goal-meta"><span class="meta-icon">⏱️</span> ${escapeHtml(goal.estimatedTime)}</div>` : '';
              const priority = goal.priority ? 
                `<div class="mini-goal-meta"><span class="meta-icon">🏷️</span> Priority: ${escapeHtml(goal.priority)}</div>` : '';
              const status = goal.completed ? 
                `<span class="status-badge completed">✓ Completed</span>` : 
                `<span class="status-badge pending">○ Pending</span>`;
              
              return `
                <div class="mini-goal-card">
                  <div class="mini-goal-header">
                    <h4 class="mini-goal-title">${titleElement}</h4>
                    ${status}
                  </div>
                  ${description}
                  <div class="mini-goal-footer">
                    ${duration}
                    ${priority}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    const renderResources = (resources) => {
      if (!resources || !resources.length) return '';
      
      return `
        <div class="resources">
          <h4 class="section-subtitle">Learning Resources</h4>
          <div class="resources-grid">
            ${resources.map(resource => {
              const url = resource.url ? escapeHtml(resource.url) : '';
              const title = escapeHtml(resource.name || resource.title || 'Untitled Resource');
              const type = resource.type ? 
                `<span class="resource-type">${escapeHtml(resource.type)}</span>` : '';
              const difficulty = resource.difficulty ? 
                `<span class="resource-difficulty ${resource.difficulty.toLowerCase()}">
                  ${escapeHtml(resource.difficulty)}
                </span>` : '';
              const description = resource.description ? 
                `<div class="resource-description">${escapeHtml(resource.description)}</div>` : '';
              const timeEstimate = resource.estimatedTime ? 
                `<div class="resource-meta">⏱️ ${escapeHtml(resource.estimatedTime)}</div>` : '';
              
              const resourceContent = `
                <div class="resource-card">
                  <div class="resource-header">
                    <h5 class="resource-title">
                      ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}
                    </h5>
                    <div class="resource-meta">
                      ${type}
                      ${difficulty}
                    </div>
                  </div>
                  ${description}
                  ${timeEstimate}
                </div>
              `;
              
              return resourceContent;
            }).join('')}
          </div>
        </div>
      `;
    };
    
    const renderProject = (project) => {
      if (!project) return '';
      
      const deliverables = project.deliverables && project.deliverables.length ? `
        <div class="project-section">
          <h5>Deliverables</h5>
          <ul class="deliverables-list">
            ${project.deliverables.map(item => 
              `<li>${escapeHtml(item)}</li>`
            ).join('')}
          </ul>
        </div>
      ` : '';
      
      const skills = project.skillsApplied && project.skillsApplied.length ? `
        <div class="project-section">
          <h5>Skills Applied</h5>
          <div class="skills-container">
            ${project.skillsApplied.map(skill => 
              `<span class="skill-tag">${escapeHtml(skill)}</span>`
            ).join('')}
          </div>
        </div>
      ` : '';
      
      return `
        <div class="project-card">
          <h4 class="section-subtitle">Practical Project: ${escapeHtml(project.title || 'Untitled Project')}</h4>
          ${project.description ? `<div class="project-description">${escapeHtml(project.description)}</div>` : ''}
          
          <div class="project-details">
            ${project.difficultyLevel ? `
              <div class="project-meta">
                <span class="meta-label">Difficulty:</span>
                <span class="meta-value">${escapeHtml(project.difficultyLevel)}</span>
              </div>
            ` : ''}
            
            ${project.estimatedDuration ? `
              <div class="project-meta">
                <span class="meta-label">Duration:</span>
                <span class="meta-value">${escapeHtml(project.estimatedDuration)}</span>
              </div>
            ` : ''}
          </div>
          
          ${deliverables}
          ${skills}
          
          ${project.monetizationPotential ? `
            <div class="project-section">
              <h5>Monetization Potential</h5>
              <p>${escapeHtml(project.monetizationPotential)}</p>
            </div>
          ` : ''}
          
          ${project.portfolioValue ? `
            <div class="project-section">
              <h5>Portfolio Value</h5>
              <p>${escapeHtml(project.portfolioValue)}</p>
            </div>
          ` : ''}
        </div>
      `;
    };

    // Helper to escape HTML to prevent XSS
    const escapeHtml = (unsafe) => {
      if (unsafe === null || unsafe === undefined) return '';
      return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Get roadmap data with proper escaping
    const roadmapTitle = escapeHtml(roadmap.title || 'Untitled Roadmap');
    const objective = escapeHtml(roadmap.objective || 'No objective specified');
    const finalGoal = escapeHtml(roadmap.finalGoal || 'No final goal specified');
    const totalDuration = escapeHtml(roadmap.totalDuration || 'Not specified');
    const difficultyLevel = escapeHtml(roadmap.difficultyLevel || 'Not specified');
    const totalEstimatedHours = escapeHtml(roadmap.totalEstimatedHours || 'Not estimated');
    const createdAt = roadmap.createdAt ? formatDate(roadmap.createdAt) : 'Unknown';
    const updatedAt = roadmap.updatedAt ? formatDate(roadmap.updatedAt) : 'Never';
    const overallProgress = calculateOverallProgress(roadmap);
    
    // Prepare phases HTML
    const phasesHtml = roadmap.phases && roadmap.phases.length > 0 ? 
      roadmap.phases.map((phase, index) => {
        const phaseProgress = calculatePhaseProgress(phase);
        const phaseResources = phase.resources || [];
        const phaseProject = phase.project || null;
        
        return `
          <div class="phase-card" id="phase-${index + 1}">
            <div class="phase-header">
              <h3 class="phase-title">
                <span class="phase-number">${index + 1}.</span>
                ${escapeHtml(phase.title || `Phase ${index + 1}`)}
              </h3>
              ${phase.duration ? `<div class="phase-duration">⏱️ ${escapeHtml(phase.duration)}</div>` : ''}
            </div>
            
            ${phase.description ? `
              <div class="phase-description">
                ${escapeHtml(phase.description)}
              </div>
            ` : ''}
            
            <div class="phase-progress">
              ${getProgressBar(phaseProgress, 'large')}
            </div>
            
            ${renderMiniGoals(phase.miniGoals || [])}
            ${renderResources(phaseResources)}
            ${renderProject(phaseProject)}
            
            ${phase.milestone ? `
              <div class="milestone-card">
                <h5>🏆 Milestone</h5>
                <p>${escapeHtml(phase.milestone)}</p>
              </div>
            ` : ''}
            
            ${phase.prerequisiteKnowledge && phase.prerequisiteKnowledge.length ? `
              <div class="prerequisites">
                <h5>Prerequisites</h5>
                <ul>
                  ${phase.prerequisiteKnowledge.map(item => 
                    `<li>${escapeHtml(item)}</li>`
                  ).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      }).join('') : 
      '<div class="no-phases">No phases defined for this roadmap.</div>';
    
    // Generate the HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${roadmapTitle} - AI Roadmap Planner</title>
      <style>
            :root {
              --primary-color: #2563eb;
              --primary-light: #3b82f6;
              --primary-dark: #1d4ed8;
              --text-color: #1f2937;
              --text-light: #6b7280;
              --bg-color: #ffffff;
              --bg-alt: #f9fafb;
              --border-color: #e5e7eb;
              --success-color: #10b981;
              --warning-color: #f59e0b;
              --danger-color: #ef4444;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius: 0.5rem;
          --space-xs: 0.5rem;
          --space-sm: 1rem;
          --space-md: 1.5rem;
          --space-lg: 2rem;
          --space-xl: 3rem;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--bg-color);
          padding: 0;
          margin: 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-lg);
        }
        
        header {
          text-align: center;
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }
        
        h1 {
          font-size: 2.25rem;
          color: var(--primary-color);
          margin-bottom: var(--space-sm);
        }
        
        .section-title {
          font-size: 1.5rem;
          color: var(--primary-color);
          margin: 2rem 0 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary-light);
        }
        
        .section-subtitle {
          font-size: 1.25rem;
          color: var(--primary-dark);
          margin: 1.5rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        h3 {
          font-size: 1.25rem;
          color: var(--text-color);
          margin: var(--space-md) 0 var(--space-sm);
        }
        
        .mini-goal-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }
        
        .mini-goal-link {
          color: var(--primary-color);
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .mini-goal-link:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }
        
        .mini-goal-link .link-icon {
          font-size: 0.8em;
          opacity: 0.7;
          transition: transform 0.2s;
        }
        
        .mini-goal-link:hover .link-icon {
          transform: translate(2px, -2px);
        }
        
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
          margin: var(--space-md) 0;
          color: var(--text-light);
          font-size: 0.9rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .meta-item svg {
          width: 1rem;
          height: 1rem;
          color: var(--primary-color);
        }
        
        .objective {
          background-color: var(--bg-alt);
          border-left: 4px solid var(--primary-color);
          padding: var(--space-md);
          margin: var(--space-lg) 0;
          border-radius: 0 var(--radius) var(--radius) 0;
        }
        
        .phases {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        
        .phase {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .phase:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .phase-header {
          background-color: var(--primary-color);
          color: white;
          padding: var(--space-md) var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .phase-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: white;
        }
        
        .phase-duration {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .phase-content {
          padding: var(--space-lg);
        }
        
        .phase-description {
          color: var(--text-light);
          margin-bottom: var(--space-md);
          line-height: 1.7;
        }
        
        .progress-container {
          height: 1.5rem;
          background-color: #e5e7eb;
          border-radius: 0.75rem;
          margin: var(--space-md) 0;
          position: relative;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background-color: var(--primary-color);
          border-radius: 0.75rem;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
        }
        
        .tasks, .resources {
          margin: var(--space-md) 0;
        }
        
        ul {
          list-style: none;
          padding-left: 0;
        }
        
        .task-item, .resource-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .task-checkbox {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid var(--primary-color);
          border-radius: 0.25rem;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        
        .task-item.completed .task-checkbox {
          background-color: var(--primary-color);
          color: white;
        }
        
        .task-text {
          flex-grow: 1;
        }
        
        .task-duration {
          background-color: var(--bg-alt);
          color: var(--text-light);
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          margin-left: 0.5rem;
        }
        
        .resource-item a {
          color: var(--primary-color);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .resource-item a:hover {
          text-decoration: underline;
        }
        
        footer {
          text-align: center;
          margin-top: var(--space-xl);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-color);
          color: var(--text-light);
          font-size: 0.875rem;
        }
        
        @media print {
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .container {
            padding: 0.5in;
            max-width: 100%;
          }
          
          .phase {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>${roadmapTitle}</h1>
          <div class="meta">
            ${totalDuration ? `<span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${totalDuration}</span>` : ''}
            ${difficultyLevel ? `<span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${difficultyLevel}</span>` : ''}
            ${totalEstimatedHours ? `<span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> ${totalEstimatedHours} hours</span>` : ''}
            <span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${formatDate(new Date())}</span>
          </div>
        </header>
        
        <main>
          ${objective || finalGoal ? `
          <div class="objective">
            ${objective ? `<p><strong>Objective:</strong> ${objective}</p>` : ''}
            ${finalGoal ? `<p><strong>Goal:</strong> ${finalGoal}</p>` : ''}
          </div>
          ` : ''}
          
          <h2>Learning Path</h2>
          <div class="phases">
            ${roadmap.phases && roadmap.phases.length > 0 ? 
              roadmap.phases.map((phase, index) => {
                const phaseTitle = escapeHtml(phase.title || `Phase ${index + 1}`);
                const phaseDuration = phase.duration ? escapeHtml(phase.duration) : '';
                const phaseDescription = phase.description ? 
                  `<p class="phase-description">${escapeHtml(phase.description)}</p>` : '';
                
                return `
                  <div class="phase">
                    <div class="phase-header">
                      <h3 class="phase-title">${phaseTitle}</h3>
                      ${phaseDuration ? `<span class="phase-duration">${phaseDuration}</span>` : ''}
                    </div>
                    <div class="phase-content">
                      ${phaseDescription}
                      ${phase.progress !== undefined ? getProgressBar(phase.progress) : ''}
                      ${renderMiniGoals(phase.miniGoals || [])}
                      ${renderResources(phase.resources || [])}
                    </div>
                  </div>
                `;
              }).join('') : 
              '<p>No phases available in this roadmap.</p>'
            }
          </div>
          
          ${roadmap.resources && roadmap.resources.length > 0 ? 
            `
            <h2>Additional Resources</h2>
            <div class="resources">
              <ul>
                ${roadmap.resources.map(resource => {
                  const url = resource.url ? escapeHtml(resource.url) : '';
                  const title = resource.title ? escapeHtml(resource.title) : '';
                  const description = resource.description ? 
                    `<div class="resource-description">${escapeHtml(resource.description)}</div>` : '';
                    
                  if (url) {
                    return `
                      <li class="resource-item">
                        <a href="${url}" target="_blank" rel="noopener noreferrer">
                          ${title || url}
                        </a>
                        ${description}
                      </li>
                    `;
                  }
                  return `
                    <li class="resource-item">
                      ${title || 'Untitled Resource'}
                      ${description}
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
            ` : ''}
        </main>
        
        <footer>
          <p>Exported from AI Roadmap Planner on ${formatDate(new Date())}</p>
        </footer>
      </div>
    </body>
    </html>
    `;
    
    // Create and trigger download
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const sanitizedTitle = roadmap.title 
        ? roadmap.title.replace(/[^\w\d\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
        : 'roadmap';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${sanitizedTitle}_${timestamp}.html`;
      
      // Use saveAs from file-saver to trigger download
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error exporting to HTML:', error);
      alert('Failed to export roadmap as HTML. Please try again.');
    }
  };

  const getSanitizedRoadmap = useCallback((roadmap) => {
    if (!roadmap) return null;
    
    // Create a new object with only the properties we want to save
    const sanitized = {
      id: roadmap.id,
      title: roadmap.title,
      objective: roadmap.objective,
      finalGoal: roadmap.finalGoal,
      sanitizedName: roadmap.sanitizedName,
      generationState: roadmap.generationState,
      phases: roadmap.phases ? roadmap.phases.map(phase => ({
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        duration: phase.duration,
        goal: phase.goal,
        miniGoals: phase.miniGoals,
        resources: phase.resources,
        project: phase.project,
        skills: phase.skills,
        milestone: phase.milestone,
        prerequisiteKnowledge: phase.prerequisiteKnowledge,
        progressPercentage: phase.progressPercentage
      })) : [],
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
      // Add any other necessary primitive properties
    };
    
    return sanitized;
  }, []);

  // Save roadmap to localStorage when it changes
  useEffect(() => {
    if (roadmap) {
      const sanitized = getSanitizedRoadmap(roadmap);
      if (sanitized) {
        try {
          localStorage.setItem("currentRoadmap", JSON.stringify(sanitized));
        } catch (error) {
          console.error("Error saving roadmap to localStorage:", error);
        }
      }
    }
  }, [roadmap, getSanitizedRoadmap]);

  const calculateOverallProgress = useCallback((roadmapData) => {
    if (!roadmapData || !roadmapData.phases) return 0;

    let totalMiniGoals = 0;
    let completedMiniGoals = 0;

    roadmapData.phases.forEach((phase) => {
      if (phase.miniGoals) {
        totalMiniGoals += phase.miniGoals.length;
        completedMiniGoals += phase.miniGoals.filter(
          (mg) => mg.completed,
        ).length;
      }
    });

    if (totalMiniGoals === 0) return 0;
    return Math.round((completedMiniGoals / totalMiniGoals) * 100);
  }, []);

  const calculatePhaseProgress = useCallback((phase) => {
    if (!phase || !phase.miniGoals) return 0;
    const total = phase.miniGoals.length;
    if (total === 0) return 0;
    const completed = phase.miniGoals.filter((mg) => mg.completed).length;
    return Math.round((completed / total) * 100);
  }, []);

  const parseJsonResponse = (text) => {
    let jsonString = text.trim();
    let extractedJson = "";

    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(jsonBlockRegex);

    if (match && match[1]) {
      extractedJson = match[1];
    } else {
      const firstBrace = jsonString.indexOf("{");
      const lastBrace = jsonString.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        extractedJson = jsonString.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error(
          "Could not find a valid JSON structure in the AI response.",
        );
      }
    }

    try {
      return JSON.parse(extractedJson);
    } catch (jsonParseError) {
      console.error(
        "Failed to parse JSON:",
        jsonParseError,
        "Attempted JSON string:",
        extractedJson,
      );
      throw new Error(
        `The AI model provided an invalid JSON response. Raw parsing error: ${jsonParseError.message}`,
      );
    }
  };

  const initializePhaseDetails = (phase, pIdx) => {
    const phaseWithProgress = {
      ...phase,
      miniGoals: phase.miniGoals
        ? phase.miniGoals.map((mg, mgIdx) => ({
            id: mg.id || `mini-goal-${pIdx + 1}-${mgIdx + 1}`,
            completed: mg.completed || false,
            completedDate: mg.completedDate || null,
            ...mg,
          }))
        : [],
    };
    phaseWithProgress.progressPercentage =
      calculatePhaseProgress(phaseWithProgress);
    return phaseWithProgress;
  };

  const createInitialPrompt = useCallback(
    () => {
      // Get phase settings from localStorage
      const minPhases = parseInt(localStorage.getItem('min-phases')) || 15;
      const maxPhases = parseInt(localStorage.getItem('max-phases')) || 50;
      const adaptiveDifficulty = localStorage.getItem('adaptive-difficulty') !== 'false';
      
      // Calculate phase range based on difficulty if adaptive is enabled
      let phaseRange = `${minPhases} to ${maxPhases}`;
      
      if (adaptiveDifficulty) {
        // Determine difficulty level based on objective complexity
        const objectiveLower = objective.toLowerCase();
        const finalGoalLower = finalGoal.toLowerCase();
        
        // Keywords that suggest different difficulty levels
        const easyKeywords = ['basic', 'beginner', 'introduction', 'fundamentals', 'getting started', 'simple'];
        const mediumKeywords = ['intermediate', 'practical', 'hands-on', 'project', 'application'];
        const hardKeywords = ['advanced', 'complex', 'professional', 'enterprise', 'architecture', 'system'];
        const expertKeywords = ['expert', 'mastery', 'research', 'cutting-edge', 'innovation', 'leadership'];
        
        let difficultyLevel = 'medium'; // default
        
        if (easyKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'easy';
        } else if (expertKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'expert';
        } else if (hardKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'hard';
        } else if (mediumKeywords.some(keyword => objectiveLower.includes(keyword) || finalGoalLower.includes(keyword))) {
          difficultyLevel = 'medium';
        }
        
        // Calculate phase range based on difficulty
        const range = maxPhases - minPhases;
        switch (difficultyLevel) {
          case 'easy': {
            const easyMin = minPhases;
            const easyMax = Math.ceil(minPhases + range * 0.3);
            phaseRange = `${easyMin} to ${easyMax}`;
            break;
          }
          case 'medium': {
            const mediumMin = Math.ceil(minPhases + range * 0.3);
            const mediumMax = Math.ceil(minPhases + range * 0.6);
            phaseRange = `${mediumMin} to ${mediumMax}`;
            break;
          }
          case 'hard': {
            const hardMin = Math.ceil(minPhases + range * 0.6);
            const hardMax = Math.ceil(minPhases + range * 0.8);
            phaseRange = `${hardMin} to ${hardMax}`;
            break;
          }
          case 'expert': {
            const expertMin = Math.ceil(minPhases + range * 0.8);
            const expertMax = maxPhases;
            phaseRange = `${expertMin} to ${expertMax}`;
            break;
          }
        }
      }
      
      return `
Create a high-level study roadmap structure for: "${objective}"
Final Goal: "${finalGoal}"

Provide the overall roadmap details and a list of phase titles.
The roadmap should have ${phaseRange} DISTINCT, PROGRESSIVELY CHALLENGING PHASES.

ADAPT THE DIFFICULTY AND PHASE COUNT BASED ON THE COMPLEXITY OF THE SUBJECT:
- For BEGINNER/EASY topics: Use fewer phases (${Math.ceil(minPhases)} - ${Math.ceil(minPhases + (maxPhases - minPhases) * 0.3)}) with foundational concepts
- For INTERMEDIATE topics: Use moderate phases (${Math.ceil(minPhases + (maxPhases - minPhases) * 0.3)} - ${Math.ceil(minPhases + (maxPhases - minPhases) * 0.6)}) with practical applications
- For ADVANCED topics: Use more phases (${Math.ceil(minPhases + (maxPhases - minPhases) * 0.6)} - ${Math.ceil(minPhases + (maxPhases - minPhases) * 0.8)}) with complex concepts
- For EXPERT/MASTERY topics: Use maximum phases (${Math.ceil(minPhases + (maxPhases - minPhases) * 0.8)} - ${maxPhases}) with comprehensive coverage

Format as JSON with this EXACT structure:
{
  "title": "Comprehensive Study Roadmap Title",
  "totalDuration": "Be completely realistic - multiple years if needed for mastery and only tell the time without any other details like ('2 Years', '6 Months', '3 - 5 Years') not ('2 Years of part-time study', '6 - 10 Months to become proficient')",
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
`;
    },
    [objective, finalGoal],
  );

  const createPhaseDetailPrompt = useCallback(
    (phaseTitle) => `
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
`,
    [objective, finalGoal],
  );

  /**
   * Interrupts the current AI generation.
   * Note: GoogleGenerativeAI API does NOT support aborting in-flight requests.
   * This will only set a flag to ignore results after the current request completes.
   * The network/API request will still run to completion in the background.
   * UI should reflect that interruption takes effect after the current phase/request.
   */
  const interruptGeneration = useCallback((source = 'unknown') => {
    console.log(`[interruptGeneration] Interrupting current generation from: ${source}`, {
      isInterrupted: isInterrupted.current,
      isQueuePaused,
      queueProcessing: queueProcessingRef.current,
      currentlyGenerating
    });
    if (currentlyGenerating || queueProcessingRef.current || loading) {
      isInterrupted.current = true;
      console.log(`[interruptGeneration] Set isInterrupted to true`);
    } else {
      console.log(`[interruptGeneration] No active generation, not setting interrupted flag`);
    }
    // Also pause the queue to prevent new items from being processed
    pauseQueue();
    // Clear any currently generating item
    setCurrentlyGenerating(null);
  }, [isQueuePaused, currentlyGenerating]);

  const handleInterrupt = useCallback(() => {
    console.log('[handleInterrupt] Manual interrupt triggered');
    interruptGeneration('manual_interrupt');
    setLoading(false);
    setLoadingMessage("");
    toast.success("Generation stopped");
  }, [interruptGeneration]);

  const generateRoadmap = async (isContinuation = false, roadmapToContinue = null, wasQueuePaused = false, initialRoadmap = null) => {
    console.log('[generateRoadmap] Starting generation', { 
      isContinuation, 
      roadmapId: roadmapToContinue?.id, 
      hasInitialRoadmap: !!initialRoadmap 
    });
    
    if (!genAI) {
      const errorMsg = "Please set your Gemini API key in the settings.";
      console.error('[generateRoadmap] Error:', errorMsg);
      alert(errorMsg);
      return null;
    }

    console.log('[generateRoadmap] Resetting interruption flag and setting loading state');
    isInterrupted.current = false;
    setLoading(true);
    setError(null);

    if (!isContinuation && !initialRoadmap) {
      localStorage.removeItem("currentRoadmap");
      setRoadmap(null);
    }

    const generateWithRetry = async (prompt) => {
      const startingModelIndex = currentModelIndex.current;
      let attempts = 0;
      const maxAttempts = availableModels.length;

      while (attempts < maxAttempts) {
        if (isInterrupted.current) {
          throw new Error("Generation interrupted by user.");
        }

        const modelName = availableModels[currentModelIndex.current];
        attempts++;
        
        try {
          console.log(`[generateWithRetry] Attempt ${attempts}/${maxAttempts} with model: ${modelName}`);
          setLoadingMessage(`Generating with ${modelName}... (attempt ${attempts}/${maxAttempts})`);
          
          const generativeModel = genAI.getGenerativeModel({
            model: modelName,
          });
          
          const result = await generativeModel.generateContent(prompt);
          const response = await result.response;
          
          console.log(`[generateWithRetry] Success with model: ${modelName}`);
          return parseJsonResponse(response.text());
          
        } catch (err) {
          if (isInterrupted.current) {
            throw err;
          }

          console.error(`[generateWithRetry] Error with model ${modelName}:`, err.message);
          
          const isQuotaError = err.message.includes('429') || err.message.includes('quota') || err.message.includes('rate limit');
          const isModelNotFound = err.message.includes('404') || err.message.includes('not found');
          const isServerError = err.message.includes('500') || err.message.includes('502') || err.message.includes('503');
          
          if (isQuotaError || isModelNotFound || isServerError) {
            console.log(`[generateWithRetry] ${modelName} failed with recoverable error, switching to next model`);
            
            currentModelIndex.current = (currentModelIndex.current + 1) % availableModels.length;
            
            if (currentModelIndex.current === startingModelIndex) {
              console.error(`[generateWithRetry] All models failed after ${attempts} attempts`);
              setLoadingMessage("All models failed. Please check your API key and model availability.");
              throw new Error(`All available models failed. Last error: ${err.message}`);
            }
            
            const nextModel = availableModels[currentModelIndex.current];
            console.log(`[generateWithRetry] Switching to model: ${nextModel}`);
            setLoadingMessage(`Switching to model ${nextModel}... (attempt ${attempts + 1}/${maxAttempts})`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            console.error(`[generateWithRetry] Non-recoverable error with ${modelName}:`, err);
            throw err;
          }
        }
      }
      
      throw new Error("Maximum retry attempts exceeded");
    };

    try {
      let currentRoadmap = null;

      if (isContinuation && roadmapToContinue) {
        console.log('[generateRoadmap] Continuing existing roadmap:', roadmapToContinue.id);
        currentRoadmap = roadmapToContinue;
        setRoadmap(currentRoadmap);
      } else if (initialRoadmap) {
        // FIXED: Check if initialRoadmap needs structure generation
        if (!initialRoadmap.phases || initialRoadmap.phases.length === 0) {
          console.log('[generateRoadmap] Initial roadmap needs structure generation');
          
          // Generate the basic structure first
          if (!objective || !finalGoal) {
            // Use the roadmap's stored objective and finalGoal
            setObjective(initialRoadmap.objective || "");
            setFinalGoal(initialRoadmap.finalGoal || "");
          }
          
          if (!initialRoadmap.objective || !initialRoadmap.finalGoal) {
            throw new Error("Initial roadmap missing objective or final goal");
          }
          
          setLoadingMessage("Generating high-level plan structure...");
          const initialPrompt = createInitialPrompt();
          const initialJson = await generateWithRetry(initialPrompt);

          if (!initialJson || !Array.isArray(initialJson.phases) || initialJson.phases.length === 0) {
            throw new Error("The AI did not return a valid initial roadmap structure.");
          }

          // Update the initial roadmap with the generated structure
          currentRoadmap = {
            ...initialRoadmap,
            ...initialJson, // This includes title, totalDuration, etc.
            id: initialRoadmap.id, // Keep the original ID
            objective: initialRoadmap.objective, // Keep original objective
            finalGoal: initialRoadmap.finalGoal, // Keep original finalGoal
            generationState: "in-progress",
            updatedAt: new Date().toISOString(),
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
            })),
          };
          
          console.log('[generateRoadmap] Generated structure for initial roadmap:', currentRoadmap);
        } else {
          console.log('[generateRoadmap] Using provided initial roadmap with existing structure:', initialRoadmap.id);
          currentRoadmap = initialRoadmap;
        }
        
        setRoadmap(currentRoadmap);
        
        // Save the updated roadmap
        const savedRoadmap = await saveRoadmapToDisk(
          currentRoadmap,
          currentRoadmap.title || `Roadmap-${Date.now()}`,
        );
        
        if (!savedRoadmap) {
          throw new Error("Failed to save roadmap with structure");
        }
        
        currentRoadmap = savedRoadmap;
        setRoadmap(savedRoadmap);
      } else {
        // Generate completely new roadmap
        if (!objective || !finalGoal) {
          throw new Error("Please provide both an objective and a final goal.");
        }
        
        console.log('[generateRoadmap] Generating new roadmap structure');
        setLoadingMessage("Generating high-level plan...");
        const initialPrompt = createInitialPrompt();
        const initialJson = await generateWithRetry(initialPrompt);

        if (!initialJson || !Array.isArray(initialJson.phases) || initialJson.phases.length === 0) {
          throw new Error("The AI did not return a valid initial roadmap structure.");
        }

        const newRoadmap = {
          ...initialJson,
          id: `roadmap-${Date.now()}`,
          objective: objective,
          finalGoal: finalGoal,
          generationState: "in-progress",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          })),
        };

        // Save the initial roadmap
        const savedRoadmap = await saveRoadmapToDisk(
          newRoadmap,
          newRoadmap.title || `Roadmap-${Date.now()}`,
        );
        
        if (!savedRoadmap) {
          throw new Error("Failed to save initial roadmap");
        }
        
        currentRoadmap = savedRoadmap;
        setRoadmap(savedRoadmap);
      }

      // Generate phase details (this part remains the same)
      const startIndex = currentRoadmap.phases.findIndex(p => p.goal === "...");
      if (startIndex === -1) {
        console.log('[generateRoadmap] Roadmap already complete');
        currentRoadmap.generationState = "completed";
        await saveRoadmapToDisk(currentRoadmap, currentRoadmap.title);
        setLoading(false);
        return currentRoadmap;
      }

      let accumulatingRoadmap = { ...currentRoadmap };

      for (let i = startIndex; i < accumulatingRoadmap.phases.length; i++) {
        if (isInterrupted.current) {
          console.log("Generation interrupted by user.");
          accumulatingRoadmap = {
            ...accumulatingRoadmap,
            generationState: "in-progress",
          };
          await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
          break;
        }

        const phase = accumulatingRoadmap.phases[i];
        setLoadingMessage(
          `Generating details for phase ${i + 1}/${accumulatingRoadmap.phases.length}: ${phase.title}`,
        );
        
        const phaseJson = await generateWithRetry(createPhaseDetailPrompt(phase.title));

        if (isInterrupted.current) {
          console.log("Generation interrupted by user after fetch.");
          accumulatingRoadmap = {
            ...accumulatingRoadmap,
            generationState: "in-progress",
          };
          await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
          break;
        }

        // Update phase
        const newPhases = [...accumulatingRoadmap.phases];
        newPhases[i] = initializePhaseDetails(
          { ...newPhases[i], ...phaseJson },
          i,
        );
        accumulatingRoadmap = { ...accumulatingRoadmap, phases: newPhases };

        // Save progress
        const savedStep = await saveRoadmapToDisk(
          accumulatingRoadmap,
          accumulatingRoadmap.title,
        );
        if (!savedStep) {
          throw new Error("Failed to save roadmap progress during loop.");
        }
        accumulatingRoadmap = savedStep;
        setRoadmap(savedStep); // Update the global state to reflect progress
      }

      if (!isInterrupted.current) {
        accumulatingRoadmap.generationState = "completed";
        await saveRoadmapToDisk(accumulatingRoadmap, accumulatingRoadmap.title);
        console.log('[generateRoadmap] Roadmap generation completed');
      }

      if (!isInterrupted.current) {
        if (setActiveTab) {
          setActiveTab("view");
        }
        return accumulatingRoadmap; // Return the completed roadmap
      }

      // If interrupted, do not return the incomplete roadmap
      return null;
    } catch (err) {
      if (err.message.includes("interrupted by user")) {
        console.log("Caught user interruption. Halting generation.");
        setError(null);
      } else {
        console.error("Error generating roadmap:", err);
        setError("Failed to generate roadmap: " + err.message);
      }
      return null;
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Generate roadmap specifically for queue items
  const generateRoadmapForQueue = async (queueItem) => {
    const originalObjective = objective;
    const originalFinalGoal = finalGoal;
    const wasQueuePaused = isQueuePaused;

    try {
      // Find the roadmap to continue if it exists
      let roadmapToContinue = null;
      if (queueItem.roadmapId) {
        roadmapToContinue = savedTimeplans.find(r => r.id === queueItem.roadmapId);
      }
      
      // Temporarily set objectives for generation
      setObjective(queueItem.objective);
      setFinalGoal(queueItem.finalGoal);
      
      // Generate the roadmap - pass initial roadmap if available
      const isContinuation = !!roadmapToContinue;
      const initialRoadmap = queueItem.initialRoadmap || null;
      const result = await generateRoadmap(
        isContinuation, 
        roadmapToContinue, 
        wasQueuePaused,
        initialRoadmap
      );
      
      // If we have a result, update the queue item with the new roadmap ID
      if (result && result.id) {
        return result;
      }
    } catch (error) {
      console.error('Error in generateRoadmapForQueue:', error);
      throw error; // Re-throw to be caught by the queue processor
    } finally {
      // Restore original objectives
      setObjective(originalObjective);
      setFinalGoal(originalFinalGoal);
    }
  };

  // SIMPLIFIED useEffect - only respond to pause state changes
  useEffect(() => {
    // Only auto-resume when unpausing, not on every queue change
    if (!isQueuePaused && !queueProcessingRef.current && generationQueue.length > 0) {
      console.log("Auto-resuming queue processing");
      const timer = setTimeout(() => {
        processQueue();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isQueuePaused]); // Only depend on pause state, not queue contents
  
  // Fixed processQueue function
  const processQueue = useCallback(async () => {
    // Prevent multiple simultaneous processing
    if (queueProcessingRef.current) {
      console.log('[processQueue] Queue already processing, returning');
      return;
    }

    queueProcessingRef.current = true;
    console.log('[processQueue] Queue processing started');

    try {
      while (true) {
        // Get current queue state synchronously
        let currentQueue = null;
        let nextItem = null;
        
        await new Promise((resolve) => {
          setGenerationQueue(queue => {
            currentQueue = [...queue]; // Create a copy to avoid mutations
            console.log('[processQueue] Current queue state:', {
              isInterrupted: isInterrupted.current,
              isQueuePaused,
              queueLength: currentQueue.length,
              processing: queueProcessingRef.current
            });

            // Check exit conditions
            if (isInterrupted.current || isQueuePaused || shouldPauseAfterCurrent.current || currentQueue.length === 0) {
              console.log('[processQueue] Cannot process: interrupted/paused/empty');
              resolve();
              return queue; // Return unchanged queue
            }

            nextItem = currentQueue[0];
            console.log("Processing queue item:", nextItem);
            resolve();
            return queue; // Don't modify queue here
          });
        });

        // Exit if no item to process
        if (!nextItem) {
          console.log('[processQueue] No more items to process');
          break;
        }

        setCurrentlyGenerating(nextItem);

        let generatedRoadmap = null;
        try {
          if (nextItem.isResume) {
            console.log("Resuming roadmap:", nextItem.roadmapId);
            const roadmapToResume = savedTimeplans.find(r => r.id === nextItem.roadmapId);
            if (roadmapToResume) {
              generatedRoadmap = await generateRoadmap(true, roadmapToResume);
            } else {
              console.error("Roadmap to resume not found:", nextItem.roadmapId);
              toast.error("Failed to find roadmap to resume");
            }
          } else {
            console.log("Generating new roadmap from queue");
            generatedRoadmap = await generateRoadmapForQueue(nextItem);
          }
        } catch (error) {
          console.error("Queue generation error:", error);
          toast.error(`Failed to generate roadmap: ${nextItem.objective || 'Unknown'}`);
        }

        // If roadmap generation was successful and returned a completed roadmap, remove it from the queue.
        if (generatedRoadmap) {
          const finalRoadmapState = await new Promise(resolve => {
            setRoadmap(current => {
              resolve(current);
              return current;
            });
          });

          // Only remove from queue if the entire roadmap generation is complete
          if (finalRoadmapState && finalRoadmapState.generationState === 'completed') {
            setGenerationQueue(prevQueue => prevQueue.filter(item => item.id !== nextItem.id));
            setCurrentlyGenerating(null); // Clear the currently generating item
          }
        }

        // Reset interruption flag after each item
        isInterrupted.current = false;
        
        // Check for pause conditions
        if (shouldPauseAfterCurrent.current) {
          console.log("[processQueue] Pausing after current item");
          setIsQueuePaused(true);
          shouldPauseAfterCurrent.current = false;
          break;
        }

        // Small delay between items
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log("Queue processing completed");
      
    } catch (error) {
      console.error("Error in processQueue:", error);
    } finally {
      console.log("Queue processing stopped/completed");
      queueProcessingRef.current = false;
      setCurrentlyGenerating(null);
    }
  }, [isQueuePaused, savedTimeplans, generateRoadmap, generateRoadmapForQueue]);

  // FIXED addToQueue function with debouncing
  const addToQueue = useCallback((queueItem) => {
    console.log("Adding to queue:", queueItem);
    
    isInterrupted.current = false; // Reset interruption flag for new queue item

    // Check for duplicates synchronously before updating state
    const isExactDuplicate = generationQueue.some(item => item.id === queueItem.id);
    if (isExactDuplicate) {
      console.log("Exact duplicate item found in queue, not adding");
      return false;
    }

    const isSimilarDuplicate = generationQueue.some(
      item => 
        item.objective?.trim().toLowerCase() === queueItem.objective?.trim().toLowerCase() &&
        item.finalGoal?.trim().toLowerCase() === queueItem.finalGoal?.trim().toLowerCase()
    );
    if (isSimilarDuplicate) {
      console.log("Similar item found in queue, not adding");
      return false;
    }

    // Check against currently generating item
    if (currentlyGenerating && 
        currentlyGenerating.objective?.trim().toLowerCase() === queueItem.objective?.trim().toLowerCase() &&
        currentlyGenerating.finalGoal?.trim().toLowerCase() === queueItem.finalGoal?.trim().toLowerCase()) {
      console.log("Similar item is currently being generated, not adding");
      return false;
    }

    const newQueueItem = { 
      ...queueItem, 
      status: "queued",
      addedAt: new Date().toISOString()
    };
    
    console.log("Adding new item to queue:", newQueueItem);
    
    // Update queue state
    setGenerationQueue(prevQueue => {
      const newQueue = [...prevQueue, newQueueItem];
      
      // Debounced processing trigger
      if (!queueProcessingRef.current && !isQueuePaused && !processingTriggerRef.current) {
        console.log("Triggering queue processing");
        processingTriggerRef.current = true;
        
        setTimeout(() => {
          processingTriggerRef.current = false;
          processQueue();
        }, 100);
      }
      
      return newQueue;
    });
    
    return true;
  }, [isQueuePaused, currentlyGenerating, generationQueue, processQueue]);

  const removeFromQueue = (itemId) => {
    // If this is the currently generating item, mark it for interruption
    if (currentlyGenerating && 
        (currentlyGenerating.id === itemId || currentlyGenerating.roadmapId === itemId)) {
      isInterrupted.current = true;
    }

    // Remove from queue using either id or roadmapId
    setGenerationQueue((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === itemId ||
            (item.roadmapId && item.roadmapId === itemId)
          ),
      ),
    );
  };

  const clearQueue = () => {
    if (queueProcessingRef.current) {
      shouldPauseAfterCurrent.current = true;
    }
    setGenerationQueue([]);
  };

  const pauseQueue = () => {
    if (isQueuePaused) return; // Prevent multiple pause actions

    setIsQueuePaused(true);
    shouldPauseAfterCurrent.current = true;
    isInterrupted.current = true; // Signal to interrupt the current generation

    // If there is a currently generating item, put it back at the front of the queue
    if (currentlyGenerating) {
      setGenerationQueue(prevQueue => {
        // Avoid re-adding if it's already there
        if (prevQueue.some(item => item.id === currentlyGenerating.id)) {
          return prevQueue;
        }
        return [currentlyGenerating, ...prevQueue];
      });
    }
  };

  // FIXED resumeQueue function
  const resumeQueue = () => {
    console.log("Resuming queue manually");
    setIsQueuePaused(false);
    shouldPauseAfterCurrent.current = false;
    
    // Start processing after state update
    setTimeout(() => {
      if (!queueProcessingRef.current && generationQueue.length > 0) {
        processQueue();
      }
    }, 50);
  };

  const retryGeneration = async (roadmap) => {
    setCurrentlyGenerating({ name: roadmap.name, roadmapId: roadmap.id });
    await generateRoadmap(true, roadmap);
    setCurrentlyGenerating(null);
  };

  // Clean up queue items for non-existent roadmaps
  const cleanupQueue = useCallback(() => {
    setGenerationQueue(prev => 
      prev.filter(item => {
        if (!item.roadmapId) return true; // Keep items without roadmapId (new roadmaps)
        
        const roadmapExists = savedTimeplans.find(
          (r) => r.id === item.roadmapId || r.sanitizedName === item.roadmapId
        );
        
        if (!roadmapExists) {
          console.log(`Removing queue item for deleted roadmap: ${item.roadmapId}`);
          return false;
        }
        return true;
      })
    );
  }, [savedTimeplans]);

  // Auto-cleanup queue when savedTimeplans changes
  useEffect(() => {
    cleanupQueue();
  }, [savedTimeplans, cleanupQueue]);

  useEffect(() => {
    // Only auto-resume when unpausing, not on every queue change
    if (!isQueuePaused && !queueProcessingRef.current && generationQueue.length > 0) {
      console.log("Auto-resuming queue processing");
      const timer = setTimeout(() => {
        processQueue();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isQueuePaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isInterrupted.current = true;
      queueProcessingRef.current = false;
    };
  }, []);

  const toggleMiniGoal = (phaseIndex, miniGoalId) => {
    setRoadmap((prevRoadmap) => {
      if (!prevRoadmap) return prevRoadmap;

      const newPhases = prevRoadmap.phases.map((phase, pIdx) => {
        if (pIdx === phaseIndex) {
          const newMiniGoals = phase.miniGoals.map((mg) => {
            if (mg.id === miniGoalId) {
              const newCompletedStatus = !mg.completed;
              return {
                ...mg,
                completed: newCompletedStatus,
                completedDate: newCompletedStatus
                  ? new Date().toISOString()
                  : null,
              };
            }
            return mg;
          });
          const updatedPhase = { ...phase, miniGoals: newMiniGoals };
          updatedPhase.progressPercentage =
            calculatePhaseProgress(updatedPhase);
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
    savedTimeplans: getSortedRoadmaps(), // Return sorted roadmaps with favorites first
    incompleteRoadmaps, // Add incompleteRoadmaps to the return object
    toggleFavorite,
    isFavorite,
    calculateOverallProgress,
    calculatePhaseProgress,
    generateRoadmap,
    saveCurrentRoadmap,
    loadRoadmap,
    deleteRoadmap,
    interruptGeneration,
    // Export functions
    exportToJSON,
    exportToPDF,
    exportToHTML,
    isQueuePaused,
    currentlyGenerating,
    generationQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    processQueue,
    retryGeneration,
    toggleMiniGoal,
    setGenerationQueue, // Expose setGenerationQueue function
  };
};

export default useRoadmap;
