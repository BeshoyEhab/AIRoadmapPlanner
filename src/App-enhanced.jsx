import React, { useState, useEffect } from 'react';
import { BookOpen, Target, Clock, Lightbulb, ExternalLink, ChevronDown, ChevronUp, Download, CheckCircle, Circle, BarChart3, Calendar, Plus, Trash2 } from 'lucide-react';
import './App.css'

const StudyPlanner = () => {
  const [objective, setObjective] = useState('');
  const [finalGoal, setFinalGoal] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [error, setError] = useState('');
  const [timeplans, setTimeplans] = useState([]);
  const [activeTimeplanId, setActiveTimeplanId] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'progress', 'manage'

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedTimeplans = localStorage.getItem('timeplans');
    const savedActiveId = localStorage.getItem('activeTimeplanId');
    
    if (savedTimeplans) {
      const parsedTimeplans = JSON.parse(savedTimeplans);
      setTimeplans(parsedTimeplans);
      
      if (savedActiveId && parsedTimeplans.find(tp => tp.id === savedActiveId)) {
        setActiveTimeplanId(savedActiveId);
        const activeTimeplan = parsedTimeplans.find(tp => tp.id === savedActiveId);
        if (activeTimeplan) {
          setRoadmap(activeTimeplan.roadmap);
          setObjective(activeTimeplan.objective);
          setFinalGoal(activeTimeplan.finalGoal);
        }
      }
    }
  }, []);

  // Save data to localStorage whenever timeplans change
  useEffect(() => {
    if (timeplans.length > 0) {
      localStorage.setItem('timeplans', JSON.stringify(timeplans));
    }
    if (activeTimeplanId) {
      localStorage.setItem('activeTimeplanId', activeTimeplanId);
    }
  }, [timeplans, activeTimeplanId]);

  const togglePhase = (phaseIndex) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIndex]: !prev[phaseIndex]
    }));
  };

  const toggleMiniGoal = (phaseIndex, miniGoalId) => {
    if (!roadmap) return;

    const updatedRoadmap = { ...roadmap };
    const phase = updatedRoadmap.phases[phaseIndex];
    const miniGoal = phase.miniGoals.find(mg => mg.id === miniGoalId);
    
    if (miniGoal) {
      miniGoal.completed = !miniGoal.completed;
      miniGoal.completedDate = miniGoal.completed ? new Date().toISOString() : null;
      
      // Calculate phase progress
      const completedMiniGoals = phase.miniGoals.filter(mg => mg.completed).length;
      phase.progressPercentage = Math.round((completedMiniGoals / phase.miniGoals.length) * 100);
    }

    setRoadmap(updatedRoadmap);

    // Update the timeplan in storage
    if (activeTimeplanId) {
      const updatedTimeplans = timeplans.map(tp => 
        tp.id === activeTimeplanId 
          ? { ...tp, roadmap: updatedRoadmap, lastModified: new Date().toISOString() }
          : tp
      );
      setTimeplans(updatedTimeplans);
    }
  };

  const calculateOverallProgress = (roadmapData) => {
    if (!roadmapData || !roadmapData.phases) return 0;
    
    const totalMiniGoals = roadmapData.phases.reduce((sum, phase) => 
      sum + (phase.miniGoals ? phase.miniGoals.length : 0), 0);
    
    const completedMiniGoals = roadmapData.phases.reduce((sum, phase) => 
      sum + (phase.miniGoals ? phase.miniGoals.filter(mg => mg.completed).length : 0), 0);
    
    return totalMiniGoals > 0 ? Math.round((completedMiniGoals / totalMiniGoals) * 100) : 0;
  };

  const saveAsTimeplan = () => {
    if (!roadmap || !objective || !finalGoal) return;

    const newTimeplan = {
      id: `timeplan-${Date.now()}`,
      name: roadmap.title,
      description: `Learning path: ${objective}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      objective,
      finalGoal,
      isActive: true,
      roadmap,
      overallProgress: calculateOverallProgress(roadmap),
      estimatedCompletionDate: null,
      actualStartDate: new Date().toISOString(),
      tags: []
    };

    // Deactivate other timeplans
    const updatedTimeplans = timeplans.map(tp => ({ ...tp, isActive: false }));
    updatedTimeplans.push(newTimeplan);
    
    setTimeplans(updatedTimeplans);
    setActiveTimeplanId(newTimeplan.id);
  };

  const loadTimeplan = (timeplanId) => {
    const timeplan = timeplans.find(tp => tp.id === timeplanId);
    if (timeplan) {
      setRoadmap(timeplan.roadmap);
      setObjective(timeplan.objective);
      setFinalGoal(timeplan.finalGoal);
      setActiveTimeplanId(timeplanId);
      
      // Update active status
      const updatedTimeplans = timeplans.map(tp => ({
        ...tp,
        isActive: tp.id === timeplanId
      }));
      setTimeplans(updatedTimeplans);
      setActiveTab('create');
    }
  };

  const deleteTimeplan = (timeplanId) => {
    const updatedTimeplans = timeplans.filter(tp => tp.id !== timeplanId);
    setTimeplans(updatedTimeplans);
    
    if (activeTimeplanId === timeplanId) {
      setActiveTimeplanId(null);
      setRoadmap(null);
      setObjective('');
      setFinalGoal('');
    }
  };

  const generateMarkdown = () => {
    if (!roadmap) return '';

    let markdown = `# ${roadmap.title}\n\n`;
    markdown += `**Total Duration:** ${roadmap.totalDuration}\n`;
    markdown += `**Number of Phases:** ${roadmap.phases.length}\n\n`;
    markdown += `**Learning Objective:** ${objective}\n`;
    markdown += `**Final Goal:** ${finalGoal}\n\n`;
    markdown += `---\n\n`;

    // Phases with Mini-Goals
    roadmap.phases.forEach((phase, index) => {
      markdown += `## Phase ${phase.phaseNumber}: ${phase.title}\n\n`;
      markdown += `**Duration:** ${phase.duration}\n`;
      markdown += `**Goal:** ${phase.goal}\n`;
      
      if (phase.progressPercentage !== undefined) {
        markdown += `**Progress:** ${phase.progressPercentage}%\n`;
      }
      markdown += `\n`;

      // Mini-Goals
      if (phase.miniGoals && phase.miniGoals.length > 0) {
        markdown += `### Mini-Goals\n\n`;
        phase.miniGoals.forEach((miniGoal, mgIndex) => {
          const status = miniGoal.completed ? '✅' : '⬜';
          markdown += `${mgIndex + 1}. ${status} **${miniGoal.title}** (${miniGoal.estimatedTime})\n`;
          markdown += `   - ${miniGoal.description}\n`;
          if (miniGoal.priority) {
            markdown += `   - Priority: ${miniGoal.priority}\n`;
          }
          if (miniGoal.completedDate) {
            markdown += `   - Completed: ${new Date(miniGoal.completedDate).toLocaleDateString()}\n`;
          }
          markdown += `\n`;
        });
      }

      // Resources
      markdown += `### Resources\n\n`;
      phase.resources.forEach((resource, resIndex) => {
        markdown += `${resIndex + 1}. **${resource.name}**\n`;
        if (resource.url) {
          markdown += `   - Link: [${resource.url}](${resource.url})\n`;
        }
        markdown += `   - Description: ${resource.description}\n\n`;
      });

      // Project
      markdown += `### Biweekly Project\n\n`;
      markdown += `${phase.project}\n\n`;
      if (phase.milestone) {
        markdown += `**Milestone:** ${phase.milestone}\n\n`;
      }

      // Skills
      markdown += `### Skills You'll Gain\n\n`;
      phase.skills.forEach(skill => {
        markdown += `- ${skill}\n`;
      });
      markdown += `\n---\n\n`;
    });

    // Rest of the markdown generation...
    if (roadmap.motivationMilestones && roadmap.motivationMilestones.length > 0) {
      markdown += `## 🎯 Motivation Milestones\n\n`;
      roadmap.motivationMilestones.forEach(milestone => {
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

    if (roadmap.tips && roadmap.tips.length > 0) {
      markdown += `## 💡 Pro Tips\n\n`;
      roadmap.tips.forEach(tip => {
        markdown += `- ${tip}\n`;
      });
      markdown += `\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `*Generated by AI Study Roadmap Planner*\n`;
    markdown += `*Created on: ${new Date().toLocaleDateString()}*`;

    return markdown;
  };

  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
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

  const downloadPDF = () => {
    const markdown = generateMarkdown();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${roadmap.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3 { color: #2563eb; }
          h1 { border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; }
          h3 { margin-top: 25px; color: #1f2937; }
          ul, ol { padding-left: 20px; }
          li { margin-bottom: 5px; }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
          .metadata { background: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .footer { text-align: center; color: #6b7280; font-style: italic; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="metadata">
          <strong>Learning Objective:</strong> ${objective}<br>
          <strong>Final Goal:</strong> ${finalGoal}<br>
          <strong>Generated on:</strong> ${new Date().toLocaleDateString()}
        </div>
        ${markdown
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
          .replace(/^\- (.*$)/gim, '<li>$1</li>')
          .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
          .replace(/^---$/gim, '<hr>')
          .replace(/\n/g, '<br>')
          .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
          .replace(/<\/ul><br><ul>/g, '')
        }
        <div class="footer">
          Generated by AI Study Roadmap Planner
        </div>
      </body>
      </html>
    `;
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    setTimeout(() => {
      newWindow.print();
    }, 500);
  };

  const generateRoadmap = async () => {
    if (!objective.trim() || !finalGoal.trim()) return;

    setLoading(true);
    setError('');
    setRoadmap(null);

    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      const response = await fetch(`/api/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `FIRST, create a comprehensive study roadmap for: "${objective}" that specifically prepares the learner to achieve: "${finalGoal}"\n\nCRITICAL INSTRUCTIONS:\n1. Create 8-15 phases for complex subjects (like AI for Games which takes 2-3 years )\n2. Each phase should be 4-8 weeks long for comprehensive learning\n3. For shorter subjects (3-6 months), use 4-6 phases of 2-4 weeks each\n4. Focus on HIDDEN GEM resources - lesser-known but high-quality sources, NOT mainstream platforms like Coursera/Udemy\n5. Include biweekly projects that build practical skills and can generate income\n6. Each phase should have 3-5 resources with actual working links when possible\n7. Projects should progressively build toward the final goal\n8. Include specific, measurable goals and skill progression\n9. For long-term learning (1+ years), include motivation milestones and career progression steps\n10. IMPORTANT: Each phase must include 4-8 mini-goals that break down the phase into smaller, manageable tasks\n\nFormat as JSON with this EXACT structure:\n{\n  "title": "Study Roadmap Title",\n  "totalDuration": "X months to X years (be realistic for complex subjects)",\n  "phases": [\n    {\n      "phaseNumber": 1,\n      "title": "Phase Title",\n      "duration": "4-8 weeks for major subjects, 2-4 weeks for simpler ones",\n      "goal": "Specific measurable goal",\n      "miniGoals": [\n        {\n          "id": "mini-goal-1-1",\n          "title": "Mini-goal title",\n          "description": "Detailed description of what needs to be accomplished",\n          "estimatedTime": "3-5 days",\n          "priority": "high",\n          "completed": false,\n          "completedDate": null,\n          "dependencies": []\n        }\n      ],\n      "resources": [\n        {\n          "name": "Resource Name",\n          "url": "https://actual-url.com",\n          "description": "Why this resource is valuable"\n        }\n      ],\n      "project": "Specific biweekly project description that builds toward final goal",\n      "skills": ["skill1", "skill2", "skill3"],\n      "milestone": "What achievement marks completion of this phase",\n      "flexibleTimeAllocation": true,\n      "actualDuration": null,\n      "progressPercentage": 0\n    }\n  ],\n  "motivationMilestones": ["milestone1", "milestone2", "milestone3"],\n  "careerProgression": ["step1", "step2", "step3"],\n  "tips": ["tip1", "tip2", "tip3"]\n}\n\nYour entire response MUST be valid JSON only. Do not include any text outside the JSON structure.` }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const errorDetails = data.error.message || 'Unknown API error';
        throw new Error(errorDetails);
      }
      
      let responseText = data.candidates[0].content.parts[0].text;
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsedRoadmap = JSON.parse(responseText);

      setRoadmap(parsedRoadmap);
      setExpandedPhases({ 0: true });

    } catch (error) {
      console.error("Error generating roadmap:", error);
      setError(`Failed to generate roadmap: ${error.message}`);
      setRoadmap(null);
    }
   
    setLoading(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return renderCreateTab();
      case 'progress':
        return renderProgressTab();
      case 'manage':
        return renderManageTab();
      default:
        return renderCreateTab();
    }
  };

  const renderCreateTab = () => (
    <>
      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to learn?
          </label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g., AI for game development, Machine learning for finance, Web scraping with Python..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && generateRoadmap()}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your final goal? (What do you want to achieve with this knowledge?)
          </label>
          <input
            type="text"
            value={finalGoal}
            onChange={(e) => setFinalGoal(e.target.value)}
            placeholder="e.g., Create an indie RPG game, Build a trading bot, Launch a web scraping service..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && generateRoadmap()}
          />
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={generateRoadmap}
            disabled={loading || !objective.trim() || !finalGoal.trim()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analyzing & Generating...
              </>
            ) : (
              <>
                <Target size={18} />
                Create Roadmap
              </>
            )}
          </button>
          
          {roadmap && (
            <button
              onClick={saveAsTimeplan}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              Save as Timeplan
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-600 text-sm font-bold">!</div>
            <h4 className="font-semibold">Misaligned Goals</h4>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            💡 <strong>Tip:</strong> Make sure your learning path can realistically lead to your final goal. 
            For example: "Learn Python" → "Build a web scraper" ✅ | "Learn cooking" → "Become a programmer" ❌
          </p>
        </div>
      )}

      {roadmap && renderRoadmapContent()}
    </>
  );

  const renderProgressTab = () => {
    const activeTimeplan = timeplans.find(tp => tp.id === activeTimeplanId);
    
    if (!activeTimeplan) {
      return (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Timeplan</h3>
          <p className="text-gray-500">Create or select a timeplan to view progress.</p>
        </div>
      );
    }

    const overallProgress = calculateOverallProgress(activeTimeplan.roadmap);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{activeTimeplan.name}</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{activeTimeplan.roadmap.phases.length}</div>
              <div className="text-sm text-gray-600">Total Phases</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {activeTimeplan.roadmap.phases.reduce((sum, phase) => 
                  sum + (phase.miniGoals ? phase.miniGoals.length : 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Mini-Goals</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Phase Progress</h3>
          {activeTimeplan.roadmap.phases.map((phase, index) => {
            const completedMiniGoals = phase.miniGoals ? phase.miniGoals.filter(mg => mg.completed).length : 0;
            const totalMiniGoals = phase.miniGoals ? phase.miniGoals.length : 0;
            const phaseProgress = totalMiniGoals > 0 ? Math.round((completedMiniGoals / totalMiniGoals) * 100) : 0;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">
                    Phase {phase.phaseNumber}: {phase.title}
                  </h4>
                  <span className="text-sm font-medium text-gray-600">
                    {completedMiniGoals}/{totalMiniGoals} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phaseProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">{phaseProgress}% complete</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderManageTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Timeplans</h2>
        <div className="text-sm text-gray-600">
          {timeplans.length} timeplan{timeplans.length !== 1 ? 's' : ''} saved
        </div>
      </div>

      {timeplans.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Timeplans Yet</h3>
          <p className="text-gray-500">Create your first timeplan to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {timeplans.map((timeplan) => (
            <div key={timeplan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{timeplan.name}</h3>
                    {timeplan.isActive && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{timeplan.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {new Date(timeplan.createdDate).toLocaleDateString()}</span>
                    <span>Progress: {calculateOverallProgress(timeplan.roadmap)}%</span>
                    <span>{timeplan.roadmap.phases.length} phases</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => loadTimeplan(timeplan.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteTimeplan(timeplan.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRoadmapContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">{roadmap.title}</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadMarkdown}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm transition-colors"
              title="Download as Markdown"
            >
              <Download size={16} />
              Markdown
            </button>
            <button
              onClick={downloadPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm transition-colors"
              title="Download as PDF"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            Total Duration: {roadmap.totalDuration}
          </div>
          <div className="flex items-center gap-1">
            <Target size={16} />
            {roadmap.phases.length} Phases
          </div>
          {activeTimeplanId && (
            <div className="flex items-center gap-1">
              <BarChart3 size={16} />
              Progress: {calculateOverallProgress(roadmap)}%
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.phases.map((phase, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => togglePhase(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Phase {phase.phaseNumber}: {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600">{phase.duration} • {phase.goal}</p>
                  {phase.miniGoals && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${phase.progressPercentage || 0}%` 
                            }}
                          ></div>
                        </div>
                        <span>
                          {phase.miniGoals.filter(mg => mg.completed).length}/{phase.miniGoals.length} mini-goals
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {expandedPhases[index] ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>
            
            {expandedPhases[index] && (
              <div className="p-6 bg-white">
                {/* Mini-Goals Section */}
                {phase.miniGoals && phase.miniGoals.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Target size={18} className="text-green-600" />
                      Mini-Goals
                    </h4>
                    <div className="space-y-3">
                      {phase.miniGoals.map((miniGoal, mgIndex) => (
                        <div key={miniGoal.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleMiniGoal(index, miniGoal.id)}
                              className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              {miniGoal.completed ? (
                                <CheckCircle size={20} className="text-green-600" />
                              ) : (
                                <Circle size={20} />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h5 className={`font-medium ${miniGoal.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                  {miniGoal.title}
                                </h5>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className={`px-2 py-1 rounded-full ${
                                    miniGoal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    miniGoal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {miniGoal.priority}
                                  </span>
                                  <span className="text-gray-500">{miniGoal.estimatedTime}</span>
                                </div>
                              </div>
                              <p className={`text-sm mt-1 ${miniGoal.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                {miniGoal.description}
                              </p>
                              {miniGoal.completedDate && (
                                <p className="text-xs text-green-600 mt-1">
                                  Completed: {new Date(miniGoal.completedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-blue-600" />
                      Resources
                    </h4>
                    <div className="space-y-3">
                      {phase.resources.map((resource, resIndex) => (
                        <div key={resIndex} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{resource.name}</h5>
                            {resource.url && (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Lightbulb size={18} className="text-yellow-600" />
                      Biweekly Project
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-2">{phase.project}</p>
                      {phase.milestone && (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-sm text-green-800">
                            <strong>Milestone:</strong> {phase.milestone}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Skills You'll Gain</h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivation Milestones, Career Progression, and Tips sections remain the same */}
      {roadmap.motivationMilestones && roadmap.motivationMilestones.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            🎯 Motivation Milestones
          </h4>
          <div className="grid gap-2">
            {roadmap.motivationMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-purple-800">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                {milestone}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.careerProgression && roadmap.careerProgression.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            🚀 Career Progression Path
          </h4>
          <div className="grid gap-2">
            {roadmap.careerProgression.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-indigo-800">
                <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                  {index + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.tips && roadmap.tips.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Lightbulb size={18} className="text-yellow-600" />
            Pro Tips
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {roadmap.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <BookOpen className="text-blue-600" />
            AI Study Roadmap Planner
          </h1>
          <p className="text-gray-600">Get a personalized learning path with mini-goals and progress tracking</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'create' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Create Roadmap
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'progress' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Progress Tracking
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'manage' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Manage Timeplans
            </button>
          </div>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

function App() {
  return <StudyPlanner />;
}

export default App;

