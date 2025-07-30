import React, { useState, useRef, useCallback } from 'react';
import {
  Download, FileText, SquareCode, Printer, Clock, Layers, BarChart3, Target, BookOpen, Lightbulb,
  ChevronDown, ChevronUp, CheckCircle, Circle, ExternalLink, Loader
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const RoadmapContent = ({ roadmap, objective, finalGoal, saveCurrentRoadmap, downloadMarkdown, exportToPDF, handleCopyCode, handlePrint, toggleMiniGoal, calculateOverallProgress, setRoadmap, loading, loadingMessage, interruptGeneration, generateRoadmap, error }) => {
  const [expandedPhases, setExpandedPhases] = useState({});
  const roadmapRef = useRef(null);

  const togglePhase = (index) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const calculatePhaseProgress = useCallback((phase) => {
    if (!phase || !phase.miniGoals) return 0;
    const total = phase.miniGoals.length;
    if (total === 0) return 0;
    const completed = phase.miniGoals.filter(mg => mg.completed).length;
    return Math.round((completed / total) * 100);
  }, []);

  return (
    <div className="space-y-6" ref={roadmapRef}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 dark:from-blue-900 dark:to-indigo-900 dark:border-blue-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{roadmap.title}</h2>
          <div className="flex gap-2 no-print">
            <button
              onClick={saveCurrentRoadmap}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors"
              title="Save Timeplan"
            >
              <Download size={16} />
              Save
            </button>
            <button
              onClick={downloadMarkdown}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm transition-colors"
              title="Download as Markdown"
            >
              <Download size={16} />
              Export MD
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm transition-colors"
              title="Export as PDF"
            >
              <FileText size={16} />
              Export PDF
            </button>
             <button
              onClick={handleCopyCode}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
              title="Copy JSON Code"
            >
              <SquareCode size={16} />
              Copy JSON
            </button>
            <button
              onClick={handlePrint}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm transition-colors"
              title="Print Roadmap"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            Duration: {roadmap.totalDuration}
          </div>
          <div className="flex items-center gap-1">
            <Layers size={16} />
            {roadmap.phases.length} Phases
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 size={16} />
            Level: {roadmap.difficultyLevel || 'Advanced'}
          </div>
        </div>
        {roadmap.totalEstimatedHours && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            📊 Total Estimated Hours: {roadmap.totalEstimatedHours}
          </div>
        )}
        <div className="mt-2 text-sm text-green-600 font-medium">
          Overall Progress: {calculateOverallProgress(roadmap)}%
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.phases.map((phase, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
            <div
              className="bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => togglePhase(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Phase {phase.phaseNumber}: {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{phase.duration} • {phase.goal}</p>
                  {phase.miniGoals && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-32 bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculatePhaseProgress(phase)}%`
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
                {expandedPhases[index] ? <ChevronUp className="text-gray-600 dark:text-gray-300" /> : <ChevronDown className="text-gray-600 dark:text-gray-300" />}
              </div>
            </div>

            {expandedPhases[index] && (
              <div className="p-6 bg-white dark:bg-gray-800">
                {phase.goal === "..." ? (
                  <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Loader className="animate-spin mr-3" size={20} />
                    <span>Details for this phase are being generated...</span>
                  </div>
                ) : (
                  <>
                    {phase.miniGoals && phase.miniGoals.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <Target size={18} className="text-green-600" />
                          Mini-Goals
                        </h4>
                        <div className="space-y-3">
                          {phase.miniGoals.map((miniGoal) => (
                            <div key={miniGoal.id} className="border border-gray-200 rounded-lg p-3 dark:border-gray-700">
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
                                    <h5 className={`font-medium ${miniGoal.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>
                                      {miniGoal.url ? (
                                        <a
                                          href={miniGoal.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                          {miniGoal.title} <ExternalLink size={14} />
                                        </a>
                                      ) : (
                                        miniGoal.title
                                      )}
                                    </h5>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className={`px-2 py-1 rounded-full ${
                                        miniGoal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        miniGoal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      }`}>
                                        {miniGoal.priority}
                                      </span>
                                      <span className="text-gray-500 dark:text-gray-400">{miniGoal.estimatedTime}</span>
                                    </div>
                                  </div>
                                  <p className={`text-sm mt-1 ${miniGoal.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {miniGoal.description}
                                  </p>
                                  {miniGoal.successCriteria && (
                                    <p className="text-xs text-blue-600 mt-1 dark:text-blue-400">
                                      ✓ Success: {miniGoal.successCriteria}
                                    </p>
                                  )}
                                  {miniGoal.completedDate && (
                                    <p className="text-xs text-green-600 mt-1 dark:text-green-400">
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
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <BookOpen size={18} className="text-blue-600" />
                          Premium Resources
                        </h4>
                        <div className="space-y-3">
                          {phase.resources.map((resource, resIndex) => (
                            <div key={resIndex} className="border border-gray-200 rounded-lg p-3 dark:border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-800 dark:text-white">{resource.name}</h5>
                                  <div className="flex gap-2 mt-1">
                                    {resource.type && (
                                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                        resource.type === 'documentation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        resource.type === 'course' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        resource.type === 'book' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                        resource.type === 'paper' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                        resource.type === 'project' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                      }`}>
                                        {resource.type}
                                      </span>
                                    )}
                                    {resource.priority && (
                                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                        resource.priority === 'essential' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        resource.priority === 'recommended' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                      }`}>
                                        {resource.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 ml-2 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{resource.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {resource.difficulty && (
                                  <span className={`px-2 py-1 rounded-full ${
                                    resource.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                                    resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {resource.difficulty}
                                  </span>
                                )}
                                {resource.estimatedTime && (
                                  <span className="text-gray-500 dark:text-gray-400">⏱️ {resource.estimatedTime}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <Lightbulb size={18} className="text-yellow-600" />
                          Monetizable Project
                        </h4>
                        <div className="border border-gray-200 rounded-lg p-4 mb-4 dark:border-gray-700">
                          {typeof phase.project === 'object' ? (
                            <>
                              <h5 className="font-semibold text-gray-800 dark:text-white mb-2">{phase.project.title ?? 'Untitled Project'}</h5>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{phase.project.description}</p>

                              {phase.project.deliverables && (
                                <div className="mb-3">
                                  <strong className="text-sm text-gray-700 dark:text-gray-200">Deliverables:</strong>
                                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {phase.project.deliverables.map((deliverable, idx) => (
                                      <li key={idx}>{deliverable}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {phase.project.monetizationPotential && (
                                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 dark:bg-green-900 dark:border-green-700">
                                  <p className="text-sm text-green-800 dark:text-green-200">
                                    <strong>💰 Income Potential:</strong> {phase.project.monetizationPotential}
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {phase.project.estimatedDuration && (
                                  <span>⏱️ {phase.project.estimatedDuration}</span>
                                )}
                                {phase.project.difficultyLevel && (
                                  <span className={`px-2 py-1 rounded-full ${
                                    phase.project.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                                    phase.project.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {phase.project.difficultyLevel}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{phase.project}</p>
                          )}

                          {phase.milestone && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-3 dark:bg-blue-900 dark:border-blue-700">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>🎯 Milestone:</strong> {phase.milestone}
                              </p>
                            </div>
                          )}
                        </div>

                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Skills You'll Master</h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {roadmap.motivationMilestones?.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 dark:bg-purple-900 dark:border-purple-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            🎯 Motivation Milestones
          </h4>
          <div className="grid gap-2">
            {roadmap.motivationMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-purple-800 dark:text-purple-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full dark:bg-purple-600"></div>
                {milestone}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.careerProgression && roadmap.careerProgression.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 dark:bg-indigo-900 dark:border-indigo-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            🚀 Career Progression Path
          </h4>
          <div className="grid gap-2">
            {roadmap.careerProgression.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:bg-indigo-700 dark:text-indigo-300">
                  {index + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.careerOutcomes && roadmap.careerOutcomes.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 dark:bg-emerald-900 dark:border-emerald-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            💼 Career Opportunities
          </h4>
          <div className="grid gap-1">
            {roadmap.careerOutcomes.map((outcome, index) => (
              <div key={index} className="text-sm text-emerald-800 dark:text-emerald-200">
                • {outcome.role} ({outcome.salary})
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.tips && roadmap.tips.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900 dark:border-yellow-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <Lightbulb size={18} className="text-yellow-600" />
            Expert Pro Tips
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {roadmap.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {roadmap.marketDemand && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 dark:bg-teal-900 dark:border-teal-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            📈 Market Outlook
          </h4>
          <p className="text-sm text-teal-800 dark:text-teal-200">{roadmap.marketDemand}</p>
        </div>
      )}

      {roadmap.communityResources && roadmap.communityResources.length > 0 && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 dark:bg-cyan-900 dark:border-cyan-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            🤝 Community & Networking Resources
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {roadmap.communityResources.map((resource, index) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoadmapContent;
